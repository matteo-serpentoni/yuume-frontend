import React, { useEffect, useRef } from "react";
import { useChat } from "../../hooks/useChat";
import "../Orb/Orb.css";

import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";

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

  // ✅ FUNZIONALITÀ: Gestione click sui chips
  const handleChipClick = (chipText) => {
    if (!loading && !awaitingFeedback) {
      sendMessage(chipText);
    }
  };

  // ✅ FUNZIONALITÀ: Render messaggi con supporto chips e feedback
  const renderMessage = (msg) => {
    // CHIPS TEMPORANEAMENTE DISABILITATI
    /*
    // Se il messaggio ha chips, renderizzali
    if (msg.chips && msg.chips.length > 0) {
      return (
        <>
          <div className={`message-bubble ${msg.sender}`}>
            {msg.text}
          </div>
          <div className="chips-container">
            {msg.chips.map((chip, index) => (
              <button
                key={index}
                className="chip-button"
                onClick={() => handleChipClick(chip)}
                disabled={loading || awaitingFeedback}
              >
                {chip}
              </button>
            ))}
          </div>
        </>
      );
    }
    */

    // Se il messaggio richiede feedback supporto
    if (msg.requiresFeedback) {
      return (
        <>
          <div className={`message-bubble ${msg.sender}`}>{msg.text}</div>
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
        {msg.text || msg.error || "Si è verificato un errore. Riprova."}
      </div>
    );
  };

  return (
    <div className="chat-inner">
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
