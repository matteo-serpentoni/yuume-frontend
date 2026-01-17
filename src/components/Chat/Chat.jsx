import { useState, useMemo, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import './Chat.css';

import { AnimatePresence } from 'framer-motion';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import { ProductDrawer } from '../Message/ProductCards';
import { OrderDetailCard } from '../Message/OrderCards';
import { normalizeOrderNumber } from '../../utils/shopifyUtils';
import Drawer from '../UI/Drawer';
import ProfileView from './ProfileView';
import StarRating from './StarRating';
import ImageLightbox from '../UI/ImageLightbox';
import Suggestions from '../Message/Suggestions';

const Chat = ({
  onTyping,
  onMinimize,
  chatColors = {
    header: '#667eea',
    sendButton: '#667eea',
    userMessage: '#667eea',
    aiMessage: '#4CC2E9',
    inputBorder: '#667eea',
    inputFocus: '#4CC2E9',
  },
  devShopDomain,
  isPreview = false,
  messages: previewMessages,
  loading: previewLoading,
  sessionStatus: previewSessionStatus,
  assignedTo: previewAssignedTo,
  shopDomain: previewShopDomain,
  connectionStatus: previewConnectionStatus = 'online',
}) => {
  const [view, setView] = useState('chat'); // 'chat' | 'profile'
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeGallery, setActiveGallery] = useState(null); // { images: [], index: 0 }

  // Use custom hook for live chat logic, but ONLY if NOT in preview mode
  const liveChat = useChat(devShopDomain, null, { disabled: isPreview });

  // ✅ Source of truth: use host props if preview, otherwise use live hook results
  const messages = isPreview ? previewMessages || [] : liveChat.messages;
  const loading = isPreview ? previewLoading || false : liveChat.loading;
  const shopDomain = isPreview ? previewShopDomain || 'preview-shop' : liveChat.shopDomain;
  const sessionId = isPreview ? 'preview-session' : liveChat.sessionId;
  const sessionStatus = isPreview ? previewSessionStatus || 'active' : liveChat.sessionStatus;
  const connectionStatus = isPreview ? previewConnectionStatus : liveChat.connectionStatus;
  const assignedTo = isPreview ? previewAssignedTo || null : liveChat.assignedTo;
  const initialSuggestions = isPreview ? [] : liveChat.initialSuggestions;

  const sendMessage = isPreview ? () => {} : liveChat.sendMessage;
  const sendFeedback = isPreview ? () => {} : liveChat.sendFeedback;

  const handleSuggestionClick = useCallback(
    (value) => {
      sendMessage(value);
    },
    [sendMessage],
  );

  // Group messages to handle "transforming" components (like OrderLookupForm)
  const chatBlocks = useMemo(() => {
    const blocks = [];
    const filtered = messages.filter((msg) => !msg.hidden);

    for (let i = 0; i < filtered.length; i++) {
      const msg = filtered[i];

      // Try to merge lookup or return forms with their subsequent response(s)
      const isForm = [
        'form_request',
        'order_form',
        'return_form',
        'return_items',
        'return_reason',
      ].some((t) => t.toLowerCase() === msg.type?.toLowerCase());

      if (isForm) {
        let lastResultIndex = -1;
        let finalResults = null;

        // Infinite lookahead: search for any sequence of results or updated forms until a USER message
        for (let j = i + 1; j < filtered.length; j++) {
          const nextMsg = filtered[j];

          // Stop if the next message is from the user (visible user intervention)
          if (nextMsg.sender === 'user') {
            break;
          }

          if (nextMsg.sender === 'assistant' || nextMsg.sender === 'ai') {
            const nextTypeLower = nextMsg.type?.toLowerCase() || '';

            const isOrderResult = [
              'order_list',
              'order_detail',
              'order_cards',
              'order_detail_response',
              'order_list_response',
              'order_response',
            ].includes(nextTypeLower);

            const isProductResult = ['product_cards', 'category_cards'].includes(nextTypeLower);
            const isFormRetry = nextTypeLower === 'form_request';
            const isReturnSuccess = nextTypeLower === 'return_submitted';

            const isResultError =
              (nextTypeLower === 'text' ||
                nextTypeLower === 'return_form' ||
                nextTypeLower === 'form_request' ||
                !nextTypeLower) &&
              (nextMsg.text || nextMsg.message || nextMsg.results) &&
              (nextMsg.text?.toLowerCase().includes('non ho trovato') ||
                nextMsg.message?.toLowerCase().includes('non ho trovato') ||
                nextMsg.results?.text?.toLowerCase().includes('non ho trovato') ||
                nextMsg.text?.toLowerCase().includes('spiacenti') ||
                nextMsg.text?.toLowerCase().includes('a questa email'));

            if (
              isOrderResult ||
              isProductResult ||
              isFormRetry ||
              isReturnSuccess ||
              isResultError
            ) {
              lastResultIndex = j;
              finalResults = nextMsg;
              filtered[j].isResultSource = true;
              // Continue looking to pick the LATEST result in the chain
              continue;
            }

            // If we found an AI message that ISN'T a result, stop merging
            break;
          }
        }

        if (lastResultIndex !== -1) {
          const results = { ...finalResults };

          // Inherit email from the user's lookup message (somewhere between form and results)
          if (!results.email && msg.type?.toLowerCase() === 'order_form') {
            for (let k = i + 1; k < lastResultIndex; k++) {
              const prevMsg = filtered[k];
              if (prevMsg.text?.startsWith('ORDER_LOOKUP:')) {
                const parts = prevMsg.text.split(':');
                if (parts[1]) results.email = parts[1];
                break;
              }
            }
          }

          blocks.push({ ...msg, results });
          i = lastResultIndex; // Skip everything consumed by the merge
          continue;
        }
      }

      blocks.push(msg);
    }
    return blocks.filter((b) => !b.isResultSource);
  }, [messages]);

  return (
    <div className="chat-inner" style={{ '--chat-header-color': chatColors.header }}>
      <ChatHeader connectionStatus={connectionStatus} />

      {view === 'profile' ? (
        <ProfileView
          onBack={() => setView('chat')}
          sessionId={sessionId}
          shopDomain={shopDomain}
          colors={chatColors}
        />
      ) : (
        <>
          <div className="chat-content-wrapper">
            <MessageList
              chatBlocks={chatBlocks}
              chatColors={chatColors}
              loading={loading}
              shopDomain={shopDomain}
              activeProduct={activeProduct}
              setActiveProduct={setActiveProduct}
              activeOrder={activeOrder}
              setActiveOrder={setActiveOrder}
              sendMessage={sendMessage}
              sendFeedback={sendFeedback}
              onImageClick={setActiveGallery}
            />

            {/* Conversation Ended Separator & Rating */}
            {sessionStatus === 'completed' && (
              <div className="conversation-ended-container">
                <div className="conversation-ended-separator">
                  <div className="separator-line" />
                  <span className="separator-text">Conversazione Terminata</span>
                  <div className="separator-line" />
                </div>

                <StarRating onRate={(rating) => sendFeedback(null, rating, null, 'conversation')} />
              </div>
            )}

            {/* Initial Suggestions (Show only at the very beginning) */}
            {initialSuggestions.length > 0 && messages.length <= 1 && (
              <div className="initial-suggestions-container">
                <Suggestions
                  suggestions={initialSuggestions}
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            )}

            <MessageInput
              onSendMessage={(text) => {
                if (!loading) {
                  sendMessage(text);
                  if (onTyping) onTyping(false);
                }
              }}
              loading={loading}
              placeholder={
                sessionStatus === 'escalated' && !assignedTo
                  ? "Attendi l'intervento."
                  : 'Scrivi qualcosa...'
              }
              connectionStatus={connectionStatus}
              disabled={sessionStatus === 'escalated' && !assignedTo}
              sendButtonColor={chatColors.sendButton}
              inputBorderColor={chatColors.inputBorder}
              inputFocusColor={chatColors.inputFocus}
              previewMode={isPreview}
              onProfileClick={isPreview ? null : () => setView('profile')}
            />

            {/* Legal Disclaimer */}
            <div className="legal-disclaimer">
              Chattando accetti la{' '}
              <a
                href="/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                Privacy Policy
              </a>{' '}
              e la{' '}
              <a
                href="/policies/cookie-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                Cookie Policy
              </a>
              .
            </div>
          </div>
        </>
      )}

      <div id="yuume-drawer-portal" className="drawer-portal-container" />

      {/* Close button - Hidden in profile view */}
      {view !== 'profile' && (
        <button
          className="close-button"
          aria-label="Riduci chat"
          onClick={(e) => {
            e.stopPropagation();
            if (!isPreview && onMinimize) onMinimize();
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {activeProduct && (
          <ProductDrawer
            product={activeProduct}
            onClose={() => setActiveProduct(null)}
            shopDomain={shopDomain}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeOrder && (
          <Drawer
            isOpen={!!activeOrder}
            onClose={() => setActiveOrder(null)}
            title={`Ordine #${normalizeOrderNumber(activeOrder.orderNumber)}`}
          >
            <OrderDetailCard order={activeOrder} theme="light" />
          </Drawer>
        )}
      </AnimatePresence>

      <ImageLightbox
        isOpen={!!activeGallery}
        images={activeGallery?.images}
        currentIndex={activeGallery?.index || 0}
        onClose={() => setActiveGallery(null)}
        onNavigate={(newIndex) => setActiveGallery({ ...activeGallery, index: newIndex })}
      />
    </div>
  );
};

export default Chat;
