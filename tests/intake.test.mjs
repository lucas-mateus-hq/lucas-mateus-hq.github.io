import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker, {handleRequest,validatePayload} from '../backend/lesson-intake/worker.mjs';

const origin='https://lucas-mateus-hq.github.io';
const url='https://intake.example.workers.dev/v1/lesson-requests';
const now=1792555200000;
const sample=(changes={})=>({requestId:crypto.randomUUID(),name:'Synthetic Visitor',email:'visitor@example.invalid',goal:'interview',speaking:'needs_support',timeframe:'month',context:'Practice explaining a project in an interview.',availability:'Weekday evenings, UTC-3',locale:'pt-BR',privacyAcknowledged:true,website:'',turnstileToken:'synthetic-token',...changes});
function database(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync('backend/lesson-intake/migrations/0001_intake.sql','utf8'));
 return {db,prepare(sql){return {bind(...args){return {async first(){return db.prepare(sql).get(...args)||null;},async run(){return {meta:{changes:Number(db.prepare(sql).run(...args).changes)}};}}}};}};
}
function fixture(overrides={}){
 const store=database();let calls=[];
 const env={INTAKE_ENABLED:'true',TURNSTILE_SECRET_KEY:'synthetic-secret',LEADS_DB:store,WHATSAPP_ENABLED:'false',...overrides};
 const fetcher=async(target,options)=>{calls.push({target,options});return new Response(JSON.stringify(target.includes('siteverify')?{success:true,hostname:'lucas-mateus-hq.github.io',action:'lesson_intake'}:{messages:[{id:'wamid.synthetic'}]}),{status:200});};
 return {store,env,calls,fetcher};
}
function request(payload,options={}){return new Request(url,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(payload),...options});}
// Synthetic future billable configuration exercises the existing adapter; this
// is not the owner's authorized deployment policy and never contacts Meta.
const configured={WHATSAPP_COST_POLICY:'billable_approved',WHATSAPP_ENABLED:'true',WHATSAPP_BILLING_APPROVED:'true',META_ACCESS_TOKEN:'synthetic-private-token',META_PHONE_NUMBER_ID:'12345678901234',WHATSAPP_TO:'15555550123',META_GRAPH_VERSION:'v99.0',META_TEMPLATE_NAME:'synthetic_lead_alert',META_TEMPLATE_LANGUAGE:'pt_BR'};

test('new request uses real handler and SQL; receipt follows persistence',async()=>{
 const f=fixture(),p=sample();const r=await handleRequest(request(p),f.env,{fetch:f.fetcher,now});assert.equal(r.status,201);assert.deepEqual(await r.json(),{accepted:true,requestId:p.requestId});
 const row=f.store.db.prepare('SELECT * FROM lesson_requests').get();assert.equal(JSON.parse(row.payload).email,p.email);assert.equal(row.notification_state,'pending');assert.equal(row.expires_at-now,30*86400000);assert.equal(f.calls.length,1);
});
test('replay has one stored row and no duplicate provider call, including used verification token',async()=>{
 const f=fixture(configured),p=sample();await handleRequest(request(p),f.env,{fetch:f.fetcher,now});const r=await handleRequest(request(p),f.env,{fetch:f.fetcher,now});assert.equal(r.status,200);assert.equal(f.calls.length,2);assert.equal(f.store.db.prepare('SELECT COUNT(*) AS count FROM lesson_requests').get().count,1);
});
test('same request identifier with different content is rejected',async()=>{
 const f=fixture(),p=sample();await handleRequest(request(p),f.env,{fetch:f.fetcher,now});assert.equal((await handleRequest(request({...p,context:'An entirely different situation.'}),f.env,{fetch:f.fetcher,now})).status,409);
});
for(const [name,patch] of [
 ['unknown property',{token:'synthetic-secret'}],['short context',{context:'x'}],['excess context',{context:'x'.repeat(801)}],['missing contact',{email:''}],['invalid contact',{email:'not-email'}],['header injection',{name:'Name\r\nBcc:other'}],['invalid goal',{goal:'other'}],['invalid speaking',{speaking:'C3'}],['invalid time frame',{timeframe:'tomorrow'}],['invalid locale',{locale:'xx'}],['missing acknowledgement',{privacyAcknowledged:false}],['trap',{website:'spam.invalid'}],['invalid UUID',{requestId:'123'}],['oversized token',{turnstileToken:'x'.repeat(2049)}],['control characters',{context:'Some text\u0000injected'}],
]) test(`invalid contract rejected: ${name}`,async()=>{const f=fixture();const p=sample(patch);assert.equal(validatePayload(p),null);assert.equal((await handleRequest(request(p),f.env,{fetch:f.fetcher,now})).status,400);assert.equal(f.calls.length,0);assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM lesson_requests').get().n,0);});
for(const patch of [{success:false},{hostname:'attacker.invalid'},{action:'other'}])test(`verification contract rejects ${JSON.stringify(patch)}`,async()=>{
 const f=fixture();const r=await handleRequest(request(sample()),f.env,{now,fetch:async()=>new Response(JSON.stringify({success:true,hostname:'lucas-mateus-hq.github.io',action:'lesson_intake',...patch}))});assert.equal(r.status,403);assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM lesson_requests').get().n,0);
});
test('foreign and absent origins, GET and unsupported content type are rejected',async()=>{
 const f=fixture();for(const headers of [{Origin:'https://attacker.invalid'},{'Content-Type':'application/json'}])assert.equal((await handleRequest(request(sample(),{headers}),f.env)).status,403);
 assert.equal((await handleRequest(new Request(url,{headers:{Origin:origin}}),f.env)).status,405);
 assert.equal((await handleRequest(request(sample(),{headers:{Origin:origin,'Content-Type':'text/plain'}}),f.env)).status,415);
 assert.equal((await handleRequest(new Request(url+'/private',{headers:{Origin:origin}}),f.env)).status,404);
});
test('preflight is restricted to the portfolio origin and POST',async()=>{
 const r=await handleRequest(new Request(url,{method:'OPTIONS',headers:{Origin:origin}}),{});assert.equal(r.status,204);assert.equal(r.headers.get('Access-Control-Allow-Origin'),origin);assert.equal(r.headers.get('Access-Control-Allow-Methods'),'POST');
});
test('intake is closed without enabled flag, database or verification secret',async()=>{
 for(const patch of [{INTAKE_ENABLED:'false'},{LEADS_DB:null},{TURNSTILE_SECRET_KEY:''}]){const f=fixture(patch);assert.equal((await handleRequest(request(sample()),f.env)).status,503);}
});
test('malformed JSON and chunked oversized input are controlled',async()=>{
 const f=fixture();for(const body of ['{','x'.repeat(8193)])assert.equal((await handleRequest(new Request(url,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body}),f.env)).status,400);
});
test('verification network failures never acknowledge or store a lead',async()=>{
 const f=fixture();for(const fetcher of [async()=>{throw new Error('secret-value');},async()=>new Response('no',{status:500}),async()=>new Response('{')]){const r=await handleRequest(request(sample()),f.env,{fetch:fetcher,now});assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/secret-value/);}assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM lesson_requests').get().n,0);
});
test('database failure is controlled without leaking data or credentials',async()=>{
 const f=fixture({LEADS_DB:{prepare(){throw new Error('credentials private');}}});const r=await handleRequest(request(sample()),f.env,{now});assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/credentials|private/);
});
test('private WhatsApp alert contains only a reference and records provider acceptance, not delivery',async()=>{
 const f=fixture(configured),p=sample();const r=await handleRequest(request(p),f.env,{fetch:f.fetcher,now});assert.equal(r.status,201);const outbound=JSON.parse(f.calls[1].options.body);assert.equal(outbound.to,configured.WHATSAPP_TO);assert.equal(outbound.template.components[0].parameters[0].text,p.requestId);assert.doesNotMatch(JSON.stringify(outbound),/visitor@example|Synthetic Visitor|Practice explaining/);assert.equal(f.store.db.prepare('SELECT notification_state FROM lesson_requests').get().notification_state,'accepted_by_provider');assert.doesNotMatch(await r.text(),/15555550123|synthetic-private-token|wamid/);
});
test('WhatsApp is never called without explicit billing approval',async()=>{
 const f=fixture({...configured,WHATSAPP_BILLING_APPROVED:'false'});await handleRequest(request(sample()),f.env,{fetch:f.fetcher,now});assert.equal(f.calls.length,1);
});
for (const policy of ['zero', undefined, '', '0', 'free', 'billable_approved ']) {
 test(`cost policy ${JSON.stringify(policy)} blocks billable sends despite legacy approval`,async()=>{
  const f=fixture({...configured,WHATSAPP_COST_POLICY:policy}),p=sample();
  const result=await handleRequest(request(p),f.env,{fetch:f.fetcher,now});
  assert.equal(result.status,201);assert.deepEqual(await result.json(),{accepted:true,requestId:p.requestId});
  const row=f.store.db.prepare('SELECT * FROM lesson_requests').get();
  assert.equal(row.notification_state,'pending');assert.equal(row.notification_attempted_at,null);
  assert.equal((await handleRequest(request(p),f.env,{fetch:f.fetcher,now})).status,200);
  assert.equal(f.calls.length,1);assert.match(f.calls[0].target,/^https:\/\/challenges\.cloudflare\.com\//);
  assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM lesson_requests').get().n,1);
 });
}
test('tracked deployment example preserves the R$0 decision with intake and sends disabled',()=>{
 const example=readFileSync('backend/lesson-intake/wrangler.example.toml','utf8');
 assert.match(example,/^WHATSAPP_COST_POLICY = "zero"$/m);
 assert.match(example,/^WHATSAPP_BILLING_APPROVED = "false"$/m);
 assert.match(example,/^WHATSAPP_ENABLED = "false"$/m);
 assert.match(example,/^INTAKE_ENABLED = "false"$/m);
});
for(const [label,send,state] of [
 ['timeout',async()=>{throw new Error('upstream private');},'unknown'],
 ['rejection',async()=>new Response('private upstream content',{status:400}),'rejected_by_provider'],
 ['bad response',async()=>new Response('{}'),'unknown'],
])test(`notification ${label} preserves lead and never retries on replay`,async()=>{
 const f=fixture(configured),p=sample();let sends=0;const fetcher=async(target,options)=>target.includes('siteverify')?f.fetcher(target,options):(sends++,send());
 const r=await handleRequest(request(p),f.env,{fetch:fetcher,now});assert.equal(r.status,201);assert.equal(f.store.db.prepare('SELECT notification_state FROM lesson_requests').get().notification_state,state);assert.equal((await handleRequest(request(p),f.env,{fetch:fetcher,now})).status,200);assert.equal(sends,1);
});
test('rolling intake and notification caps are enforced by real SQL',async()=>{
 const f=fixture(configured);for(let i=0;i<101;i++){const r=await handleRequest(request(sample()),f.env,{fetch:f.fetcher,now});assert.equal(r.status,i<100?201:429);}assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM lesson_requests').get().n,100);assert.equal(f.calls.filter(c=>c.target.includes('graph.facebook.com')).length,20);
});
test('retention removes expired records but preserves unexpired requests',async()=>{
 const f=fixture(),p=sample();await handleRequest(request(p),f.env,{fetch:f.fetcher,now:Date.now()});f.store.db.prepare('UPDATE lesson_requests SET expires_at=0 WHERE id=?').run(p.requestId);await handleRequest(request(sample()),f.env,{fetch:f.fetcher,now:Date.now()});await worker.scheduled(null,f.env);assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM lesson_requests').get().n,1);
});
test('interruption after storage can resume by ID without running another effect',async()=>{
 const f=fixture(),p=sample();await handleRequest(request(p),f.env,{fetch:f.fetcher,now});const r=await handleRequest(request({...p,turnstileToken:'fresh-token'}),f.env,{fetch:async()=>{throw new Error('must not call provider');},now});assert.equal(r.status,200);assert.equal((await r.json()).requestId,p.requestId);
});

test('verification transport uses explicit form encoding and refuses redirects',async()=>{
 const f=fixture(),p=sample();
 const r=await handleRequest(request(p),f.env,{now,fetch:async(target,options)=>{
  assert.equal(target,'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.equal(options.redirect,'manual');
  assert.equal(options.headers['Content-Type'],'application/x-www-form-urlencoded');
  assert.equal(typeof options.body,'string');
  const body=new URLSearchParams(options.body);
  assert.equal(body.get('secret'),f.env.TURNSTILE_SECRET_KEY);
  assert.equal(body.get('response'),p.turnstileToken);
  return new Response(null,{status:302,headers:{Location:'https://attacker.invalid'}});
 }});
 assert.equal(r.status,503);
 assert.deepEqual(await r.json(),{error:'VERIFICATION_UNAVAILABLE',reason:'UPSTREAM_HTTP',upstreamStatus:302});
 assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM lesson_requests').get().n,0);
});
for(const [label,fetcher,reason,status] of [
 ['request',async()=>{throw new TypeError('synthetic-secret synthetic-token visitor@example.invalid');},'UPSTREAM_REQUEST',undefined],
 ['timeout',async()=>{throw new DOMException('private details','TimeoutError');},'UPSTREAM_TIMEOUT',undefined],
 ['abort',async()=>{throw new DOMException('private details','AbortError');},'UPSTREAM_TIMEOUT',undefined],
 ['http',async()=>new Response('private details',{status:502}),'UPSTREAM_HTTP',502],
 ['json',async()=>new Response('private details'),'UPSTREAM_RESPONSE',undefined],
])test('verification diagnostics are safe and fail closed: '+label,async()=>{
 const f=fixture();
 const r=await handleRequest(request(sample()),f.env,{fetch:fetcher,now});
 assert.equal(r.status,503);assert.equal(r.headers.get('Cache-Control'),'no-store');
 const body=await r.json();
 assert.deepEqual(body,{error:'VERIFICATION_UNAVAILABLE',reason,...(status?{upstreamStatus:status}:{})});
 assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM lesson_requests').get().n,0);
});
