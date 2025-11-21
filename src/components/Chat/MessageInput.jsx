import { useState } from "react";

const MessageInput = ({
  onSend,
  loading,
  placeholder = "Scrivi un messaggio…",
  sendButtonColor = "#a259ff",
  inputBorderColor = "#a259ff",
  inputFocusColor = "#4CC2E9",
  previewMode = false,
}) => {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (previewMode) return;
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

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

  const createGradient = (color) => {
    const rgb = hexToRgb(color);
    const darker = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(
      0,
      rgb.g - 30
    )}, ${Math.max(0, rgb.b - 30)})`;
    return `linear-gradient(135deg, ${color} 0%, ${darker} 100%)`;
  };

  const hexToRgba = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  const shouldShowButton = input.trim() && !loading;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        width: "100%",
        margin: "0 auto",
        marginTop: "auto",
        alignItems: "center",
        position: "relative",
        maxHeight: 48,
        pointerEvents: previewMode ? "none" : "auto",
      }}
    >
      {/* Container input con pulsante dentro */}
      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={previewMode ? "" : input}
          onChange={(e) => !previewMode && setInput(e.target.value)}
          onFocus={() => !previewMode && setIsFocused(true)}
          onBlur={() => !previewMode && setIsFocused(false)}
          placeholder={loading ? "Attendere risposta…" : placeholder}
          disabled={loading || previewMode}
          maxLength={2000}
          style={{
            width: "100%",
            padding: "12px 18px",
            paddingRight: shouldShowButton ? "56px" : "18px", // Spazio per il pulsante
            borderRadius: 24,
            border: `2px solid ${
              isFocused
                ? hexToRgba(inputFocusColor, 0.6)
                : hexToRgba(inputBorderColor, 0.2)
            }`,
            outline: "none",
            background: "rgba(35, 36, 58, 0.9)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            fontSize: "0.95rem",
            fontFamily: "inherit",
            transition: "all 0.3s ease",
            boxShadow:
              "0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(35, 36, 58, 0.2)",
            cursor: previewMode ? "not-allowed" : "text",
            opacity: previewMode ? 0.8 : 1,
          }}
        />

        {/* Pulsante dentro l'input - appare solo con testo */}
        {shouldShowButton && (
          <button
            type="submit"
            style={{
              position: "absolute",
              right: 6,
              background: createGradient(sendButtonColor),
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: `0 2px 8px ${hexToRgba(sendButtonColor, 0.3)}`,
              animation: "slideIn 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
            }}
          >
            {/* Icona freccia stile Apple */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: "rotate(90deg)",
              }}
            >
              <path
                d="M12 4L12 20M12 4L6 10M12 4L18 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </form>
  );
};

export default MessageInput;
