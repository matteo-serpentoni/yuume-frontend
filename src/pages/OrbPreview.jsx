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
  });

  const [updateKey, setUpdateKey] = useState(0);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "YUUME_UPDATE_CUSTOMIZATION") {
        console.log("🔄 Live update:", event.data);
        const { orbTheme, chatColors } = event.data.data;

        setConfig((prev) => ({
          orbTheme: orbTheme || prev.orbTheme,
          chatColors: chatColors || prev.chatColors,
        }));

        setUpdateKey((k) => k + 1); // Forza re-render
        console.log("✅ Updated!");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []); // ← Vuoto! Non mettere config

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
      <Orb
        key={`orb-${updateKey}`}
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
