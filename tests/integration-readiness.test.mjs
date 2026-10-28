import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('PWA offline shell and hosted manifest are same-origin',()=>{
 const sw=file('sw.js'),ui=file('app.js');
 assert.match(sw,/caches\.match\(req\)/);
 assert.match(sw,/origin!==self\.location\.origin/);
 assert.match(ui,/hostManifest/);
 assert.match(ui,/new FontFace\(/);
 assert.match(ui,/url\.origin!==location\.origin/);
});
test('hosted font download filter exists and source links are safe',()=>{
 const html=file('index.html'),js=file('app.js');
 assert.match(html,/value="downloadable"/);
 assert.match(js,/g\.value==="downloadable"/);
 assert.match(js,/source\.rel="noopener noreferrer"/);
 assert.match(js,/download\.download=/);
});
test('cross platform integration examples and SDK public contract',()=>{
 const sdk=file('sdk/font-atlas.js');
 assert.match(sdk,/export class FontAtlas/);
 assert.match(sdk,/async init\(/);
 assert.match(sdk,/cssUrl\(/);
 assert.match(file('examples/android/FontAtlasCatalog.kt'),/class FontAtlasCatalog/);
 assert.match(file('examples/dotnet/FontAtlasClient.cs'),/class FontAtlasClient/);
});
