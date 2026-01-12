const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export class ChatApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
  }
}

export const sendMessage = async (
  message,
  sessionId,
  shopDomain,
  meta = {},
  clientMessageId = null,
) => {
  try {
    const headers = { 'Content-Type': 'application/json' };

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        sessionId,
        shopDomain,
        customer: meta.customer, // ✅ Passa info customer se presenti nei meta
        meta: { lang: navigator.language || 'it', ...meta },
        clientMessageId, // ✅ Send client ID
        hidden: !!meta.hidden, // ✅ Send hidden flag if present
      }),
    });

    if (!response.ok) {
      // 🔥 Passa lo status all'errore per gestire 410
      throw new ChatApiError(`Server responded with status ${response.status}`, response.status);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error;
    }
    throw new ChatApiError('Network error or server unavailable', 0);
  }
};

export const getProfile = async (sessionId, shopDomain) => {
  try {
    const headers = { 'Content-Type': 'application/json' };

    const response = await fetch(
      `${API_BASE_URL}/api/chat/profile?sessionId=${sessionId}&shopDomain=${shopDomain}`,
      { headers },
    );

    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const updateProfile = async (sessionId, shopDomain, data) => {
  try {
    const headers = { 'Content-Type': 'application/json' };

    const response = await fetch(`${API_BASE_URL}/api/chat/profile`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sessionId, shopDomain, ...data }),
    });

    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getSessionStatus = async (sessionId) => {
  try {
    const headers = { 'Content-Type': 'application/json' };

    const response = await fetch(`${API_BASE_URL}/api/chat/session/${sessionId}`, {
      headers,
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
};

/**
 * submitFeedback
 * Sends user feedback (message rating) to the backend.
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers,
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) throw new Error('Failed to submit feedback');
    return await response.json();
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};
