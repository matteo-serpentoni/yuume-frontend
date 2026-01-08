import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './MessageList.css';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import CategoryCards from '../Message/CategoryCards';
import ProductCards from '../Message/ProductCards';
import OrderCards from '../Message/OrderCards';
import OrderLookupForm from '../Message/OrderLookupForm';
import TextMessage from '../Message/TextMessage';
import Suggestions from '../Message/Suggestions';
import { formatTime } from '../../utils/messageHelpers';

/**
 * MessageList
 * Handles the iterative rendering of chat messages and specialized blocks.
 */
const MessageList = ({
  chatBlocks,
  chatColors,
  loading,
  shopDomain,
  activeProduct,
  setActiveProduct,
  activeOrder,
  setActiveOrder,
  sendMessage,
  sendFeedback,
}) => {
  const messagesAreaRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  const scrollToBottom = (behavior = 'auto') => {
    if (messagesAreaRef.current) {
      // Use scrollTo with scrollTop for maximum control
      // This avoids triggering browser-level "scroll-into-view" jumps
      messagesAreaRef.current.scrollTo({
        top: messagesAreaRef.current.scrollHeight,
        behavior: behavior,
      });
    }
  };

  // Autoscroll logic
  useEffect(() => {
    const lastBlock = chatBlocks[chatBlocks.length - 1];
    const lastId = lastBlock?.id;

    if (loading || lastId !== lastMessageIdRef.current) {
      // Use "smooth" only if it's a new message, "auto" for first load to avoid flicker
      scrollToBottom(lastMessageIdRef.current ? 'smooth' : 'auto');
      lastMessageIdRef.current = lastId;
    }
  }, [chatBlocks, loading]);

  const renderMessage = (msg) => {
    let content = null;
    let type = 'default';

    // 1. Category Cards
    if (msg.type === 'category_cards' || msg.type === 'CATEGORY_RESPONSE') {
      type = 'category_cards';
      content = (
        <CategoryCards
          message={msg}
          onCategoryClick={(title) => sendMessage(`Mostrami i prodotti della categoria ${title}`)}
        />
      );
    }
    // 2. Product Cards
    else if (msg.type === 'product_cards' || msg.type === 'PRODUCT_RESPONSE') {
      type = 'product_cards';
      content = (
        <ProductCards
          message={msg}
          shopDomain={shopDomain}
          onOpen={setActiveProduct}
          activeProduct={activeProduct}
        />
      );
    }
    // 3. Order Lookup Form (with results)
    else if (msg.type === 'order_form' || msg.type === 'ORDER_FORM_REQUEST') {
      type = 'order_form';
      const hasResults = !!msg.results;

      content = (
        <AnimatePresence mode="wait">
          {!hasResults ? (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <OrderLookupForm
                onSubmit={(lookupString) => sendMessage(lookupString, { hidden: true })}
                isLoading={loading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.results.type === 'text' ? (
                <div className="yuume-order-lookup-results-text">
                  <div className="yuume-order-lookup-icon">🔍</div>
                  <p className="yuume-order-lookup-message">{msg.results.text}</p>
                  <button
                    onClick={() => sendMessage('Cerca ordine')}
                    className="yuume-order-lookup-retry-btn"
                  >
                    Riprova
                  </button>
                </div>
              ) : (
                <OrderCards
                  message={msg.results}
                  onOrderClick={(order, email) => {
                    if (typeof order === 'object') {
                      setActiveOrder(order);
                    } else {
                      sendMessage(`ORDER_LOOKUP:${email}:${order}`, {
                        hidden: true,
                      });
                    }
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      );
    }
    // 4. Order Details/Lists
    else if (
      ['order_detail', 'order_list', 'order_cards'].includes(msg.type) ||
      ['ORDER_DETAIL_RESPONSE', 'ORDER_LIST_RESPONSE', 'ORDER_RESPONSE'].includes(msg.type)
    ) {
      type = 'order_cards';
      content = (
        <OrderCards
          message={msg}
          onOrderClick={(order, email) => {
            if (typeof order === 'object') {
              setActiveOrder(order);
            } else {
              sendMessage(`ORDER_LOOKUP:${email}:${order}`, {
                hidden: true,
              });
            }
          }}
        />
      );
    } else {
      content = <TextMessage message={msg} />;
    }

    const isStandalone = ['product_cards'].includes(type);

    return (
      <div className={`yuume-message-block ${isStandalone ? 'standalone' : ''}`}>
        {!isStandalone ? (
          <MessageBubble
            sender={msg.sender}
            timestamp={msg.timestamp}
            chatColors={chatColors}
            type={type}
            feedback={msg.feedback}
            onFeedback={(type) => sendFeedback(msg.id, type, msg.text)}
            showFeedback={msg.sender === 'assistant' && !msg.error && !msg.disableFeedback}
          >
            {content}
          </MessageBubble>
        ) : (
          <div className="yuume-standalone-content">
            {content}
            {/* Timestamp removed to save space for products */}
          </div>
        )}

        {/* Suggestion Chips - External to Bubble */}
        {msg.suggestions && msg.suggestions.length > 0 && (
          <Suggestions
            suggestions={msg.suggestions}
            onSuggestionClick={(value) => sendMessage(value)}
          />
        )}
      </div>
    );
  };

  // Determine if we should show the global typing indicator.
  // We hide it if an order lookup is active via the form, as the form shows its own loader.
  const isOrderLookupLoading =
    loading &&
    chatBlocks.length > 0 &&
    chatBlocks[chatBlocks.length - 1].type === 'order_form' &&
    !chatBlocks[chatBlocks.length - 1].results;

  return (
    <div
      ref={messagesAreaRef}
      className={`messages-area ${activeProduct || activeOrder ? 'yuume-drawer-active' : ''}`}
    >
      {chatBlocks.map((msg) => (
        <div key={msg.id}>{renderMessage(msg)}</div>
      ))}

      {loading && !isOrderLookupLoading && (
        <TypingIndicator aiMessageColor={chatColors.aiMessage} />
      )}
    </div>
  );
};

export default MessageList;
