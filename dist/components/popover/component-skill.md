# Popover

## Native basis

`popover` attribute — native Popover API for activation, dismissal and focus. CSS provides default anchoring and the module handles viewport collisions.

## Native Web APIs

- [`popover` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/popover) — native popover API with light-dismiss (click outside / Escape)
- [`popovertarget`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#popovertarget) — declarative button→popover wiring with no JS
- [CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning) — positions popover relative to trigger via `position-area`
- [`position-area`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-area) — default native placement before the module applies coordinates
- [`position-try-fallbacks`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-try-fallbacks) — fallback flip for native default placement
- [`@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) — entry animation starting values
- [`transition-behavior: allow-discrete`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior) — enables transitions on `display` property

## Structure

```html
<button class="btn" data-variant="outline" popovertarget="my-popover">Open Popover</button>

<div class="popover" id="my-popover" popover role="dialog" aria-labelledby="my-popover-title">
  <div class="popover-header">
    <p class="popover-title" id="my-popover-title">Dimensions</p>
    <p class="popover-description">Set the dimensions for the layer.</p>
  </div>
  <div class="popover-content">
    <input class="input" aria-label="Width" autofocus>
  </div>
</div>
```

### With side and alignment

```html
<button class="btn" popovertarget="pop-top">Top</button>
<div class="popover" id="pop-top" popover data-side="top">...</div>

<button class="btn" popovertarget="pop-right">Right</button>
<div class="popover" id="pop-right" popover data-side="right">...</div>

<button class="btn" popovertarget="pop-end">End aligned</button>
<div class="popover" id="pop-end" popover data-align="end">...</div>
```

## Attributes

| Attribute | Element | Values | Default | Description |
|---|---|---|---|---|
| `popover` | `.popover` | `"auto"` | `"auto"` | Enables native Popover API |
| `popovertarget` | trigger `<button>` | popover `id` | — | Declarative trigger wiring |
| `data-side` | `.popover` | `top`, `right`, `bottom`, `left` | `bottom` | Which side of the trigger to position |
| `data-align` | `.popover` | `start`, `center`, `end` | `center` | Cross-axis alignment. Top and bottom follow the trigger’s writing direction. |

## ARIA

Use a labeled nonmodal `role="dialog"` for a popover with interactive content. The native `popover` attribute and `popovertarget` handle activation and dismissal:

| Feature | Handled by |
|---|---|
| Toggle open/close | `popovertarget` (declarative, no JS) |
| Light dismiss | Popover API (click outside or Escape closes) |
| Focus management | Use `autofocus` to move focus to the first intended control |

## Keyboard

| Key | Action |
|---|---|
| Enter / Space | Toggle popover (on trigger button) |
| Escape | Close popover (native light-dismiss) |

## Notes

- The popover renders in the **top layer**, so it appears above all other content regardless of `z-index`.
- The placement module uses the actual opener. It flips to the opposite side if that side has more space and clamps the panel inside the viewport.
- The module updates positions on scrolled ancestors and resizes. Declarative triggers inserted dynamically use the same behavior.
- Without the module, supporting browsers use the default CSS anchor placement.
- The `popover` attribute defaults to `"auto"` which provides light-dismiss behavior. Use `popover="manual"` if you need the popover to stay open until explicitly closed.
- For a programmatically opened anchored popover, use `showPopover({ source: trigger })` in browsers that support the source option.
