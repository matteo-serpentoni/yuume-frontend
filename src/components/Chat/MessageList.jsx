import React, { useRef, useEffect } from "react";
import TypingIndicator from "./TypingIndicator";
import CategoryCards from "../Message/CategoryCards";
import ProductCards from "../Message/ProductCards";
import OrderCards from "../Message/OrderCards";
import OrderLookupForm from "../Message/OrderLookupForm";
import TextMessage from "../Message/TextMessage";
import { formatTime } from "../../utils/messageHelpers";
import { AnimatePresence, motion } from "framer-motion";

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
  sendMessage,
  sendFeedback,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatBlocks, loading]);

  const renderMessage = (msg) => {
    // 1. Category Cards
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

    // 2. Product Cards
    if (msg.type === "product_cards" || msg.type === "PRODUCT_RESPONSE") {
      return (
        <div
          className={`message-bubble ${msg.sender} product-cards-bubble`}
          style={{
            background: chatColors.aiMessage,
            padding: "12px",
            borderRadius: "18px 18px 18px 4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxWidth: "85%",
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

    // 3. Order Lookup Form (with results)
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

    // 4. Order Details/Lists
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

    // 5. Standard Message
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

        {/* Feedback Buttons */}
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
                    : "rgba(255, 255, 255, 0.5)",
                transition: "all 0.2s",
                opacity: msg.feedback === "positive" ? 1 : 0.7,
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
                    : "rgba(255, 255, 255, 0.5)",
                transition: "all 0.2s",
                opacity: msg.feedback === "negative" ? 1 : 0.7,
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
      className={`messages-area ${activeProduct ? "yuume-drawer-active" : ""}`}
    >
      {chatBlocks.map((msg) => (
        <div key={msg.id}>{renderMessage(msg)}</div>
      ))}

      {loading && <TypingIndicator aiMessageColor={chatColors.aiMessage} />}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
