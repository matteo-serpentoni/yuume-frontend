import { useState, useCallback, useEffect } from "react";
import { sendMessage, ChatApiError } from "../services/chatApi";

const STORAGE_KEYS = {
  SESSION_ID: "yuume_session_id",
  MESSAGES: "yuume_messages",
  SHOP_DOMAIN: "yuume_shop_domain",
  SESSION_TIME: "yuume_session_time",
  SESSION_STATUS: "yuume_session_status", // ✅ New key
};

const SESSION_TIMEOUT = 30 * 60 * 1000;

const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useChat = (devShopDomain, customer) => {
  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
    const savedTime = sessionStorage.getItem(STORAGE_KEYS.SESSION_TIME);

    if (id && savedTime) {
      const elapsed = Date.now() - parseInt(savedTime);

      if (elapsed >= SESSION_TIMEOUT) {
        console.log(
          "⏰ Sessione scaduta per inattività, creazione nuova sessione"
        );
        sessionStorage.clear();
        id = null;
      }
    }

    if (!id) {
      id = generateSessionId();
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
      sessionStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now().toString());
      console.log("🆕 Nuova sessione creata:", id);
    } else {
      console.log("♻️ Sessione esistente recuperata:", id);
    }

    return id;
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (saved) {
        return JSON.parse(saved);
      }

      // Default welcome message
      return [
        {
          id: Date.now(),
          sender: "assistant",
          text: "Ciao! 👋 Sono Yuume, il tuo assistente. Come posso aiutarti?",
          timestamp: new Date().toISOString(),
          disableFeedback: true, // Disable feedback for welcome message
        },
      ];
    } catch (error) {
      console.error("Errore caricamento messaggi:", error);
      return [];
    }
  });

  // ✅ Session Status State
  const [sessionStatus, setSessionStatus] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEYS.SESSION_STATUS) || "active";
  });

  const [loading, setLoading] = useState(false);

  const [shopDomain, setShopDomain] = useState(() => {
    // ✅ Priorità a devShopDomain se presente
    if (devShopDomain) return devShopDomain;

    return (
      sessionStorage.getItem(STORAGE_KEYS.SHOP_DOMAIN) ||
      window.location.hostname
    );
  });

  // ✅ Aggiorna shopDomain se cambia devShopDomain
  useEffect(() => {
    if (devShopDomain) {
      setShopDomain(devShopDomain);
      sessionStorage.setItem(STORAGE_KEYS.SHOP_DOMAIN, devShopDomain);
    }
  }, [devShopDomain]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error("Errore salvataggio messaggi:", error);
    }
  }, [messages]);

  // ✅ Persist session status
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_STATUS, sessionStatus);
  }, [sessionStatus]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "YUUME_SHOP_DOMAIN") {
        setShopDomain(event.data.shopDomain);
        sessionStorage.setItem(STORAGE_KEYS.SHOP_DOMAIN, event.data.shopDomain);
        console.log("Shop domain ricevuto e salvato:", event.data.shopDomain);
      }
    };

    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "REQUEST_SHOP_DOMAIN" }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const savedTime = sessionStorage.getItem(STORAGE_KEYS.SESSION_TIME);
      if (savedTime) {
        const elapsed = Date.now() - parseInt(savedTime);

        if (elapsed >= SESSION_TIMEOUT) {
          console.log(
            "⏰ Sessione scaduta per inattività, pulizia in corso..."
          );
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
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    return userMessage;
  }, []);

  const addAssistantMessage = useCallback((data) => {
    const assistantMessage = {
      id: Date.now() + 1,
      sender: "assistant",
      timestamp: new Date().toISOString(),
      text: data.message || data.text,
      ...data,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    return assistantMessage;
  }, []);

  const sendChatMessage = useCallback(
    async (text) => {
      if (!text.trim() || loading) return;

      sessionStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now().toString());

      setLoading(true);
      const userMsg = addUserMessage(text);

      try {
        const response = await sendMessage(text, sessionId, shopDomain, {
          customer,
        });

        if (response.message) {
          addAssistantMessage(response.message);

          // ✅ Update status from response
          if (response.status) {
            setSessionStatus(response.status);
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Chat error:", error);

        if (
          error.status === 410 ||
          error.message?.includes("session_expired")
        ) {
          console.log("⏰ Sessione scaduta dal backend");

          sessionStorage.clear();

          addAssistantMessage({
            type: "text",
            title: "Sessione scaduta",
            message:
              "La tua sessione è scaduta per inattività. Ricarica la pagina per iniziare una nuova conversazione.",
            format: "plain",
          });

          return;
        }

        const errorMessage =
          error instanceof ChatApiError
            ? "Errore di connessione. Riprova tra poco."
            : "Si è verificato un errore inaspettato.";

        addAssistantMessage({
          type: "text",
          title: "Errore",
          message: errorMessage,
          format: "plain",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      sessionId,
      loading,
      shopDomain,
      addUserMessage,
      addAssistantMessage,
      customer,
    ]
  );

  const sendFeedback = useCallback(
    async (messageId, rating, aiMessageText) => {
      // 1. Optimistic UI Update
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, feedback: rating } : msg
        )
      );

      // 2. Find context (user query)
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      let userQuery = "N/A";

      if (messageIndex > 0) {
        const prevMsg = messages[messageIndex - 1];
        if (prevMsg.sender === "user") {
          userQuery = prevMsg.text;
        }
      }

      // 3. Send to backend
      try {
        await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/api/feedback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              shopDomain,
              sessionId,
              messageId, // ✅ Added messageId
              userQuery,
              aiResponse: aiMessageText,
              rating,
            }),
          }
        );
      } catch (error) {
        console.error("Error sending feedback:", error);
      }
    },
    [messages, shopDomain, sessionId]
  );

  const clearChat = useCallback(() => {
    // Reset to welcome message instead of empty array
    const welcomeMsg = {
      id: Date.now(),
      sender: "assistant",
      text: "Ciao! 👋 Sono Yuume, il tuo assistente. Come posso aiutarti?",
      timestamp: new Date().toISOString(),
      disableFeedback: true,
    };

    setMessages([welcomeMsg]);
    setSessionStatus("active"); // ✅ Reset status
    sessionStorage.clear();

    // Save new session with welcome message immediately
    const newSessionId = generateSessionId();
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    sessionStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now().toString());
    sessionStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([welcomeMsg]));
    sessionStorage.setItem(STORAGE_KEYS.SESSION_STATUS, "active"); // ✅ Save status

    window.location.reload();
  }, []);

  return {
    messages,
    loading,
    shopDomain,
    sessionId,
    sessionStatus, // ✅ Return status
    sendMessage: sendChatMessage,
    clearChat,
    sendFeedback,
  };
};
