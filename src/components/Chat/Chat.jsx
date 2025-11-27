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
    awaitingFeedback,
    handleSupportFeedback,
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

    // Se il messaggio richiede feedback supporto
    if (msg.requiresFeedback) {
      return (
        <>
          <div className={`message-bubble ${msg.sender}`}>
            <div className="message-content">{msg.text}</div>
            <div className="message-time">{formatTime(msg.timestamp)}</div>
          </div>
          <div className="feedback-buttons">
            <button
              className="feedback-button yes"
              onClick={() => handleSupportFeedback(true)}
              disabled={!awaitingFeedback}
            >
              Sì
            </button>
            <button
              className="feedback-button no"
              onClick={() => handleSupportFeedback(false)}
              disabled={!awaitingFeedback}
            >
              No
            </button>
          </div>
        </>
      );
    }

    const msgColor =
      msg.sender === "user" ? chatColors.userMessage : chatColors.aiMessage;

    // Messaggio normale
    return (
      <div
        className={`message-bubble ${msg.sender}`}
        style={{
          background: msgColor,
          borderRadius:
            msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        }}
      >
        <div className="message-content">
          <ReactMarkdown>
            {msg.text || msg.error || "Si è verificato un errore. Riprova."}
          </ReactMarkdown>
        </div>
        <div className="message-time">{formatTime(msg.timestamp)}</div>
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
          if (!loading && !awaitingFeedback) {
            sendMessage(text);
            if (onTyping) onTyping(false);
          }
        }}
        loading={loading || awaitingFeedback}
        placeholder="Scrivi qualcosa..."
        sendButtonColor={chatColors.sendButton}
        inputBorderColor={chatColors.inputBorder}
        inputFocusColor={chatColors.inputFocus}
        previewMode={false}
      />

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
