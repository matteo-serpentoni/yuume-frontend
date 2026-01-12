# Component Architecture Rules

These rules define the React component patterns for yuume-widget.

## 1. Component Structure

- **Folder Pattern**: Each major component should have its own folder (e.g., 'components/Orb/Orb.jsx' with 'Orb.css').
- **Memoization**: Use 'memo()' for components that receive stable props to prevent unnecessary re-renders.
- **Lazy Loading**: Use 'React.lazy()' for heavy or dev-only components.
- **Error Boundaries**: Critical subtrees should be wrapped with 'ErrorBoundary' (see 'components/UI/ErrorBoundary.jsx') to prevent crashes from affecting the entire widget.

## 2. Props & State

- **Prop Drilling**: Avoid deep prop drilling. Use Context or custom hooks (e.g., 'useChat', 'useOrb') for shared state.
- **Callbacks**: Wrap callbacks with 'useCallback()' when passed as props to memoized children.
- **Refs for Performance**: Use 'useRef()' for values that shouldn't trigger re-renders (e.g., WebGL contexts, animation state).

## 3. File Naming

- **Components**: PascalCase (e.g., 'ChatMessage.jsx').
- **Hooks**: camelCase with 'use' prefix (e.g., 'useChat.js').
- **Utils**: camelCase (e.g., 'colorUtils.js').
