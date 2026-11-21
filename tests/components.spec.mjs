import { expect, test } from '@playwright/test';

const reference = '/tests/reference/';

test('official and HTML Button and Input have matching default dimensions', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(reference + 'index.html');
  const official = page.frameLocator('iframe[title="Official Nova"]');
  const html = page.frameLocator('iframe[title="HTML port"]');
  for (const locate of [
    frame => frame.getByRole('button', { name: 'Continue' }),
    frame => frame.getByRole('textbox', { name: 'Email' }),
  ]) {
    await expect(locate(official)).toHaveCSS('height', '32px');
    await expect(locate(html)).toHaveCSS('height', '32px');
    await expect(locate(html)).toHaveCSS('border-radius', await locate(official).evaluate(element => getComputedStyle(element).borderRadius));
  }
  expect(errors).toEqual([]);
});

test('native input submits, resets and validates as a form field', async ({ page }) => {
  await page.goto(reference + 'html.html?theme=dark');
  const input = page.getByRole('textbox', { name: 'Email' });
  await expect(input).toHaveCSS('height', '32px');
  await input.fill('invalid');
  expect(await input.evaluate(element => element.validity.typeMismatch)).toBe(true);
  await input.fill('sam@example.com');
  expect(await input.evaluate(element => new FormData(element.form).get(element.name))).toBe('sam@example.com');
  await input.evaluate(element => element.form.reset());
  await expect(input).toHaveValue('');
});

test('Dialog closes by Escape, close button and backdrop with focus restoration', async ({ page }) => {
  await page.goto(reference + 'html.html');
  const trigger = page.getByRole('button', { name: 'Open dialog' });
  const dialog = page.getByRole('dialog', { name: 'Edit profile' });

  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.mouse.click(0, 0);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Combobox hides nonmatches and clears its active descendant on an empty result', async ({ page }) => {
  await page.goto(reference + 'html.html');
  const trigger = page.locator('.combobox-trigger');
  await trigger.click();
  const search = page.getByRole('combobox', { name: 'Framework' });
  await expect(search).toBeFocused();
  await search.fill('svelte');
  await expect(search).toHaveAttribute('aria-activedescendant', 'svelte');
  await expect(page.locator('#react')).toBeHidden();

  await search.fill('no matches');
  await expect(page.getByText('No results found.')).toBeVisible();
  await expect(search).not.toHaveAttribute('aria-activedescendant');
  await expect(page.getByRole('option')).toHaveCount(0);

  await search.fill('vue');
  await search.press('Enter');
  await expect(trigger).toContainText('Vue');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('horizontal RTL Tabs move forward with ArrowLeft', async ({ page }) => {
  await page.goto(reference + 'html.html');
  await page.locator('main').evaluate(main => {
    main.insertAdjacentHTML('beforeend', `<div dir="rtl" role="tablist">
      <button class="tab-trigger" role="tab" aria-selected="false" aria-controls="a">A</button>
      <button class="tab-trigger" role="tab" aria-selected="true" aria-controls="b">B</button>
      <button class="tab-trigger" role="tab" aria-selected="false" aria-controls="c">C</button>
    </div><div id="a" hidden></div><div id="b"></div><div id="c" hidden></div>`);
  });
  await page.getByRole('tab', { name: 'B', exact: true }).press('ArrowLeft');
  const next = page.getByRole('tab', { name: 'C', exact: true });
  await expect(next).toBeFocused();
  await expect(next).toHaveAttribute('aria-selected', 'true');
});

for (const [theme, viewport] of [
  ['light', { width: 1100, height: 760 }],
  ['dark', { width: 390, height: 980 }],
]) {
  test(`renders both implementations and opens matching Dialog layouts in ${theme} mode`, async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto(reference + 'index.html?theme=' + theme);
    const official = page.frameLocator('iframe[title="Official Nova"]');
    const html = page.frameLocator('iframe[title="HTML port"]');
    await expect(official.getByRole('combobox', { name: 'Framework' })).toBeVisible();
    await expect(html.locator('.combobox-trigger')).toBeVisible();
    await expect(official.locator('html')).toHaveClass(theme === 'dark' ? 'dark' : '');
    await expect(html.locator('html')).toHaveClass(theme === 'dark' ? 'dark' : '');

    if (process.env.CAPTURE_COMPONENTS) {
      await page.screenshot({ path: testInfo.outputPath('comparison.png'), fullPage: true });
    }

    for (const frame of [official, html]) {
      await frame.getByRole('button', { name: 'Open dialog' }).click();
      await expect(frame.getByRole('dialog', { name: 'Edit profile' })).toBeVisible();
      await expect(frame.getByRole('button', { name: 'Save' })).toBeVisible();
    }

    const officialDialog = official.getByRole('dialog', { name: 'Edit profile' });
    const htmlDialog = html.getByRole('dialog', { name: 'Edit profile' });
    const expectedWidth = (await officialDialog.boundingBox()).width;
    expect(Math.abs((await htmlDialog.boundingBox()).width - expectedWidth)).toBeLessThan(1);
    expect(errors).toEqual([]);
  });
}
