# Animation Rules (Framer Motion)

These rules define the animation patterns for yuume-widget.

## 1. Usage Guidelines

- **motion Components**: Use 'motion.div', 'motion.span', etc. for animated elements.
- **AnimatePresence**: Wrap conditionally rendered elements with 'AnimatePresence' for exit animations.

## 2. Performance

- **Hardware Acceleration**: Animate 'transform' and 'opacity' properties for GPU acceleration.
- **Layout Animations**: Use 'layout' prop sparingly; it can be expensive on large lists.

## 3. Consistency

- **Easing**: Use consistent easing curves (e.g., 'ease-out' for entrances, 'ease-in' for exits).
- **Duration**: Keep animations between 150ms-300ms for micro-interactions, longer for page transitions.
