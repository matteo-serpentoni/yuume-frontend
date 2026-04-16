import React, { useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import './ConfirmDialog.css';

/**
 * Generic reusable confirmation dialog.
 * Overlays within its relative parent (parent should have position: relative).
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls visibility
 * @param {string} props.title - Dialog title
 * @param {string|React.ReactNode} props.message - Descriptive text
 * @param {string} props.confirmText - Text for the confirm button
 * @param {string} props.cancelText - Text for the cancel button
 * @param {Function} props.onConfirm - Callback when confirmed
 * @param {Function} props.onCancel - Callback when cancelled
 */
const ConfirmDialog = ({
  isOpen,
  title = 'Sei sicuro?',
  message,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef(null);

  // Trap focus & handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="jarbris-confirm-dialog-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel} // Clicking overlay cancels
        >
          <motion.div
            ref={dialogRef}
            className="jarbris-confirm-dialog"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} // Prevent overlay click from closing
            role="dialog"
            aria-modal="true"
            aria-labelledby="jarbris-confirm-title"
          >
            <h4 id="jarbris-confirm-title" className="jarbris-confirm-title">
              {title}
            </h4>
            <p className="jarbris-confirm-message">{message}</p>

            <div className="jarbris-confirm-actions">
              <button type="button" className="jarbris-confirm-btn cancel" onClick={onCancel}>
                {cancelText}
              </button>
              <button type="button" className="jarbris-confirm-btn confirm" onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
