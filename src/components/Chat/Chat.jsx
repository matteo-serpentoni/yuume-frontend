import "./Chat.css";
import { useChat } from "../../hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const Chat = () => {
    const {
        messages,
        loading,
        shopDomain,
        sessionId,
        sendMessage,
        clearChat,
        awaitingFeedback,
        handleSupportFeedback
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
            />
            <MessageInput
                onSend={sendMessage}
                loading={loading}
                placeholder="Scrivi un messaggio…"
            />
        </div>
    );
};

export default Chat;