import React from "react";
import { motion } from "framer-motion";
import "./CategoryCards.css";

const CategoryCard = ({ category, index, onCategoryClick }) => {
  const { title, count, image } = category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      onClick={() => onCategoryClick(title)}
      className="yuume-category-card"
      whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Category Image / Icon */}
      <div className="yuume-category-card-image-container">
        {image ? (
          <img src={image} alt={title} className="yuume-category-card-image" />
        ) : (
          <span className="yuume-category-placeholder">📁</span>
        )}
      </div>

      {/* Info */}
      <div className="yuume-category-info">
        <div className="yuume-category-name">{title}</div>
        <div className="yuume-category-count">
          {count} {count === 1 ? "prodotto" : "prodotti"}
        </div>
      </div>

      {/* Arrow Icon */}
      <div className="yuume-category-arrow">
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
    <div className="yuume-category-cards-container">
      {/* Intro Message */}
      <div className="yuume-category-intro">
        {displayMessage || "Seleziona una categoria:"}
      </div>

      {/* Cards List */}
      <div className="yuume-category-list">
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
      <div className="yuume-category-help-text">
        Clicca su una categoria per vedere i prodotti
      </div>
    </div>
  );
};

export default CategoryCards;
