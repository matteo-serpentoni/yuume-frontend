# Socket.io Client Rules

These rules define the real-time communication patterns for yuume-widget.

## 1. Connection Management

- **Single Instance**: Maintain a single socket connection per widget instance.
- **Reconnection**: Handle 'disconnect' and 'reconnect' events gracefully to restore state.

## 2. Event Handling

- **Naming**: Mirror backend event names ('session:updated', 'message:received').
- **Cleanup**: Always remove event listeners in 'useEffect' cleanup to prevent memory leaks.

## 3. Room Joining

- **Session Scope**: Emit 'join_session' with 'sessionId' immediately after connection.
- **Dashboard Sync**: The widget should listen for 'session:updated' to reflect dashboard actions (e.g., agent assignment).
