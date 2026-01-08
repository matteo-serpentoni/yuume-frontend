import React, { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "../../hooks/useChat";
import "./Chat.css";

import { AnimatePresence } from "framer-motion";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import { ProductDrawer } from "../Message/ProductCards";
import { OrderDetailCard } from "../Message/OrderCards";
import { normalizeOrderNumber } from "../../utils/shopifyUtils";
import Drawer from "../UI/Drawer";
import ProfileView from "./ProfileView";
import StarRating from "./StarRating";

const Chat = ({
  onTyping,
  onMinimize,
  chatColors = {
    header: "#667eea",
    sendButton: "#667eea",
    userMessage: "#667eea",
    aiMessage: "#4CC2E9",
    inputBorder: "#667eea",
    inputFocus: "#4CC2E9",
  },
  devShopDomain,
  isPreview = false,
  messages: previewMessages,
  loading: previewLoading,
  sessionStatus: previewSessionStatus,
  assignedTo: previewAssignedTo,
  shopDomain: previewShopDomain,
  connectionStatus: previewConnectionStatus = "online",
}) => {
  const [view, setView] = useState("chat"); // 'chat' | 'profile'
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  // Use custom hook for live chat logic, but ONLY if NOT in preview mode
  const liveChat = useChat(null, null, { disabled: isPreview });

  // ✅ Source of truth: use host props if preview, otherwise use live hook results
  const messages = isPreview ? previewMessages || [] : liveChat.messages;
  const loading = isPreview ? previewLoading || false : liveChat.loading;
  const shopDomain = isPreview
    ? previewShopDomain || "preview-shop"
    : liveChat.shopDomain;
  const sessionId = isPreview ? "preview-session" : liveChat.sessionId;
  const sessionStatus = isPreview
    ? previewSessionStatus || "active"
    : liveChat.sessionStatus;
  const connectionStatus = isPreview
    ? previewConnectionStatus
    : liveChat.connectionStatus;
  const assignedTo = isPreview
    ? previewAssignedTo || null
    : liveChat.assignedTo;

  const sendMessage = isPreview ? () => {} : liveChat.sendMessage;
  const sendFeedback = isPreview ? () => {} : liveChat.sendFeedback;

  // Group messages to handle "transforming" components (like OrderLookupForm)
  const chatBlocks = useMemo(() => {
    const blocks = [];
    const filtered = messages.filter((msg) => !msg.hidden);

    for (let i = 0; i < filtered.length; i++) {
      const msg = filtered[i];

      // Try to merge order_form with its subsequent response
      if (msg.type === "order_form") {
        let resultIndex = -1;

        // Look ahead for the next response from assistant/ai
        // We look ahead up to 3 messages to find a result or an error
        for (let j = i + 1; j < Math.min(i + 4, filtered.length); j++) {
          const next = filtered[j];
          if (next.sender === "assistant" || next.sender === "ai") {
            const isOrderResult = [
              "order_list",
              "order_detail",
              "order_cards",
              "ORDER_LIST_RESPONSE",
              "ORDER_DETAIL_RESPONSE",
            ].includes(next.type);

            const isOrderError =
              (next.type === "text" || !next.type) &&
              next.text &&
              (next.text.toLowerCase().includes("non ho trovato") ||
                next.text.toLowerCase().includes("spiacenti") ||
                next.text.toLowerCase().includes("a questa email")); // Added context from user screenshot

            if (isOrderResult || isOrderError) {
              resultIndex = j;
              filtered[j].isResultSource = true; // Mark to skip top-level rendering
              break;
            }
          }
        }

        if (resultIndex !== -1) {
          const results = { ...filtered[resultIndex] };

          // Inherit email from the user's lookup message (somewhere between form and results)
          if (!results.email) {
            for (let k = i + 1; k < resultIndex; k++) {
              const prevMsg = filtered[k];
              if (prevMsg.text?.startsWith("ORDER_LOOKUP:")) {
                const parts = prevMsg.text.split(":");
                if (parts[1]) results.email = parts[1];
                break;
              }
            }
          }

          blocks.push({ ...msg, results });
          i = resultIndex; // Skip everything until the result
          continue;
        }
      }

      blocks.push(msg);
    }
    return blocks.filter((b) => !b.isResultSource);
  }, [messages]);

  return (
    <div
      className="chat-inner"
      style={{ "--chat-header-color": chatColors.header }}
    >
      <ChatHeader connectionStatus={connectionStatus} />

      {view === "profile" ? (
        <ProfileView
          onBack={() => setView("chat")}
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
            />

            {/* Conversation Ended Separator & Rating */}
            {sessionStatus === "completed" && (
              <div className="conversation-ended-container">
                <div className="conversation-ended-separator">
                  <div className="separator-line" />
                  <span className="separator-text">
                    Conversazione Terminata
                  </span>
                  <div className="separator-line" />
                </div>

                <StarRating
                  onRate={(rating) =>
                    sendFeedback(null, rating, null, "conversation")
                  }
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
                sessionStatus === "escalated" && !assignedTo
                  ? "Attendi l'intervento."
                  : "Scrivi qualcosa..."
              }
              connectionStatus={connectionStatus}
              disabled={sessionStatus === "escalated" && !assignedTo}
              sendButtonColor={chatColors.sendButton}
              inputBorderColor={chatColors.inputBorder}
              inputFocusColor={chatColors.inputFocus}
              previewMode={isPreview}
              onProfileClick={isPreview ? null : () => setView("profile")}
            />

            {/* Legal Disclaimer */}
            <div className="legal-disclaimer">
              Chattando accetti la{" "}
              <a
                href="/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                Privacy Policy
              </a>{" "}
              e la{" "}
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

            <div id="yuume-drawer-portal" className="drawer-portal-container" />
          </div>
        </>
      )}

      {/* Close button - Hidden in profile view */}
      {view !== "profile" && (
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
    </div>
  );
};

export default Chat;
