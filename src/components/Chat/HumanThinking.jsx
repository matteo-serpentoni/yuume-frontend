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
    <div className="human-thinking-container">
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
    </div>
  );
};

export default HumanThinking;
