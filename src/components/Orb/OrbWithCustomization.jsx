import { useState, useEffect } from "react";
import Orb from "./Orb";
import { getWidgetConfig } from "../../services/customizationApi";

/**
 * OrbWithCustomization
 * Wrapper che carica le personalizzazioni dall'API e le passa all'Orb
 * Supporta anche aggiornamenti live per preview dashboard
 */
export default function OrbWithCustomization({
  enlarged,
  setEnlarged,
  children,
  previewMode = false,
}) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shopDomain, setShopDomain] = useState(null);

  // 🐛 DEBUG: traccia quando config cambia
  useEffect(() => {
    console.log("🔄 Config changed to:", config);
  }, [config]);

  // 🆕 Listener per aggiornamenti live da dashboard (preview)
  useEffect(() => {
    const handleMessage = (event) => {
      // Ricevi shopDomain
      if (event.data.type === "YUUME_SHOP_DOMAIN") {
        console.log("🏪 Shop domain received:", event.data.shopDomain);
        setShopDomain(event.data.shopDomain);
      }

      // 🆕 Ricevi aggiornamenti customizzazione (per preview)
      if (event.data.type === "YUUME_UPDATE_CUSTOMIZATION") {
        console.log("🎨 Customization update received:", event.data.data);
        console.log("📦 Current config BEFORE update:", config);
        setConfig(event.data.data);
        console.log("✅ setConfig called with:", event.data.data);
        console.log("📦 Config SHOULD be updated now");
      }
    };

    window.addEventListener("message", handleMessage);

    // Richiedi shopDomain se non ancora ricevuto
    if (window.parent && !shopDomain) {
      window.parent.postMessage({ type: "REQUEST_SHOP_DOMAIN" }, "*");
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [shopDomain]);

  // Carica configurazione quando abbiamo lo shopDomain
  useEffect(() => {
    if (!shopDomain) return;

    const siteId = "shopify_" + shopDomain.split(".")[0];
    console.log("🎨 Loading widget config for siteId:", siteId);

    getWidgetConfig(siteId)
      .then((data) => {
        console.log("✅ Widget config loaded:", data);
        setConfig(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Failed to load widget config:", error);
        // Usa config di default in caso di errore
        setConfig({
          orbTheme: {
            id: "purple-dream",
            name: "Purple Dream",
            baseColor1: [0.611765, 0.262745, 0.996078],
            baseColor2: [0.298039, 0.760784, 0.913725],
            baseColor3: [0.062745, 0.078431, 0.6],
          },
          chatColors: {
            header: "#9C43FE",
            sendButton: "#9C43FE",
            userMessage: "#9C43FE",
            aiMessage: "#4CC2E9",
            inputBorder: "#9C43FE",
            inputFocus: "#4CC2E9",
          },
        });
        setLoading(false);
      });
  }, [shopDomain]);

  // Mostra placeholder mentre carica
  if (loading || !config) {
    return (
      <div
        style={{
          position: "absolute",
          right: "32px",
          bottom: "32px",
          width: "180px",
          height: "180px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          opacity: 0.5,
          animation: "pulse 2s infinite",
        }}
      />
    );
  }

  // Renderizza l'Orb con le personalizzazioni
  return (
    <Orb
      enlarged={enlarged}
      setEnlarged={setEnlarged}
      baseColor1={config.orbTheme.baseColor1}
      baseColor2={config.orbTheme.baseColor2}
      baseColor3={config.orbTheme.baseColor3}
      chatColors={config.chatColors}
      previewMode={previewMode}
    >
      {children}
    </Orb>
  );
}
