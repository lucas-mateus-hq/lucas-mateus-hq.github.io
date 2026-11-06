import { test, expect } from '@playwright/test';

// Retirement replaces the old live Relay contract. Its implementation is recoverable in git history.
for (const path of ['relay/', 'relay/app.js', 'protocol/CAPABILITY_EVIDENCE_PROTOCOL_v0.1.md', 'protocol/capability-evidence-receipt.schema.json']) {
  test(`retired technical route is unavailable: ${path}`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain('caplab.relay.self.v1');
  });
}

for (const [route, home] of [['criacoes/reta-final/', '/'], ['en/criacoes/reta-final/', '/en/']] as const) {
  test(`retired product redirects to its locale home: ${route}`, async ({ page, browser }) => {
    await page.goto(route);
    await expect(page).toHaveURL('http://127.0.0.1:4321' + home);
    await expect(page.locator('html')).toHaveAttribute('lang', home === '/' ? 'pt-BR' : 'en-US');
    await expect(page.locator('#reta-final')).toHaveCount(0);
    const context = await browser.newContext({javaScriptEnabled: false});
    const noScript = await context.newPage();
    await noScript.goto('http://127.0.0.1:4321/' + route);
    await expect(noScript).toHaveURL('http://127.0.0.1:4321' + home);
    await context.close();
  });
}
