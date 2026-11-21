// -- Combobox -------------------------------------------------
// Searchable select with keyboard navigation and popover positioning.

function init() {
  document.querySelectorAll('.combobox:not([data-init])').forEach((wrapper) => {
    const trigger = wrapper.querySelector('.combobox-trigger');
    const valueEl = wrapper.querySelector('.combobox-value');
    const popover = wrapper.querySelector('.combobox-content');
    const searchInput = wrapper.querySelector('.combobox-search-input');
    const listbox = wrapper.querySelector('[role="listbox"]');
    const empty = wrapper.querySelector('.combobox-empty');
    const field = wrapper.querySelector('select[data-combobox-field]');
    const multiple = field?.multiple ?? listbox?.getAttribute('aria-multiselectable') === 'true';
    if (!trigger || !popover || !searchInput || !listbox) return;

    wrapper.dataset.init = '';
    const allItems = Array.from(listbox.querySelectorAll('[role="option"]'));
    const placeholder = valueEl?.dataset.placeholderText ??
      (valueEl?.hasAttribute('data-placeholder') ? valueEl.textContent.trim() : 'Select an option');
    const optionValue = item => item.dataset.value ?? item.textContent.trim();
    const isSelected = item => item.getAttribute('aria-selected') === 'true';

    if (multiple) listbox.setAttribute('aria-multiselectable', 'true');
    let highlighted = -1;

    // CSS anchor positioning - unique name per trigger-popover pair
    const anchorId = `--combobox-${popover.id}`;
    trigger.style.anchorName = anchorId;
    popover.style.positionAnchor = anchorId;

    const getVisibleItems = () => allItems.filter((item) => !item.hidden && item.getAttribute('aria-disabled') !== 'true');
    const open = () => {
      if (field?.matches(':disabled')) return;
      popover.showPopover();
      trigger.setAttribute('aria-expanded', 'true');
      searchInput.setAttribute('aria-expanded', 'true');
      searchInput.value = '';
      filter('');
      searchInput.focus();
    };
    const close = () => {
      popover.hidePopover();
      trigger.setAttribute('aria-expanded', 'false');
      searchInput.setAttribute('aria-expanded', 'false');
      clearHighlight();
      trigger.focus();
    };
    const isOpen = () => popover.matches(':popover-open');
    const filter = (query) => {
      const q = query.toLowerCase(); let hasVisible = false;
      allItems.forEach((item) => { const match = !q || item.textContent.trim().toLowerCase().includes(q); item.hidden = !match; if (match) hasVisible = true; });
      listbox.querySelectorAll('.combobox-group-label').forEach((label) => {
        let next = label.nextElementSibling; let groupHasVisible = false;
        while (next && !next.classList.contains('combobox-group-label') && !next.classList.contains('combobox-separator')) {
          if (next.getAttribute('role') === 'option' && !next.hidden) groupHasVisible = true; next = next.nextElementSibling;
        }
        label.hidden = !groupHasVisible;
      });
      listbox.querySelectorAll('.combobox-separator').forEach((sep) => { const prev = sep.previousElementSibling; const next = sep.nextElementSibling; sep.hidden = (prev && prev.hidden) || (next && next.hidden); });
      if (empty) empty.hidden = hasVisible;
    };
    const clearHighlight = () => {
      allItems.forEach((item) => { delete item.dataset.highlighted; });
      searchInput.removeAttribute('aria-activedescendant');
      highlighted = -1;
    };
    const doHighlight = (index) => {
      const items = getVisibleItems(); clearHighlight();
      if (index < 0 || index >= items.length) return;
      highlighted = index; items[index].dataset.highlighted = '';
      items[index].scrollIntoView({ block: 'nearest' });
      if (items[index].id) searchInput.setAttribute('aria-activedescendant', items[index].id);
    };
    const renderValue = () => {
      if (!valueEl) return;
      const labels = allItems.filter(isSelected).map(item => item.textContent.trim());
      valueEl.textContent = labels.length ? labels.join(', ') : placeholder;
      valueEl.toggleAttribute('data-placeholder', !labels.length);
    };

    const syncFromField = () => {
      const values = new Set(Array.from(field.selectedOptions, option => option.value).filter(Boolean));
      allItems.forEach(item => item.setAttribute('aria-selected', String(values.has(optionValue(item)))));
      renderValue();
    };

    const selectItem = (item) => {
      if (item.getAttribute('aria-disabled') === 'true' || field?.matches(':disabled')) return;
      if (multiple) {
        item.setAttribute('aria-selected', String(!isSelected(item)));
      } else {
        allItems.forEach(option => option.setAttribute('aria-selected', String(option === item)));
      }

      if (field) {
        const values = new Set(allItems.filter(isSelected).map(optionValue));
        if (multiple) {
          Array.from(field.options).forEach(option => { option.selected = values.has(option.value); });
        } else {
          field.value = optionValue(item);
        }
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        renderValue();
      }

      if (!multiple) close();
    };

    if (field) {
      syncFromField();
      field.addEventListener('change', syncFromField);
      field.form?.addEventListener('reset', event => {
        setTimeout(() => {
          if (!event.defaultPrevented) syncFromField();
        }, 0);
      });
    }
    trigger.addEventListener('click', () => { if (isOpen()) { close(); } else { open(); } });
    searchInput.addEventListener('input', () => { filter(searchInput.value); doHighlight(0); });
    searchInput.addEventListener('keydown', (e) => {
      if (e.isComposing) return;
      const items = getVisibleItems();
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); doHighlight(Math.min(highlighted + 1, items.length - 1)); break;
        case 'ArrowUp': e.preventDefault(); doHighlight(Math.max(highlighted - 1, 0)); break;
        case 'Enter': e.preventDefault(); if (highlighted >= 0 && items[highlighted]) selectItem(items[highlighted]); break;
        case 'Escape': e.preventDefault(); close(); break;
        case 'Tab': close(); break;
      }
    });
    listbox.addEventListener('click', (e) => { const item = e.target.closest('[role="option"]'); if (item && !item.hidden && item.getAttribute('aria-disabled') !== 'true') selectItem(item); });
    listbox.addEventListener('mousemove', (e) => { const item = e.target.closest('[role="option"]'); if (item && !item.hidden) { const items = getVisibleItems(); doHighlight(items.indexOf(item)); } });
    popover.addEventListener('toggle', (event) => {
      if (event.newState !== 'closed') return;
      trigger.setAttribute('aria-expanded', 'false');
      searchInput.setAttribute('aria-expanded', 'false');
      clearHighlight();
    });
  });
}

init();
new MutationObserver(init).observe(document, { childList: true, subtree: true });

