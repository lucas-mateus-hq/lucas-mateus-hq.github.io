import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../src/components/AnalyticsConsent.astro',import.meta.url),'utf8');
const script=source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
function browser(saved=null, broken=false){
  const nodes=new Map();const requests=[];const storage=new Map();let reloads=0;
  if(saved)storage.set('lucas-analytics-consent-v1',JSON.stringify(saved));
  const document={cookie:'',querySelector(selector){if(!nodes.has(selector))nodes.set(selector,{hidden:true,addEventListener(event,fn){this[event]=fn;},focus(){}});return nodes.get(selector);},createElement(){return {};},head:{appendChild(node){requests.push(node.src);}}};
  const context={document,Date,JSON,location:{origin:'https://example.com',pathname:'/renda-extra-com-ia/',search:'?email=private@example.com',hash:'#private',hostname:'example.com',reload(){reloads++;}},localStorage:{getItem(k){if(broken)throw Error('blocked');return storage.get(k);},setItem(k,v){if(broken)throw Error('blocked');storage.set(k,v);}},addEventListener(){}};
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
