# Rocian Gracie Jr · Tijuana

Bilingual academy website and enrollment demo.

## Preview locally

Serve `dist/` as the web root:

```sh
python -m http.server 8000 --directory dist
```

Open http://localhost:8000 (Spanish) or http://localhost:8000/en/ (English).

## Build and verify

Requires Python 3.12+ and Node.js.

```sh
python src/build.py
python src/standalone.py
npm run check
```

The compiled stylesheet is committed. For CSS changes, update both `src/theme.css` and `dist/style.css`, or install the pinned dependencies and rebuild Tailwind. The standalone build creates the portable single-file demo used by the checks.

## Staging

GitHub Pages is the staging host. The workflow in `.github/workflows/pages.yml` builds, checks, and deploys on pushes to `main` or manual dispatch. One-time repository setup: Settings → Pages → Build and deployment → Source → GitHub Actions. After enabling Pages, rerun the workflow if its first run failed.

Expected staging URL after successful deployment: https://jkgraphix11.github.io/Rocian-Gracie-Jr-Academy/

`src/github_pages.py` prepares paths for the repository subdirectory and adds noindex metadata to staging pages. The deployment artifact is `_site/`; do not commit this generated folder.

## Enrollment status

Enrollment is a browser-only demonstration. It does not submit personal data, process payments, create accounts, or archive legally signed waivers. See `ACTIVATION.md` and `docs/ENROLLMENT-ARCHITECTURE.md` for the remaining work. Supabase migrations are design artifacts, not an activated backend.

Historical QA screenshots and the generated standalone HTML are omitted; the standalone HTML can be recreated from source.
