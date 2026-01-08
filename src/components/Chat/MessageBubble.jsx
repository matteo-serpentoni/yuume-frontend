import { motion } from "framer-motion";
import "./MessageBubble.css";
import { formatTime } from "../../utils/messageHelpers";
import { hexToRgb } from "../../utils/colorUtils";

/**
 * MessageBubble
 * A unified wrapper for all message types in the chat.
 * Provides the "liquid glass" look and handles sender-specific styling.
 */
const MessageBubble = ({
  children,
  sender,
  timestamp,
  type = "default",
  chatColors = {},
  className = "",
  feedback = null,
  onFeedback = null,
  showFeedback = false,
}) => {
  const isUser = sender === "user";
  const isBot = !isUser;

  // Custom styles for dynamic colors
  const bubbleStyles = {
    ...(isUser &&
      chatColors.userMessage && {
        "--user-msg-color-rgb": hexToRgb(chatColors.userMessage),
      }),
  };

  return (
    <div className={`message-bubble-wrapper ${sender} ${className}`}>
      <div
        className={`message-bubble ${sender} ${
          ["category_cards", "product_cards", "order_cards"].includes(type)
            ? "full-width"
            : "auto-width"
        }`}
        style={bubbleStyles}
      >
        <div className="message-content">
          {children}

          <div className="bubble-meta">
            {isBot && showFeedback && (
              <div className="feedback-inline">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onFeedback?.("positive")}
                  className={`feedback-btn ${
                    feedback === "positive" ? "active" : ""
                  }`}
                  title="Utile"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onFeedback?.("negative")}
                  className={`feedback-btn ${
                    feedback === "negative" ? "active" : ""
                  }`}
                  title="Non utile"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                  </svg>
                </motion.button>
              </div>
            )}
            {timestamp && (
              <span className="message-time">{formatTime(timestamp)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
