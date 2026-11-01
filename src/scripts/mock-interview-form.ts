import {loadChallenge} from './lesson-form';
type Turnstile=Awaited<ReturnType<typeof loadChallenge>>;

export function initMockInterviewForm(){
 document.querySelectorAll<HTMLFormElement>('[data-mock-form]').forEach(form=>{
  if(form.dataset.initialized==='true')return;
  form.dataset.initialized='true';
  const en=form.dataset.locale==='en-US';
  const fields=form.querySelector<HTMLFieldSetElement>('[data-mock-fields]')!;
  const status=form.querySelector<HTMLElement>('[data-mock-status]')!;
  const submit=form.querySelector<HTMLButtonElement>('[type=submit]')!;
  let challenge:Turnstile|undefined;
  let widget:string|undefined;
  let setupPromise:Promise<void>|undefined;
  let fingerprint='',requestId='',busy=false,accepted=false;
  const inform=(message:string,focus=false)=>{
   status.textContent=message;
   if(focus)status.focus();
  };
  async function setup(){
   if(widget)return;
   if(setupPromise)return setupPromise;
   setupPromise=(async()=>{
    try{
     challenge=await loadChallenge();
     widget=challenge.render(form.querySelector('[data-mock-challenge]')!,{
      sitekey:form.dataset.siteKey,action:'lesson_intake',language:en?'en':'pt-br',theme:'dark'
     });
    }catch{
     inform(en?'Verification could not load. Your request has not been sent; please try again later.':'A verificação não carregou. Nada foi enviado; tente novamente mais tarde.',true);
    }
   })().finally(()=>{setupPromise=undefined;});
   return setupPromise;
  }
  const notesArea=form.querySelector<HTMLTextAreaElement>('#mock-notes');
  const notesHint=notesArea?.parentElement?.querySelector<HTMLElement>('.field-hint');
  if(notesArea && notesHint){
   const baseHint=notesHint.textContent||'';
   notesArea.addEventListener('input',()=>{
    notesHint.textContent=`${baseHint} (${notesArea.value.length}/320)`;
   });
  }
  fields.disabled=false;
  form.addEventListener('focusin',()=>{void setup();},{once:true});
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(busy||accepted)return;
   const inputs=form.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('input:not([type=hidden]),select,textarea');
   inputs.forEach(input=>{
    if(!input.checkValidity()){input.setAttribute('aria-invalid','true');}
    else{input.removeAttribute('aria-invalid');}
    input.addEventListener('input',()=>input.removeAttribute('aria-invalid'),{once:true});
   });
   if(!form.reportValidity())return;
   const data=new FormData(form);
   const name=String(data.get('name')||'').trim();
   const email=String(data.get('email')||'').trim();
   const role=String(data.get('role')||'').trim();
   const availability=String(data.get('availability')||'').trim();
   const notes=String(data.get('notes')||'').trim();
   const website=String(data.get('website')||'');
   if(website)return;
   const context=[
    'Service: 60-minute mock interview (BRL 80), personalized written report within 2h after session',
    'Target role: '+role,'Notes: '+(notes||'none')
   ].join(' | ');
   if(context.length>800){
    inform(en?'Please shorten the optional message.':'Reduza a mensagem opcional.',true);return;
   }
   // Keep the existing server contract without collecting unnecessary fields.
   const payload={name,email,goal:'interview',speaking:'not_provided',timeframe:'not_provided',context,availability,locale:form.dataset.locale,privacyAcknowledged:data.get('privacyAcknowledged')==='on',website};
   if(!challenge||!widget){
    inform(en?'Preparing verification; your request has not been sent.':'Preparando a verificação; nada foi enviado.');
    await setup();
    if(!widget)return;
   }
   const token=challenge!.getResponse(widget!);
   if(!token){inform(en?'Complete verification before sending.':'Conclua a verificação antes de enviar.',true);return;}
   const current=JSON.stringify(payload);
   if(current!==fingerprint){fingerprint=current;requestId=crypto.randomUUID();}
   busy=true;submit.disabled=true;form.setAttribute('aria-busy','true');
   inform(en?'Sending your request…':'Enviando solicitação…');
   try{
    const response=await fetch(form.dataset.api!,{
     method:'POST',credentials:'omit',redirect:'error',
     headers:{'Content-Type':'application/json'},
     body:JSON.stringify({...payload,requestId,turnstileToken:token}),
     signal:AbortSignal.timeout(20000)
    });
    const result=await response.json();
    if(!response.ok||result?.accepted!==true||result?.requestId!==requestId)throw new Error('unconfirmed');
    accepted=true;form.reset();fields.disabled=true;fingerprint='';requestId='';
    inform((en?'Request received. I’ll reply by email if a time is available. Reference: ':'Solicitação recebida. Responderei por e-mail conforme disponibilidade. Protocolo: ')+result.requestId,true);
   }catch{
    challenge?.reset(widget!);
    inform(en?'Could not confirm receipt. Your answers remain here; please retry. Do not assume your request was sent.':'Não foi possível confirmar o recebimento. Seus dados continuam no formulário; tente novamente. Não considere a solicitação enviada.',true);
   }finally{
    busy=false;if(!accepted)submit.disabled=false;
    form.removeAttribute('aria-busy');
   }
  });
 });
}
