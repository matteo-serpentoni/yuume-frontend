/**
 * Shopify Utilities
 * Helpers for normalizing data from Shopify Storefront API and Admin API.
 */

/**
 * Normalizes a product object from storefront API.
 * Ensures images, availability, and variants are in a consistent format.
 */
export const normalizeStorefrontProduct = (product) => {
  if (!product) return null;

  const {
    images: rawImages = [],
    image: fallbackImage,
    available: initialAvailable,
    availability: fallbackAvailable,
    variants = [],
  } = product;

  return {
    ...product,
    // Normalize images to an array of objects or strings
    images:
      Array.isArray(rawImages) && rawImages.length > 0
        ? rawImages.map((img) => img.url || img)
        : fallbackImage
          ? [fallbackImage.url || fallbackImage]
          : [],
    // Primary image for display
    primaryImage:
      Array.isArray(rawImages) && rawImages.length > 0
        ? rawImages[0].url || rawImages[0]
        : fallbackImage?.url || fallbackImage,
    // Unified availability boolean
    isAvailable: initialAvailable !== undefined ? initialAvailable : fallbackAvailable,
    // Compare at price for discounts
    compareAtPrice: product.compareAtPrice || null,
    discountPercentage:
      product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price)
        ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice)) * 100)
        : 0,
    // Proactive Discount Info
    discountCode: product.discountCode || null,
    isAutomatic: product.isAutomatic || false,
    // Ensure variants is an array
    variants: Array.isArray(variants) ? variants : [],
    // Determine if there are real variants to customize
    hasVariants: (product.options || []).some(
      (opt) =>
        !(opt.name === 'Title' && opt.values.length === 1 && opt.values[0] === 'Default Title'),
    ),
    // Link to product page
    url: product.url || product.productUrl || '',
    productUrl: product.productUrl || product.url || '',
  };
};

/**
 * Checks if a variant option is the default one created by Shopify.
 */
export const isDefaultVariant = (option) => {
  if (!option) return false;
  return (
    option.name === 'Title' && option.values.length === 1 && option.values[0] === 'Default Title'
  );
};

/**
 * Normalizes an order number by removing any leading '#' characters.
 */
export const normalizeOrderNumber = (orderNumber) => {
  if (!orderNumber) return '';
  return String(orderNumber).replace(/^#+/, '');
};

/**
 * Maps Shopify status values (fulfillment or financial) to CSS class names.
 */
export const getOrderStatusClass = (statusValue) => {
  if (!statusValue) return 'default';

  const val = String(statusValue).toLowerCase().replace(/\s+/g, '_');
  const allowed = [
    'paid',
    'pending',
    'authorized',
    'refunded',
    'voided',
    'annullato',
    'fulfilled',
    'unfulfilled',
    'in_preparazione',
    'in_lavorazione',
    'partially_fulfilled',
  ];

  return allowed.includes(val) ? val : 'default';
};

/**
 * Extracts a numeric variant ID from a Shopify GID or string.
 * @param {string|number} variantId - The ID to extract from.
 * @returns {number|null} The numeric ID.
 */
export const extractVariantId = (variantId) => {
  if (!variantId) return null;

  // If already a number, return it
  if (typeof variantId === 'number') return variantId;

  // If it's a numeric string, convert it
  if (typeof variantId === 'string' && !variantId.includes('/')) {
    const parsed = parseInt(variantId, 10);
    return isNaN(parsed) ? null : parsed;
  }

  // If it's a GID (gid://shopify/ProductVariant/123456), extract the ID
  const match = String(variantId).match(/\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
};
/**
 * Formats a discount expiry date into a human-friendly Italian string.
 * @param {string} dateString - ISO date string from Shopify.
 * @returns {string|null} Formatted date or null.
 */
export const formatPromoExpiry = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Scaduto';
  if (diffDays === 0) return 'Scade oggi ⏳';
  if (diffDays === 1) return 'Scade domani';
  if (diffDays <= 7) return `Scade tra ${diffDays} giorni`;

  return `Valido fino al ${date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}`;
};
