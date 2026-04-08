# AGENTS.md

## Cursor Cloud specific instructions

This is a **pure TypeScript library** (`@grom.js/tgx`) — a JSX runtime for composing Telegram Bot messages. There are no services, databases, or Docker containers.

### Key commands

All commands are in `package.json` scripts. Quick reference:

| Task | Command |
|---|---|
| Install deps | `pnpm install --frozen-lockfile` |
| Lint | `pnpm run lint` |
| Typecheck | `pnpm run typecheck` |
| Test | `pnpm run test` (watch mode) or `pnpm run test -- --run` (single run) |
| Build | `pnpm run build` |

### Gotchas

- **TypeScript is not a direct devDependency** — it is resolved transitively via `@antfu/eslint-config`. The `tsc` binary is not accessible via `pnpm exec`. The update script installs `typescript` globally to make `tsc` available for `build` and `typecheck` scripts.
- **esbuild postinstall**: pnpm may warn about ignored build scripts for `esbuild`. This does not affect vitest (which bundles its own esbuild wasm fallback) but may emit a warning during install.
- **Vitest runs in watch mode by default** — use `pnpm run test -- --run` for a single pass.
- **ESM only** — the package uses `"type": "module"`. All dist output is ESM.
