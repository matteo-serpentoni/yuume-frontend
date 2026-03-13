import React, { memo } from 'react';
// eslint-disable-next-line no-unused-vars -- motion.div used in JSX
import { motion } from 'framer-motion';
import { CHIP_ICON_MAP } from '../UI/chipIconMap';
import './Suggestions.css';

/**
 * Suggestions
 * Renders a list of interactive chips to guide the user.
 * Chip System v2: renders SVG icons when chip has an `icon` field.
 */
const Suggestions = memo(({ suggestions, onSuggestionClick }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="yuume-suggestions">
      {suggestions.map((s, idx) => {
        const IconComponent = s.icon ? CHIP_ICON_MAP[s.icon] : null;

        return (
          <motion.button
            key={idx}
            className={`yuume-suggestion-chip ${s.variant || ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.2 + idx * 0.05,
              ease: 'easeOut',
            }}
            onClick={() => onSuggestionClick(s)}
            aria-label={`Suggerimento: ${s.label}`}
            whileHover={{
              y: -2,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {IconComponent && <IconComponent />}
            {s.label}
          </motion.button>
        );
      })}
    </div>
  );
});

export default Suggestions;

