type Turnstile = {
 render: (el:Element, options:Record<string,unknown>)=>string;
 reset: (id:string)=>void;
 getResponse: (id:string)=>string;
};
declare global { interface Window { turnstile?:Turnstile } }
let loader:Promise<Turnstile>|undefined;
export function loadChallenge() {
  if(window.turnstile) return Promise.resolve(window.turnstile);
  if(loader) return loader;
  loader=new Promise<Turnstile>((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async=true;
    const timeout=window.setTimeout(()=>{script.remove();reject(new Error('verification unavailable'));},15000);
    script.onload=()=>{window.clearTimeout(timeout);if(window.turnstile)resolve(window.turnstile);else reject(new Error('verification unavailable'));};
    script.onerror=()=>{window.clearTimeout(timeout);script.remove();reject(new Error('verification unavailable'));};
    document.head.append(script);
  }).catch(error=>{loader=undefined;throw error;});
  return loader;
}
export function initLessonForms() {
  document.querySelectorAll<HTMLFormElement>('[data-lesson-form]').forEach(form=>{
    const en=form.dataset.locale==='en-US';
    const status=form.querySelector<HTMLElement>('[data-form-status]')!;
    const fields=form.querySelector<HTMLFieldSetElement>('[data-form-fields]')!;
    const button=form.querySelector<HTMLButtonElement>('button[type=submit]')!;
    const inform=(text:string,focus=false)=>{status.textContent=text;if(focus)status.focus();};
    let widget:string|undefined;
    let challenge:Turnstile|undefined;
    let busy=false;
    let previous='';
    let requestId='';
    let setupPromise:Promise<void>|undefined;
    const setup=():Promise<void>=>{
      if(widget)return Promise.resolve();
      if(setupPromise)return setupPromise;
      setupPromise=(async()=>{
      try {
        challenge=await loadChallenge();
        widget=challenge.render(form.querySelector('[data-challenge]')!,{sitekey:form.dataset.siteKey,action:'lesson_intake',language:en?'en':'pt-br',theme:'dark'});
      } catch {inform(en?'Verification could not load. Please try again later or use LinkedIn.':'Não foi possível carregar a verificação. Tente mais tarde ou use o LinkedIn.');}
      })().finally(()=>{setupPromise=undefined;});
      return setupPromise;
    };
    // No external verification request is made until the visitor interacts with this form.
    fields.disabled=false;
    form.addEventListener('focusin',()=>{if(!challenge && !loader)void setup();},{once:true});
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(busy)return;
      if(!form.reportValidity())return;
      if(!challenge || !widget){inform(en?'Please wait for verification, then try again.':'Aguarde a verificação e tente novamente.',true);await setup();return;}
      const token=challenge.getResponse(widget);
      if(!token){inform(en?'Complete the verification before sending.':'Conclua a verificação antes de enviar.',true);return;}
      const data=new FormData(form);
      const payload={name:String(data.get('name')||'').trim(),email:String(data.get('email')||'').trim(),goal:data.get('goal'),speaking:data.get('speaking'),timeframe:data.get('timeframe'),context:String(data.get('context')||'').trim(),availability:String(data.get('availability')||'').trim(),locale:form.dataset.locale,privacyAcknowledged:data.get('privacyAcknowledged')==='on',website:String(data.get('website')||'')};
      const fingerprint=JSON.stringify(payload);
      if(previous!==fingerprint){requestId=crypto.randomUUID();previous=fingerprint;}
      busy=true;button.disabled=true;form.setAttribute('aria-busy','true');
      inform(en?'Sending your inquiry…':'Enviando sua solicitação…');
      try {
        const response=await fetch(form.dataset.api!,{method:'POST',credentials:'omit',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,requestId,turnstileToken:token}),signal:AbortSignal.timeout(20000)});
        const result=await response.json();
        if(!response.ok || result.accepted!==true || result.requestId!==requestId)throw new Error('unconfirmed');
        form.reset();previous='';requestId='';fields.disabled=true;
        inform((en?'Inquiry received. I’ll use the email you provided to follow up. Reference: ':'Solicitação recebida. Vou usar o e-mail informado para retornar. Protocolo: ')+result.requestId,true);
      } catch {
        inform(en?'We couldn’t confirm receipt. Your answers are still here. Try again or contact me on LinkedIn.':'Não foi possível confirmar o recebimento. Suas respostas continuam aqui. Tente novamente ou fale comigo pelo LinkedIn.',true);
        challenge.reset(widget);
      } finally {busy=false;button.disabled=false;form.removeAttribute('aria-busy');}
    });
  });
}
