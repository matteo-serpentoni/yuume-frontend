# Iframe Bridge Rules (postMessage Security)

These rules ensure secure and reliable communication between the widget and the host website.

## 1. Message Format

- **Prefixing**: ALL messages sent via 'postMessage' MUST use a unique prefix: 'YUUME:' (e.g., '{ type: "YUUME:resize", ... }').
- **Payload Structure**: Use a consistent structure: '{ type: "YUUME:action", payload: { ... } }'.

## 2. Security

- **Origin Validation**: When listening for 'message' events from the parent, ALWAYS validate 'event.origin' against a whitelist before processing. Store the whitelist in a central config (e.g., 'config/bridge.js').
- **No Sensitive Data**: Never send authentication tokens or sensitive user data via 'postMessage'.

## 3. Standard Actions

- **YUUME:resize**: Request the host to resize the iframe.
- **YUUME:close**: Request the host to hide or remove the widget.
- **YUUME:ready**: Notify the host that the widget is fully loaded.
- **YUUME:addToCart**: Request the host to add a product to cart (for Shopify integration).
