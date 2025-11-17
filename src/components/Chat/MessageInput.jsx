import { useState } from "react";

/**
 * MessageInput Component
 *
 * @param {boolean} previewMode - In preview mode: input disabilitato, button sempre abilitato visivamente
 */
const MessageInput = ({
  onSend,
  loading,
  placeholder = "Scrivi un messaggio…",
  sendButtonColor = "#a259ff",
  inputBorderColor = "#a259ff",
  inputFocusColor = "#4CC2E9",
  previewMode = false, // 🆕 Modalità preview
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🚫 In preview mode, non fare nulla
    if (previewMode) return;

    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  // Converte hex in rgb per il gradient
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 162, g: 89, b: 255 };
  };

  // Crea gradient dinamico dal colore
  const createGradient = (color) => {
    const rgb = hexToRgb(color);
    const darker = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(
      0,
      rgb.g - 30
    )}, ${Math.max(0, rgb.b - 30)})`;
    return `linear-gradient(135deg, ${color} 0%, ${darker} 100%)`;
  };

  // Converte hex in rgba per opacity
  const hexToRgba = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  // 🎨 Determina se il pulsante deve apparire abilitato
  // In preview mode: SEMPRE visivamente abilitato
  // In normale mode: solo se c'è testo e non sta caricando
  const shouldShowButtonEnabled = previewMode || (input.trim() && !loading);

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        width: "95%",
        alignItems: "center",
        gap: 8,
        maxHeight: 40,
        pointerEvents: previewMode ? "none" : "auto", // 🚫 Blocca tutti i click in preview
      }}
    >
      <input
        type="text"
        value={previewMode ? "" : input} // 🆕 In preview, input sempre vuoto
        onChange={(e) => !previewMode && setInput(e.target.value)}
        placeholder={loading ? "Attendere risposta…" : placeholder}
        disabled={loading || previewMode} // 🆕 Disabilita in preview
        maxLength={2000}
        style={{
          flex: 1,
          padding: "8px 16px",
          borderRadius: 20,
          border: `2px solid ${hexToRgba(inputBorderColor, 0.2)}`,
          outline: "none",
          background: "rgba(35, 36, 58, 0.9)",
          backdropFilter: "blur(10px)",
          color: "#fff",
          fontSize: "0.9rem",
          fontFamily: "inherit",
          transition: "all 0.3s ease",
          boxShadow:
            "0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(35, 36, 58, 0.2)",
          cursor: previewMode ? "not-allowed" : "text", // 🆕 Cursore diverso in preview
          opacity: previewMode ? 0.8 : 1, // 🆕 Leggermente trasparente in preview
        }}
        onFocus={(e) => {
          if (previewMode) return;
          e.target.style.borderColor = hexToRgba(inputFocusColor, 0.6);
          e.target.style.transform = "translateY(-1px)";
        }}
        onBlur={(e) => {
          if (previewMode) return;
          e.target.style.borderColor = hexToRgba(inputBorderColor, 0.2);
          e.target.style.transform = "translateY(0)";
        }}
      />
      <button
        type="submit"
        disabled={!shouldShowButtonEnabled && !previewMode} // 🆕 Mai disabled in preview
        style={{
          background: shouldShowButtonEnabled
            ? createGradient(sendButtonColor)
            : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 20,
          padding: "8px 20px",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: previewMode
            ? "not-allowed"
            : shouldShowButtonEnabled
            ? "pointer"
            : "not-allowed",
          transition: "all 0.3s ease",
          fontFamily: "inherit",
          opacity: shouldShowButtonEnabled ? 1 : 0.6, // 🆕 Sempre opaco in preview
        }}
      >
        Invia
      </button>
    </form>
  );
};

export default MessageInput;
