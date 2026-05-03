# Base UI LLM Playbook

Purpose: high-signal implementation rules for coding agents working on `packages/react/src/**`.

## 1. Repository Context

- Source code for components and private utils is in `packages/react/`.
- Source code for public shared utils is in `packages/utils/`.
- Experiments are located at `docs/src/app/(private)/experiments/`. Use them for demos that require manual browser testing.
- Public documentation is located at `docs/src/app/(docs)/react/`. Update docs when changes must be visible to library users.
- When creating public demos on the docs, refer to the `hero` demo for the relevant component and largely follow its styles in both CSS Modules and Tailwind CSS variants.
- Before any changes, review `CONTRIBUTING.md` for repository-wide contribution details.

## 2. Repository Workflow

- Avoid duplicating logic where possible. If two components can share logic such as event handlers, define it in the parent and share it through context; reuse an existing context when one already fits.
- If a repository command fails because dependencies are unavailable, run `pnpm i` and retry.

## 3. Non-Negotiables

1. Use `'use client';` for client component files.
2. Import React as namespace: `import * as React from 'react';`.
3. Do not import React hooks directly; use `React.useState`, `React.useMemo`, etc.
4. Use Base UI wrappers when relevant:
   - `useIsoLayoutEffect` instead of `React.useLayoutEffect`
   - `useStableCallback` for handlers used in effects/event systems
   - `useTimeout` instead of `setTimeout`
   - `useAnimationFrame` instead of `requestAnimationFrame`
5. Use shadow DOM-safe DOM utilities in event/DOM logic: use `contains`, `getTarget`, and `activeElement` for traversal/targeting; use `ownerDocument` and `ownerWindow` instead of global `document`/`window` when code is tied to a DOM node.
6. Preserve `render` when using `useRenderElement`: pass original `componentProps` as arg 2; do not drop/rename-away `render`; do **not** pass a React component function (`render={MyComponent}`); pass an element (`render={<MyComponent />}`) or a render function (`render={(props) => <MyComponent {...props} />}`). `useRenderElement` emits a dev warning when an uppercase-named function is received.
7. Avoid `as any` unless unavoidable and justified.
8. Do **not** wrap `state` in `React.useMemo`. Compute it as a plain object on every render — memoizing it is unnecessary because `useRenderElement` only uses it for data-attribute mapping and class/style resolution.
9. Optional public props should be `?: T | undefined`.
10. Data attributes are presence-based (`data-disabled`, not `data-disabled="true"`).

## 4. Choose Component Shape

### Single-part component

Use when API is one primitive.

```text
component-name/
  index.ts
  ComponentName.tsx
  ComponentName.test.tsx
  ComponentNameDataAttributes.tsx (optional)
```

### Compound component

Use when API is namespaced (`Component.Root`, `Component.Item`, ...).

```text
component-name/
  index.ts
  index.parts.ts
  root/ComponentRoot.tsx
  root/ComponentRoot.test.tsx
  item/ComponentItem.tsx
  item/ComponentItem.test.tsx
  utils/* (optional)
```

## 5. Export Patterns

### Compound

`index.ts`

```ts
export * as Component from './index.parts';
export type * from './root/ComponentRoot';
export type * from './item/ComponentItem';
```

`index.parts.ts`

```ts
export { ComponentRoot as Root } from './root/ComponentRoot';
export { ComponentItem as Item } from './item/ComponentItem';
```

### Compound With Wrapped Shared Parts

Use when a public namespace (for example, `Autocomplete`) reuses internals from another component (for example, `Combobox`) but must own part identity and docs metadata.

Rules:

1. `index.parts.ts` should export owned part symbols from local wrapper files for public parts (`./trigger/AutocompleteTrigger`, not directly from `../combobox/...`) when those parts need component-specific docs/type identity.
2. Wrapper part files should re-export the shared implementation with an owned symbol (`export const AutocompleteTrigger = ComboboxTrigger as AutocompleteTrigger;`) and define local `State`, `Props`, and namespace types.
3. `index.ts` should export type surfaces from owned wrapper part files for those parts.
4. Keep purely shared internal-only parts re-exported from the shared component only when there is no public identity/docs requirement.

### Single-part

`index.ts`

```ts
export { ComponentName as ComponentName } from './ComponentName';
export type * from './ComponentName';
```

## 6. Implementation Templates

### DOM-rendering part

```tsx
'use client';
import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import type { BaseUIComponentProps } from '../../utils/types';
import { useRenderElement } from '../../utils/useRenderElement';

export interface ComponentPartState {
  disabled: boolean;
}

export interface ComponentPartProps extends BaseUIComponentProps<'button', ComponentPartState> {
  disabled?: boolean | undefined;
}

export const ComponentPart = React.forwardRef<HTMLButtonElement, ComponentPartProps>(
  function ComponentPart(componentProps, forwardedRef) {
    const { render, className, disabled = false, ...elementProps } = componentProps;

    const state: ComponentPartState = { disabled };

    const onClick = useStableCallback((event: React.MouseEvent) => {
      if (disabled) {
        event.preventDefault();
      }
    });

    return useRenderElement('button', componentProps, {
      state,
      ref: forwardedRef,
      props: [{ className, onClick }, elementProps],
    });
  },
);

export namespace ComponentPart {
  export type State = ComponentPartState;
  export type Props = ComponentPartProps;
}
```

### Root/provider wrapper

Use plain function when no DOM node is rendered by root itself.

## 7. Types and Namespaces

1. Public renderable parts should define explicit `State` and `Props`.
2. Namespace exports are the default for compound parts:
   - always include `State`, `Props`
   - include `ChangeEventDetails`, `ChangeReason`, `Actions`, `Parameters` when relevant
3. Keep public types local and explicit.

## 8. Context Pattern

1. Context shape should match consumer needs (not necessarily full root state).
2. Use `undefined` default and guard hook.
3. Throw clear `Base UI:` error on missing context.

```ts
export const PartContext = React.createContext<PartContextValue | undefined>(undefined);

export function usePartContext() {
  const context = React.useContext(PartContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: PartContext is missing. Component parts must be placed within <Component.Root>.',
    );
  }
  return context;
}
```

## 9. State, Data Attributes, Styling Contract

1. If render-state is public, pass `state` to `useRenderElement`.
2. Data attributes can come from:
   - default mapping (`stateKey: true -> data-statekey`)
   - explicit `stateAttributesMapping` (+ optional `*DataAttributes` enum)
3. In tests/CSS, use presence checks/selectors:
   - `toHaveAttribute('data-disabled')`
   - `[data-disabled] { ... }`

## 10. Accessibility: ARIA and Announcements

### Label Association for Hidden Inputs

When components have hidden file/input elements, expose an optional `id` prop to enable label association:

````tsx
export interface ComponentInputProps extends BaseUIComponentProps<'input', ComponentInputState> {
  /**
   * Optional custom id for the hidden input element.
   * If not provided, a unique id is auto-generated.
   *
   * Use this to associate a visible label with the input for accessibility:
   * ```tsx
   * <label htmlFor="my-input">Label text</label>
   * <Component.HiddenInput id="my-input" />
   * ```
   */
  id?: string | undefined;
}

export const ComponentHiddenInput = React.forwardRef(
  function ComponentHiddenInput(componentProps, forwardedRef) {
    const { id: idProp, ...elementProps } = componentProps;
    const { inputId } = useContext(); // auto-generated fallback

    return useRenderElement('input', componentProps, {
      props: [{ id: idProp ?? inputId, type: 'file' }, elementProps],
    });
  },
);
````

### Screen Reader Announcements for State Changes

For interactive components managing transient state (drag/drop, uploads, notifications), provide hidden `aria-live` regions to announce changes:

```tsx
// In parent component managing transient state
const [announcement, setAnnouncement] = React.useState<{ text: string; key: number }>({
  text: '',
  key: 0,
});

const handleDragEnter = useStableCallback((event: React.DragEvent) => {
  setAnnouncement((prev) => ({ text: 'Ready to drop files', key: prev.key + 1 }));
});

// In render:
return (
  <div>
    <div
      key={announcement.key}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px' }}
    >
      {announcement.text}
    </div>
    {/* component content */}
  </div>
);
```

### State Attribute Mapping with Explicit Types

When defining state attribute mappings, always include explicit type annotations for parameters:

```ts
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';

export const componentStateAttributesMapping: StateAttributesMapping<ComponentState> = {
  disabled(value: boolean): Record<string, string> | null {
    return value ? { 'data-disabled': '' } : null;
  },
  isDragging(value: boolean): Record<string, string> | null {
    return value ? { 'data-dragging': '' } : null;
  },
};
```

### ARIA Semantics and Documentation

Always document accessibility features in JSDoc:

````tsx
/**
 * Interactive drop target with keyboard and drag support.
 *
 * Features automatic accessibility announcements for drag state transitions.
 * Supports keyboard activation (Enter, Space) and drag-and-drop.
 *
 * @example
 * Accessible with label and ARIA:
 * ```tsx
 * <Component
 *   aria-label="Drop files to upload"
 *   onFilesDrop={handleFiles}
 * >
 *   Drop files or click to browse
 * </Component>
 * ```
 */
````

## 11. Controlled State and Events

1. Use `useControlled` for controlled/uncontrolled APIs.
2. For cancellable public changes, create details (`createChangeEventDetails`) and call external callback before internal commit.
3. Respect `details.isCanceled`.
4. Use `details.allowPropagation()` only when popup nesting requires it.
5. Use `event.preventBaseUIHandler()` only as escape hatch when no prop-based customization exists.

## 12. Testing Requirements

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
6. Do not call `await flushMicrotasks()` directly after `await render(...)` when there are no interactions or state changes between them; the immediate flush is unnecessary.
7. Follow the established filename convention: tests live next to the source file as `name.test.tsx`.
8. Tests use Vitest APIs only: `expect()`, `vi.fn()`, and `@testing-library/jest-dom` DOM matchers. Do not use Chai- or Sinon-style matcher chains or spies.
9. If tests require layout measurement or other browser-only behavior, restrict them to Chromium with `it.skipIf(isJSDOM)` or `describe.skipIf(isJSDOM)`.

Commands:

```bash
pnpm test:jsdom <ComponentOrFile> --no-watch
pnpm test:chromium <ComponentOrFile> --no-watch
```

Use `it.skipIf(isJSDOM)` / `describe.skipIf(isJSDOM)` for layout-dependent tests.

## 13. Docs and API Sync

1. Public props/types need JSDoc.
2. Include `@default` tags where defaults exist.
3. Keep docs snippets aligned with runtime behavior.
4. Keep docs anatomy in sync with part exports:
   - component anatomy snippets should include all public parts required for a minimal functional composition
   - if a new required/primary part is added (or part ownership changes), update anatomy docs in the same change
5. Keep Data Attributes docs synchronized with runtime:
   - when adding/changing public `*DataAttributes` enums or state mappings, update generated docs/types references accordingly
   - verify attribute names and semantics match runtime presence-based behavior
6. If public API/JSDoc changes, run:

```bash
pnpm docs:api
```

## 14. Error Message Rules (Public Packages)

1. Prefix with `Base UI: `.
2. Include what happened, why it matters, and how to fix.
3. Add docs link when applicable.
4. Use string concatenation for readability.
5. If any `Error(...)` message changes, run:

```bash
pnpm extract-error-codes
```

Important: if an update creates a new error code but the original and new message have the same semantics and argument count, update the existing entry in `error-codes.json` instead of creating a new code.

## 15. Demo Styling Guidelines

Every component ships two equivalent demo variants: **CSS Modules** (`css-modules/`) and **Tailwind CSS** (`tailwind/`). Both must be kept in sync.

### File structure

```text
demos/
  hero/
    css-modules/
      index.tsx
      index.module.css
    tailwind/
      index.tsx
```

### Code conventions

1. The default export is named `ExampleComponentName` (e.g. `ExampleSelect`, `ExampleNumberField`).
2. No `'use client'` directive unless the demo genuinely needs client-side state.
3. Import styles as a named object: `import styles from './index.module.css'`.
4. Only import from the public package path (`@base-ui/react/component-name`), never from internal paths.
5. Inline SVG icons as local named functions typed `(props: React.ComponentProps<'svg'>) => JSX.Element`. Keep them below the default export.
6. Static data (option lists, etc.) is defined as module-level constants above the component.
7. Use `React.useId()` for ID generation; import only the hooks actually needed.
8. Keep demos minimal — only include the parts required to illustrate the component's primary use case.

### CSS Modules conventions

1. **Class names match component part names** — `.Root`, `.List`, `.Item`, `.Button`, `.Label`, `.Popup`, etc. Use PascalCase.
2. **Color tokens only** — never hardcode hex/rgb values for gray, blue, or other theme colors. Always use `var(--color-gray-*)`, `var(--color-blue)`, `canvas`, etc.
3. **Interactive hover states** — always gate hover rules with `@media (hover: hover)` to avoid sticky hover on touch devices:
   ```css
   @media (hover: hover) {
     &:hover {
       background-color: var(--color-gray-100);
     }
   }
   ```
4. **Focus visible** — use `outline: 2px solid var(--color-blue)` with `outline-offset: -1px` (inset, for bordered controls) or `outline-offset: 2px` (outset, for controls without a visible border).
5. **Button resets** — bare interactive elements require: `box-sizing: border-box; border: 0; margin: 0; padding: 0; background-color: transparent; outline: 0; font: inherit; cursor: pointer; user-select: none;`.
6. **Dark mode** — use `@media (prefers-color-scheme: dark)` only for values that color tokens cannot handle (e.g. shadow colors, gradient stops). Avoid duplicating rules that tokens already cover.
7. **Popup shadows** — place `box-shadow` inside `@media (prefers-color-scheme: light)` so shadows don't appear on dark backgrounds.
8. **Data attribute selectors** — use presence-based selectors: `[data-checked]`, `[data-disabled]`, `[data-pressed]`, etc. Never `[data-checked="true"]`.
9. **CSS nesting** — use native CSS nesting (`& :hover { }`) for pseudo-classes, pseudo-elements, and data attributes within a rule.
10. **Container pattern** (toolbar, toggle group, panel) — `border: 1px solid var(--color-gray-200); background-color: var(--color-gray-50); border-radius: 0.375rem; padding: 0.125rem; gap: 1px;`.
11. **No decorative wrapper** — do not add gradients, outer shadows, or a rounded pill container around the demo component itself unless the component genuinely provides that surface (e.g. a card or sheet). Place the component directly.

### Design system values

| Property            | Common values                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------- |
| Border radius       | `0.25rem` (xs), `0.375rem` (sm/md), `9999px` (pill/circle)                                  |
| Control height      | `2rem` (compact), `2.5rem` (standard)                                                       |
| Control width       | `2rem` / `2.5rem` for icon buttons; explicit widths for inputs                              |
| Gap between items   | `0.25rem` (`gap-1`) for tight groups; `0.5rem` (`gap-2`) for loose groups                   |
| Text (label)        | `font-size: 0.875rem; line-height: 1.25rem; font-weight: 700; color: var(--color-gray-900)` |
| Body text           | `font-size: 1rem; line-height: 1.5rem; font-weight: 400`                                    |
| Transition duration | `150ms` (default UI); `125ms` for spring-like (switch track)                                |

### Tailwind CSS conventions

1. Mirror the same layout and visual structure as the CSS Modules variant exactly.
2. Use Tailwind's `data-[state]:utility` variants for data attributes: `data-[checked]:bg-gray-900`, `data-[disabled]:opacity-45`.
3. For hover, use the standard `hover:` variant — Tailwind's `@media (hover: hover)` wrapping is implicit with `hover:`.
4. For complex child selectors (lists, buttons inside a list), use arbitrary variants: `[&>li>button]:size-8`.
5. Focus visible: `focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-800` (inset) or `focus-visible:outline-offset-2` (outset).
6. Do not add a Root-level container className unless the Root itself is the styled surface.

## 16. Quality Gates Before Commit

Run what applies:

```bash
pnpm eslint
pnpm typescript
pnpm stylelint
pnpm markdownlint
pnpm prettier
```

Also run relevant component tests (JSDOM and Chromium when needed).

## 17. Commit Guidelines

- Commit messages follow `[scope] Imperative summary` (for example `[popover] Fix focus trap`). Choose scopes that mirror the package or component changed.
- Use `[all components]` for changes that broadly affect most components.

## 18. Wrapper Parts (Container + Inner Interactive Element)

Use when semantic HTML requires a container element wrapping an interactive child (e.g. `<li>` + `<button>`).

1. **`useRenderElement` wraps the outer container** — pass `componentProps`, `state`, `ref`, and `{ children: innerElement }`.
2. **`useButton` drives the inner element** — spread `getButtonProps` and attach `buttonRef`; do not set `disabled` or `tabIndex` manually.
3. **State attributes land on the container** — `data-disabled` etc. come from `useRenderElement`; native `disabled` comes from `getButtonProps`.
4. **Hooks cannot be called inside render loops** — for buttons rendered in a map callback, use native `<button disabled>` instead; a disabled native button is already removed from tab order.
5. **Non-interactive siblings inherit list text color** — container siblings with no interactive child (e.g. an ellipsis `<li>`) don't receive the button's explicit color. Target them with `:not(:has(button))` in CSS to set the matching color explicitly.

## 19. Fragment-Rendering Parts

Use when a part renders multiple peer elements rather than a single DOM node (no ref to forward).

1. **Plain function, not `forwardRef`** — return type is `React.ReactElement`.
2. **Wrap output in `<React.Fragment>`**.
3. **No hooks inside render loops** — map callbacks are not hook-safe; use native attributes directly.
4. **Keep rendered item count stable** — if the number of visible items can vary (e.g. page buttons with optional ellipses), compensate elsewhere so the total stays constant and layout doesn't shift.

## 20. Fast Agent Checklist

1. Choose the right shape: single-part, compound, wrapper part, fragment-rendering part, or root-only provider.
2. Follow the nearest existing component pattern and share logic through context instead of duplicating it.
3. Preserve the `render` + `useRenderElement` contract and keep state/data attributes aligned with runtime behavior.
4. Keep public APIs explicit: local `State`/`Props`, accurate JSDoc/defaults, and the right namespace/export shape.
5. Apply the relevant accessibility and state patterns: context guards, controlled/cancellable events, ARIA semantics, and label/live-region support when needed.
6. Keep adjacent surfaces in sync: source, tests, docs/API output, and both demo variants when public behavior or visuals change.
7. Run the smallest relevant validation first, then the applicable quality gates and component tests before finishing.
