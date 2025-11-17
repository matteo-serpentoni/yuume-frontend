import "./Chat.css";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

/**
 * ChatPreview
 * Versione della Chat per la preview con messaggi mockati
 *
 * Features:
 * - Messaggi di esempio per visualizzare i colori
 * - Input disabilitato (non cliccabile)
 * - Pulsante Send sempre visibile con il colore del tema
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
      type: "text",
      message: "Ciao! 👋 Sono qui per aiutarti. Come posso esserti utile oggi?",
      timestamp: new Date(),
    },
    {
      id: "preview-2",
      sender: "user",
      text: "Vorrei informazioni sui vostri prodotti",
      timestamp: new Date(),
    },
    {
      id: "preview-3",
      sender: "ai",
      type: "text",
      message:
        "Perfetto! Abbiamo un'ampia gamma di prodotti. Cosa stai cercando in particolare?",
      timestamp: new Date(),
    },
  ];

  return (
    <div className="chat-container">
      <MessageList
        messages={mockMessages}
        loading={false}
        onChipClick={() => {}}
        shopDomain="preview"
        onSupportFeedback={() => {}}
        headerColor={chatColors.header}
        userMessageColor={chatColors.userMessage}
        aiMessageColor={chatColors.aiMessage}
      />
      <MessageInput
        onSend={() => {}} // Funzione vuota, non fa nulla
        loading={false}
        placeholder="Scrivi un messaggio…"
        sendButtonColor={chatColors.sendButton}
        inputBorderColor={chatColors.inputBorder}
        inputFocusColor={chatColors.inputFocus}
        previewMode={true} // 🔥 ABILITA MODALITÀ PREVIEW
      />
    </div>
  );
};

export default ChatPreview;
