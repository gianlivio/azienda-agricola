import * as THREE from "three";
import type { Aspetto, Azione } from "@/content/azienda";

/*
 * Le persone della visita: un corpo modellato (busto a sezioni, come nel portfolio), articolato
 * (spalle, gomiti, polsi, anche, ginocchia, collo), con il viso (occhi che sbattono, sopracciglia, naso,
 * bocca che parla, orecchie), capelli, barba, cappello, vestiti.
 * Coordinate della figura: guarda verso +z, la sua destra è −x, i piedi a y = 0; costruita per 1,75 m
 * e poi portata all'altezza dell'aspetto.
 */

/* ------------------------------------------------------------------ loft (dal portfolio) */

type Anello = { z: number; y?: number; x?: number; l: number; su: number; giu?: number; n?: number };
type Pieno = { z: number; y: number; x: number; l: number; su: number; giu: number; n: number };
const pieno = (a: Anello): Pieno => ({ z: a.z, y: a.y ?? 0, x: a.x ?? 0, l: a.l, su: a.su, giu: a.giu ?? a.su, n: a.n ?? 2 });
const catmull = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);

/** Superficie chiusa per anelli perpendicolari a z, interpolati; colore(k, angolo, punto) per vertice. */
function loft(anelli: Anello[], radiali: number, passi: number, colore: (k: number, ang: number, p: THREE.Vector3) => THREE.Color) {
  const A = anelli.map(pieno);
  const chiavi = ["z", "y", "x", "l", "su", "giu", "n"] as const;
  const R: Pieno[] = [];
  for (let i = 0; i < A.length - 1; i++) {
    const p0 = A[Math.max(0, i - 1)], p1 = A[i], p2 = A[i + 1], p3 = A[Math.min(A.length - 1, i + 2)];
    for (let s = 0; s < passi; s++) {
      const r = {} as Pieno;
      chiavi.forEach((c) => (r[c] = catmull(p0[c], p1[c], p2[c], p3[c], s / passi)));
      R.push(r);
    }
  }
  R.push(A[A.length - 1]);
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const p = new THREE.Vector3();
  R.forEach((r, j) => {
    const k = j / (R.length - 1);
    for (let a = 0; a < radiali; a++) {
      const ang = (a / radiali) * Math.PI * 2;
      const c = Math.cos(ang), s = Math.sin(ang), e = 2 / r.n;
      p.set(r.x + r.l * Math.sign(c) * Math.pow(Math.abs(c), e), r.y + (s >= 0 ? r.su : r.giu) * Math.sign(s) * Math.pow(Math.abs(s), e), r.z);
      pos.push(p.x, p.y, p.z);
      const cc = colore(k, ang, p);
      col.push(cc.r, cc.g, cc.b);
    }
  });
  const t0 = R.length * radiali;
  pos.push(R[0].x, R[0].y, R[0].z, R[R.length - 1].x, R[R.length - 1].y, R[R.length - 1].z);
  const c0 = colore(0, 0, p.set(0, 0, R[0].z)), c1 = colore(1, 0, p.set(0, 0, R[R.length - 1].z));
  col.push(c0.r, c0.g, c0.b, c1.r, c1.g, c1.b);
  for (let j = 0; j < R.length - 1; j++)
    for (let a = 0; a < radiali; a++) {
      const b = (a + 1) % radiali;
      const i0 = j * radiali + a, i1 = j * radiali + b, i2 = (j + 1) * radiali + a, i3 = (j + 1) * radiali + b;
      idx.push(i0, i1, i2, i1, i3, i2);
    }
  for (let a = 0; a < radiali; a++) {
    const b = (a + 1) % radiali, o = (R.length - 1) * radiali;
    idx.push(t0, b, a, t0 + 1, o + a, o + b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  // gli anelli sono lungo z: si mette in piedi (z → y); il lato "giu" degli anelli va davanti (+z)
  g.rotateX(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ materiali */

const materiali = new Map<string, THREE.Material>();
function mat(colore: string, ruvido = 0.82, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const k = `${colore}|${ruvido}|${JSON.stringify(extra)}`;
  let m = materiali.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: colore, roughness: ruvido, ...extra });
    materiali.set(k, m);
  }
  return m;
}
const vertici = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 });

function mesh(g: THREE.BufferGeometry, m: THREE.Material, ombra = true) {
  const x = new THREE.Mesh(g, m);
  x.castShadow = ombra;
  return x;
}

/* ------------------------------------------------------------------ la persona */

export class Persona {
  radice = new THREE.Group();
  private corpo = new THREE.Group();
  private bacino = new THREE.Group();
  private busto = new THREE.Group();
  private testa = new THREE.Group();
  private occhi: THREE.Group[] = [];
  private bocca!: THREE.Mesh;
  private spalle: THREE.Group[] = []; // [destra, sinistra]
  private gomiti: THREE.Group[] = [];
  private mani: THREE.Group[] = [];
  private anche: THREE.Group[] = [];
  private ginocchia: THREE.Group[] = [];
  private prossimoBattito = 2 + Math.random() * 3;
  private fase = Math.random() * 10;
  /** l'asta dell'abbacchiatore, in mano destra */
  asta: THREE.Object3D | null = null;
  /** dove guarda la testa, rispetto al corpo (radianti) */
  sguardo = 0;

  constructor(private a: Aspetto) {
    const s = (a.altezza ?? 1.75) / 1.75;
    this.corpo.scale.setScalar(s);
    this.radice.add(this.corpo);
    this.bacino.position.y = 0.93;
    this.corpo.add(this.bacino);
    this.bacino.add(this.busto);
    this.costruisciBusto();
    this.costruisciTesta();
    this.costruisciBraccia();
    this.costruisciGambe();
  }

  private costruisciBusto() {
    const a = this.a, c = a.corpo ?? 1;
    const maglia = new THREE.Color(a.maglia.colore), calzoni = new THREE.Color(a.pantaloni), cinta = new THREE.Color("#2A2420");
    const gilet = a.gilet ? new THREE.Color(a.gilet) : null, pelle = new THREE.Color(a.pelle);
    const g = loft(
      [
        { z: -0.02, l: 0.17 * c, su: 0.1 * c },
        { z: 0.07, l: 0.172 * c, su: 0.102 * c },
        { z: 0.16, l: 0.162 * c, su: 0.096 * c, giu: 0.104 * c },
        { z: 0.3, l: 0.188 * c, su: 0.104 * c, giu: 0.12 * c, y: -0.004 },
        { z: 0.41, l: 0.218 * c, su: 0.106, giu: 0.104 },
        { z: 0.475, l: 0.2 * c, su: 0.092, giu: 0.08 },
        { z: 0.525, l: 0.11, su: 0.064, giu: 0.06 },
        { z: 0.56, l: 0.055, su: 0.048, giu: 0.048 },
      ],
      22,
      4,
      (_k, ang, p) => {
        const h = p.z;
        if (h < 0.075) return calzoni;
        if (h < 0.095) return cinta;
        // lo scollo della maglietta, davanti
        if (h > 0.535 && Math.abs(ang - Math.PI * 1.5) < 0.42 && a.maglia.maniche === "corte") return pelle;
        if (gilet && h > 0.1 && h < 0.5 && !(Math.abs(ang - Math.PI * 1.5) < 0.32)) return gilet;
        return maglia;
      }
    );
    this.busto.add(mesh(g, vertici));
    if (a.grembiule) {
      // il grembiule: un telo curvo davanti, dalla cinta al ginocchio
      const t = new THREE.CylinderGeometry(0.175 * c, 0.2 * c, 0.62, 16, 1, true, -0.9, 1.8);
      t.translate(0, -0.18, 0.005);
      const m = mesh(t, mat(a.grembiule, 0.9, { side: THREE.DoubleSide }));
      m.scale.z = 0.72;
      this.busto.add(m);
      const pettorina = mesh(new THREE.BoxGeometry(0.2, 0.26, 0.01), mat(a.grembiule, 0.9));
      pettorina.position.set(0, 0.3, 0.118 * c);
      pettorina.rotation.x = -0.08;
      this.busto.add(pettorina);
    }
  }

  private costruisciTesta() {
    const a = this.a;
    const pelle = mat(a.pelle, 0.6);
    const capelli = mat(a.capelli.colore, 0.75);
    this.testa.position.set(0, 0.535, 0.005);
    this.busto.add(this.testa);
    // collo
    this.testa.add(mesh(new THREE.CylinderGeometry(0.046, 0.054, 0.1, 12).translate(0, 0.03, 0), pelle));
    const capo = new THREE.Group();
    capo.position.y = 0.165;
    this.testa.add(capo);
    // cranio e mascella
    capo.add(mesh(new THREE.SphereGeometry(0.1, 24, 18).scale(0.88, 1.04, 0.97), pelle));
    capo.add(mesh(new THREE.SphereGeometry(0.072, 18, 12).scale(0.95, 0.82, 0.92).translate(0, -0.05, 0.022), pelle));
    // orecchie
    for (const s of [-1, 1]) capo.add(mesh(new THREE.SphereGeometry(0.024, 10, 8).scale(0.4, 1, 0.7).translate(s * 0.087, -0.005, -0.004), pelle));
    // occhi: il bianco e l'iride, in un gruppo che si schiaccia quando sbattono
    for (const s of [-1, 1]) {
      const o = new THREE.Group();
      o.position.set(s * 0.034, 0.012, 0.081);
      o.add(mesh(new THREE.SphereGeometry(0.0135, 12, 10), mat("#F4EFE6", 0.4), false));
      const iride = mesh(new THREE.SphereGeometry(0.0078, 10, 8), mat("#2A1C12", 0.3), false);
      iride.position.z = 0.0095;
      o.add(iride);
      capo.add(o);
      this.occhi.push(o);
      // sopracciglio
      const ciglio = mesh(new THREE.BoxGeometry(0.032, 0.0075, 0.009), capelli, false);
      ciglio.position.set(s * 0.035, 0.038, 0.088);
      ciglio.rotation.z = s * -0.12;
      capo.add(ciglio);
    }
    // naso
    const naso = mesh(new THREE.ConeGeometry(0.0125, 0.036, 8).rotateX(Math.PI / 2 + 0.25), pelle, false);
    naso.position.set(0, -0.008, 0.099);
    capo.add(naso);
    // bocca: un sorriso (arco) e l'interno scuro, che si apre quando parla
    const sorriso = mesh(new THREE.TorusGeometry(0.018, 0.003, 5, 12, Math.PI).rotateZ(Math.PI).scale(1, 0.45, 1), mat("#A05A4C", 0.5), false);
    sorriso.position.set(0, -0.036, this.a.barba ? 0.1 : 0.093);
    sorriso.rotation.x = -0.25;
    capo.add(sorriso);
    this.bocca = mesh(new THREE.SphereGeometry(0.012, 10, 6).scale(1.3, 0.25, 0.5), mat("#3A1A16", 0.5), false);
    this.bocca.position.set(0, -0.047, this.a.barba ? 0.099 : 0.092);
    capo.add(this.bocca);

    // capelli
    const st = a.capelli.stile;
    if (st !== "rasati" || !a.cappello) {
      const spessore = st === "rasati" || st === "raccolti" ? 0.1025 : 0.106;
      // la calotta inclinata all'indietro: la fronte resta scoperta, la nuca coperta
      const calotta = mesh(new THREE.SphereGeometry(spessore, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52).scale(0.92, 1.06, 1.02), capelli);
      calotta.rotation.x = -0.58;
      calotta.position.set(0, 0.006, -0.004);
      capo.add(calotta);
      // la nuca, coperta fin sotto le orecchie
      const nuca = mesh(new THREE.SphereGeometry(spessore - 0.002, 20, 10, Math.PI * 1.05, Math.PI * 0.9, Math.PI * 0.3, Math.PI * 0.42).scale(0.92, 1.04, 1.0), capelli);
      capo.add(nuca);
      if (st === "raccolti") {
        // tirati indietro, con il chignon basso sulla nuca e qualche ciocca mossa
        const chignon = mesh(new THREE.SphereGeometry(0.038, 14, 10).scale(1, 0.85, 0.9), capelli);
        chignon.position.set(0, 0.0, -0.118);
        capo.add(chignon);
        const nodo = mesh(new THREE.TorusGeometry(0.022, 0.007, 6, 12), mat("#111", 0.6));
        nodo.position.set(0, 0.0, -0.096);
        capo.add(nodo);
        for (const s of [-1, 1]) {
          const ciocca = mesh(new THREE.CapsuleGeometry(0.012, 0.04, 3, 6), capelli);
          ciocca.position.set(s * 0.083, 0.035, 0.03);
          ciocca.rotation.set(0.4, 0, s * 0.35);
          capo.add(ciocca);
        }
      }
      if (st === "coda") {
        const coda = mesh(new THREE.CapsuleGeometry(0.026, 0.17, 4, 10), capelli);
        coda.position.set(0, -0.08, -0.115);
        coda.rotation.x = 0.25;
        capo.add(coda);
        const elastico = mesh(new THREE.TorusGeometry(0.024, 0.007, 6, 12).rotateX(Math.PI / 2), mat("#C64A3A", 0.6));
        elastico.position.set(0, 0.01, -0.105);
        capo.add(elastico);
      }
    }
    // barba: segue la mascella e le guance, sotto gli zigomi; baffi sottili
    if (a.barba === "corta" || a.barba === "lunga") {
      const lunga = a.barba === "lunga";
      const peliBarba = mat(a.capelli.colore, 0.95);
      const mascella = mesh(new THREE.SphereGeometry(0.0745, 18, 12, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65).scale(0.97, lunga ? 1.05 : 0.86, 0.95), peliBarba);
      mascella.position.set(0, lunga ? -0.056 : -0.05, 0.022);
      capo.add(mascella);
      const guance = mesh(new THREE.SphereGeometry(0.1015, 22, 8, Math.PI * 0.08, Math.PI * 0.84, Math.PI * 0.64, Math.PI * 0.22).scale(0.89, 1.04, 0.98), peliBarba);
      capo.add(guance);
    }
    if (a.barba) {
      const baffi = mesh(new THREE.CapsuleGeometry(0.0048, 0.03, 3, 6).rotateZ(Math.PI / 2), mat(a.capelli.colore, 0.95), false);
      baffi.position.set(0, -0.026, a.barba === "baffi" ? 0.095 : 0.1);
      baffi.rotation.x = -0.15;
      capo.add(baffi);
    }
    // cappello
    if (a.cappello) {
      const m = mat(a.cappello.colore, a.cappello.tipo === "paglia" ? 0.95 : 0.8);
      const k = new THREE.Group();
      k.position.set(0, 0.06, -0.005);
      k.rotation.x = 0.1;
      if (a.cappello.tipo === "coppola") {
        k.add(mesh(new THREE.CylinderGeometry(0.105, 0.11, 0.05, 20).scale(1, 1, 1.08).translate(0, 0.025, 0.006), m));
        k.add(mesh(new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.3).scale(1.04, 0.5, 1.12).translate(0, 0.022, 0.02), m));
        k.add(mesh(new THREE.BoxGeometry(0.15, 0.01, 0.07).translate(0, 0.012, 0.11), m));
      } else if (a.cappello.tipo === "paglia") {
        k.add(mesh(new THREE.CylinderGeometry(0.095, 0.105, 0.085, 20).translate(0, 0.045, 0), m));
        k.add(mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.008, 28).translate(0, 0.006, 0), m));
        k.add(mesh(new THREE.CylinderGeometry(0.106, 0.106, 0.02, 20).translate(0, 0.018, 0), mat("#5A3A22")));
      } else {
        k.add(mesh(new THREE.SphereGeometry(0.108, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(0.95, 0.75, 1.02), m));
        k.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.008, 18, 1, false, -Math.PI / 2, Math.PI).scale(1, 1, 1.3).translate(0, 0.0, 0.09), m));
      }
      capo.add(k);
    }
  }

  private costruisciBraccia() {
    const a = this.a, c = a.corpo ?? 1;
    const pelle = mat(a.pelle, 0.6);
    const maglia = mat(a.maglia.colore);
    const corte = a.maglia.maniche === "corte";
    const giacca = a.gilet ? mat(a.gilet) : maglia;
    for (const s of [-1, 1]) {
      const spalla = new THREE.Group();
      spalla.position.set(s * 0.205 * c, 0.44, -0.008);
      // la spalla arrotondata, del colore della maglia (o del gilet)
      spalla.add(mesh(new THREE.SphereGeometry(0.066 * c, 12, 10), giacca));
      spalla.add(mesh(new THREE.CylinderGeometry(0.054 * c, 0.044, 0.29, 10).translate(0, -0.145, 0), corte ? pelle : maglia));
      if (corte) spalla.add(mesh(new THREE.CylinderGeometry(0.068 * c, 0.062 * c, 0.15, 12).translate(0, -0.07, 0), maglia));
      const gomito = new THREE.Group();
      gomito.position.y = -0.29;
      gomito.add(mesh(new THREE.SphereGeometry(0.044, 10, 8), corte ? pelle : maglia));
      gomito.add(mesh(new THREE.CylinderGeometry(0.043, 0.032, 0.25, 10).translate(0, -0.125, 0), corte ? pelle : maglia));
      if (!corte) gomito.add(mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.02, 10).translate(0, -0.235, 0), pelle));
      if (a.braccialetto && s === -1) {
        const b = mesh(new THREE.TorusGeometry(0.036, 0.006, 6, 16).rotateX(Math.PI / 2), mat(a.braccialetto, 0.7), false);
        b.position.y = -0.22;
        gomito.add(b);
      }
      const mano = new THREE.Group();
      mano.position.y = -0.255;
      mano.add(mesh(new THREE.SphereGeometry(0.042, 10, 8).scale(0.75, 1.3, 0.45).translate(0, -0.045, 0), pelle));
      const pollice = mesh(new THREE.CapsuleGeometry(0.01, 0.03, 3, 6), pelle, false);
      pollice.position.set(-s * 0.018, -0.03, 0.018);
      pollice.rotation.set(0.4, 0, -s * 0.5);
      mano.add(pollice);
      gomito.add(mano);
      spalla.add(gomito);
      this.busto.add(spalla);
      this.spalle.push(spalla);
      this.gomiti.push(gomito);
      this.mani.push(mano);
    }
  }

  private costruisciGambe() {
    const a = this.a;
    const calzoni = mat(a.pantaloni);
    const scarpe = mat(a.scarpe, 0.7);
    for (const s of [-1, 1]) {
      const anca = new THREE.Group();
      anca.position.set(s * 0.095, 0.0, 0);
      anca.add(mesh(new THREE.CylinderGeometry(0.086, 0.062, 0.45, 12).translate(0, -0.225, 0), calzoni));
      const ginocchio = new THREE.Group();
      ginocchio.position.y = -0.45;
      ginocchio.add(mesh(new THREE.SphereGeometry(0.062, 10, 8), calzoni));
      ginocchio.add(mesh(new THREE.CylinderGeometry(0.06, 0.047, 0.42, 12).translate(0, -0.21, 0), calzoni));
      // la scarpa: punta arrotondata, suola chiara
      const scarpa = new THREE.Group();
      scarpa.position.y = -0.43;
      scarpa.add(mesh(new THREE.CapsuleGeometry(0.045, 0.15, 4, 10).rotateX(Math.PI / 2).scale(1, 0.75, 1).translate(0, -0.025, 0.045), scarpe));
      scarpa.add(mesh(new THREE.BoxGeometry(0.095, 0.018, 0.25).translate(0, -0.052, 0.045), mat("#D8D2C4", 0.9)));
      ginocchio.add(scarpa);
      anca.add(ginocchio);
      this.bacino.add(anca);
      this.anche.push(anca);
      this.ginocchia.push(ginocchio);
    }
  }

  /** Mette in mano destra un'asta lunga (abbacchiatore). */
  conAsta() {
    if (this.asta) return;
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 2.6, 6).translate(0, 0.9, 0), mat("#C9B48A", 0.8)));
    // il pettine in cima
    for (let i = 0; i < 5; i++) g.add(mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.16, 4).rotateZ(Math.PI / 2).translate(0, 2.18 + i * 0.03, 0), mat("#E8C23A", 0.6), false));
    g.position.y = -0.05;
    g.rotation.x = Math.PI;
    this.mani[0].add(g);
    this.asta = g;
  }

  /**
   * Un fotogramma: t è il tempo, dt il passo. parla apre la bocca e muove le mani; saluta alza la destra.
   */
  aggiorna(t: number, dt: number, azione: Azione, parla: boolean, saluta: boolean) {
    const T = t + this.fase;
    const k = 1 - Math.exp(-6 * dt);
    const verso = (o: THREE.Object3D, x: number, y: number, z: number) => {
      o.rotation.x += (x - o.rotation.x) * k;
      o.rotation.y += (y - o.rotation.y) * k;
      o.rotation.z += (z - o.rotation.z) * k;
    };
    const [sd, ss] = this.spalle, [gd, gs] = this.gomiti, [ad, as] = this.anche, [kd, ks] = this.ginocchia;
    // respiro e peso che passa da una gamba all'altra
    const respiro = Math.sin(T * 1.7);
    this.busto.scale.set(1 + respiro * 0.006, 1, 1 + respiro * 0.01);
    const peso = Math.sin(T * 0.45);
    this.bacino.position.x = peso * 0.012;
    this.bacino.rotation.z = peso * 0.02;
    let chino = 0.02, piega = 0;
    // braccia: a riposo, appena piegate e in movimento lento
    let d: [number, number, number] = [Math.sin(T * 1.1) * 0.04, 0, -0.06];
    let s: [number, number, number] = [Math.sin(T * 1.1 + 1) * 0.04, 0, 0.06];
    let gD = -0.16, gS = -0.16;
    if (azione === "raccoglie") {
      chino = 0.32;
      piega = 0.18;
      const r = Math.sin(T * 1.6);
      d = [-1.05 + r * 0.25, 0.2, -0.15];
      gD = -0.5 - Math.max(0, r) * 0.4;
      s = [-0.45, 0, 0.12];
      gS = -1.3;
    } else if (azione === "abbacchia") {
      const r = Math.sin(T * 4.4);
      chino = -0.12;
      d = [-2.55 + r * 0.22, 0, -0.1];
      s = [-2.35 + r * 0.22, 0, 0.32];
      gD = -0.25;
      gS = -0.55;
    } else if (azione === "lavora") {
      chino = 0.14;
      const r = Math.sin(T * 1.3);
      d = [-0.65 + r * 0.12, 0.15, -0.1];
      s = [-0.6 - r * 0.12, -0.15, 0.1];
      gD = -0.9;
      gS = -0.95;
    }
    if (parla) {
      // gesti a mani aperte mentre spiega
      chino = Math.min(chino, 0.05);
      piega = 0;
      d = [-0.45 + Math.sin(T * 2.2) * 0.18, 0.1, -0.22 + Math.sin(T * 1.3) * 0.08];
      gD = -1.15 + Math.sin(T * 3.1) * 0.25;
      s = [-0.2 + Math.sin(T * 1.7 + 2) * 0.12, 0, 0.12];
      gS = -0.5 + Math.sin(T * 2.6) * 0.2;
    }
    if (saluta) {
      d = [-0.15, 0, -2.75];
      gD = -0.35 + Math.sin(T * 9) * 0.35;
    }
    verso(sd, d[0], d[1], d[2]);
    verso(ss, s[0], s[1], s[2]);
    gd.rotation.x += (gD - gd.rotation.x) * k;
    gs.rotation.x += (gS - gs.rotation.x) * k;
    this.busto.rotation.x += (chino - this.busto.rotation.x) * k;
    // con il busto chino le ginocchia si piegano un poco
    verso(ad, -piega, 0, 0);
    verso(as, -piega, 0, 0);
    kd.rotation.x += (piega * 1.6 - kd.rotation.x) * k;
    ks.rotation.x += (piega * 1.6 - ks.rotation.x) * k;
    this.bacino.position.y = 0.93 - piega * 0.12;
    // testa: segue lo sguardo, annuisce quando parla
    const annuisce = parla ? Math.sin(T * 4.2) * 0.07 : azione === "abbacchia" ? -0.35 : azione === "raccoglie" ? 0.2 : Math.sin(T * 0.6) * 0.03;
    verso(this.testa, annuisce - chino * 0.6, THREE.MathUtils.clamp(this.sguardo, -0.9, 0.9), parla ? Math.sin(T * 1.4) * 0.05 : 0);
    // la bocca
    const apre = parla ? 0.25 + Math.abs(Math.sin(T * 11)) * Math.abs(Math.sin(T * 3.7)) * 2.2 : 0.25;
    this.bocca.scale.y += (apre - this.bocca.scale.y) * 0.5;
    // le palpebre: un battito ogni qualche secondo
    this.prossimoBattito -= dt;
    let chiusi = 1;
    if (this.prossimoBattito < 0.12) chiusi = 0.1;
    if (this.prossimoBattito < 0) this.prossimoBattito = 2.5 + Math.random() * 3.5;
    this.occhi.forEach((o) => (o.scale.y = chiusi));
  }
}
