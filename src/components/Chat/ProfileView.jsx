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
  const [isIdentified, setIsIdentified] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const data = await getProfile(sessionId, shopDomain);
    if (data) {
      setName(data.name || "");
      setEmail(data.email || "");
      setIsIdentified(!!data.isIdentified);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validazione
    if (!name.trim() || !email.trim()) {
      setMessage({ type: "error", text: "Nome ed email obbligatori." });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "Inserisci un'email valida." });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await updateProfile(sessionId, shopDomain, {
        name,
        email,
      });
      setSaving(false);
      setIsIdentified(true);
      setMessage({ type: "success", text: "Profilo salvato!" });
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error) {
      setSaving(false);
      setMessage({ type: "error", text: "Errore durante il salvataggio." });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  const handleReset = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      await updateProfile(sessionId, shopDomain, { reset: true });
      setName("");
      setEmail("");
      setIsIdentified(false);
      setSaving(false);
      setMessage({ type: "success", text: "Dati rimossi." });
      setTimeout(() => {
        setMessage(null);
      }, 2000);
    } catch (error) {
      setSaving(false);
      setMessage({ type: "error", text: "Errore durante il reset." });
    }
  };

  return (
    <div
      className="profile-view"
      style={{
        padding: "20px 25px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
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
          marginBottom: "15px",
          lineHeight: "1.4",
        }}
      >
        {isIdentified
          ? "I tuoi dati sono salvati. Puoi modificarli o rimuoverli in qualsiasi momento."
          : "Inserisci i tuoi dati per ricevere un'assistenza migliore e offerte personalizzate."}
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
      ) : showConfirm ? (
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "0 10px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "15px",
              color: "#EF4444",
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
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </div>
          <h4
            style={{
              margin: "0 0 10px 0",
              color: "#fff",
              fontSize: "16px",
            }}
          >
            Sei sicuro?
          </h4>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "25px",
              lineHeight: "1.5",
            }}
          >
            Rimuoveremo il tuo nome e la tua email. Non potrai più gestire il
            tuo profilo fino a nuova identificazione.
          </p>

          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Annulla
            </button>
            <button
              onClick={handleReset}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: "#EF4444",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Conferma
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          {/* ... inputs stay here ... */}
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
                width: "95%",
                margin: "0 auto",
                display: "block",
                boxSizing: "border-box",
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
                width: "95%",
                margin: "0 auto",
                display: "block",
                boxSizing: "border-box",
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

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "5px",
              width: "95%",
              margin: "5px auto 0 auto",
            }}
          >
            <button
              type="submit"
              disabled={saving || message}
              style={{
                flex: "1",
                padding: "14px 10px",
                borderRadius: "12px",
                border: "none",
                background: message
                  ? message.type === "success"
                    ? "#10B981"
                    : "#EF4444"
                  : colors.sendButton,
                color: "#fff",
                fontWeight: "600",
                fontSize: "13px",
                cursor: saving || message ? "default" : "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {message
                ? message.text
                : saving
                ? "..."
                : isIdentified
                ? "Modifica"
                : "Salva Profilo"}
            </button>

            {isIdentified && !message && (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={saving}
                style={{
                  flex: "1",
                  padding: "14px 10px",
                  borderRadius: "12px",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#EF4444",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                }}
              >
                Elimina
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileView;
