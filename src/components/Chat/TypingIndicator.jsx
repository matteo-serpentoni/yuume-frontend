const TypingIndicator = ({ aiMessageColor = "#a084ff" }) => {
  // Converte hex in rgba
  const hexToRgba = (hex, alpha) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(160, 132, 255, ${alpha})`;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        marginBottom: 0,
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #23243a 0%, #3a3b5a 100%)",
          borderRadius: "8px 24px 24px 24px",
          border: `1px solid ${hexToRgba(aiMessageColor, 0.3)}`,
          boxShadow: `0 4px 8px ${hexToRgba(
            aiMessageColor,
            0.15
          )}, 0 8px 20px ${hexToRgba(aiMessageColor, 0.2)}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 4,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                background: aiMessageColor,
                borderRadius: "50%",
                animation: `typing-bounce 1.4s ease-in-out infinite`,
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
