import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveLessonIntake} from '../src/config/lesson-intake-policy.mjs';
const email={PUBLIC_LESSON_INTAKE_MODE:'email',PUBLIC_LESSON_EMAIL_FORM_ID:'xsyntest',PUBLIC_LESSON_EMAIL_VERIFIED:'true'};
const worker={PUBLIC_LESSON_API_URL:'https://intake-test.example.workers.dev/v1/lesson-requests',PUBLIC_TURNSTILE_SITE_KEY:'1x00000000000000000000AA'};
test('email is an explicit verified choice and exposes only an opaque form ID',()=>{
  assert.deepEqual(resolveLessonIntake(email),{active:true,mode:'email',api:'https://formspree.io/f/xsyntest',siteKey:''});
});
for(const id of ['', 'owner@example.invalid', 'https://example.invalid', 'xsyntest/../evil', 'xsyntest?to=other', 'xsyntest#fragment', ' xsyntest'])
test(`email rejects an invalid ID: ${JSON.stringify(id)}`,()=>assert.equal(resolveLessonIntake({...email,PUBLIC_LESSON_EMAIL_FORM_ID:id}).active,false));
for(const verified of ['', 'false','TRUE'])test(`email stays inactive without exact verification: ${JSON.stringify(verified)}`,()=>{
  assert.equal(resolveLessonIntake({...email,...worker,PUBLIC_LESSON_EMAIL_VERIFIED:verified}).active,false);
});
test('unconfigured and unknown modes stay inactive, without silently choosing another transport',()=>{
  assert.equal(resolveLessonIntake({}).active,false);
  assert.equal(resolveLessonIntake({...email,...worker,PUBLIC_LESSON_INTAKE_MODE:'unknown'}).active,false);
  assert.equal(resolveLessonIntake({...email,...worker,PUBLIC_LESSON_EMAIL_FORM_ID:''}).active,false);
});
test('legacy Worker configuration retains its validated endpoint and Turnstile requirements',()=>{
  assert.equal(resolveLessonIntake(worker).mode,'worker');
  for(const url of ['http://intake-test.example.workers.dev/v1/lesson-requests','https://example.invalid/v1/lesson-requests',worker.PUBLIC_LESSON_API_URL+'?redirect=other',worker.PUBLIC_LESSON_API_URL+'#fragment'])
    assert.equal(resolveLessonIntake({...worker,PUBLIC_LESSON_API_URL:url}).active,false);
  assert.equal(resolveLessonIntake({...worker,PUBLIC_TURNSTILE_SITE_KEY:''}).active,false);
});
