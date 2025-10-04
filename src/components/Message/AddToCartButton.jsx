import { useState } from 'react';
import './AddToCartButton.css';

export default function AddToCartButton({
    variantId,
    productName,
    onAddToCart,
    theme = 'light'
}) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = async () => {
        if (isAnimating) return;

        setIsAnimating(true);

        // Callback dopo 400ms (quando il prodotto entra nel carrello)
        if (onAddToCart) {
            setTimeout(() => {
                onAddToCart(variantId, productName);
            }, 400);
        }

        // Reset dopo animazione completa
        setTimeout(() => {
            setIsAnimating(false);
        }, 2500);
    };

    return (
        <button
            className={`cart-button ${isAnimating ? 'animating' : ''} ${theme === 'dark' ? 'dark' : ''}`}
            onClick={handleClick}
            disabled={isAnimating}
        >
            <span className="button-text">Add to cart</span>

            <div className="product-wrapper">
                <svg className="product" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
            </div>

            <div className="cart-wrapper">
                <svg className="cart" viewBox="0 0 36 26" xmlns="http://www.w3.org/2000/svg">
                    <path className="cart-outline" d="M1 2.5H6L10 18.5H25.5L28.5 7.5H7.5" />
                    <circle className="wheel" cx="11.5" cy="23" r="2" />
                    <circle className="wheel" cx="24" cy="23" r="2" />
                </svg>
                <svg className="checkmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
            </div>
        </button>
    );
}