# Iframe Bridge Rules (postMessage Security)

These rules ensure secure and reliable communication between the widget and the host website.

## 1. Message Format

- **Prefixing**: ALL messages sent via 'postMessage' MUST use a unique prefix: 'YUUME:' (e.g., '{ type: "YUUME:resize", ... }').
- **Payload Structure**: Use a consistent structure: '{ type: "YUUME:action", payload: { ... } }'.

## 2. Security

- **Hybrid Origin Validation**: ALWAYS validate 'event.origin' using a hybrid approach:
    - **Static Whitelist**: Use for official origins (e.g., dashboard, Shopify preview, CDN).
    - **Dynamic Validation**: Use for the merchant's domain. The authorized domain MUST be fetched from the backend and never trusted from the parent page's self-reporting.
- **Centralized Logic**: Origin validation logic must reside in 'config/bridge.js'.
- **No Sensitive Data**: Never send authentication tokens or sensitive user data via 'postMessage'.

## 3. Standard Actions

- **YUUME:resize**: Request the host to resize the iframe.
- **YUUME:close**: Request the host to hide or remove the widget.
- **YUUME:ready**: Notify the host that the widget is fully loaded.
- **YUUME:addToCart**: Request the host to add a product to cart (for Shopify integration).
- **YUUME:cartUpdate**: Sent from host to widget when the Shopify cart changes (polling + events).
