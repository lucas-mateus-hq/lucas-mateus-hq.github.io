import {test,expect} from '@playwright/test';
test('optional analytics respects acceptance, rejection and withdrawal without sending application values',async({page})=>{
 const requests:string[]=[];
 await page.route(/https:\/\/.*(?:googletagmanager\.com|google-analytics\.com)\/.*/,route=>{requests.push(route.request().url());return route.fulfill({contentType:'application/javascript',body:''});});
 await page.goto('./?email=DO_NOT_SEND#aplicacao');
 await expect(page.locator('[data-analytics-choice]')).toBeVisible();expect(requests).toEqual([]);
 await page.locator('[data-analytics-reject]').click();expect(requests).toEqual([]);
 await page.reload();await expect(page.locator('[data-analytics-choice]')).toBeHidden();expect(requests).toEqual([]);
 await page.locator('[data-analytics-settings]').click();await page.locator('[data-analytics-accept]').click();
 await expect.poll(()=>requests.length).toBe(1);
 expect(requests[0]).toBe('https://www.googletagmanager.com/gtag/js?id=G-75PZFNFP2X');
 const config=await page.evaluate(()=>Array.from((window as any).dataLayer).map((a:any)=>Array.from(a)).find((a:any)=>a[0]==='config')) as any;
 expect(config[2].page_location).toBe('http://127.0.0.1:4321/');expect(config[2].page_referrer).toBe('');
 await page.locator('[data-analytics-settings]').click();await page.locator('[data-analytics-reject]').click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('lucas-analytics-consent-v1')||'{}').choice)).toBe('rejected');
 expect(requests.some(url=>url.includes('DO_NOT_SEND'))).toBe(false);
});
