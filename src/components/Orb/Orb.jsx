import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Renderer, Program, Mesh, Triangle, Vec3 } from 'ogl';
import Chat from '../Chat/Chat';
import ChatPreview from '../Chat/ChatPreview';
import DevTools from '../Dev/DevTools';
import { useOrb } from '../../hooks/useOrb';
import { getCssVariable } from '../../utils/domUtils';
import { vec3ToRgbString } from '../../utils/colorUtils';
import './Orb.css';

const Orb = memo(
  ({
    hue = 0,
    hoverIntensity = 0.2,
    rotateOnHover = true,
    forceHoverState = false,
    enlarged = false,
    setEnlarged = () => {},
    children,
    mode: modeOverride = null,
    mobileOverride = false,
  }) => {
    const {
      config,
      loading,
      mode,
      isMobile,
      isPreviewMobile,
      textColorMode,
      shopDomain,
      setConfig,
      setShopDomain,
    } = useOrb(modeOverride);

    const containerRef = useRef(null);
    const canvasContainerRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [forcedMobile, setForcedMobile] = useState(false);
    const isMinimized = !enlarged;

    // Actual mobile state (UA detection + potential override)
    const isMobileView = mobileOverride || forcedMobile || isPreviewMobile || isMobile;

    // Extracted from config for easier access
    const { orbTheme, chatColors } = config;
    const { baseColor1, baseColor2, baseColor3 } = orbTheme;

    const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

    const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    
    // ✅ Colori dinamici invece di const
    uniform vec3 baseColor1;
    uniform vec3 baseColor2;
    uniform vec3 baseColor3;
    
    varying vec2 vUv;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }
    
    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }
    
    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    vec3 hash33(vec3 p3) {
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }

    float snoise3(vec3 p) {
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0, d0),
        dot(d1, d1),
        dot(d2, d2),
        dot(d3, d3)
      ), 0.0);
      vec4 n = h * h * h * h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    vec4 extractAlpha(vec3 colorIn) {
      float a = max(max(colorIn.r, colorIn.g), colorIn.b);
      return vec4(colorIn.rgb / (a + 1e-5), a);
    }

    const float innerRadius = 0.6;
    const float noiseScale = 0.65;

    float light1(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * attenuation);
    }
    float light2(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * dist * attenuation);
    }

    vec4 draw(vec2 uv) {
      vec3 color1 = adjustHue(baseColor1, hue);
      vec3 color2 = adjustHue(baseColor2, hue);
      vec3 color3 = adjustHue(baseColor3, hue);
      
      float ang = atan(uv.y, uv.x);
      float len = length(uv);
      float invLen = len > 0.0 ? 1.0 / len : 0.0;
      
      float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
      float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
      float d0 = distance(uv, (r0 * invLen) * uv);
      float v0 = light1(1.0, 10.0, d0);
      v0 *= smoothstep(r0 * 1.05, r0, len);
      float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;
      
      float a = iTime * -1.0;
      vec2 pos = vec2(cos(a), sin(a)) * r0;
      float d = distance(uv, pos);
      float v1 = light2(1.5, 5.0, d);
      v1 *= light1(1.0, 50.0, d0);
      
      float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
      float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);
      
      vec3 col = mix(color1, color2, cl);
      col = mix(color3, col, v0);
      col = (col + v1) * v2 * v3;
      col = clamp(col, 0.0, 1.0);
      
      return extractAlpha(col);
    }

    vec4 mainImage(vec2 fragCoord) {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      
      float angle = rot;
      float s = sin(angle);
      float c = cos(angle);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
      
      uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);
      
      return draw(uv);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = vec4(col.rgb * col.a, col.a);
    }
  `;

    // ✅ Use refs for colors to avoid re-creating WebGL context on change
    const color1Ref = useRef(baseColor1);
    const color2Ref = useRef(baseColor2);
    const color3Ref = useRef(baseColor3);

    useEffect(() => {
      color1Ref.current = baseColor1;
      color2Ref.current = baseColor2;
      color3Ref.current = baseColor3;
    }, [baseColor1, baseColor2, baseColor3]);

    useEffect(() => {
      const container = containerRef.current;
      const canvasContainer = canvasContainerRef.current;
      if (!container || !canvasContainer) return;

      // Enhanced renderer for high quality (fixes graininess)
      const renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
        powerPreference: 'high-performance',
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      canvasContainer.appendChild(gl.canvas);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: vert,
        fragment: frag,
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new Vec3(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
          },
          hue: { value: hue },
          hover: { value: 0 },
          rot: { value: 0 },
          hoverIntensity: { value: hoverIntensity },
          // ✅ Aggiunti uniform per colori dinamici
          baseColor1: { value: new Vec3(...color1Ref.current) },
          baseColor2: { value: new Vec3(...color2Ref.current) },
          baseColor3: { value: new Vec3(...color3Ref.current) },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });

      // ✅ Helper per ottenere la dimensione massima dell'orb dalle variabili CSS
      const getMaxOrbSize = () => {
        return parseInt(getCssVariable('--orb-size', '600'), 10);
      };

      function resize() {
        if (!container) return;
        const dpr = window.devicePixelRatio || 1;

        // ✅ Usa sempre la dimensione massima per mantenere la qualità alta
        // anche quando l'orb è minimizzato. Il CSS scalerà visivamente il canvas.
        const maxSize = getMaxOrbSize();

        const width = maxSize;
        const height = maxSize;

        renderer.setSize(width * dpr, height * dpr);

        // Non serve impostare style.width/height perché gestito dal CSS (width: 100% !important)
        // ma lo impostiamo per coerenza con la risoluzione logica
        gl.canvas.style.width = width + 'px';
        gl.canvas.style.height = height + 'px';

        program.uniforms.iResolution.value.set(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        );
      }
      window.addEventListener('resize', resize);
      resize();

      let targetHover = 0;
      let lastTime = 0;
      let currentRot = 0;
      const rotationSpeed = 0.3;

      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const width = rect.width;
        const height = rect.height;
        const size = Math.min(width, height);
        const centerX = width / 2;
        const centerY = height / 2;
        const uvX = ((x - centerX) / size) * 2.0;
        const uvY = ((y - centerY) / size) * 2.0;

        if (Math.sqrt(uvX * uvX + uvY * uvY) < 0.8) {
          targetHover = 1;
        } else {
          targetHover = 0;
        }
      };

      const handleMouseLeave = () => {
        targetHover = 0;
      };

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);

      let rafId;
      const update = (t) => {
        rafId = requestAnimationFrame(update);
        const dt = (t - lastTime) * 0.001;
        lastTime = t;
        program.uniforms.iTime.value = t * 0.001;
        program.uniforms.hue.value = hue;
        program.uniforms.hoverIntensity.value = hoverIntensity;

        // ✅ Aggiorna i colori dinamicamente dai ref
        program.uniforms.baseColor1.value.set(...color1Ref.current);
        program.uniforms.baseColor2.value.set(...color2Ref.current);
        program.uniforms.baseColor3.value.set(...color3Ref.current);

        const effectiveHover = forceHoverState ? 1 : targetHover;
        program.uniforms.hover.value += (effectiveHover - program.uniforms.hover.value) * 0.1;

        if (rotateOnHover && effectiveHover > 0.5) {
          currentRot += dt * rotationSpeed;
        }
        program.uniforms.rot.value = currentRot;

        renderer.render({ scene: mesh });
      };
      rafId = requestAnimationFrame(update);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resize);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        canvasContainer.removeChild(gl.canvas);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      };
      // ✅ Aggiunte dipendenze per colori dinamici
    }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

    // ✅ FUNZIONALITÀ: Analytics events
    useEffect(() => {
      if (mode === 'preview') return; // Skip in preview mode

      if (enlarged) {
        window.parent?.postMessage({ type: 'YUUME_CHAT_OPENED' }, '*');
      } else {
        window.parent?.postMessage({ type: 'YUUME_CHAT_CLOSED' }, '*');
      }
    }, [enlarged, mode]);

    // ✅ FUNZIONALITÀ: Gestione click per espandere
    const handleExpand = useCallback(() => {
      if (isMinimized && mode !== 'preview') {
        setEnlarged(true);
        window.parent?.postMessage({ type: 'resize', enlarged: true }, '*');
      }
    }, [isMinimized, mode, setEnlarged]);

    const handleKeyDown = useCallback(
      (e) => {
        // Only intercept Enter/Space if the orb is minimized (acting as a button)
        if (isMinimized && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleExpand();
        }
      },
      [handleExpand, isMinimized],
    );

    // ✅ FUNZIONALITÀ: Messaggi a rotazione
    const messages = ['Ciao! 👋', 'Serve\naiuto? 💬', 'Chiedimi\ntutto ✨'];
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 4000);
      return () => clearInterval(interval);
    }, []);

    // ✅ Calcola colore tema da baseColor1 (che è il colore principale dell'orb WebGL)
    // baseColor1 è un array [r, g, b] con valori 0-1
    const themeColor = vec3ToRgbString(baseColor1);

    return (
      <>
        {/* ✅ FUNZIONALITÀ: Dev Tools (Solo in sviluppo locale e non preview) */}
        {/* Rendered outside the orb-container to avoid mobile clipping/centering issues */}
        {mode === 'development' && (
          <DevTools
            currentConfig={config}
            onConfigChange={setConfig}
            onSiteChange={setShopDomain}
            onMobileToggle={setForcedMobile}
          />
        )}

        <div
          ref={containerRef}
          role="button"
          tabIndex={0}
          aria-label={isMinimized ? 'Apri assistente Yuume' : 'Widget Yuume attivo'}
          className={`orb-container ${isMinimized ? 'minimized' : ''} ${
            isMobileView ? 'mobile-device' : ''
          } ${mode === 'preview' ? 'preview-mode' : ''} ${loading ? 'loading' : ''}`}
          onClick={handleExpand}
          onKeyDown={handleKeyDown}
          style={{
            '--orb-theme-color': themeColor,
          }}
        >
          {/* Loading Placeholder */}
          {loading && <div className="orb-loading-placeholder" />}

          {/* Chat Layer - Rendered once loaded, visibility handled by CSS classes */}
          {!loading && (
            <div className="orb-chat-layer">
              {mode === 'preview' ? (
                <ChatPreview chatColors={chatColors} />
              ) : (
                <Chat
                  chatColors={chatColors}
                  devShopDomain={shopDomain}
                  onTyping={setIsTyping}
                  onMinimize={() => {
                    setEnlarged(false);
                    // Wait for animation (600ms) before resizing iframe
                    setTimeout(() => {
                      window.parent?.postMessage({ type: 'resize', enlarged: false }, '*');
                    }, 600);
                  }}
                />
              )}
            </div>
          )}

          {/* Minimized Text */}
          {isMinimized && (
            <div
              key={currentMessageIndex} // Force re-render to restart animations
              className="minimized-text"
              style={{
                '--minimized-text-color':
                  textColorMode === 'light' ? chatColors.userMessage : 'white',
              }}
            >
              {messages[currentMessageIndex].split('\n').map((line, lineIndex) => (
                <div key={lineIndex} className="minimized-text-line">
                  {Array.from(line).map((char, charIndex) => {
                    // Calculate global index for continuous delay
                    const previousCharsCount = messages[currentMessageIndex]
                      .split('\n')
                      .slice(0, lineIndex)
                      .join('').length;
                    const globalIndex = previousCharsCount + charIndex;

                    return (
                      <span key={charIndex} style={{ animationDelay: `${globalIndex * 0.03}s` }}>
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* ✅ FUNZIONALITÀ: Children support */}
          {children}

          {/* Liquid Glass Background - Between chat and canvas */}
          <div className="orb-glass-mask-wrapper">
            <div className="orb-glass-layer">
              <div className="glass-blobs" />
              <div className="glass-noise" />
              <div className="glass-shine" />
            </div>
          </div>

          {/* WebGL Canvas Layer - On top visually, but pointer-events: none to allow clicks through */}
          <div ref={canvasContainerRef} className="orb-canvas-layer" />
        </div>
      </>
    );
  },
);

export default Orb;
