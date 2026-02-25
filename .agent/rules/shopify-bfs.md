# Shopify BFS Rules (Widget)

These rules ensure the yuume-widget meets Built for Shopify (BFS) performance and compatibility requirements on merchant storefronts.

## 1. Web Vitals Budget

Shopify evaluates how your app impacts the merchant's storefront performance. The widget MUST NOT degrade Core Web Vitals.

- **LCP (Largest Contentful Paint)**: The widget must not delay LCP. Load asynchronously with `defer` or dynamic `import()`. Never block the main thread during page load.
- **CLS (Cumulative Layout Shift)**: The widget must not cause layout shifts. Use fixed dimensions for the chat bubble/orb. Never inject elements that push page content around.
- **INP (Interaction to Next Paint)**: Click handlers in the widget must respond within 200ms. Avoid heavy synchronous computations on user interaction.

## 2. Script Weight

- **Total budget**: The widget script (JS + CSS) must stay under **50KB gzipped**. BFS reviewers flag apps that significantly impact page load.
- **No heavy dependencies**: Do not include full libraries when a subset suffices. Tree-shake aggressively.
- **Lazy load the chat UI**: Only the trigger (orb/button) loads on page start. The full chat UI loads on first interaction (click).
- **Monitor with each build**: Run `npm run build` and check the gzip size of every chunk. Flag regressions immediately.

## 3. Theme Compatibility

- **CSS isolation**: The widget MUST NOT leak CSS into the merchant's theme. Use iframe isolation or strict scoping (CSS Modules, unique prefixes).
- **No global styles**: Never set styles on `body`, `html`, `*`, or generic selectors that could affect the merchant's page.
- **Z-index range**: The widget's z-index must be high enough to appear above most theme elements but respect Shopify's own UI (checkout, admin bar). Use `z-index: 2147483000` range.
- **No theme conflicts**: Test the widget on multiple Shopify themes (Dawn, Debut, Brooklyn at minimum) to ensure visual compatibility.

## 4. Script Loading

- **Async loading**: The widget script tag must use `defer` attribute. Never use `async` (execution order matters) or bare `<script>` (blocks rendering).
- **No render-blocking**: The widget must not fetch data or execute DOM operations before the page's `DOMContentLoaded` event.
- **Fail silently**: If the widget's API is unreachable, the widget must hide itself gracefully. Never show error messages on the merchant's storefront. Never break the merchant's checkout flow.

## 5. Data & Privacy on Storefront (GDPR)

- **No tracking without consent**: Do not set cookies, localStorage keys, or use tracking APIs (analytics, fingerprinting) until the visitor has consented per the merchant's consent settings.
- **Shopify Customer Privacy API**: Use Shopify's `window.Shopify.customerPrivacy` API to check consent status before storing any data. Respect the merchant's consent configuration.
- **Minimal data collection**: Collect only what's needed for the active chat session (visitor message, session ID). No background data scraping, no behavioral tracking.
- **No persistent identifiers without consent**: Do not store visitor IDs across sessions unless the visitor has given explicit consent. Each page visit starts a fresh anonymous session by default.
- **Chat data deletion**: The widget must support the API's GDPR deletion flow. If a customer's data is deleted server-side (via `customers/redact` webhook), the widget must not re-create it.
- **Transparency**: If the chat asks for personal information (email for order tracking), clearly explain why it's needed and that it can be deleted upon request.

## 6. App Block / Theme Extension (Future)

When migrating from ScriptTag to Shopify Theme App Extensions:

- **Use App Blocks**: Implement the widget as an App Block so merchants can position it via the theme editor.
- **Settings schema**: Expose configuration (position, color, trigger style) via the block's `settings_schema.json`, not hardcoded.
- **No Liquid injection**: App Blocks render in a sandboxed context. Do not rely on Liquid variables from the merchant's theme.
