import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {interviewIntakeConfig,interviewForm} from '../src/config/interview-intake-policy.mjs';
const fixture={PUBLIC_TALLY_INTAKE_APPROVED:'true',PUBLIC_TALLY_INTERVIEW_PT_ID:'Ab1001',PUBLIC_TALLY_INTERVIEW_EN_ID:'Ef1003'};
for(const [name,change] of [['no approval',{PUBLIC_TALLY_INTAKE_APPROVED:'false'}],['one ID missing',{PUBLIC_TALLY_INTERVIEW_EN_ID:''}],['injection',{PUBLIC_TALLY_INTERVIEW_PT_ID:'abc123?email=secret'}],['same localized form',{PUBLIC_TALLY_INTERVIEW_EN_ID:'Ab1001'}]])test(name+' cannot expose applications',()=>{
 const config=interviewIntakeConfig({...fixture,...change});assert.equal(config.active,false);assert.equal(interviewForm(config,'pt-BR'),null);
});
test('localized forms use only configured IDs, with no page URL or visitor values',()=>{
 const config=interviewIntakeConfig(fixture);assert.equal(config.active,true);
 assert.equal(interviewForm(config,'pt-BR').external,'https://tally.so/r/Ab1001');
 assert.equal(interviewForm(config,'en-US').external,'https://tally.so/r/Ef1003');
 assert.equal(interviewForm(config,'other'),null);
 assert.equal(new URL(interviewForm(config,'pt-BR').embedded).searchParams.has('email'),false);
});
test('release gate rejects synthetic IDs even with approval',()=>{
 const run=spawnSync(process.execPath,['scripts/check-tally-release.mjs'],{env:{...process.env,...fixture},encoding:'utf8'});assert.equal(run.status,1);assert.match(run.stderr,/RELEASE BLOCKED/);
});
