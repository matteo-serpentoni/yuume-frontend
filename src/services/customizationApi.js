/**
 * Customization API Service
 * Gestisce le chiamate API per recuperare e salvare le personalizzazioni del widget
 */

import { getWidgetToken } from './widgetTokenStore';

// Usa variabile d'ambiente per l'URL del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Recupera la configurazione del widget per un sito
 * @param {string} siteId - ID del sito
 * @returns {Promise<Object>} Widget configuration
 */
export async function getWidgetConfig(siteId) {
  try {
    const response = await fetch(`${API_URL}/api/customization/widget/${siteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Widget-Token': getWidgetToken(),
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch widget config');
    }

    return result.data;
  } catch {
    // Ritorna configurazione di default in caso di errore
    return {
      orbTheme: {
        id: 'purple-dream',
        name: 'Purple Dream',
        baseColor1: [0.611765, 0.262745, 0.996078],
        baseColor2: [0.298039, 0.760784, 0.913725],
        baseColor3: [0.062745, 0.078431, 0.6],
      },
      chatColors: {
        header: '#667eea',
        sendButton: '#667eea',
      },
    };
  }
}
