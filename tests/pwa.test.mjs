import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
test('installable manifest has valid scope and icon',()=>{const m=JSON.parse(read('manifest.webmanifest'));assert.equal(m.start_url,'./');assert.equal(m.display,'standalone');assert.ok(m.icons.some(i=>i.src==='assets/icon.svg'));assert.match(read('assets/icon.svg'),/<svg/);});
test('service worker precaches same-origin offline shell',()=>{const s=read('sw.js');for(const f of ['index.html','app.js','api/v1/fonts.json','manifest.webmanifest'])assert.ok(s.includes(f));assert.match(s,/req.method!=='GET'/);assert.match(s,/origin!==self.location.origin/);assert.match(s,/caches.match/);});
test('home references offline worker',()=>{const h=read('index.html');assert.match(h,/manifest\.webmanifest/);assert.match(h,/navigator\.serviceWorker/);});
