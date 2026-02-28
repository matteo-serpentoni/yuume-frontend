# Widget Security Rules

These rules define the security standards specific to yuume-widget, which runs as an embedded iframe on third-party merchant sites.

## 1. iframe Isolation

- **Origin validation**: All `postMessage` communication MUST validate the `event.origin` against the merchant's registered domain. Never accept messages from unknown origins.
- **Message schema**: Incoming bridge messages must be validated against a known schema before processing. Reject any message with unexpected structure or types.
- **Sandbox awareness**: The widget iframe relies on specific sandbox permissions. Never assume capabilities (e.g., `allow-top-navigation`) that aren't explicitly granted.

## 2. XSS Prevention

- **No `dangerouslySetInnerHTML`**: Never render raw HTML from API responses or merchant configuration. If rich text is needed, use a sanitization library with a strict tag whitelist.
- **Exception**: `FormattedText` (`components/Message/FormattedText.jsx`) is the only authorized component to use `dangerouslySetInnerHTML`. It renders through `processMessage()` which escapes all HTML before converting safe markdown patterns (bold, italic, links, code). All other components MUST use `<FormattedText>` instead of calling `processMessage` or `dangerouslySetInnerHTML` directly.
- **User-generated content**: Chat messages from users are plain text. Always render them as text nodes, never as HTML. Use React's default escaping.
- **Merchant content**: Product descriptions from Shopify may contain HTML. Strip all tags before rendering in chat bubbles. Display only plain text content.

## 3. Data Storage

- **No localStorage for tokens**: Session identifiers and auth tokens must be stored in memory (React state/context) only. `localStorage` is shared across the merchant's domain and could leak data.
- **No cookies**: The widget must not set any cookies on the merchant's domain.
- **Session ephemeral**: Chat session data lives in memory for the duration of the page visit. When the page is closed, session state is lost (by design).

## 4. CSP Compliance

- **No `eval()`**: The widget code must never use `eval()`, `new Function()`, or any pattern requiring `unsafe-eval` in the merchant's CSP.
- **Inline styles**: Prefer CSS classes and CSS-in-JS solutions that don't require `unsafe-inline` style CSP. If inline styles are unavoidable, keep them minimal.
- **External resources**: All external resources (fonts, images) must be loaded over HTTPS. Never reference HTTP resources.

## 5. Network Security

- **API base URL**: The API endpoint must come from the build-time configuration, never from the merchant's page or URL parameters.
- **No credentials leakage**: Never include merchant API keys, Shopify tokens, or backend credentials in the widget bundle. The widget authenticates via its own session mechanism.
- **Error messages**: Never display raw error messages from the API to the end user. Show generic friendly messages and log details to console in dev mode only.
