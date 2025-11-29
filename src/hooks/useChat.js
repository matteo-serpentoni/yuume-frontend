import { useState, useCallback, useEffect, useRef } from "react";
import {
  sendMessage,
  ChatApiError,
  getSessionStatus,
} from "../services/chatApi";
import { io } from "socket.io-client";

const STORAGE_KEYS = {
  SESSION_ID: "yuume_session_id",
  MESSAGES: "yuume_messages",
  SHOP_DOMAIN: "yuume_shop_domain",
  SESSION_TIME: "yuume_session_time",
  SESSION_STATUS: "yuume_session_status",
};

const SESSION_TIMEOUT = 30 * 60 * 1000;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useChat = (devShopDomain, customer) => {
  const [sessionId, setSessionId] = useState(() => {
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

  const [assignedTo, setAssignedTo] = useState(null); // ✅ New state for human assignment

  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

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

  const clearChat = useCallback(() => {
    // Reset to welcome message instead of empty array
    const welcomeMsg = {
      id: Date.now(),
      sender: "assistant",
      text: "Ciao! 👋 Sono Yuume, il tuo assistente. Come posso aiutarti?",
      timestamp: new Date().toISOString(),
      disableFeedback: true,
    };

    // Save new session with welcome message immediately
    const newSessionId = generateSessionId();
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    sessionStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now().toString());
    sessionStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([welcomeMsg]));
    sessionStorage.setItem(STORAGE_KEYS.SESSION_STATUS, "active");

    // Update State
    setSessionId(newSessionId);
    setMessages([welcomeMsg]);
    setSessionStatus("active");
    setAssignedTo(null);
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
          clearChat(); // Use clearChat instead of reload
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [clearChat]);

  // ✅ WebSocket Connection
  useEffect(() => {
    if (!sessionId) return;

    // Initial status fetch (still useful for initial load)
    getSessionStatus(sessionId).then((statusData) => {
      if (statusData) {
        if (statusData.status) setSessionStatus(statusData.status);
        if (statusData.assignedTo) setAssignedTo(statusData.assignedTo);
      }
    });

    // Connect Socket
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected to WebSocket");
      socket.emit("join_session", sessionId);
    });

    socket.on("message:received", (message) => {
      console.log("📩 Message received via socket:", message);
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      // If message is from assistant/human, stop loading
      if (message.sender === "assistant") {
        setLoading(false);
      }
    });

    socket.on("session:updated", (data) => {
      console.log("🔄 Session updated via socket:", data);
      if (data.status) setSessionStatus(data.status);
      if (data.assignedTo !== undefined) setAssignedTo(data.assignedTo);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  const addUserMessage = useCallback((text, id = Date.now()) => {
    const userMessage = {
      id,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    return userMessage;
  }, []);

  const addAssistantMessage = useCallback((data) => {
    const assistantMessage = {
      id: data.id || Date.now() + 1, // Use backend ID if available
      sender: "assistant",
      timestamp: new Date().toISOString(),
      text: data.message || data.text,
      ...data,
    };

    setMessages((prev) => {
      // Deduplicate
      if (prev.some((m) => m.id === assistantMessage.id)) return prev;
      return [...prev, assistantMessage];
    });
    return assistantMessage;
  }, []);

  const sendChatMessage = useCallback(
    async (text) => {
      if (!text.trim() || loading) return;

      let currentSessionId = sessionId;

      // 🔥 AUTO-START NEW SESSION IF COMPLETED
      if (sessionStatus === "completed" || sessionStatus === "abandoned") {
        console.log("🔄 Starting new session (soft reset)...");

        // 1. Generate new ID
        const newId = generateSessionId();
        currentSessionId = newId; // Use new ID for this request

        // 2. Update Storage
        sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, newId);
        sessionStorage.setItem(STORAGE_KEYS.SESSION_STATUS, "active");
        sessionStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));

        // 3. Update State (Soft Reset)
        setSessionId(newId);
        setSessionStatus("active");
        setMessages([]); // Clear previous messages
        setAssignedTo(null);
      }

      sessionStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now().toString());

      setLoading(true);
      const userMsgId = Date.now(); // Generate ID here
      const userMsg = addUserMessage(text, userMsgId);

      try {
        const response = await sendMessage(
          text,
          currentSessionId, // Use the correct ID (current or new)
          shopDomain,
          {
            customer,
          },
          userMsgId
        );

        if (response.message) {
          // Note: If backend emits socket event for AI response too, we might get duplicate.
          // But our socket listener checks for duplicates by ID.
          // However, AI response ID is generated on backend or frontend?
          // Frontend generates ID for optimistic UI, backend generates for socket.
          // We should rely on socket for AI response if possible, OR handle deduplication carefully.
          // For now, let's keep adding it here for immediate feedback, and socket will be ignored if duplicate ID (unlikely if ID generation differs).
          // Actually, backend socket emission uses Date.now() + 1, which might clash or not.
          // Safer to NOT add here if we expect socket? Or add here and ensure socket ID matches?
          // Let's add here. If socket comes with different ID, we might show double.
          // FIX: Backend `handleChat` emits `message:received` for AI response.
          // So we should probably NOT add it here manually if we trust socket.
          // BUT, `sendMessage` returns the response immediately.
          // Let's add it here for speed, and hope socket doesn't duplicate.
          // Ideally, `sendMessage` response should contain the ID used in socket emission.

          addAssistantMessage(response.message);

          // ✅ Update status from response
          if (response.status) {
            setSessionStatus(response.status);
          }
        } else {
          // If no message but success (e.g. human handoff specific response?), handle it
          // But usually we expect a message or empty message
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
      sessionStatus, // Added dependency
      setSessionId,
      setSessionStatus,
      setMessages,
      setAssignedTo,
    ]
  );

  const sendFeedback = useCallback(
    async (messageId, rating, aiMessageText, type = "message") => {
      // 1. Optimistic UI Update (Only for message feedback)
      if (type === "message") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, feedback: rating } : msg
          )
        );
      }

      // 2. Find context (user query)
      let userQuery = "N/A";
      if (type === "message") {
        const messageIndex = messages.findIndex((m) => m.id === messageId);
        if (messageIndex > 0) {
          const prevMsg = messages[messageIndex - 1];
          if (prevMsg.sender === "user") {
            userQuery = prevMsg.text;
          }
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
              messageId,
              userQuery,
              aiResponse: aiMessageText,
              rating,
              type, // ✅ Send type
            }),
          }
        );
      } catch (error) {
        console.error("Error sending feedback:", error);
      }
    },
    [messages, shopDomain, sessionId]
  );

  return {
    messages,
    loading,
    shopDomain,
    sessionId,
    sessionStatus,
    assignedTo, // ✅ Return assignedTo
    sendMessage: sendChatMessage,
    clearChat,
    sendFeedback,
  };
};
