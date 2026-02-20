# Animation Rules (Framer Motion & WebGL)

These rules define the animation patterns for yuume-widget.

## 1. Framer Motion Usage

- **motion Components**: Use 'motion.div', 'motion.span', etc. for animated elements.
- **AnimatePresence**: Wrap conditionally rendered elements with 'AnimatePresence' for exit animations.

## 2. Performance

- **Hardware Acceleration**: Animate 'transform' and 'opacity' properties for GPU acceleration.
- **Layout Animations**: Use 'layout' prop sparingly; it can be expensive on large lists.

## 3. Consistency

- **Easing**: Use consistent easing curves (e.g., 'ease-out' for entrances, 'ease-in' for exits).
- **Duration**: Keep animations between 150ms-300ms for micro-interactions, longer for page transitions.

## 4. WebGL / RAF Loop

- **Throttle when idle**: RequestAnimationFrame loops MUST be throttled or paused when the animated element is not visible or minimized. Never run a 60fps loop for a hidden canvas.
- **Stop on hide**: When the WebGL canvas is hidden (e.g., 'display: none' on mobile card mode), the RAF loop must stop completely.
- **Constants outside components**: GLSL shaders, static configs, and heavy objects MUST be defined as module-level constants, not inside component bodies where they would be re-allocated on every render.
- **Adaptive resolution**: Canvas rendering resolution should match the visual size. Do not render a 600px canvas when the element is visually 132px.
