import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const js=readFileSync(new URL("../app.js",import.meta.url),"utf8");
test("viewer includes accessible search, category and sample controls",()=>{
  for(const id of ["q","group","sample","size","cards","stats"])assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(html,/lang="fa"/);
  assert.match(html,/dir="rtl"/);
});
test("viewer previews only on demand and handles loading failures",()=>{
  assert.match(js,/ensurePreview/);
  assert.match(js,/link\.onerror/);
  assert.match(js,/button\.addEventListener\("click"/);
  assert.match(js,/textContent/);
  assert.doesNotMatch(js,/innerHTML\s*=/);
});
test("viewer source links are treated as external",()=>{
  assert.match(js,/source\.rel="noopener noreferrer"/);
  assert.match(js,/pageSize\+=36/);
});
