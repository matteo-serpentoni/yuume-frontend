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
          background: aiMessageColor,
          borderRadius: "18px 18px 18px 4px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 4,
          backdropFilter: "blur(10px)",
          width: "fit-content",
          maxWidth: "85%",
        }}
      >
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                background: "white",
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
