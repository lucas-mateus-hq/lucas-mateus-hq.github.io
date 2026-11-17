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
      await expect(page.locator('h1')).toContainText('Pare de improvisar na entrevista em inglês');
      await expect(page.locator('.rf-tool')).toHaveCount(10);
      await expect(page.locator('.rf-item')).toHaveCount(7);
      await expect(page.locator('.rf-faq details')).toHaveCount(5);
      await expect(page.locator('.rf-reason')).toHaveCount(5);
      await expect(page.locator('.rf-reason.is-text')).toHaveCount(5);
      await expect(page.locator('.rf-page')).toHaveCount(2); // só capa e sumário do Workbook
      await expect(page.locator('.rf-page figcaption', { hasText: 'Exemplo fictício' })).toHaveCount(0);
      for (const figure of await page.locator('.rf-page img').all()) {
        await figure.scrollIntoViewIfNeeded();
        await expect(figure).toBeVisible();
        await expect.poll(() => figure.evaluate((img: HTMLImageElement) => img.complete ? img.naturalWidth : 0)).toBe(480);
      }
      const before = page.locator('.rf-errors li');
      await before.first().scrollIntoViewIfNeeded();
      await expect(before).toHaveCount(3);
      await expect(page.locator('.rf-before')).toHaveCount(3);
      await expect(page.locator('.rf-after')).toHaveCount(3);
      const timeline = page.locator('.rf-timeline');
      await timeline.scrollIntoViewIfNeeded();
      await expect(timeline.locator('> li')).toHaveCount(4);
      await expect(timeline.locator('ul li')).toHaveCount(10);
      const audio = page.locator('.rf-item.is-audio');
      await audio.scrollIntoViewIfNeeded();
      await expect(audio).toBeVisible();
      await expect(audio).toContainText('25 áudios de prática');
      await expect(audio.locator('.rf-chip')).toHaveText('Áudio');
      await expect(audio.locator('.rf-wave')).toBeVisible();
      await expect(page.locator('audio')).toHaveCount(0); // o player só aparece quando o trecho de 15 s estiver no repositório
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.fonts.check('16px Inter'))).toBe(true);
      expect(external).toEqual([]);
    });
  }

  test('without a checkout the page states that sales are not open and offers no purchase link', async ({ page }) => {
    await page.goto('reta-final/');
    await expect(page.locator('[data-rf-checkout]')).toHaveCount(0);
    await expect(page.locator('[data-rf-unavailable]')).toHaveCount(3);
    await expect(page.locator('[data-rf-status]').first()).toContainText('As vendas do Reta Final ainda não foram abertas');
    await page.getByRole('link', { name: 'Ver a oferta' }).click();
    await expect(page.locator('#oferta')).toBeInViewport();
    await expect(page.locator('#oferta .rf-price')).toContainText('97,00');
    await expect(page.locator('#oferta')).toContainText('7 materiais, 25 áudios');
    await page.getByRole('navigation', { name: 'Rodapé' }).getByRole('link', { name: 'Lucas Mateus' }).click();
    await expect(page).toHaveURL(/#rf-autor$/);
    await expect(page.locator('#rf-autor')).toBeInViewport();
    for (const link of await page.locator('.rf a[href]').all()) expect(await link.getAttribute('href')).toMatch(/^(#|\/)/);
  });

  test('questions open from the keyboard', async ({ page }) => {
    await page.goto('reta-final/');
    const second = page.locator('.rf-faq details').nth(1);
    await second.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('open', '');
    await expect(second).toContainText('Nenhuma faixa é roteiro para decorar');
  });
});
