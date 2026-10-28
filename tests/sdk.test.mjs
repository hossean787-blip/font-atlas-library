import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {FontAtlas} from '../sdk/font-atlas.js';
const data=JSON.parse(readFileSync(new URL('../api/v1/fonts.json',import.meta.url),'utf8'));
test('catalog schema, unique ids and sources',()=>{
 assert.equal(data.schemaVersion,'1.0.0');
 assert.ok(data.fonts.length>=10);
 assert.equal(new Set(data.fonts.map(x=>x.id)).size,data.fonts.length);
 for(const f of data.fonts){assert.match(f.id,/^[a-z0-9-]+$/);assert.ok(f.name);assert.ok(Array.isArray(f.scripts));assert.ok(f.source.startsWith('https://'));assert.ok(f.license)}
});
test('SDK init and filtering',async()=>{
 const oldFetch=globalThis.fetch;
 globalThis.fetch=async()=>({ok:true,json:async()=>data});
 try{const sdk=await new FontAtlas({catalogUrl:'https://example.test/catalog'}).init();assert.equal(sdk.list().length,data.fonts.length);assert.ok(sdk.list({script:'arabic'}).length>0);assert.equal(sdk.get('vazirmatn').name,'Vazirmatn');assert.equal(sdk.get('not-found'),null);assert.ok(sdk.list({query:'INTER'}).some(f=>f.id==='inter'));assert.match(sdk.cssUrl('inter',{weights:[400]}),/fonts.googleapis.com/);assert.throws(()=>sdk.cssUrl('not-found'))}
 finally{globalThis.fetch=oldFetch}
});
test('reject malformed schema and HTTP errors',async()=>{
 const oldFetch=globalThis.fetch;
 try {globalThis.fetch=async()=>({ok:true,json:async()=>({schemaVersion:'2.0.0',fonts:[]})});await assert.rejects(()=>new FontAtlas().init(),/schema/);
 globalThis.fetch=async()=>({ok:false,status:404});await assert.rejects(()=>new FontAtlas().init(),/404/)}
 finally{globalThis.fetch=oldFetch}
});
