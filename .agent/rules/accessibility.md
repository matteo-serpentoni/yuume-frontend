# Accessibility (A11y) Rules

These rules ensure the widget is usable by everyone, including keyboard and screen reader users.

## 1. Keyboard Navigation

- **Focus Management**: All interactive elements (buttons, inputs, the Orb) MUST be focusable via Tab key.
- **Keyboard Activation**: Buttons must respond to Enter and Space keys. Use 'onKeyDown' handlers where needed.
- **Focus Trap**: When the chat is open, consider trapping focus inside the widget to prevent users from accidentally tabbing out.

## 2. ARIA Attributes

- **Labels**: Every interactive element without visible text MUST have an 'aria-label' (e.g., 'aria-label="Invia messaggio"').
- **Live Regions**: Use 'aria-live="polite"' for new incoming messages so screen readers announce them.
- **Roles**: Use semantic roles ('role="button"', 'role="dialog"') for custom interactive elements.

## 3. Visual Accessibility

- **Contrast**: Ensure sufficient color contrast for text on all backgrounds.
- **Focus Indicators**: Never remove the default focus outline without providing a visible alternative.
