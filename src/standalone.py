"""Package the six bilingual pages as one portable HTML with embedded CSS, JS and assets."""
from pathlib import Path
import base64,json,re,mimetypes
ROOT=Path(__file__).resolve().parent.parent
DIST=ROOT/'dist'
def inline_asset(match):
 p=DIST/match.group(1).lstrip('/')
 if not p.is_file():return match.group(0)
 mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
 return 'data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
def embed(s):return re.sub(r'(/assets/[A-Za-z0-9_.-]+)',inline_asset,s)
css=embed((DIST/'style.css').read_text()+'\n'+(DIST/'enrollment.css').read_text())
pages={}
for route in ('/','/en/','/memberships/','/en/memberships/','/waiver/','/en/waiver/','/enroll/','/en/enroll/'):
 html=(DIST/route.strip('/')/'index.html').read_text()
 body=re.search(r'<body>(.*?)</body>',html,re.S).group(1)
 body=re.sub(r'<script\b[^>]*>.*?</script>','',body,flags=re.S)
 pages[route]={'lang':'en' if route.startswith('/en/') else 'es','title':re.search(r'<title>(.*?)</title>',html).group(1),'body':embed(body)}
def safe_json(x):return json.dumps(x,ensure_ascii=False).replace('<','\\u003c')
router=r'''
(() => {
  const pages=JSON.parse(document.getElementById('rgj-pages').textContent);
  let currentRoute='/en/';
  function render() {
    let desired;
    try { desired=new URL(location.hash.slice(1)||'/en/','https://rgj.local'); } catch { desired=new URL('/en/','https://rgj.local'); }
    const route=pages[desired.pathname]?desired.pathname:'/en/';
    const page=pages[route];
    if(window.rgjCleanup)window.rgjCleanup();
    if(window.rgjEnrollmentCleanup)window.rgjEnrollmentCleanup();
    document.documentElement.lang=page.lang;
    document.title=page.title;
    document.body.innerHTML=page.body;
    currentRoute=route;
    window.rgjCleanup=window.initializeSite();
    window.rgjEnrollmentCleanup=window.RGJEnrollment.init();
    const section=desired.searchParams.get('section');
    if(section&&document.getElementById(section))document.getElementById(section).scrollIntoView();
    else window.scrollTo(0,0);
  }
  document.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const a=event.target.closest('a');
    if(!a||a.target==='_blank')return;
    const href=a.getAttribute('href');
    if(!href||(!href.startsWith('/')&&!href.startsWith('#')))return;
    const u=new URL(href,'https://rgj.local'+currentRoute);
    if(!pages[u.pathname])return;
    event.preventDefault();
    let destination=u.pathname;
    if(u.hash)destination+='?section='+encodeURIComponent(u.hash.slice(1));
    if(location.hash==='#'+destination)render();else location.hash=destination;
  });
  window.addEventListener('hashchange',render);
  render();
})();
'''
config=json.loads((DIST/'integrations.json').read_text())
initial=pages['/en/']
html='''<!doctype html>
<!--
ROCIAN GRACIE JR TIJUANA / MAT ACCESS
Single-file production build. Tailwind CSS is precompiled; no CDN or framework runtime.
All fonts and photos are embedded. English/Spanish home, membership and waiver routes included.
Payments and digital signing intentionally disabled until academy-owned providers and approved terms exist.
Edit the RGJ_CONFIG object to connect public provider URLs only. Never embed secret keys.
Recompile utility changes using the Tailwind configuration embedded below.
-->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#000000"><title>Rocian Gracie Jr Tijuana / Mat Access</title><style>'''+css+'</style></head><body>'+initial['body']+'\n<script type="application/json" id="rgj-pages">'+safe_json(pages)+'</script>\n<script type="text/plain" id="tailwind-config">'+(ROOT/'tailwind.config.cjs').read_text()+'</script>\n<script>window.RGJ_STANDALONE=true;window.RGJ_CONFIG='+safe_json(config)+';</script>\n<script>'+(DIST/'script.js').read_text()+'\n'+(DIST/'waiver-content.js').read_text()+'\n'+embed((DIST/'enrollment.js').read_text())+'</script>\n<script>'+router+'</script></body></html>'
# Script data is held in closure before body swaps; output remains one portable HTML file.
(DIST/'rocian-gracie-tijuana.html').write_text(html)
print('Single-file HTML exported:',len(html.encode()),'bytes')
