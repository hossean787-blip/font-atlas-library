const VERSION='font-atlas-shell-v3';
const SHELL=['./','./index.html','./app.js','./api/v1/fonts.json','./manifest.webmanifest','./assets/icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('font-atlas-shell-')&&k!==VERSION).map(k=>caches.delete(k)))),self.clients.claim()]))});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;event.respondWith(fetch(req).then(response=>{if(response.ok){const cloned=response.clone();caches.open(VERSION).then(cache=>cache.put(req,cloned)).catch(()=>{})}return response}).catch(()=>caches.match(req).then(hit=>hit||Response.error())))});
