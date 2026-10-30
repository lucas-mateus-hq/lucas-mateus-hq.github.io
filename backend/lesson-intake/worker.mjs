// Public intake only. D1 and the WhatsApp destination are server-side bindings.
// No public read/list API, request logging, raw provider errors or outbound webhooks.
const ORIGIN = 'https://lucas-mateus-hq.github.io';
const HOST = 'lucas-mateus-hq.github.io';
const PATH = '/v1/lesson-requests';
const MAX_BYTES = 8192;
const DAY = 86400000;
const ENUMS = {
  goal: ['interview', 'business', 'both', 'not_sure'],
  speaking: ['starting', 'simple', 'needs_support', 'comfortable', 'not_sure', 'not_provided'],
  timeframe: ['week', 'month', 'later', 'exploring', 'not_provided'],
  locale: ['pt-BR', 'en-US'],
};
const ALLOWED = new Set(['requestId', 'name', 'email', 'goal', 'speaking', 'timeframe', 'context', 'availability', 'locale', 'privacyAcknowledged', 'website', 'turnstileToken']);
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function validatePayload(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k => !ALLOWED.has(k))) return null;
  const value = {};
  if (typeof input.requestId !== 'string' || !ID.test(input.requestId) || input.privacyAcknowledged !== true || input.website !== '') return null;
  value.requestId = input.requestId;
  for (const [key, min, max] of [['name', 1, 80], ['email', 3, 254], ['context', 10, 800], ['availability', 0, 160]]) {
    if (typeof input[key] !== 'string') return null;
    const text = input[key].trim();
    if (text.length < min || text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) return null;
    if ((key === 'name' || key === 'email') && /[\r\n]/u.test(text)) return null;
    value[key] = text;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value.email)) return null;
  for (const [key, options] of Object.entries(ENUMS)) {
    if (!options.includes(input[key])) return null;
    value[key] = input[key];
  }
  if (typeof input.turnstileToken !== 'string' || !input.turnstileToken || input.turnstileToken.length > 2048) return null;
  value.privacyAcknowledged = true;
  return value;
}
async function digest(value) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)))), x => x.toString(16).padStart(2, '0')).join('');
}
function reply(status, body, cors = true) {
  return new Response(JSON.stringify(body), {status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    ...(cors ? {'Access-Control-Allow-Origin': ORIGIN, 'Vary': 'Origin'} : {}),
  }});
}
async function readLimited(request) {
  const length = request.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BYTES)) throw new Error('size');
  if (!request.body) throw new Error('empty');
  const reader = request.body.getReader();
  let bytes = 0;
  const chunks = [];
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BYTES) { await reader.cancel(); throw new Error('size'); }
    chunks.push(value);
  }
  const all = new Uint8Array(bytes);
  let offset = 0;
  for (const part of chunks) { all.set(part, offset); offset += part.byteLength; }
  return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(all));
}
function notificationConfigured(env) {
  // The owner's current budget is R$0. Missing/zero/unknown policies fail closed,
  // even if legacy billing approval or credentials are accidentally left enabled.
  // The template adapter has no verified zero-cost send mode.
  return env.WHATSAPP_COST_POLICY === 'billable_approved' &&
    env.WHATSAPP_ENABLED === 'true' && env.WHATSAPP_BILLING_APPROVED === 'true' &&
    typeof env.META_ACCESS_TOKEN === 'string' && env.META_ACCESS_TOKEN.length > 10 &&
    /^\d{5,30}$/.test(env.META_PHONE_NUMBER_ID || '') && /^\d{10,15}$/.test(env.WHATSAPP_TO || '') &&
    /^v\d+\.\d+$/.test(env.META_GRAPH_VERSION || '') && /^[a-z0-9_]{1,100}$/.test(env.META_TEMPLATE_NAME || '') &&
    /^[a-z]{2}(?:_[A-Z]{2})?$/.test(env.META_TEMPLATE_LANGUAGE || '');
}
async function notify(env, id, now, fetcher) {
  if (!notificationConfigured(env)) return;
  // Atomic claim, maximum 20 attempts in a rolling day; never auto-retry ambiguous sends.
  const claim = await env.LEADS_DB.prepare(`UPDATE lesson_requests SET notification_state='sending', notification_attempted_at=?
    WHERE id=? AND notification_state='pending' AND expires_at>?
    AND (SELECT COUNT(*) FROM lesson_requests WHERE notification_attempted_at>=?)<20`).bind(now, id, now, now - DAY).run();
  if (!claim.meta?.changes) return;
  let state = 'unknown';
  let messageId = null;
  try {
    const response = await fetcher(`https://graph.facebook.com/${env.META_GRAPH_VERSION}/${env.META_PHONE_NUMBER_ID}/messages`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(7000), headers: {
        'Authorization': `Bearer ${env.META_ACCESS_TOKEN}`, 'Content-Type': 'application/json',
      },
      body: JSON.stringify({messaging_product: 'whatsapp', to: env.WHATSAPP_TO, type: 'template', template: {
        name: env.META_TEMPLATE_NAME, language: {code: env.META_TEMPLATE_LANGUAGE},
        components: [{type: 'body', parameters: [{type: 'text', text: id}]}],
      }}),
    });
    if (response.ok) {
      const result = await response.json();
      const candidate = result?.messages?.[0]?.id;
      if (typeof candidate === 'string' && /^[A-Za-z0-9_.=-]{1,256}$/.test(candidate)) { state = 'accepted_by_provider'; messageId = candidate; }
    } else state = 'rejected_by_provider';
  } catch { /* Keep outcome unknown: timeout is not proof of non-delivery. */ }
  await env.LEADS_DB.prepare(`UPDATE lesson_requests SET notification_state=?, notification_id=? WHERE id=?`).bind(state, messageId, id).run();
}
export async function handleRequest(request, env, deps = {}) {
  const fetcher = deps.fetch || fetch;
  const now = deps.now ?? Date.now();
  if (new URL(request.url).pathname !== PATH) return reply(404, {error: 'NOT_FOUND'}, false);
  if (request.headers.get('Origin') !== ORIGIN) return reply(403, {error: 'ORIGIN_REJECTED'}, false);
  if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers: {
    'Access-Control-Allow-Origin': ORIGIN, 'Vary': 'Origin', 'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600',
  }});
  if (request.method !== 'POST') return reply(405, {error: 'METHOD_NOT_ALLOWED'});
  if (env.INTAKE_ENABLED !== 'true' || !env.LEADS_DB || !env.TURNSTILE_SECRET_KEY) return reply(503, {error: 'INTAKE_UNAVAILABLE'});
  if (!/^application\/json(?:\s*;.*)?$/i.test(request.headers.get('Content-Type') || '')) return reply(415, {error: 'JSON_REQUIRED'});
  let input;
  try { input = await readLimited(request); } catch { return reply(400, {error: 'INVALID_REQUEST'}); }
  const value = validatePayload(input);
  if (!value) return reply(400, {error: 'INVALID_REQUEST'});
  try {
    const hash = await digest(value);
    const existing = await env.LEADS_DB.prepare('SELECT payload_hash, expires_at FROM lesson_requests WHERE id=?').bind(value.requestId).first();
    if (existing) {
      if (existing.payload_hash !== hash || existing.expires_at <= now) return reply(409, {error: 'REQUEST_CONFLICT'});
      return reply(200, {accepted: true, requestId: value.requestId});
    }
    let challenge;
    let verificationStage = 'request';
    try {
      const check = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        // Do not follow redirects carrying the verification secret.
        method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(7000),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({secret: env.TURNSTILE_SECRET_KEY, response: input.turnstileToken}).toString(),
      });
      if (!check.ok) return reply(503, {error: 'VERIFICATION_UNAVAILABLE', reason: 'UPSTREAM_HTTP', upstreamStatus: check.status});
      verificationStage = 'response';
      challenge = await check.json();
    } catch (error) {
      // Fixed categories only: never expose exception messages, secrets or tokens.
      const reason = verificationStage === 'response' ? 'UPSTREAM_RESPONSE' :
        error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_REQUEST';
      return reply(503, {error: 'VERIFICATION_UNAVAILABLE', reason});
    }
    if (challenge?.success !== true || challenge.hostname !== HOST || challenge.action !== 'lesson_intake') return reply(403, {error: 'VERIFICATION_FAILED'});
    // SQL parameters only; at most 100 accepted requests in a rolling 24h.
    const inserted = await env.LEADS_DB.prepare(`INSERT INTO lesson_requests
      (id,payload_hash,created_at,expires_at,payload) SELECT ?,?,?,?,?
      WHERE (SELECT COUNT(*) FROM lesson_requests WHERE created_at>=?)<100
      ON CONFLICT(id) DO NOTHING`).bind(value.requestId, hash, now, now + 30 * DAY, JSON.stringify(value), now - DAY).run();
    if (!inserted.meta?.changes) {
      const concurrent = await env.LEADS_DB.prepare('SELECT payload_hash FROM lesson_requests WHERE id=?').bind(value.requestId).first();
      if (concurrent?.payload_hash === hash) return reply(200, {accepted: true, requestId: value.requestId});
      return reply(concurrent ? 409 : 429, {error: concurrent ? 'REQUEST_CONFLICT' : 'CAPACITY_REACHED'});
    }
    // Persistence has succeeded. Notification failure must not change the acknowledgement.
    try { await notify(env, value.requestId, now, fetcher); } catch { /* Recover by ID in private D1, never leak an exception. */ }
    return reply(201, {accepted: true, requestId: value.requestId});
  } catch { return reply(503, {error: 'INTAKE_UNAVAILABLE'}); }
}
export default {
  fetch: handleRequest,
  async scheduled(_event, env) {
    // Provider backups have independent retention; this removes live intake records.
    if (env.LEADS_DB) await env.LEADS_DB.prepare('DELETE FROM lesson_requests WHERE expires_at<=?').bind(Date.now()).run();
  },
};
