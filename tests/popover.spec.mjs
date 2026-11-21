import { expect, test } from '@playwright/test';

const fixture = '/tests/reference/';

test('Popover matches the Nova default width and corner radius', async ({ page }) => {
  await page.goto(fixture + 'index.html');
  const official = page.frameLocator('iframe[title="Official Nova"]');
  const html = page.frameLocator('iframe[title="HTML port"]');
  for (const frame of [official, html]) {
    await frame.getByRole('button', { name: 'Open popover' }).click();
    await expect(frame.getByRole('dialog', { name: 'Dimensions' })).toHaveCSS('width', '288px');
  }
  const radius = await official.getByRole('dialog', { name: 'Dimensions' })
    .evaluate(element => getComputedStyle(element).borderRadius);
  await expect(html.getByRole('dialog', { name: 'Dimensions' })).toHaveCSS('border-radius', radius);
});

test('native Popover opens by keyboard, restores focus on Escape, and light-dismisses', async ({ page }) => {
  await page.goto(fixture + 'html.html');
  const trigger = page.getByRole('button', { name: 'Open popover' });
  const popup = page.getByRole('dialog', { name: 'Dimensions' });
  await trigger.press('Enter');
  await expect(popup.getByRole('textbox', { name: 'Width' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(popup).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await expect(popup).toBeHidden();
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeFocused();
});

test('Popover flips above a bottom corner trigger and stays inside a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 285, height: 400 });
  await page.goto(fixture + 'html.html');
  const trigger = page.getByRole('button', { name: 'Open popover' });
  await trigger.evaluate(button => {
    button.style.cssText = 'position:fixed;right:3px;bottom:3px;';
  });
  await trigger.click();
  const popup = page.getByRole('dialog', { name: 'Dimensions' });
  await expect(popup).toHaveAttribute('data-positioned', '');
  const anchor = await trigger.boundingBox();
  const box = await popup.boundingBox();
  expect(box.y + box.height).toBeLessThanOrEqual(anchor.y - 3);
  expect(box.x).toBeGreaterThanOrEqual(7);
  expect(box.x + box.width).toBeLessThanOrEqual(278);
});

test('Popover start aligns to its actual opener in RTL, including a dynamically inserted trigger', async ({ page }) => {
  await page.goto(fixture + 'html.html');
  await page.locator('#dimensions').evaluate(popup => {
    popup.dataset.align = 'start';
    const opener = document.createElement('button');
    opener.type = 'button';
    opener.textContent = 'Alternate opener';
    opener.setAttribute('popovertarget', popup.id);
    opener.dir = 'rtl';
    opener.style.cssText = 'position:fixed;left:500px;top:40px;';
    document.body.append(opener);
  });
  const trigger = page.getByRole('button', { name: 'Alternate opener' });
  await trigger.click();
  const popup = page.getByRole('dialog', { name: 'Dimensions' });
  await expect(popup).toHaveAttribute('data-positioned', '');
  const anchor = await trigger.boundingBox();
  const box = await popup.boundingBox();
  expect(Math.abs(box.x + box.width - anchor.x - anchor.width)).toBeLessThan(1);
});
