#!/usr/bin/env python3
"""Incrementally mirror approved OFL font binaries. One batch per GitHub run."""
import argparse
import hashlib
import json
import pathlib
import re
import urllib.request

ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/"assets/fonts"
CATALOG=ROOT/"api/v1/fonts.json"
HEADERS={"User-Agent":"FontAtlasMirror/2.0","Accept":"application/vnd.github+json"}
MAX_FONT=4_500_000
def get(url,limit):
    req=urllib.request.Request(url,headers=HEADERS)
    with urllib.request.urlopen(req,timeout=30) as response:
        if response.status!=200:raise ValueError("HTTP "+str(response.status))
        data=response.read(limit+1)
    if len(data)>limit:raise ValueError("over size limit")
    return data
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--batch",type=int,default=12)
    parser.add_argument("--max-bytes",type=int,default=25_000_000)
    args=parser.parse_args()
    if not 1<=args.batch<=40 or not 100_000<=args.max_bytes<=80_000_000:parser.error("unsafe budget")
    BASE.mkdir(parents=True,exist_ok=True)
    manifest=BASE/"manifest.json"
    old=json.loads(manifest.read_text(encoding="utf-8")) if manifest.exists() else {"version":1,"fonts":[]}
    existing={f["id"]:f for f in old["fonts"]}
    catalog=json.loads(CATALOG.read_text(encoding="utf-8"))
    # Only allow exact repository paths under google/fonts/ofl, and known OFL metadata.
    candidates=[]
    for f in catalog["fonts"]:
        url=f.get("licenseUrl","")
        m=re.fullmatch(r"https://github.com/google/fonts/blob/main/ofl/([a-z0-9_-]+)/OFL.txt",url)
        if m and f.get("license")=="OFL-1.1" and f["id"] not in existing:
            candidates.append((f["id"],m.group(1)))
    candidates.sort()
    # Continue from the last attempted family across runs; a bad font must not block the queue.
    cursor_file=BASE/"cursor.json"
    cursor=json.loads(cursor_file.read_text(encoding="utf-8")).get("last","") if cursor_file.exists() else ""
    after=[x for x in candidates if x[0]>cursor]
    candidates=after if after else candidates
    last=cursor
    done=0; used=0; failures=[]; inspected=0
    for font_id,slug in candidates:
        if done>=args.batch or used>=args.max_bytes or inspected>=args.batch*5:break
        inspected+=1
        last=font_id
        try:
            api="https://api.github.com/repos/google/fonts/contents/ofl/"+slug
            listing=json.loads(get(api,300_000))
            files={v["name"]:v for v in listing if v.get("type")=="file"}
            lic=files.get("OFL.txt")
            if not lic:raise ValueError("No OFL")
            license_bytes=get(lic["download_url"],200_000)
            if b"OPEN FONT LICENSE" not in license_bytes.upper():raise ValueError("Invalid OFL")
            fonts=[v for v in files.values() if re.search(r"\.ttf$",v["name"],re.I) and 0<v.get("size",0)<=MAX_FONT]
            if not fonts:raise ValueError("No eligible font")
            fonts.sort(key=lambda v:(not ("[" in v["name"]), "regular" not in v["name"].lower(),v["name"]))
            selected=fonts[0]
            if used+selected["size"]+len(license_bytes)>args.max_bytes:break
            payload=get(selected["download_url"],MAX_FONT)
            if payload[:4] not in (bytes([0,1,0,0]),b"OTTO",b"true"):raise ValueError("Invalid TTF")
            target=BASE/font_id
            target.mkdir(exist_ok=True)
            (target/"font.ttf").write_bytes(payload)
            (target/"OFL.txt").write_bytes(license_bytes)
            existing[font_id]={"id":font_id,"file":f"assets/fonts/{font_id}/font.ttf",
              "licenseFile":f"assets/fonts/{font_id}/OFL.txt","source":selected["html_url"],
              "bytes":len(payload),"sha256":hashlib.sha256(payload).hexdigest()}
            used+=len(payload)+len(license_bytes);done+=1
            print("SYNCED",font_id,len(payload))
        except Exception as exc:
            failures.append({"id":font_id,"reason":str(exc)[:160]})
            print("SKIPPED",font_id,str(exc))
    if inspected:
        cursor_file.write_text(json.dumps({"last":last})+"\n",encoding="utf-8")
    manifest.write_text(json.dumps({"version":2,"fonts":sorted(existing.values(),key=lambda x:x["id"])},indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"added":done,"total":len(existing),"bytes":used,"inspected":inspected,"failed":failures},ensure_ascii=False))
if __name__=="__main__": main()
