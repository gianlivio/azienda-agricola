/*
 * La pianta dell'azienda, ricavata dall'immagine satellitare (scala stimata: circa 0,11 m per pixel
 * dell'immagine ingrandita, dalla larghezza delle campate e della trazzera).
 * Orientamento della scena: chi entra dal cancello guarda verso −z, cioè verso est; +x è la sua destra (sud).
 * L'uliveto e il frantoio stanno altrove: in un'area lontana, a cui si arriva col furgone.
 */

export type P3 = [number, number, number];

/** Il cancello: sulla stradina che dalla trazzera porta allo spiazzale. */
export const CANCELLO_Z = 6;

/**
 * Il capannone multicampata dei frutti di bosco: quattro tunnel affiancati, 67 × 28 m,
 * messo in diagonale rispetto allo spiazzale. Coordinate locali: x lungo il capannone, z attraverso.
 */
export const SERRA = { cx: -15.5, cz: -22.7, angolo: 0.427, lungo: 67, largo: 28, campata: 7 };

/** Da coordinate locali del capannone a coordinate della scena. */
export function inSerra(x: number, y: number, z: number): P3 {
  const c = Math.cos(SERRA.angolo), s = Math.sin(SERRA.angolo);
  return [SERRA.cx + x * c + z * s, y, SERRA.cz - x * s + z * c];
}
/** Da coordinate della scena a coordinate locali del capannone (solo x e z). */
export function dallaSerra(x: number, z: number): [number, number] {
  const c = Math.cos(SERRA.angolo), s = Math.sin(SERRA.angolo);
  const dx = x - SERRA.cx, dz = z - SERRA.cz;
  return [dx * c - dz * s, dx * s + dz * c];
}

/** Il campo di mais: un rettangolo a destra, verso il fondo; i filari corrono verso −z. */
export const MAIS = { x0: 22, x1: 38, z0: -2, z1: -50 };

/** Il laghetto: la vasca d'irrigazione a sinistra dello spiazzale. */
export const LAGHETTO = { x: -16.5, z: 1, l: 10, p: 8.5, r: 0.12 };

/** Le due casette sulla destra dello spiazzale. */
export const CASETTE: { x: number; z: number; l: number; p: number; h: number; r: number; tipo: "pietra" | "intonaco" }[] = [
  { x: 6.2, z: -5.2, l: 6.2, p: 4.6, h: 3.4, r: 0.427, tipo: "pietra" },
  { x: 10.4, z: -10.6, l: 4.6, p: 3.8, h: 2.9, r: 0.427, tipo: "intonaco" },
];

/** Dove sta il trattore per gli uliveti nello spiazzale (col muso verso il cancello), e il suo cartello. */
export const FURGONE_FATTORIA: { p: P3; r: number } = { p: [-5.5, 0, -3], r: 0 };
export const CARTELLO_ULIVETI: P3 = [-2.6, 0, -1.2];

/** L'area degli uliveti e del frantoio, lontana dalla fattoria: tutto ciò che sta lì è spostato di tanto. */
export const ALTROVE: P3 = [0, 0, -420];
export const altrove = (p: P3): P3 => [p[0] + ALTROVE[0], p[1] + ALTROVE[1], p[2] + ALTROVE[2]];

/** Il furgone all'uliveto: si ferma sulla trazzera, all'ingresso (coordinate dell'area lontana). */
export const FURGONE_ULIVETO: { p: P3; r: number } = { p: [14, 0, -16], r: 0 };

/** Le trazzere della fattoria, come spezzate [x, z]. */
export const STRADE_FATTORIA: [number, number][][] = [
  // la trazzera vera, che passa davanti al cancello: da sud (destra) a nord (sinistra), poi verso est
  [[80, 6], [44, 6.5], [16.5, 8], [0, 10], [-8.8, 11], [-22, 13], [-33, 12], [-40.7, 7.7], [-49.5, -4.4], [-53.4, -19.8], [-54.5, -52.8], [-53.4, -108]],
  // dalla trazzera allo spiazzale, attraverso il cancello
  [[0, 10], [0, CANCELLO_Z], [0, 0]],
  // dallo spiazzale alla porta del capannone
  [[-1, -1], [-3, -7], [-9.4, -9.6]],
  // dallo spiazzale al campo di mais
  [[3, 0.5], [12, 1], [21, -1.5]],
];

/** Le trazzere dell'area degli uliveti (coordinate dell'area lontana). */
export const STRADE_ULIVETO: [number, number][][] = [
  [[14, 60], [14, 20], [14, -12], [14, -22], [10, -30], [2, -37], [-8, -39.5], [-14, -40]],
];

/** Lo spiazzale: terra battuta attorno all'origine. */
export const SPIAZZALE = { x: 1.5, z: -1, r: 9 };

/** Gli alberi della fattoria visti dal satellite (carrubi e ulivi sparsi): x, z, grandezza. */
export const ALBERI_FATTORIA: [number, number, number][] = [
  [11, 4.4, 1.35],
  [17.6, -12, 1.0],
  [-48, -60, 1.2],
  [-20, -63, 1.25],
  [-5.5, -54, 1.1],
  [-6.6, -68, 1.15],
  [8.3, -70, 1.3],
  [13, -53, 1.2],
  [18.7, -61.6, 1.0],
  [30.8, -59, 1.25],
  [38.5, -48.4, 1.1],
  // il filare lungo la carrareccia, sul fondo
  [-47, -95, 1.0],
  [-40, -96, 1.05],
  [-33, -96.5, 0.95],
  [-26, -97, 1.0],
  [-19, -97.5, 1.05],
  [-12, -98, 0.95],
  [-5, -99, 1.0],
  // a sud della trazzera
  [-22, 22, 1.2],
  [26, 20, 1.3],
];
