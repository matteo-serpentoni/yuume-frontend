import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import './HumanThinking.css';

const PHRASES = [
  'Fammi controllare...',
  'Un attimo che guardo...',
  'Vediamo cosa trovo per te...',
  'Cerco subito informazioni...',
  'Dammi un secondo...',
  'Controllo subito...',
];

/**
 * HumanThinking
 * A more "human" alternative to simple typing dots.
 * Slides in from the left, shows a random phrase, and slides back.
 */
const HumanThinking = ({ chatColors }) => {
  const phrase = useMemo(() => PHRASES[Math.floor(Math.random() * PHRASES.length)], []);

  return (
    <motion.div
      className="human-thinking-wrapper"
      initial={{ x: -60, opacity: 0, scale: 0.85 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: -60, opacity: 0, scale: 0.95 }}
      transition={{
        type: 'spring',
        damping: 22,
        stiffness: 120,
        opacity: { duration: 0.25 },
      }}
    >
      <MessageBubble sender="assistant" type="thinking" chatColors={chatColors}>
        <div className="thinking-content">
          <span className="thinking-text">{phrase}</span>
          <div className="thinking-dots-mini">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      </MessageBubble>
    </motion.div>
  );
};

export default HumanThinking;
