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
5. Preserve `render` when using `useRenderElement`:
   - pass original `componentProps` as arg 2
   - do not drop/rename-away `render`
6. Avoid `as any` unless unavoidable and justified.
7. Optional public props should be `?: T | undefined`.
8. Data attributes are presence-based (`data-disabled`, not `data-disabled="true"`).

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

export interface ComponentPartProps
  extends BaseUIComponentProps<'button', ComponentPartState> {
  disabled?: boolean | undefined;
}

export const ComponentPart = React.forwardRef<HTMLButtonElement, ComponentPartProps>(
  function ComponentPart(componentProps, forwardedRef) {
    const { render, className, disabled = false, ...elementProps } = componentProps;

    const state: ComponentPartState = React.useMemo(
      () => ({ disabled }),
      [disabled],
    );

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

## 8. Controlled State and Events

1. Use `useControlled` for controlled/uncontrolled APIs.
2. For cancellable public changes, create details (`createChangeEventDetails`) and call external callback before internal commit.
3. Respect `details.isCanceled`.
4. Use `details.allowPropagation()` only when popup nesting requires it.
5. Use `event.preventBaseUIHandler()` only as escape hatch when no prop-based customization exists.

## 9. Testing Requirements

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

## 10. Docs and API Sync

1. Public props/types need JSDoc.
2. Include `@default` tags where defaults exist.
3. Keep docs snippets aligned with runtime behavior.
4. If public API/JSDoc changes, run:

```bash
pnpm docs:api
```

## 11. Error Message Rules (Public Packages)

1. Prefix with `Base UI: `.
2. Include what happened, why it matters, and how to fix.
3. Add docs link when applicable.
4. If any `Error(...)` message changes, run:

```bash
pnpm extract-error-codes
```

## 12. Quality Gates Before Commit

Run what applies:

```bash
pnpm eslint
pnpm typescript
pnpm stylelint
pnpm markdownlint
pnpm prettier
```

Also run relevant component tests (JSDOM and Chromium when needed).

## 13. Fast Agent Checklist

1. Choose shape: single-part or compound.
2. Follow nearest existing component pattern.
3. Preserve `render` + `useRenderElement` contract.
4. Keep public types/JSDoc/defaults accurate.
5. Use presence-based data-attribute selectors/assertions.
6. Add/adjust tests for behavior + accessibility.
7. Run quality gates and relevant tests.
