import { openMenu } from '../dropdown/dropdown.js';

let openingPointer = null;
let pendingOpen = null;

document.addEventListener('pointerdown', event => {
  if (event.button === 2 || (event.button === 0 && event.ctrlKey)) {
    openingPointer = event.pointerId;
  }
}, true);

function finishOpeningPointer(event) {
  if (event.pointerId !== openingPointer) return;
  openingPointer = null;
  if (!pendingOpen) return;
  setTimeout(pendingOpen, 0);
  pendingOpen = null;
}

document.addEventListener('pointerup', finishOpeningPointer, true);
document.addEventListener('pointercancel', finishOpeningPointer, true);

function contextTarget(event) {
  const trigger = event.target instanceof Element && event.target.closest('[data-context-menu]');
  if (!trigger) return null;
  const menu = document.getElementById(trigger.dataset.contextMenu);
  if (!menu?.hasAttribute('popover')) return null;
  if (!menu.hasAttribute('role')) menu.setAttribute('role', 'menu');
  return { trigger, menu };
}

document.addEventListener('contextmenu', event => {
  if (event.defaultPrevented) return;
  const target = contextTarget(event);
  if (!target) return;
  event.preventDefault();
  const point = { x: event.clientX, y: event.clientY };
  const open = () => {
    if (target.trigger.isConnected && target.menu.isConnected) {
      openMenu(target.menu, target.trigger, { point });
    }
  };
  // Some browsers dispatch contextmenu before pointerup. Wait for that gesture
  // to end so native light dismissal does not immediately close the new menu.
  if (openingPointer !== null) pendingOpen = open;
  else setTimeout(open, 0);
});

document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing) return;
  if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
  const target = contextTarget(event);
  if (!target) return;
  event.preventDefault();
  const anchor = target.trigger.getBoundingClientRect();
  const x = getComputedStyle(target.trigger).direction === 'rtl' ? anchor.right : anchor.left;
  openMenu(target.menu, target.trigger, { point: { x, y: anchor.bottom } });
});
