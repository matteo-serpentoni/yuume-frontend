import { useState, useEffect } from "react";
import Orb from "../components/Orb/Orb";

/**
 * OrbPreview
 * Pagina per la preview dell'orb nella dashboard di customizzazione
 */
export default function OrbPreview() {
  // Stato iniziale con tema default
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
    },
  });

  // Ascolta messaggi dalla dashboard per aggiornamenti LIVE
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "YUUME_UPDATE_CUSTOMIZATION") {
        console.log("🔄 Live update from dashboard:", event.data);
        const { orbTheme, chatColors } = event.data.data;

        setConfig({
          orbTheme: orbTheme || config.orbTheme,
          chatColors: chatColors || config.chatColors,
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [config]);

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
      {/* Orb enlarged con preview mode */}
      <Orb
        baseColor1={config.orbTheme.baseColor1}
        baseColor2={config.orbTheme.baseColor2}
        baseColor3={config.orbTheme.baseColor3}
        chatColors={config.chatColors}
        enlarged={true}
        setEnlarged={() => {}}
        previewMode={true}
      />
    </div>
  );
}