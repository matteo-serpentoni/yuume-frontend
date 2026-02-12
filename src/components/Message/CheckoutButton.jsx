import React, { memo } from 'react';
import './CheckoutButton.css';

const CheckoutButton = memo(({ compact = false }) => {
  const handleCheckout = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const message = { type: 'YUUME:checkout', timestamp: Date.now() };

    try {
      // Invia il messaggio al parent (sicuro, non blocca popup)
      window.parent.postMessage(message, '*');
      if (window.parent !== window.top) {
        window.top.postMessage(message, '*');
      }
    } catch (err) {
      console.error('❌ Error handling checkout:', err);
    }
  };

  return (
    <button className={`yuume-checkout-btn ${compact ? 'compact' : ''}`} onClick={handleCheckout}>
      Checkout
    </button>
  );
});

export default CheckoutButton;
