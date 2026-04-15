import React, { memo, useState, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars -- motion.div used in JSX
import { motion } from 'framer-motion';
import AddToCartButton from './AddToCartButton';
import SmartBadges from './SmartBadges';
import MessageBubble from '../Chat/MessageBubble';
import { formatPrice } from '../../utils/messageHelpers';
import { normalizeStorefrontProduct } from '../../utils/shopifyUtils';
import './ProductCards.css';
import TextMessage from './TextMessage';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  ExternalLinkIcon,
  InfoIcon,
  ImagePlaceholderIcon,
} from '../UI/Icons';

// Re-export ProductDrawer from ProductSheet for backward-compatible imports in Chat.jsx
export { default as ProductDrawer } from './ProductSheet';



const ProductCard = memo(
  ({ product, index, onOpen, onImageClick, shopDomain, onProductAction }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // 2c: Memoize normalization — normalizeStorefrontProduct is a non-trivial transform
    // and ProductCard re-renders when the parent carousel re-renders (scroll events).
    const normalizedProduct = useMemo(
      () => normalizeStorefrontProduct(product),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [product.id || product.productId],
    );

    const {
      primaryImage: image,
      images: allImages,
      isAvailable,
      hasVariants,
      name,
      description,
      productType,
      vendor,
      price,
      compareAtPrice,
      discountPercentage,
      discountCode,
      isAutomatic,
      currency,
      variants,
      url,
      totalInventory,
    } = normalizedProduct;

    const toggleFlip = (e) => {
      e.stopPropagation();
      setIsFlipped(!isFlipped);
    };

    // Ensure images is always a non-empty array for the gallery
    const galleryImages = allImages && allImages.length > 0 ? allImages : image ? [image] : [];

    return (
      <div className="yuume-product-card-perspective">
        <motion.div
          className={`yuume-product-card-minimal ${isFlipped ? 'is-flipped' : ''} clickable`}
          role="button"
          tabIndex={0}
          aria-label={`Visualizza dettagli per ${name}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            rotateY: isFlipped ? 180 : 0,
          }}
          whileHover={!isFlipped ? { y: -4, transition: { duration: 0.2 } } : {}}
          transition={{
            opacity: { delay: index * 0.1, duration: 0.6 },
            y: { delay: index * 0.1, duration: 0.6 },
            rotateY: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          }}
          style={{ transformStyle: 'preserve-3d' }}
          onClick={!isFlipped && hasVariants ? () => onOpen(product) : undefined}
          onKeyDown={(e) => {
            if (!isFlipped && hasVariants && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onOpen(product);
            }
          }}
        >
          {/* --- FRONT SIDE --- */}
          <div className="yuume-product-side yuume-card-front">
            <div
              className={`yuume-product-image-container ${!image ? 'no-image' : ''}`}
              role={image ? 'button' : 'img'}
              tabIndex={image ? 0 : -1}
              aria-label={image ? 'Ingrandisci immagine' : 'Immagine non disponibile'}
              onClick={(e) => {
                e.stopPropagation();
                if (!image) return;
                onImageClick &&
                  onImageClick({
                    images: galleryImages,
                    index: 0,
                    product: product,
                  });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!image) return;
                  onImageClick &&
                    onImageClick({
                      images: galleryImages,
                      index: 0,
                      product: product,
                    });
                }
              }}
            >
              {image ? (
                <img src={image.url || image} alt={product.name} loading="lazy" />
              ) : (
                <div className="yuume-product-placeholder">
                  <ImagePlaceholderIcon size={32} />
                </div>
              )}
              {(discountCode || isAutomatic || discountPercentage > 0) && (
                <div className="yuume-product-discount-badge">
                  {discountCode
                    ? `SCONTO: ${discountCode}`
                    : discountPercentage > 0
                      ? `-${discountPercentage}%`
                      : 'OFFERTA'}
                </div>
              )}
              {isAvailable && (
                <div className="yuume-stock-status-badge-container">
                  {totalInventory > 0 && totalInventory <= 10 ? (
                    <span className="yuume-stock-urgency-badge">Solo {totalInventory} rimasti</span>
                  ) : (
                    <span className="yuume-stock-status-badge">
                      <span className="yuume-stock-dot" />
                      In stock
                    </span>
                  )}
                </div>
              )}
              {image && (
                <div className="yuume-image-zoom-overlay" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="Ingrandisci immagine"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </div>
              )}
            </div>

            <div className="yuume-product-info">
              <a
                href={url}
                className="yuume-product-link-wrapper"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="yuume-product-name">
                  {name}
                  <ExternalLinkIcon size={12} />
                </h3>
              </a>
              <div className="yuume-product-price-row">
                <div className="yuume-price-stack">
                  {compareAtPrice > price && (
                    <span className="yuume-original-price">
                      {formatPrice(compareAtPrice, currency)}
                    </span>
                  )}
                  <span className="yuume-current-price">{formatPrice(price, currency)}</span>
                </div>
                <button
                  className="yuume-product-details-toggle"
                  onClick={toggleFlip}
                  aria-label="Mostra descrizione prodotto"
                >
                  DETAILS
                </button>
              </div>

              {product.smartBadges?.length > 0 && (
                <div className="yuume-card-badges-wrapper">
                  <SmartBadges badges={product.smartBadges} />
                </div>
              )}
            </div>

            {(isAvailable && (variants[0] || product.variantId)) || hasVariants ? (
              <div className="yuume-product-card-footer" onClick={(e) => e.stopPropagation()}>
                {hasVariants ? (
                  <button
                    className="yuume-options-btn"
                    aria-label={`Seleziona opzioni per ${product.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onOpen(product);
                    }}
                  >
                    Customize
                  </button>
                ) : (
                  <div className="yuume-card-spacer" />
                )}
                {isAvailable && (product.variants[0] || product.variantId) && (
                  <div className="yuume-add-to-cart-wrapper">
                    {hasVariants ? (
                      // Product has variants: ATC opens the sheet to let user pick options first
                      <div className="yuume-add-to-cart-container compact">
                        <button
                          className="add-to-cart yuume-add-to-cart-btn"
                          aria-label={`Aggiungi al carrello ${product.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onOpen(product);
                          }}
                        >
                          <span>Add to cart</span>
                        </button>
                      </div>
                    ) : (
                      // No variants: add directly to cart
                      <AddToCartButton
                        variantId={product.variants[0]?.id || product.variantId}
                        shopDomain={shopDomain}
                        quantity={1}
                        compact={true}
                        onAnimationComplete={() =>
                          onProductAction &&
                          onProductAction('add_to_cart', { id: product.productId || product.id })
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* --- BACK SIDE --- */}
          <div className="yuume-product-side yuume-card-back">
            <div className="yuume-back-content">
              <div className="yuume-back-header">
                <div className="yuume-back-title">{name}</div>
              </div>

              <div className="yuume-product-details-list">
                <div className="yuume-detail-item">
                  <p className="yuume-product-description">
                    {description || 'No description available for this product.'}
                  </p>
                </div>

                <div className="yuume-detail-grid">
                  {vendor && (
                    <div className="yuume-detail-item">
                      <span className="label">Brand</span>
                      <span className="value">{vendor}</span>
                    </div>
                  )}

                  {productType && (
                    <div className="yuume-detail-item">
                      <span className="label">Type</span>
                      <span className="value">{productType}</span>
                    </div>
                  )}
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="yuume-detail-item">
                    <span className="label">Tags</span>
                    <div className="yuume-product-tags">
                      {product.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="yuume-tag-pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <a
                href={url}
                className="yuume-view-in-store-btn"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                View in Store
                <ExternalLinkIcon size={12} />
              </a>
            </div>

            <button className="yuume-back-return-overlay-btn" onClick={toggleFlip}>
              <CloseIcon size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  },
);


const ProductCards = memo(
  ({ message, shopDomain, onOpen, onImageClick, chatColors, sendFeedback, onProductAction }) => {
    const { products = [], message: displayMessage } = message;
    const scrollRef = React.useRef(null);
    const [showLeftArrow, setShowLeftArrow] = React.useState(false);
    const [showRightArrow, setShowRightArrow] = React.useState(true);

    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    React.useEffect(() => {
      const el = scrollRef.current;
      if (el) {
        el.addEventListener('scroll', checkScroll);
        // Initial check
        checkScroll();
        return () => el.removeEventListener('scroll', checkScroll);
      }
    }, [products]);

    const scroll = (direction) => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const cardWidth =
          container.querySelector('.yuume-product-card-minimal')?.offsetWidth || 240;
        const gap = 12;
        const scrollAmount = direction === 'next' ? cardWidth + gap : -(cardWidth + gap);

        container.scrollBy({
          left: scrollAmount,
          behavior: 'smooth',
        });
      }
    };

    if (!Array.isArray(products) || products.length === 0) {
      return (
        <div className="yuume-no-products">
          Non ho trovato prodotti che corrispondono alla tua ricerca.
        </div>
      );
    }

    return (
      <div className="yuume-products-container">
        {displayMessage && (
          <MessageBubble
            sender={message.sender || 'assistant'}
            timestamp={message.timestamp}
            chatColors={chatColors}
            className="yuume-products-message-bubble"
            feedback={message.feedback}
            onFeedback={(type) => sendFeedback(message.id, type, message.text)}
            showFeedback={
              message.sender === 'assistant' && !message.error && !message.disableFeedback
            }
          >
            <TextMessage message={{ message: displayMessage }} />
          </MessageBubble>
        )}
        <div className="yuume-carousel-wrapper">
          {showLeftArrow && (
            <button
              className="yuume-carousel-nav-btn prev"
              onClick={() => scroll('prev')}
              aria-label="Prodotto precedente"
            >
              <ChevronLeftIcon size={16} />
            </button>
          )}

          <div className="yuume-products-list" ref={scrollRef}>
            {products.map((product, index) => (
              <ProductCard
                key={product.id || index}
                product={product}
                index={index}
                onOpen={onOpen}
                onImageClick={onImageClick}
                shopDomain={shopDomain}
                onProductAction={onProductAction}
              />
            ))}
          </div>

          {showRightArrow && products.length > 1 && (
            <button
              className="yuume-carousel-nav-btn next"
              onClick={() => scroll('next')}
              aria-label="Prodotto successivo"
            >
              <ChevronRightIcon size={16} />
            </button>
          )}
        </div>
      </div>
    );
  },
);

export default ProductCards;
