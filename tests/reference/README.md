# Base UI / Nova comparison

Run `npm ci`, then `npm run dev:reference`. Open
[the local comparison](http://127.0.0.1:4173/tests/reference/index.html).
Each column runs its own implementation. Both use the port's semantic palette and
font so differences in component geometry, decoration and behavior stand out.
Use the Light and Dark links to switch palettes.

The official column uses the captured MIT-licensed registry sources in
`upstream/`. `sources.json` records the preset, CLI release and SHA-256 of each
downloaded registry response. The fixture resolves upstream imports locally and
selects the Lucide icons. React, Tailwind and the CLI are development dependencies.
The published HTML distribution remains static.

Install Chromium, Firefox and WebKit with `npx playwright install`, then run
`npm test`. GitHub Actions runs the same checks. The [deployment guide](DEPLOYMENT.md) covers preview, production and rollback.

## Parity matrix

| Area | HTML coverage | Current verification or remaining work |
| --- | --- | --- |
| Button | Six variants and eight sizes | All eight heights, icon widths, default radius, disabled state and invalid styling tested. |
| Input | Native field, two extra sizes, invalid and readonly styling | Default height and radius compared with Nova. FormData, native validation and reset tested. File-control visuals are browser-dependent. |
| Dialog | Native modal with declarative triggers and close controls | Escape, backdrop dismissal, nested focus restoration, and width at desktop and mobile viewport sizes tested. Screen reader verification remains open. |
| Combobox | Searchable single or multiple selection with an optional native form field | Keyboard selection, filtered visibility, empty-result ARIA, controlled updates, RTL multiselect, FormData and reset tested. |
| Tabs | Horizontal and vertical tabs | Horizontal RTL keyboard regression tested. |
| Popover | Native nonmodal panel with logical alignment and viewport collision handling | Nova width and radius, keyboard and light-dismiss, focus restoration, edge flipping, and an alternate RTL opener tested in all three browser engines. |
| Dropdown Menu | Native menu with checkbox/radio items and submenus | Nova item height and destructive color, disabled options, dismissal, RTL, edge flipping and pointer/keyboard selection tested. |
| Context Menu | Native right-click and keyboard menu with shared submenu behavior | Nova item height and minimum width, Shift+F10, Context Menu key, disabled options, focus restoration and RTL viewport edges tested. |
| Existing overlay and form foundations | Navigation Menu, Sheet, Calendar, Radio, Checkbox, Switch, Slider | Compare keyboard, form and positioning contracts with the corresponding official components. |
| Native equivalents | Select, Date Picker | Keep native Select mapped to official Native Select. Add a separate custom Select and Calendar + Popover date picker. |
| Missing presentation components | Aspect Ratio, Empty, Field, Input Group, Item, Kbd | Implement after aligning the shared styles. Field can reuse the existing Form structure. |
| Missing interactive components | Direction, Drawer, Hover Card, Input OTP, Menubar, Resizable, custom Select | Implement following base overlay and form verification. |
| Missing data and AI components | Attachment, Bubble, Chart, Code Block, Data Table, Marker, Message, Message Scroller, Questionnaire, Trace | Define functionality and dependency boundaries before implementation. |
| Other existing components | Remaining component folders | Audit variants, geometry and accessibility against the mapped official item where applicable. Preserve documented HTML-specific components. |
