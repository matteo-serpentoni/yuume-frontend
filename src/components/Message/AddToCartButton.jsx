import React, { useRef, useEffect, memo } from 'react';
import { extractVariantId } from '../../utils/shopifyUtils';
import './AddToCartButton.css';

import { BRIDGE_CONFIG } from '../../config/bridge';

const AddToCartButton = memo(
  ({
    variantId,
    shopDomain,
    quantity = 1,
    onSuccess,
    onError,
    onAnimationComplete,
    compact = false,
  }) => {
    const buttonRef = useRef(null);

    const addToCart = async () => {
      try {
        const numericVariantId = extractVariantId(variantId);

        if (!numericVariantId) {
          throw new Error('Variant ID non valido');
        }

        if (!shopDomain) {
          console.error('ERRORE: shopDomain non disponibile!');
          throw new Error('Shop domain non disponibile');
        }

        // Invece di fare la fetch, invia un messaggio al parent
        window.parent.postMessage(
          {
            type: 'YUUME:addToCart',
            variantId: numericVariantId,
            quantity: quantity,
          },
          '*',
        );

        // Ascolta la risposta dal parent
        const handleResponse = (event) => {
          if (!BRIDGE_CONFIG.isValidOrigin(event.origin, null, event.data?.type)) return;

          if (event.data.type === 'YUUME:addToCartResponse') {
            window.removeEventListener('message', handleResponse);

            if (event.data.success) {
              if (onSuccess) onSuccess(event.data.data);
            } else {
              console.error('❌ Errore aggiunta al carrello:', event.data.error);
              if (onError) onError(new Error(event.data.error));
            }
          }
        };

        window.addEventListener('message', handleResponse);

        // Timeout dopo 5 secondi
        setTimeout(() => {
          window.removeEventListener('message', handleResponse);
        }, 5000);
      } catch (error) {
        console.error('Errore aggiunta al carrello:', error);
        if (onError) onError(error);
      }
    };

    useEffect(() => {
      const button = buttonRef.current;
      if (!button) return;

      const handlePointerDown = (e) => {
        if (button.classList.contains('active')) {
          return;
        }
        button.style.setProperty('--background-scale', '0.97');
        setTimeout(() => {
          if (!button.classList.contains('active')) {
            button.style.setProperty('--background-scale', '1');
          }
        }, 150);
      };

      const handleClick = async (e) => {
        e.preventDefault();
        if (button.classList.contains('active')) {
          return;
        }

        // Chiamata API Shopify
        await addToCart();

        button.classList.add('active');

        // Simulazione animazioni GSAP con CSS transitions e timeouts
        // Background scale
        button.style.setProperty('--background-scale', '0.97');
        setTimeout(() => {
          button.style.setProperty('--background-scale', '1');
        }, 275);

        // Morph animation (the "hole" effect) - PARTE SUBITO (effetto pressione)
        const morphPath = button.querySelector('.morph path');
        if (morphPath) {
          setTimeout(() => {
            morphPath.style.transition = 'd 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            morphPath.setAttribute(
              'd',
              'M0 12C6 12 20 10 32 0C43.9024 9.99999 58 12 64 12V13H0V12Z',
            );
          }, 0);
          setTimeout(() => {
            morphPath.style.transition = 'd 0.15s ease-in';
            morphPath.setAttribute('d', 'M0 12C6 12 17 12 32 12C47.9024 12 58 12 64 12V13H0V12Z');
          }, 250);
        }

        // Package animation - PARTE DOPO 200ms invece di 150ms (rallentato per effetto pressione)
        setTimeout(() => {
          button.style.setProperty('--package-scale', '1');
          button.style.setProperty('--package-y', '-42px');
          button.style.setProperty('--cart-x', '0px');
          button.style.setProperty('--cart-scale', '1');
        }, 200);

        setTimeout(() => {
          button.style.setProperty('--package-y', '-40px');
        }, 550);

        setTimeout(() => {
          button.style.setProperty('--package-y', '16px');
          button.style.setProperty('--package-scale', '0.9');
        }, 850);

        setTimeout(() => {
          button.style.setProperty('--package-scale', '0');
        }, 1100);

        // Package second reveal
        setTimeout(() => {
          button.style.setProperty('--package-second-y', '0px');
        }, 985);

        // Text fade
        button.style.setProperty('--text-o', '0');

        // Cart animation
        setTimeout(() => {
          button.style.setProperty('--cart-clip', '12px');
          button.style.setProperty('--cart-clip-x', '3px');
        }, 1050);

        setTimeout(() => {
          button.style.setProperty('--cart-y', '2px');
        }, 1110);

        setTimeout(() => {
          button.style.setProperty('--cart-tick-offset', '0px');
          button.style.setProperty('--cart-y', '0px');
        }, 1210);

        setTimeout(() => {
          button.style.setProperty('--cart-x', '52px');
          button.style.setProperty('--cart-rotate', '-15deg');
        }, 1410);

        setTimeout(() => {
          button.style.setProperty('--cart-x', '104px');
          button.style.setProperty('--cart-rotate', '0deg');
          button.style.overflow = 'hidden';
        }, 1610);

        setTimeout(() => {
          // Disabilita le transizioni per il reset istantaneo
          const cart = button.querySelector('.cart');
          cart.style.transition = 'none';

          // Nascondi e resetta tutto istantaneamente
          button.style.setProperty('--cart-opacity', '0');
          button.style.setProperty('--text-o', '0');
          button.style.setProperty('--text-x', '0px');
          button.style.setProperty('--cart-x', compact ? '-90px' : '-104px');
          button.style.setProperty('--cart-rotate', '0deg');
          button.style.setProperty('--cart-scale', '0.75');
          button.style.setProperty('--package-y', '-16px');
          button.style.setProperty('--package-scale', '0');
          button.style.setProperty('--package-second-y', '24px');
          button.style.setProperty('--cart-clip', '0px');
          button.style.setProperty('--cart-clip-x', '0px');
          button.style.setProperty('--cart-tick-offset', '10px');
          button.style.setProperty('--background-scale', '1');

          // Forza il reflow per applicare le modifiche
          void cart.offsetHeight;

          // Riabilita le transizioni
          cart.style.transition = '';
        }, 1810);

        setTimeout(() => {
          // Mostra e anima da sinistra
          const resetCartX = compact ? '-38px' : '-48px';
          const resetTextX = compact ? '6px' : '12px';

          button.style.setProperty('--cart-opacity', '1');
          button.style.setProperty('--cart-x', resetCartX);
          button.style.setProperty('--text-o', '1');
          button.style.setProperty('--text-x', resetTextX);
          button.style.overflow = '';
          button.classList.remove('active');

          // ✅ Signal animation completion
          if (onAnimationComplete) onAnimationComplete();
        }, 1820);
      };

      button.addEventListener('pointerdown', handlePointerDown);
      button.addEventListener('click', handleClick);

      return () => {
        button.removeEventListener('pointerdown', handlePointerDown);
        button.removeEventListener('click', handleClick);
      };
    }, [variantId, quantity, onSuccess, onError]);

    return (
      <button className={`add-to-cart ${compact ? 'yuume-add-to-cart-btn' : ''}`} ref={buttonRef}>
        <span>Add to cart</span>
        <svg className="morph" viewBox="0 0 64 13">
          <path d="M0 12C6 12 17 12 32 12C47.9024 12 58 12 64 12V13H0V12Z" />
        </svg>
        <div className="package">
          <svg className="first" viewBox="0 0 24 24">
            <path d="M5 3L5 20L19 20L19 3L5 3Z" />
            <rect x="4" y="10" width="16" height="2" />
            <rect x="11" y="3" width="2" height="17" />
          </svg>
          <svg className="second" viewBox="0 0 24 24">
            <path d="M5 3L5 20L19 20L19 3L5 3Z" />
            <rect x="4" y="10" width="16" height="2" />
            <rect x="11" y="3" width="2" height="17" />
          </svg>
        </div>
        <div className="cart">
          <svg viewBox="0 0 36 26">
            <path d="M1 2.5H6L10 18.5H25.5L28.5 7.5L7.5 7.5" className="shape" />
            <path
              d="M11.5 25C12.6046 25 13.5 24.1046 13.5 23C13.5 21.8954 12.6046 21 11.5 21C10.3954 21 9.5 21.8954 9.5 23C9.5 24.1046 10.3954 25 11.5 25Z"
              className="wheel"
            />
            <path
              d="M24 25C25.1046 25 26 24.1046 26 23C26 21.8954 25.1046 21 24 21C22.8954 21 22 21.8954 22 23C22 24.1046 22.8954 25 24 25Z"
              className="wheel"
            />
            <path d="M14.5 13.5L16.5 15.5L21.5 10.5" className="tick" />
          </svg>
        </div>
      </button>
    );
  },
);

export default AddToCartButton;
