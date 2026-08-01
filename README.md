# TypeQuest

A browser typing RPG — type words to attack, level up, unlock heroes/weapons, and fight bosses across four worlds. Built with React, TypeScript, Vite, Tailwind, React Three Fiber, and Framer Motion. Progress is saved locally (no backend).

## Getting started

```bash
npm install
npm run dev
```

## Character models

The hero and enemy 3D models are large GLB files (20-140MB each) that live outside this repo — they're `.gitignore`d since several exceed GitHub's per-file size limit.

- **Local dev**: drop the `.glb` files into `public/` and everything resolves as normal (`VITE_ASSET_BASE_URL` unset).
- **Production**: upload the `.glb` files to a CDN/bucket and set `VITE_ASSET_BASE_URL` (see `.env.example`) to that base URL — every model request resolves there instead.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — typecheck + production build
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally
