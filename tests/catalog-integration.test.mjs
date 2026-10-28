import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('api/v1/fonts.json',root),'utf8'));
test('public catalog is unique and grows safely',()=>{
 assert.ok(catalog.total >= 117);
 assert.equal(catalog.fonts.length,catalog.total);
 assert.equal(new Set(catalog.fonts.map(f=>f.id)).size,catalog.total);
 assert.ok(new Set(catalog.fonts.map(f=>f.name.toLowerCase())).size >= 117);
});
test('each font has safe identifier, origin, group and license review flag',()=>{
 for(const font of catalog.fonts){
  assert.match(font.id,/^[a-z0-9-]+$/);
  assert.ok(font.name && font.groups.length);
  assert.match(font.source,/^https:\/\//);
  assert.ok(font.license);
  assert.ok(['google-fonts','upstream'].includes(font.provider));
 }
});
test('viewer dedupes and PWA cache has upgraded version',()=>{
 const script=readFileSync(new URL('app.js',root),'utf8');
 const service=readFileSync(new URL('sw.js',root),'utf8');
 assert.match(script,/uniqueRows/);
 assert.match(service,/font-atlas-shell-v3/);
});
