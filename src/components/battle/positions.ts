// Shared arena layout: hero and enemy sit on the same Z line facing each
// other along X, so the side-on camera reads as a clean "versus" profile shot.
export const HERO_POS: [number, number, number] = [-2.15, 0, 0];
export const ENEMY_POS: [number, number, number] = [2.15, 0, 0];
export const HERO_FACING = Math.PI / 2;
export const ENEMY_FACING = -Math.PI / 2;
export const IMPACT_HEIGHT = 1.3;
