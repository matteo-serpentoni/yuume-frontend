/**
 * Privacy API Service
 *
 * Service layer for all widget → backend privacy consent API calls.
 * Follows state.md §2: API calls belong in service layer, not in components.
 *
 * @module services/privacyApi
 */

import { getWidgetToken } from './widgetTokenStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Fetch the current consent preferences for this visitor from the backend.
 * Backend is the source of truth; this call happens on widget boot.
 *
 * @param {string} sessionId
 * @param {string} shopDomain
 * @param {string} [anonId] - Anonymous visitor ID for pre-identification consent
 * @returns {Promise<{analytics: boolean, marketing: boolean, preferences: boolean, collectedAt: string|null}|null>}
 */
export async function getPrivacyPreferences(sessionId, shopDomain, anonId) {
  try {
    const params = new URLSearchParams({ shopDomain });
    if (sessionId) params.set('sessionId', sessionId);
    if (anonId) params.set('anonId', anonId);

    const response = await fetch(`${API_BASE_URL}/api/chat/consent?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Widget-Token': getWidgetToken(),
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.consent ?? null;
  } catch {
    // Network failure: return null so the caller can use the localStorage boot value
    return null;
  }
}

/**
 * Persist consent preference change to the backend.
 * Returns the updated consent object on success, throws on failure.
 *
 * @param {string} sessionId
 * @param {string} shopDomain
 * @param {string|null} anonId
 * @param {{ analytics: boolean }} preferences
 * @returns {Promise<{analytics: boolean, marketing: boolean, preferences: boolean, collectedAt: string}>}
 */
export async function updatePrivacyPreferences(sessionId, shopDomain, anonId, { analytics }) {
  const response = await fetch(`${API_BASE_URL}/api/chat/consent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Widget-Token': getWidgetToken(),
    },
    body: JSON.stringify({
      sessionId,
      shopDomain,
      anonId: anonId || null,
      analytics,
    }),
  });

  if (!response.ok) {
    throw new Error(`Consent update failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.consent;
}
