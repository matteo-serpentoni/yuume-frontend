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
