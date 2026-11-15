import { test, expect } from '@playwright/test';

// The route is prepared before launch: without a configured checkout it must say so and sell nothing.
test.describe('Reta Final sales page (/reta-final/)', () => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    test(`reads as one page without overflow at ${viewport.width}px and requests nothing external`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const external: string[] = [];
      page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4321/')) external.push(request.url()); });
      await page.goto('reta-final/', { waitUntil: 'networkidle' });
      await expect(page).toHaveTitle('Reta Final · Preparação para Entrevistas em Inglês');
      await expect(page.locator('h1')).toContainText('Você não precisa de mais aulas de inglês antes da sua entrevista.');
      await expect(page.locator('.rf-tool')).toHaveCount(10);
      await expect(page.locator('.rf-item')).toHaveCount(7);
      await expect(page.locator('.rf-faq details')).toHaveCount(4);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.fonts.check('16px Inter'))).toBe(true);
      expect(external).toEqual([]);
    });
  }

  test('without a checkout the page states that sales are not open and offers no purchase link', async ({ page }) => {
    await page.goto('reta-final/');
    await expect(page.locator('[data-rf-checkout]')).toHaveCount(0);
    await expect(page.locator('[data-rf-unavailable]')).toHaveCount(3);
    await expect(page.locator('[data-rf-status]')).toContainText('As vendas do Reta Final ainda não foram abertas');
    await page.getByRole('link', { name: 'Ver a oferta' }).click();
    await expect(page.locator('#oferta')).toBeInViewport();
    await expect(page.locator('#oferta .rf-price')).toContainText('57,00');
    for (const link of await page.locator('.rf a[href]').all()) expect(await link.getAttribute('href')).toMatch(/^(#|\/)/);
  });

  test('questions open from the keyboard', async ({ page }) => {
    await page.goto('reta-final/');
    const second = page.locator('.rf-faq details').nth(1);
    await second.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('open', '');
    await expect(second).toContainText('Adobe Acrobat Reader');
  });
});
