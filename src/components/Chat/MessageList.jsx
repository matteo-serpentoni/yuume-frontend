import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MessageRenderer from "../Message/MessageRender";
import TypingIndicator from "./TypingIndicator";

const MessageList = ({
  messages,
  loading,
  onChipClick,
  shopDomain,
  onSupportFeedback,
  headerColor = "#a259ff", // 🆕 Colore header (opzionale per futuro uso)
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        overflowY: "auto",
        marginBottom: 12,
        scrollbarWidth: "thin",
        scrollbarColor: "#a259ff33 transparent",
        paddingRight: 18,
        position: "relative",
      }}
    >
      {/* 🆕 OPZIONALE: Header Chat (decommenta se vuoi usarlo)
      <div style={{
        background: headerColor,
        color: "#fff",
        padding: "12px 16px",
        borderRadius: "12px 12px 0 0",
        fontWeight: 600,
        marginBottom: 16
      }}>
        Chat con Yuume
      </div>
      */}

      <AnimatePresence initial={false}>
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            style={{
              display: "flex",
              width: "100%",
              marginBottom: 0,
              position: "relative",
              zIndex: 2,
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
              layout
              style={{
                display: "inline-block",
                padding: "16px 24px",
                margin: "12px 0",
                fontSize: "1rem",
                lineHeight: 1.5,
                maxWidth: "75%",
                minWidth: 48,
                wordBreak: "break-word",
                position: "relative",
                zIndex: 2,
                backdropFilter: "blur(10px)",
                borderRadius:
                  msg.sender === "user"
                    ? "24px 8px 24px 24px"
                    : "8px 24px 24px 24px",
                background:
                  msg.sender === "user"
                    ? "linear-gradient(135deg, #a084ff 0%, #6f6fff 50%, #5b4cff 100%)"
                    : "linear-gradient(135deg, #23243a 0%, #3a3b5a 100%)",
                color: msg.sender === "user" ? "#fff" : "#a084ff",
                border:
                  msg.sender === "user"
                    ? "1px solid rgba(255, 255, 255, 0.15)"
                    : "1px solid rgba(162, 89, 255, 0.3)",
                boxShadow:
                  "0 4px 8px rgba(111, 111, 255, 0.15), 0 8px 20px rgba(91, 76, 255, 0.2), 0 16px 32px rgba(160, 132, 255, 0.1)",
                textAlign: msg.sender === "user" ? "right" : "left",
              }}
            >
              <MessageRenderer
                message={msg}
                onChipClick={onChipClick}
                shopDomain={shopDomain}
                onSupportFeedback={onSupportFeedback}
              />
            </motion.div>
          </div>
        ))}
      </AnimatePresence>
      {loading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
