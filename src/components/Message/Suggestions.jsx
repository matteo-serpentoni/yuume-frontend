import { motion } from 'framer-motion';
import './Suggestions.css';

/**
 * Suggestions
 * Renders a list of interactive chips to guide the user.
 */
const Suggestions = ({ suggestions, onSuggestionClick }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="yuume-suggestions">
      {suggestions.map((s, idx) => (
        <motion.button
          key={idx}
          className="yuume-suggestion-chip"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.2 + idx * 0.05,
            ease: 'easeOut',
          }}
          onClick={() => onSuggestionClick(s.value || s.label)}
          whileHover={{
            y: -2,
          }}
          whileTap={{ scale: 0.95 }}
        >
          {s.label}
        </motion.button>
      ))}
    </div>
  );
};

export default Suggestions;
