# Code Quality Rules

These rules define the code style and quality standards for yuume-widget.

## 1. Linting & Formatting

- **ESLint**: No code should be committed if 'npm run lint' fails.
- **Prettier**: Run 'npm run format' before committing.

## 2. Imports

- **Order**: Organize imports: React first, then external libs, then internal modules, then styles.
- **ESM**: Use ES Modules exclusively ('import/export').

## 3. DRY Principle

- **Utils**: Generic helpers (color conversion, DOM helpers) MUST live in 'utils/'.
- **No Duplication**: If similar logic appears in multiple components, extract it to a hook or utility.
