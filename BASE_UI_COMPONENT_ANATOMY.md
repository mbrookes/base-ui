# Base UI Component Anatomy (LLM Playbook)

Purpose: high-signal implementation rules for coding agents working on `packages/react/src/**`.

## 1. Non-Negotiables

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

## 2. Choose Component Shape

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

## 3. Export Patterns

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

## 4. Implementation Templates

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

## 5. Types and Namespaces

1. Public renderable parts should define explicit `State` and `Props`.
2. Namespace exports are the default for compound parts:
   - always include `State`, `Props`
   - include `ChangeEventDetails`, `ChangeReason`, `Actions`, `Parameters` when relevant
3. Keep public types local and explicit.

## 6. Context Pattern

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

## 7. State, Data Attributes, Styling Contract

1. If render-state is public, pass `state` to `useRenderElement`.
2. Data attributes can come from:
   - default mapping (`stateKey: true -> data-statekey`)
   - explicit `stateAttributesMapping` (+ optional `*DataAttributes` enum)
3. In tests/CSS, use presence checks/selectors:
   - `toHaveAttribute('data-disabled')`
   - `[data-disabled] { ... }`

## 8. Accessibility: ARIA and Announcements

### Label Association for Hidden Inputs

When components have hidden file/input elements, expose an optional `id` prop to enable label association:

```tsx
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

export const ComponentHiddenInput = React.forwardRef(function ComponentHiddenInput(
  componentProps,
  forwardedRef,
) {
  const { id: idProp, ...elementProps } = componentProps;
  const { inputId } = useContext(); // auto-generated fallback

  return useRenderElement('input', componentProps, {
    props: [{ id: idProp ?? inputId, type: 'file' }, elementProps],
  });
});
```

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

```tsx
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
```

## 9. Controlled State and Events

1. Use `useControlled` for controlled/uncontrolled APIs.
2. For cancellable public changes, create details (`createChangeEventDetails`) and call external callback before internal commit.
3. Respect `details.isCanceled`.
4. Use `details.allowPropagation()` only when popup nesting requires it.
5. Use `event.preventBaseUIHandler()` only as escape hatch when no prop-based customization exists.

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

## 12. Error Message Rules (Public Packages)

1. Prefix with `Base UI: `.
2. Include what happened, why it matters, and how to fix.
3. Add docs link when applicable.
4. If any `Error(...)` message changes, run:

```bash
pnpm extract-error-codes
```

## 13. Quality Gates Before Commit

Run what applies:

```bash
pnpm eslint
pnpm typescript
pnpm stylelint
pnpm markdownlint
pnpm prettier
```

Also run relevant component tests (JSDOM and Chromium when needed).

## 14. Fast Agent Checklist

1. Choose shape: single-part or compound.
2. Follow nearest existing component pattern.
3. Preserve `render` + `useRenderElement` contract.
4. Keep public types/JSDoc/defaults accurate.
5. Use presence-based data-attribute selectors/assertions.
6. Add/adjust tests for behavior + accessibility.
7. Run quality gates and relevant tests.
