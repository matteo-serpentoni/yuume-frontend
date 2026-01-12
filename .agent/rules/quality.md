# Code Quality Rules

These rules define the code style and quality standards for yuume-widget.

## 1. Linting & Formatting

- **ESLint**: No code should be committed if 'npm run lint' fails.
- **Prettier**: Run 'npm run format' before committing.

## 2. Imports

- **Order**: Organize imports: React first, then external libs, then internal modules, then styles.
- **ESM**: Use ES Modules exclusively ('import/export').

## 3. DRY Principle & UI Consistency

- **Utils**: Generic helpers (color conversion, DOM helpers) MUST live in 'utils/'.
- **UI Atoms**: Re-use core building blocks (e.g., 'MessageBubble', 'Drawer') instead of duplicating CSS or structural HTML. This ensures project-wide visual consistency.
- **No Duplication**: If similar logic or styling appears in multiple components, extract it to a shared component, hook, or utility.
