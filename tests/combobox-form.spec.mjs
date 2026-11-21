import { expect, test } from '@playwright/test';

const reference = '/tests/reference/';

for (const multiple of [false, true]) {
  test(`Combobox synchronizes ${multiple ? 'multiple values in RTL' : 'a single value'} with a native form field`, async ({ page }) => {
    await page.goto(reference + 'html.html');
    const fixture = page.locator('.combobox');
    await fixture.evaluate((original, multiple) => {
      const clone = original.cloneNode(true);
      clone.removeAttribute('data-init');
      const form = document.createElement('form');
      form.setAttribute('aria-label', 'Framework form');
      form.dir = multiple ? 'rtl' : 'ltr';
      form.append(clone);
      original.replaceWith(form);
      clone.insertAdjacentHTML('beforeend', `
        <select data-combobox-field name="framework" ${multiple ? 'multiple' : ''} hidden>
          <option value="React" selected>React</option>
          <option value="SvelteKit">SvelteKit</option>
          <option value="Vue">Vue</option>
        </select>
      `);
    }, multiple);
    const trigger = fixture.locator('.combobox-trigger');
    const field = fixture.locator('select');
    const search = fixture.getByRole('combobox', { name: 'Framework' });
    await expect(trigger).toContainText('React');
    await trigger.click();
    await search.fill('vue');
    await search.press('Enter');
    await expect(trigger).toContainText(multiple ? 'React, Vue' : 'Vue');
    await expect(trigger).toHaveAttribute('aria-expanded', multiple ? 'true' : 'false');
    const getValues = () => field.evaluate(select => new FormData(select.form).getAll(select.name));
    expect(await getValues()).toEqual(multiple ? ['React', 'Vue'] : ['Vue']);

    if (multiple) {
      await search.press('Enter');
      await expect(trigger).toContainText('React');
      expect(await getValues()).toEqual(['React']);
      await search.press('Escape');
      await expect(trigger).toBeFocused();
    }

    await field.evaluate(select => {
      select.value = 'SvelteKit';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect(trigger).toContainText('SvelteKit');
    expect(await getValues()).toEqual(['SvelteKit']);

    await field.evaluate(select => select.form.reset());
    await expect(trigger).toContainText('React');
    expect(await getValues()).toEqual(['React']);
  });
}
