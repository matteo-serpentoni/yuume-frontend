import { useState, useEffect } from 'react';
import { getWidgetConfig } from '../services/customizationApi';
import { BRIDGE_CONFIG } from '../config/bridge';

const DEFAULT_CONFIG = {
  orbTheme: {
    id: 'purple-dream',
    name: 'Purple Dream',
    baseColor1: [0.611765, 0.262745, 0.996078],
    baseColor2: [0.298039, 0.760784, 0.913725],
    baseColor3: [0.062745, 0.078431, 0.6],
  },
  chatColors: {
    header: '#9C43FE',
    sendButton: '#9C43FE',
    userMessage: '#9C43FE',
    aiMessage: '#4CC2E9',
    inputBorder: '#9C43FE',
    inputFocus: '#4CC2E9',
  },
};

/**
 * useOrb Hook
 * Centralizes configuration fetching, live updates, and environment detection.
 */
export const useOrb = (modeOverride = null) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [authorizedDomain, setAuthorizedDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shopDomain, setShopDomain] = useState(() => {
    // 1. Check URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlShop = urlParams.get('shop') || urlParams.get('shopDomain');
    if (urlShop) return urlShop;

    // 2. Check localStorage (Manual Override in Dev)
    if (import.meta.env.DEV) {
      const savedDevShop = localStorage.getItem('yuume_dev_shop_domain');
      if (savedDevShop) return savedDevShop;
    }

    return null; // Must wait for postMessage if not in URL
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);

  // Detect mode based on URL or environment
  const mode =
    modeOverride ||
    (window.location.pathname.includes('preview')
      ? 'preview'
      : import.meta.env.DEV
        ? 'development'
        : 'production');

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      );
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  // PostMessage Listener for live updates (Preview Mode)
  useEffect(() => {
    const handleMessage = (event) => {
      // ✅ Security: Validate Origin (using authorizedDomain from backend if available)
      if (!BRIDGE_CONFIG.isValidOrigin(event.origin, authorizedDomain, event.data?.type)) return;

      // Normalize message types with YUUME: prefix
      if (event.data.type === 'YUUME:updateCustomization') {
        const { orbTheme, chatColors, mobileMode } = event.data.data;

        if (mobileMode !== undefined) {
          setIsPreviewMobile(!!mobileMode);
        }

        setConfig((prev) => ({
          orbTheme: orbTheme || prev.orbTheme,
          chatColors: chatColors || prev.chatColors,
        }));
      }

      if (event.data.type === 'YUUME:shopDomain') {
        const isDev = mode === 'development';
        const incomingDomain = event.data.shopDomain;

        if (isDev) {
          const hasManualOverride = !!localStorage.getItem('yuume_dev_shop_domain');
          if (hasManualOverride || (shopDomain && incomingDomain === 'localhost')) {
            return;
          }
        }

        setShopDomain(incomingDomain);
        localStorage.setItem('yuume_dev_shop_domain', incomingDomain);
      }
    };

    window.addEventListener('message', handleMessage);

    // Request shop domain if needed
    if (window.parent && !shopDomain && mode === 'production') {
      window.parent.postMessage({ type: 'YUUME:requestShopDomain' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [shopDomain, authorizedDomain, mode]);

  // Initial Data Fetching (Production & Development Overrides)
  useEffect(() => {
    if (!shopDomain) {
      if (mode === 'production') {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: set loading state during init
        setLoading(true);
      } else {
        setLoading(false);
      }
      return;
    }

    // Don't fetch if we're on localhost and no override is present
    if (shopDomain === 'localhost') {
      setLoading(false);
      return;
    }

    setLoading(true);
    getWidgetConfig(shopDomain)
      .then((data) => {
        if (data) {
          setConfig(data);
          // 🛡️ Source of Truth: Store authorized domain from our database config
          if (data.domain) {
            setAuthorizedDomain(data.domain);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [shopDomain, mode]);

  return {
    config,
    loading,
    mode,
    isMobile,
    isPreviewMobile,
    shopDomain,
    authorizedDomain,
    setConfig,
    setShopDomain,
  };
};
