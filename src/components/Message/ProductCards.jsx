import React, { memo } from 'react';
import { motion } from 'framer-motion';
import AddToCartButton from './AddToCartButton';
import Drawer from '../UI/Drawer';
import { formatPrice } from '../../utils/messageHelpers';
import { normalizeStorefrontProduct, isDefaultVariant } from '../../utils/shopifyUtils';
import './ProductCards.css';

const ProductCard = memo(({ product, index, onOpen, onImageClick, shopDomain }) => {
  // Normalize product data using unified utility
  const {
    primaryImage: image,
    images: allImages,
    isAvailable,
    hasVariants,
    name,
    price,
    currency,
    variants,
  } = normalizeStorefrontProduct(product);

  // Ensure images is always a non-empty array for the gallery
  const galleryImages = allImages && allImages.length > 0 ? allImages : image ? [image] : [];

  return (
    <motion.div
      className={`yuume-product-card-minimal clickable`}
      role="button"
      tabIndex={0}
      aria-label={`Visualizza dettagli per ${name}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.1 }}
      onClick={hasVariants ? () => onOpen(product) : undefined}
      onKeyDown={(e) => {
        if (hasVariants && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpen(product);
        }
      }}
    >
      <div
        className="yuume-product-image-container"
        onClick={(e) => {
          e.stopPropagation();
          onImageClick &&
            onImageClick({
              images: galleryImages,
              index: 0,
              product: product,
            });
        }}
      >
        {image ? (
          <img src={image.url || image} alt={product.name} />
        ) : (
          <div className="yuume-product-placeholder">🎁</div>
        )}
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
      </div>

      <div className="yuume-product-info">
        <h3 className="yuume-product-name">{name}</h3>
        <div className="yuume-product-price-row">
          <span className="yuume-current-price">{formatPrice(price, currency)}</span>
          <div className={`yuume-availability-status ${isAvailable ? 'available' : 'unavailable'}`}>
            <span className="yuume-status-dot"></span>
            {isAvailable ? 'In stock' : 'Out of stock'}
          </div>
        </div>
      </div>

      {(isAvailable && (variants[0] || product.variantId)) || hasVariants ? (
        <div className="yuume-product-card-footer" onClick={(e) => e.stopPropagation()}>
          {hasVariants && (
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
          )}
          {isAvailable && (product.variants[0] || product.variantId) && (
            <AddToCartButton
              variantId={product.variants[0]?.id || product.variantId}
              shopDomain={shopDomain}
              quantity={1}
              compact={true}
            />
          )}
        </div>
      ) : null}
    </motion.div>
  );
});

export const ProductDrawer = memo(({ product, onClose, shopDomain }) => {
  React.useEffect(() => {
    return () => {};
  }, [product.name]);
  // Normalize product data using unified utility
  const normalized = normalizeStorefrontProduct(product);
  const {
    images,
    isAvailable,
    name,
    description,
    price: initialPrice,
    currency,
    variants,
    options,
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

  const footer = (
    <>
      {isAvailableResult && (currentVariant || normalized.variants[0]) ? (
        <AddToCartButton
          variantId={currentVariant?.id || normalized.variants[0].id}
          shopDomain={shopDomain}
          quantity={1}
          onAnimationComplete={onClose}
        />
      ) : (
        <button className="yuume-add-to-cart-btn disabled" disabled>
          Prodotto Esaurito
        </button>
      )}
    </>
  );

  return (
    <Drawer isOpen={!!product} onClose={onClose} footer={footer}>
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

const ProductCards = memo(({ message, shopDomain, onOpen, onImageClick, activeProduct }) => {
  const { products = [], message: displayMessage, meta = {} } = message;
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
      const cardWidth = container.querySelector('.yuume-product-card-minimal')?.offsetWidth || 240;
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
      {/* displayMessage removed to save space as per user request */}

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

      {meta.totalCount > meta.displayCount && (
        <div className="yuume-products-footer-link">
          <a
            href={`https://${shopDomain}/search?q=${encodeURIComponent(displayMessage || '')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Vedi tutti i {meta.totalCount} risultati su {shopDomain}
          </a>
        </div>
      )}
    </div>
  );
});

export default ProductCards;
