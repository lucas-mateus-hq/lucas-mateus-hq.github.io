import {test,expect} from '@playwright/test';

const formIds={
  'pt-BR':{lesson:'Ab1001',mock:'Cd1002'},
  'en-US':{lesson:'Ef1003',mock:'Gh1004'}
} as const;

for(const lang of ['pt-BR','en-US'] as const){
  test(`Tally embeds are accessible and keep external fallback (${lang})`,async({page})=>{
    // All Tally assets below are synthetic. No data is sent and no account is accessed.
    const embeds:string[]=[];
    await page.route('https://tally.so/widgets/embed.js',async route=>{
      await route.fulfill({status:200,contentType:'application/javascript',body:`
        document.querySelectorAll('iframe[data-tally-src]').forEach(frame => {
          frame.src = frame.dataset.tallySrc;
        });
      `});
    });
    await page.route('https://tally.so/embed/**',async route=>{
      embeds.push(route.request().url());
      await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html><body><p>Simulated Tally frame (no submission)</p></body></html>'});
    });
    await page.goto(lang==='pt-BR'?'./':'en/');
    const frames=page.locator('#aulas iframe[data-tally-src]');
    await expect(frames).toHaveCount(2);
    for(const kind of ['lesson','mock'] as const){
      const id=formIds[lang][kind];
      const section=page.locator(kind==='mock'?'#pedido-simulacao':'#pedido-aulas');
      await expect(section.locator('iframe')).toHaveAttribute('data-tally-src',new RegExp(`^https://tally\\.so/embed/${id}\\?`));
      await expect(section.locator('iframe')).toHaveAttribute('title',lang==='pt-BR'?/Formulário/:/form hosted by Tally/);
      await expect(section.getByRole('link',{name:lang==='pt-BR'?'abra diretamente no Tally':'open it directly in Tally'})).toHaveAttribute('href',`https://tally.so/r/${id}`);
      await expect(section).toContainText('Tally');
    }
    expect(embeds.length).toBeGreaterThan(0);
    await expect(page.locator('#aulas form')).toHaveCount(0);
    expect(await page.evaluate(()=>localStorage.length+sessionStorage.length)).toBe(0);
  });
}
