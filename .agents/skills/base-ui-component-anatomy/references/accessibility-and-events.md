# Accessibility and Events

## 8. Accessibility: ARIA and Announcements

### Label Association for Hidden Inputs

When components have hidden file/input elements, expose an optional `id` prop to enable label association:

```tsx
export interface ComponentInputProps extends BaseUIComponentProps<'input', ComponentInputState> {
  /**
   * Optional custom id for the hidden input element.
   * If not provided, a unique id is auto-generated.
   */
  id?: string | undefined;
}

export const ComponentHiddenInput = React.forwardRef(
  function ComponentHiddenInput(componentProps, forwardedRef) {
    const { id: idProp, ...elementProps } = componentProps;
    const { inputId } = useContext();

    return useRenderElement('input', componentProps, {
      props: [{ id: idProp ?? inputId, type: 'file' }, elementProps],
    });
  },
);
```

### Screen Reader Announcements for State Changes

For interactive components managing transient state, provide hidden `aria-live` regions to announce changes.

```tsx
const [announcement, setAnnouncement] = React.useState<{ text: string; key: number }>({
  text: '',
  key: 0,
});

const handleDragEnter = useStableCallback((event: React.DragEvent) => {
  setAnnouncement((prev) => ({ text: 'Ready to drop files', key: prev.key + 1 }));
});
```

### State Attribute Mapping with Explicit Types

When defining state attribute mappings, include explicit type annotations for parameters.

```ts
import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';

export const componentStateAttributesMapping: StateAttributesMapping<ComponentState> = {
  disabled(value: boolean): Record<string, string> | null {
    return value ? { 'data-disabled': '' } : null;
  },
};
```

### ARIA Semantics and Documentation

Document accessibility features in JSDoc, including keyboard support and ARIA labeling.

## 9. Controlled State and Events

1. Use `useControlled` for controlled/uncontrolled APIs.
2. For cancellable public changes, create details (`createChangeEventDetails`) and call external callback before internal commit.
3. Respect `details.isCanceled`.
4. Use `details.allowPropagation()` only when popup nesting requires it.
5. Use `event.preventBaseUIHandler()` only as escape hatch when no prop-based customization exists.
