import {interviewIntakeConfig} from '../src/config/interview-intake-policy.mjs';
const config=interviewIntakeConfig(process.env);
if(!config.active || Object.values(config.ids).some(id=>/^(Ab1001|Cd1002|Ef1003|Gh1004|TEST|EXAMPLE)/i.test(id))) {
 console.error('RELEASE BLOCKED: two distinct real interview application IDs and owner-verified delivery approval are required.');
 process.exit(1);
}
console.log('Tally configuration valid. This check does not prove submission, inbox delivery, or field contents; keep the owner verification evidence with the release.');
