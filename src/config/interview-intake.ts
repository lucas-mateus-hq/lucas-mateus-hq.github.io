import {interviewIntakeConfig,interviewForm} from './interview-intake-policy.mjs';
export const interviewIntake=interviewIntakeConfig(import.meta.env);
export const getInterviewForm=(lang:'pt-BR'|'en-US')=>interviewForm(interviewIntake,lang);
