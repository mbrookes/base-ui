---
name: base-ui-component-anatomy
description: Implement or refactor Base UI React components using the repository's component anatomy rules. Use when creating new components, compound parts, contexts, demos, docs, tests, or when the user asks to follow Base UI patterns such as useRenderElement, useControlled, public part exports, data attributes, accessibility conventions, or demo styling.
compatibility: Designed for the Base UI monorepo; assumes access to the workspace, pnpm, and git.
---

# Base UI Component Anatomy

Use this skill for work in `packages/react/src/**` and related docs/tests when the task needs to follow established Base UI implementation patterns.

## When to use

- Creating a new component or compound component.
- Refactoring an existing component to match Base UI conventions.
- Adding or updating parts, contexts, exports, docs, or tests.
- Building demos that need to match the repo's CSS Modules and Tailwind conventions.
- Reviewing whether an implementation follows Base UI anatomy rules.

## What to do

1. Read [the anatomy index](references/BASE_UI_COMPONENT_ANATOMY.md) first, then open only the topic references needed for the task.
2. Pick the correct component shape first: single-part, compound, wrapped shared parts, or root-only provider.
3. Follow the repo's conventions for `useRenderElement`, state/data attributes, context guards, public namespaces, docs sync, and tests.
4. Keep changes aligned across source, tests, demos, and docs when public behavior changes.
5. Run the narrowest relevant validation commands from the reference before finishing.

## High-value checks

- Preserve the `render` contract and pass the original `componentProps` to `useRenderElement`.
- Use presence-based data attributes and selectors.
- Keep JSDoc, docs anatomy, and generated API docs in sync with exported parts.
- Use Base UI wrappers (`useIsoLayoutEffect`, `useStableCallback`, `useControlled`, etc.) where the reference says they apply.
- Match both demo variants when changing visuals or structure.

## References

- Index: [references/BASE_UI_COMPONENT_ANATOMY.md](references/BASE_UI_COMPONENT_ANATOMY.md)
- Structure and exports: [references/component-structure.md](references/component-structure.md)
- Accessibility and events: [references/accessibility-and-events.md](references/accessibility-and-events.md)
- Docs, tests, and validation: [references/delivery-and-verification.md](references/delivery-and-verification.md)
- Demo styling: [references/demo-styling.md](references/demo-styling.md)
- Advanced composition: [references/advanced-composition.md](references/advanced-composition.md)
