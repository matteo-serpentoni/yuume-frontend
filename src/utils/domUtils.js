/**
 * DOM Utilities
 * Helpers for interacting with the document and styles.
 */

/**
 * Safely retrieves a CSS variable value from the document root.
 * @param {string} name - The name of the CSS variable (e.g., "--orb-size").
 * @param {string|number} defaultValue - Value to return if variable is not set.
 * @returns {string} The variable value or default.
 */
export const getCssVariable = (name, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;

  const style = getComputedStyle(document.documentElement);
  const value = style.getPropertyValue(name).trim();

  return value || defaultValue;
};
