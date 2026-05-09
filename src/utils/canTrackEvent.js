/**
 * canTrackEvent — Purpose-Based Tracking Gate
 *
 * Determines whether a specific tracking event is permitted based on:
 *   - The event's intended purpose (Store Brain aggregate, Customer Profile, etc.)
 *   - Whether the user is identified (known customer)
 *   - The current consent state
 *
 * V1 rules:
 *   - store_brain_aggregate → allowed if analytics consent
 *   - customer_profile     → only if identified + analytics consent
 *   - commerce_funnel      → allowed if analytics consent
 *   - technical_debug      → always (consent-exempt)
 *   - marketing            → never automatic from these events
 *
 * @module utils/canTrackEvent
 */

/**
 * @typedef {'store_brain_aggregate'|'customer_profile'|'commerce_funnel'|'technical_debug'} TrackingPurpose
 */

/**
 * Check if a tracking event is permitted for the given purpose.
 *
 * @param {Object} params
 * @param {string} params.eventType - Event type name
 * @param {TrackingPurpose} params.purpose - Intended data use
 * @param {boolean} params.isIdentified - Whether the user is a known customer
 * @param {boolean} params.analyticsConsent - Whether analytics consent is granted
 * @returns {boolean}
 */
export function canTrackEvent({ purpose, isIdentified = false, analyticsConsent = false }) {
  switch (purpose) {
    case 'store_brain_aggregate':
      return analyticsConsent;

    case 'customer_profile':
      return isIdentified && analyticsConsent;

    case 'commerce_funnel':
      return analyticsConsent;

    case 'technical_debug':
      return true; // Always allowed — consent-exempt

    default:
      return false; // Unknown purpose → deny
  }
}
