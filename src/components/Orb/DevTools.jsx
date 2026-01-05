import React, { useState, useEffect } from "react";
import { hexToVec3 } from "../../utils/colorUtils";

/**
 * DevTools
 * Componente per lo sviluppo che permette di cambiare tema al volo.
 * Usato solo in modalità 'development'.
 */
const DevTools = ({
  currentConfig,
  onConfigChange,
  onSiteChange,
  onMobileToggle,
}) => {
  const [themes, setThemes] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState("purple-dream");
  const [selectedSiteDomain, setSelectedSiteDomain] = useState(() => {
    return sessionStorage.getItem("yuume_dev_shop_domain") || "";
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [forceMobile, setForceMobile] = useState(false);

  // Mobile detection for DevTools UI
  useEffect(() => {
    const checkMobile = () => {
      const isMob =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          navigator.userAgent
        );
      setIsMobile(isMob);
      setIsCollapsed(isMob);
    };
    checkMobile();
  }, []);

  // Fetch themes and sites
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

        // 1. Fetch Sites (for site switching)
        const sitesRes = await fetch(`${API_URL}/api/customization/sites`);
        if (sitesRes.ok) {
          const sitesResult = await sitesRes.json();
          if (sitesResult.success) {
            // Filter out empty or localhost domains
            const filteredSites = sitesResult.data.filter(
              (s) => s.domain && s.domain !== "localhost"
            );
            setSites(filteredSites);

            // If no site is selected yet, pick the first one
            const savedDevShop = sessionStorage.getItem(
              "yuume_dev_shop_domain"
            );
            if (!savedDevShop && filteredSites.length > 0) {
              const firstDomain = filteredSites[0].domain;
              setSelectedSiteDomain(firstDomain);
              sessionStorage.setItem("yuume_dev_shop_domain", firstDomain);
              onSiteChange && onSiteChange(firstDomain);
            }
          }
        }

        // 2. Fetch Themes (Independent of site for dev robustness)
        const themesRes = await fetch(`${API_URL}/api/customization/templates`);
        if (themesRes.ok) {
          const themesResult = await themesRes.json();
          if (themesResult.success) {
            const allThemes = [
              ...themesResult.data.available,
              ...themesResult.data.locked,
            ];
            setThemes(allThemes);
          }
        } else {
          // 🛠️ FAILSAFE: Hardcoded fallback themes if API is down
          console.warn(
            "⚠️ [DevTools] API templates failed, using hardcoded fallback"
          );
          setThemes([
            {
              id: "purple-dream",
              name: "Purple Dream (Fallback)",
              colors: {
                primary: "#9C43FE",
                secondary: "#4CC2E9",
                accent: "#101499",
              },
              chatColors: {
                header: "#9C43FE",
                sendButton: "#9C43FE",
                userMessage: "#9C43FE",
                aiMessage: "#4CC2E9",
                inputBorder: "#9C43FE",
                inputFocus: "#4CC2E9",
              },
            },
            {
              id: "ocean-blue",
              name: "Ocean Blue (Fallback)",
              colors: {
                primary: "#D1DBE6",
                secondary: "#99CCF2",
                accent: "#345779",
              },
              chatColors: {
                header: "#99CCF2",
                sendButton: "#345779",
                userMessage: "#345779",
                aiMessage: "#99CCF2",
                inputBorder: "#99CCF2",
                inputFocus: "#345779",
              },
            },
          ]);
        }
        setLoading(false);
      } catch (err) {
        console.error("❌ [DevTools] Error:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update Orb config when theme or site changes
  useEffect(() => {
    const updateThemesForSelectedSite = async () => {
      if (!selectedSiteDomain) return;
      const site = sites.find((s) => s.domain === selectedSiteDomain);
      if (!site) return;

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const themesRes = await fetch(
          `${API_URL}/api/customization/themes/all?siteId=${site.siteId}`
        );
        if (themesRes.ok) {
          const themesResult = await themesRes.json();
          if (themesResult.success) {
            const allThemes = [
              ...themesResult.data.available,
              ...themesResult.data.locked,
            ];
            setThemes(allThemes);
          }
        }
      } catch (err) {
        console.error("❌ [DevTools] Error updating themes:", err);
      }
    };

    updateThemesForSelectedSite();
  }, [selectedSiteDomain, sites]);

  // Update Orb config when theme changes
  useEffect(() => {
    if (themes.length === 0) return;
    const theme = themes.find((t) => t.id === selectedThemeId);
    if (!theme) return;

    onConfigChange({
      orbTheme: {
        id: theme.id,
        name: theme.name,
        baseColor1: hexToVec3(theme.colors.primary),
        baseColor2: hexToVec3(theme.colors.secondary),
        baseColor3: hexToVec3(theme.colors.accent),
      },
      chatColors: theme.chatColors,
    });
  }, [selectedThemeId, themes, onConfigChange]);

  if (isCollapsed) {
    return (
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
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        🛠️
      </button>
    );
  }

  return (
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
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "14px", color: "#667eea" }}>
          🛠️ Dev Tools
        </h3>
        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {loading && <div style={{ fontSize: "12px" }}>Loading...</div>}

      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Site Selector */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "#8b92a7",
                marginBottom: "4px",
              }}
            >
              Site Domain
            </label>
            <select
              value={selectedSiteDomain}
              onChange={(e) => {
                const domain = e.target.value;
                setSelectedSiteDomain(domain);
                if (domain) {
                  sessionStorage.setItem("yuume_dev_shop_domain", domain);
                } else {
                  sessionStorage.removeItem("yuume_dev_shop_domain");
                }
                onSiteChange && onSiteChange(domain);
              }}
              style={{
                width: "100%",
                background: "#222",
                color: "white",
                border: "1px solid #444",
                borderRadius: "4px",
                padding: "4px",
              }}
            >
              {sites.map((s) => (
                <option key={s._id || s.siteId} value={s.domain}>
                  {s.domain}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Selector */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "#8b92a7",
                marginBottom: "4px",
              }}
            >
              Active Theme
            </label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedThemeId(t.id)}
                  style={{
                    padding: "6px 8px",
                    background: selectedThemeId === t.id ? "#667eea" : "#333",
                    border: "none",
                    borderRadius: "4px",
                    color: "white",
                    textAlign: "left",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})`,
                    }}
                  />
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: "1px", background: "#333", margin: "4px 0" }} />

          {/* View Toggle */}
          <button
            onClick={() => {
              const newVal = !forceMobile;
              setForceMobile(newVal);
              onMobileToggle && onMobileToggle(newVal);
            }}
            style={{
              padding: "8px",
              background: forceMobile ? "#f6ad55" : "#4a5568",
              border: "none",
              borderRadius: "4px",
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {forceMobile
              ? "📱 Forced Mobile View"
              : "🖥️ Desktop View (Default)"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DevTools;
