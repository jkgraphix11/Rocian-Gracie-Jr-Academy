const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const script=fs.readFileSync('dist/script.js','utf8');
const source=script.slice(script.indexOf('window.initSiteMotion ='),script.indexOf('window.initializeSite ='));
function fixture({reduced=false,supported=true,fail=false}={}){
 const classes=new Set(),styles=new Map(),events={};let io;
 const element={classList:{add:x=>classes.add(x),remove:(...xs)=>xs.forEach(x=>classes.delete(x))},style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)},getBoundingClientRect:()=>({bottom:500}),contains:()=>false,closest:()=>null,matches:()=>false};
 const media={matches:reduced,addEventListener:(k,f)=>events[k]=f,removeEventListener:k=>delete events[k]};
 const document={querySelector:()=>null,querySelectorAll:()=>[element],addEventListener:(k,f)=>events[k]=f,removeEventListener:k=>delete events[k]};
 class Observer{constructor(callback){this.callback=callback;io=this}observe(){if(fail)throw new Error('observer failure')}unobserve(){this.unobserved=true}disconnect(){this.disconnected=true}}
 const window={matchMedia:()=>media};if(supported)window.IntersectionObserver=Observer;
 const context={window,document,IntersectionObserver:Observer,Set,Map};vm.runInNewContext(source,context);
 const cleanup=window.initSiteMotion();return {classes,styles,events,element,media,get io(){return io},cleanup};
}
for(const options of [{reduced:true},{supported:false}]){const f=fixture(options);assert.equal(f.classes.size,0);f.cleanup()}
let f=fixture();assert(f.classes.has('motion-pending'));f.io.callback([{isIntersecting:true,target:f.element}]);assert(!f.classes.has('motion-pending'));assert(f.classes.has('motion-enter'));assert(f.io.unobserved);f.cleanup();assert.equal(f.classes.size,0);assert.equal(f.styles.size,0);assert(f.io.disconnected);
f=fixture();f.events.focusin({target:{closest:()=>f.element}});assert(!f.classes.has('motion-pending'));assert(!f.classes.has('motion-enter'));f.cleanup();
f=fixture();f.media.matches=true;f.events.change();assert.equal(f.classes.size,0);assert(f.io.disconnected);f.cleanup();
f=fixture({fail:true});assert.equal(f.classes.size,0);assert(f.io.disconnected);f.cleanup();
console.log('PASS: reduced motion, unsupported observer fallback, viewport reveal, keyboard visibility, preference changes, cleanup and observer failure.');
