# Performance Rules

These rules define the performance standards for yuume-widget. The widget runs as an iframe on merchant sites, so performance directly impacts the merchant's customers.

## 1. Bundle Size

- **Awareness**: Monitor bundle size after every dependency change. Run 'npm run build' and check gzip sizes.
- **Dev-only imports**: Libraries used only in development (e.g., 'why-did-you-render') MUST use dynamic imports inside 'import.meta.env.DEV' checks to ensure they are tree-shaken from production builds.
- **Dead code**: Run 'npm run knip' periodically to identify and remove unused exports, files, and dependencies.

## 2. React Rendering

- **Memoize list items**: Components rendered inside '.map()' loops should use 'React.memo' to prevent cascading re-renders.
- **Stable references**: Objects and arrays passed as props should be memoized with 'useMemo', and callbacks with 'useCallback', to avoid breaking 'React.memo' on child components.
- **WDYR**: The project includes 'why-did-you-render' which tracks unnecessary re-renders in dev mode. Check the browser console for WDYR logs after making state/prop changes.

## 3. WebGL & Canvas

- **RAF lifecycle**: The requestAnimationFrame loop must follow the component visibility lifecycle: run at full speed when visible, throttle when minimized, stop when hidden.
- **Resolution matching**: Canvas resolution must match the current visual size, not the maximum possible size. Resize the canvas when the component state changes.
- **Resource allocation**: Heavy objects (shaders, programs, geometries) must be allocated once at module level or in a ref, never inside the render cycle.

## 4. CSS & Rendering Pipeline

- **Compositor-only animations**: Prefer animating 'transform' and 'opacity' (compositor thread) over 'width', 'height', 'top', 'left' (main thread + layout).
- **Avoid layout thrashing**: Do not read then write DOM properties in rapid succession. Batch reads and writes separately.
- **Mobile GPU budget**: Mobile devices have limited GPU memory. Reduce 'backdrop-filter' blur radius, disable continuous CSS animations, and minimize 'will-change' declarations on mobile.

## 5. Memory Management

- **No leaks**: Every subscription (event listeners, timers, sockets) must be cleaned up. This is non-negotiable for a long-lived widget.
- **Bounded caches**: Module-level Maps/Sets must have a size cap with eviction.
- **Profiling**: Use Chrome DevTools Memory tab (Heap Snapshots) to verify no leaks: open/close the chat 10 times and compare snapshots.
