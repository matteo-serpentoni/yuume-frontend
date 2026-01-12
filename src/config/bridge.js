/**
 * Iframe Bridge Configuration
 * Defines security parameters for postMessage communication.
 */

export const BRIDGE_CONFIG = {
  // Allowed origins for incoming messages
  // In production, this should only include the merchant's domain and official previews
  whitelist: [
    'http://localhost:5173', // Local Dev
    'http://localhost:5001', // Local API
    'https://cdn.shopify.com', // Shopify Previews
  ],

  // Prefix required for all Yuume-related messages
  prefix: 'YUUME:',

  // Helper to validate origin
  isValidOrigin: (origin) => {
    if (import.meta.env.DEV) return true; // Relaxed for local dev
    return BRIDGE_CONFIG.whitelist.some((allowed) => origin.startsWith(allowed));
  },

  // Helper to check if message has correct prefix
  hasPrefix: (messageType) => {
    return typeof messageType === 'string' && messageType.startsWith(BRIDGE_CONFIG.prefix);
  },
};
