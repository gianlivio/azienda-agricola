"use client";

import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import { generatore, modello, posa, scatola, textura } from "./base";

/*
 * La terra rossa, le trazzere, lo spiazzo, i muretti a secco del perimetro, le colline lontane,
 * i sassi e i ciuffi d'erba secca. Tutto in piano, a y = 0.
 * Orientamento: il cancello sta a +z (verso chi arriva), il casale a −z, le serre a −x, il mais a +x,
 * l'uliveto dietro il casale.
 */

const rilievo = new THREE.Vector2(1, 1);

/** Le trazzere, come spezzate: [x, z]. Larghe 3,2 m. */
export const TRAZZERE: [number, number][][] = [
  [[0, 52], [0, 34], [0, 10]],
  [[-8, 2], [-14, 0.5], [-20, 0]],
  [[8, -1], [13, -1], [17.5, 0]],
  [[9, -5], [13.5, -12], [14, -22], [10, -30], [2, -37], [-8, -39.5], [-14, -40]],
];
export const SPIAZZO = { x: 0, z: 0, r: 12 };

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
  const colore = useMemo(() => textura("terra-colore.webp", true, [70, 70]), []);
  const ril = useMemo(() => textura("terra-rilievo.webp", false, [70, 70]), []);
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[320, 320]} />
      <meshLambertMaterial map={colore} normalMap={ril} normalScale={rilievo} color="#F6E6D6" />
    </mesh>
  );
}

function Trazzere() {
  const geos = useMemo(() => TRAZZERE.map((p) => nastro(p, 3.2)), []);
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

/** I muretti a secco: segmenti [x1, z1, x2, z2, altezza]. */
const MURETTI: [number, number, number, number, number][] = [
  // fronte, ai lati del cancello
  [-60, 34, -2.4, 34, 1.1],
  [2.4, 34, 60, 34, 1.1],
  // lati e fondo
  [-60, 34, -60, -82, 1.0],
  [60, 34, 60, -82, 1.0],
  [-60, -82, 60, -82, 1.0],
  // l'uliveto, dal resto del podere
  [-60, -26, -4, -26, 0.8],
  [17, -26, 60, -26, 0.8],
  // lungo la trazzera d'ingresso
  [-2.4, 34, -2.4, 16, 0.7],
  [2.4, 34, 2.4, 16, 0.7],
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
function Colline() {
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
    <mesh geometry={geo}>
      <meshLambertMaterial color="#8C8A63" side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Erba secca e sassi, sparsi lontano dalle trazzere e dalle colture. */
export function vicinoAUnaTrazzera(x: number, z: number, margine: number) {
  if (Math.hypot(x - SPIAZZO.x, z - SPIAZZO.z) < SPIAZZO.r + margine) return true;
  for (const t of TRAZZERE)
    for (let i = 0; i < t.length - 1; i++) {
      const [ax, az] = t[i], [bx, bz] = t[i + 1];
      const dx = bx - ax, dz = bz - az;
      const k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
      if (Math.hypot(x - (ax + k * dx), z - (az + k * dz)) < 1.8 + margine) return true;
    }
  return false;
}
/** Le aree occupate: casale, serra, mais, frantoio. */
export function occupato(x: number, z: number) {
  if (x > -16 && x < 9 && z > -20 && z < -8.5) return true; // casale e annesso
  if (x > -45 && x < -19 && z > -6 && z < 6) return true; // serra
  if (x > 17 && x < 45 && z > -14 && z < 14) return true; // mais
  if (x > -21 && x < -7 && z > -51 && z < -38) return true; // frantoio
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
    const n = ridotto ? 700 : 1800;
    let tentativi = 0;
    while (ciuffi.length < n && tentativi++ < n * 6) {
      const x = (caso() - 0.5) * 116, z = 32 - caso() * 112;
      if (vicinoAUnaTrazzera(x, z, 0.4) || occupato(x, z)) continue;
      ciuffi.push(posa(x, 0, z, caso() * 6.28, 0.6 + caso() * 0.9));
    }
    for (let i = 0; i < 90; i++) {
      const x = (caso() - 0.5) * 116, z = 32 - caso() * 112;
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
      <Sparsi ridotto={ridotto} />
    </group>
  );
}
