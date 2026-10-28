# Font Atlas Integration Guide

## Static API (read-only)
`GET /api/v1/fonts.json` returns `schemaVersion`, `version` and `fonts[]`.
- No backend server, API key, or guaranteed availability is provided.
- The static endpoint is accessible only after GitHub Pages successfully deploys.
- The catalog is **curated** (10 integration-ready reference entries), not a complete font mirror.
- Font binaries are fetched by the Google Fonts CSS service only when chosen in a browser.

## JavaScript / Web
```js
import { FontAtlas } from "https://hossean787-blip.github.io/font-atlas-library/sdk/font-atlas.js";
const atlas = await new FontAtlas().init();
const persian = atlas.list({script:"arabic"});
atlas.load("vazirmatn");
document.body.style.fontFamily = '"Vazirmatn", sans-serif';
```

## Android / Desktop
Consume the static JSON as a directory. Download a font file *from a verified upstream URL* in the application build process, inspect its license, bundle it in assets, and use platform native font APIs. The SDK is browser-only; no Android or Windows native SDK is claimed.

## Offline
Do not depend on Google Fonts CSS at runtime for offline applications. Bundle vetted font binaries with an app (subject to the individual licenses).

## Security
Treat remote JSON as untrusted. Validate IDs and URLs, pin a catalog version for production, and avoid dynamically downloading executable content. No credentials are required.

## Deployment
GitHub Settings → Pages → Deploy from branch → main / root. Pages visibility & build status must be verified independently.

## Licensing
Integration code is MIT (see SDK-LICENSE.txt). Fonts are not under that MIT license. Each font retains its own upstream license. `verify-upstream` is deliberately not a statement of commercial-use permission.
