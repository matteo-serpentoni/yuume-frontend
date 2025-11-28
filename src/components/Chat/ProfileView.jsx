import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "../../services/chatApi";

const ProfileView = ({
  onBack,
  sessionId,
  shopDomain,
  colors = {
    header: "#667eea",
    sendButton: "#667eea",
    inputFocus: "#4CC2E9",
  },
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const data = await getProfile(sessionId, shopDomain);
    if (data) {
      setName(data.name || "");
      setEmail(data.email || "");
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateProfile(sessionId, shopDomain, { name, email });
      setSaving(false);
      setMessage({ type: "success", text: "Profilo salvato!" }); // ✅ Success message
      setTimeout(() => {
        onBack(); // Torna alla chat dopo salvataggio
      }, 1500);
    } catch (error) {
      setSaving(false);
      setMessage({ type: "error", text: "Errore durante il salvataggio." }); // ✅ Error message
      setTimeout(() => {
        setMessage(null); // ✅ Revert to normal after 3s
      }, 3000);
    }
  };

  return (
    <div
      className="profile-view"
      style={{
        padding: "20px 25px", // ✅ Optimized padding for orb fit
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box", // ✅ Ensure padding is included in width
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "10px" }} // ✅ Reduced margin
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            padding: "0",
            marginRight: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>
          Il tuo Profilo
        </h3>
      </div>

      <p
        style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.7)",
          marginBottom: "15px", // ✅ Reduced margin
          lineHeight: "1.4", // ✅ Slightly tighter line height
        }}
      >
        Inserisci i tuoi dati per ricevere un'assistenza migliore e offerte
        personalizzate.
      </p>

      {loading ? (
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            marginTop: "40px",
          }}
        >
          Caricamento...
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }} // ✅ Tighter gap
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "5px",
              }}
            >
              Nome Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mario Rossi"
              style={{
                width: "95%", // ✅ Slightly reduced width
                margin: "0 auto", // ✅ Center input
                display: "block",
                boxSizing: "border-box", // ✅ Prevent overflow
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.2)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "5px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mario@email.com"
              style={{
                width: "95%", // ✅ Slightly reduced width
                margin: "0 auto", // ✅ Center input
                display: "block",
                boxSizing: "border-box", // ✅ Prevent overflow
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.2)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving || message}
            style={{
              width: "95%", // ✅ Match input width
              margin: "10px auto 0 auto", // ✅ Center button
              display: "block",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: message
                ? message.type === "success"
                  ? "#10B981" // ✅ Green for success
                  : "#EF4444" // ✅ Red for error
                : colors.sendButton,
              color: "#fff",
              fontWeight: "600",
              cursor: saving || message ? "default" : "pointer",
              opacity: saving || message ? 1 : 1, // Keep full opacity for messages
              transition: "all 0.3s ease",
            }}
          >
            {message
              ? message.text
              : saving
              ? "Salvataggio..."
              : "Salva Profilo"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfileView;
