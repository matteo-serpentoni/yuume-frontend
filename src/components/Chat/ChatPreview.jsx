import "./Chat.css";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

/**
 * ChatPreview
 * Versione della Chat per la preview con messaggi mockati
 * Non usa useChat() hook, accetta messaggi come props
 */
const ChatPreview = ({
  chatColors = { header: "#667eea", sendButton: "#667eea" },
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
        onChipClick={() => {}} // Disabilitato nella preview
        shopDomain="preview"
        onSupportFeedback={() => {}} // Disabilitato nella preview
        headerColor={chatColors.header}
      />
      <MessageInput
        onSend={() => {}} // Disabilitato nella preview
        loading={false}
        placeholder="Preview - Input disabilitato"
        sendButtonColor={chatColors.sendButton}
      />
    </div>
  );
};

export default ChatPreview;
