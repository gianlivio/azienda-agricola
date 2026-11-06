"use client";

import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import { generatore, modello, posa, scatola, textura } from "./base";
import { ALTROVE, CANCELLO_Z, CASETTE, LAGHETTO, MAIS, SPIAZZALE, STRADE_FATTORIA, STRADE_ULIVETO, dallaSerra, SERRA } from "@/content/luoghi";

/*
 * La terra rossa, le trazzere, lo spiazzo, i muretti a secco del perimetro, le colline lontane,
 * i sassi e i ciuffi d'erba secca. Tutto in piano, a y = 0.
 * Orientamento: il cancello sta a +z (verso chi arriva), il casale a −z, le serre a −x, il mais a +x,
 * l'uliveto dietro il casale.
 */

const rilievo = new THREE.Vector2(1, 1);

/** La pianta: le trazzere, lo spiazzale, l'area lontana degli uliveti. */
export const TRAZZERE = STRADE_FATTORIA;
export const SPIAZZO = SPIAZZALE;
const TRAZZERE_LONTANE = STRADE_ULIVETO.map((t) => t.map(([x, z]) => [x + ALTROVE[0], z + ALTROVE[2]] as [number, number]));

function nastro(punti: [number, number][], larghezza: number, passo = 3) {
  const curva = new THREE.CatmullRomCurve3(punti.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "catmullrom", 0.3);
  const n = Math.max(2, Math.ceil(curva.getLength() / 1.2));
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  let lungo = 0;
  const prec = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = curva.getPointAt(t);
    const tg = curva.getTangentAt(t);
    const lato = new THREE.Vector3(-tg.z, 0, tg.x).normalize().multiplyScalar(larghezza / 2);
    if (i > 0) lungo += p.distanceTo(prec);
    prec.copy(p);
    pos.push(p.x + lato.x, 0.02, p.z + lato.z, p.x - lato.x, 0.02, p.z - lato.z);
    uv.push(0, lungo / passo, larghezza / passo, lungo / passo);
    if (i < n) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  // la normale verso l'alto, qualunque sia il verso dei triangoli (il materiale è a due facce)
  const nor = new Float32Array((pos.length / 3) * 3);
  for (let i = 0; i < pos.length / 3; i++) nor[i * 3 + 1] = 1;
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  return g;
}

function Terra() {
  const colore = useMemo(() => textura("terra-colore.webp", true, [200, 200]), []);
  const ril = useMemo(() => textura("terra-rilievo.webp", false, [200, 200]), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, ALTROVE[2] / 2]} receiveShadow>
      <planeGeometry args={[900, 900]} />
      <meshLambertMaterial map={colore} normalMap={ril} normalScale={rilievo} color="#F6E6D6" />
    </mesh>
  );
}

function Trazzere() {
  const geos = useMemo(() => [...TRAZZERE, ...TRAZZERE_LONTANE].map((p) => nastro(p, 3.4)), []);
  const mappa = useMemo(() => textura("trazzera-colore.webp", true), []);
  const disco = useMemo(() => {
    const g = new THREE.CircleGeometry(SPIAZZO.r, 48);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 8, uv.getY(i) * 8);
    return g;
  }, []);
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} receiveShadow>
          <meshLambertMaterial map={mappa} color="#F2E2CC" polygonOffset polygonOffsetFactor={-1} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh geometry={disco} rotation-x={-Math.PI / 2} position={[SPIAZZO.x, 0.025, SPIAZZO.z]} receiveShadow>
        <meshLambertMaterial map={mappa} color="#F6E8D4" polygonOffset polygonOffsetFactor={-2} />
      </mesh>
    </group>
  );
}

/** I muretti a secco: segmenti [x1, z1, x2, z2, altezza]. Ai lati del cancello, e attorno all'uliveto lontano. */
const OZ = ALTROVE[2];
const MURETTI: [number, number, number, number, number][] = [
  [-9, CANCELLO_Z, -2.4, CANCELLO_Z, 1.1],
  [2.4, CANCELLO_Z, 9, CANCELLO_Z, 1.1],
  [-60, -26 + OZ, 11.5, -26 + OZ, 0.9],
  [16.5, -26 + OZ, 60, -26 + OZ, 0.9],
  [-60, -26 + OZ, -60, -82 + OZ, 1.0],
  [60, -26 + OZ, 60, -82 + OZ, 1.0],
  [-60, -82 + OZ, 60, -82 + OZ, 1.0],
];

function Muretti() {
  const colore = useMemo(() => textura("muretto-colore.webp", true), []);
  const ril = useMemo(() => textura("muretto-rilievo.webp", false), []);
  const geos = useMemo(
    () =>
      MURETTI.map(([x1, z1, x2, z2, a]) => {
        const l = Math.hypot(x2 - x1, z2 - z1);
        const g = scatola(l, a, 0.6, 1.6);
        g.rotateY(-Math.atan2(z2 - z1, x2 - x1));
        g.translate((x1 + x2) / 2, a / 2, (z1 + z2) / 2);
        return g;
      }),
    []
  );
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} castShadow receiveShadow>
          <meshLambertMaterial map={colore} normalMap={ril} normalScale={rilievo} color="#FFF1DC" />
        </mesh>
      ))}
    </group>
  );
}

/** Le colline iblee all'orizzonte: un anello basso e irregolare, sfumato dalla nebbia. */
function Colline({ centro = [0, 0] as [number, number] }) {
  const geo = useMemo(() => {
    const caso = generatore(77);
    const n = 160;
    const pos: number[] = [];
    const idx: number[] = [];
    const alti: number[] = [];
    for (let i = 0; i <= n; i++) alti.push(8 + caso() * 6);
    // due onde lente sopra il rumore
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const h = alti[i] * 0.4 + 14 * (0.5 + 0.5 * Math.sin(a * 3 + 1)) + 9 * (0.5 + 0.5 * Math.sin(a * 7 + 2));
      const r = 230;
      pos.push(Math.cos(a) * r, -2, Math.sin(a) * r, Math.cos(a) * (r + 30), h, Math.sin(a) * (r + 30));
      if (i < n) {
        const k = i * 2;
        idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} position={[centro[0], 0, centro[1]]}>
      <meshLambertMaterial color="#8C8A63" side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Erba secca e sassi, sparsi lontano dalle trazzere e dalle colture. */
export function vicinoAUnaTrazzera(x: number, z: number, margine: number) {
  if (Math.hypot(x - SPIAZZO.x, z - SPIAZZO.z) < SPIAZZO.r + margine) return true;
  for (const t of [...TRAZZERE, ...TRAZZERE_LONTANE])
    for (let i = 0; i < t.length - 1; i++) {
      const [ax, az] = t[i], [bx, bz] = t[i + 1];
      const dx = bx - ax, dz = bz - az;
      const k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
      if (Math.hypot(x - (ax + k * dx), z - (az + k * dz)) < 1.8 + margine) return true;
    }
  return false;
}
/** Le aree occupate: capannone, casette, laghetto, mais (fattoria); frantoio (area lontana). */
export function occupato(x: number, z: number) {
  const [lx, lz] = dallaSerra(x, z);
  if (Math.abs(lx) < SERRA.lungo / 2 + 2 && Math.abs(lz) < SERRA.largo / 2 + 2) return true;
  for (const c of CASETTE) if (Math.hypot(x - c.x, z - c.z) < Math.max(c.l, c.p) / 2 + 1.5) return true;
  if (Math.abs(x - LAGHETTO.x) < LAGHETTO.l / 2 + 2 && Math.abs(z - LAGHETTO.z) < LAGHETTO.p / 2 + 2) return true;
  if (x > MAIS.x0 - 1 && x < MAIS.x1 + 1 && z < MAIS.z0 + 1 && z > MAIS.z1 - 1) return true;
  if (x > -21 && x < -7 && z > -51 + OZ && z < -38 + OZ) return true; // frantoio
  return false;
}

function Sparsi({ ridotto }: { ridotto: boolean }) {
  const [erba, setErba] = useState<{ geometria: THREE.BufferGeometry; materiale: THREE.Material } | null>(null);
  const [masso, setMasso] = useState<{ geometria: THREE.BufferGeometry; materiale: THREE.Material } | null>(null);
  useEffect(() => {
    let vivo = true;
    modello("erba.glb", 0.45).then((m) => vivo && setErba(m));
    modello("masso.glb", 0.7).then((m) => vivo && setMasso(m));
    return () => {
      vivo = false;
    };
  }, []);
  const posti = useMemo(() => {
    const caso = generatore(311);
    const ciuffi: THREE.Matrix4[] = [];
    const sassi: THREE.Matrix4[] = [];
    const n = ridotto ? 800 : 2000;
    let tentativi = 0;
    while (ciuffi.length < n && tentativi++ < n * 6) {
      // metà nella fattoria, metà nell'area degli uliveti
      const lontano = caso() < 0.5;
      const x = (caso() - 0.5) * 116, z = lontano ? 32 - caso() * 112 + OZ : 30 - caso() * 110;
      if (vicinoAUnaTrazzera(x, z, 0.4) || occupato(x, z)) continue;
      ciuffi.push(posa(x, 0, z, caso() * 6.28, 0.6 + caso() * 0.9));
    }
    for (let i = 0; i < 140; i++) {
      const x = (caso() - 0.5) * 116, z = caso() < 0.5 ? 32 - caso() * 112 + OZ : 30 - caso() * 110;
      if (vicinoAUnaTrazzera(x, z, 0.2) || occupato(x, z)) continue;
      const s = caso() < 0.15 ? 1.4 + caso() * 1.6 : 0.3 + caso() * 0.6;
      sassi.push(posa(x, -0.05, z, caso() * 6.28, [s, s * (0.6 + caso() * 0.5), s]));
    }
    return { ciuffi, sassi };
  }, [ridotto]);
  const materialeErba = useMemo(() => {
    if (!erba) return null;
    const m = (erba.materiale as THREE.MeshStandardMaterial).clone();
    m.alphaTest = 0.4;
    m.transparent = false;
    m.side = THREE.DoubleSide;
    m.color = new THREE.Color("#E6D3A0");
    return m;
  }, [erba]);
  return (
    <group>
      {erba && materialeErba && (
        <instancedMesh
          args={[erba.geometria, materialeErba, posti.ciuffi.length]}
          ref={(m) => {
            if (!m) return;
            posti.ciuffi.forEach((mt, i) => m.setMatrixAt(i, mt));
            m.instanceMatrix.needsUpdate = true;
          }}
          frustumCulled={false}
        />
      )}
      {masso && (
        <instancedMesh
          args={[masso.geometria, masso.materiale, posti.sassi.length]}
          ref={(m) => {
            if (!m) return;
            posti.sassi.forEach((mt, i) => m.setMatrixAt(i, mt));
            m.instanceMatrix.needsUpdate = true;
          }}
          castShadow
          receiveShadow
          frustumCulled={false}
        />
      )}
    </group>
  );
}

export default function Terreno({ ridotto }: { ridotto: boolean }) {
  return (
    <group>
      <Terra />
      <Trazzere />
      <Muretti />
      <Colline />
      <Colline centro={[ALTROVE[0], ALTROVE[2] - 40]} />
      <Sparsi ridotto={ridotto} />
    </group>
  );
}
