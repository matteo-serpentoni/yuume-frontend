import "./Chat.css";
import { useChat } from "../../hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const Chat = ({
  chatColors = {
    header: "#667eea",
    sendButton: "#667eea",
    userMessage: "#667eea",
    aiMessage: "#4CC2E9",
    inputBorder: "#667eea",
    inputFocus: "#4CC2E9",
  },
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
        headerColor={chatColors.header}
        userMessageColor={chatColors.userMessage}
        aiMessageColor={chatColors.aiMessage}
      />
      <MessageInput
        onSend={sendMessage}
        loading={loading}
        placeholder="Scrivi un messaggio…"
        sendButtonColor={chatColors.sendButton}
        inputBorderColor={chatColors.inputBorder}
        inputFocusColor={chatColors.inputFocus}
      />
    </div>
  );
};

export default Chat;
