import { useState, useRef } from "react";
import "./MessageInput.css";

const MessageInput = ({
  onSendMessage,
  disabled: propDisabled,
  loading,
  placeholder = "Scrivi un messaggio…",
  sendButtonColor = "#a259ff",
  inputBorderColor = "#a259ff",
  inputFocusColor = "#4CC2E9",
  previewMode = false,
  onProfileClick,
  connectionStatus = "online",
}) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const isDisconnected = connectionStatus !== "online";
  const disabled = propDisabled || loading || isDisconnected;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const getPlaceholder = () => {
    if (connectionStatus === "offline") return "Nessuna connessione...";
    if (connectionStatus === "reconnecting") return "Riconnessione...";
    return placeholder;
  };

  const hexToRgba = (hex, alpha) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const rgb = result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 162, g: 89, b: 255 };
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  const createGradient = (color) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    const rgb = result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 162, g: 89, b: 255 };
    const darker = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(
      0,
      rgb.g - 30
    )}, ${Math.max(0, rgb.b - 30)})`;
    return `linear-gradient(135deg, ${color} 0%, ${darker} 100%)`;
  };

  const shouldShowButton = message.trim() && !loading && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      className="message-input-container"
      style={{
        pointerEvents: previewMode ? "none" : "auto",
      }}
    >
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder={getPlaceholder()}
          aria-label="Messaggio da inviare"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => !previewMode && setIsFocused(true)}
          onBlur={() => !previewMode && setIsFocused(false)}
          disabled={disabled}
          maxLength={2000}
          style={{
            border: `2px solid ${
              isFocused
                ? hexToRgba(inputFocusColor, 0.6)
                : hexToRgba(inputBorderColor, 0.2)
            }`,
            cursor: previewMode || disabled ? "not-allowed" : "text",
            opacity: previewMode || disabled ? 0.6 : 1,
          }}
        />
        {shouldShowButton && (
          <button
            type="submit"
            aria-label="Invia messaggio"
            className="chat-send-btn"
            style={{
              background: createGradient(sendButtonColor),
              boxShadow: `0 2px 8px ${hexToRgba(sendButtonColor, 0.3)}`,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {onProfileClick && !previewMode && (
        <button
          type="button"
          onClick={onProfileClick}
          title="Profilo"
          className="profile-btn profile-button-gradient-border"
        >
          <div className="profile-icon" />
        </button>
      )}
    </form>
  );
};

export default MessageInput;
