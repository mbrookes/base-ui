# The Anatomy of a Base UI Component

This document provides a comprehensive guide for creating new Base UI components that follow established conventions and best practices. Use this as a reference when building new components to ensure consistency across the codebase.

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [File Organization](#file-organization)
3. [Component Implementation](#component-implementation)
4. [Type Definitions](#type-definitions)
5. [Context Pattern](#context-pattern)
6. [State Management](#state-management)
7. [Event Handling](#event-handling)
8. [Export Strategy](#export-strategy)
9. [Data Attributes](#data-attributes)
10. [Testing](#testing)
11. [Documentation](#documentation)
12. [PR Readiness / Quality Gates](#pr-readiness--quality-gates)
13. [Code Conventions](#code-conventions)

---

## Directory Structure

### Component Root Directory

Every component has its own directory under `packages/react/src/` with this structure:

```plaintext
component-name/
├── index.ts                          # Main barrel export file
├── index.parts.ts                    # Namespace exports for subcomponents
├── subcomponent-a/
│   ├── SubcomponentA.tsx            # Component implementation
│   ├── SubcomponentA.test.tsx       # Component tests
│   ├── SubcomponentADataAttributes.ts  # Data attribute enum
│   └── SubcomponentAContext.ts      # Context (if component provides one)
├── subcomponent-b/
│   ├── SubcomponentB.tsx
│   ├── SubcomponentB.test.tsx
│   └── SubcomponentBDataAttributes.ts
└── utils/                            # Component-specific utilities (optional)
    └── helper.ts
```

**Key Rules:**

- Each subcomponent gets its own subdirectory
- Directory names use kebab-case: `file-upload`, `checkbox-root`
- File names use PascalCase matching the component: `FileUploadRoot.tsx`
- Test files are co-located with their components: `FileUploadRoot.test.tsx`
- For each component or subcomponent that uses data attributes, a corresponding DataAttributes file is present: `SubcomponentNameDataAttributes.ts`

---

## File Organization

### Main Export File (`index.ts`)

Purpose: Main entry point that exports the component namespace and type definitions.

```typescript
export * as ComponentName from './index.parts';

export type * from './root/ComponentRoot';
export type * from './subcomponent/Subcomponent';
// ... export types from all subcomponents
```

**Pattern:**

1. Export namespace using `* as ComponentName` from `index.parts`
2. Export all type definitions with `export type *` from each subcomponent

### Namespace Export File (`index.parts.ts`)

Purpose: Creates namespaced exports for clean API (`Component.Root`, `Component.Item`, etc.).

```typescript
export { ComponentRoot as Root } from './root/ComponentRoot';
export { ComponentItem as Item } from './item/ComponentItem';
export { ComponentTrigger as Trigger } from './trigger/ComponentTrigger';
```

**Pattern:**

1. Export each subcomponent with a short alias (Root, Item, Trigger, etc.)
2. Maintain alphabetical order for consistency
3. Use ES6 module syntax exclusively

---

## Component Implementation

### Component File Structure

Every component follows this structure:

```typescript
'use client';
import * as React from 'react';
// Import Base UI utilities
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
// Import component-specific utilities
import { useRenderElement } from '../../utils/useRenderElement';
import type { BaseUIComponentProps } from '../../utils/types';
// Import contexts and other dependencies
import { useParentContext } from '../parent/ParentContext';

/**
 * Brief description of what this component does.
 * Renders a `<element>` element.
 *
 * Documentation: [Base UI ComponentName](https://base-ui.com/react/components/component-name)
 */
export const ComponentName = React.forwardRef(function ComponentName(
  componentProps: ComponentName.Props,
  forwardedRef: React.ForwardedRef<HTMLElement>,
) {
  const {
    render,
    className,
    // Destructure all props
    ...elementProps
  } = componentProps;

  // Hook usage
  const parentContext = useParentContext();

  // State management
  const [state, setState] = React.useState(initialValue);

  // Refs
  const elementRef = React.useRef<HTMLElement>(null);

  // Callbacks with useStableCallback
  const handleEvent = useStableCallback((event: React.SyntheticEvent) => {
    // Handle event
  });

  // Component state object
  const state: ComponentName.State = React.useMemo(
    () => ({
      propertyA,
      propertyB,
    }),
    [propertyA, propertyB],
  );

  // Render using useRenderElement
  const element = useRenderElement('defaultElement', componentProps, {
    ref: forwardedRef,
    state,
    props: elementProps,
    stateAttributesMapping,
  });

  return element;
});

// Type definitions
export interface ComponentNameState {
  /**
   * Description of state property
   */
  propertyA: boolean;
}

export interface ComponentNameProps extends BaseUIComponentProps<
  'defaultElement',
  ComponentName.State
> {
  /**
   * Prop description with JSDoc
   * @default defaultValue
   */
  propName?: Type | undefined;
}

// Namespace export
export namespace ComponentName {
  export type State = ComponentNameState;
  export type Props = ComponentNameProps;
}
```

**Critical Rules:**

1. **'use client' directive**: Always first line for client components
2. **React namespace import**: `import * as React from 'react'`
3. **Never import hooks directly**: Use `React.useState`, `React.useRef`, etc.
4. **forwardRef**: All components use `React.forwardRef`
5. **Named function**: Use function name matching component: `function ComponentName`
6. **Props typing**: Props parameter typed as `ComponentName.Props`
7. **Ref typing**: Ref parameter typed as `React.ForwardedRef<HTMLElement>`
8. **State object**: Always memoized with `React.useMemo`
9. **Namespace pattern**: Export State and Props through namespace

### Critical Hook Usage

**Base UI Utilities (always use these):**

```typescript
// CORRECT - Use Base UI wrapper utilities
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useTimeout } from '@base-ui/utils/useTimeout';
import { useAnimationFrame } from '@base-ui/utils/useAnimationFrame';

const handleClick = useStableCallback(() => {
  /* ... */
});

useIsoLayoutEffect(() => {
  // Side effects
}, [deps]);

const timeout = useTimeout();
timeout.start(() => {
  // Callback
}, delay);
```

**Standard React Hooks:**

```typescript
// CORRECT - Use React namespace
const [state, setState] = React.useState(initial);
const ref = React.useRef<Type>(null);
const value = React.useMemo(() => computation, [deps]);
const callback = React.useCallback(() => {
  /* ... */
}, [deps]);
const value = React.useContext(SomeContext);

// WRONG - Never import hooks directly
import { useState, useRef } from 'react'; // ❌ DON'T DO THIS
```

**Special Utilities:**

- `useControlled`: For controlled/uncontrolled component patterns
- `useMergedRefs`: For combining multiple refs
- `useRenderElement`: For rendering with render prop support
- `useBaseUiId`: For generating stable IDs

---

## Type Definitions

### Interface Patterns

**State Interface:**

```typescript
export interface ComponentNameState {
  /**
   * JSDoc description of the state property.
   */
  propertyA: boolean;
  /**
   * Description of another state property.
   */
  propertyB: string;
  // Never use optional unless truly optional
  optionalProp?: Type | undefined;
}
```

**Props Interface:**

```typescript
export interface ComponentNameProps extends BaseUIComponentProps<
  'element', // Default HTML element
  ComponentName.State
> {
  /**
   * Description of the prop.
   * @default defaultValue
   */
  propName?: Type | undefined;

  /**
   * Callback description.
   */
  onEvent?: ((value: Type, details: BaseUIChangeEventDetails) => void) | undefined;

  /**
   * Boolean prop description.
   * @default false
   */
  disabled?: boolean | undefined;
}
```

**Namespace Pattern:**

```typescript
export namespace ComponentName {
  export type State = ComponentNameState;
  export type Props = ComponentNameProps;

  // Additional nested types if needed
  export interface Parameters {
    // Parameter definitions
  }
}
```

**Critical Type Rules:**

1. All optional props MUST include `| undefined` in the type union
2. Use JSDoc comments for all public interfaces
3. Include `@default` tags for props with defaults
4. State interfaces never extend other interfaces (compose with spread)
5. Props interfaces ALWAYS extend `BaseUIComponentProps<Element, State>`
6. Boolean props default to `false` unless stated otherwise

---

## Context Pattern

### Context File Structure (`ComponentContext.ts`)

```typescript
'use client';
import * as React from 'react';
import type { ComponentRoot } from './ComponentRoot';

export type ComponentRootContext = ComponentRoot.State;

export const ComponentRootContext = React.createContext<ComponentRootContext | undefined>(
  undefined,
);

export function useComponentRootContext() {
  const context = React.useContext(ComponentRootContext);
  if (context === undefined) {
    throw new Error(
      'Base UI: ComponentRootContext is missing. Component parts must be placed within <Component.Root>.',
    );
  }

  return context;
}
```

**Pattern Rules:**

1. Context type aliases the component's State type
2. Context default value is `undefined` (not `null`)
3. Hook throws descriptive error when context is missing
4. Error message format: `'Base UI: ContextName is missing. Parts must be placed within <Component.Root>.'`
5. Hook name follows pattern: `use[ComponentName]Context`

### Context Provider Usage

```typescript
// In the Root component
return (
  <ComponentRootContext.Provider value={state}>
    {element}
    {/* Additional elements */}
  </ComponentRootContext.Provider>
);
```

### Context Consumer Usage

```typescript
// In child components
export const ComponentItem = React.forwardRef(function ComponentItem(
  componentProps: ComponentItem.Props,
  forwardedRef: React.ForwardedRef<HTMLElement>,
) {
  const rootState = useComponentRootContext();

  // Use rootState properties
  const { disabled, open } = rootState;

  // Component logic...
});
```

---

## State Management

### Controlled/Uncontrolled Pattern

Use `useControlled` from `@base-ui/utils/useControlled` for stateful props:

```typescript
import { useControlled } from '@base-ui/utils/useControlled';

const [value, setValue] = useControlled({
  controlled: valueProp, // Prop from parent
  default: defaultValue, // Default value
  name: 'ComponentName', // Component name for warnings
  state: 'value', // State name for warnings
});
```

**When to use:**

- Any prop that can be controlled or uncontrolled (value, checked, open, etc.)
- Props with both `value` and `defaultValue` versions
- Props with onChange handlers

### State Object Pattern

Always create a memoized state object for child components:

```typescript
const state: ComponentName.State = React.useMemo(
  () => ({
    open,
    disabled,
    value,
    // All state properties
  }),
  [open, disabled, value], // All dependencies
);
```

**Rules:**

1. State object must include all properties from State interface
2. Always memoize with `React.useMemo`
3. Include all state values in dependency array
4. Use this state object for context provider and render element

---

## Event Handling

### Change Events

All change events follow this pattern:

```typescript
import {
  createChangeEventDetails,
  type BaseUIChangeEventDetails,
} from '../../utils/createBaseUIEventDetails';
import { REASONS } from '../../utils/reasons';

const handleChange = useStableCallback((newValue: Type) => {
  const details = createChangeEventDetails(REASONS.none, nativeEvent);

  // Call parent callback
  onValueChange?.(newValue, details);

  // Check if canceled
  if (details.isCanceled) {
    return;
  }

  // Update internal state
  setValue(newValue);
});
```

**Event Handler Signature:**

```typescript
onValueChange?: ((
  value: Type,
  details: BaseUIChangeEventDetails
) => void) | undefined;
```

**Critical Rules:**

1. Always use `useStableCallback` for event handlers
2. Always create change event details
3. Check `details.isCanceled` before updating state
4. Pass both value and details to parent callback
5. Include optional `nativeEvent` when available

### Event Handler Composition

Use `composeEventHandlers` for combining handlers:

```typescript
import { composeEventHandlers } from '../../utils/composeEventHandlers';

const element = useRenderElement('button', componentProps, {
  props: {
    onClick: composeEventHandlers(props.onClick, handleClick),
    onKeyDown: composeEventHandlers(props.onKeyDown, handleKeyDown),
  },
});
```

---

## Export Strategy

### Component Export Pattern

All components use namespaced exports for clean, discoverable APIs:

```typescript
// Usage
import { Component } from '@base-ui/react/component';

<Component.Root>
  <Component.Trigger />
  <Component.Content />
</Component.Root>
```

### Implementation

**index.ts:**

```typescript
export * as Component from './index.parts';
export type * from './root/ComponentRoot';
// ... all type exports
```

**index.parts.ts:**

```typescript
export { ComponentRoot as Root } from './root/ComponentRoot';
export { ComponentTrigger as Trigger } from './trigger/ComponentTrigger';
export { ComponentContent as Content } from './content/ComponentContent';
```

**Benefits:**

- Autocomplete shows all available parts
- Clear component relationships
- Tree-shakeable
- TypeScript friendly

---

## Data Attributes

### DataAttributes Enum

Every subcomponent has a DataAttributes file:

```typescript
// ComponentNameDataAttributes.ts
export enum ComponentNameDataAttributes {
  /**
   * Present when the component is in a specific state.
   */
  stateName = 'data-state-name',
  /**
   * Present when the component is disabled.
   */
  disabled = 'data-disabled',
  /**
   * Present when the component is open.
   */
  open = 'data-open',
}
```

**Common Data Attributes:**

- `data-disabled`: When component is disabled
- `data-checked`: When checkbox/switch is checked
- `data-unchecked`: When checkbox/switch is not checked
- `data-open`: When popup/dialog is open
- `data-closed`: When popup/dialog is closed
- `data-focused`: When component has focus
- `data-touched`: When field has been touched (Field integration)
- `data-dirty`: When field value has changed (Field integration)
- `data-valid`: When field is valid (Field integration)
- `data-invalid`: When field is invalid (Field integration)
- `data-indeterminate`: When checkbox is indeterminate
- `data-readonly`: When component is readonly
- `data-required`: When component is required
- `data-dragging`: When drag operation is active (FileUpload)

**Purpose:**

- Styling hooks for users
- State indication without inspecting JavaScript
- Testing selectors
- Accessibility tooling

### State Attributes Mapping

Use state attributes mapping for automatic data attribute application:

```typescript
import type { StateAttributesMapping } from '../../utils/getStateAttributesProps';

const stateAttributesMapping: StateAttributesMapping<ComponentName.State> = React.useMemo(
  () => ({
    disabled: (state) => (state.disabled ? '' : null),
    open: (state) => (state.open ? '' : null),
    // Map each state property to data attribute
  }),
  [],
);

const element = useRenderElement('element', componentProps, {
  state,
  stateAttributesMapping,
  // ...
});
```

---

## Testing

### Test File Structure

Each component has a co-located test file:

```typescript
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Component } from '../index';

describe('Component.SubcomponentName', () => {
  it('renders correctly', () => {
    render(
      <Component.Root>
        <Component.SubcomponentName>Content</Component.SubcomponentName>
      </Component.Root>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Component.Root onValueChange={handleChange}>
        <Component.Trigger>Open</Component.Trigger>
      </Component.Root>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);

    expect(handleChange).toHaveBeenCalledWith(
      expectedValue,
      expect.any(Object),
    );
  });

  it('applies data attributes based on state', () => {
    render(
      <Component.Root disabled>
        <Component.SubcomponentName data-testid="test">
          Content
        </Component.SubcomponentName>
      </Component.Root>
    );

    const element = screen.getByTestId('test');
    expect(element).toHaveAttribute('data-disabled', 'true');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <Component.Root>
        <Component.SubcomponentName ref={ref}>
          Content
        </Component.SubcomponentName>
      </Component.Root>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
```

### Testing Conventions

**Describe blocks:**

- Use component name with namespace: `'Component.SubcomponentName'`
- Group related tests together

**Test cases should cover:**

1. Basic rendering
2. Props application
3. Event handlers
4. State changes
5. Data attributes
6. Ref forwarding
7. Accessibility attributes
8. Disabled states
9. Context integration
10. Edge cases

**Testing utilities:**

- Use `vitest` for test runner: `describe`, `it`, `expect`, `vi`
- Use `@testing-library/react` for rendering: `render`, `screen`, `waitFor`
- Use `@testing-library/user-event` for interactions
- Never use `container.querySelector` when `screen` queries work
- Prefer `getByRole` over other queries for accessibility

**Running tests:**

```bash
# JSDOM environment (fast, no browser)
pnpm test:jsdom ComponentName --no-watch

# Chromium environment (for layout/measurement tests)
pnpm test:chromium ComponentName --no-watch
```

**Skip tests in JSDOM when needed:**

```typescript
import { isJSDOM } from '#test-utils';

it.skipIf(isJSDOM)('measures layout correctly', () => {
  // Test requiring browser layout engine
});
```

---

## Documentation

### JSDoc Comments

All exported types and props require JSDoc:

```typescript
/**
 * Brief description of the component.
 * Renders a `<element>` element.
 *
 * Documentation: [Base UI ComponentName](https://base-ui.com/react/components/component-name)
 */
export const ComponentName = React.forwardRef(/* ... */);

export interface ComponentNameProps {
  /**
   * Description of what this prop does and when to use it.
   * @default false
   */
  disabled?: boolean | undefined;

  /**
   * Description of callback behavior.
   * Called when the value changes.
   */
  onValueChange?: ((value: Type) => void) | undefined;
}
```

**Rules:**

1. Component descriptions include what element is rendered
2. Include documentation URL in component JSDoc
3. All props have descriptions
4. Include `@default` tags for default values
5. Describe callback behavior and when they're called

### API Documentation

Components require API documentation in `docs/reference/generated/`:

```json
{
  "name": "ComponentRoot",
  "props": {
    "propName": {
      "type": "string",
      "default": "defaultValue",
      "description": "Description of the prop"
    }
  }
}
```

This is auto-generated but may need manual updates.

---

## PR Readiness / Quality Gates

Use these gates for any component PR, not just File Upload.

### Behavioral correctness

- Define ownership/lifecycle for external resources (object URLs, timers, subscriptions, observers).
- Avoid broad cleanup tied to unrelated state updates.
- Add tests that verify resources remain valid across unrelated state changes.

### API contract consistency

- Keep component types, runtime behavior, and docs aligned (for example sync vs async callback contracts).
- If changing callback signatures, preserve backward compatibility where practical.
- Prefer machine-readable reason codes for failures/rejections (`SOME_REASON_CODE`) over ad-hoc prose.

### Event callback shape

- Prefer callbacks that include structured details objects when behavior requires metadata.
- Include stable fields such as:
  - `reason` (stable code)
  - `message` (human-readable)
  - event metadata/control details when relevant

### Public API surface safety

- Do not expose raw mutable setters in public context APIs unless intentionally supported.
- Prefer constrained helper methods (`add*`, `remove*`, `clear*`, `update*`) that preserve invariants.
- Tests should use supported public APIs instead of internal escape hatches.

### Code quality baseline

- Replace deprecated APIs with modern equivalents.
- Avoid `as any` unless unavoidable and documented.
- Keep model types explicit and safe (composition/typed wrappers over loose casting).

### Testing and docs gates before merge

- Conformance coverage for each public subcomponent where applicable.
- Docs snippets are syntactically valid and match real runtime behavior.
- Accessibility guidance is explicit and verifiable (labeling, semantics, keyboard behavior).
- Demo variant policy is explicit: either parity across variants or a documented rationale for single-variant demos.

### Required verification

- `pnpm eslint`
- `pnpm typescript`
- Relevant tests (`pnpm test:jsdom <Component> --no-watch`, plus browser tests when layout-dependent)
- Regenerated docs/API references when component surface changes

---

## Code Conventions

### Import Organization

```typescript
'use client';
// 1. React import (always first after 'use client')
import * as React from 'react';

// 2. Base UI utility imports (from @base-ui/utils)
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';

// 3. Internal utility imports (from ../../utils)
import { useRenderElement } from '../../utils/useRenderElement';
import type { BaseUIComponentProps } from '../../utils/types';

// 4. Component-specific imports (contexts, other components)
import { useParentContext } from '../parent/ParentContext';

// 5. Type-only imports at the end
import type { SomeType } from './types';
```

### Naming Conventions

**Files:**

- Component files: `ComponentName.tsx` (PascalCase)
- Test files: `ComponentName.test.tsx`
- Context files: `ComponentNameContext.ts`
- DataAttributes: `ComponentNameDataAttributes.ts`
- Directories: `component-name` (kebab-case)

**Variables:**

- Components: `PascalCase` (`FileUploadRoot`)
- Functions: `camelCase` (`handleClick`)
- Constants: `UPPER_SNAKE_CASE` (`MAX_SIZE`)
- Hooks: `camelCase` with `use` prefix (`useFileUpload`)
- Context: `PascalCase` with `Context` suffix (`FileUploadContext`)
- Props: `camelCase` (`onValueChange`)

**Types:**

- Interfaces: `PascalCase` with descriptive suffix (`ComponentNameProps`)
- Type aliases: `PascalCase` (`ComponentState`)
- Enums: `PascalCase` (`DataAttributes`)

### Code Style

**Formatting:**

- Run `pnpm prettier` before committing
- Use 2-space indentation
- Single quotes for strings in JavaScript/TypeScript code (JSX attributes typically use double quotes)
- Trailing commas in multi-line structures

**Best Practices:**

1. Avoid any casts unless absolutely necessary
2. Prefer explicit types over inference for public APIs
3. Use optional chaining: `obj?.prop` instead of `obj && obj.prop`
4. Use nullish coalescing: `value ?? default` instead of `value || default`
5. Extract complex JSX into separate components
6. Keep components focused and single-purpose
7. Share logic through hooks, not duplication

### Commit Messages

```plaintext
[component-name] Brief imperative summary

Longer description if needed explaining why the change
was made and any important context.
```

**Scopes:**

- `[file-upload]` - Single component
- `[checkbox]` - Single component
- `[all components]` - Broad changes affecting many components
- `[docs]` - Documentation only
- `[tests]` - Test-only changes

---

## Quick Reference Checklist

When creating a new component, verify:

### Structure

- [ ] Created directory: `packages/react/src/component-name/`
- [ ] Created `index.ts` with namespace export
- [ ] Created `index.parts.ts` with short aliases
- [ ] Each subcomponent in its own subdirectory
- [ ] Each subcomponent has DataAttributes file
- [ ] Tests co-located with components

### Implementation

- [ ] `'use client'` directive first line
- [ ] `import * as React from 'react'` (not destructured)
- [ ] Used `React.forwardRef` with named function
- [ ] Props typed as `ComponentName.Props`
- [ ] Ref typed as `React.ForwardedRef<HTMLElement>`
- [ ] State object created with `React.useMemo`
- [ ] Used `useStableCallback` for event handlers
- [ ] Used `useIsoLayoutEffect` instead of `useLayoutEffect`
- [ ] Context pattern implemented correctly
- [ ] Change events use `createChangeEventDetails`

### Types

- [ ] State interface exported
- [ ] Props interface extends `BaseUIComponentProps`
- [ ] Optional props include `| undefined`
- [ ] Namespace pattern used
- [ ] JSDoc comments on all exports
- [ ] `@default` tags on props with defaults

### Testing

- [ ] Tests in same directory as component
- [ ] Tests cover rendering, props, events, state
- [ ] Tests verify data attributes
- [ ] Tests check ref forwarding
- [ ] Used vitest and testing-library
- [ ] Tests pass: `pnpm test:jsdom ComponentName --no-watch`

### Documentation

- [ ] JSDoc on component with element description
- [ ] Documentation URL in component JSDoc
- [ ] All props documented
- [ ] API reference file created/updated

### Quality

- [ ] No TypeScript errors: `pnpm typescript`
- [ ] No lint errors: `pnpm eslint`
- [ ] Code formatted: `pnpm prettier`
- [ ] Follows existing patterns from similar components

---

## Examples to Reference

When implementing similar functionality, reference these components:

- **Simple toggle component**: Checkbox, Switch
- **Compound component with Root**: Accordion, Tabs
- **Popup/overlay component**: Dialog, Popover, Menu
- **Form control**: Input, NumberField, Select
- **Complex state management**: Slider, FileUpload
- **Nested contexts**: Menu (with Submenu), CheckboxGroup

Study these components to understand patterns for your use case.

---

## Common Patterns

### Render Prop Support

All components support custom rendering:

```typescript
const element = useRenderElement('defaultElement', componentProps, {
  ref: forwardedRef,
  state,
  props: elementProps,
  stateAttributesMapping,
});
```

### Hidden Input Pattern

Form controls include a hidden input for form submission:

```typescript
return (
  <ComponentContext.Provider value={state}>
    {element}
    <input
      type="hidden"
      name={name}
      value={value}
      style={visuallyHidden}
    />
  </ComponentContext.Provider>
);
```

### Field Integration

Components that work with forms integrate with Field:

```typescript
import { useFieldRootContext } from '../../field/root/FieldRootContext';
import { useField } from '../../field/useField';

const { state: fieldState, setTouched, setDirty, validityData } = useFieldRootContext();

useField({
  id,
  commit: validation.commit,
  value,
  controlRef,
  name,
  getValue: () => value,
});
```

### Transition Support

Components with enter/exit animations use transition status:

```typescript
import { useTransitionStatus } from '../../utils/useTransitionStatus';

const { transitionStatus, setMounted } = useTransitionStatus(isOpen);

// In state object
const state: ComponentName.State = React.useMemo(
  () => ({
    ...baseState,
    transitionStatus,
  }),
  [baseState, transitionStatus],
);
```

---

This document should serve as a comprehensive reference for creating Base UI components that follow all established conventions and best practices. When in doubt, find a similar existing component and follow its patterns.
