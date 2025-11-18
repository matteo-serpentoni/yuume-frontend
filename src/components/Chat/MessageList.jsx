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
  headerColor = "#a259ff",
  userMessageColor = "#a259ff",
  aiMessageColor = "#4CC2E9",
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Converte hex in rgb
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 162, g: 89, b: 255 };
  };

  // Crea gradient dinamico dal colore
  const createGradient = (color) => {
    const rgb = hexToRgb(color);
    const lighter = `rgb(${Math.min(255, rgb.r + 20)}, ${Math.min(
      255,
      rgb.g + 20
    )}, ${Math.min(255, rgb.b + 20)})`;
    const darker = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(
      0,
      rgb.g - 20
    )}, ${Math.max(0, rgb.b - 20)})`;
    return `linear-gradient(135deg, ${lighter} 0%, ${color} 50%, ${darker} 100%)`;
  };

  // Converte hex in rgba per opacity
  const hexToRgba = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

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
        scrollbarColor: `${hexToRgba(userMessageColor, 0.2)} transparent`,
        paddingRight: 18,
        position: "relative",
      }}
    >
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
                    ? createGradient(userMessageColor)
                    : "linear-gradient(135deg, #23243a 0%, #3a3b5a 100%)",
                color: msg.sender === "user" ? "#fff" : aiMessageColor,
                border:
                  msg.sender === "user"
                    ? "1px solid rgba(255, 255, 255, 0.15)"
                    : `1px solid ${hexToRgba(aiMessageColor, 0.3)}`,
                boxShadow: "none",
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
      {loading && <TypingIndicator aiMessageColor={aiMessageColor} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
