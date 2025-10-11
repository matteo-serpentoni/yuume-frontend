import { useState, useCallback, useEffect } from "react";
import { sendMessage, ChatApiError } from "../services/chatApi";

const STORAGE_KEYS = {
  SESSION_ID: 'yuume_session_id',
  MESSAGES: 'yuume_messages',
  SHOP_DOMAIN: 'yuume_shop_domain',
  SESSION_TIME: 'yuume_session_time'
};

const SESSION_TIMEOUT = 30 * 60 * 1000;

const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useChat = () => {
  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
    const savedTime = sessionStorage.getItem(STORAGE_KEYS.SESSION_TIME);

    if (id && savedTime) {
      const elapsed = Date.now() - parseInt(savedTime);

      if (elapsed >= SESSION_TIMEOUT) {
        console.log('⏰ Sessione scaduta per inattività, creazione nuova sessione');
        sessionStorage.clear();
        id = null;
      }
    }

    if (!id) {
      id = generateSessionId();
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
      sessionStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now().toString());
      console.log('🆕 Nuova sessione creata:', id);
    } else {
      console.log('♻️ Sessione esistente recuperata:', id);
    }

    return id;
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Errore caricamento messaggi:', error);
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  const [shopDomain, setShopDomain] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEYS.SHOP_DOMAIN) || window.location.hostname;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Errore salvataggio messaggi:', error);
    }
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'YUUME_SHOP_DOMAIN') {
        setShopDomain(event.data.shopDomain);
        sessionStorage.setItem(STORAGE_KEYS.SHOP_DOMAIN, event.data.shopDomain);
        console.log('Shop domain ricevuto e salvato:', event.data.shopDomain);
      }
    };

    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'REQUEST_SHOP_DOMAIN' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const savedTime = sessionStorage.getItem(STORAGE_KEYS.SESSION_TIME);
      if (savedTime) {
        const elapsed = Date.now() - parseInt(savedTime);

        if (elapsed >= SESSION_TIMEOUT) {
          console.log('⏰ Sessione scaduta per inattività, pulizia in corso...');
          sessionStorage.clear();
          window.location.reload();
        }
      }
    }, 60000);

    return () => clearInterval(interval);
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

    sessionStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now().toString());

    setLoading(true);
    addUserMessage(text);

    try {
      const response = await sendMessage(text, sessionId, shopDomain);

      if (response.message) {
        addAssistantMessage(response.message);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Chat error:", error);

      if (error.status === 410 || error.message?.includes('session_expired')) {
        console.log('⏰ Sessione scaduta dal backend');

        sessionStorage.clear();

        addAssistantMessage({
          type: "text",
          title: "Sessione scaduta",
          message: "La tua sessione è scaduta per inattività. Ricarica la pagina per iniziare una nuova conversazione.",
          format: "plain",
          chips: ["Ricarica pagina"]
        });

        return;
      }

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
      setLoading(false);  // 🔥 CORRETTO: false invece di true
    }
  }, [sessionId, loading, shopDomain, addUserMessage, addAssistantMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    sessionStorage.clear();

    const newSessionId = generateSessionId();
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    sessionStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now().toString());

    window.location.reload();
  }, []);

  return {
    messages,
    loading,
    shopDomain,
    sessionId,
    sendMessage: sendChatMessage,
    clearChat
  };
};