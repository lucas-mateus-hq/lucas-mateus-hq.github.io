import {loadChallenge} from './lesson-form';
type Turnstile = Awaited<ReturnType<typeof loadChallenge>>;

export function initMockInterviewForm() {
  document.querySelectorAll<HTMLFormElement>('[data-mock-form]').forEach(form => {
    if (form.dataset.initialized === 'true') return;
    form.dataset.initialized = 'true';
    const en = form.dataset.locale === 'en-US';
    const active = form.dataset.active === 'true';
    const fields = form.querySelector<HTMLFieldSetElement>('[data-mock-fields]')!;
    const status = form.querySelector<HTMLElement>('[data-mock-status]')!;
    const submit = form.querySelector<HTMLButtonElement>('[type=submit]')!;
    const handoff = form.querySelector<HTMLElement>('[data-mock-handoff]')!;
    const messageField = form.querySelector<HTMLTextAreaElement>('[data-mock-message]')!;
    const copy = form.querySelector<HTMLButtonElement>('[data-mock-copy]')!;
    let challenge:Turnstile|undefined;
    let widget:string|undefined;
    let setupPromise:Promise<void>|undefined;
    let fingerprint = '';
    let requestId = '';
    let busy = false;
    const inform = (message:string, focus = false) => {
      status.textContent = message;
      if (focus) status.focus();
    };
    const setup = () => {
      if (!active || widget) return Promise.resolve();
      if (setupPromise) return setupPromise;
      setupPromise = (async () => {
        try {
          challenge = await loadChallenge();
          widget = challenge.render(form.querySelector('[data-mock-challenge]')!, {
            sitekey:form.dataset.siteKey,action:'lesson_intake',language:en?'en':'pt-br',theme:'dark'
          });
        } catch {
          inform(en?'Verification is unavailable. You can prepare a message and send it via LinkedIn.':'A verificação está indisponível. Você pode preparar a mensagem e enviá-la pelo LinkedIn.');
        }
      })().finally(() => {setupPromise = undefined;});
      return setupPromise;
    };
    fields.disabled = false;
    if (active) form.addEventListener('focusin', () => {void setup();}, {once:true});

    function values() {
      const data = new FormData(form);
      const name = String(data.get('name')||'').trim();
      const email = String(data.get('email')||'').trim();
      const role = String(data.get('role')||'').trim();
      const focus = String(data.get('focus')||'');
      const focusLabel = (form.querySelector<HTMLSelectElement>('[name=focus]')!.selectedOptions[0]?.textContent||'').trim();
      const speaking = String(data.get('speaking')||'');
      const speakingLabel = (form.querySelector<HTMLSelectElement>('[name=speaking]')!.selectedOptions[0]?.textContent||'').trim();
      const timeframe = String(data.get('timeframe')||'');
      const timeframeLabel = (form.querySelector<HTMLSelectElement>('[name=timeframe]')!.selectedOptions[0]?.textContent||'').trim();
      const interviewDate = String(data.get('interviewDate')||'').trim();
      const availability = String(data.get('availability')||'').trim();
      const notes = String(data.get('notes')||'').trim();
      const website = String(data.get('website')||'');
      const privacyAcknowledged = data.get('privacyAcknowledged') === 'on';
      // Existing private Worker contract: no additional personal-data fields or endpoint.
      const context = [
        'Service: 60-minute mock interview (BRL 80), personalized written report within 2h after session',
        'Target role: '+role,
        'Focus: '+focusLabel+' ('+focus+')',
        'Interview date: '+(interviewDate||'not provided'),
        'Notes: '+(notes||'none')
      ].join(' | ');
      const payload = {name,email,goal:'interview',speaking,timeframe,context,availability,locale:form.dataset.locale,privacyAcknowledged,website};
      const message = [
        en?'Hi Lucas, I would like to request your 60-minute mock interview (R$80, written report within 2 hours after the session).':'Olá, Lucas! Gostaria de solicitar sua simulação de entrevista de 60 minutos (R$ 80, relatório escrito em até 2 horas após a sessão).',
        '',
        (en?'Name: ':'Nome: ')+name,
        (en?'Email: ':'E-mail: ')+email,
        (en?'Target role: ':'Cargo/área: ')+role,
        (en?'English speaking: ':'Inglês falado: ')+speakingLabel,
        (en?'Interview timing: ':'Prazo: ')+timeframeLabel,
        (en?'Interview date: ':'Data da entrevista: ')+(interviewDate||'—'),
        (en?'Focus: ':'Foco: ')+focusLabel,
        (en?'Availability / time zone: ':'Disponibilidade / fuso: ')+(availability||'—'),
        (en?'Notes: ':'Observações: ')+(notes||'—'),
        '',
        en?'Could you confirm your availability and the next steps?':'Você poderia confirmar sua disponibilidade e os próximos passos?'
      ].join('\n');
      return {payload,message};
    }
    const showHandoff = (message:string) => {
      messageField.value = message;
      handoff.hidden = false;
      inform(en?'Nothing has been sent. Copy your prepared message and send it through LinkedIn.':'Nada foi enviado. Copie sua mensagem e encaminhe pelo LinkedIn.',true);
    };
    copy.addEventListener('click',async () => {
      try {
        await navigator.clipboard.writeText(messageField.value);
        inform(en?'Message copied. Open LinkedIn and paste it into your message.':'Mensagem copiada. Abra o LinkedIn e cole no seu contato.',true);
      } catch {
        messageField.focus();messageField.select();
        inform(en?'Select and copy the message manually, then open LinkedIn.':'Selecione e copie a mensagem manualmente; depois abra o LinkedIn.',true);
      }
    });
    form.addEventListener('submit',async event => {
      event.preventDefault();
      if (busy || !form.reportValidity()) return;
      const {payload,message} = values();
      if (payload.website) return;
      if (!active) {showHandoff(message);return;}
      if (payload.context.length > 800) {
        inform(en?'Please shorten the optional notes.':'Reduza as observações opcionais.',true);
        return;
      }
      if (!challenge || !widget) {
        inform(en?'Verification is loading. Try again, or use LinkedIn.':'A verificação está carregando. Tente novamente ou use o LinkedIn.',true);
        await setup();
        if (!widget) showHandoff(message);
        return;
      }
      const token = challenge.getResponse(widget);
      if (!token) {inform(en?'Complete the verification before sending.':'Conclua a verificação antes do envio.',true);return;}
      const current = JSON.stringify(payload);
      if (current !== fingerprint) {fingerprint = current;requestId = crypto.randomUUID();}
      busy = true;submit.disabled = true;form.setAttribute('aria-busy','true');
      inform(en?'Sending your request…':'Enviando sua solicitação…');
      try {
        const response = await fetch(form.dataset.api!,{
          method:'POST',credentials:'omit',redirect:'error',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({...payload,requestId,turnstileToken:token}),
          signal:AbortSignal.timeout(20000)
        });
        const result = await response.json();
        if (!response.ok || result.accepted !== true || result.requestId !== requestId) throw new Error('unconfirmed');
        form.reset();fields.disabled = true;handoff.hidden = true;fingerprint = '';requestId = '';
        inform((en?'Request received. I’ll reply by email if I’m available. Reference: ':'Solicitação recebida. Responderei por e-mail conforme disponibilidade. Protocolo: ')+result.requestId,true);
      } catch {
        showHandoff(message);
        challenge.reset(widget);
        inform(en?'Automatic receipt could not be confirmed. Nothing should be assumed delivered; you can send the prepared message yourself via LinkedIn.':'Não foi possível confirmar o recebimento automático. Não presuma o envio; se preferir, encaminhe a mensagem preparada pelo LinkedIn.',true);
      } finally {busy = false;submit.disabled = false;form.removeAttribute('aria-busy');}
    });
  });
}
