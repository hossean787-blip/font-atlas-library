# Font Atlas — upstream sources and compliance
- Google Fonts: https://github.com/google/fonts — imports the full license-labelled family directory via GitHub tree API (OFL, Apache 2, UFL). This is currently the automated directory source.
- Fontsource: https://github.com/fontsource/font-files — independent 2000+ font resource; **not imported into binaries** without a per-family rights review and deduplication.
- Persian open-font repositories: keep links to original author projects for licenses and updates.
- Commercial and proprietary fonts: **not mirrored** without explicit redistribution permission.

## Operational distinction
The main API indexes upstream projects. `assets/fonts` contains only font files downloaded by the limited OFL sync workflow and their license texts. GitHub Pages is a static host, not an unrestricted web-crawling server. Scheduled GitHub Actions update the directory weekly, subject to upstream API limits and repository Actions policy.

## Status
A committed workflow is not proof of a successful run. Review Actions before claiming a larger published catalog. Keep release claims based on `api/v1/fonts.json` and `assets/fonts/manifest.json`.
