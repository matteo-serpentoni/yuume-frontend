import { useState, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ImageLightbox.css';

const ImageLightbox = ({
  isOpen,
  images = [],
  currentIndex = 0,
  onClose,
  onNavigate,
  portalId = 'yuume-gallery-portal',
}) => {
  const [target, setTarget] = useState(null);

  useLayoutEffect(() => {
    const el = document.getElementById(portalId);
    if (el) {
      setTarget(el);
    } else {
      setTarget(document.getElementById('yuume-drawer-portal') || document.body);
    }
  }, [portalId]);

  if (!target) return null;

  const currentImage = images[currentIndex];
  // Support both Shopify image objects and raw strings
  const imageUrl = currentImage?.url || currentImage || '';

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="yuume-lightbox-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Pure blur backdrop */}
          <div className="yuume-lightbox-backdrop" onClick={onClose} />

          {/* Image and Controls Container */}
          <div className="yuume-lightbox-content-group">
            {/* Image Container */}
            <div className="yuume-lightbox-container">
              <motion.div
                className="yuume-lightbox-image-wrapper"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <img src={imageUrl} alt="Product Detail" className="yuume-lightbox-img" />
              </motion.div>

              {/* Navigation (Only if multiple images) */}
              {images.length > 1 && (
                <>
                  <button
                    className="yuume-lightbox-nav prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate((currentIndex - 1 + images.length) % images.length);
                    }}
                    aria-label="Immagine precedente"
                  >
                    <svg
                      width="24"
                      height="24"
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
                  <button
                    className="yuume-lightbox-nav next"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate((currentIndex + 1) % images.length);
                    }}
                    aria-label="Prossima immagine"
                  >
                    <svg
                      width="24"
                      height="24"
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

                  <div className="yuume-lightbox-dots">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className={`yuume-lightbox-dot ${i === currentIndex ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Close Button - Now logically follows the content, positioned via CSS */}
            <button className="yuume-lightbox-close" onClick={onClose} aria-label="Chiudi gallery">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(content, target);
};

export default ImageLightbox;
