import { useState, useCallback } from "react";
import { sendMessage, ChatApiError } from "../services/chatApi";

export const useChat = (sessionId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const addUserMessage = useCallback((text) => {
        const userMessage = {
            id: Date.now(),
            sender: "user",
            text,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        return userMessage;
    }, []);

    const addAssistantMessage = useCallback((data) => {
        const assistantMessage = {
            id: Date.now() + 1,
            sender: "assistant",
            timestamp: new Date().toISOString(),
            ...data
        };
        setMessages(prev => [...prev, assistantMessage]);
        return assistantMessage;
    }, []);

    const sendChatMessage = useCallback(async (text) => {
        if (!text.trim() || loading) return;

        setLoading(true);
        addUserMessage(text);

        try {
            const response = await sendMessage(text, sessionId);

            // Gestisci risposta dal nuovo backend
            if (response.message) {
                addAssistantMessage(response.message);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Chat error:", error);

            // Messaggio di errore user-friendly
            const errorMessage = error instanceof ChatApiError
                ? "Errore di connessione. Riprova tra poco."
                : "Si è verificato un errore inaspettato.";

            addAssistantMessage({
                type: "text",
                title: "Errore",
                message: errorMessage,
                format: "plain",
                chips: ["Riprova", "Supporto"]
            });
        } finally {
            setLoading(false);
        }
    }, [sessionId, loading, addUserMessage, addAssistantMessage]);

    return {
        messages,
        loading,
        sendMessage: sendChatMessage
    };
};