// The character GLB files are large (20-140MB each) and live outside the git
// repo — see README for why. In dev they're served from public/ as normal.
// For production, set VITE_ASSET_BASE_URL to wherever they're hosted (a CDN
// bucket, GitHub Release, etc.) and every model URL below resolves there.
const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL ?? '';

export function assetUrl(path: string): string {
  return `${ASSET_BASE_URL}${path}`;
}
