import React from 'react';
import MessageBubble from './MessageBubble';

/**
 * MessageFallback
 * Discreet fallback UI for a single failed chat message.
 * Reuses the standard MessageBubble for consistency.
 */
const MessageFallback = () => {
  return (
    <MessageBubble sender="ai" className="fallback-message" timestamp={null}>
      <div
        className="message-content"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
      >
        <span style={{ fontSize: '14px', opacity: 0.6 }}>⚠️</span>
        <span style={{ opacity: 0.6 }}>Impossibile visualizzare questo contenuto</span>
      </div>
    </MessageBubble>
  );
};

export default MessageFallback;
