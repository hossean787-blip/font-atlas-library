# Font Atlas 1.0 Release Candidate — 2026-10-28

## Supported now
- Public searchable font directory with 2,111 entries at last verified catalog read.
- A growing hosted mirror of OFL families: 42 families at last verified manifest read.
- In-browser preview, original-source links, local mirrored file downloads.
- Read-only static JSON API, browser SDK, PWA shell cache and integration examples.

## Acceptance gates for final 1.0
1. All Node test suites green, including byte length, SHA-256 checks (where recorded), TTF signature and OFL license text of each hosted file.
2. GitHub Pages deployment succeeds and site/API are reachable externally.
3. Android Chrome manual checks: browse, search, preview Persian/Latin text, download font, install PWA and reload offline UI.
4. Windows/browser checks of font preview and downloaded files.
5. Review license terms and ensure upstream attribution for all binary mirrors.
6. Publish version tag only after the gates above pass.

## Important limits
The 2,111 catalog items are pointers, NOT 2,111 local binaries. Offline font previews require the actual font files to be cached or bundled. Kotlin/.NET examples are clients, NOT distributed SDK packages.
No unlicensed proprietary binaries may be mirrored. A final release is NOT claimed by this document.
