/**
 * Shared validation utilities for the Yuume Widget.
 */

/**
 * Validates an email address using a standard regex.
 * @param {string} email - The email to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validates if a string is not empty or just whitespace.
 * @param {string} value - The value to check.
 * @returns {boolean}
 */
export const isNotEmpty = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};
