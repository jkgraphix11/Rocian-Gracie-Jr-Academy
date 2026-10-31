const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('dist/script.js','utf8').split('window.initializeSite =')[0];
const box={window:{},URLSearchParams};vm.runInNewContext(src,box);
const quote=s=>box.window.RGJQuote(new URLSearchParams(s));
assert.equal(quote('class=jiujitsu&frequency=2').amount,800);
assert.equal(quote('class=judo&frequency=3').amount,1000);
assert.equal(quote('class=judo&frequency=4').amount,1200);
for(const [members,total] of [[2,2000],[3,2700],[4,3200]]){const q=quote(`group=family&members=${members}&frequency=2`);assert.equal(q.amount,total);assert.equal(q.frequency,4);assert(q.provisional);}
assert.equal(quote('class=yoga&frequency=4').amount,888);
assert.equal(quote('group=family&members=3&class=yoga').amount,2664);
for(const program of ['boxing','kickboxing','selfdefense'])assert(quote('class='+program).provisional);
const invalid=quote('group=invalid&class=__proto__&members=-4&frequency=99');assert.equal(invalid.program,'martialarts');assert.equal(invalid.members,1);assert.equal(invalid.frequency,2);
console.log('PASS: individual rates, family totals and fixed attendance, Yoga per-person pricing, provisional programs, invalid URL selections.');

assert.equal(quote('class=yoga').frequency,2);
assert.equal(quote('group=family&members=3&class=yoga&frequency=4').frequency,2);
assert.equal(quote('class=martialarts&frequency=2').amount,800);
for(const legacy of ['jiujitsu','judo','boxing','kickboxing','selfdefense'])assert.equal(quote('class='+legacy).program,'martialarts');
