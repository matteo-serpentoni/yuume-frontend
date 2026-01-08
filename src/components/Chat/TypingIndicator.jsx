import { memo } from "react";
import MessageBubble from "./MessageBubble";
import "./TypingIndicator.css";

/**
 * TypingIndicator
 * Uses the unified MessageBubble to show the "writing" state.
 */
const TypingIndicator = memo(({ aiMessageColor }) => {
  return (
    <MessageBubble sender="assistant" type="typing">
      <div className="typing-dots" aria-label="L'assistente sta scrivendo">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </MessageBubble>
  );
});

export default TypingIndicator;
