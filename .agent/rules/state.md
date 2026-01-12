# State & Hooks Rules

These rules define the state management patterns for yuume-widget.

## 1. Custom Hooks

- **Centralization**: Complex logic (e.g., chat flow, socket connections) MUST live in custom hooks in 'hooks/'.
- **Naming**: Hooks must start with 'use' (e.g., 'useChat', 'useOrb').
- **Single Responsibility**: Each hook should handle one concern (e.g., 'useChat' for messaging, 'useOrb' for visual state).

## 2. API Calls

- **Service Layer**: All API calls must go through 'services/' (e.g., 'chatApi.js'). Components should not use 'fetch' directly.
- **Error Handling**: API errors should be caught in hooks and exposed as state (e.g., 'error', 'isLoading').

## 3. Side Effects

- **Cleanup**: Always return cleanup functions from 'useEffect' when subscribing to events or intervals.
- **Dependencies**: Be explicit about 'useEffect' dependencies to avoid stale closures.
