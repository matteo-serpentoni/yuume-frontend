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
  isValidOrigin: (origin, shopDomain = null) => {
    if (import.meta.env.DEV) return true; // Relaxed for local dev

    // 1. Check official whitelist (Dashboard, CDN, etc.)
    const isWhitelisted = BRIDGE_CONFIG.whitelist.some((allowed) => origin.startsWith(allowed));
    if (isWhitelisted) return true;

    // 2. Dynamic check for merchant domain
    if (shopDomain) {
      // Normalize both for comparison (ensure protocol matches)
      const normalizedDomain = shopDomain.startsWith('http') ? shopDomain : `https://${shopDomain}`;
      return origin === normalizedDomain;
    }

    // 3. Bootstrap: Allow Shopify stores to initiate handshake even if shopDomain is not yet set
    const isShopify = origin.endsWith('.myshopify.com') || origin.endsWith('.shopify.com');
    if (isShopify) return true;

    return false;
  },

  // Helper to check if message has correct prefix
  hasPrefix: (messageType) => {
    return typeof messageType === 'string' && messageType.startsWith(BRIDGE_CONFIG.prefix);
  },
};
