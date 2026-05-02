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

## 11. Docs and API Sync

1. Public props/types need JSDoc.
2. Include `@default` tags where defaults exist.
3. Keep docs snippets aligned with runtime behavior.
4. Keep docs anatomy in sync with part exports.
5. Keep Data Attributes docs synchronized with runtime.
