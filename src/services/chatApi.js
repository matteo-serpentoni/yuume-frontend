const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export class ChatApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'ChatApiError';
        this.status = status;
    }
}

export const sendMessage = async (message, sessionId, meta = {}) => {
    try {
        const getShopDomain = () => {
            // Prima prova a prenderlo dai parametri URL
            const urlParams = new URLSearchParams(window.location.search);
            const shopFromUrl = urlParams.get('shop');

            if (shopFromUrl) {
                return shopFromUrl;
            }

            // Fallback (ma non funzionerà per CORS)
            try {
                return window.parent.location.hostname;
            } catch (error) {
                return window.location.hostname;
            }
        };

        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message,
                sessionId,
                shopDomain: getShopDomain(),
                meta: { lang: navigator.language || "it", ...meta }
            })
        });

        if (!response.ok) {
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