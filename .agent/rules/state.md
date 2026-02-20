# State & Hooks Rules

These rules define the state management patterns for yuume-widget.

## 1. Custom Hooks

- **Centralization**: Complex logic (e.g., chat flow, socket connections) MUST live in custom hooks in 'hooks/'.
- **Naming**: Hooks must start with 'use' (e.g., 'useChat', 'useOrb').
- **Single Responsibility**: Each hook should handle one concern (e.g., 'useChat' for messaging, 'useOrb' for visual state).

## 2. API Calls

- **Service Layer**: All API calls must go through 'services/' (e.g., 'chatApi.js'). Components should not use 'fetch' directly.
- **Error Handling**: API errors should be caught in hooks and exposed as state (e.g., 'error', 'isLoading').

## 3. Side Effects & Cleanup

- **Cleanup**: Always return cleanup functions from 'useEffect' when subscribing to events or intervals.
- **Dependencies**: Be explicit about 'useEffect' dependencies to avoid stale closures.
- **Timer cleanup**: Every 'setTimeout' and 'setInterval' MUST be cleared in the 'useEffect' cleanup function. Collect timer IDs in an array if there are multiple timers.
- **Event listener cleanup**: Use named function references for 'addEventListener' / 'removeEventListener'. Anonymous arrow functions cannot be correctly removed and will cause memory leaks.

## 4. Caching & Memory

- **Cap module-level caches**: Any module-level 'Map' or 'Set' used for caching MUST have a size limit (e.g., 50 entries). Implement LRU eviction by deleting the oldest key when the limit is exceeded.
- **No unbounded growth**: Never allow a data structure to grow indefinitely during a user session. This is especially critical for the widget, which may stay loaded for hours on a merchant's site.
