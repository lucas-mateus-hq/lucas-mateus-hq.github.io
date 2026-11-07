// This validates public form IDs only. It is NOT a real submission or notification test.
const env = process.env;
const names = ['LESSON_PT','LESSON_EN','MOCK_PT','MOCK_EN'];
if (env.PUBLIC_TALLY_INTAKE_APPROVED !== 'true') {
  console.error('TALLY RELEASE BLOCKED: owner approval flag is not enabled.');
  process.exit(1);
}
const ids = names.map(name => [name, env[`PUBLIC_TALLY_${name}_ID`] || '']);
const valid = ids.every(([,id]) => /^[A-Za-z0-9]{6,24}$/.test(id));
const unique = new Set(ids.map(([,id])=>id)).size===ids.length;
if (!valid || !unique) {
  console.error('TALLY RELEASE BLOCKED: four distinct published form IDs are required.');
  process.exit(1);
}
console.log('TALLY_CONFIG_VALID: four distinct form IDs. This does not prove real form submission, email notification or Google Sheets persistence.');
