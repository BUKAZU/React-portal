# Agents

## Project Overview

`bukazu-portal-react` is a TypeScript web component library that embeds the Bukazu booking portal (calendar, search, and reviews modules) into a website or application. It is currently built on React and published as an npm package.

## Language

All source code must be written in **TypeScript**. JavaScript files are not acceptable for new code. The TypeScript compiler is configured in `tsconfig.json` with `strict: true`; all code must satisfy strict type-checking with no `any` types unless absolutely unavoidable and explicitly justified with a comment. Note that `tsconfig.json` also has `allowJs: true` enabled **only** to support existing legacy JavaScript and necessary interop; do **not** add new `.js` source files, and prefer migrating any touched legacy JavaScript to TypeScript.

## Testing

All code must be covered by specs. Tests are written with **Jest** (configured in `jest.config.ts`) and run with:

```bash
npm test
```

- Every new module, component, utility, or helper must have a corresponding test file placed in a `__tests__` directory alongside the source file.
- Tests should cover all exported functions and component behaviour, including edge cases.
- Coverage is collected from `src/**/*.{ts,tsx}` and reported in `./coverage`. Aim for full coverage on every file you touch.

## Code Style

- Formatting is enforced by **Prettier** (`.prettierrc`).
- Linting is enforced by **ESLint** (`.eslintrc`).
- Run both before committing.

## Future Direction

The long-term goal is to **remove the React dependency** and migrate the codebase to **plain TypeScript** (using web standards / custom elements). When making changes:

- Prefer solutions that do not introduce additional React-specific patterns or deepen the dependency on React internals.
- Avoid adding new React-only libraries.
- Where practical, write business logic in framework-agnostic TypeScript modules so they can be reused after the React layer is removed.
