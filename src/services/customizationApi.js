/**
 * Customization API Service
 * Gestisce le chiamate API per recuperare e salvare le personalizzazioni del widget
 */

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
  } catch (error) {
    console.error('❌ Error fetching widget config:', error);
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

/**
 * Recupera la customizzazione per la dashboard
 * @param {string} siteId - ID del sito
 * @returns {Promise<Object>} Customization data
 */
export async function getCustomization(siteId) {
  try {
    const response = await fetch(`${API_URL}/api/customization/${siteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies per autenticazione
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch customization');
    }

    return result.data;
  } catch (error) {
    console.error('❌ Error fetching customization:', error);
    throw error;
  }
}

/**
 * Aggiorna la customizzazione
 * @param {string} siteId - ID del sito
 * @param {Object} customization - Dati da salvare
 * @returns {Promise<Object>} Updated customization
 */
export async function updateCustomization(siteId, customization) {
  try {
    const response = await fetch(`${API_URL}/api/customization/${siteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies per autenticazione
      body: JSON.stringify(customization),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to update customization');
    }

    return result.data;
  } catch (error) {
    console.error('❌ Error updating customization:', error);
    throw error;
  }
}

/**
 * Recupera tutti i temi con informazioni di accesso
 * @param {string} siteId - ID del sito
 * @returns {Promise<Object>} { available: [...], locked: [...] }
 */
export async function getAllThemesWithAccess(siteId) {
  try {
    const response = await fetch(`${API_URL}/api/customization/themes/${siteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch themes');
    }

    return result.data;
  } catch (error) {
    console.error('❌ Error fetching themes:', error);
    throw error;
  }
}

/**
 * Resetta la customizzazione ai valori di default
 * @param {string} siteId - ID del sito
 * @returns {Promise<Object>} Default customization
 */
export async function resetCustomization(siteId) {
  try {
    const response = await fetch(`${API_URL}/api/customization/${siteId}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to reset customization');
    }

    return result.data;
  } catch (error) {
    console.error('❌ Error resetting customization:', error);
    throw error;
  }
}
