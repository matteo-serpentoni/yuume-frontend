import React, { useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars -- motion.div is used in JSX
import { motion, AnimatePresence } from 'framer-motion';
import './OrbBubble.css';

/**
 * OrbBubble — Reusable notification bubble for the minimized orb.
 *
 * @param {string}   message    - Text to display
 * @param {string}   icon       - Emoji or icon string
 * @param {boolean}  visible    - Whether to show the bubble
 * @param {function} onDismiss  - Called when user dismisses
 * @param {function} onClick    - Called when user clicks the bubble body
 * @param {number}   autoHideMs - Auto-dismiss timeout (default 6000ms, 0 to disable)
 */
const OrbBubble = ({
  message,
  icon = '🛒',
  visible,
  onDismiss,
  onClick,
  autoHideMs = 6000,
  themeColor,
}) => {
  const timerRef = useRef(null);

  // Auto-dismiss after timeout
  useEffect(() => {
    if (!visible || autoHideMs <= 0) return;

    timerRef.current = setTimeout(() => {
      onDismiss?.();
    }, autoHideMs);

    return () => clearTimeout(timerRef.current);
  }, [visible, autoHideMs, onDismiss]);

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (onClick) {
        onClick();
      } else {
        onDismiss?.();
      }
    },
    [onClick, onDismiss],
  );

  const handleDismiss = useCallback(
    (e) => {
      e.stopPropagation();
      onDismiss?.();
    },
    [onDismiss],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="orb-bubble"
          initial={{ opacity: 0, x: 20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={handleClick}
          style={{ '--bubble-theme-color': themeColor || 'rgb(100, 100, 255)' }}
        >
          <span className="orb-bubble__icon">{icon}</span>
          <span className="orb-bubble__text">{message}</span>
          <button
            className="orb-bubble__dismiss"
            onClick={handleDismiss}
            aria-label="Chiudi notifica"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrbBubble;
