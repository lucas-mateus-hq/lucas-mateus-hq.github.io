import {test,expect} from '@playwright/test';
const endpoint='https://intake-test.example.workers.dev/v1/lesson-requests';
const syntheticChallenge=`window.turnstile={render:()=> 'synthetic-widget',getResponse:()=> 'synthetic-no-real-provider',reset:()=>{}};`;
async function prepare(page:any,english=false){
 await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*',(route:any)=>route.fulfill({contentType:'application/javascript',body:syntheticChallenge}));
 await page.goto(english?'en/#pedido-aulas':'./#pedido-aulas');
 await page.locator('#lesson-name').fill('Synthetic Visitor');
 await expect.poll(()=>page.evaluate(()=>Boolean((window as any).turnstile))).toBe(true);
 await page.locator('#lesson-email').fill('visitor@example.invalid');
 await page.locator('#lesson-goal').selectOption('interview');
 await page.locator('#lesson-speaking').selectOption('needs_support');
 await page.locator('#lesson-timeframe').selectOption('week');
 await page.locator('#lesson-context').fill('Practice explaining my experience in an interview.');
 await page.locator('[data-lesson-form] [name=privacyAcknowledged]').check();
}
for(const english of [false,true])test(`configured form acknowledges only a confirmed response (${english?'EN':'PT'})`,async({page})=>{
 let submissions:any[]=[];
 await page.route(endpoint,async route=>{const body=route.request().postDataJSON();submissions.push(body);await route.fulfill({status:201,headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:JSON.stringify({accepted:true,requestId:body.requestId})});});
 await prepare(page,english);
 await page.locator('[data-lesson-form]').getByRole('button',{name:english?'Send inquiry':'Enviar solicitação'}).click();
 await expect(page.locator('[data-lesson-form] [data-form-status]')).toContainText(english?'Inquiry received':'Solicitação recebida');
 expect(submissions).toHaveLength(1);expect(submissions[0].locale).toBe(english?'en-US':'pt-BR');expect(submissions[0].email).toBe('visitor@example.invalid');
 await expect(page.locator('#lesson-name')).toHaveValue('');
 await expect(page.locator('[data-form-fields]')).toHaveAttribute('disabled','');
 await expect(page.locator('#lesson-name')).toBeDisabled();
 await expect(page.locator('[data-lesson-form]').getByRole('button',{name:english?'Send inquiry':'Enviar solicitação'})).toBeDisabled();
 expect(await page.evaluate(()=>localStorage.length+sessionStorage.length)).toBe(0);
});
test('failure preserves answers, reuses ID on retry and rejects contradictory evidence',async({page})=>{
 let ids:string[]=[];
 await page.route(endpoint,async route=>{const body=route.request().postDataJSON();ids.push(body.requestId);await route.fulfill({status:ids.length===1?503:200,headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:ids.length===2?JSON.stringify({accepted:true,requestId:'wrong-reference'}):JSON.stringify({accepted:ids.length===3,requestId:body.requestId})});});
 await prepare(page);
 for(let i=0;i<2;i++){
  await page.locator('[data-lesson-form]').getByRole('button',{name:'Enviar solicitação'}).click();
  await expect(page.locator('[data-lesson-form] [data-form-status]')).toContainText('Não foi possível confirmar');
  await expect(page.locator('#lesson-email')).toHaveValue('visitor@example.invalid');
 }
 await page.locator('[data-lesson-form]').getByRole('button',{name:'Enviar solicitação'}).click();await expect(page.locator('[data-lesson-form] [data-form-status]')).toContainText('Solicitação recebida');expect(new Set(ids).size).toBe(1);
});
test('required and invalid fields never reach the endpoint',async({page})=>{
 let calls=0;await page.route(endpoint,async route=>{calls++;await route.abort();});
 await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*',route=>route.fulfill({contentType:'application/javascript',body:syntheticChallenge}));
 await page.goto('./#pedido-aulas');await page.locator('[data-lesson-form]').getByRole('button',{name:'Enviar solicitação'}).click();expect(calls).toBe(0);
 await prepare(page);await page.locator('#lesson-email').fill('invalid');await page.locator('[data-lesson-form]').getByRole('button',{name:'Enviar solicitação'}).click();expect(calls).toBe(0);
});
test('verification failure gives an honest fallback without sending answers',async({page})=>{
 await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*',route=>route.abort());
 await page.goto('./#pedido-aulas');await page.locator('#lesson-name').fill('Synthetic');
 await expect(page.locator('[data-lesson-form] [data-form-status]')).toContainText('Não foi possível carregar');
 await expect(page.locator('[data-lesson-form] a[href="https://www.linkedin.com/in/lucasmateus/"]')).toBeVisible();
});
test('screening controls fit at 320px and 1440px; language switch preserves the form section',async({page})=>{
 for(const width of [320,1440]){
  await page.setViewportSize({width,height:900});await page.goto('./#pedido-aulas');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  for(const field of await page.locator('[data-lesson-form] input:not([name=website]),[data-lesson-form] select,[data-lesson-form] textarea,[data-lesson-form] button').all()){
   const box=await field.boundingBox();expect(box?.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);}
 }
 await page.getByRole('link',{name:'English (United States)',exact:true}).click();await expect(page).toHaveURL(/\/en\/#pedido-aulas$/);
 await expect(page.locator('#lesson-goal')).toContainText('Job interview preparation');
});


test('mock interview submits via the unchanged secure lesson endpoint only after confirmation',async({page})=>{
  const submissions:any[]=[];
  await page.route(endpoint,async route=>{
    const body=route.request().postDataJSON();
    submissions.push(body);
    await route.fulfill({status:201,headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:JSON.stringify({accepted:true,requestId:body.requestId})});
  });
  await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*',route=>route.fulfill({contentType:'application/javascript',body:syntheticChallenge}));
  await page.goto('./#pedido-simulacao');
  await page.locator('#mock-name').fill('Synthetic Visitor');
  await expect.poll(()=>page.evaluate(()=>Boolean((window as any).turnstile))).toBe(true);
  await page.locator('#mock-email').fill('visitor@example.invalid');
  await page.locator('#mock-role').fill('Recruiting Specialist');
  await page.locator('#mock-availability').fill('Tuesday evening, Brasília time');
  await page.locator('#mock-notes').fill('Interview with an international team.');
  await page.locator('.mock-form [name=privacyAcknowledged]').check();
  await page.locator('.mock-form').getByRole('button',{name:'Enviar solicitação'}).click();
  await expect(page.locator('[data-mock-status]')).toContainText('Solicitação recebida');
  expect(submissions).toHaveLength(1);
  expect(submissions[0].goal).toBe('interview');
  expect(submissions[0].speaking).toBe('not_provided');
  expect(submissions[0].timeframe).toBe('not_provided');
  expect(submissions[0].availability).toBe('Tuesday evening, Brasília time');
  expect(submissions[0].context).toMatch(/Service: 60-minute mock interview \(BRL 80\)/);
  expect(submissions[0].context).toContain('Recruiting Specialist');
  expect(submissions[0].context).toContain('personalized written report within 2h after session');
  expect(submissions[0].turnstileToken).toBe('synthetic-no-real-provider');
  await expect(page.locator('#mock-name')).toBeDisabled();
  expect(await page.locator('.mock-form a[href*="linkedin.com"]').count()).toBe(0);
});
