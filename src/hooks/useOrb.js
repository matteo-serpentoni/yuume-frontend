import { useState, useEffect, useCallback } from "react";
import { getWidgetConfig } from "../services/customizationApi";
import { hexToVec3 } from "../utils/colorUtils";

const DEFAULT_CONFIG = {
  orbTheme: {
    id: "purple-dream",
    name: "Purple Dream",
    baseColor1: [0.611765, 0.262745, 0.996078],
    baseColor2: [0.298039, 0.760784, 0.913725],
    baseColor3: [0.062745, 0.078431, 0.6],
  },
  chatColors: {
    header: "#9C43FE",
    sendButton: "#9C43FE",
    userMessage: "#9C43FE",
    aiMessage: "#4CC2E9",
    inputBorder: "#9C43FE",
    inputFocus: "#4CC2E9",
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
    return new URLSearchParams(window.location.search).get("shop");
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);

  // Detect mode based on URL or environment
  const mode =
    modeOverride ||
    (window.location.pathname.includes("preview")
      ? "preview"
      : import.meta.env.DEV
      ? "development"
      : "production");

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        );
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  // PostMessage Listener for live updates (Preview Mode)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "YUUME_UPDATE_CUSTOMIZATION") {
        console.log("🎨 [useOrb] Customization update:", event.data.data);
        const { orbTheme, chatColors, mobileMode } = event.data.data;

        if (mobileMode !== undefined) {
          setIsPreviewMobile(!!mobileMode);
        }

        setConfig((prev) => ({
          orbTheme: orbTheme || prev.orbTheme,
          chatColors: chatColors || prev.chatColors,
        }));
      }

      if (event.data.type === "YUUME_SHOP_DOMAIN") {
        setShopDomain(event.data.shopDomain);
      }
    };

    window.addEventListener("message", handleMessage);

    // Request shop domain if needed
    if (window.parent && !shopDomain && mode === "production") {
      window.parent.postMessage({ type: "REQUEST_SHOP_DOMAIN" }, "*");
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [shopDomain, mode]);

  // Initial Data Fetching (Production)
  useEffect(() => {
    if (mode !== "production" || !shopDomain) {
      if (mode !== "production") setLoading(false);
      return;
    }

    const siteId = "shopify_" + shopDomain.split(".")[0];
    setLoading(true);

    getWidgetConfig(siteId)
      .then((data) => {
        if (data) setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ [useOrb] Failed to load config:", err);
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
    setConfig,
    setShopDomain,
  };
};
