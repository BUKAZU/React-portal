# Copilot Instructions

See [AGENTS.md](../AGENTS.md) for full project conventions.

## Quick Reference

- **Language:** TypeScript only (`strict: true`). No plain JavaScript for new code.
- **Tests:** Every source file must have a matching Jest spec in a sibling `__tests__/` directory. Run tests with `npm test`.
- **Style:** Format with Prettier, lint with ESLint before committing.
- **Future goal:** Migrate away from React to a plain TypeScript / web-standards codebase. Avoid deepening React coupling in new code.
