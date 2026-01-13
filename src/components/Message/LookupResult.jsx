import React from 'react';
import { motion } from 'framer-motion';

/**
 * LookupResult Component
 *
 * Shared component for displaying "Not Found" or lookup results.
 * Used by both OrderLookupForm and ReturnForm for visual consistency.
 */
const LookupResult = ({ message, onRetry }) => {
  return (
    <motion.div
      className="yuume-order-lookup-results-text"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="yuume-order-lookup-icon">🔍</div>
      <p className="yuume-order-lookup-message">{message}</p>
      <button onClick={onRetry} className="yuume-order-lookup-retry-btn">
        Riprova
      </button>
    </motion.div>
  );
};

export default LookupResult;
