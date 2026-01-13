# Styling & Performance Rules

These rules define the styling patterns for yuume-widget, prioritizing performance and isolation.

## 1. Vanilla CSS over Tailwind

- **Core UI**: Use Vanilla CSS for all core UI components. This ensures total control over complex effects (glassmorphism, WebGL overlays) and keeps the bundle lean.
- **Isolation**: ALWAYS scope CSS to the component (e.g., using a specific class prefix like '.orb-' or '.chat-') to avoid conflicts with the host website's styles.

## 2. Performance & Weight

- **Minimalism**: Avoid heavy CSS libraries. Every byte counts for the host site's performance.
- **Modern CSS**: Leverage CSS Variables (Custom Properties) for dynamic theming (e.g., '--orb-theme-color').
- **GPU Acceleration**: Use 'transform' and 'opacity' for animations to leverage hardware acceleration.

## 3. WebGL Coordination

- **Synchronization**: Coordinate CSS colors with WebGL uniforms (see 'Orb.jsx') using CSS variables or color utilities.
- **Overlay Management**: Ensure high z-index management for UI layers sitting on top of the WebGL Orb.

## 4. Visual Consistency & Identity

- **Uniformity**: ALL interactive components (forms, cards, drawers) MUST share the same visual language: glassmorphism backgrounds (backdrop-filter), consistent border-radius (usually 20px), and subtle whitespace.
- **Ethereal Design**: Stick to the "Ethereal" theme: dark background with light glass layers, white primary text, and subtle accent colors. No solid, opaque colors for large bubbles unless specified.
- **Micro-interactions**: Use 'framer-motion' consistently for entry animations (y: 10 to 0) and hover states (subtle scale or brightness increases).
