/**
 * CrossSellBlock — Cross-sell recommendations after add-to-cart
 *
 * Rendered inside the add_to_cart_action message when `data.crossSell` is present.
 * Shows up to 3 compact product cards: image, name, price, promo badge, CTA.
 *
 * Renders nothing if products array is empty.
 */
import { memo } from 'react';
import AddToCartButton from './AddToCartButton';
import { ExternalLinkIcon, SparkleIcon } from '../UI/Icons';
import { formatPrice } from '../../utils/messageHelpers';
import { normalizeStorefrontProduct } from '../../utils/shopifyUtils';
import './CrossSellBlock.css';

const CrossSellCard = memo(({ product, shopDomain, index, onOpen }) => {
  const normalized = normalizeStorefrontProduct(product);
  const {
    primaryImage: image,
    name,
    price,
    compareAtPrice,
    discountPercentage,
    currency,
    isAvailable,
    hasVariants,
    url,
    variants,
  } = normalized;

  const onSale = compareAtPrice > price;

  return (
    <div
      className="yuume-xs-card"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <a
        href={url}
        className="yuume-xs-image-wrapper"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${name}`}
      >
        {image ? (
          <img src={image.url || image} alt={name} className="yuume-xs-image" loading="lazy" />
        ) : (
          <div className="yuume-xs-image-placeholder" aria-hidden="true" />
        )}
        {onSale && discountPercentage > 0 && (
          <span className="yuume-xs-promo-badge" aria-label={`${discountPercentage}% off`}>
            -{discountPercentage}%
          </span>
        )}
      </a>

      <div className="yuume-xs-info">
        <a
          href={url}
          className="yuume-xs-name"
          target="_blank"
          rel="noopener noreferrer"
          title={name}
        >
          <span className="yuume-xs-name-text">{name}</span>
          <ExternalLinkIcon size={12} />
        </a>

        <div className="yuume-xs-price-row">
          {onSale && (
            <span className="yuume-xs-original-price">{formatPrice(compareAtPrice, currency)}</span>
          )}
          <span className="yuume-xs-price">{formatPrice(price, currency)}</span>
        </div>

        {isAvailable ? (
          hasVariants ? (
            <button
              className="yuume-xs-cta yuume-xs-cta--view"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onOpen) onOpen(product);
              }}
              aria-label={`View options for ${name}`}
            >
              View options
            </button>
          ) : (
            variants[0]?.id && (
              <div className="yuume-xs-atc-wrapper">
                <AddToCartButton
                  variantId={variants[0].id}
                  shopDomain={shopDomain}
                  quantity={1}
                  compact={true}
                />
              </div>
            )
          )
        ) : (
          <span className="yuume-xs-unavailable">Sold out</span>
        )}
      </div>
    </div>
  );
});

CrossSellCard.displayName = 'CrossSellCard';

/**
 * CrossSellBlock — wrapper for the full cross-sell section.
 *
 * @param {{ data: { title: string, vertical: string, products: Object[] }, shopDomain: string }} props
 */
const CrossSellBlock = memo(({ data, shopDomain, onOpen }) => {
  if (!data?.products?.length) return null;

  return (
    <div className="yuume-cross-sell-block">
      <div className="yuume-xs-header">
        <SparkleIcon size={13} />
        <span className="yuume-xs-title">{data.title}</span>
      </div>

      <div className="yuume-xs-grid">
        {data.products.slice(0, 3).map((product, index) => (
          <CrossSellCard
            key={product.id || product.productId || index}
            product={product}
            shopDomain={shopDomain}
            index={index}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
});

CrossSellBlock.displayName = 'CrossSellBlock';

export default CrossSellBlock;
