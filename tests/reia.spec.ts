import { test, expect } from '@playwright/test';

test.describe('REIA Sales Page (/renda-extra-com-ia/)', () => {
  const route = 'renda-extra-com-ia/';

  test('contains complete authentic content, headings and meta', async ({ page }) => {
    await page.goto(route);

    // Check page title and headings
    await expect(page).toHaveTitle(/Renda Extra com IA: Teste, Entregue, Repita/);
    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Renda Extra com IA: Teste, Entregue, Repita');

    // Check 5 listicle reason cards
    await expect(page.locator('.listicle-card')).toHaveCount(5);
    await expect(page.locator('.listicle-card').nth(0)).toContainText('Fim da paralisia por excesso de teoria');
    await expect(page.locator('.listicle-card').nth(1)).toContainText('Diagnóstico ágil do serviço certo para seu perfil');
    await expect(page.locator('.listicle-card').nth(2)).toContainText('Abordagem profissional sem parecer amador ou invasivo');
    await expect(page.locator('.listicle-card').nth(3)).toContainText('Economia de tempo com templates prontos para o mercado');
    await expect(page.locator('.listicle-card').nth(4)).toContainText('Entenda o que está comprando antes de decidir');

    // Check FAQ items
    await expect(page.locator('.faq-item')).toHaveCount(4);
    await expect(page.locator('.faq-item').nth(0)).toContainText('Como recebo o acesso ao material?');
    await expect(page.locator('.faq-item').nth(1)).toContainText('Preciso pagar assinaturas caras de IA para começar?');

    // Check 4 deliverable cards
    await expect(page.locator('.card-deliverable')).toHaveCount(4);
    await expect(page.locator('.card-deliverable').nth(0)).toContainText('E-book Principal (72 Páginas)');
    await expect(page.locator('.card-deliverable').nth(1)).toContainText('Bússola de Renda com IA');
    await expect(page.locator('.card-deliverable').nth(2)).toContainText('Primeiro Cliente IA');
    await expect(page.locator('.card-deliverable').nth(3)).toContainText('Cardápio Editável & Plano 30 Dias');

    // Check author section
    await expect(page.locator('.author-card')).toBeVisible();
    await expect(page.locator('.author-card h2')).toHaveText('Lucas Mateus');
    await expect(page.locator('.author-card .meta-note')).toHaveCount(0);
    await expect(page.locator('.author-card')).not.toContainText('Nota de transparência');
    const portrait = page.locator('.author-portrait');
    await expect(portrait).toHaveAttribute('alt', 'Foto de Lucas Mateus');
    await expect(portrait).toBeVisible();
    const visual = await portrait.evaluate((img: HTMLImageElement) => ({
      loaded: img.complete && img.naturalWidth > 0,
      borderRadius: getComputedStyle(img).borderRadius,
    }));
    expect(visual.loaded).toBe(true);
    expect(visual.borderRadius).toBe('50%');

    // Check guarantee
    await expect(page.locator('.guarantee-box')).toBeVisible();
    await expect(page.locator('.guarantee-box h2')).toHaveText('Confira a oferta antes de comprar');
  });

  test('checkout CTAs consistently point to canonical Hotmart checkout with secure attributes', async ({ page }) => {
    await page.goto(route);
    const ctas = page.locator('a.cta-button');
    const count = await ctas.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const cta = ctas.nth(i);
      await expect(cta).toHaveAttribute('href', 'https://pay.hotmart.com/I108167656O');
      await expect(cta).toHaveAttribute('target', '_blank');
      await expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
    }

    // Zero embedded forms or payment inputs
    await expect(page.locator('form')).toHaveCount(0);
    await expect(page.locator('input')).toHaveCount(0);
  });

  test('keyboard navigation and skip-to-content work properly', async ({ page }) => {
    await page.goto(route);

    // Tab to skip link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute('href', '#reia-main');

    // Activate skip link
    await page.keyboard.press('Enter');
    const main = page.locator('main#reia-main');
    await expect(main).toBeFocused();
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`responsive layout fits without horizontal scrollbar at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);

      // Verify no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // 1px rounding tolerance

      // Capture screenshots for desktop (1440px) and mobile (390px)
      if (width === 1440) {
        await page.screenshot({ path: 'artifacts/reia-desktop.png', fullPage: true });
      } else if (width === 390) {
        await page.screenshot({ path: 'artifacts/reia-mobile.png', fullPage: true });
      }
    });
  }
});
