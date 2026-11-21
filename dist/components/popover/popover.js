// Placement for native popovers. The browser owns activation, dismissal and focus.
const openPopovers = new Map();
const recentTriggers = new WeakMap();
const edges = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const gutter = 8;
const gap = 4;
let frame = 0;

function position(popover, trigger) {
  const viewport = window.visualViewport;
  const left = (viewport?.offsetLeft ?? 0) + gutter;
  const top = (viewport?.offsetTop ?? 0) + gutter;
  const right = left + (viewport?.width ?? document.documentElement.clientWidth) - gutter * 2;
  const bottom = top + (viewport?.height ?? document.documentElement.clientHeight) - gutter * 2;
  popover.dataset.positioned = '';
  const anchor = trigger.getBoundingClientRect();
  const { width, height } = popover.getBoundingClientRect();
  const available = {
    top: anchor.top - top - gap,
    bottom: bottom - anchor.bottom - gap,
    left: anchor.left - left - gap,
    right: right - anchor.right - gap,
  };

  let side = Object.hasOwn(edges, popover.dataset.side) ? popover.dataset.side : 'bottom';
  const vertical = side === 'top' || side === 'bottom';
  const opposite = edges[side];
  if (available[side] < (vertical ? height : width) && available[opposite] > available[side]) {
    side = opposite;
  }

  let align = popover.dataset.align;
  if (vertical && getComputedStyle(trigger).direction === 'rtl') {
    if (align === 'start') align = 'end';
    else if (align === 'end') align = 'start';
  }

  const crossStart = vertical ? anchor.left : anchor.top;
  const crossEnd = vertical ? anchor.right : anchor.bottom;
  const crossSize = vertical ? width : height;
  let cross = (crossStart + crossEnd - crossSize) / 2;
  if (align === 'start') cross = crossStart;
  else if (align === 'end') cross = crossEnd - crossSize;

  const x = vertical ? cross : side === 'left' ? anchor.left - gap - width : anchor.right + gap;
  const y = vertical ? side === 'top' ? anchor.top - gap - height : anchor.bottom + gap : cross;
  popover.style.setProperty('--popover-x', `${Math.max(left, Math.min(x, right - width))}px`);
  popover.style.setProperty('--popover-y', `${Math.max(top, Math.min(y, bottom - height))}px`);
}

function updatePositions() {
  frame = 0;
  for (const [popover, entry] of openPopovers) {
    if (popover.isConnected && popover.matches(':popover-open') && entry.trigger.isConnected) {
      position(popover, entry.trigger);
    } else {
      entry.observer.disconnect();
      openPopovers.delete(popover);
    }
  }
}

function schedulePositions() {
  if (openPopovers.size && !frame) frame = requestAnimationFrame(updatePositions);
}

document.addEventListener('click', event => {
  const trigger = event.target instanceof Element && event.target.closest('[popovertarget]');
  const popover = trigger?.popoverTargetElement;
  if (popover?.matches('.popover') && !popover.matches(':popover-open')) recentTriggers.set(popover, trigger);
}, true);

document.addEventListener('toggle', event => {
  const popover = event.target;
  if (!(popover instanceof HTMLElement) || !popover.matches('.popover[popover]')) return;

  openPopovers.get(popover)?.observer.disconnect();
  openPopovers.delete(popover);
  if (event.newState === 'closed') {
    delete popover.dataset.positioned;
    popover.style.removeProperty('--popover-x');
    popover.style.removeProperty('--popover-y');
    recentTriggers.delete(popover);
    return;
  }

  const trigger = event.source ?? recentTriggers.get(popover);
  if (!(trigger instanceof HTMLElement)) return;
  const observer = new ResizeObserver(schedulePositions);
  observer.observe(trigger);
  observer.observe(popover);
  openPopovers.set(popover, { trigger, observer });
  position(popover, trigger);
}, true);

window.addEventListener('scroll', schedulePositions, { capture: true, passive: true });
window.addEventListener('resize', schedulePositions);
window.visualViewport?.addEventListener('resize', schedulePositions);
window.visualViewport?.addEventListener('scroll', schedulePositions);
