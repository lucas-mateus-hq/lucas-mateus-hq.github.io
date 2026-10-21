/** Public endpoint configuration only. Neither a mailbox nor an API secret belongs here. */
export function resolveLessonIntake(env) {
  const mode=env.PUBLIC_LESSON_INTAKE_MODE || 'worker';
  const off={active:false,mode:'off',api:'',siteKey:''};
  if(mode==='email') {
    const id=env.PUBLIC_LESSON_EMAIL_FORM_ID || '';
    // Enable only after the owner verifies the recipient and a real email test.
    if(env.PUBLIC_LESSON_EMAIL_VERIFIED!=='true' || !/^[a-z]{8}$/.test(id))return off;
    return {active:true,mode:'email',api:`https://formspree.io/f/${id}`,siteKey:''};
  }
  if(mode!=='worker')return off;
  const api=env.PUBLIC_LESSON_API_URL || '';
  const siteKey=env.PUBLIC_TURNSTILE_SITE_KEY || '';
  if(!/^[a-zA-Z0-9_-]{10,100}$/.test(siteKey))return off;
  try {
    const url=new URL(api);
    if(url.protocol==='https:' && url.hostname.endsWith('.workers.dev') && url.pathname==='/v1/lesson-requests' && !url.search && !url.hash && !url.username && !url.password && !url.port)
      return {active:true,mode:'worker',api,siteKey};
  } catch { /* Invalid configuration must not publish a collecting form. */ }
  return off;
}
