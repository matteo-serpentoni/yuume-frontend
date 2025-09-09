import React from "react";
import "./Chat.css";
import { useSessionId } from "../../hooks/useSessionId";
import { useChat } from "../../hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const Chat = () => {
    const sessionId = useSessionId();
    const { messages, loading, sendMessage } = useChat(sessionId);

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