import React, { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "../../hooks/useChat";
import "../Orb/Orb.css";

import { AnimatePresence } from "framer-motion";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import { ProductDrawer } from "../Message/ProductCards";
import { OrderDetailCard } from "../Message/OrderCards";
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
}) => {
  const [view, setView] = useState("chat"); // 'chat' | 'profile'
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  const {
    messages,
    loading,
    shopDomain,
    sessionId,
    sessionStatus,
    assignedTo,
    sendMessage,
    sendFeedback,
  } = useChat(devShopDomain);

  // Group messages to handle "transforming" components (like OrderLookupForm)
  const chatBlocks = useMemo(() => {
    const blocks = [];
    const filtered = messages.filter(
      (msg) =>
        !msg.hidden &&
        !["order_detail", "ORDER_DETAIL_RESPONSE"].includes(msg.type)
    );

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
              break;
            }
          }
        }

        if (resultIndex !== -1) {
          blocks.push({ ...msg, results: filtered[resultIndex] });
          i = resultIndex; // Skip everything until the result
          continue;
        }
      }

      blocks.push(msg);
    }
    return blocks;
  }, [messages]);

  // Handle incoming order details for Drawer
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      ["order_detail", "ORDER_DETAIL_RESPONSE"].includes(lastMessage.type) &&
      lastMessage.order
    ) {
      setActiveOrder(lastMessage.order);
    }
  }, [messages]);

  return (
    <div
      className="chat-inner"
      style={{ "--chat-header-color": chatColors.header }}
    >
      <ChatHeader />

      {view === "profile" ? (
        <ProfileView
          onBack={() => setView("chat")}
          sessionId={sessionId}
          shopDomain={shopDomain}
          colors={chatColors}
        />
      ) : (
        <>
          {/* Unified container for messages and input, clipping the drawer at the very bottom edge */}
          <div
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <MessageList
              chatBlocks={chatBlocks}
              chatColors={chatColors}
              loading={loading}
              shopDomain={shopDomain}
              activeProduct={activeProduct}
              setActiveProduct={setActiveProduct}
              sendMessage={sendMessage}
              sendFeedback={sendFeedback}
            />

            {/* Conversation Ended Separator & Rating */}
            {sessionStatus === "completed" && (
              <div style={{ padding: "0 16px 24px 16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "24px 0",
                    color: "rgba(255, 255, 255, 0.4)",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background: "rgba(255, 255, 255, 0.1)",
                    }}
                  />
                  <span style={{ padding: "0 12px" }}>
                    Conversazione Terminata
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background: "rgba(255, 255, 255, 0.1)",
                    }}
                  />
                </div>

                <StarRating
                  onRate={(rating) =>
                    sendFeedback(null, rating, null, "conversation")
                  }
                />
              </div>
            )}

            <MessageInput
              onSend={(text) => {
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
              disabled={sessionStatus === "escalated" && !assignedTo} // ✅ Enable if assigned
              sendButtonColor={chatColors.sendButton}
              inputBorderColor={chatColors.inputBorder}
              inputFocusColor={chatColors.inputFocus}
              previewMode={false}
              onProfileClick={() => setView("profile")} // ✅ Passa handler
            />

            {/* Legal Disclaimer */}
            <div
              style={{
                fontSize: "10px",
                color: "rgba(255, 255, 255, 0.4)",
                textAlign: "center",
                marginTop: "8px",
                padding: "0 10px",
                lineHeight: "1.3",
                marginBottom: "8px",
              }}
            >
              Chattando accetti la{" "}
              <a
                href="/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  textDecoration: "underline",
                }}
              >
                Privacy Policy
              </a>{" "}
              e la{" "}
              <a
                href="/policies/cookie-policy"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  textDecoration: "underline",
                }}
              >
                Cookie Policy
              </a>
              .
            </div>

            {/* ✅ Portaled Drawer now sits on top of MessageInput because it's a sibling inside the relative wrapper */}
            <div
              id="yuume-drawer-portal"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 1000,
              }}
            />
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
            onMinimize && onMinimize();
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
            title={`Ordine #${activeOrder.orderNumber}`}
          >
            <OrderDetailCard order={activeOrder} theme="light" />
          </Drawer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
