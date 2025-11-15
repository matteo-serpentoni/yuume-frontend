import { useState } from "react";

const MessageInput = ({
  onSend,
  loading,
  placeholder = "Scrivi un messaggio…",
  sendButtonColor = "#a259ff", // 🆕 Colore dinamico
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  // 🆕 Converte hex in rgb per il gradient
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

  // 🆕 Crea gradient dinamico dal colore
  const createGradient = (color) => {
    const rgb = hexToRgb(color);
    const darker = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(
      0,
      rgb.g - 30
    )}, ${Math.max(0, rgb.b - 30)})`;
    return `linear-gradient(135deg, ${color} 0%, ${darker} 100%)`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        width: "95%",
        alignItems: "center",
        gap: 8,
        maxHeight: 40,
      }}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={loading ? "Attendere risposta…" : placeholder}
        disabled={loading}
        maxLength={2000}
        style={{
          flex: 1,
          padding: "8px 16px",
          borderRadius: 20,
          border: "2px solid rgba(162, 89, 255, 0.2)",
          outline: "none",
          background: "rgba(35, 36, 58, 0.9)",
          backdropFilter: "blur(10px)",
          color: "#fff",
          fontSize: "0.9rem",
          fontFamily: "inherit",
          transition: "all 0.3s ease",
          boxShadow:
            "0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(35, 36, 58, 0.2)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(162, 89, 255, 0.6)";
          e.target.style.transform = "translateY(-1px)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(162, 89, 255, 0.2)";
          e.target.style.transform = "translateY(0)";
        }}
      />
      <button
        type="submit"
        disabled={loading || !input.trim()}
        style={{
          // 🆕 Usa il colore dinamico
          background:
            loading || !input.trim()
              ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
              : createGradient(sendButtonColor),
          color: "#fff",
          border: "none",
          borderRadius: 20,
          padding: "8px 20px",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          fontFamily: "inherit",
          opacity: loading || !input.trim() ? 0.6 : 1,
        }}
      >
        Invia
      </button>
    </form>
  );
};

export default MessageInput;
