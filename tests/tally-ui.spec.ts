import {test,expect} from '@playwright/test';
for(const [route,id,title] of [['./','Ab1001','Aplicação para acompanhamento de entrevistas no Tally']] as const) {
 for(const javascript of [true,false])test(`localized application and external fallback: ${route}, JS ${javascript}`,async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:javascript,viewport:{width:390,height:844}});
 const page=await context.newPage();const requests:string[]=[];
 await page.route('https://tally.so/**',route=>{requests.push(route.request().url());return route.fulfill({contentType:'text/html',body:'<!doctype html><html><body><h1>Synthetic provider fixture</h1></body></html>'});});
 await page.goto('http://127.0.0.1:4321/'+(route==='./'?'':route)+'?email=DO_NOT_FORWARD#aplicacao');
 const frame=page.locator('iframe[data-interview-application]');await frame.scrollIntoViewIfNeeded();
 await expect(frame).toHaveAttribute('src',`https://tally.so/embed/${id}?alignLeft=1&hideTitle=1&transparentBackground=1`);
 await expect(frame).toHaveAttribute('title',title);await expect(frame).toHaveAttribute('referrerpolicy','no-referrer');
 await expect(page.frameLocator('iframe').getByRole('heading')).toHaveText('Synthetic provider fixture');
 await expect(page.locator('#aplicacao a[href^="https://tally.so/r/"]')).toHaveAttribute('href',`https://tally.so/r/${id}`);
 expect(requests.every(url=>!url.includes('DO_NOT_FORWARD'))).toBe(true);
 await expect(page.locator('body')).not.toContainText(/R\$ 80|Business English|Turnstile/);
 expect(await page.locator('iframe').evaluate(el=>el.getBoundingClientRect().right)).toBeLessThanOrEqual(390);
 await page.screenshot({path:`artifacts/site-consolidation/lote2-${route==='./'?'pt':'en'}-${javascript?'js':'nojs'}.png`,fullPage:true});
 await context.close();
 });
}

test('english home carries no application area',async({page})=>{
 await page.goto('http://127.0.0.1:4321/en/');
 await expect(page.locator('#aplicacao')).toHaveCount(0);
 await expect(page.locator('iframe[data-interview-application]')).toHaveCount(0);
});
