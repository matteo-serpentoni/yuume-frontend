import { useState, useEffect } from "react";
import Orb from "./Orb";

/**
 * OrbDevWrapper
 * Wrapper per sviluppo che permette di cambiare tema al volo chiamando l'API locale
 */
export default function OrbDevWrapper({ enlarged, setEnlarged, children }) {
  const [themes, setThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState("purple-dream");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 📱 Mobile detection & collapse state
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Configurazione corrente da passare all'Orb
  const [currentConfig, setCurrentConfig] = useState({
    baseColor1: [0.611765, 0.262745, 0.996078],
    baseColor2: [0.298039, 0.760784, 0.913725],
    baseColor3: [0.062745, 0.078431, 0.6],
    chatColors: {
      header: "#667eea",
      sendButton: "#667eea",
      userMessage: "#667eea",
      aiMessage: "#4CC2E9",
      inputBorder: "#667eea",
      inputFocus: "#4CC2E9",
    },
  });

  // Rileva mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        );
      setIsMobile(isMobileDevice);
      // Collassa automaticamente su mobile
      setIsCollapsed(isMobileDevice);
    };
    checkMobile();
  }, []);

  // Helper per convertire HEX a Vec3 (0-1)
  const hexToVec3 = (hex) => {
    if (!hex) return [0, 0, 0];
    const cleaned = hex.replace("#", "");
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);

    return [
      parseFloat((r / 255).toFixed(6)),
      parseFloat((g / 255).toFixed(6)),
      parseFloat((b / 255).toFixed(6)),
    ];
  };

  // Carica i temi all'avvio
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        // Usa l'API locale di default o quella configurata
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
        // Usa un siteId di test
        const siteId = "shopify_test";

        console.log(`🎨 Fetching themes from ${API_URL}...`);
        const response = await fetch(
          `${API_URL}/api/customization/themes/all?siteId=${siteId}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || "Failed to fetch themes");
        }

        const allThemes = [...result.data.available, ...result.data.locked];
        console.log("✅ Loaded themes:", allThemes);
        setThemes(allThemes);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error loading themes:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  // Aggiorna la config quando cambia il tema selezionato
  useEffect(() => {
    if (themes.length === 0) return;

    const theme = themes.find((t) => t.id === selectedThemeId);
    if (!theme) return;

    console.log("🔄 Switching to theme:", theme.name);

    setCurrentConfig({
      baseColor1: hexToVec3(theme.colors.primary),
      baseColor2: hexToVec3(theme.colors.secondary),
      baseColor3: hexToVec3(theme.colors.accent),
      chatColors: theme.chatColors,
    });
  }, [selectedThemeId, themes]);

  return (
    <>
      {/* Dev Tools UI */}
      {isCollapsed ? (
        // 📱 FAB Button su mobile (collapsed)
        <button
          onClick={() => setIsCollapsed(false)}
          style={{
            position: "fixed",
            bottom: isMobile ? "80px" : "20px",
            left: "20px",
            zIndex: 9999,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "rgba(102, 126, 234, 0.9)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          🛠️
        </button>
      ) : (
        // 🖥️ Full Panel (expanded)
        <div
          style={{
            position: "fixed",
            top: isMobile ? "auto" : "20px",
            bottom: isMobile ? "20px" : "auto",
            left: "20px",
            zIndex: 9999,
            background: "rgba(0,0,0,0.9)",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white",
            fontFamily: "system-ui, sans-serif",
            maxWidth: isMobile ? "calc(100vw - 40px)" : "300px",
            maxHeight: isMobile ? "50vh" : "auto",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "600",
                color: "#667eea",
              }}
            >
              🛠️ Dev Theme Switcher
            </h3>
            {isMobile && (
              <button
                onClick={() => setIsCollapsed(true)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "4px",
                  color: "white",
                  cursor: "pointer",
                  padding: "4px 8px",
                  fontSize: "12px",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {loading && <div style={{ fontSize: "12px" }}>Loading themes...</div>}
          {error && (
            <div style={{ fontSize: "12px", color: "#ff4444" }}>
              Error: {error}
              <br />
              Make sure API is running on port 5001
            </div>
          )}

          {!loading && !error && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: isMobile ? "calc(50vh - 80px)" : "400px",
                overflowY: "auto",
              }}
            >
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setSelectedThemeId(theme.id);
                    if (isMobile) {
                      // Auto-chiudi su mobile dopo la selezione
                      setTimeout(() => setIsCollapsed(true), 300);
                    }
                  }}
                  style={{
                    padding: "8px 12px",
                    background:
                      selectedThemeId === theme.id
                        ? "rgba(102, 126, 234, 0.3)"
                        : "rgba(255,255,255,0.05)",
                    border:
                      selectedThemeId === theme.id
                        ? "1px solid #667eea"
                        : "1px solid transparent",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    }}
                  />
                  {theme.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Render Actual Orb */}
      <Orb
        enlarged={enlarged}
        setEnlarged={setEnlarged}
        baseColor1={currentConfig.baseColor1}
        baseColor2={currentConfig.baseColor2}
        baseColor3={currentConfig.baseColor3}
        chatColors={currentConfig.chatColors}
      >
        {children}
      </Orb>
    </>
  );
}
