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

  const shouldShowButton = message.trim() && !loading && !disabled;

  return (
    <form
      onSubmit={handleSubmit}
      className={`message-input-container ${previewMode ? "preview" : ""} ${
        isFocused ? "focused" : ""
      } ${disabled ? "disabled" : ""}`}
      style={{
        "--send-btn-color": sendButtonColor,
        "--input-border-color": inputBorderColor,
        "--input-focus-color": inputFocusColor,
      }}
    >
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder={
            connectionStatus === "offline"
              ? "Nessuna connessione..."
              : connectionStatus === "reconnecting"
              ? "Riconnessione..."
              : placeholder
          }
          aria-label="Messaggio da inviare"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => !previewMode && setIsFocused(true)}
          onBlur={() => !previewMode && setIsFocused(false)}
          disabled={disabled}
          maxLength={2000}
        />
        {shouldShowButton && (
          <button
            type="submit"
            aria-label="Invia messaggio"
            className="chat-send-btn"
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
