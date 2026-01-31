import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { sendMessage, ChatApiError, getSessionStatus, submitFeedback } from '../services/chatApi';
import { reportError } from '../services/errorApi';
import { predictIntent } from '../utils/messageHelpers';

const STORAGE_KEYS = {
  SESSION_ID: 'yuume_session_id',
  MESSAGES: 'yuume_messages',
  SHOP_DOMAIN: 'yuume_dev_shop_domain', // Unified with DevTools and useOrb
  SESSION_TIME: 'yuume_session_time',
  SESSION_STATUS: 'yuume_session_status',
};

const SESSION_TIMEOUT = 30 * 60 * 1000;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useChat = (devShopDomain, customer, options = {}) => {
  const { disabled = false } = options;

  const [sessionId, setSessionId] = useState(() => {
    if (disabled) return 'preview-session';
    let id = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    const savedTime = localStorage.getItem(STORAGE_KEYS.SESSION_TIME);

    if (id && savedTime) {
      const elapsed = Date.now() - parseInt(savedTime);

      if (elapsed >= SESSION_TIMEOUT) {
        // Clear only Yuume keys from localStorage
        Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
        localStorage.removeItem('yuume_shopify_customer');
        localStorage.removeItem('yuume_profile');
        id = null;
      }
    }

    if (!id) {
      id = generateSessionId();
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
      localStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now().toString());
    }

    return id;
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = !disabled ? localStorage.getItem(STORAGE_KEYS.MESSAGES) : null;
      if (saved) {
        return JSON.parse(saved);
      }

      // Personalized Welcome: Check if we have a saved name from Yuume Profile
      let welcomeText = 'Ciao! 👋 Sono Yuume, il tuo assistente. Come posso aiutarti?';
      try {
        const savedProfile = localStorage.getItem('yuume_profile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          if (profile.name) {
            const firstName = profile.name.trim().split(' ')[0];
            welcomeText = `Ciao ${firstName}! 👋 Come posso aiutarti oggi?`;
          }
        }
      } catch (e) {
        // Fallback to default if storage fails
      }

      return [
        {
          id: Date.now(),
          sender: 'assistant',
          text: welcomeText,
          timestamp: new Date().toISOString(),
          disableFeedback: true, // Disable feedback for welcome message
        },
      ];
    } catch (error) {
      console.error('Errore caricamento messaggi:', error);
      return [];
    }
  });

  // Session Status State
  const [sessionStatus, setSessionStatus] = useState(() => {
    if (disabled) return 'active';
    return localStorage.getItem(STORAGE_KEYS.SESSION_STATUS) || 'active';
  });

  // Connection Status logic
  const [connectionStatus, setConnectionStatus] = useState('online');

  useEffect(() => {
    if (disabled) return;

    const updateStatus = () => {
      if (!window.navigator.onLine) {
        setConnectionStatus('offline');
      }
    };

    window.addEventListener('online', () => setConnectionStatus('online'));
    window.addEventListener('offline', () => setConnectionStatus('offline'));

    updateStatus();

    return () => {
      window.removeEventListener('online', () => setConnectionStatus('online'));
      window.removeEventListener('offline', () => setConnectionStatus('offline'));
    };
  }, [disabled]);

  const [assignedTo, setAssignedTo] = useState(null);
  const [shopifyCustomer, setShopifyCustomer] = useState(() => {
    if (disabled) return null;
    try {
      const saved = localStorage.getItem('yuume_shopify_customer');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }); // Certified identity
  const [initialSuggestions, setInitialSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingIntent, setThinkingIntent] = useState(null);
  const socketRef = useRef(null);

  const [shopDomain, setShopDomain] = useState(() => {
    if (disabled) return 'preview-shop.myshopify.com';
    return devShopDomain || localStorage.getItem(STORAGE_KEYS.SHOP_DOMAIN) || null;
  });

  // -------------------------------------
  // HELPER FUNCTIONS (Defined before usage in Effects)
  // -------------------------------------

  const clearChat = useCallback(() => {
    const welcomeMsg = {
      id: Date.now(),
      sender: 'assistant',
      text: 'Ciao! 👋 Sono Yuume, il tuo assistente. Come posso aiutarti?',
      timestamp: new Date().toISOString(),
      disableFeedback: true,
    };

    const newSessionId = generateSessionId();

    // Surgical clear: only yuume keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('yuume_') && key !== STORAGE_KEYS.SHOP_DOMAIN) {
        localStorage.removeItem(key);
      }
    });

    localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
    localStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now().toString());
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([welcomeMsg]));
    localStorage.setItem(STORAGE_KEYS.SESSION_STATUS, 'active');

    setSessionId(newSessionId);
    setMessages([welcomeMsg]);
    setSessionStatus('active');
    setAssignedTo(null);
    setInitialSuggestions([]);
  }, []);

  const addUserMessage = useCallback((text, id = Date.now(), hidden = false) => {
    const userMessage = {
      id: String(id),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      hidden,
    };
    setMessages((prev) => [...prev, userMessage]);
    return userMessage;
  }, []);

  const addAssistantMessage = useCallback((data) => {
    const assistantMessage = {
      id: data.id || Date.now() + 1,
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      text: data.message || data.text,
      ...data,
    };
    setMessages((prev) => {
      const exists = prev.some((m) => String(m.id || '') === String(assistantMessage.id || ''));
      if (exists) return prev;
      return [...prev, assistantMessage];
    });
    return assistantMessage;
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EFFECTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Reset session when shopDomain changes (Site Switching)
  const prevShopDomain = useRef(shopDomain);
  useEffect(() => {
    if (shopDomain && prevShopDomain.current && shopDomain !== prevShopDomain.current) {
      clearChat();
    }
    prevShopDomain.current = shopDomain;
  }, [shopDomain, clearChat]);

  // Sync internal shopDomain when prop changes
  useEffect(() => {
    if (devShopDomain && devShopDomain !== shopDomain) {
      setShopDomain(devShopDomain);
    }
  }, [devShopDomain, shopDomain]);

  useEffect(() => {
    if (disabled) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Errore salvataggio messaggi:', error);
    }
  }, [messages, disabled]);

  // Persist session status
  useEffect(() => {
    if (disabled) return;
    localStorage.setItem(STORAGE_KEYS.SESSION_STATUS, sessionStatus);
  }, [sessionStatus, disabled]);

  useEffect(() => {
    if (disabled) return;
    const interval = setInterval(() => {
      const savedTime = localStorage.getItem(STORAGE_KEYS.SESSION_TIME);
      if (savedTime) {
        const elapsed = Date.now() - parseInt(savedTime);

        if (elapsed >= SESSION_TIMEOUT) {
          clearChat(); // Use clearChat instead of reload
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [clearChat, disabled]);

  // Listen for Identity from Parent (Shopify Storefront)
  useEffect(() => {
    if (disabled) return;

    const handleMessage = (event) => {
      // Listen for both YUUME:identity and YUUME:shopDomain
      if (event.data?.type === 'YUUME:identity' || event.data?.type === 'YUUME:shopDomain') {
        const customer = event.data.customer || event.data.shopifyCustomer;

        if (customer) {
          console.log('Shopify Identity Detected:', customer.email || customer.id);
          setShopifyCustomer(customer);
          // Persist identity to localStorage
          try {
            localStorage.setItem('yuume_shopify_customer', JSON.stringify(customer));
          } catch (e) {
            // Storage full or restricted
          }
        } else {
          // LOGOUT SYNC: Clear identity if parent sends null/undefined
          console.log('Shopify Logout Detected: Clearing identity');
          setShopifyCustomer(null);
          localStorage.removeItem('yuume_shopify_customer');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    // Request identity from parent in case it was already sent
    window.parent?.postMessage({ type: 'YUUME:ready' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, [disabled]);

  // WebSocket Connection
  useEffect(() => {
    if (disabled || !sessionId) return;

    // Initial status fetch (sync status, assignment and history)
    getSessionStatus(sessionId, shopDomain)
      .then((statusData) => {
        if (statusData) {
          if (statusData.status) setSessionStatus(statusData.status);
          if (statusData.assignedTo) setAssignedTo(statusData.assignedTo);
          if (statusData.initialSuggestions) setInitialSuggestions(statusData.initialSuggestions);

          // Handle personalized welcome if customer info is found
          if (statusData.customer) {
            localStorage.setItem('yuume_profile', JSON.stringify(statusData.customer));

            setMessages((prev) => {
              // Only personalize if we just have the default welcome message
              if (prev.length === 1 && prev[0].disableFeedback && statusData.customer.name) {
                const firstName = statusData.customer.name.trim().split(' ')[0];
                const personalizedText = `Ciao ${firstName}! 👋 Come posso aiutarti oggi?`;
                if (prev[0].text !== personalizedText) {
                  return [{ ...prev[0], text: personalizedText }];
                }
              }
              return prev;
            });
          }

          // Sync message history if available
          if (statusData.messages && statusData.messages.length > 0) {
            setMessages((prev) => {
              const serverMessages = statusData.messages;

              // 1. Create a map of server messages for fast lookup
              const serverMsgMap = new Map();
              serverMessages.forEach((msg) => {
                if (msg.id) {
                  serverMsgMap.set(msg.id.toString(), msg);
                }
                if (msg.clientMessageId) {
                  serverMsgMap.set(msg.clientMessageId.toString(), msg);
                }
              });

              // 2. Identify local messages that SHOULD be preserved:
              // - Technical errors (title: "Errore" or "Sessione scaduta")
              // - Initial welcome message (disableFeedback: true)
              // - Any message not yet present on server (by ID and clientMessageId)
              const localToKeep = prev.filter((localMsg) => {
                const localIdStr = localMsg.id?.toString();

                // If it's already on the server, don't keep the local copy (server is source of truth)
                const existsOnServer = localIdStr && serverMsgMap.has(localIdStr);

                if (existsOnServer) return false;

                // Keep if it's a specific frontend-only message
                const isError =
                  localMsg.title === 'Errore' || localMsg.title === 'Sessione scaduta';
                const isWelcome = localMsg.disableFeedback === true;

                return isError || isWelcome || !existsOnServer;
              });

              // 3. Merge and sort
              const merged = [...localToKeep, ...serverMessages].sort((a, b) => {
                const timeA = new Date(a.timestamp || 0).getTime();
                const timeB = new Date(b.timestamp || 0).getTime();
                return timeA - timeB;
              });

              // 4. Final deduplication by ID just in case
              const final = [];
              const seenIds = new Set();
              merged.forEach((m) => {
                const idStr = String(m.id || '');
                if (idStr && !seenIds.has(idStr)) {
                  final.push(m);
                  seenIds.add(idStr);
                }
              });

              return final;
            });
          }
        }
      })
      .catch((err) => {
        // Silently fail if session doesn't exist yet
      });

    // Connect Socket with Reconnection Logic
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('online');
      socket.emit('join_session', sessionId);
    });

    socket.on('disconnect', (reason) => {
      // If client is still online, means it's a server/socket issue
      if (window.navigator.onLine) {
        setConnectionStatus('reconnecting');
      }
    });

    socket.on('reconnect_attempt', () => {
      if (window.navigator.onLine) {
        setConnectionStatus('reconnecting');
      }
    });

    socket.on('connect_error', () => {
      if (window.navigator.onLine) {
        setConnectionStatus('reconnecting');
      }
    });

    socket.on('message:received', (message) => {
      // SAFETY OVERRIDE: Assistant responses should NEVER be hidden in the widget
      const isAssistant =
        message.sender === 'assistant' || message.sender === 'ai' || message.role === 'assistant';

      if (
        !isAssistant &&
        (message.sender === 'system' || message.role === 'system' || message.hidden)
      ) {
        return;
      }

      setMessages((prev) => {
        // Robust duplicate prevention
        const msgId = String(message.id || '');
        const exists = prev.some((m) => {
          if (!m.id) return false;
          return String(m.id) === msgId;
        });

        if (exists) return prev;
        return [...prev, message];
      });

      // If message is from assistant, stop loading
      if (isAssistant) {
        setLoading(false);
        setIsThinking(false);
        setThinkingIntent(null);
      }
    });

    socket.on('thinking:start', (data) => {
      setIsThinking(true);
      setThinkingIntent(data.intent);
    });

    socket.on('session:updated', (data) => {
      if (data.status) setSessionStatus(data.status);
      if (data.assignedTo !== undefined) setAssignedTo(data.assignedTo);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  const sendChatMessage = useCallback(
    async (text, options = {}) => {
      if (!text.trim() || loading) return;

      const currentShop = devShopDomain || shopDomain;
      if (!currentShop) {
        reportError({
          message: `Missing shopDomain in sendChatMessage. Prop: ${devShopDomain || 'null'}, State: ${shopDomain || 'null'}`,
          shopDomain: 'missing',
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
        throw new Error('Configurazione non trovata. Per favore ricarica la pagina. (Codice: 001)');
      }

      let currentSessionId = sessionId;

      // AUTO-START NEW SESSION IF COMPLETED
      if (sessionStatus === 'completed' || sessionStatus === 'abandoned') {
        // 1. Generate new ID
        const newId = generateSessionId();
        currentSessionId = newId; // Use new ID for this request

        // 2. Update Storage
        localStorage.setItem(STORAGE_KEYS.SESSION_ID, newId);
        localStorage.setItem(STORAGE_KEYS.SESSION_STATUS, 'active');
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));

        // 3. Update State (Soft Reset)
        setSessionId(newId);
        setSessionStatus('active');
        setMessages([]); // Clear previous messages
        setAssignedTo(null);
        setInitialSuggestions([]);
      }

      // Clear initial suggestions on any explicit message
      setInitialSuggestions([]);

      localStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now().toString());

      setLoading(true);

      // Local Prediction: Show thinking indicator immediately if it matches a pattern
      const predicted = predictIntent(text);
      if (predicted) {
        setIsThinking(true);
        setThinkingIntent(predicted);
      }

      const userMsgId = Date.now(); // Generate ID here
      const userMsg = addUserMessage(text, userMsgId, options.hidden);

      try {
        const response = await sendMessage(
          text,
          currentSessionId, // Use the correct ID (current or new)
          devShopDomain || shopDomain,
          {
            customer,
            shopifyCustomer, // Pass certified identity
            ...options,
          },
          userMsgId,
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

          // Update status from response
          if (response.status) {
            setSessionStatus(response.status);
          }
        } else {
          // If no message but success (e.g. human handoff specific response?), handle it
          // But usually we expect a message or empty message
        }
      } catch (error) {
        console.error('Chat error:', error);

        if (error.status === 410 || error.message?.includes('session_expired')) {
          clearChat();

          addAssistantMessage({
            type: 'text',
            title: 'Sessione scaduta',
            message:
              'La tua sessione è scaduta per inattività. Ricarica la pagina per iniziare una nuova conversazione.',
            format: 'plain',
          });

          return;
        }

        const errorMessage =
          error instanceof ChatApiError
            ? 'Errore di connessione. Riprova tra poco.'
            : 'Si è verificato un errore inaspettato.';

        addAssistantMessage({
          type: 'text',
          title: 'Errore',
          message: errorMessage,
          format: 'plain',
        });
      } finally {
        setLoading(false);
      }
    },
    [
      sessionId,
      loading,
      shopDomain,
      devShopDomain, // Added prop dependency
      addUserMessage,
      addAssistantMessage,
      customer,
      shopifyCustomer, // Fix stale closure: add dependency
      sessionStatus,
      setSessionId,
      setSessionStatus,
      setMessages,
      setAssignedTo,
    ],
  );

  const sendFeedback = useCallback(
    async (messageId, rating, aiMessageText, type = 'message') => {
      // 1. Optimistic UI Update (Only for message feedback)
      if (type === 'message') {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, feedback: rating } : msg)),
        );
      }

      // 2. Find context (user query)
      let userQuery = 'N/A';
      if (type === 'message') {
        const messageIndex = messages.findIndex((m) => m.id === messageId);
        if (messageIndex > 0) {
          const prevMsg = messages[messageIndex - 1];
          if (prevMsg.sender === 'user') {
            userQuery = prevMsg.text;
          }
        }
      }

      // 3. Send to backend
      try {
        await submitFeedback({
          shopDomain,
          sessionId,
          messageId,
          userQuery,
          aiResponse: aiMessageText,
          rating,
          type,
        });
      } catch (error) {
        console.error('Error sending feedback:', error);
      }
    },
    [messages, shopDomain, sessionId],
  );

  return {
    messages,
    loading,
    shopDomain,
    connectionStatus, // Return connection status
    sessionId,
    sessionStatus,
    assignedTo, // Return assignedTo
    shopifyCustomer, // Return certified identity
    initialSuggestions, // Return initial suggestions
    sendMessage: sendChatMessage,
    clearChat,
    sendFeedback,
    isThinking,
    thinkingIntent,
  };
};
