import { useState, useEffect, useCallback } from 'react';
import { getWidgetConfig } from '../services/customizationApi';
import { hexToVec3 } from '../utils/colorUtils';

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
  const [loading, setLoading] = useState(true);
  const [shopDomain, setShopDomain] = useState(() => {
    // 1. Check URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlShop = urlParams.get('shop') || urlParams.get('shopDomain');
    if (urlShop) return urlShop;

    // 2. Check SessionStorage (Manual Override in Dev)
    if (import.meta.env.DEV) {
      const savedDevShop = sessionStorage.getItem('yuume_dev_shop_domain');
      if (savedDevShop) return savedDevShop;
    }

    return null; // Must wait for postMessage if not in URL
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
  const [textColorMode, setTextColorMode] = useState('dark'); // default dark bg -> white text

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
      if (event.data.type === 'YUUME_UPDATE_CUSTOMIZATION') {
        const { orbTheme, chatColors, mobileMode } = event.data.data;

        if (mobileMode !== undefined) {
          setIsPreviewMobile(!!mobileMode);
        }

        setConfig((prev) => ({
          orbTheme: orbTheme || prev.orbTheme,
          chatColors: chatColors || prev.chatColors,
        }));
      }

      if (event.data.type === 'YUUME_SHOP_DOMAIN') {
        const isDev = mode === 'development';
        const incomingDomain = event.data.shopDomain;

        // In development, ignore incoming "localhost" if we already have something better
        // or if we have a manual override in storage
        if (isDev) {
          const hasManualOverride = !!sessionStorage.getItem('yuume_dev_shop_domain');
          if (hasManualOverride || (shopDomain && incomingDomain === 'localhost')) {
            return;
          }
        }

        setShopDomain(incomingDomain);
      }

      if (event.data.type === 'YUUME_BG_LUMINANCE') {
        setTextColorMode(event.data.mode === 'light' ? 'light' : 'dark');
      }
    };

    window.addEventListener('message', handleMessage);

    // Request shop domain if needed
    if (window.parent && !shopDomain && mode === 'production') {
      window.parent.postMessage({ type: 'REQUEST_SHOP_DOMAIN' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [shopDomain, mode]);

  // Initial Data Fetching (Production & Development Overrides)
  useEffect(() => {
    if (!shopDomain) {
      setLoading(false);
      return;
    }

    // Use the raw domain/id. The backend resolveId now supports direct domain lookup.
    const siteId = shopDomain;

    // Don't fetch if we're on localhost and no override is present
    if (shopDomain === 'localhost') {
      setLoading(false);
      return;
    }

    setLoading(true);
    getWidgetConfig(siteId)
      .then((data) => {
        if (data) setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ [useOrb] Failed to load config:', err);
        setLoading(false);
      });
  }, [shopDomain, mode]);

  return {
    config,
    loading,
    mode,
    isMobile,
    isPreviewMobile,
    textColorMode,
    shopDomain,
    setConfig,
    setShopDomain,
  };
};
