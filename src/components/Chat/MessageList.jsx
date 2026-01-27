import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './MessageList.css';
import CategoryCards from '../Message/CategoryCards';
import ProductCards from '../Message/ProductCards';
import OrderCards from '../Message/OrderCards';
import DynamicForm from '../Message/DynamicForm';
import TextMessage from '../Message/TextMessage';
import Suggestions from '../Message/Suggestions';
import PromoCards from '../Message/PromoCards';
import ErrorBoundary from '../UI/ErrorBoundary';
import MessageFallback from './MessageFallback';
import MessageBubble from './MessageBubble';
import HumanThinking from './HumanThinking';

/**
 * MessageList
 * Handles the iterative rendering of chat messages and specialized blocks.
 */
const MessageList = ({
  chatBlocks,
  chatColors,
  loading,
  isThinking,
  thinkingIntent,
  shopDomain,
  activeProduct,
  setActiveProduct,
  activeOrder,
  setActiveOrder,
  sendMessage,
  sendFeedback,
  onImageClick,
}) => {
  const messagesAreaRef = useRef(null);
  const lastMessageRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const prevThinkingRef = useRef(isThinking);
  const prevLoadingRef = useRef(loading);

  const scrollToBottom = (behavior = 'auto') => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTo({
        top: messagesAreaRef.current.scrollHeight,
        behavior: behavior,
      });
    }
  };

  const scrollToNewMessage = (behavior = 'smooth') => {
    if (lastMessageRef.current && messagesAreaRef.current) {
      const containerHeight = messagesAreaRef.current.clientHeight;
      const messageHeight = lastMessageRef.current.offsetHeight;
      const lastBlock = chatBlocks[chatBlocks.length - 1];

      // Never scroll to top for forms or specific action-oriented intents
      // These should behave like standard messages and stay at the bottom
      const isInteraction =
        lastBlock?.type?.toLowerCase() === 'form_request' ||
        lastBlock?.detectedIntent === 'REFUND_ACTION' ||
        lastBlock?.detectedIntent === 'ORDER_TRACK_ACTION';

      // Threshold: if message is taller than 70% of the viewport AND not an interaction
      if (!isInteraction && messageHeight > containerHeight * 0.7) {
        lastMessageRef.current.scrollIntoView({
          behavior,
          block: 'start',
        });
      } else {
        scrollToBottom(behavior);
      }
    } else {
      scrollToBottom(behavior);
    }
  };

  // Autoscroll logic
  useEffect(() => {
    const lastBlock = chatBlocks[chatBlocks.length - 1];
    const lastId = lastBlock?.id;
    const justStartedThinking = isThinking && !prevThinkingRef.current;
    const justStartedLoading = loading && !prevLoadingRef.current;

    // Detect if we just stopped thinking (response arrived)
    if (lastId !== lastMessageIdRef.current) {
      if (!lastMessageIdRef.current) {
        scrollToBottom('auto');
      } else {
        // Wait for DOM to stabilize before scrolling
        const timer = setTimeout(() => {
          scrollToNewMessage('smooth');
        }, 100);
        return () => clearTimeout(timer);
      }
      lastMessageIdRef.current = lastId;
    } else if (justStartedThinking || justStartedLoading) {
      // While thinking/loading, keep it pinned strongly ONLY when we transition to these states
      scrollToBottom('auto');
    }

    // Sync refs for next render
    prevThinkingRef.current = isThinking;
    prevLoadingRef.current = loading;
  }, [chatBlocks, loading, isThinking]);

  const renderMessageContent = (msg) => {
    // 1. Category Cards
    if (msg.type?.toLowerCase() === 'category_cards') {
      return (
        <CategoryCards
          message={msg}
          onCategoryClick={(title) => sendMessage(`Mostrami i prodotti della categoria ${title}`)}
        />
      );
    }

    // 2. Product Cards
    if (msg.type?.toLowerCase() === 'product_cards') {
      return (
        <ProductCards
          message={msg}
          shopDomain={shopDomain}
          onOpen={setActiveProduct}
          onImageClick={onImageClick}
          activeProduct={activeProduct}
        />
      );
    }

    // 4. Order Details/Lists
    if (
      [
        'order_detail',
        'order_list',
        'order_cards',
        'order_detail_response',
        'order_list_response',
        'order_response',
      ].includes(msg.type?.toLowerCase())
    ) {
      return (
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
    }

    // 5.5 Promo Cards (OFFERS intent - no text, only cards)
    if (msg.type?.toLowerCase() === 'promo_cards') {
      return <PromoCards message={msg} onSearch={sendMessage} />;
    }

    // 6. Return Submitted (Final Step)
    if (msg.type?.toLowerCase() === 'return_submitted') {
      return (
        <div className="yuume-return-success-block">
          <div className="yuume-return-success-glow" />
          <div className="yuume-success-check-wrapper">
            <div className="yuume-success-check">
              <svg viewBox="0 0 52 52">
                <title>Successo</title>
                <circle cx="26" cy="26" r="25" fill="none" />
                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
          </div>
          <div className="yuume-return-success-text">
            <h4>Richiesta Ricevuta!</h4>
            <p>{msg.message}</p>
          </div>
        </div>
      );
    }

    // 7. Dynamic Form (New Engine)
    if (msg.type?.toLowerCase() === 'form_request') {
      const results = msg.results;
      const resultType = results?.type?.toLowerCase();

      // Check if we have a specialized result to show inside the form
      const hasSpecializedResult = [
        'order_detail',
        'order_list',
        'order_cards',
        'product_cards',
        'category_cards',
        'return_submitted',
      ].includes(resultType);

      return (
        <DynamicForm
          message={msg}
          onSubmit={(signal) => sendMessage(signal, { hidden: true })}
          loading={loading}
        >
          {hasSpecializedResult && renderMessageContent(results)}
        </DynamicForm>
      );
    }

    return (
      <>
        <TextMessage message={msg} />
        {msg.promos && msg.promos.length > 0 && <PromoCards message={msg} onSearch={sendMessage} />}
      </>
    );
  };

  const renderMessage = (msg) => {
    const content = renderMessageContent(msg);
    let type = 'default';

    if (msg.type?.toLowerCase() === 'category_cards') {
      type = 'category_cards';
    } else if (msg.type?.toLowerCase() === 'product_cards') {
      type = 'product_cards';
    } else if (
      [
        'order_detail',
        'order_list',
        'order_cards',
        'order_detail_response',
        'order_list_response',
        'order_response',
      ].includes(msg.type?.toLowerCase())
    ) {
      type = 'order_cards';
    } else if (msg.type?.toLowerCase() === 'return_submitted') {
      type = 'return_submitted';
    } else if (msg.type?.toLowerCase() === 'form_request') {
      type = 'form_request';
    } else if (msg.type?.toLowerCase() === 'promo_cards') {
      type = 'promo_cards';
    }

    const isStandalone = [
      'product_cards',
      'return_form',
      'return_submitted',
      'form_request',
      'promo_cards',
    ].includes(type?.toLowerCase());

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
  const isFormLoading =
    loading &&
    chatBlocks.length > 0 &&
    ['form_request', 'order_form', 'return_form', 'return_items', 'return_reason'].includes(
      chatBlocks[chatBlocks.length - 1].type,
    );

  return (
    <div
      ref={messagesAreaRef}
      className={`messages-area ${activeProduct || activeOrder ? 'yuume-drawer-active' : ''}`}
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {chatBlocks.map((msg, index) => (
          <motion.div
            key={msg.id}
            ref={index === chatBlocks.length - 1 ? lastMessageRef : null}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              opacity: { duration: 0.25 },
              y: { duration: 0.3, ease: 'easeOut' },
            }}
          >
            <ErrorBoundary fallback={<MessageFallback />}>{renderMessage(msg)}</ErrorBoundary>
          </motion.div>
        ))}

        {isThinking && !isFormLoading && (
          <motion.div
            key="thinking-indicator"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <HumanThinking chatColors={chatColors} intent={thinkingIntent} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;
