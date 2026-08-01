# TypeQuest

A browser typing RPG — type words to attack, level up, unlock heroes/weapons, and fight bosses across four worlds. Built with React, TypeScript, Vite, Tailwind, React Three Fiber, and Framer Motion. Progress is saved locally (no backend).

## Getting started

```bash
npm install
npm run dev
```

## Character models

The hero and enemy GLB models ship compressed and committed directly in `public/` (each under 30MB — compressed from 20-140MB originals via `scripts/compress-model.mjs`, texture recompression + mesh decimation, no visible quality loss at game render scale). A service worker (`public/sw.js`) caches each one permanently after its first load, so repeat visits never re-download them.

- **Local dev**: works out of the box — nothing to configure.
- **Optional CDN**: set `VITE_ASSET_BASE_URL` (see `.env.example`) to serve models from a CDN/bucket instead of same-origin (useful for geographic distribution at scale, not required for the app to work).
- **Adding/replacing a model**: compress it first — see the usage note at the top of `scripts/compress-model.mjs` — then commit the compressed file under the same filename models are referenced by (see `src/components/battle/enemies/*GLB.tsx` / `src/components/battle/heroes/WarriorGLB.tsx`).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — typecheck + production build
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally
