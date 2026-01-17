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
    'https://yuumechat.com',
    'https://widget.yuumechat.com',
    'https://yuume-widget.vercel.app',
    'https://yuume-dashboard.vercel.app',
    'https://cdn.shopify.com', // Shopify Previews
  ],

  // Prefix required for all Yuume-related messages
  prefix: 'YUUME:',

  // Helper to validate origin
  isValidOrigin: (origin, authorizedDomain = null, messageType = null) => {
    if (import.meta.env.DEV) return true; // Relaxed for local dev

    // 1. Check official whitelist (Dashboard, CDN, etc.)
    const isWhitelisted = BRIDGE_CONFIG.whitelist.some((allowed) => origin.startsWith(allowed));
    if (isWhitelisted) return true;

    // 2. Secure Check: If we have a verified domain from the backend, we lock to it
    if (authorizedDomain) {
      const normalizedDomain = authorizedDomain.startsWith('http')
        ? authorizedDomain
        : `https://${authorizedDomain}`;
      return origin === normalizedDomain;
    }

    // 3. Bootstrap Handshake: If we don't have an authorized domain yet,
    // we allow messages that follow our protocol (YUUME: prefix).
    // This allows custom domains to initiate the handshake.
    if (!authorizedDomain && messageType && BRIDGE_CONFIG.hasPrefix(messageType)) {
      return true;
    }

    return false;
  },

  // Helper to check if message has correct prefix
  hasPrefix: (messageType) => {
    return typeof messageType === 'string' && messageType.startsWith(BRIDGE_CONFIG.prefix);
  },
};
