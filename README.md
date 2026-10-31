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
npm run check
```

The compiled stylesheet is committed. For CSS changes, update both `src/theme.css` and `dist/style.css`, or install the pinned dependencies and rebuild Tailwind. Optional: `python src/standalone.py` generates the portable single-file demo.

## Staging

This repository stores the editable source, deployable `dist/` assets, checks, and backend design. GitHub Pages or another staging host is not configured yet. Existing demo: https://rocian-gracie-tijuana.jkgraphix11.chatgpt.site

## Enrollment status

Enrollment is a browser-only demonstration. It does not submit personal data, process payments, create accounts, or archive legally signed waivers. See `ACTIVATION.md` and `docs/ENROLLMENT-ARCHITECTURE.md` for the remaining work. Supabase migrations are design artifacts, not an activated backend.

Historical QA screenshots and the generated standalone HTML are omitted; the standalone HTML can be recreated from source.
