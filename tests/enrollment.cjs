const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const sandbox={window:{},document:{getElementById:()=>null},Intl,Date};
vm.runInNewContext(fs.readFileSync('dist/enrollment.js','utf8'),sandbox);
const {age,signatureMatches}=sandbox.window.RGJEnrollment;
assert.equal(age('2008-10-30','2026-10-30'),18);
assert.equal(age('2008-10-31','2026-10-30'),17);
assert.equal(age('2012-02-29','2026-02-28'),13);
assert.equal(age('2012-02-29','2026-03-01'),14);
for(const d of ['2026-02-30','2030-01-01','garbage',''])assert(Number.isNaN(age(d,'2026-10-30')));
assert(signatureMatches('  Ana  María Pérez ','Ana María Pérez'));
assert(!signatureMatches('Child Name','Guardian Name'));
assert(!signatureMatches('',''));
const script=fs.readFileSync('dist/enrollment.js','utf8');
assert(!/localStorage|sessionStorage|fetch\(/.test(script));
for(const route of ['enroll','en/enroll','waiver','en/waiver']) {
 const s=fs.readFileSync(`dist/${route}/index.html`,'utf8');assert(s.includes('id="enrollment-app"'));assert(s.includes('/enrollment.js'));
}
for(const route of ['','en/']){const s=fs.readFileSync(`dist/${route}index.html`,'utf8');for(const cls of ['trial-ticket','header-trial','trial-cta','sticky-access'])assert(new RegExp(`class="[^\"]*${cls}[^\"]*" href="/${route}enroll/"`).test(s));}
console.log('PASS: age boundaries, leap dates, malformed DOB, name matching, no browser persistence/network submission, eight route integration and primary CTAs.');

for(const route of ['memberships','en/memberships']){const s=fs.readFileSync(`dist/${route}/index.html`,'utf8');assert(!s.includes('id="enrollment-app"'));assert(s.includes('id="plan-finder"'));assert(s.includes('$200'));assert(s.includes('id="memberships"'));}
const {phoneNumber}=sandbox.window.RGJEnrollment;
assert.equal(phoneNumber('MX','664 123 4567'),'+526641234567');
assert.equal(phoneNumber('US','(619) 555-0123'),'+16195550123');
for(const value of ['', '123', '+1 664 123 4567','664123456789','abcdefghij'])assert.equal(phoneNumber('MX',value),'');
assert.equal(phoneNumber('CA','6195550123'),'');
console.log('PASS: MX/US phone normalization, formatted numbers, and invalid phone inputs.');

assert.equal(phoneNumber('MX','+52 664 123 4567'),'+526641234567');
assert.equal(phoneNumber('US','+1 (619) 555-0123'),'+16195550123');
assert.equal(phoneNumber('MX','+52 '),'');

const {cleanPhoneInput}=sandbox.window.RGJEnrollment;
assert.equal(cleanPhoneInput('US','+1 (619) 555-0123'),'6195550123');
assert.equal(cleanPhoneInput('MX','+52 abc664-123.4567'),'6641234567');
assert.equal(cleanPhoneInput('MX','abc'),'');
assert.equal(cleanPhoneInput('MX','664123456789'),'6641234567');
assert.equal(cleanPhoneInput('US','6195550123'),'6195550123');

assert.equal(cleanPhoneInput('US','16195550123'),'6195550123');
assert.equal(phoneNumber('US',cleanPhoneInput('US','6195550123')),'+16195550123');
assert.equal(phoneNumber('MX',cleanPhoneInput('MX','6641234567')),'+526641234567');

vm.runInNewContext(fs.readFileSync('dist/waiver-content.js','utf8'),sandbox);
const waiver=sandbox.window.RGJ_WAIVER;
const crypto=require('node:crypto');
for(const lang of ['en','es']){
 assert.equal(waiver[lang].length,14);
 assert(!JSON.stringify(waiver[lang]).includes('___'));
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(waiver[lang])).digest('hex'),waiver.textSha256ByLanguage[lang]);
}
assert.notEqual(waiver.textSha256ByLanguage.en,waiver.textSha256ByLanguage.es);
assert(script.includes('language:lang,interfaceLanguage:lang'));
const waiverStep=script.split('if(step===3)return')[1].split('if(step===4)return')[0];
assert.equal((waiverStep.match(/\$\{check\(/g)||[]).length,2);
console.log('PASS: two acknowledgements, bilingual waiver bodies, no paper blanks, and language-specific evidence hashes.');
