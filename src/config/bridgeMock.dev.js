/**
 * Dev-only mock for the Shopify cart bridge.
 * Intercepts YUUME:addToCart messages and responds with simulated success.
 *
 * Active ONLY in development (import.meta.env.DEV).
 * Has zero impact in production — the import is tree-shaken out.
 */

if (import.meta.env.DEV) {
  window.addEventListener('message', (event) => {
    if (event.data?.type !== 'YUUME:addToCart') return;

    console.log('[DEV MOCK] Simulating add-to-cart:', {
      variantId: event.data.variantId,
      quantity: event.data.quantity,
    });

    // Simulate a short delay like a real Shopify API call
    setTimeout(() => {
      window.postMessage(
        {
          type: 'YUUME:addToCartResponse',
          success: true,
        },
        '*',
      );
    }, 600);
  });

  console.log('[DEV MOCK] Shopify cart bridge mock active');
}
