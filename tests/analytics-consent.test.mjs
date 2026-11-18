import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../src/components/AnalyticsConsent.astro',import.meta.url),'utf8');
const script=source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
function browser(saved=null, broken=false, search='?email=private@example.com'){
  const nodes=new Map();const requests=[];const storage=new Map();let reloads=0;
  if(saved)storage.set('lucas-analytics-consent-v1',JSON.stringify(saved));
  const document={cookie:'',querySelector(selector){if(!nodes.has(selector))nodes.set(selector,{hidden:true,addEventListener(event,fn){this[event]=fn;},focus(){}});return nodes.get(selector);},createElement(){return {};},head:{appendChild(node){requests.push(node.src);}}};
  const context={document,Date,JSON,URLSearchParams,location:{origin:'https://example.com',pathname:'/renda-extra-com-ia/',search,hash:'#private',hostname:'example.com',reload(){reloads++;}},localStorage:{getItem(k){if(broken)throw Error('blocked');return storage.get(k);},setItem(k,v){if(broken)throw Error('blocked');storage.set(k,v);}},addEventListener(){}};
  context.window=context;vm.runInNewContext(script,context);
  return {context,nodes,requests,storage,get reloads(){return reloads;},click(s){nodes.get(s).click();}};
}
test('no Analytics request before choice or after decline',()=>{
  const b=browser();assert.equal(b.nodes.get('[data-analytics-choice]').hidden,false);assert.equal(b.requests.length,0);b.click('[data-analytics-reject]');assert.equal(b.requests.length,0);assert.equal(b.context['ga-disable-G-75PZFNFP2X'],true);
});
test('acceptance loads one destination and strips query and fragment',()=>{
  const b=browser();b.click('[data-analytics-accept]');b.click('[data-analytics-accept]');assert.equal(b.requests.length,1);assert.match(b.requests[0],/G-75PZFNFP2X$/);
  const config=b.context.dataLayer.find(args=>args[0]==='config');assert.equal(config[2].page_location,'https://example.com/renda-extra-com-ia/');assert.equal(config[2].page_referrer,'');assert.equal(config[2].allow_google_signals,false);
  b.click('[data-analytics-reject]');assert.equal(b.context['ga-disable-G-75PZFNFP2X'],true);assert.equal(b.reloads,1);
});
test('saved rejection, expired acceptance and unavailable storage do not load Analytics',()=>{
  assert.equal(browser({choice:'rejected',at:Date.now()}).requests.length,0);
  assert.equal(browser({choice:'accepted',at:0}).requests.length,0);
  assert.equal(browser(null,true).requests.length,0);
  assert.equal(browser({choice:'accepted',at:Date.now()}).requests.length,1);
});

test('future or malformed consent timestamps do not authorize tracking',()=>{
 assert.equal(browser({choice:'accepted',at:Date.now()+100000}).requests.length,0);
 assert.equal(browser({choice:'accepted',at:'now'}).requests.length,0);
});

test('only allowlisted campaign tags reach Analytics, sanitized; everything else is removed',()=>{
  const b=browser(null,false,'?utm_source=TikTok&utm_medium=social&utm_campaign=reia_s1_nov26&utm_content=bio%20%3Cb%3E&email=private%40example.com&fbclid=abc&utm_term=x');
  b.click('[data-analytics-accept]');
  const config=b.context.dataLayer.find(args=>args[0]==='config');
  const view=b.context.dataLayer.find(args=>args[0]==='event'&&args[1]==='page_view');
  for(const location of [config[2].page_location,view[2].page_location]){
    const url=new URL(location);
    assert.equal(url.origin+url.pathname,'https://example.com/renda-extra-com-ia/');
    assert.deepEqual([...url.searchParams.keys()].sort(),['utm_campaign','utm_content','utm_medium','utm_source']);
    assert.equal(url.searchParams.get('utm_source'),'tiktok');
    assert.equal(url.searchParams.get('utm_content'),'biob');
    assert.doesNotMatch(location,/email|fbclid|utm_term|private/);
  }
});

test('sales page adds sck only from source and content, sanitized and capped',()=>{
  const page=readFileSync(new URL('../src/components/pages/ReiaSalesPage.astro',import.meta.url),'utf8');
  const code=page.match(/<script is:inline>([\s\S]*?)<\/script>/)[1].split("document.addEventListener('click'")[0];
  const run=search=>{
    const link={href:'https://pay.hotmart.com/I108167656O'};
    const context={URL,URLSearchParams,location:{search},document:{querySelectorAll:()=>[link],addEventListener(){}}};
    context.window=context;vm.runInNewContext(code,context);return link.href;
  };
  assert.equal(new URL(run('?utm_source=tiktok&utm_content=bio&utm_medium=social')).searchParams.get('sck'),'tiktok_bio');
  assert.equal(new URL(run('?utm_source=linkedin')).searchParams.get('sck'),'linkedin');
  assert.equal(run('?email=private@example.com&fbclid=1'),'https://pay.hotmart.com/I108167656O');
  assert.equal(run(''),'https://pay.hotmart.com/I108167656O');
  assert.equal(new URL(run('?utm_source='+'a'.repeat(100))).searchParams.get('sck').length,40);
  const injected=new URL(run('?utm_source=x%26sck%3Devil%3Cscript%3E'));
  assert.deepEqual(injected.searchParams.getAll('sck').length,1);
  assert.match(injected.searchParams.get('sck'),/^[a-z0-9_-]+$/);
});
