import { expect, test } from '@playwright/test';

const fixture = '/tests/reference/';

test('Dropdown item geometry matches Nova and disabled and destructive states are visible', async ({ page }) => {
  await page.goto(fixture + 'index.html');
  const official = page.frameLocator('iframe[title="Official Nova"]');
  const html = page.frameLocator('iframe[title="HTML port"]');
  for (const frame of [official, html]) {
    await frame.getByRole('button', { name: 'Open actions' }).click();
    const menu = frame.getByRole('menu', { name: 'Actions' });
    await expect(menu.getByRole('menuitem', { name: 'Edit' })).toHaveCSS('height', '28px');
    await expect(menu.getByRole('menuitem', { name: 'Duplicate' })).toBeDisabled();
    await expect(menu.getByRole('menuitem', { name: 'Duplicate' })).toHaveCSS('opacity', '0.5');
    await expect(menu.getByRole('separator')).toHaveCSS('height', '1px');
  }
  const officialDelete = official.getByRole('menuitem', { name: 'Delete' });
  const htmlDelete = html.getByRole('menuitem', { name: 'Delete' });
  await expect(htmlDelete).toHaveCSS('color', await officialDelete.evaluate(el => getComputedStyle(el).color));
});

test('Dropdown keyboard navigation skips disabled items and outside clicks keep their own focus', async ({ page }) => {
  await page.goto(fixture + 'html.html');
  const trigger = page.getByRole('button', { name: 'Open actions' });
  const menu = page.getByRole('menu', { name: 'Actions' });
  await trigger.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Delete' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press('ArrowUp');
  await expect(menu.getByRole('menuitem', { name: 'Delete' })).toBeFocused();
  await page.keyboard.press('e');
  await expect(menu.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
  const outside = page.getByRole('textbox', { name: 'Email' });
  await outside.click();
  await expect(menu).toBeHidden();
  await expect(outside).toBeFocused();
});

test('Dropdown opens an RTL submenu with ArrowLeft and flips near an edge', async ({ page }) => {
  await page.setViewportSize({ width: 340, height: 400 });
  await page.goto(fixture + 'html.html');
  const trigger = page.getByRole('button', { name: 'Open actions' });
  await trigger.evaluate(el => {
    el.style.cssText = 'position:fixed; left:8px; bottom:5px;';
    el.parentElement.dir = 'rtl';
    document.getElementById('actions').insertAdjacentHTML('afterbegin', `
      <button class="dropdown-item" role="menuitem" tabindex="-1" data-dropdown-submenu="sub"
              aria-haspopup="menu" aria-expanded="false" aria-controls="sub">More</button>
      <div class="dropdown-content" data-dropdown-panel="submenu" role="menu" id="sub" aria-label="More actions" popover>
        <button class="dropdown-item" role="menuitem" tabindex="-1">Move</button>
      </div>`);
  });
  await trigger.press('ArrowDown');
  const parent = page.getByRole('menu', { name: 'Actions', exact: true });
  const triggerBox = await trigger.boundingBox();
  const parentBox = await parent.boundingBox();
  expect(parentBox.y + parentBox.height).toBeLessThanOrEqual(triggerBox.y - 3);
  const submenu = page.getByRole('menu', { name: 'More actions' });
  const more = parent.getByRole('menuitem', { name: 'More', exact: true });
  await expect(more).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(submenu.getByRole('menuitem', { name: 'Move' })).toBeFocused();
  const itemBox = await more.boundingBox();
  const submenuBox = await submenu.boundingBox();
  expect(submenuBox.x).toBeGreaterThan(itemBox.x + itemBox.width);
  expect(submenuBox.x + submenuBox.width).toBeLessThanOrEqual(332);
  await page.keyboard.press('ArrowRight');
  await expect(submenu).toBeHidden();
  await expect(more).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('Dropdown checkboxes and radios use the same activation path for pointer and keyboard', async ({ page }) => {
  await page.goto(fixture + 'html.html');
  await page.locator('#actions').evaluate(menu => {
    menu.insertAdjacentHTML('afterbegin', `
      <button class="dropdown-item dropdown-check" role="menuitemcheckbox" aria-checked="false" tabindex="-1">Grid</button>
      <div role="group" aria-label="Density">
        <button class="dropdown-item dropdown-radio" role="menuitemradio" aria-checked="true" tabindex="-1">Comfortable</button>
        <button class="dropdown-item dropdown-radio" role="menuitemradio" aria-checked="false" tabindex="-1">Compact</button>
      </div>`);
  });
  await page.getByRole('button', { name: 'Open actions' }).press('ArrowDown');
  const grid = page.getByRole('menuitemcheckbox', { name: 'Grid' });
  await grid.press('Space');
  await expect(grid).toBeChecked();
  await grid.click();
  await expect(grid).not.toBeChecked();
  await page.getByRole('menuitemradio', { name: 'Compact' }).click();
  await expect(page.getByRole('menuitemradio', { name: 'Compact' })).toBeChecked();
  await expect(page.getByRole('menuitemradio', { name: 'Comfortable' })).not.toBeChecked();
});

test('Dropdown opens a submenu by mouse hover and activates a nested action', async ({ page }) => {
  await page.goto(fixture + 'html.html');
  await page.locator('#actions').evaluate(menu => {
    menu.insertAdjacentHTML('afterbegin', `
      <button class="dropdown-item" role="menuitem" tabindex="-1" data-dropdown-submenu="sub"
              aria-haspopup="menu" aria-expanded="false" aria-controls="sub">More</button>
      <div class="dropdown-content" data-dropdown-panel="submenu" role="menu" id="sub" aria-label="More actions" popover>
        <button class="dropdown-item" role="menuitem" tabindex="-1" id="nested-action">Move</button>
      </div>`);
    document.getElementById('nested-action').addEventListener('click', () => { menu.dataset.moved = 'true'; });
  });
  const trigger = page.getByRole('button', { name: 'Open actions' });
  await trigger.click();
  await page.getByRole('menuitem', { name: 'More', exact: true }).hover();
  await page.getByRole('menuitem', { name: 'Move' }).click();
  await expect(page.locator('#actions')).toHaveAttribute('data-moved', 'true');
  await expect(page.getByRole('menu', { name: 'Actions', exact: true })).toBeHidden();
});
