# Delivery and Verification

## 10. Testing Requirements

1. Co-locate tests with part/component.
2. Use `vitest` + Testing Library.
3. Use `describeConformance` where applicable.
4. Cover at minimum:
   - rendering and accessibility roles/attributes
   - keyboard + pointer behavior
   - disabled behavior
   - data attributes
   - ref forwarding (DOM-rendering parts)
   - context guard errors (context consumers)
5. Prefer `screen.getByRole` over structural selectors.

Commands:

```bash
pnpm test:jsdom <ComponentOrFile> --no-watch
pnpm test:chromium <ComponentOrFile> --no-watch
```

Use `it.skipIf(isJSDOM)` / `describe.skipIf(isJSDOM)` for layout-dependent tests.

## 11. Docs and API Sync

1. Public props/types need JSDoc.
2. Include `@default` tags where defaults exist.
3. Keep docs snippets aligned with runtime behavior.
4. Keep docs anatomy in sync with part exports.
5. Keep Data Attributes docs synchronized with runtime.
6. If public API/JSDoc changes, run:

```bash
pnpm docs:api
```

## 12. Error Message Rules (Public Packages)

1. Prefix with `Base UI: `.
2. Include what happened, why it matters, and how to fix.
3. Add docs link when applicable.
4. If any `Error(...)` message changes, run:

```bash
pnpm extract-error-codes
```

## 14. Quality Gates Before Commit

Run what applies:

```bash
pnpm eslint
pnpm typescript
pnpm stylelint
pnpm markdownlint
pnpm prettier
```

Also run relevant component tests (JSDOM and Chromium when needed).
