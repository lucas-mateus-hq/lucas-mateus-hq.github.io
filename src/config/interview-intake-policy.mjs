// Shared by the static build and release preflight. Public form IDs, never answers.
export function interviewIntakeConfig(env) {
 const ids={'pt-BR':env.PUBLIC_TALLY_INTERVIEW_PT_ID || '', 'en-US':env.PUBLIC_TALLY_INTERVIEW_EN_ID || ''};
 const configured=Object.values(ids).every(id=>/^[A-Za-z0-9]{6,24}$/.test(id)) && ids['pt-BR']!==ids['en-US'];
 return {active:env.PUBLIC_TALLY_INTAKE_APPROVED==='true' && configured,ids};
}
export function interviewForm(config,lang) {
 if(!config.active || !Object.hasOwn(config.ids,lang))return null;
 const id=config.ids[lang];
 return {embedded:`https://tally.so/embed/${id}?alignLeft=1&hideTitle=1&transparentBackground=1`,external:`https://tally.so/r/${id}`};
}
