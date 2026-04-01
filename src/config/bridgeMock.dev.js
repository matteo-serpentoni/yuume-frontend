/**
 * Dev-only mock for the Shopify cart bridge.
 * Intercepts YUUME:addToCart and YUUME:getCheckoutUrl messages
 * and responds with simulated success.
 *
 * Active ONLY in development (import.meta.env.DEV).
 * Has zero impact in production — the import is tree-shaken out.
 */

if (import.meta.env.DEV) {
  window.addEventListener('message', (event) => {
    // Mock: Add to Cart
    if (event.data?.type === 'YUUME:addToCart') {
      console.log('[DEV MOCK] Simulating add-to-cart:', {
        variantId: event.data.variantId,
        quantity: event.data.quantity,
      });

      setTimeout(() => {
        window.postMessage(
          {
            type: 'YUUME:addToCartResponse',
            success: true,
          },
          '*',
        );
      }, 600);
    }

    // Mock: Get Checkout URL
    if (event.data?.type === 'YUUME:getCheckoutUrl') {
      console.log('[DEV MOCK] Simulating getCheckoutUrl');

      setTimeout(() => {
        window.postMessage(
          {
            type: 'YUUME:checkoutUrlResponse',
            checkoutUrl: 'https://example-store.myshopify.com/checkout',
            itemCount: 2,
          },
          '*',
        );
      }, 300);
    }
  });

  console.log('[DEV MOCK] Shopify cart bridge mock active');
}
