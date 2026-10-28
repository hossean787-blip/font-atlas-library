#!/usr/bin/env python3
"""Build a license-aware directory from Google's public font repository.
No font files are copied by this script. Uses standard library only.
"""
import datetime
import json
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "api/v1/fonts.json"
API = "https://api.github.com/repos/google/fonts/git/trees/main?recursive=1"
HEADERS = {"User-Agent": "FontAtlas-Catalog/1.0", "Accept": "application/vnd.github+json"}
ALLOWED = {"ofl": ("OFL.txt", "OFL-1.1"), "apache": ("LICENSE.txt", "Apache-2.0"), "ufl": ("UFL.txt", "Ubuntu-Font-1.0")}
def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=45) as response:
        return json.load(response)
def main():
    old = json.loads(OUT.read_text(encoding="utf-8"))
    tree = fetch(API)
    if tree.get("truncated"): raise RuntimeError("GitHub repository tree truncated; refusing partial catalog")
    paths = {item["path"] for item in tree["tree"] if item.get("type") == "blob"}
    groups = {}
    for path in paths:
        parts = path.split("/")
        if len(parts) == 3 and parts[0] in ALLOWED:
            groups.setdefault((parts[0], parts[1]), set()).add(parts[2])
    generated = {}
    for (license_dir, slug), names in groups.items():
        license_file, license_id = ALLOWED[license_dir]
        if license_file not in names or not any(n.lower().endswith(".ttf") for n in names):
            continue
        if not re.fullmatch("[a-z0-9_-]+", slug): continue
        name = " ".join(word.capitalize() for word in slug.replace("_"," ").split())
        generated[slug.replace("_","-")] = {"id":slug.replace("_","-"),"name":name,"scripts":[],"category":"unclassified",
           "groups":["google-fonts"],"source":f"https://github.com/google/fonts/tree/main/{license_dir}/{slug}",
           "cssFamily":name,"provider":"google-fonts","license":license_id,
           "licenseUrl":f"https://github.com/google/fonts/blob/main/{license_dir}/{slug}/{license_file}"}
    # Preserve reviewed family names, language metadata, URLs and all non-Google references.
    for item in old["fonts"]:
        k = item["id"]
        if k in generated:
            g = generated[k]
            for field in ("name","scripts","category","cssFamily","groups"):
                if item.get(field): g[field] = item[field]
            if item.get("license") not in (None, "verify-upstream") and item.get("license") != g["license"]:
                raise ValueError("Conflicting license for " + k)
        else:
            generated[k] = item
    fonts = sorted(generated.values(), key=lambda x:x["id"])
    if len(fonts) < len(old["fonts"]): raise ValueError("Catalog unexpectedly shrank")
    if any(not f.get("id") or not f.get("source","").startswith("https://") or not f.get("license") for f in fonts):
        raise ValueError("Generated catalog contains invalid source or license metadata")
    if len({f["id"] for f in fonts}) != len(fonts): raise ValueError("Duplicate IDs")
    output = dict(old,version="0.4.0",generatedAt=datetime.date.today().isoformat(),
                  notice="Licensed font references, not a promise of local font binaries. Rights must be verified upstream.",
                  total=len(fonts),fonts=fonts)
    OUT.write_text(json.dumps(output, ensure_ascii=False, indent=2)+"\n",encoding="utf-8")
    print(f"Catalog rebuilt: {len(fonts)} unique families ({len(groups)} candidate Google family folders)")
if __name__ == "__main__": main()
