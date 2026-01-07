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
    <div className="profile-view">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "12px",
          marginTop: "4px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            padding: "8px",
            marginLeft: "-8px",
            marginRight: "4px",
            display: "flex",
            alignItems: "center",
            borderRadius: "50%",
            transition: "background 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h3
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: "600",
            color: "#fff",
          }}
        >
          Il tuo Profilo
        </h3>
      </div>

      <p
        style={{
          fontSize: "11px",
          color: "rgba(255,255,255,0.5)",
          marginBottom: "10px",
          lineHeight: "1.3",
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
            paddingTop: "20px",
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
            padding: "10px 0",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "10px",
              color: "#EF4444",
            }}
          >
            <svg
              width="20"
              height="20"
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
              margin: "0 0 8px 0",
              color: "#fff",
              fontSize: "15px",
            }}
          >
            Sei sicuro?
          </h4>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "15px",
              lineHeight: "1.4",
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
                padding: "10px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: "12px",
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
                padding: "10px",
                borderRadius: "12px",
                border: "none",
                background: "#EF4444",
                color: "#fff",
                fontSize: "12px",
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
          <div style={{ marginBottom: "2px" }}>
            <label
              style={{
                display: "block",
                fontSize: "10px",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "6px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Nome Completo
            </label>
            <input
              type="text"
              className="profile-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mario Rossi"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.07)")
              }
              onBlur={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.03)")
              }
            />
          </div>

          <div style={{ marginBottom: "5px" }}>
            <label
              style={{
                display: "block",
                fontSize: "10px",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "6px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              className="profile-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mario@email.com"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.07)")
              }
              onBlur={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.03)")
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "5px",
              width: "100%",
            }}
          >
            <button
              type="submit"
              disabled={saving || message}
              style={{
                flex: "2",
                padding: "12px 10px",
                borderRadius: "12px",
                border: "none",
                background: message
                  ? message.type === "success"
                    ? "#10B981"
                    : "#EF4444"
                  : `linear-gradient(135deg, ${colors.sendButton}, color-mix(in srgb, ${colors.sendButton} 80%, black))`,
                color: "#fff",
                fontWeight: "700",
                fontSize: "13px",
                cursor: saving || message ? "default" : "pointer",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: message
                  ? "none"
                  : `0 4px 15px color-mix(in srgb, ${colors.sendButton} 30%, transparent)`,
              }}
              onMouseEnter={(e) => {
                if (!saving && !message) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = `0 8px 25px color-mix(in srgb, ${colors.sendButton} 50%, transparent)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!saving && !message) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 4px 15px color-mix(in srgb, ${colors.sendButton} 30%, transparent)`;
                }
              }}
            >
              {message
                ? message.text
                : saving
                ? "..."
                : isIdentified
                ? "Aggiorna Profilo"
                : "Salva Profilo"}
            </button>

            {isIdentified && !message && (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={saving}
                style={{
                  flex: "1",
                  padding: "12px 10px",
                  borderRadius: "12px",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  background: "rgba(239, 68, 68, 0.05)",
                  color: "#EF4444",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
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
