# One-off: move the colour scheme to the Saudi government (DGA) palette used on zatca.gov.sa.
# Run from the project folder: python -X utf8 src/retheme_zatca.py
import io, re, glob

def rd(p): return io.open(p, encoding='utf-8', newline='').read()
def wr(p, s): io.open(p, 'w', encoding='utf-8', newline='').write(s)

LIGHT = '''  --bg:#f9fafb; --surface:#ffffff; --surface-2:#f3f4f6; --line:#e5e7eb; --line-2:#d2d6db;
  --ink:#161616; --ink-2:#384250; --muted:#6c737f;
  --brand:#1b8354; --brand-2:#25935f; --brand-ink:#ffffff; --brand-soft:#e7f6ec; --gold:#1b8354; --gold-2:#88d8ad;
  --rail:#0e2a1e; --rail-2:#14402b; --rail-ink:#e6f4ec; --rail-muted:#8fb5a1; --rail-line:#1d4a33;
  --s1:#0080ba; --s2:#1b8354; --s3:#54c08a; --grid:#e5e7eb; --axis:#d2d6db;
  --good:#1b8354; --good-ink:#166a45; --good-bg:#e7f6ec; --warn:#f79009; --warn-ink:#93370d; --warn-bg:#fffaeb;
  --crit:#d92d20; --crit-ink:#b42318; --crit-bg:#fef3f2; --none-ink:#6c737f; --none-bg:#f3f4f6;
  --input:#ffffff; --input-line:#d2d6db;
  --f-display:"IBM Plex Sans Arabic","IBM Plex Sans",system-ui,sans-serif;'''
DARK = '''  --bg:#0b1510; --surface:#111d17; --surface-2:#15241c; --line:#22352b; --line-2:#2e4539; --ink:#eef4f0; --ink-2:#b9c7bf; --muted:#86978d;
  --brand:#54c08a; --brand-2:#7fd3a6; --brand-ink:#05200f; --brand-soft:#123a26; --gold:#88d8ad; --gold-2:#88d8ad;
  --rail:#07130d; --rail-2:#10291c; --rail-ink:#d7eadf; --rail-muted:#7f9c8b; --rail-line:#173525;
  --s1:#2a9fd6; --s2:#3fb67a; --s3:#7fd3a6; --grid:#2a332e; --axis:#3a453f;'''

s = rd('src/head.html')
s = re.sub(r'  --bg:#f2f5f4;.*?--input-line:#e5dcae;\n  --f-display:[^\n]*', LIGHT, s, count=1, flags=re.S)
s, n = re.subn(r'  --bg:#0a1211;[^\n]*\n  --brand:#2fb39c;[^\n]*\n  --rail:#060d0c;[^\n]*\n  --s1:#3987e5;[^\n]*', DARK, s)
assert n == 2, n
s = s.replace('family=IBM+Plex+Sans+Arabic:wght@400;500;600', 'family=IBM+Plex+Sans+Arabic:wght@400;500;600;700', 1)
wr('src/head.html', s)

# fixed colours inside styles, scripts and the standalone pages
MAP = {
 '#0a2a25':'#0e3b29','#0c3d35':'#14573a','#183b2c':'#166a45','#163a2c':'#166a45','#1b3a2a':'#166a45','#123f37':'#14573a',
 '#0c201d':'#0e2a1e','#0b2420':'#0f2f21','#0a1b18':'#0b2117','#25433d':'#14573a','#0a1a17':'#0b2117',
 '#2fb39c':'#1b8354','#4cc9b1':'#54c08a','#0f8a7a':'#1b8354','#0b6b5f':'#166a45','#7fd0b8':'#88d8ad',
 '#e3b866':'#88d8ad','#f3d9a4':'#d4f3e0','#d6a957':'#88d8ad','#1f9e88':'#1b8354','#b8862e':'#0080ba',
 'rgba(47,179,156':'rgba(27,131,84','rgba(227,184,102':'rgba(136,216,173','rgba(76,201,177':'rgba(84,192,138',
 'rgba(12,32,29':'rgba(14,42,30','rgba(4,20,17':'rgba(7,24,16',
}
files = ['src/head.html'] + glob.glob('src/*.js') + ['app.html', 'mobile/www/index.html', 'mobile/www/offline.html', 'mobile/capacitor.config.json', 'src/manifest.webmanifest']
for p in files:
    t = rd(p); o = t
    for a, b in MAP.items():
        t = re.sub(re.escape(a), b, t, flags=re.I)
    if t != o: wr(p, t); print('updated', p)
