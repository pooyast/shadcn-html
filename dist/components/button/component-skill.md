# Pattern: Button

## Native basis
`<button>` element. Also works on `<a>` for link-style buttons.

---

## Native Web APIs
- [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button) — native clickable element with built-in keyboard and form support
- [`:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible) — keyboard-only focus ring, avoids showing focus on mouse clicks
- [`commandfor` / `command`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#command) — declarative button→dialog/popover triggers without JS click handlers
- [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — suppresses hover/focus transitions
- [`prefers-contrast`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast) — adds visible borders to all variants in high-contrast mode
- [`forced-colors`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors) — maps button border/text to system colors in Windows High Contrast Mode

---

## Structure

```html
<button class="btn" data-variant="default">Click me</button>
```

### With icon
```html
<button class="btn" data-variant="default">
  <svg aria-hidden="true" width="16" height="16" ...>...</svg>
  Save
</button>
```

### Icon-only
```html
<button class="btn" data-variant="outline" data-size="icon" aria-label="Settings">
  <svg aria-hidden="true" width="16" height="16" ...>...</svg>
</button>
```

---

## Variants

| `data-variant`  | Surface              | Text                     | Hover                          |
|-----------------|----------------------|--------------------------|--------------------------------|
| `default` | `--primary` | `--primary-foreground` | 80% primary fill |
| `secondary` | `--secondary` | `--secondary-foreground` | Mix in 5% foreground |
| `outline` | `--background` with border | `--foreground` | `--muted` fill |
| `ghost` | transparent | `--foreground` | `--muted` fill |
| `destructive` | 10% destructive fill | `--destructive` | 20% destructive fill |
| `link`          | transparent          | `--primary`              | underline                      |

---

## Sizes

| `data-size` | Height    | Padding       | Font size    | Border radius       |
|-------------|-----------|---------------|--------------|---------------------|
| `xs`        | `1.5rem`  | `0 0.5rem`   | `0.75rem`    | `min(var(--radius-md), 10px)` |
| `sm`        | `1.75rem` | `0 0.625rem` | `0.8rem`     | `min(var(--radius-md), 12px)` |
| *(default)* | `2rem`    | `0 0.625rem` | `0.875rem`   | `var(--radius-lg)` |
| `lg`        | `2.25rem` | `0 0.625rem` | `0.875rem`   | `var(--radius-lg)` |
| `icon`      | `2rem`    | `0` (square)  | — | `var(--radius-lg)` |
| `icon-xs`   | `1.5rem`  | `0` (square)  | — | `min(var(--radius-md), 10px)` |
| `icon-sm`   | `1.75rem` | `0` (square)  | — | `min(var(--radius-md), 12px)` |
| `icon-lg`   | `2.25rem` | `0` (square)  | — | `var(--radius-lg)` |

---

## Accessibility

- Use `<button>` for actions, `<a>` for navigation.
- Icon-only buttons require `aria-label`.
- Disabled buttons use `disabled` attribute or `aria-disabled="true"`.
- Loading state: add `aria-busy="true"` and swap icon for a spinner.

---

## Notes

- SVGs inside buttons auto-size to 1rem unless they have a `size-*` class.
- The button works on `<a>` tags for styled navigation links.
