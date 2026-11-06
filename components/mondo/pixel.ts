import * as THREE from "three";
import type { Aspetto } from "@/content/azienda";

/*
 * Le persone in pixel art, come nei giochi a 16 bit: figure piatte, sempre rivolte verso chi guarda,
 * disegnate pixel per pixel su una tela di 32 × 80 e animate a fotogrammi (respiro, occhi che sbattono,
 * bocca che parla, gesti, saluto, raccolta, abbacchiatura).
 * La figura occupa le righe da Y0 in giù (53 righe dalla cima della testa alla suola); sopra resta
 * spazio per le braccia alzate e per l'asta dell'abbacchiatore.
 */

export const L = 32;
export const H = 80;
export const Y0 = 26;
/** righe della figura, dalla cima dei capelli alla suola */
export const RIGHE = 53;

export type Posa = "fermo" | "parla" | "saluta" | "raccoglie" | "abbacchia" | "lavora";
export type Fotogramma = { posa: Posa; f: 0 | 1; chiusi: boolean; bocca: boolean };

type Px = string | null;

const CONTORNO = "#1E1612";

function scurisci(hex: string, k: number) {
  const c = new THREE.Color(hex);
  c.multiplyScalar(k);
  return `#${c.getHexString()}`;
}
function schiarisci(hex: string, k: number) {
  const c = new THREE.Color(hex).lerp(new THREE.Color("#FFFFFF"), k);
  return `#${c.getHexString()}`;
}

class Griglia {
  px: Px[] = new Array(L * H).fill(null);
  /** quanto si abbassa la parte alta del corpo (respiro) */
  su = 0;
  set(x: number, r: number, c: string, alto = true) {
    const y = Y0 + r + (alto ? this.su : 0);
    if (x < 0 || x >= L || y < 0 || y >= H) return;
    this.px[y * L + x] = c;
  }
  rett(x0: number, x1: number, r0: number, r1: number, c: string, alto = true) {
    for (let r = r0; r <= r1; r++) for (let x = x0; x <= x1; x++) this.set(x, r, c, alto);
  }
  /** una linea spessa n pixel, da (x0, r0) a (x1, r1) */
  linea(x0: number, r0: number, x1: number, r1: number, c: string, n = 2, alto = true) {
    const passi = Math.max(Math.abs(x1 - x0), Math.abs(r1 - r0), 1);
    for (let i = 0; i <= passi; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / passi), r = Math.round(r0 + ((r1 - r0) * i) / passi);
      for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) this.set(x + a - Math.floor(n / 2), r + b - Math.floor(n / 2), c, alto);
    }
  }
}

/** Disegna un fotogramma della persona e lo restituisce come tela. */
export function disegna(a: Aspetto, fg: Fotogramma): HTMLCanvasElement {
  const g = new Griglia();
  const pelle = a.pelle, pelleScura = scurisci(a.pelle, 0.82);
  const cap = a.capelli.colore, capChiaro = `#${new THREE.Color(a.capelli.colore).lerp(new THREE.Color("#9A6A44"), 0.45).getHexString()}`;
  const maglia = a.maglia.colore, magliaScura = scurisci(a.maglia.colore, 0.78);
  const calzoni = a.pantaloni, calzoniScuri = scurisci(a.pantaloni, 0.78);
  const corte = a.maglia.maniche === "corte";
  const largo = (a.corpo ?? 1) > 1.05 ? 1 : 0;
  g.su = fg.f && (fg.posa === "fermo" || fg.posa === "parla") ? 1 : 0;

  /* --- gambe e scarpe (non respirano) --- */
  g.rett(9 - largo, 22 + largo, 33, 36, calzoni, false);
  const passo = fg.posa === "raccoglie" ? 1 : 0;
  g.rett(10 - largo, 14, 37, 49 - passo, calzoni, false);
  g.rett(17, 21 + largo, 37, 49, calzoni, false);
  g.rett(14, 14, 37, 49 - passo, calzoniScuri, false);
  g.rett(21 + largo, 21 + largo, 37, 49, calzoniScuri, false);
  g.rett(9 - largo, 14, 50 - passo, 51 - passo, a.scarpe, false);
  g.rett(17, 22 + largo, 50, 51, a.scarpe, false);
  g.rett(9 - largo, 14, 52 - passo, 52 - passo, "#D8D2C4", false);
  g.rett(17, 22 + largo, 52, 52, "#D8D2C4", false);

  /* --- busto --- */
  g.rett(10 - largo, 21 + largo, 18, 18, maglia);
  g.rett(9 - largo, 22 + largo, 19, 31, maglia);
  g.rett(20 + largo, 22 + largo, 20, 31, magliaScura);
  if (corte) {
    g.rett(14, 17, 18, 18, pelle);
    g.rett(15, 16, 19, 19, pelle);
  } else {
    g.rett(14, 17, 18, 18, magliaScura);
  }
  if (a.gilet) {
    g.rett(9 - largo, 12, 19, 31, a.gilet);
    g.rett(19, 22 + largo, 19, 31, a.gilet);
    g.rett(13, 13, 21, 25, scurisci(a.gilet, 0.8));
  }
  g.rett(9 - largo, 22 + largo, 32, 32, "#2A2420");
  g.rett(15, 16, 32, 32, "#B8A060");
  if (a.grembiule) {
    g.rett(13, 18, 19, 22, a.grembiule);
    g.set(12, 18, a.grembiule);
    g.set(19, 18, a.grembiule);
    g.rett(11, 20, 23, 31, a.grembiule);
    g.rett(11, 20, 32, 44, a.grembiule, false);
    g.rett(20, 20, 23, 31, scurisci(a.grembiule, 0.85));
    g.rett(20, 20, 32, 44, scurisci(a.grembiule, 0.85), false);
    g.rett(14, 17, 27, 29, scurisci(a.grembiule, 0.9));
  }

  /* --- collo e testa --- */
  g.rett(14, 17, 16, 17, pelleScura);
  g.rett(10, 21, 3, 14, pelle);
  g.rett(11, 20, 2, 2, pelle);
  g.rett(11, 20, 15, 15, pelle);
  g.rett(12, 19, 16, 16, pelle);
  g.rett(20, 21, 4, 14, pelleScura);
  // orecchie
  g.rett(9, 9, 8, 10, pelle);
  g.rett(22, 22, 8, 10, pelleScura);
  // occhi
  if (fg.chiusi) {
    g.rett(12, 13, 9, 9, "#2A1C12");
    g.rett(18, 19, 9, 9, "#2A1C12");
  } else {
    g.rett(12, 13, 8, 9, "#F4EFE6");
    g.rett(18, 19, 8, 9, "#F4EFE6");
    g.rett(13, 13, 8, 9, "#2A1C12");
    g.rett(18, 18, 8, 9, "#2A1C12");
  }
  // sopracciglia
  g.rett(12, 14, 6, 6, cap);
  g.rett(17, 19, 6, 6, cap);
  // naso
  g.set(16, 10, pelleScura);
  g.rett(15, 16, 11, 11, pelleScura);
  // guance
  g.set(11, 11, schiarisci("#D07060", 0.35));
  g.set(20, 11, schiarisci("#B06050", 0.35));

  // barba
  if (a.barba === "corta" || a.barba === "lunga") {
    const fino = a.barba === "lunga" ? 18 : 16;
    g.rett(10, 10, 9, 15, cap);
    g.rett(21, 21, 9, 15, cap);
    g.rett(11, 11, 11, 15, cap);
    g.rett(20, 20, 11, 15, cap);
    g.rett(10, 21, 12, 15, cap);
    g.rett(12, 19, 16, fino, cap);
    if (a.barba === "lunga") g.rett(13, 18, 17, 18, cap);
    g.set(12, 15, capChiaro);
    g.set(18, 16, capChiaro);
  }
  if (a.barba) g.rett(13, 18, 12, 12, a.barba === "baffi" ? cap : scurisci(cap, 0.8));
  // bocca: sopra la barba, aperta quando parla
  if (fg.bocca) {
    g.rett(14, 17, 13, 14, "#3A1414");
    g.rett(15, 16, 13, 13, "#E8E0D8");
  } else {
    g.rett(14, 17, 13, 13, "#9A4636");
    g.rett(15, 16, 13, 13, "#B35A48");
    g.set(13, 12, a.barba ? scurisci(cap, 0.8) : "#8A3A30");
    g.set(18, 12, a.barba ? scurisci(cap, 0.8) : "#8A3A30");
  }

  // capelli
  const st = a.capelli.stile;
  if (st === "rasati") {
    g.rett(11, 20, 2, 3, scurisci(pelle, 0.7));
  } else {
    g.rett(11, 20, 1, 1, cap);
    g.rett(10, 21, 2, 4, cap);
    g.rett(10, 10, 5, 8, cap);
    g.rett(21, 21, 5, 8, cap);
    g.rett(13, 16, 2, 2, capChiaro);
    g.rett(17, 18, 3, 3, capChiaro);
    if (st === "raccolti") {
      // tirati indietro: le righe del pettine e il chignon che spunta dietro la testa
      g.set(12, 3, capChiaro);
      g.set(15, 3, capChiaro);
      g.set(19, 2, capChiaro);
      g.rett(21, 23, 1, 4, cap);
      g.rett(22, 24, 2, 3, cap);
      g.set(23, 2, capChiaro);
      g.rett(20, 20, 4, 5, "#111111");
    }
    if (st === "coda") {
      g.rett(21, 23, 4, 15, cap);
      g.rett(22, 22, 5, 14, capChiaro);
      g.rett(21, 23, 5, 5, "#C64A3A");
    }
  }

  // cappello
  if (a.cappello) {
    const c = a.cappello.colore, cs = scurisci(c, 0.75);
    if (a.cappello.tipo === "coppola") {
      g.rett(9, 22, 0, 3, c);
      g.rett(10, 21, -1, -1, c);
      g.rett(9, 16, 4, 4, cs);
      g.rett(17, 22, 3, 3, cs);
    } else if (a.cappello.tipo === "paglia") {
      g.rett(10, 21, -3, 1, c);
      g.rett(11, 20, -4, -4, c);
      g.rett(10, 21, 1, 1, "#5A3A22");
      g.rett(5, 26, 2, 2, c);
      g.rett(7, 24, 3, 3, cs);
      for (let x = 11; x <= 20; x += 3) g.set(x, -2, cs);
    } else {
      g.rett(10, 21, -1, 3, c);
      g.rett(11, 20, -2, -2, c);
      g.rett(7, 15, 4, 4, cs);
      g.rett(15, 16, -2, -2, cs);
    }
  }

  /* --- braccia --- */
  const manica = maglia, manicaScura = magliaScura;
  const avambraccio = corte ? pelle : maglia;
  // braccio destro della figura (a sinistra per chi guarda), dalla spalla a (8, 19)
  const destro = (tipo: string) => {
    if (tipo === "giu") {
      g.rett(6, 8, 19, 22, manica);
      g.rett(7, 8, 23, 30, avambraccio);
      g.rett(6, 6, 23, 30, corte ? pelleScura : manicaScura);
      g.rett(6, 8, 31, 32, pelle);
      if (a.braccialetto) g.rett(6, 8, 29, 29, a.braccialetto);
    } else if (tipo === "gesto") {
      g.rett(6, 8, 19, 22, manica);
      g.rett(6, 8, 23, 25, avambraccio);
      const h = fg.f ? 20 : 22;
      g.linea(8, 25, 10, h + 1, avambraccio, 2);
      g.rett(10, 12, h - 1, h, pelle);
      if (a.braccialetto) g.rett(9, 10, h + 2, h + 2, a.braccialetto);
    } else if (tipo === "saluta") {
      const dx = fg.f ? 1 : 0;
      g.linea(8, 19, 6 - dx, 12, manica, 3);
      g.linea(6 - dx, 12, 4 - dx * 2, 5, avambraccio, 2);
      g.rett(3 - dx * 2, 5 - dx * 2, 2, 4, pelle);
      if (a.braccialetto) g.rett(4 - dx * 2, 5 - dx * 2, 6, 6, a.braccialetto);
    } else if (tipo === "avanti") {
      const h = fg.f ? 29 : 27;
      g.linea(8, 19, 5, 23, manica, 3);
      g.linea(5, 23, 1, h, avambraccio, 2);
      g.rett(0, 2, h, h + 1, pelle);
    } else if (tipo === "su") {
      g.linea(8, 19, 11, 9, manica, 3);
      g.linea(11, 9, 14, 1 - fg.f * 2, avambraccio, 2);
      g.rett(13, 15, -1 - fg.f * 2, 0 - fg.f * 2, pelle);
    } else if (tipo === "lavora") {
      g.rett(6, 8, 19, 23, manica);
      g.linea(7, 24, 10, 27 - fg.f, avambraccio, 2);
      g.rett(10, 12, 26 - fg.f, 27 - fg.f, pelle);
    }
  };
  // braccio sinistro della figura (a destra per chi guarda), dalla spalla a (23, 19)
  const sinistro = (tipo: string) => {
    if (tipo === "giu") {
      g.rett(23, 25, 19, 22, manicaScura);
      g.rett(23, 24, 23, 30, corte ? pelleScura : manicaScura);
      g.rett(25, 25, 23, 30, corte ? scurisci(pelle, 0.7) : scurisci(maglia, 0.65));
      g.rett(23, 25, 31, 32, pelleScura);
    } else if (tipo === "gesto") {
      g.rett(23, 25, 19, 22, manicaScura);
      const h = fg.f ? 27 : 25;
      g.linea(24, 23, 22, h, corte ? pelleScura : manicaScura, 2);
      g.rett(20, 22, h, h + 1, pelleScura);
    } else if (tipo === "cesto") {
      g.rett(23, 25, 19, 22, manicaScura);
      g.rett(23, 24, 23, 29, corte ? pelleScura : manicaScura);
      g.rett(23, 25, 30, 31, pelleScura);
      // la cesta
      g.rett(23, 30, 31, 35, "#A87A44");
      g.rett(24, 29, 31, 31, "#2F3C70");
      g.set(25, 30, "#3A4A86");
      g.set(27, 30, "#2F3C70");
      for (let x = 23; x <= 30; x += 2) g.set(x, 33, "#8A6236");
    } else if (tipo === "su") {
      g.linea(23, 19, 20, 9, manicaScura, 3);
      g.linea(20, 9, 17, 1 - fg.f * 2, corte ? pelleScura : manicaScura, 2);
      g.rett(16, 18, -1 - fg.f * 2, 0 - fg.f * 2, pelleScura);
    } else if (tipo === "lavora") {
      g.rett(23, 25, 19, 23, manicaScura);
      g.linea(24, 24, 21, 27 - (1 - fg.f), corte ? pelleScura : manicaScura, 2);
      g.rett(19, 21, 26 - (1 - fg.f), 27 - (1 - fg.f), pelleScura);
    }
  };
  const p = fg.posa;
  if (p === "parla") {
    destro("gesto");
    sinistro(fg.f ? "gesto" : "giu");
  } else if (p === "saluta") {
    destro("saluta");
    sinistro("giu");
  } else if (p === "raccoglie") {
    destro("avanti");
    sinistro("cesto");
  } else if (p === "abbacchia") {
    destro("su");
    sinistro("su");
    // l'asta, tenuta con due mani, e il pettine in cima
    const y = -1 - fg.f * 2;
    for (let r = y + 1; r >= -Y0 + 2; r--) g.set(15, r, "#C9B48A");
    for (let r = y + 1; r >= -Y0 + 2; r--) g.set(16, r, "#A8925E");
    g.rett(12, 19, -Y0 + 1, -Y0 + 2, "#E8C23A");
    for (let x = 12; x <= 19; x += 2) g.set(x, -Y0 + 3, "#E8C23A");
  } else if (p === "lavora") {
    destro("lavora");
    sinistro("lavora");
  } else {
    destro("giu");
    sinistro("giu");
  }

  /* --- contorno: ogni pixel vuoto accanto a uno pieno diventa scuro --- */
  const pieno = g.px.slice();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < L; x++) {
      if (pieno[y * L + x]) continue;
      const vicino =
        (x > 0 && pieno[y * L + x - 1]) || (x < L - 1 && pieno[y * L + x + 1]) || (y > 0 && pieno[(y - 1) * L + x]) || (y < H - 1 && pieno[(y + 1) * L + x]);
      if (vicino) g.px[y * L + x] = CONTORNO;
    }

  const tela = document.createElement("canvas");
  tela.width = L;
  tela.height = H;
  const c = tela.getContext("2d") as CanvasRenderingContext2D;
  g.px.forEach((col, i) => {
    if (!col) return;
    c.fillStyle = col;
    c.fillRect(i % L, Math.floor(i / L), 1, 1);
  });
  return tela;
}

/** Tutti i fotogrammi che servono a una persona, come texture nitide (senza sfocature). */
export class Fotogrammi {
  private cache = new Map<string, THREE.CanvasTexture>();
  constructor(private a: Aspetto) {}
  prendi(fg: Fotogramma) {
    const k = `${fg.posa}|${fg.f}|${fg.chiusi}|${fg.bocca}`;
    let t = this.cache.get(k);
    if (!t) {
      t = new THREE.CanvasTexture(disegna(this.a, fg));
      t.magFilter = THREE.NearestFilter;
      t.minFilter = THREE.NearestFilter;
      t.generateMipmaps = false;
      t.colorSpace = THREE.SRGBColorSpace;
      this.cache.set(k, t);
    }
    return t;
  }
}
