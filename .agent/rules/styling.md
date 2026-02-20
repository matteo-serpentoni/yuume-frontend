# Styling & Performance Rules

These rules define the styling patterns for yuume-widget, prioritizing performance and isolation.

## 1. Vanilla CSS over Tailwind

- **Core UI**: Use Vanilla CSS for all core UI components. This ensures total control over complex effects (glassmorphism, WebGL overlays) and keeps the bundle lean.
- **Isolation**: ALWAYS scope CSS to the component (e.g., using a specific class prefix like '.orb-' or '.chat-') to avoid conflicts with the host website's styles.

## 2. Performance & Weight

- **Minimalism**: Avoid heavy CSS libraries. Every byte counts for the host site's performance.
- **Modern CSS**: Leverage CSS Variables (Custom Properties) for dynamic theming (e.g., '--orb-theme-color').
- **GPU Acceleration**: Use 'transform' and 'opacity' for animations to leverage hardware acceleration.

## 3. CSS Performance Rules

- **No 'transition: all'**: ALWAYS specify exact properties (e.g., 'transition: opacity 0.3s, transform 0.3s'). 'transition: all' forces the browser to check every property on every frame.
- **'will-change' sparingly**: Only apply 'will-change' to elements that are actively animating. Remove it on mobile when not needed to reduce GPU memory pressure.
- **'backdrop-filter' awareness**: 'backdrop-filter: blur()' is GPU-intensive, especially on mobile. Use reduced blur values on mobile (e.g., 12px instead of 20px) or replace with opaque backgrounds where the visual difference is negligible.
- **Mobile-first performance**: Always test CSS changes on mobile. Disable expensive effects (continuous animations, large blurs, multiple filters) on mobile when they don't add meaningful visual value.

## 4. WebGL Coordination

- **Synchronization**: Coordinate CSS colors with WebGL uniforms (see 'Orb.jsx') using CSS variables or color utilities.
- **Overlay Management**: Ensure high z-index management for UI layers sitting on top of the WebGL Orb.

## 5. Visual Consistency & Identity

- **Uniformity**: ALL interactive components (forms, cards, drawers) MUST share the same visual language: glassmorphism backgrounds (backdrop-filter), consistent border-radius (usually 20px), and subtle whitespace.
- **Ethereal Design**: Stick to the "Ethereal" theme: dark background with light glass layers, white primary text, and subtle accent colors. No solid, opaque colors for large bubbles unless specified.
- **Micro-interactions**: Use 'framer-motion' consistently for entry animations (y: 10 to 0) and hover states (subtle scale or brightness increases).
