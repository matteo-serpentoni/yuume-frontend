import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { sendMessage, ChatApiError, bootSession, submitFeedback } from '../services/chatApi';
import { reportError } from '../services/errorApi';
import { predictIntent } from '../utils/messageHelpers';
import { broadcastConsentChange } from '../utils/consentBridge';
import storage from '../utils/storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Technical events that bypass analytics consent — mirrors backend privacyUtils.TECHNICAL_EVENTS_WHITELIST.
// SCALE-LIMIT: keep this list tiny and in sync with the backend. Product + Legal sign-off required to add entries.
const CONSENT_EXEMPT_EVENTS = new Set(['jarbris_session_started', 'privacy_consent_updated']);

export const useChat = (devShopDomain, customer, options = {}) => {
  const { disabled = false } = options;

  // B22: sessionId is received from parent via postMessage.
  // Boot-time: try cached value for instant render, parent will confirm/override.
  const [sessionId, setSessionId] = useState(() => {
    if (disabled) return 'preview-session';
    return storage.get('session_id') || null;
  });

  // B22: Identity readiness gate — true when parent has sent visitorId + sessionId
  const [identityReady, setIdentityReady] = useState(disabled);
  const [visitorId, setVisitorId] = useState(null);
  // Track boot data for ProfileView props
  const [bootProfile, setBootProfile] = useState(() => storage.getProfile());
  const [bootConsent, setBootConsent] = useState(null);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = !disabled ? storage.getJSON('messages') : null;
      if (saved) {
        return saved;
      }

      // Personalized Welcome: Check if we have a saved name from Yuume Profile
      let welcomeText = 'Ciao! 👋 Sono Yuume, il tuo assistente. Come posso aiutarti?';
      const cachedProfile = storage.getProfile();
      if (cachedProfile?.name) {
        const firstName = cachedProfile.name.trim().split(' ')[0];
        welcomeText = `Ciao ${firstName}! 👋 Come posso aiutarti oggi?`;
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
    } catch {
      return [];
    }
  });

  // Session Status State
  const [sessionStatus, setSessionStatus] = useState(() => {
    if (disabled) return 'active';
    return storage.get('session_status') || 'active';
  });

  // Connection Status logic
  const [connectionStatus, setConnectionStatus] = useState('online');
  const [cartCount, setCartCount] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  useEffect(() => {
    if (disabled) return;

    // Named handlers so the same reference is used for add and remove
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    if (!window.navigator.onLine) {
      setConnectionStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [disabled]);

  const [assignedTo, setAssignedTo] = useState(null);
  const [shopifyCustomer, setShopifyCustomer] = useState(null); // In-memory only (GDPR: PII not persisted to localStorage)
  const [analyticsConsent, setAnalyticsConsent] = useState(false); // Controlled by storefront parent postMessage
  const [initialSuggestions, setInitialSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingIntent, setThinkingIntent] = useState(null);
  const socketRef = useRef(null);

  const [shopDomain, setShopDomain] = useState(() => {
    if (disabled) return 'preview-shop.myshopify.com';
    return devShopDomain || storage.get('dev_shop_domain') || null;
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

    // B22: Delegate session creation to parent — it manages sessionId lifecycle
    storage.clearSession();
    storage.setJSON('messages', [welcomeMsg]);

    setMessages([welcomeMsg]);
    setSessionStatus('active');
    setAssignedTo(null);
    setInitialSuggestions([]);
    setBootProfile(null);
    setBootConsent(null);

    // Request new session from parent (embed.js)
    window.parent?.postMessage({ type: 'YUUME:requestNewSession' }, '*');
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
    storage.setJSON('messages', messages);
  }, [messages, disabled]);

  // Persist session status
  useEffect(() => {
    if (disabled) return;
    storage.set('session_status', sessionStatus);
  }, [sessionStatus, disabled]);

  // B22: Timeout check REMOVED — session timeout is now managed by parent (embed.js getOrCreateSessionId).

  // Listen for Identity and Cart from Parent (Shopify Storefront)
  useEffect(() => {
    if (disabled) return;

    const handleMessage = (event) => {
      // 1. Identity & ShopDomain — parent is source of truth for visitorId + sessionId
      if (event.data?.type === 'YUUME:identity' || event.data?.type === 'YUUME:shopDomain') {
        // B22: Receive persistent identity from parent (1st-party localStorage)
        if (event.data.visitorId) setVisitorId(event.data.visitorId);
        if (event.data.sessionId) {
          setSessionId(event.data.sessionId);
          storage.set('session_id', event.data.sessionId); // Cache for fast boot on next load
        }

        const customer = event.data.customer || event.data.shopifyCustomer;
        if (typeof event.data.analyticsConsent === 'boolean') {
          setAnalyticsConsent(event.data.analyticsConsent);
        }

        if (customer) {
          setShopifyCustomer(customer);
          // GDPR: shopifyCustomer stays in-memory only (PII received passively — no localStorage)
        } else {
          // LOGOUT SYNC: Clear identity if parent sends null/undefined
          setShopifyCustomer(null);
        }

        // Mark identity as ready — triggers boot API call
        setIdentityReady(true);
      }

      // 2. Cart Updates (initial or after add-to-cart)
      if (
        event.data?.type === 'YUUME:cartUpdate' ||
        event.data?.type === 'YUUME:addToCartResponse'
      ) {
        const cart = event.data.cart || event.data.data?.cart;
        if (cart) {
          setCartCount(cart.item_count || 0);
          // Track checkout URL for embedded checkout flow
          if (cart.checkout_url) {
            setCheckoutUrl(cart.checkout_url);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Request identity and current cart status from parent
    window.parent?.postMessage({ type: 'YUUME:ready' }, '*');
    window.parent?.postMessage({ type: 'YUUME:getCart' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, [disabled]);

  // B22: Unified Boot — replaces getSessionStatus + getProfile + getConsent
  useEffect(() => {
    if (disabled || !identityReady || !sessionId) return;

    bootSession(sessionId, shopDomain, visitorId)
      .then((bootData) => {
        if (!bootData) return;

        // Session resume: server found an active session for this visitor
        if (bootData.resolvedSessionId && bootData.resolvedSessionId !== sessionId) {
          setSessionId(bootData.resolvedSessionId);
          storage.set('session_id', bootData.resolvedSessionId);
        }

        if (bootData.status) setSessionStatus(bootData.status);
        if (bootData.assignedTo) setAssignedTo(bootData.assignedTo);
        if (bootData.initialSuggestions) setInitialSuggestions(bootData.initialSuggestions);

        // Profile from server (source of truth for cross-device auto-populate)
        if (bootData.profile?.name || bootData.profile?.email) {
          storage.setProfile(bootData.profile);
          setBootProfile(bootData.profile);
        }

        // Welcome personalization
        if (bootData.profile?.name) {
          setMessages((prev) => {
            if (prev.length === 1 && prev[0].disableFeedback) {
              const firstName = bootData.profile.name.trim().split(' ')[0];
              const personalizedText = `Ciao ${firstName}! 👋 Come posso aiutarti oggi?`;
              if (prev[0].text !== personalizedText) {
                return [{ ...prev[0], text: personalizedText }];
              }
            }
            return prev;
          });
        }

        // Consent sync
        if (bootData.consent) {
          setBootConsent(bootData.consent);
          broadcastConsentChange(bootData.consent.analytics === true);
        }

        // Sync message history if available
        if (bootData.messages && bootData.messages.length > 0) {
          setMessages((prev) => {
            const serverMessages = bootData.messages;

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
      })
      .catch(() => {
        // Silently fail if boot doesn't exist yet (backward compat during rollout)
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

    socket.on('disconnect', () => {
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
  }, [identityReady, sessionId, visitorId, disabled, shopDomain]);

  // Widget Event Emitter
  const trackWidgetEvent = useCallback((eventType, properties = {}) => {
    const isTechnical = CONSENT_EXEMPT_EVENTS.has(eventType);
    if (!isTechnical && (!analyticsConsent || disabled)) return;
    if (disabled) return; // Even technical events are suppressed in preview/disabled mode
    // B23: suppress events until identity is ready — prevents null sessionId/anonId 500s
    if (!identityReady) return;

    const payload = {
      siteId: shopDomain || 'unknown', // Proxy used by middleware
      sessionId,
      source: 'widget',
      identity: { 
        anonId: visitorId || sessionId, // B22: visitorId is persistent, sessionId is fallback
        shopifyCustomerId: shopifyCustomer?.id?.toString() || undefined 
      },
      events: [{ eventType, ...properties }]
    };

    fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Widget-Token': new URLSearchParams(window.location.search).get('widgetToken') || '',
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [analyticsConsent, disabled, identityReady, shopDomain, sessionId, visitorId, shopifyCustomer]);

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
        // B22: Request new session from parent
        storage.clearSession();
        setSessionStatus('active');
        setMessages([]);
        setAssignedTo(null);
        setInitialSuggestions([]);
        window.parent?.postMessage({ type: 'YUUME:requestNewSession' }, '*');
        // Wait for parent to provide new sessionId via postMessage
        return;
      }

      // Clear initial suggestions on any explicit message
      setInitialSuggestions([]);

      setLoading(true);

      // Local Prediction: Show thinking indicator immediately.
      // Chip clicks (suggestionAction present) always show thinking since
      // chip values (e.g. "dangle") won't match Italian predictIntent patterns.
      // For regular text, predictIntent pattern-matches to set the right intent label.
      if (options.suggestionAction) {
        setIsThinking(true);
        setThinkingIntent('PRODUCT_SEARCH');
      } else {
        const predicted = predictIntent(text);
        if (predicted) {
          setIsThinking(true);
          setThinkingIntent(predicted);
        }
      }

      const userMsgId = Date.now(); // Generate ID here
      addUserMessage(options.displayText ?? text, userMsgId, options.hidden);

      try {
        const response = await sendMessage(
          text,
          currentSessionId, // Use the correct ID (current or new)
          devShopDomain || shopDomain,
          {
            customer,
            shopifyCustomer, // Pass certified identity
            anonId: visitorId,  // B22: persistent cross-session identity
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

        // Determine appropriate error message based on error type
        let errorMessage;
        if (error instanceof ChatApiError) {
          if (error.status === 0) {
            // Network error (offline, timeout, DNS failure)
            errorMessage = 'Errore di connessione. Verifica la tua connessione e riprova.';
          } else if (error.status >= 500) {
            // Server error (internal bug, overload)
            errorMessage = 'Qualcosa è andato storto. Riprova tra qualche secondo.';
          } else {
            // Other API errors
            errorMessage = 'Si è verificato un problema. Riprova.';
          }
        } else {
          errorMessage = 'Si è verificato un errore inaspettato.';
        }

        addAssistantMessage({
          type: 'text',
          message: errorMessage,
          format: 'plain',
        });
      } finally {
        setLoading(false);
      }
      
      // Telemetry
      if (!options.suggestionAction) {
        trackWidgetEvent('jarbris_message_sent', { query: text, eventData: { isChip: false } });
      }
    },
    [
      sessionId,
      loading,
      shopDomain,
      devShopDomain, // Added prop dependency
      visitorId, // B22: needed for anonId in meta
      addUserMessage,
      addAssistantMessage,
      customer,
      shopifyCustomer, // Fix stale closure: add dependency
      sessionStatus,
      setSessionStatus,
      setMessages,
      setAssignedTo,
      clearChat,
      trackWidgetEvent,
    ],
  );

  // Track session start when chat is genuinely opened and connected.
  // Fires for both 'new' and 'active' sessions — 'new' is the initial state from localStorage
  // before the boot API response resolves.
  useEffect(() => {
    const isLiveSession = sessionStatus !== 'completed' && sessionStatus !== 'abandoned';
    if (connectionStatus === 'online' && isLiveSession && messages.length <= 1) {
      // Fire and forget after delay to ensure consent state parsed
      const t = setTimeout(() => {
        trackWidgetEvent('jarbris_session_started');
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [connectionStatus, sessionStatus, messages.length, trackWidgetEvent]);

  // Centralized suggestion click handler (Chip System v2)
  // Extracts label/value and structured action from chip object.
  // - label: translated display text shown in the user bubble
  // - value: raw query/payload sent to the API for routing and search
  const handleSuggestionClick = useCallback(
    (suggestion) => {
      const queryText = suggestion.value || suggestion.label;
      const displayText = suggestion.label || suggestion.value;
      const options = {};
      if (suggestion.action) options.suggestionAction = suggestion.action;
      if (suggestion.meta) options.facetMeta = suggestion.meta;
      if (suggestion.payload) options.chipPayload = suggestion.payload;
      // Show translated label in the bubble but send raw value to the API
      if (displayText !== queryText) options.displayText = displayText;
      sendChatMessage(queryText, options);

      // Telemety tracker
      trackWidgetEvent('jarbris_message_sent', { query: queryText, eventData: { isChip: true } });
    },
    [sendChatMessage, trackWidgetEvent],
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
      } catch {
        // Feedback is best-effort, don't block UX
      }
    },
    [messages, shopDomain, sessionId],
  );

  /**
   * Resets cart state after checkout completion.
   * Called by useCheckout when payment succeeds.
   */
  const resetCart = useCallback(() => {
    setCartCount(0);
    setCheckoutUrl(null);
  }, []);

  return {
    messages,
    loading,
    shopDomain,
    connectionStatus,
    cartCount,
    checkoutUrl,
    sessionId,
    sessionStatus,
    assignedTo, // Return assignedTo
    shopifyCustomer, // Return certified identity
    visitorId, // B22: For ProfileView and consent API calls
    bootProfile, // B22: Profile from boot for ProfileView props
    bootConsent, // B22: Consent from boot for ProfileView props
    initialSuggestions, // Return initial suggestions
    sendMessage: sendChatMessage,
    handleSuggestionClick, // Centralized suggestion handler
    clearChat,
    resetCart,
    sendFeedback,
    isThinking,
    thinkingIntent,
    socketRef, // Exposed for idle nudge
    trackWidgetEvent, // Expose for external button clicks in UI (e.g. products)
  };
};
