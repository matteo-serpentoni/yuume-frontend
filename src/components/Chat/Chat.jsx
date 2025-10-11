import "./Chat.css";
import { useChat } from "../../hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const Chat = () => {
    const { messages, loading, shopDomain, sessionId, sendMessage, clearChat } = useChat();

    const handleChipClick = (chipText) => {
        if (!loading) {
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