import { motion } from "framer-motion";

/**
 * Suggestions
 * Renders a list of interactive chips to guide the user.
 */
const Suggestions = ({ suggestions, onSuggestionClick }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div
      className="yuume-suggestions"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "12px",
        padding: "0 4px",
      }}
    >
      {suggestions.map((s, idx) => (
        <motion.button
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.2 + idx * 0.05,
            ease: "easeOut",
          }}
          onClick={() => onSuggestionClick(s.value || s.label)}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "8px 14px",
            borderRadius: "100px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          whileHover={{
            background: "rgba(255, 255, 255, 0.15)",
            y: -2,
            borderColor: "rgba(255, 255, 255, 0.3)",
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
