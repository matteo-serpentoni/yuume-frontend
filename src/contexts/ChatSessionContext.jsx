import { useMemo } from 'react';
import { ChatSessionContext } from './useChatSession';

/**
 * @param {Object} props.value
 * @param {string} props.value.shopDomain
 * @param {string} props.value.sessionId
 * @param {string} props.value.visitorId
 * @param {Function} props.value.onProductAction
 * @param {Function} props.value.setActiveProduct
 */
export function ChatSessionProvider({ children, value }) {
  const ctx = useMemo(
    () => value,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      value.shopDomain,
      value.sessionId,
      value.visitorId,
      value.onProductAction,
      value.setActiveProduct,
    ],
  );
  return <ChatSessionContext.Provider value={ctx}>{children}</ChatSessionContext.Provider>;
}
