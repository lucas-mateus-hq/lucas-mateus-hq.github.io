// Release-only gate. Does not process or persist visitor data.
// The separate owner-run end-to-end check in private D1 is mandatory as well.
const origin = 'https://lucas-mateus-hq.github.io';
const endpoint = process.env.PUBLIC_LESSON_API_URL || '';
const siteKey = process.env.PUBLIC_TURNSTILE_SITE_KEY || '';

function fail(message) {
  console.error('RELEASE BLOCKED: '+message);
  process.exit(1);
}
let url;
try { url = new URL(endpoint); } catch { fail('Cloudflare intake endpoint not configured.'); }
if (url.protocol !== 'https:' || !url.hostname.endsWith('.workers.dev')
    || url.pathname !== '/v1/lesson-requests' || url.search || url.hash
    || url.username || url.password || url.port) fail('Unexpected intake endpoint URL.');
if (!/^[a-zA-Z0-9_-]{10,100}$/.test(siteKey)
    || siteKey.startsWith('1x00000000000000000000AA')) fail('Production Turnstile key is missing or synthetic.');

const check = async (method,headers,body,expectedStatus,expectedError) => {
  let response;
  try {
    response = await fetch(url.toString(), {
      method, headers, body, redirect:'error', signal:AbortSignal.timeout(9000)
    });
  } catch {
    fail('Intake service is unreachable or timed out.');
  }
  if(response.status!==expectedStatus)fail('Intake returned HTTP '+response.status+' for '+method+'; expected '+expectedStatus+'.');
  if(response.headers.get('Access-Control-Allow-Origin')!==origin)
    fail('Intake CORS response did not match the public portfolio origin.');
  if(expectedError) {
    let data;
    try { data=await response.json(); } catch { fail('Intake returned invalid JSON.'); }
    if(data?.error!==expectedError)fail('Intake returned unexpected response to invalid payload.');
  }
};
await check('OPTIONS',{'Origin':origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'},undefined,204);
await check('POST',{'Origin':origin,'Content-Type':'application/json'},'{}',400,'INVALID_REQUEST');
console.log('Release endpoint checks passed: responsive configured Worker, origin CORS and enabled validation.');
console.log('This does NOT prove a successful stored lead: verify a real Turnstile submission and private D1 receipt before setting INTAKE_LIVE_VERIFIED=true.');
