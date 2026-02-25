import React, { memo, useState } from 'react';
// eslint-disable-next-line no-unused-vars -- motion.div used in JSX
import { motion } from 'framer-motion';
import AddToCartButton from './AddToCartButton';
import SmartBadges from './SmartBadges';
import MessageBubble from '../Chat/MessageBubble';
import Drawer from '../UI/Drawer';
import { formatPrice } from '../../utils/messageHelpers';
import { normalizeStorefrontProduct, isDefaultVariant } from '../../utils/shopifyUtils';
import './ProductCards.css';

const Icons = {
  Info: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Close: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Tag: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Package: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  ExternalLink: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Image: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5-11 11" />
      <path d="M17 21l-5-5-5 5" />
    </svg>
  ),
};

const ProductCard = memo(
  ({ product, index, onOpen, onImageClick, shopDomain, onProductAction }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const normalizedProduct = normalizeStorefrontProduct(product);

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
                <img src={image.url || image} alt={product.name} />
              ) : (
                <div className="yuume-product-placeholder">
                  <Icons.Image />
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
                  <Icons.ExternalLink />
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
                    <AddToCartButton
                      variantId={product.variants[0]?.id || product.variantId}
                      shopDomain={shopDomain}
                      quantity={1}
                      compact={true}
                      onAnimationComplete={() => onProductAction && onProductAction('add_to_cart')}
                    />
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
                <Icons.ExternalLink />
              </a>
            </div>

            <button className="yuume-back-return-overlay-btn" onClick={toggleFlip}>
              <Icons.Close />
            </button>
          </div>
        </motion.div>
      </div>
    );
  },
);

export const ProductDrawer = memo(({ product, onClose, shopDomain, onProductAction }) => {
  React.useEffect(() => {
    return () => {};
  }, [product.name]);
  // Normalize product data using unified utility
  const normalized = normalizeStorefrontProduct(product);
  const {
    isAvailable,
    name,
    price: initialPrice,
    compareAtPrice: initialCompareAtPrice,
    currency,
    variants,
  } = normalized;

  const [selectedOptions, setSelectedOptions] = React.useState(() => {
    const initial = {};
    if (variants.length > 0 && variants[0].selectedOptions) {
      variants[0].selectedOptions.forEach((opt) => {
        initial[opt.name] = opt.value;
      });
    }
    return initial;
  });

  const [currentVariant, setCurrentVariant] = React.useState(normalized.variants[0] || null);

  React.useEffect(() => {
    const found = normalized.variants.find(
      (v) =>
        v.selectedOptions &&
        v.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value),
    );
    if (found) setCurrentVariant(found);
  }, [selectedOptions, normalized.variants]);

  const handleOptionChange = (name, value) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
  };

  const isAvailableResult = currentVariant ? currentVariant.available : isAvailable;

  const currentPrice = currentVariant?.price || initialPrice;
  const currentCompareAtPrice = currentVariant?.compareAtPrice || initialCompareAtPrice;

  const footer = (
    <>
      {isAvailableResult && (currentVariant || normalized.variants[0]) ? (
        <AddToCartButton
          variantId={currentVariant?.id || normalized.variants[0].id}
          shopDomain={shopDomain}
          quantity={1}
          onAnimationComplete={() => onProductAction && onProductAction('add_to_cart')}
        />
      ) : (
        <button className="yuume-add-to-cart-btn disabled" disabled>
          Prodotto Esaurito
        </button>
      )}
    </>
  );

  return (
    <Drawer isOpen={!!product} onClose={onClose} footer={footer} title={name}>
      <div className="yuume-drawer-price-section">
        <div className="yuume-price-stack">
          {currentCompareAtPrice > currentPrice && (
            <span className="yuume-original-price">
              {formatPrice(currentCompareAtPrice, currency)}
            </span>
          )}
          <span className="yuume-current-price">{formatPrice(currentPrice, currency)}</span>
        </div>
      </div>
      {product.options.filter((opt) => !isDefaultVariant(opt)).length > 0 && (
        <div className="yuume-drawer-variants">
          {product.options
            .filter((opt) => !isDefaultVariant(opt))
            .map((opt) => (
              <div key={opt.name} className="yuume-variant-group">
                <span className="yuume-variant-label">{opt.name}</span>
                <div className="yuume-variant-options">
                  {opt.values.length <= 4 ? (
                    <div className="yuume-pills-container">
                      {opt.values.map((val) => (
                        <button
                          key={val}
                          className={`yuume-pill ${
                            selectedOptions[opt.name] === val ? 'active' : ''
                          }`}
                          onClick={() => handleOptionChange(opt.name, val)}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <select
                      className="yuume-variant-select"
                      value={selectedOptions[opt.name] || ''}
                      onChange={(e) => handleOptionChange(opt.name, e.target.value)}
                    >
                      {opt.values.map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </Drawer>
  );
});

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
            {displayMessage}
          </MessageBubble>
        )}
        <div className="yuume-carousel-wrapper">
          {showLeftArrow && (
            <button
              className="yuume-carousel-nav-btn prev"
              onClick={() => scroll('prev')}
              aria-label="Prodotto precedente"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
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
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  },
);

export default ProductCards;
