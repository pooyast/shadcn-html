import { expect, test } from '@playwright/test';

const fixture = '/tests/reference/';

test('Context Menu matches Nova item height and minimum width', async ({ page }) => {
  await page.goto(fixture + 'index.html');
  for (const title of ['Official Nova', 'HTML port']) {
    const frame = page.frameLocator(`iframe[title="${title}"]`);
    await frame.getByText('Right click here', { exact: true }).click({ button: 'right' });
    const menu = frame.getByRole('menu', { name: 'Editing actions' });
    await expect(menu).toHaveCSS('min-width', '144px');
    await expect(menu.getByRole('menuitem', { name: 'Cut' })).toHaveCSS('height', '28px');
    await expect(menu.getByRole('menuitem', { name: 'Paste' })).toBeDisabled();
  }
});

test('Context Menu opens with Shift+F10, skips ARIA-disabled items, and restores focus', async ({ page }) => {
  await page.goto(fixture + 'html.html');
  const trigger = page.getByText('Right click here', { exact: true });
  await trigger.press('Shift+F10');
  const menu = page.getByRole('menu', { name: 'Editing actions' });
  await expect(menu.getByRole('menuitem', { name: 'Cut' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Delete' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('Context Menu flips and clamps near the viewport edge and light dismisses', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 400 });
  await page.goto(fixture + 'html.html');
  const trigger = page.getByText('Right click here', { exact: true });
  await trigger.evaluate(el => {
    el.dir = 'rtl';
    el.style.cssText = 'position:fixed;right:1px;bottom:1px;width:32px;height:32px;min-height:0;overflow:hidden;';
  });
  await trigger.click({ button: 'right', position: { x: 28, y: 26 } });
  const menu = page.getByRole('menu', { name: 'Editing actions' });
  await expect(menu).toBeVisible();
  const bounds = await menu.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(7);
  expect(bounds.y).toBeGreaterThanOrEqual(7);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(313);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(393);

  const outside = page.getByRole('textbox', { name: 'Email' });
  await outside.click();
  await expect(menu).toBeHidden();
  await expect(outside).toBeFocused();
});

test('legacy Context Menu markup works when the popup role is omitted', async ({ page }) => {
  await page.goto(fixture + 'html.html');
  await page.locator('#edit-context').evaluate(el => el.removeAttribute('role'));
  await page.getByText('Right click here', { exact: true }).press('ContextMenu');
  await expect(page.getByRole('menu', { name: 'Editing actions' })).toBeVisible();
});
