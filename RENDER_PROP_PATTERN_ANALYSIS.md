# Render Prop Pattern Analysis: useRenderElement Usage

## Overview

This document compares how different Base UI components (Button, PopoverTrigger, MenuTrigger, SelectTrigger) handle the `render` prop when using `useRenderElement`, and contrasts this with the current FileUploadTrigger implementation.

---

## 1. Button Component

**File:** [packages/react/src/button/Button.tsx](packages/react/src/button/Button.tsx)

### Destructuring:

```tsx
const {
  render,
  className,
  disabled = false,
  focusableWhenDisabled = false,
  nativeButton = true,
  ...elementProps
} = componentProps;
```

### useRenderElement Call:

```tsx
return useRenderElement('button', componentProps, {
  state,
  ref: [forwardedRef, buttonRef],
  props: [elementProps, getButtonProps],
});
```

### Key Pattern:

- ✅ **Explicitly destructures `render`** from props
- ✅ **Passes entire `componentProps`** (with render intact) to `useRenderElement`
- ✅ Props are provided as an array of objects that get merged
- ❌ Does NOT use `stateAttributesMapping` (simple component)

---

## 2. PopoverTrigger Component

**File:** [packages/react/src/popover/trigger/PopoverTrigger.tsx](packages/react/src/popover/trigger/PopoverTrigger.tsx#L40-L50)

### Destructuring:

```tsx
const {
  render,
  className,
  disabled = false,
  nativeButton = true,
  handle,
  payload,
  openOnHover = false,
  delay = OPEN_DELAY,
  closeDelay = 0,
  id: idProp,
  ...elementProps
} = componentProps;
```

### useRenderElement Call:

```tsx
const element = useRenderElement('button', componentProps, {
  state,
  ref: [buttonRef, forwardedRef, registerTrigger, triggerElementRef],
  props: [
    localProps.getReferenceProps(),
    hoverProps,
    rootTriggerProps,
    { [CLICK_TRIGGER_IDENTIFIER as string]: '', id: thisTriggerId },
    elementProps,
    getButtonProps,
  ],
  stateAttributesMapping,
});
```

### Key Pattern:

- ✅ **Explicitly destructures `render`** from props
- ✅ **Passes entire `componentProps`** (with render intact) to `useRenderElement`
- ✅ Props are provided as an **array of objects** that get merged in order
- ✅ **Uses `stateAttributesMapping`** to map component state to HTML attributes
- ✅ **Multiple refs** passed as an array
- ✅ **Multiple prop objects** that get merged together

---

## 3. MenuTrigger Component

**File:** [packages/react/src/menu/trigger/MenuTrigger.tsx](packages/react/src/menu/trigger/MenuTrigger.tsx#L60-L70)

### Destructuring:

```tsx
const {
  render,
  className,
  disabled: disabledProp = false,
  nativeButton = true,
  id: idProp,
  openOnHover: openOnHoverProp,
  delay = 100,
  closeDelay = 0,
  handle,
  payload,
  ...elementProps
} = componentProps;
```

### useRenderElement Call:

```tsx
const element = useRenderElement('button', componentProps, {
  enabled: !isInMenubar,
  stateAttributesMapping: pressableTriggerOpenStateMapping,
  state,
  ref,
  props,
});
```

### Key Pattern:

- ✅ **Explicitly destructures `render`** from props
- ✅ **Passes entire `componentProps`** (with render intact) to `useRenderElement`
- ✅ Props are prepared as **pre-built arrays**:
  ```tsx
  const ref = [triggerRef, forwardedRef, buttonRef, registerTrigger, triggerElementRef];
  const props = [
    localInteractionProps.getReferenceProps(),
    hoverProps ?? EMPTY_OBJECT,
    rootTriggerProps,
    {
      /* custom props */
    },
    isInMenubar ? { role: 'menuitem' } : {},
    mixedToggleHandlers,
    elementProps,
    getButtonProps,
  ];
  ```
- ✅ **Uses `stateAttributesMapping`** to map component state to HTML attributes
- ✅ **Uses `enabled` option** to conditionally enable rendering

---

## 4. SelectTrigger Component

**File:** [packages/react/src/select/trigger/SelectTrigger.tsx](packages/react/src/select/trigger/SelectTrigger.tsx#L48-L60)

### Destructuring:

```tsx
const {
  render,
  className,
  id: idProp,
  disabled: disabledProp = false,
  nativeButton = true,
  ...elementProps
} = componentProps;
```

### useRenderElement Call:

```tsx
const props: HTMLProps = mergeProps<'button'>(
  triggerProps,
  {
    /* ... many props ... */
  },
  validation.getValidationProps,
  elementProps,
  getButtonProps,
);

// ... later ...

return useRenderElement('button', componentProps, {
  ref: [forwardedRef, triggerRef],
  state,
  stateAttributesMapping,
  props,
});
```

### Key Pattern:

- ✅ **Explicitly destructures `render`** from props
- ✅ **Passes entire `componentProps`** (with render intact) to `useRenderElement`
- ✅ Props are **pre-merged into a single object** using `mergeProps()` utility
- ✅ **Uses `stateAttributesMapping`** to map component state to HTML attributes
- ✅ Props include multiple sources merged together

---

## 5. FileUploadTrigger Component (CURRENT)

**File:** [packages/react/src/file-upload/trigger/FileUploadTrigger.tsx](packages/react/src/file-upload/trigger/FileUploadTrigger.tsx)

### Destructuring:

```tsx
const {
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render: _render, // ⚠️ EXPLICITLY IGNORED
  // @ts-expect-error - nativeButton is not in props but may be passed by conformance tests
  nativeButton: _nativeButton,
  ...elementProps
} = props;
```

### useRenderElement Call:

```tsx
return useRenderElement('button', props, {
  state,
  ref,
  props: [
    {
      type: 'button',
      className: resolvedClassName,
      disabled,
      onClick: composeEventHandlers(elementProps.onClick, handleClick),
    },
    elementProps,
  ],
  stateAttributesMapping: fileUploadTriggerStateAttributesMapping,
});
```

### Key Problems:

- ❌ **Destructures `render` as `_render` and IGNORES it** - this prevents the render prop from reaching `useRenderElement`
- ❌ **Passes original `props` to `useRenderElement`** (without the render prop) instead of `componentProps`
- ❌ **render prop is lost** in the destructuring phase
- ⚠️ The `render` prop is intentionally discarded and never reaches the component rendering logic

---

## Comparison Table

| Component             | Destructures `render`? | Passes to useRenderElement      | Ignores render? | Uses stateAttributesMapping | Props as Array  |
| --------------------- | ---------------------- | ------------------------------- | --------------- | --------------------------- | --------------- |
| **Button**            | ✅ Yes                 | ✅ componentProps (with render) | ❌ No           | ❌ No                       | ✅ Yes          |
| **PopoverTrigger**    | ✅ Yes                 | ✅ componentProps (with render) | ❌ No           | ✅ Yes                      | ✅ Yes          |
| **MenuTrigger**       | ✅ Yes                 | ✅ componentProps (with render) | ❌ No           | ✅ Yes                      | ✅ Yes          |
| **SelectTrigger**     | ✅ Yes                 | ✅ componentProps (with render) | ❌ No           | ✅ Yes                      | ✅ Yes (merged) |
| **FileUploadTrigger** | ✅ Yes (as `_render`)  | ❌ props (without render!)      | ⚠️ YES          | ✅ Yes                      | ✅ Yes          |

---

## Correct Pattern Summary

### All proper components follow this pattern:

1. **Destructure explicitly:**

   ```tsx
   const { render, className, disabled = false, ...elementProps } = componentProps;
   ```

2. **Pass original componentProps to useRenderElement** (preserving the render prop):

   ```tsx
   return useRenderElement('button', componentProps, {
     state,
     ref: [forwardedRef, triggerRef],
     props: [someProps, elementProps, getButtonProps],
     stateAttributesMapping,
   });
   ```

3. **Key principle:** The `render` prop must be:
   - Explicitly listed in destructuring (not ignored)
   - Passed through to `useRenderElement` via the original `componentProps`
   - NOT extracted from `elementProps` (it should remain in componentProps)

---

## FileUploadTrigger Fix Required

### Current Code (BROKEN):

```tsx
const {
  className,
  render: _render,  // ❌ Destructured but ignored!
  nativeButton: _nativeButton,
  ...elementProps
} = props;

return useRenderElement('button', props, {  // ❌ render prop missing!
```

### Should Be:

```tsx
const {
  className,
  render,  // ✅ Destructure without ignoring
  nativeButton: _nativeButton,
  ...elementProps
} = props;

return useRenderElement('button', props, {  // ✅ render prop now included!
```

Or more explicitly following other components:

```tsx
const {
  render,
  className,
  // ... other props
  ...elementProps
} = componentProps;

return useRenderElement('button', componentProps, {
  // ✅ Pass full componentProps
  state,
  ref,
  props: [
    {
      type: 'button',
      className: resolvedClassName,
      disabled,
      onClick: composeEventHandlers(elementProps.onClick, handleClick),
    },
    elementProps,
  ],
  stateAttributesMapping: fileUploadTriggerStateAttributesMapping,
});
```
