import { useState } from "react";

const SupportMessage = ({ message, onFeedback }) => {
    const [feedbackGiven, setFeedbackGiven] = useState(() => {
        // Controlla se feedback già dato per questo messaggio
        const key = `feedback_${message.id || message.timestamp}`;
        return sessionStorage.getItem(key) === 'true';
    });

    const handleFeedback = (isPositive) => {
        const key = `feedback_${message.id || message.timestamp}`;
        sessionStorage.setItem(key, 'true');
        setFeedbackGiven(true);
        onFeedback(isPositive);
    };

    return (
        <>
            {message.title && (
                <div style={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8
                }}>
                    {message.title}
                </div>
            )}

            <div style={{ lineHeight: 1.6, marginBottom: 12 }}>
                {message.message}
            </div>

            {message.ask_feedback && !feedbackGiven && (
                <div style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 12,
                    alignItems: "center"
                }}>
                    <span style={{ fontSize: "0.9em", opacity: 0.8 }}>
                        La risposta è stata utile?
                    </span>
                    <button
                        onClick={() => handleFeedback(true)}
                        style={{
                            background: "transparent",
                            border: "1px solid rgba(162, 89, 255, 0.3)",
                            borderRadius: 8,
                            padding: "8px 16px",
                            cursor: "pointer",
                            fontSize: "1.2em",
                            transition: "all 0.2s"
                        }}
                    >
                        👍
                    </button>
                    <button
                        onClick={() => handleFeedback(false)}
                        style={{
                            background: "transparent",
                            border: "1px solid rgba(162, 89, 255, 0.3)",
                            borderRadius: 8,
                            padding: "8px 16px",
                            cursor: "pointer",
                            fontSize: "1.2em",
                            transition: "all 0.2s"
                        }}
                    >
                        👎
                    </button>
                </div>
            )}
        </>
    );
};

export default SupportMessage;