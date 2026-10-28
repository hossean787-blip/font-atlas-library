import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('../assets/fonts/manifest.json',import.meta.url),'utf8'));
test('hosted font manifest is internally consistent',()=>{
 assert.ok(Array.isArray(manifest.fonts));
 assert.equal(new Set(manifest.fonts.map(f=>f.id)).size,manifest.fonts.length);
 for(const f of manifest.fonts){
  assert.match(f.id,/^[a-z0-9-]+$/);
  assert.equal(f.file,'assets/fonts/'+f.id+'/font.ttf');
  assert.equal(f.licenseFile,'assets/fonts/'+f.id+'/OFL.txt');
  assert.match(f.source,/^https:\/\/github\.com\/google\/fonts\//);
  assert.ok(Number.isInteger(f.bytes)&&f.bytes>0);
  for(const rel of [f.file,f.licenseFile]){
   assert.ok(existsSync(new URL('../'+rel,import.meta.url)),'Missing '+rel);
  }
  const file=new URL('../'+f.file,import.meta.url);
  assert.equal(statSync(file).size,f.bytes);
  const signature=readFileSync(file).subarray(0,4);
  assert.ok(signature.equals(Buffer.from([0,1,0,0]))||signature.toString()==='OTTO'||signature.toString()==='true');
  if(f.sha256)assert.match(f.sha256,/^[a-f0-9]{64}$/);
 }
});
