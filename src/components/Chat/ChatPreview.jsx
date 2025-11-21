import "../Orb/Orb.css";
import MessageInput from "./MessageInput";

/**
 * ChatPreview
 * Versione della Chat per la preview con messaggi mockati
 *
 * Features:
 * - Messaggi di esempio per visualizzare i colori
 * - Input disabilitato (non cliccabile)
 * - Usa la stessa struttura di Chat.jsx
 */
const ChatPreview = ({
  chatColors = {
    header: "#667eea",
    sendButton: "#667eea",
    userMessage: "#667eea",
    aiMessage: "#4CC2E9",
    inputBorder: "#667eea",
    inputFocus: "#4CC2E9",
  },
}) => {
  // 🎭 Messaggi mockati per la preview
  const mockMessages = [
    {
      id: "preview-1",
      sender: "ai",
      text: "Ciao! 👋 Sono qui per aiutarti. Come posso esserti utile oggi?",
    },
    {
      id: "preview-2",
      sender: "user",
      text: "Vorrei informazioni sui vostri prodotti",
    },
    {
      id: "preview-3",
      sender: "ai",
      text: "Perfetto! Abbiamo un'ampia gamma di prodotti. Cosa stai cercando in particolare?",
    },
  ];

  const renderMessage = (msg) => {
    const msgColor =
      msg.sender === "user" ? chatColors.userMessage : chatColors.aiMessage;

    return (
      <div
        className={`message-bubble ${msg.sender}`}
        style={{
          background: msgColor,
          borderRadius:
            msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        }}
      >
        {msg.text}
      </div>
    );
  };

  return (
    <div className="chat-inner">
      <div className="messages-area">
        {mockMessages.map((msg) => (
          <div key={msg.id}>{renderMessage(msg)}</div>
        ))}
      </div>

      <MessageInput
        onSend={() => {}} // Funzione vuota, non fa nulla
        loading={false}
        placeholder="Scrivi un messaggio…"
        sendButtonColor={chatColors.sendButton}
        inputBorderColor={chatColors.inputBorder}
        inputFocusColor={chatColors.inputFocus}
        previewMode={true} // 🔥 ABILITA MODALITÀ PREVIEW
      />

      {/* Close button come in Chat.jsx */}
      <button
        className="close-button"
        onClick={(e) => {
          e.stopPropagation();
          // In preview mode non fa nulla
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
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatPreview;
