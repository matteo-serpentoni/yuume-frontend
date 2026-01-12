/**
 * Error API Service
 * Handles error reporting to the backend.
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Reports a client-side error to the backend for monitoring.
 * Silently fails if the request fails - we never want error reporting to break the widget.
 *
 * @param {Object} errorData - The error details
 * @param {string} errorData.message - Error message
 * @param {string} errorData.stack - Error stack trace
 * @param {string} errorData.componentStack - React component stack
 * @param {string} errorData.shopDomain - The merchant's shop domain
 * @param {string} errorData.userAgent - Browser user agent
 * @param {string} errorData.url - Page URL where error occurred
 */
export const reportError = async (errorData) => {
  try {
    await fetch(`${API_URL}/api/widget/log-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
    });
  } catch {
    // Silently fail - don't break anything if logging fails
  }
};
