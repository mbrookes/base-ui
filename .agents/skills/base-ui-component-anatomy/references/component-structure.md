# Component Structure

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
8. Do **not** wrap `state` in `React.useMemo`. Compute it as a plain object on every render.
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

Use when a public namespace reuses internals from another component but must own part identity and docs metadata.

1. `index.parts.ts` should export owned part symbols from local wrapper files for public parts.
2. Wrapper part files should re-export the shared implementation with an owned symbol and define local `State`, `Props`, and namespace types.
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

1. Context shape should match consumer needs.
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
2. Data attributes can come from default mapping or explicit `stateAttributesMapping`.
3. In tests/CSS, use presence checks/selectors:
   - `toHaveAttribute('data-disabled')`
   - `[data-disabled] { ... }`
