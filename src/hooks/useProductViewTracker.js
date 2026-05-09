/**
 * useProductViewTracker — IntersectionObserver-Based View Tracking
 *
 * Tracks product_card_viewed events when a card is ≥50% visible
 * for ≥800ms with document.visibilityState === 'visible'.
 *
 * Dedup: sessionId:searchId:productId — one event per card per session/search.
 * Bounded Map: max 200 entries with LRU eviction (per state.md §4).
 *
 * @module hooks/useProductViewTracker
 */

import { useRef, useEffect, useCallback } from 'react';
import { trackEvent, getContext } from '../services/trackingService.js';

// Configurable thresholds
const VIEW_THRESHOLD = 0.5; // 50% visible
const VIEW_DURATION_MS = 800; // 800ms minimum
const MAX_DEDUP_ENTRIES = 200;

/**
 * useProductViewTracker
 *
 * @param {Object} options
 * @param {string} options.searchId - searchId from the current PRODUCT_RESPONSE
 * @param {React.RefObject} [options.rootRef] - Scroll container ref (carousel wrapper)
 * @returns {{ observeCard: Function, unobserveCard: Function }}
 */
export function useProductViewTracker({ searchId, rootRef } = {}) {
  // Bounded dedup Map: key → true. LRU eviction when exceeding MAX_DEDUP_ENTRIES.
  const seenRef = useRef(new Map());
  // Timer map: element → timeoutId for pending 800ms timers
  const timersRef = useRef(new Map());
  // IntersectionObserver instance
  const observerRef = useRef(null);
  // Element → productData map for observer callbacks
  const elementDataRef = useRef(new Map());

  // Build dedup key
  const _dedupKey = useCallback(
    (productId) => {
      const { sessionId } = getContext();
      return `${sessionId || ''}:${searchId || ''}:${productId || ''}`;
    },
    [searchId],
  );

  // Check + insert dedup key (returns true if already seen)
  const _isDuplicate = useCallback(
    (productId) => {
      const key = _dedupKey(productId);
      if (seenRef.current.has(key)) return true;

      // LRU eviction: remove oldest entry if at capacity
      if (seenRef.current.size >= MAX_DEDUP_ENTRIES) {
        const firstKey = seenRef.current.keys().next().value;
        seenRef.current.delete(firstKey);
      }
      seenRef.current.set(key, true);
      return false;
    },
    [_dedupKey],
  );

  // Handle intersection changes
  const _handleIntersection = useCallback(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target;
        const data = elementDataRef.current.get(el);
        if (!data) continue;

        if (entry.intersectionRatio >= VIEW_THRESHOLD) {
          // Card is ≥50% visible — start timer if not already running
          if (!timersRef.current.has(el)) {
            const timerId = setTimeout(() => {
              timersRef.current.delete(el);

              // Final checks: page must still be visible, not already tracked
              if (document.visibilityState !== 'visible') return;
              if (_isDuplicate(data.productId)) return;

              trackEvent('product_card_viewed', {
                searchId: searchId || null,
                productId: data.productId,
                position: data.position,
                query: data.query || null,
                visibleMs: VIEW_DURATION_MS,
                visibleRatio: Math.round(entry.intersectionRatio * 100) / 100,
              });
            }, VIEW_DURATION_MS);

            timersRef.current.set(el, timerId);
          }
        } else {
          // Card exited viewport — cancel pending timer
          const timerId = timersRef.current.get(el);
          if (timerId !== undefined) {
            clearTimeout(timerId);
            timersRef.current.delete(el);
          }
        }
      }
    },
    [searchId, _isDuplicate],
  );

  // Create/recreate observer when root or callback changes
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(_handleIntersection, {
      root: rootRef?.current || null,
      threshold: VIEW_THRESHOLD,
    });

    // Re-observe any elements that were added before the observer was created
    for (const el of elementDataRef.current.keys()) {
      observerRef.current.observe(el);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [_handleIntersection, rootRef]);

  // Pause/resume timers on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Cancel all pending timers when page becomes hidden
        for (const [el, timerId] of timersRef.current.entries()) {
          clearTimeout(timerId);
          timersRef.current.delete(el);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Full cleanup on unmount
  useEffect(() => {
    const currentTimers = timersRef.current;
    const currentElementData = elementDataRef.current;
    return () => {
      // Clear all pending timers
      for (const timerId of currentTimers.values()) {
        clearTimeout(timerId);
      }
      currentTimers.clear();
      currentElementData.clear();
    };
  }, []);

  /**
   * Start observing a card element.
   *
   * @param {HTMLElement} element - The card DOM element
   * @param {Object} productData - Product tracking data
   * @param {string} productData.productId - Internal Jarbris productId
   * @param {number} productData.position - Card position in the carousel
   * @param {string} [productData.query] - Search query
   */
  const observeCard = useCallback((element, productData) => {
    if (!element || !productData?.productId) return;

    elementDataRef.current.set(element, productData);
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  /**
   * Stop observing a card element.
   *
   * @param {HTMLElement} element
   */
  const unobserveCard = useCallback((element) => {
    if (!element) return;

    // Cancel pending timer
    const timerId = timersRef.current.get(element);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timersRef.current.delete(element);
    }

    elementDataRef.current.delete(element);
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  return { observeCard, unobserveCard };
}
