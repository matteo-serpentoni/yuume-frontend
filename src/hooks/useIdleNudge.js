import { useEffect, useRef, useCallback } from 'react';

// Default idle timeout before sending nudge request (ms)
const DEFAULT_TIMEOUT = 10_000;
// Default scroll delta threshold (px) to count as real user scroll
const DEFAULT_SCROLL_THRESHOLD = 50;
// Default max nudges per session
const DEFAULT_MAX_PER_SESSION = 2;
// Delay before capturing scroll baseline (auto-scroll settle period)
const SCROLL_SETTLE_MS = 500;

/**
 * Generic idle nudge hook.
 * Starts a timer after the last message matches the configured trigger type.
 * Sends a socket nudge:request if no interaction occurs within the timeout.
 *
 * Cancellation signals: user message, real scroll, chat closed, user typing.
 * Anti-spam: max 1 nudge per batch, configurable maxPerSession.
 *
 * @param {Object} config - Hook configuration
 * @param {Array} config.messages - Chat messages array
 * @param {Object} config.socketRef - Socket.io ref
 * @param {string} config.sessionId - Current session ID
 * @param {boolean} config.isOpen - Whether chat is open/visible
 * @param {Object} config.scrollRef - Ref to the scrollable chat container
 * @param {Object} config.inputRef - Ref to the message input element
 * @param {string} config.trigger - Message type that triggers nudge (default: products array check)
 * @param {number} config.timeout - Delay in ms before nudge fires
 * @param {number} config.maxPerSession - Max nudges per session
 * @param {number} config.scrollThreshold - Min scroll delta (px) to count as real interaction
 */
export function useIdleNudge({
  messages = [],
  socketRef,
  sessionId,
  isOpen = false,
  scrollRef,
  inputRef,
  trigger = 'PRODUCT_RESPONSE',
  timeout = DEFAULT_TIMEOUT,
  maxPerSession = DEFAULT_MAX_PER_SESSION,
  scrollThreshold = DEFAULT_SCROLL_THRESHOLD,
} = {}) {
  const timerRef = useRef(null);
  const settleTimerRef = useRef(null);
  const lastNudgedBatchRef = useRef(null);
  const nudgeCountRef = useRef(0);
  const scrollBaselineRef = useRef(null);

  // Clear all pending timers (nudge + scroll settle)
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    scrollBaselineRef.current = null;
  }, []);

  // Determine if a message matches the trigger condition
  const matchesTrigger = useCallback(
    (msg) => {
      if (!msg || msg.sender !== 'assistant') return false;
      // Check by type string match
      if (msg.type?.toUpperCase() === trigger.toUpperCase()) return true;
      // Check by products array presence (fallback for untyped product responses)
      if (
        trigger === 'PRODUCT_RESPONSE' &&
        Array.isArray(msg.products) &&
        msg.products.length > 0
      ) {
        return true;
      }
      return false;
    },
    [trigger],
  );

  // Main effect: watch messages array and manage timer
  useEffect(() => {
    // No nudge when chat is closed or disabled
    if (!isOpen || !socketRef?.current || !sessionId) {
      clearTimer();
      return;
    }

    const lastMsg = messages[messages.length - 1];

    // User message = cancel any pending timer
    if (lastMsg?.sender === 'user') {
      clearTimer();
      return;
    }

    // Check if last message matches trigger
    if (!matchesTrigger(lastMsg)) {
      clearTimer();
      return;
    }

    // Skip nudge if the server marked this response as not nudge-eligible
    // (e.g., HIGH confidence results or collection browsing)
    if (lastMsg.nudgeEligible === false) {
      return;
    }

    // Anti-spam: already nudged this batch?
    const batchId = String(lastMsg.id || '');
    if (batchId && lastNudgedBatchRef.current === batchId) {
      return;
    }

    // Anti-spam: session limit reached?
    if (nudgeCountRef.current >= maxPerSession) {
      return;
    }

    // Anti-spam: skip if it's a nudge message itself
    if (lastMsg.messageType === 'NUDGE' || lastMsg.type === 'NUDGE') {
      return;
    }

    // Start the timer
    clearTimer();

    // Delay scroll baseline capture to allow auto-scroll to settle.
    // Without this, the auto-scroll that shows product cards would trigger
    // the scroll cancellation and kill the timer immediately.
    scrollBaselineRef.current = null;
    settleTimerRef.current = setTimeout(() => {
      if (scrollRef?.current && timerRef.current) {
        scrollBaselineRef.current = scrollRef.current.scrollTop;
      }
      settleTimerRef.current = null;
    }, SCROLL_SETTLE_MS);

    timerRef.current = setTimeout(() => {
      // Final check before firing: input focus = user typing
      if (inputRef?.current && inputRef.current === document.activeElement) {
        return;
      }

      // Emit nudge request to server
      socketRef.current?.emit('nudge:request', {
        sessionId,
        triggerMessageId: batchId,
      });

      // Track for anti-spam
      lastNudgedBatchRef.current = batchId;
      nudgeCountRef.current += 1;
      timerRef.current = null;
    }, timeout);

    return () => clearTimer();
  }, [
    messages,
    isOpen,
    sessionId,
    socketRef,
    matchesTrigger,
    clearTimer,
    timeout,
    maxPerSession,
    inputRef,
    scrollRef,
    trigger,
  ]);

  // Scroll cancellation: real scroll (above threshold) cancels the timer
  useEffect(() => {
    const container = scrollRef?.current;
    if (!container || !isOpen) return;

    const handleScroll = () => {
      if (!timerRef.current) return;

      const baseline = scrollBaselineRef.current;
      if (baseline === null) return;

      const delta = Math.abs(container.scrollTop - baseline);
      if (delta > scrollThreshold) {
        clearTimer();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollRef, isOpen, scrollThreshold, clearTimer]);

  // Chat close/visibility change cancels the timer
  useEffect(() => {
    if (!isOpen) {
      clearTimer();
    }
  }, [isOpen, clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Reset nudge count on session change
  useEffect(() => {
    nudgeCountRef.current = 0;
    lastNudgedBatchRef.current = null;
  }, [sessionId]);
}
