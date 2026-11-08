// Shared by the static build and release preflight. Public form IDs, never answers.
export function interviewIntakeConfig(env) {
 const ids={'pt-BR':env.PUBLIC_TALLY_INTERVIEW_PT_ID || ''};
 const configured=Boolean(ids['pt-BR'] && /^[A-Za-z0-9]{6,24}$/.test(ids['pt-BR']));
 return {active:env.PUBLIC_TALLY_INTAKE_APPROVED==='true' && configured,ids};
}
export function interviewForm(config,lang) {
 if(!config.active || !Object.hasOwn(config.ids,lang))return null;
 const id=config.ids[lang];
 return {embedded:`https://tally.so/embed/${id}?alignLeft=1&hideTitle=1&transparentBackground=1`,external:`https://tally.so/r/${id}`};
}
