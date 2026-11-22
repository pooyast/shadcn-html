# Context Menu

## Native basis

The native Popover API handles the top layer and light dismissal. The
`contextmenu` event opens at the pointer. Shift+F10 and the Context Menu key
open at the focused trigger.

## Structure

```html
<div class="context-menu-trigger" data-context-menu="edit-menu" tabindex="0"
     aria-haspopup="menu" aria-expanded="false" aria-controls="edit-menu">
  Right click or press Shift+F10
</div>
<div class="context-menu" id="edit-menu" role="menu" aria-label="Editing actions" popover>
  <button type="button" class="context-menu-item" role="menuitem" tabindex="-1">Cut</button>
  <button type="button" class="context-menu-item" role="menuitem" tabindex="-1" disabled>Paste</button>
  <div class="context-menu-separator" role="separator"></div>
  <button type="button" class="context-menu-item" role="menuitem" tabindex="-1"
          data-variant="destructive">Delete</button>
</div>
```

Load the stylesheet and `context-menu.js` as a module. In a self-hosted copy,
keep `../dropdown/dropdown.js` at its relative path because Context Menu imports
shared placement, focus and keyboard behavior from it.

## Behavior

- Arrow keys, Home, End and typeahead navigate enabled items.
- Enter and Space activate an item. Escape returns focus to the trigger.
- An outside click dismisses the menu and preserves focus on the outside target.
- Menu and submenu panels flip and shift inside the viewport in LTR and RTL.
- A submenu uses `data-dropdown-submenu` on its opener and
  `data-dropdown-panel="submenu"` on the nested popover inside its parent menu.
- Use `role="menuitemcheckbox"` or `role="menuitemradio"` with `aria-checked`
  for toggle and radio variants. Wrap each set of radio options in an
  element with `role="group"`.
