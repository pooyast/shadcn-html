// Shared native menu behavior. The popup remains in the browser's top layer.
const itemSelector = ':is([role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"])';
const entries = new Map();
const gutter = 8;
let pendingPlacement = 0;
let pendingSubmenu = 0;

const menuOf = element => element?.closest('[role="menu"][popover]');
const disabled = item => item.matches(':disabled, [aria-disabled="true"], [data-disabled]');
const rtl = element => getComputedStyle(element).direction === 'rtl';

function items(menu) {
  return Array.from(menu.querySelectorAll(itemSelector))
    .filter(item => menuOf(item) === menu && !disabled(item) && item.getClientRects().length);
}

function focusItem(menu, item, preventScroll = false) {
  for (const candidate of menu.querySelectorAll(`${itemSelector}[data-highlighted]`)) {
    if (menuOf(candidate) === menu) candidate.removeAttribute('data-highlighted');
  }
  if (item) {
    item.dataset.highlighted = '';
    item.focus({ preventScroll });
  }
}

function positionMenu(menu, { trigger, parent, point }) {
  const viewport = window.visualViewport;
  const left = (viewport?.offsetLeft ?? 0) + gutter;
  const top = (viewport?.offsetTop ?? 0) + gutter;
  const right = left + (viewport?.width ?? document.documentElement.clientWidth) - gutter * 2;
  const bottom = top + (viewport?.height ?? document.documentElement.clientHeight) - gutter * 2;
  const anchor = trigger.getBoundingClientRect();
  const direction = rtl(trigger);
  if (!parent && !point) menu.style.setProperty('--menu-anchor-width', `${anchor.width}px`);
  const { width, height } = menu.getBoundingClientRect();

  let x = direction ? anchor.right - width : anchor.left;
  let y = anchor.bottom + 4;
  if (point) {
    x = direction ? point.x - width : point.x;
    y = point.y;
    if (x < left || x + width > right) x = direction ? point.x : point.x - width;
    if (y + height > bottom && point.y - height >= top) y = point.y - height;
  } else if (parent) {
    const rightSide = anchor.right + 4;
    const leftSide = anchor.left - width - 4;
    x = direction ? leftSide : rightSide;
    if (x < left || x + width > right) x = direction ? rightSide : leftSide;
    y = anchor.top;
  } else if (y + height > bottom && anchor.top - top > bottom - anchor.bottom) {
    y = anchor.top - height - 4;
  }

  menu.style.setProperty('--menu-x', `${Math.max(left, Math.min(x, right - width))}px`);
  menu.style.setProperty('--menu-y', `${Math.max(top, Math.min(y, bottom - height))}px`);
}

function positionOpenMenus() {
  if (!entries.size || pendingPlacement) return;
  pendingPlacement = requestAnimationFrame(() => {
    pendingPlacement = 0;
    for (const [menu, entry] of entries) {
      if (!menu.isConnected || !entry.trigger.isConnected) {
        if (menu.matches(':popover-open')) menu.hidePopover();
        entries.delete(menu);
      } else if (menu.matches(':popover-open')) {
        positionMenu(menu, entry);
      }
    }
  });
}

function closeMenu(menu, restore = false) {
  const entry = entries.get(menu);
  for (const [child, childEntry] of entries) {
    if (childEntry.parent === menu && child.matches(':popover-open')) closeMenu(child);
  }
  if (menu.matches(':popover-open')) menu.hidePopover();
  if (restore) entry?.trigger.focus({ preventScroll: true });
}

function rootMenu(menu) {
  while (entries.get(menu)?.parent) menu = entries.get(menu).parent;
  return menu;
}

export function openMenu(menu, trigger, { parent = null, point = null, last = false, focus = true } = {}) {
  if (!menu?.matches('[role="menu"][popover]')) return;
  for (const [sibling, entry] of entries) {
    if (parent && entry.parent === parent && sibling !== menu) closeMenu(sibling);
  }
  entries.set(menu, { trigger, parent, point });
  if (!menu.matches(':popover-open')) menu.showPopover({ source: trigger });
  positionMenu(menu, entries.get(menu));
  trigger.setAttribute('aria-expanded', 'true');
  if (!focus) return;
  const options = items(menu);
  focusItem(menu, last ? options.at(-1) : options[0], true);
  if (!options.length) {
    if (!menu.hasAttribute('tabindex')) menu.tabIndex = -1;
    menu.focus({ preventScroll: true });
  }
}

function targetMenu(trigger, attribute) {
  return document.getElementById(trigger.getAttribute(attribute));
}

function openSubmenu(item, menu, focus = true) {
  const submenu = targetMenu(item, 'data-dropdown-submenu');
  if (submenu && menu.contains(submenu) && submenu !== menu) openMenu(submenu, item, { parent: menu, focus });
}

document.addEventListener('toggle', event => {
  if (event.newState !== 'closed' || !entries.has(event.target)) return;
  const menu = event.target;
  const { trigger } = entries.get(menu);
  entries.delete(menu);
  trigger.setAttribute('aria-expanded', 'false');
  focusItem(menu);
}, true);

document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const item = event.target.closest(itemSelector);
  if (item && entries.has(menuOf(item)) && disabled(item)) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

document.addEventListener('click', event => {
  if (event.defaultPrevented || !(event.target instanceof Element)) return;
  const trigger = event.target.closest('[data-dropdown-trigger]');
  if (trigger && !disabled(trigger)) {
    const menu = targetMenu(trigger, 'data-dropdown-trigger');
    if (menu?.matches(':popover-open') && entries.get(menu)?.trigger === trigger) closeMenu(menu);
    else openMenu(menu, trigger);
    return;
  }

  const item = event.target.closest(itemSelector);
  const menu = item && menuOf(item);
  if (!entries.has(menu)) return;
  if (item.hasAttribute('data-dropdown-submenu')) {
    openSubmenu(item, menu);
    return;
  }

  const role = item.getAttribute('role');
  if (role === 'menuitemcheckbox') {
    item.setAttribute('aria-checked', String(item.getAttribute('aria-checked') !== 'true'));
  } else if (role === 'menuitemradio') {
    const group = item.closest('[role="group"]') ?? menu;
    for (const radio of group.querySelectorAll('[role="menuitemradio"]')) {
      if (menuOf(radio) === menu) radio.setAttribute('aria-checked', String(radio === item));
    }
  } else {
    const root = rootMenu(menu);
    const focusedMenu = menuOf(document.activeElement);
    closeMenu(root, entries.has(focusedMenu) && rootMenu(focusedMenu) === root);
  }
});

document.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;
  const item = event.target.closest(itemSelector);
  const menu = item && menuOf(item);
  if (entries.has(menu) && !disabled(item) && item !== document.activeElement) {
    focusItem(menu, item, true);
  }
});

document.addEventListener('pointerover', event => {
  if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;
  const item = event.target.closest(itemSelector);
  const menu = item && menuOf(item);
  if (!entries.has(menu) || disabled(item)) return;
  if (event.relatedTarget instanceof Node && item.contains(event.relatedTarget)) return;
  clearTimeout(pendingSubmenu);
  pendingSubmenu = setTimeout(() => {
    if (!menu.matches(':popover-open') || !item.matches(':hover')) return;
    if (item.hasAttribute('data-dropdown-submenu')) {
      openSubmenu(item, menu, false);
    } else {
      for (const [child, entry] of entries) {
        if (entry.parent === menu) closeMenu(child);
      }
    }
  }, 150);
});

document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing || !(event.target instanceof Element)) return;
  const menu = menuOf(event.target);
  const entry = entries.get(menu);
  if (!entry) {
    const trigger = event.target.closest('[data-dropdown-trigger]');
    if (trigger && !disabled(trigger) && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      openMenu(targetMenu(trigger, 'data-dropdown-trigger'), trigger, { last: event.key === 'ArrowUp' });
    }
    return;
  }

  const options = items(menu);
  const item = event.target.closest(itemSelector);
  const current = options.indexOf(item);
  const back = rtl(entry.trigger) ? 'ArrowRight' : 'ArrowLeft';
  const forward = back === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
  let next;

  switch (event.key) {
    case 'ArrowDown': next = options[(current + 1) % options.length]; break;
    case 'ArrowUp': next = options[(current < 0 ? options.length - 1 : current - 1 + options.length) % options.length]; break;
    case 'Home': next = options[0]; break;
    case 'End': next = options.at(-1); break;
    case 'Escape': event.preventDefault(); closeMenu(menu, true); return;
    case 'Tab': closeMenu(rootMenu(menu), true); return;
    case forward:
      if (item?.hasAttribute('data-dropdown-submenu') && !disabled(item)) {
        event.preventDefault();
        openSubmenu(item, menu);
      }
      return;
    case back:
      if (entry.parent) {
        event.preventDefault();
        closeMenu(menu, true);
      }
      return;
    case 'Enter':
    case ' ':
      if (item) {
        event.preventDefault();
        if (!disabled(item)) item.click();
      }
      return;
    default:
      if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
      const ordered = [...options.slice(current + 1), ...options.slice(0, current + 1)];
      const key = event.key.toLocaleLowerCase();
      next = ordered.find(option => (option.getAttribute('aria-label') ?? option.textContent)
        .trim().toLocaleLowerCase().startsWith(key));
      if (!next) return;
  }
  event.preventDefault();
  focusItem(menu, next);
});

window.addEventListener('scroll', positionOpenMenus, { capture: true, passive: true });
window.addEventListener('resize', positionOpenMenus);
window.visualViewport?.addEventListener('resize', positionOpenMenus);
window.visualViewport?.addEventListener('scroll', positionOpenMenus);
