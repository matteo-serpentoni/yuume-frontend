import React from "react";
import { motion } from "framer-motion";

const MessageChips = ({ chips, onChipClick }) => {
    if (!Array.isArray(chips) || chips.length === 0) {
        return null;
    }

    return (
        <div style={{
            marginTop: 12,
            display: "flex",
            gap: 8,
            flexWrap: "wrap"
        }}>
            {chips.map((chip, index) => (
                <motion.button
                    key={`${chip}-${index}`}
                    type="button"
                    onClick={() => onChipClick(chip)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: "6px 12px",
                        borderRadius: 999,
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        color: "#374151"
                    }}
                >
                    {chip}
                </motion.button>
            ))}
        </div>
    );
};

export default MessageChips;