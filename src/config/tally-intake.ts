/**
 * Public, build-time Tally form IDs. No secrets or visitor responses live here.
 * All four localized forms must be verified by their owner before activation.
 */
export type IntakeLanguage = 'pt-BR' | 'en-US';
export type IntakeKind = 'lesson' | 'mock';

const ids = {
  'pt-BR': {
    lesson: import.meta.env.PUBLIC_TALLY_LESSON_PT_ID || '',
    mock: import.meta.env.PUBLIC_TALLY_MOCK_PT_ID || '',
  },
  'en-US': {
    lesson: import.meta.env.PUBLIC_TALLY_LESSON_EN_ID || '',
    mock: import.meta.env.PUBLIC_TALLY_MOCK_EN_ID || '',
  },
} as const;

const validId = (id: string): boolean => /^[A-Za-z0-9]{6,24}$/.test(id);
const approved = import.meta.env.PUBLIC_TALLY_INTAKE_APPROVED === 'true';
const configured = Object.values(ids).every(forms => Object.values(forms).every(validId));

export const tallyIntake = {
  active: approved && configured,
  ids,
} as const;

export function getTallyForm(kind: IntakeKind, lang: IntakeLanguage) {
  const id = tallyIntake.active ? ids[lang][kind] : '';
  if (!id) return null;
  return {
    embedded: `https://tally.so/embed/${id}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`,
    external: `https://tally.so/r/${id}`,
  };
}
