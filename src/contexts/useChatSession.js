import { useContext, createContext } from 'react';

/**
 * ChatSessionContext — stable session-level data shared across the chat subtree.
 *
 * Contains ONLY data that is stable for the entire chat session lifetime:
 * - shopDomain, sessionId, visitorId (identity)
 * - onProductAction, setActiveProduct (callbacks)
 */
export const ChatSessionContext = createContext(null);

export function useChatSession() {
  const ctx = useContext(ChatSessionContext);
  if (!ctx) throw new Error('useChatSession must be used within ChatSessionProvider');
  return ctx;
}
