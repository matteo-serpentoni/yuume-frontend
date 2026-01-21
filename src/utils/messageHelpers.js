/**
 * Cache for the number formatter to improve performance.
 * We use it-IT for decimal/thousands separators (e.g. 1.234,56).
 */
const numberFormatter = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencySymbols = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};

/**
 * Formats a numeric price into a localized string with currency symbol at the beginning.
 * Uses caching for performance and handles string-to-number conversion.
 * @param {number|string} amount - The numeric or string price.
 * @param {string} currency - The currency code (default: "EUR").
 * @returns {string} - Formatted price string (e.g., "€ 10,00").
 */
export const formatPrice = (amount, currency = 'EUR') => {
  const num = Number(amount);
  if (isNaN(num)) return amount || '---';

  const symbol = currencySymbols[currency] || currency;
  const formattedNum = numberFormatter.format(num);

  return `${symbol} ${formattedNum}`;
};

/**
 * Processes a raw text message by:
 * 1. Escaping HTML to prevent XSS.
 * 2. Converting URLs to safe links (handling trailing punctuation).
 * 3. Converting basic Markdown (bold, italic, code) to HTML.
 * @param {string} text - The raw message text.
 * @returns {string} - The processed safe HTML string.
 */
export const processMessage = (text = '') => {
  if (!text) return '';

  // 1. Security: Escape HTML to prevent XSS
  const safeText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 2. Convert URLs to links (improved regex handles punctuation like '.' at the end)
  let processed = safeText.replace(
    /(https?:\/\/[^\s]+?)(?=[.,;:]?(\s|$))/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; font-weight: 500; pointer-events: auto;">$1</a>',
  );

  // 3. Basic Markdown
  processed = processed
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(
      /`(.*?)`/g,
      '<code style="background:rgba(255,255,255,0.1);padding:2px 4px;border-radius:3px;font-size:0.9em;">$1</code>',
    );

  // 4. Newlines
  processed = processed.replace(/\n/g, '<br/>');

  return processed;
};

/**
 * Truncates text to a maximum length.
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Formats a timestamp into HH:MM.
 * @param {string|number|Date} timestamp - The timestamp to format.
 * @returns {string} - Formatted time string.
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
/**
 * Predicts the user intent based on common keywords.
 * Useful for instant UI feedback before backend classification.
 * @param {string} text - User input.
 * @returns {string|null} - Predicted intent or null.
 */
export const predictIntent = (text) => {
  if (!text) return null;
  const input = text.toLowerCase().trim();

  const PATTERNS = {
    PRODUCT_SEARCH:
      /\b(cerco|trov|prodott|scarp|giacc|pantal|felp|magli|accessori|compr|guard|ved|catalog|disponib|magazzin)\b/i,
    ORDER_TRACK: /\b(ordine|pacco|spediz|dov|arriv|consegn|tracking|stato|stiamo|corrier)\b/i,
    SHIPPING: /\b(cost|temp|spedire|spediamo|consegna|tempi|paes)\b/i,
    REFUND: /\b(reso|rimbors|cambi|restitu|indietr|politica|procedur|sbagliat)\b/i,
    FAQ: /\b(chi|siete|contatt|info|orari|negoz|sede|telefono|email|garanzia|sicur|pagament|metod)\b/i,
    ESCALATION: /\b(operatore|uman|person|parlare|aiuto|collega|team|support)\b/i,
  };

  for (const [intent, regex] of Object.entries(PATTERNS)) {
    if (regex.test(input)) return intent;
  }

  return null;
};
