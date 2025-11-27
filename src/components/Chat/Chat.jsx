import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useChat } from "../../hooks/useChat";
import "../Orb/Orb.css";

import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";
import ProductCards from "../Message/ProductCards";
import OrderCards from "../Message/OrderCards";

const Chat = ({
  onTyping,
  onMinimize,
  chatColors = {
    header: "#667eea",
    sendButton: "#667eea",
    userMessage: "#667eea",
    aiMessage: "#4CC2E9",
    inputBorder: "#667eea",
    inputFocus: "#4CC2E9",
  },
}) => {
  // ✅ FUNZIONALITÀ: useChat hook per gestione completa chat
  const {
    messages,
    loading,
    shopDomain,
    sessionId,
    sendMessage,
    clearChat,
    sendFeedback,
  } = useChat();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Helper per formattare il timestamp in HH:MM
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const renderMessage = (msg) => {
    // Se il messaggio è di tipo product_cards
    if (msg.type === "product_cards") {
      return (
        <div
          className={`message-bubble ${msg.sender} product-cards-bubble`}
          style={{
            background: chatColors.aiMessage, // Usa il colore del bot
            padding: "12px", // Padding standard
            borderRadius: "18px 18px 18px 4px", // Stesso raggio dei messaggi bot
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxWidth: "85%", // Larghezza standard
            width: "fit-content",
          }}
        >
          <ProductCards message={msg} shopDomain={shopDomain} />
          <div className="message-time" style={{ marginTop: 4 }}>
            {formatTime(msg.timestamp)}
          </div>
        </div>
      );
    }

    // Se il messaggio è di tipo order_cards
    if (msg.type === "order_cards") {
      return (
        <div
          className={`message-bubble ${msg.sender} order-cards-bubble`}
          style={{
            background: chatColors.aiMessage,
            padding: "12px",
            borderRadius: "18px 18px 18px 4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxWidth: "85%",
            width: "fit-content",
          }}
        >
          <OrderCards message={msg} />
          <div className="message-time" style={{ marginTop: 4 }}>
            {formatTime(msg.timestamp)}
          </div>
        </div>
      );
    }

    const msgColor =
      msg.sender === "user" ? chatColors.userMessage : chatColors.aiMessage;

    // Messaggio normale
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
        }}
      >
        <div
          className={`message-bubble ${msg.sender}`}
          style={{
            background: msgColor,
            borderRadius:
              msg.sender === "user"
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
            position: "relative",
            marginBottom: msg.sender === "assistant" && !msg.error ? 4 : 0,
          }}
        >
          <div className="message-content">
            <ReactMarkdown>
              {msg.text || msg.error || "Si è verificato un errore. Riprova."}
            </ReactMarkdown>
          </div>
          <div
            className="message-footer"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <div className="message-time">{formatTime(msg.timestamp)}</div>
          </div>
        </div>

        {/* Feedback Buttons OUTSIDE the bubble */}
        {msg.sender === "assistant" && !msg.error && !msg.disableFeedback && (
          <div
            className="feedback-actions"
            style={{
              display: "flex",
              gap: 8,
              paddingLeft: 4,
              opacity: 0.7,
            }}
          >
            <button
              onClick={() => sendFeedback(msg.id, "positive", msg.text)}
              title="Utile"
              className={msg.feedback === "positive" ? "thumb-animate" : ""}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                  msg.feedback === "positive"
                    ? "#FFFFFF"
                    : "rgba(255, 255, 255, 0.5)", // White or Transparent Gray
                transition: "all 0.2s",
                opacity: msg.feedback === "positive" ? 1 : 0.7,
                filter: "none", // Removed grayscale filter as we control color directly
              }}
              onMouseEnter={(e) => {
                if (msg.feedback !== "positive") {
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.opacity = 1;
                }
              }}
              onMouseLeave={(e) => {
                if (msg.feedback !== "positive") {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                  e.currentTarget.style.opacity = 0.7;
                }
              }}
            >
              {msg.feedback === "positive" ? (
                // Filled Thumbs Up
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              ) : (
                // Outline Thumbs Up
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              )}
            </button>
            <button
              onClick={() => sendFeedback(msg.id, "negative", msg.text)}
              title="Non utile"
              className={msg.feedback === "negative" ? "thumb-animate" : ""}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                  msg.feedback === "negative"
                    ? "#FFFFFF"
                    : "rgba(255, 255, 255, 0.5)", // White or Transparent Gray
                transition: "all 0.2s",
                opacity: msg.feedback === "negative" ? 1 : 0.7,
                filter: "none",
              }}
              onMouseEnter={(e) => {
                if (msg.feedback !== "negative") {
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.opacity = 1;
                }
              }}
              onMouseLeave={(e) => {
                if (msg.feedback !== "negative") {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                  e.currentTarget.style.opacity = 0.7;
                }
              }}
            >
              {msg.feedback === "negative" ? (
                // Filled Thumbs Down
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                </svg>
              ) : (
                // Outline Thumbs Down
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chat-inner">
      {/* MOBILE HEADER */}
      <div className="chat-mobile-header">
        <div className="header-content">
          <h3>Yuume</h3>
          <div className="online-status">
            <span className="status-dot"></span>
            <span className="status-text">Online</span>
          </div>
        </div>
      </div>

      <div className="messages-area">
        {messages.map((msg) => (
          <div key={msg.id}>{renderMessage(msg)}</div>
        ))}

        {/* ✅ FUNZIONALITÀ: Loading usa lo stato dal hook invece di locale */}
        {loading && <TypingIndicator aiMessageColor={chatColors.aiMessage} />}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSend={(text) => {
          if (!loading) {
            sendMessage(text);
            if (onTyping) onTyping(false);
          }
        }}
        loading={loading}
        placeholder="Scrivi qualcosa..."
        sendButtonColor={chatColors.sendButton}
        inputBorderColor={chatColors.inputBorder}
        inputFocusColor={chatColors.inputFocus}
        previewMode={false}
      />

      {/* Legal Disclaimer */}
      <div
        style={{
          fontSize: "10px",
          color: "rgba(255, 255, 255, 0.4)",
          textAlign: "center",
          marginTop: "8px",
          padding: "0 10px",
          lineHeight: "1.3",
        }}
      >
        Chattando accetti la{" "}
        <a
          href="/policies/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "rgba(255, 255, 255, 0.6)",
            textDecoration: "underline",
          }}
        >
          Privacy Policy
        </a>{" "}
        e la{" "}
        <a
          href="/policies/cookie-policy"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "rgba(255, 255, 255, 0.6)",
            textDecoration: "underline",
          }}
        >
          Cookie Policy
        </a>
        .
      </div>

      {/* Close button */}
      <button
        className="close-button"
        onClick={(e) => {
          e.stopPropagation();
          onMinimize && onMinimize();
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
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default Chat;
