import "./Chat.css";
import { useChat } from "../../hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const Chat = ({
  chatColors = { header: "#667eea", sendButton: "#667eea" },
}) => {
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

  const handleChipClick = (chipText) => {
    if (!loading && !awaitingFeedback) {
      sendMessage(chipText);
    }
  };

  return (
    <div className="chat-container">
      <MessageList
        messages={messages}
        loading={loading}
        onChipClick={handleChipClick}
        shopDomain={shopDomain}
        onSupportFeedback={handleSupportFeedback}
        headerColor={chatColors.header} // 🆕 Passa il colore header
      />
      <MessageInput
        onSend={sendMessage}
        loading={loading}
        placeholder="Scrivi un messaggio…"
        sendButtonColor={chatColors.sendButton} // 🆕 Passa il colore bottone
      />
    </div>
  );
};

export default Chat;
