# Pattern: Combobox

## Native basis
Button trigger + `popover` popup containing a search input and `role="listbox"`.
The `popover` API provides top-layer rendering and light-dismiss.
Requires JavaScript for filtering, keyboard navigation, selection, and
ARIA management. Follows the WAI-ARIA Combobox design pattern.

The trigger is an outline button. Clicking it opens a popover with a search
input at the top and a scrollable list of options below. DOM focus moves to
the search input when the popover opens.

---

## Native Web APIs
- [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) — top-layer rendering and light-dismiss for the dropdown list
- [CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning) — positions the popover relative to the trigger without JS
- [`@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) — entry animation starting values for popover appearance
- [`overscroll-behavior`](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior) — prevents scroll chaining from the listbox to the page
- [WAI-ARIA Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — keyboard navigation and screen reader contract

---

## Structure

```html
<div class="combobox" style="width:14rem;">
  <label class="label" id="framework-label">Framework</label>
  <button class="btn combobox-trigger" data-variant="outline"
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-labelledby="framework-label"
          aria-controls="framework-popover">
    <span class="combobox-value" data-placeholder="Select framework...">Select framework...</span>
    <svg class="combobox-chevron" aria-hidden="true" width="16" height="16"
         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>
    </svg>
  </button>
  <div id="framework-popover" class="combobox-content" popover>
    <div class="combobox-search">
      <svg class="combobox-search-icon" aria-hidden="true" width="16" height="16"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
      <input class="combobox-search-input"
             type="text"
             role="combobox"
             autocomplete="off"
             aria-expanded="true"
             aria-controls="framework-listbox"
             aria-activedescendant=""
             aria-autocomplete="list"
             placeholder="Search...">
    </div>
    <div id="framework-listbox" role="listbox" class="combobox-listbox"
         aria-label="Frameworks">
      <div class="combobox-empty" hidden>No results found.</div>
      <div role="option" id="opt-next" class="combobox-item"
           data-value="nextjs" aria-selected="false">Next.js</div>
      <div role="option" id="opt-svelte" class="combobox-item"
           data-value="sveltekit" aria-selected="false">SvelteKit</div>
      <div role="option" id="opt-nuxt" class="combobox-item"
           data-value="nuxt" aria-selected="false">Nuxt</div>
      <div role="option" id="opt-remix" class="combobox-item"
           data-value="remix" aria-selected="false">Remix</div>
      <div role="option" id="opt-astro" class="combobox-item"
           data-value="astro" aria-selected="false">Astro</div>
    </div>
  </div>
</div>
```

### With groups

```html
<div id="tz-listbox" role="listbox" class="combobox-listbox" aria-label="Timezones">
  <div class="combobox-empty" hidden>No results found.</div>
  <div class="combobox-group-label">North America</div>
  <div role="option" class="combobox-item" id="opt-est"
       data-value="est" aria-selected="false">Eastern (EST)</div>
  <div role="option" class="combobox-item" id="opt-pst"
       data-value="pst" aria-selected="false">Pacific (PST)</div>
  <div class="combobox-separator"></div>
  <div class="combobox-group-label">Europe</div>
  <div role="option" class="combobox-item" id="opt-gmt"
       data-value="gmt" aria-selected="false">GMT (London)</div>
</div>
```

---

## Data Attributes

| Attribute          | Element              | Values                            | Description                                          |
|--------------------|----------------------|-----------------------------------|------------------------------------------------------|
| `data-placeholder` | `.combobox-value`    | (presence)                        | Present when showing placeholder text; removed on selection. CSS uses it to set muted color. |
| `data-highlighted` | `.combobox-item`     | (presence, JS-managed)            | Set by JS on the currently keyboard-highlighted option. CSS applies accent background. |
| `data-value`       | `.combobox-item`     | any string                        | The programmatic value of the option, used by JS for selection tracking. Not targeted by CSS. |

---

## ARIA

| Attribute                | Where            | Value                                   |
|--------------------------|------------------|-----------------------------------------|
| `aria-haspopup`          | trigger button   | `listbox`                               |
| `aria-expanded`          | trigger button   | `true` when popup open, `false` when closed |
| `aria-labelledby`        | trigger button   | ID of the label                         |
| `aria-controls`          | trigger button   | ID of the popover                       |
| `role="combobox"`        | search input     | Always                                  |
| `aria-expanded`          | search input     | `true` when popup open                  |
| `aria-controls`          | search input     | ID of the listbox                       |
| `aria-activedescendant`  | search input     | ID of the highlighted option            |
| `aria-autocomplete`      | search input     | `list` (filters as you type)            |
| `role="listbox"`         | list container   | Always                                  |
| `role="option"`          | each item        | Always                                  |
| `aria-selected`          | each option      | `true` for selected, `false` otherwise  |
| `aria-disabled`          | disabled options | `true` if option is disabled            |

---

## Form integration and multiple selection

Add a hidden native `<select data-combobox-field name="framework">` inside the
wrapper. Its option values must match each visible option's `data-value` or
its trimmed text when `data-value` is omitted. The native field supplies the
initial value and the values submitted by the form. Use an empty native option
for an unselected single-value field.

```html
<select data-combobox-field name="framework" multiple hidden>
  <option value="react" selected>React</option>
  <option value="vue">Vue</option>
</select>
```

For the options in this example, set `data-value="react"` and `data-value="vue"`
on their visible listbox options. Each visible option needs a unique ID.
In multiple mode, Enter toggles the highlighted option and keeps the menu open.
Read submitted values with `new FormData(form).getAll('framework')`. To set a
value from code, update the native field's selection and dispatch a bubbling
`change` event. The form's reset restores the options selected in the markup.
Keep disabled options and the trigger state in sync with the native select.
Use `data-placeholder-text` on the value span to supply an empty label when the
initial markup contains a selected value.

Without a native field, add `aria-multiselectable="true"` to the listbox to enable
multiple selection for display-only use.

## Keyboard interactions

### Focus on search input (inside popover):

| Key           | Behavior                                         |
|---------------|--------------------------------------------------|
| `ArrowDown`   | Highlight next item                              |
| `ArrowUp`     | Highlight previous item                          |
| `Home`        | Move caret to start of the search text                     |
| `End`         | Move caret to end of the search text                      |
| `Enter`       | Select highlighted item, close popup             |
| `Escape`      | Close popup, return focus to trigger             |
| `Tab`         | Close popup, move focus to next element          |
| Typing        | Filter items, auto-highlight first match         |

---

## Notes

- The trigger is a `.btn[data-variant="outline"]` — styled by the button system
- When the popover opens, focus moves to the search input inside
- When the popover closes, focus returns to the trigger button
- Use `aria-activedescendant` to communicate the highlighted item to screen readers
- The `popover` attribute enables top-layer rendering and light-dismiss
- CSS anchor positioning (`position-anchor`, `anchor()`, `position-try-fallbacks: flip-block`) places the popover below the trigger; no JS positioning needed
- The popover animates in via `@starting-style` + `transition-behavior: allow-discrete`
- The check icon for selected items uses a CSS `::before` pseudo-element
- Filter matching is case-insensitive and supports substring matching
- The empty state element is shown when no items match the filter query
- Group labels and separators auto-hide when their group has no visible items
- `overscroll-behavior: contain` prevents scroll chaining from the listbox
- `prefers-reduced-motion: reduce` disables all transitions
- `forced-colors: active` supports Windows High Contrast Mode
