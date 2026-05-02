# Demo Styling

## 13. Demo Styling Guidelines

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

1. The default export is named `ExampleComponentName`.
2. No `'use client'` directive unless the demo genuinely needs client-side state.
3. Import styles as a named object: `import styles from './index.module.css'`.
4. Only import from the public package path.
5. Inline SVG icons as local named functions typed `(props: React.ComponentProps<'svg'>) => JSX.Element`.
6. Static data is defined as module-level constants above the component.
7. Use `React.useId()` for ID generation.
8. Keep demos minimal.

### CSS Modules conventions

1. Class names match component part names and use PascalCase.
2. Use color tokens only.
3. Gate hover rules with `@media (hover: hover)`.
4. Use Base UI focus-visible outline conventions.
5. Apply full button resets to bare interactive elements.
6. Use dark-mode overrides only where tokens cannot express the value.
7. Put popup shadows inside `@media (prefers-color-scheme: light)`.
8. Use presence-based data attribute selectors.
9. Use native CSS nesting.
10. Use the standard container pattern where applicable.
11. Do not add decorative wrappers unless the component itself provides that surface.

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
2. Use Tailwind's `data-[state]:utility` variants for data attributes.
3. For hover, use the standard `hover:` variant.
4. For complex child selectors, use arbitrary variants.
5. Use the Base UI focus-visible outline conventions.
6. Do not add a Root-level container className unless the Root itself is the styled surface.
