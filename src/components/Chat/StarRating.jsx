import React, { useState } from "react";

const StarRating = ({ onRate, disabled = false }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (value) => {
    if (disabled || submitted) return;
    setRating(value);
    setSubmitted(true);
    onRate(value);
  };

  if (submitted) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "16px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          marginTop: "16px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎉</div>
        <div style={{ color: "#fff", fontWeight: "500" }}>
          Grazie per il feedback!
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        marginTop: "16px",
      }}
    >
      <div
        style={{
          color: "rgba(255, 255, 255, 0.9)",
          marginBottom: "12px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Come valuti questa conversazione?
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            style={{
              background: "none",
              border: "none",
              cursor: disabled ? "default" : "pointer",
              fontSize: "24px",
              padding: "4px",
              color:
                star <= (hover || rating)
                  ? "#FFD700"
                  : "rgba(255, 255, 255, 0.2)",
              transition: "color 0.2s, transform 0.1s",
              transform: star <= hover ? "scale(1.1)" : "scale(1)",
            }}
            onClick={() => handleRate(star)}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(rating)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
};

export default StarRating;
