# Component Architecture Rules

These rules define the React component patterns for yuume-widget.

## 1. Component Structure

- **Folder Pattern**: Each major component should have its own folder (e.g., 'components/Orb/Orb.jsx' with 'Orb.css').
- **Memoization**: Use 'memo()' for components that receive stable props to prevent unnecessary re-renders.
- **Lazy Loading**: Use 'React.lazy()' for heavy or dev-only components.

## 2. Props & State

- **Prop Drilling**: Avoid deep prop drilling. Use Context or custom hooks (e.g., 'useChat', 'useOrb') for shared state.
- **Callbacks**: Wrap callbacks with 'useCallback()' when passed as props to memoized children.
- **Refs for Performance**: Use 'useRef()' for values that shouldn't trigger re-renders (e.g., WebGL contexts, animation state).

## 3. Resilience & Error Handling

- **Silent Error Boundaries**: Critical subtrees should be wrapped with 'ErrorBoundary'.
- **Graceful Failure**: The global ErrorBoundary MUST render 'null' on error. It is better for the widget to disappear than to show a broken UI on the merchant's site.

## 4. Centralized Icons

- **No inline SVGs**: SVG icons MUST be defined as named exports in 'components/UI/Icons.jsx', not hardcoded inline in component JSX.
- **Incremental migration**: When modifying a file that has inline SVGs, extract them to 'Icons.jsx' in the same PR. Do not do bulk refactors.
- **Naming**: Use descriptive PascalCase names (e.g., 'ChevronLeft', 'CartIcon', 'ThumbsUp').

## 5. File Naming

- **Components**: PascalCase (e.g., 'ChatMessage.jsx').
- **Hooks**: camelCase with 'use' prefix (e.g., 'useChat.js').
- **Utils**: camelCase (e.g., 'colorUtils.js').
