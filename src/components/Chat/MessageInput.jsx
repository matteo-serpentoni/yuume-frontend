import React, { useState } from "react";

const MessageInput = ({ onSend, loading, placeholder = "Scrivi un messaggio…" }) => {
    const [input, setInput] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        onSend(input.trim());
        setInput("");
    };

    return (
        <form onSubmit={handleSubmit} style={{
            display: "flex",
            width: "95%",
            alignItems: "center",
            gap: 8,
            maxHeight: 40
        }}>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={loading ? "Attendere risposta…" : placeholder}
                disabled={loading}
                maxLength={2000}
                style={{
                    flex: 1,
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: "2px solid rgba(162, 89, 255, 0.2)",
                    outline: "none",
                    background: "rgba(35, 36, 58, 0.9)",
                    backdropFilter: "blur(10px)",
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(35, 36, 58, 0.2)"
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = "rgba(162, 89, 255, 0.6)";
                    e.target.style.transform = "translateY(-1px)";
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = "rgba(162, 89, 255, 0.2)";
                    e.target.style.transform = "translateY(0)";
                }}
            />
            <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                    background: loading || !input.trim()
                        ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                        : "linear-gradient(135deg, #a259ff 0%, #7c3aed 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 20,
                    padding: "8px 20px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    fontFamily: "inherit",
                    opacity: loading || !input.trim() ? 0.6 : 1
                }}
            >
                Invia
            </button>
        </form>
    );
};

export default MessageInput;