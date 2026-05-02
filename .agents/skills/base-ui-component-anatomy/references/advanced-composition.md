# Advanced Composition

## 15. Wrapper Parts

Use when semantic HTML requires a container element wrapping an interactive child.

1. `useRenderElement` wraps the outer container.
2. `useButton` drives the inner element.
3. State attributes land on the container.
4. Hooks cannot be called inside render loops.
5. Non-interactive siblings may need explicit text color.

## 16. Fragment-Rendering Parts

Use when a part renders multiple peer elements rather than a single DOM node.

1. Use a plain function, not `forwardRef`.
2. Wrap output in `<React.Fragment>`.
3. Do not call hooks inside render loops.
4. Keep rendered item count stable when the visual layout depends on it.

## 17. Fast Agent Checklist

1. Choose shape: single-part or compound.
2. Follow nearest existing component pattern.
3. Preserve `render` + `useRenderElement` contract.
4. Keep public types/JSDoc/defaults accurate.
5. Use presence-based data-attribute selectors/assertions.
6. Add/adjust tests for behavior + accessibility.
7. Run quality gates and relevant tests.
