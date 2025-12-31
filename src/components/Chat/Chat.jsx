import React, { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "../../hooks/useChat";
import "../Orb/Orb.css";

import { AnimatePresence, motion } from "framer-motion";
import TypingIndicator from "./TypingIndicator";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import ProductCards, { ProductDrawer } from "../Message/ProductCards";
import OrderCards, { OrderDetailCard } from "../Message/OrderCards";
import Drawer from "../UI/Drawer";
import CategoryCards from "../Message/CategoryCards";
import OrderLookupForm from "../Message/OrderLookupForm"; // ✅ Import
import TextMessage from "../Message/TextMessage"; // ✅ Import
import ProfileView from "./ProfileView"; // ✅ Import
import StarRating from "./StarRating"; // ✅ Import
import { formatTime } from "../../utils/messageHelpers"; // ✅ Import

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

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (view === "chat") {
      scrollToBottom();
    }
  }, [messages, loading, view]);

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

  const renderMessage = (msg) => {
    // Se il messaggio è di tipo category_cards o CATEGORY_RESPONSE
    if (msg.type === "category_cards" || msg.type === "CATEGORY_RESPONSE") {
      return (
        <div
          className={`message-bubble ${msg.sender} category-cards-bubble`}
          style={{
            background: chatColors.aiMessage,
            padding: "12px",
            borderRadius: "18px 18px 18px 4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxWidth: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <CategoryCards
            message={msg}
            onCategoryClick={(title) =>
              sendMessage(`Mostrami i prodotti della categoria ${title}`)
            }
          />
          <div className="message-time" style={{ marginTop: 4 }}>
            {formatTime(msg.timestamp)}
          </div>
        </div>
      );
    }

    // Se il messaggio è di tipo product_cards o PRODUCT_RESPONSE
    if (msg.type === "product_cards" || msg.type === "PRODUCT_RESPONSE") {
      return (
        <div
          className={`message-bubble ${msg.sender} product-cards-bubble`}
          style={{
            background: chatColors.aiMessage, // Usa il colore del bot
            padding: "12px", // Padding standard
            borderRadius: "18px 18px 18px 4px", // Stesso raggio dei messaggi bot
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxWidth: "85%", // Larghezza standard
            width: "fit-content",
          }}
        >
          <ProductCards
            message={msg}
            shopDomain={shopDomain}
            onOpen={setActiveProduct}
            activeProduct={activeProduct}
          />
          <div className="message-time" style={{ marginTop: 4 }}>
            {formatTime(msg.timestamp)}
          </div>
        </div>
      );
    }

    // Order Related Messages
    if (msg.type === "order_form") {
      const hasResults = !!msg.results;

      return (
        <div className={`message-bubble ${msg.sender} order-form-bubble`}>
          <AnimatePresence mode="wait">
            {!hasResults ? (
              <motion.div
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <OrderLookupForm
                  onSubmit={(lookupString) =>
                    sendMessage(lookupString, { hidden: true })
                  }
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
                {msg.results.type === "text" ? (
                  <div
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                      🔍
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        margin: "0 0 16px 0",
                        color: "white",
                        opacity: 0.8,
                      }}
                    >
                      {msg.results.text}
                    </p>
                    <button
                      onClick={() => sendMessage("Cerca ordine")}
                      style={{
                        background: "white",
                        color: "black",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Riprova
                    </button>
                  </div>
                ) : (
                  <OrderCards
                    message={msg.results}
                    onOrderClick={(orderNumber, email) => {
                      sendMessage(`ORDER_LOOKUP:${email}:${orderNumber}`, {
                        hidden: true,
                      });
                    }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div
            className="message-time"
            style={{ marginTop: 4, paddingLeft: 12 }}
          >
            {formatTime(msg.timestamp)}
          </div>
        </div>
      );
    }

    if (["order_detail", "order_list", "order_cards"].includes(msg.type)) {
      return (
        <div
          className={`message-bubble ${msg.sender} order-cards-bubble`}
          style={{
            background: chatColors.aiMessage,
            padding: "8px",
            borderRadius: "18px 18px 18px 4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxWidth: "85%",
            width: "fit-content",
          }}
        >
          <OrderCards
            message={msg}
            onOrderClick={(orderNumber, email) => {
              sendMessage(`ORDER_LOOKUP:${email}:${orderNumber}`, {
                hidden: true,
              });
            }}
          />
          <div className="message-time" style={{ marginTop: 4 }}>
            {formatTime(msg.timestamp)}
          </div>
        </div>
      );
    }

    const msgColor =
      msg.sender === "user" ? chatColors.userMessage : chatColors.aiMessage;

    // Messaggio normale
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
        }}
      >
        <div
          className={`message-bubble ${msg.sender}`}
          style={{
            background: msgColor,
            borderRadius:
              msg.sender === "user"
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
            position: "relative",
            marginBottom: msg.sender === "assistant" && !msg.error ? 4 : 0,
          }}
        >
          <div className="message-content">
            <TextMessage message={msg} />
          </div>
          <div
            className="message-footer"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <div className="message-time">{formatTime(msg.timestamp)}</div>
          </div>
        </div>

        {/* Feedback Buttons OUTSIDE the bubble */}
        {msg.sender === "assistant" && !msg.error && !msg.disableFeedback && (
          <div
            className="feedback-actions"
            style={{
              display: "flex",
              gap: 8,
              paddingLeft: 4,
              opacity: 0.7,
            }}
          >
            <button
              onClick={() => sendFeedback(msg.id, "positive", msg.text)}
              title="Utile"
              aria-label="Feedback positivo"
              className={msg.feedback === "positive" ? "thumb-animate" : ""}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                  msg.feedback === "positive"
                    ? "#FFFFFF"
                    : "rgba(255, 255, 255, 0.5)", // White or Transparent Gray
                transition: "all 0.2s",
                opacity: msg.feedback === "positive" ? 1 : 0.7,
                filter: "none", // Removed grayscale filter as we control color directly
              }}
              onMouseEnter={(e) => {
                if (msg.feedback !== "positive") {
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.opacity = 1;
                }
              }}
              onMouseLeave={(e) => {
                if (msg.feedback !== "positive") {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                  e.currentTarget.style.opacity = 0.7;
                }
              }}
            >
              {msg.feedback === "positive" ? (
                // Filled Thumbs Up
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              ) : (
                // Outline Thumbs Up
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              )}
            </button>
            <button
              onClick={() => sendFeedback(msg.id, "negative", msg.text)}
              title="Non utile"
              aria-label="Feedback negativo"
              className={msg.feedback === "negative" ? "thumb-animate" : ""}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                  msg.feedback === "negative"
                    ? "#FFFFFF"
                    : "rgba(255, 255, 255, 0.5)", // White or Transparent Gray
                transition: "all 0.2s",
                opacity: msg.feedback === "negative" ? 1 : 0.7,
                filter: "none",
              }}
              onMouseEnter={(e) => {
                if (msg.feedback !== "negative") {
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.opacity = 1;
                }
              }}
              onMouseLeave={(e) => {
                if (msg.feedback !== "negative") {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                  e.currentTarget.style.opacity = 0.7;
                }
              }}
            >
              {msg.feedback === "negative" ? (
                // Filled Thumbs Down
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                </svg>
              ) : (
                // Outline Thumbs Down
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

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
            <div
              className={`messages-area ${
                activeProduct ? "yuume-drawer-active" : ""
              }`}
            >
              {chatBlocks.map((msg) => (
                <div key={msg.id}>{renderMessage(msg)}</div>
              ))}

              {loading && (
                <TypingIndicator aiMessageColor={chatColors.aiMessage} />
              )}

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

              <div ref={messagesEndRef} />
            </div>

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
