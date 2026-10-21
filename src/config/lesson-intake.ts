const api=import.meta.env.PUBLIC_LESSON_API_URL || '';
const siteKey=import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '';
let active=false;
if(api && /^[a-zA-Z0-9_-]{10,100}$/.test(siteKey)) {
  try {
    const url=new URL(api);
    active=url.protocol==='https:' && url.hostname.endsWith('.workers.dev') && url.pathname==='/v1/lesson-requests' && !url.search && !url.hash && !url.username && !url.password && !url.port;
  } catch { /* Keep the site usable through LinkedIn until intake is configured. */ }
}
export const lessonIntake={active,api,siteKey};
