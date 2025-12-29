import React from "react";
import { motion } from "framer-motion";

const CategoryCard = ({ category, index, onCategoryClick }) => {
  const { title, count, image } = category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      onClick={() => onCategoryClick(title)}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "14px",
        background: "#ffffff",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        cursor: "pointer",
        border: "1px solid #f1f5f9",
        marginBottom: "8px",
        color: "#1e293b",
        boxSizing: "border-box",
      }}
      whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Category Image / Icon */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "10px",
          overflow: "hidden",
          flexShrink: 0,
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e2e8f0",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span style={{ fontSize: "20px" }}>📁</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: "2px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          {count} {count === 1 ? "prodotto" : "prodotti"}
        </div>
      </div>

      {/* Arrow Icon */}
      <div style={{ color: "#94a3b8", fontSize: "12px" }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </motion.div>
  );
};

const CategoryCards = ({ message, onCategoryClick }) => {
  const { categories = [], message: displayMessage } = message;

  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  return (
    <div
      style={{ width: "100%", pointerEvents: "auto", boxSizing: "border-box" }}
    >
      {/* Intro Message */}
      <div
        style={{
          fontSize: "14px",
          color: "white",
          marginBottom: "10px",
          lineHeight: "1.4",
          fontWeight: 500,
          textAlign: "left",
          padding: "0 4px",
        }}
      >
        {displayMessage || "Seleziona una categoria:"}
      </div>

      {/* Cards List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {categories.map((category, index) => (
          <CategoryCard
            key={category.handle || index}
            category={category}
            index={index}
            onCategoryClick={onCategoryClick}
          />
        ))}
      </div>

      {/* Help text */}
      <div
        style={{
          marginTop: "8px",
          fontSize: "11px",
          color: "rgba(255, 255, 255, 0.6)",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        Clicca su una categoria per vedere i prodotti
      </div>
    </div>
  );
};

export default CategoryCards;
