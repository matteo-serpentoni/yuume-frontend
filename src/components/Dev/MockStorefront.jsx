import React from "react";

const MockStorefront = ({ theme = "light" }) => {
  const isDark = theme === "dark";

  const styles = {
    container: {
      position: "fixed",
      inset: 0,
      background: isDark ? "#0f172a" : "#f8fafc",
      color: isDark ? "#f8fafc" : "#0f172a",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflowY: "auto",
      zIndex: 1,
      transition: "all 0.3s ease",
      pointerEvents: "auto",
    },
    header: {
      padding: "20px 40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
      background: isDark ? "rgba(15, 23, 42, 0.8)" : "rgba(248, 250, 252, 0.8)",
      backdropFilter: "blur(10px)",
      position: "sticky",
      top: 0,
      zIndex: 10,
    },
    logo: {
      fontSize: "24px",
      fontWeight: "800",
      letterSpacing: "-0.5px",
      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    nav: {
      display: "flex",
      gap: "24px",
      fontSize: "14px",
      fontWeight: "500",
      opacity: 0.8,
    },
    hero: {
      padding: "100px 40px",
      textAlign: "center",
      maxWidth: "1000px",
      margin: "0 auto",
    },
    heroTitle: {
      fontSize: "56px",
      fontWeight: "900",
      lineHeight: "1.1",
      marginBottom: "20px",
      letterSpacing: "-2px",
    },
    heroSubtitle: {
      fontSize: "18px",
      opacity: 0.6,
      marginBottom: "32px",
      maxWidth: "600px",
      margin: "0 auto 32px",
    },
    button: {
      padding: "12px 32px",
      background: isDark ? "#f8fafc" : "#0f172a",
      color: isDark ? "#0f172a" : "#f8fafc",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "15px",
      cursor: "pointer",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "32px",
      padding: "40px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    card: {
      background: isDark ? "#1e293b" : "#ffffff",
      borderRadius: "16px",
      overflow: "hidden",
      border: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
      boxShadow: isDark ? "none" : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    },
    cardImage: {
      height: "200px",
      background: isDark ? "#334155" : "#f1f5f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "40px",
    },
    cardContent: {
      padding: "20px",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: "8px",
    },
    cardPrice: {
      fontSize: "16px",
      fontWeight: "500",
      opacity: 0.7,
    },
  };

  const products = [
    { id: 1, name: "Premium Wireless Headphones", price: "€299", emoji: "🎧" },
    {
      id: 2,
      name: "Minimalist Mechanical Keyboard",
      price: "€159",
      emoji: "⌨️",
    },
    { id: 3, name: "Smartphone Flagship X", price: "€999", emoji: "📱" },
    { id: 4, name: "Smartwatch Ultra Pro", price: "€399", emoji: "⌚" },
    { id: 5, name: "Noise Cancelling Earbuds", price: "€199", emoji: "🫁" },
    { id: 6, name: "Laptop Studio Pro", price: "€1,899", emoji: "💻" },
  ];

  return (
    <div className="yuume-mock-storefront" style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>MOCKSTORE.</div>
        <nav style={styles.nav}>
          <span>Collezioni</span>
          <span>Novità</span>
          <span>Offerte</span>
          <span>Chi Siamo</span>
        </nav>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontSize: "20px" }}>🔍</span>
          <span style={{ fontSize: "20px" }}>🛒</span>
        </div>
      </header>

      <main>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>
            La tecnologia che definisce il futuro.
          </h1>
          <p style={styles.heroSubtitle}>
            Scopri la nostra selezione curata di gadget premium per il tuo setup
            moderno.
          </p>
          <button style={styles.button}>Acquista Ora</button>
        </div>

        <div style={styles.grid}>
          {products.map((p) => (
            <div key={p.id} style={styles.card}>
              <div style={styles.cardImage}>{p.emoji}</div>
              <div style={styles.cardContent}>
                <div style={styles.cardTitle}>{p.name}</div>
                <div style={styles.cardPrice}>{p.price}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Spazio per non coprire il widget se fisso */}
      <div style={{ height: "100px" }} />
    </div>
  );
};

export default MockStorefront;
