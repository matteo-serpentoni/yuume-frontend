const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export class ChatApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
  }
}

export const sendMessage = async (
  message,
  sessionId,
  shopDomain,
  meta = {}
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        sessionId,
        shopDomain,
        meta: { lang: navigator.language || "it", ...meta },
      }),
    });

    if (!response.ok) {
      // 🔥 Passa lo status all'errore per gestire 410
      throw new ChatApiError(
        `Server responded with status ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error;
    }
    throw new ChatApiError("Network error or server unavailable", 0);
  }
};
