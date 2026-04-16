# Self Brain Sync Rules

Jarbris has a "Self Brain" — a knowledge layer in `jarbris-api/services/selfBrain/` that describes its own UI elements, capabilities, and privacy behavior. This data is used to answer user questions like "what does this button do?" or "how do I register?".

## 1. When Widget Changes Trigger API Updates

Any change to the following areas in the widget **MUST** trigger a corresponding update in the API's Self Brain registries:

| Widget Change | API Registry to Update |
|---|---|
| New button, toggle, or interactive element | `jarbrisUiRegistry.js` |
| Renamed or removed UI element | `jarbrisUiRegistry.js` (update labels/aliases) |
| Changed visibility rules (e.g. shown only when logged in) | `jarbrisUiRegistry.js` (`whenVisible` field) |
| New user flow (e.g. new onboarding step) | `actionRegistry.js` |
| Modified profile/registration flow | `jarbrisUiRegistry.js` + `actionRegistry.js` |
| Changed consent toggle behavior or placement | `privacyConsentFacts.js` + `actionRegistry.js` |

## 2. What to Do

When your widget change affects any of the above:

1. **Flag it** in the implementation plan: "This change requires a Self Brain update in `jarbris-api`"
2. **Specify which registries** need updating
3. **Include the update** in the same task if possible, or create a follow-up task

## 3. Why This Matters

> [!WARNING]
> Self Brain staleness is a **silent bug**. Jarbris will give wrong or outdated answers about its own UI — but no error is thrown, no test fails, and no console warning appears. The only symptom is a bad user experience.
