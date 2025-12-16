import { useState, useEffect } from "react";
import Orb from "../components/Orb/Orb";

export default function OrbPreview() {
  const [config, setConfig] = useState({
    orbTheme: {
      id: "purple-dream",
      name: "Purple Dream",
      baseColor1: [0.611765, 0.262745, 0.996078],
      baseColor2: [0.298039, 0.760784, 0.913725],
      baseColor3: [0.062745, 0.078431, 0.6],
    },
    chatColors: {
      header: "#667eea",
      sendButton: "#667eea",
      userMessage: "#667eea", // ← Aggiungi
      aiMessage: "#4CC2E9", // ← Aggiungi
      inputBorder: "#667eea", // ← Aggiungi
      inputFocus: "#4CC2E9", // ← Aggiungi
    },
    enlarged: true, // Default to true (open chat)
    mobileMode: false, // Default to desktop view
  });

  const [updateKey, setUpdateKey] = useState(0);

  // ⚡️ OPTIMIZED UPDATE LOGIC
  // We only force a full re-mount (updateKey) when THEME or COLORS change.
  // We DO NOT re-mount when just toggling Desktop/Mobile view.
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "YUUME_UPDATE_CUSTOMIZATION") {
        console.log("🔄 Live update:", event.data);
        const { orbTheme, chatColors, enlarged, mobileMode } = event.data.data;

        setConfig((prev) => {
          return {
            orbTheme: orbTheme || prev.orbTheme,
            chatColors: chatColors || prev.chatColors,
            enlarged: enlarged !== undefined ? enlarged : prev.enlarged,
            mobileMode: mobileMode !== undefined ? mobileMode : prev.mobileMode,
          };
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // 🎨 Set transparent background for preview page
  useEffect(() => {
    const originalBackground = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "transparent";

    return () => {
      document.body.style.backgroundColor = originalBackground;
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 
        DUAL INSTANCE STRATEGY for ZERO LAG 
        Both Desktop and Mobile instances are kept alive.
        We just toggle their visibility via CSS.
      */}

      {/* 🖥️ DESKTOP INSTANCE (Large Orb) */}
      <div
        style={{
          display: config.mobileMode ? "none" : "block", // Hide if mobile mode is active
          width: "100%",
          height: "100%",
        }}
      >
        <Orb
          key="orb-desktop"
          baseColor1={config.orbTheme.baseColor1}
          baseColor2={config.orbTheme.baseColor2}
          baseColor3={config.orbTheme.baseColor3}
          chatColors={config.chatColors}
          enlarged={true} // Always open/large based on recent request
          setEnlarged={() => {}}
          previewMode={true}
          mobileOverride={false} // Force Desktop Mode
        />
      </div>

      {/* 📱 MOBILE INSTANCE (Card) */}
      <div
        style={{
          display: config.mobileMode ? "block" : "none", // Show ONLY if mobile mode is active
          width: "100%",
          height: "100%",
        }}
      >
        <Orb
          key="orb-mobile"
          baseColor1={config.orbTheme.baseColor1}
          baseColor2={config.orbTheme.baseColor2}
          baseColor3={config.orbTheme.baseColor3}
          chatColors={config.chatColors}
          enlarged={true} // Always open
          setEnlarged={() => {}}
          previewMode={true}
          mobileOverride={true} // Force Mobile Mode
        />
      </div>
    </div>
  );
}
