import { useState, useCallback, useEffect } from "react";
import { sendMessage, ChatApiError } from "../services/chatApi";

export const useChat = (sessionId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shopDomain, setShopDomain] = useState(window.location.hostname); // Default fallback

  // Ascolta messaggi dal parent (embed.js)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'YUUME_SHOP_DOMAIN') {
        setShopDomain(event.data.shopDomain);
        console.log('Shop domain ricevuto da embed.js:', event.data.shopDomain);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Richiedi shopDomain al caricamento
    window.parent.postMessage({ type: 'REQUEST_SHOP_DOMAIN' }, '*');
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
      const response = await sendMessage(text, sessionId, shopDomain); // Passa shopDomain
      
      if (response.message) {
        addAssistantMessage(response.message);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Chat error:", error);
      
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
  }, [sessionId, loading, shopDomain, addUserMessage, addAssistantMessage]);

  return {
    messages,
    loading,
    shopDomain,
    sendMessage: sendChatMessage
  };
};