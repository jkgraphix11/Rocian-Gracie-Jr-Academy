"""Prepare the built site for GitHub Pages' repository subdirectory."""
from pathlib import Path
import argparse
import re
import shutil

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--base-path', required=True)
parser.add_argument('--origin', required=True)
parser.add_argument('--output', default='_site')
args = parser.parse_args()
base = '/' + args.base_path.strip('/')
output = ROOT / args.output
assert output.resolve() != (ROOT / 'dist').resolve()
output.mkdir(parents=True, exist_ok=True)
shutil.copytree(ROOT / 'dist', output, dirs_exist_ok=True,
                ignore=shutil.ignore_patterns('rocian-gracie-tijuana.html'))
for path in output.rglob('*'):
    if path.suffix not in ('.html', '.css', '.js'):
        continue
    text = path.read_text()
    text = text.replace('https://rocian-gracie-tijuana.jkgraphix11.chatgpt.site', args.origin.rstrip('/') + base)
    # HTML attributes, including those in runtime-rendered templates.
    text = re.sub(r'((?:href|src|action)=[\"\'])/(?!/)', lambda m: m[1] + base + '/', text)
    text = re.sub(r'(url\([\"\']?)/(?!/)', lambda m: m[1] + base + '/', text)
    text = text.replace("fetch('/integrations.json'", "fetch('" + base + "/integrations.json'")
    if path.name == 'enrollment.js':
        text = text.replace("const old=link.getAttribute('href');", "const prefix=" + repr(base) + ";const href=link.getAttribute('href');const old=href.startsWith(prefix+'/')?href.slice(prefix.length):href;")
        text = text.replace("link.setAttribute('href',link.hasAttribute('data-language')?", "link.setAttribute('href',prefix+(link.hasAttribute('data-language')?")
        text = text.replace("(lang==='en'?'/en'+base:base));", "(lang==='en'?'/en'+base:base)));")
    if path.suffix == '.html':
        text = text.replace('</head>', '<meta name="robots" content="noindex, nofollow"></head>')
    path.write_text(text)
(output / '.nojekyll').touch()
print('GitHub Pages artifact ready:', output)
