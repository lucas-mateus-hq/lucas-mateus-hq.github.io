import {test,expect} from '@playwright/test';
const endpoint='https://formspree.io/f/xsyntest';
async function fill(page:any,en=false) {
  await page.goto(en?'en/#pedido-aulas':'./#pedido-aulas');
  await page.locator('#lesson-name').fill('Synthetic Visitor');
  await page.locator('#lesson-email').fill('visitor@example.invalid');
  await page.locator('#lesson-goal').selectOption('business');
  await page.locator('#lesson-speaking').selectOption('comfortable');
  await page.locator('#lesson-timeframe').selectOption('month');
  await page.locator('#lesson-context').fill('Practice a presentation for a team meeting.');
  await page.locator('[name=privacyAcknowledged]').check();
}
for(const en of [false,true])test(`native email handoff includes screening and locale (${en?'EN':'PT'})`,async({page})=>{
  let submissions:URLSearchParams[]=[];
  await page.route(endpoint,async route=>{
    expect(route.request().method()).toBe('POST');
    submissions.push(new URLSearchParams(route.request().postData()!));
    await route.fulfill({contentType:'text/html',body:'<h1>Synthetic provider response. No email sent.</h1>'});
  });
  await fill(page,en);
  await page.getByRole('button',{name:en?'Send inquiry':'Enviar solicitação'}).click();
  await expect(page).toHaveURL(endpoint);
  expect(submissions).toHaveLength(1);
  const payload=submissions[0];
  if(!payload)throw new Error('Expected one intercepted submission');
  expect([...payload.keys()].sort()).toEqual(['availability','context','email','goal','locale','name','privacyAcknowledged','speaking','timeframe'].sort());
  expect(payload.get('email')).toBe('visitor@example.invalid');
  expect(payload.get('goal')).toBe('business');expect(payload.get('context')).toBe('Practice a presentation for a team meeting.');
  expect(payload.get('locale')).toBe(en?'en-US':'pt-BR');
});
test('native validation blocks missing answers, invalid email and missing acknowledgement',async({page})=>{
  let calls=0;await page.route(endpoint,async route=>{calls++;await route.abort();});
  await page.goto('./#pedido-aulas');await page.getByRole('button',{name:'Enviar solicitação'}).click();
  await fill(page);await page.locator('#lesson-email').fill('invalid');await page.getByRole('button',{name:'Enviar solicitação'}).click();
  await page.locator('#lesson-email').fill('visitor@example.invalid');await page.locator('[name=privacyAcknowledged]').uncheck();await page.getByRole('button',{name:'Enviar solicitação'}).click();
  expect(calls).toBe(0);await expect(page).not.toHaveURL(endpoint);
});
test('email works without JavaScript and does not depend on Meta or Cloudflare configuration',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  let calls=0;await page.route(endpoint,async route=>{calls++;await route.fulfill({contentType:'text/html',body:'<h1>Synthetic response</h1>'});});
  await fill(page);await expect(page.locator('[data-challenge]')).toHaveCount(0);await expect(page.locator('fieldset')).toBeEnabled();
  await page.getByRole('button',{name:'Enviar solicitação'}).click();await expect(page).toHaveURL(endpoint);expect(calls).toBe(1);await context.close();
});
test('no provider traffic before submission, no local storage and no public owner address',async({page})=>{
  const external:string[]=[];page.on('request',request=>{if(!new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))external.push(request.url());});
  await fill(page);await page.locator('#lesson-availability').fill('Evenings');
  expect(external).toEqual([]);
  expect(await page.evaluate(()=>localStorage.length+sessionStorage.length)).toBe(0);
  const form=page.locator('[data-email-form]');await expect(form).toHaveAttribute('action',endpoint);
  expect(await form.innerHTML()).not.toMatch(/@gmail\.com|wa\.me|WHATSAPP_TO|META_ACCESS_TOKEN|type="file"|name="(?:_cc|_next|access_key)"/);
  await expect(page.locator('[data-email-handoff]')).toContainText('Formspree');
});
test('provider error is never replaced by a site claim of receipt or inbox delivery',async({page})=>{
  await page.route(endpoint,route=>route.fulfill({status:429,contentType:'text/html',body:'<h1>Synthetic provider limit error</h1>'}));
  await fill(page);await page.getByRole('button',{name:'Enviar solicitação'}).click();
  await expect(page.locator('h1')).toHaveText('Synthetic provider limit error');
  await expect(page.getByText('Solicitação recebida')).toHaveCount(0);
});
test('email privacy matches the selected transport in both languages',async({page})=>{
  for(const route of ['privacidade/','privacy/']){
    await page.goto(route);const text=await page.locator('main').innerText();
    expect(text).toContain('Formspree');expect(text).toContain('30');expect(text).not.toContain('Cloudflare D1');
    await expect(page.locator('a[href="https://formspree.io/legal/privacy-policy/"]')).toHaveCount(1);
    await expect(page.locator('a[href*="whatsapp.com"]')).toHaveCount(0);
  }
});
