#!/usr/bin/env python3
"""Sync a small, explicitly allowlisted sample of SIL OFL fonts from google/fonts.
No user credentials or license inference. Dependencies: Python 3 standard library.
"""
import json, os, pathlib, re, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = ROOT / 'assets' / 'fonts'
FAMILIES = ('amiri', 'lalezar', 'vazirmatn', 'estedad', 'inter', 'cairo')
API = 'https://api.github.com/repos/google/fonts/contents/ofl/'
HEADERS = {'User-Agent': 'FontAtlasSync/1.0', 'Accept': 'application/vnd.github+json'}
def read(url, max_bytes=5000000):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as response:
        if response.status != 200: raise RuntimeError(f'HTTP {response.status}: {url}')
        data = response.read(max_bytes + 1)
    if len(data)>max_bytes: raise ValueError('File exceeds size budget')
    return data
def main():
    BASE.mkdir(parents=True, exist_ok=True)
    results = []
    for slug in FAMILIES:
        try:
            listing=json.loads(read(API+slug, 250000))
            if not isinstance(listing,list): raise ValueError('Invalid directory listing')
            names={f['name']:f for f in listing if f.get('type')=='file'}
            license_file=names.get('OFL.txt')
            if not license_file: raise ValueError('Missing OFL.txt (not eligible)')
            raw_license=read(license_file['download_url'],200000)
            if b'SIL OPEN FONT LICENSE' not in raw_license.upper() and b'OPEN FONT LICENSE' not in raw_license.upper():
                raise ValueError('Unexpected license header')
            candidates=sorted((f for f in names.values() if re.search(r'\\.ttf$',f['name'],re.I) and f.get('size',0)<=4500000),key=lambda f:('[' in f['name'], 'regular' in f['name'].lower(),f['name']),reverse=True)
            if not candidates: raise ValueError('No root TTF below size limit')
            chosen=candidates[0]
            blob=read(chosen['download_url'],4500000)
            if blob[:4] not in (b'\\x00\\x01\\x00\\x00',b'OTTO',b'true'): raise ValueError('Unexpected font signature')
            directory=BASE/slug
            directory.mkdir(exist_ok=True)
            (directory/'font.ttf').write_bytes(blob)
            (directory/'OFL.txt').write_bytes(raw_license)
            results.append({'id':slug,'file':f'assets/fonts/{slug}/font.ttf','licenseFile':f'assets/fonts/{slug}/OFL.txt','source':chosen['html_url'],'bytes':len(blob)})
            print(f'SYNCED {slug}: {chosen["name"]} ({len(blob)} bytes)')
        except Exception as err:
            print(f'SKIPPED {slug}: {err}')
    (BASE/'manifest.json').write_text(json.dumps({'version':1,'fonts':results},indent=2)+'\\n',encoding='utf-8')
    if not results: raise SystemExit('No legally checkable font could be retrieved')
if __name__=='__main__': main()
