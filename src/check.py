from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json
ROOT=Path(__file__).resolve().parent.parent/'dist'
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.refs=[];self.lang=None;self.alternates=[]
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='html':self.lang=a.get('lang')
  if 'id'in a:self.ids.append(a['id'])
  if t in ('a','link','script','img'):
   ref=a.get('href',a.get('src',''))
   if ref:self.refs.append(ref)
  if t=='link' and a.get('rel')=='alternate':self.alternates.append(a.get('hreflang'))
pages={}
for route in ('','en','memberships','en/memberships','waiver','en/waiver','enroll','en/enroll'):
 file=ROOT/route/'index.html';p=Page();p.feed(file.read_text());pages['/'+route.strip('/')+'/']=p
 assert len(p.ids)==len(set(p.ids)),f'Duplicate ids: {file}'
 assert p.lang==('en' if (route=='en' or route.startswith('en/')) else 'es')
 assert set(p.alternates)=={'en','es','x-default'}
 for ref in p.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=(ROOT/u.path.lstrip('/')) if u.path.startswith('/') else (file.parent/u.path)
  if not u.path:target=file
  elif target.is_dir():target=target/'index.html'
  assert target.exists(),f'Broken {ref} on {file}'
  if u.fragment:
   q=Page();q.feed(target.read_text());assert u.fragment in q.ids,f'Missing anchor {ref}'
cfg=json.loads((ROOT/'integrations.json').read_text())
assert cfg['memberships']['enabled'] is False and cfg['memberships']['plans']==[]
assert cfg['waivers']['enabled'] is False
assert not cfg['waivers']['approvedVersion']
print('PASS: eight bilingual pages; language alternates; unique IDs; internal links/assets; payment and signing gates disabled.')
for route in ('','en','memberships','en/memberships','waiver','en/waiver','enroll','en/enroll'):
 s=(ROOT/route/'index.html').read_text()
 assert '18582090721' not in s and '858 209' not in s
 p=Page();p.feed(s)
 assert all('/526643686611' in u for u in p.refs if 'wa.me/' in u)
 for prefix in ('/memberships/','/waiver/'):
  assert any(prefix in r for r in p.refs)
single=(ROOT/'rocian-gracie-tijuana.html').read_text()
assert 'cdn.tailwindcss.com' not in single
assert 'src="/assets/' not in single and 'href="/style.css"' not in single
assert 'data:image/jpeg;base64,' in single and 'data:font/ttf;base64,' in single
assert 'window.RGJ_STANDALONE=true' in single
assert 'sm:' in single and 'md:' in single and 'lg:' in single
print('PASS: updated phone across pages; membership/waiver paths preserved; portable inline assets and responsive utilities present.')
