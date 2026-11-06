"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { smorza } from "./base";
import type { ZonaId } from "@/content/azienda";
import { ALTROVE, CASETTE, SERRA, SPIAZZALE, inSerra, type P3 } from "@/content/luoghi";

/*
 * Gli oggetti di Poly Haven (polyhaven.com, CC0), compressi con gltf-transform (meshopt, texture webp a 512 px)
 * e serviti da public/scena/oggetti: il tavolo, la panca, la brocca, i vasi di terracotta, la pentola smaltata,
 * il secchio, la cassa di legno, i vassoi da semina, la scala, l'annaffiatoio, il tavolino con le sedie,
 * i cespugli, le ceste di vimini. Misure vere, in metri.
 */

const caricatore = new GLTFLoader();
caricatore.setMeshoptDecoder(MeshoptDecoder);
const modelli = new Map<string, Promise<THREE.Group>>();

function carica(nome: string) {
  let p = modelli.get(nome);
  if (!p) {
    p = caricatore.loadAsync(`/scena/oggetti/${nome}.glb`).then((g) => {
      g.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
      });
      return g.scene;
    });
    modelli.set(nome, p);
  }
  return p;
}

type Posto = { nome: string; p: [number, number, number]; r?: number; s?: number };

function Oggetto({ nome, p, r = 0, s = 1 }: Posto) {
  const [scena, setScena] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    let vivo = true;
    carica(nome).then((g) => vivo && setScena(g.clone(true)));
    return () => {
      vivo = false;
    };
  }, [nome]);
  if (!scena) return null;
  return <primitive object={scena} position={p} rotation-y={r} scale={s} />;
}

/** Un gruppo di oggetti che compare (crescendo) solo in certe fasi di una zona. */
function InFase({ visibile, children }: { visibile: boolean; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    const s = smorza(g.current.scale.x, visibile ? 1 : 0.001, 4, dt);
    g.current.scale.setScalar(s);
    g.current.visible = s > 0.01;
  });
  return (
    <group ref={g} scale={visibile ? 1 : 0.001}>
      {children}
    </group>
  );
}

/** Un punto accanto alla porta della prima casetta (coordinate locali della casetta: x lungo la facciata). */
function allaCasetta(x: number, z: number): P3 {
  const c = CASETTE[0];
  const v = Math.atan2(SPIAZZALE.x - c.x, SPIAZZALE.z - c.z);
  return [c.x + x * Math.cos(v) + z * Math.sin(v), 0, c.z - x * Math.sin(v) + z * Math.cos(v)];
}
const R = SERRA.angolo;

/** Sempre presenti: lo spiazzale e i suoi dintorni. */
const FISSI: Posto[] = [
  { nome: "outdoor_table_chair_set_01", p: [8.4, 0, 3.4], r: -0.4 },
  { nome: "painted_wooden_bench", p: [12.8, 0, 2.6], r: -0.2 },
  { nome: "planter_pot_clay", p: allaCasetta(-2.1, 2.75), s: 2.2 },
  { nome: "planter_pot_clay", p: allaCasetta(-0.05, 2.75), r: 1, s: 2.2 },
  { nome: "planter_pot_clay", p: allaCasetta(2.6, 2.7), r: 2, s: 1.6 },
  { nome: "wooden_bucket_01", p: [-10.8, 0, -1.6], r: 0.4 },
  { nome: "watering_can_metal_01", p: [-10.3, 0, -0.9], r: 1.2 },
  { nome: "shrub_02", p: [-27, 0, 3], r: 0.4 },
  { nome: "shrub_02", p: [20, 0, 18], r: 2.2, s: 0.9 },
];
/** Nel frantoio, lontano. */
const AL_FRANTOIO: Posto[] = [
  { nome: "wooden_bucket_01", p: [-17.6, 0, -47.6], r: 0.2 },
  { nome: "jug_01", p: [-17.1, 0, -48.4], r: 1.4, s: 1.6 },
  { nome: "wooden_crate_01", p: [-10.4, 0, -43.9], r: 0.1 },
];

export default function Oggetti({ fasi }: { fasi: Record<ZonaId, number> }) {
  return (
    <group>
      {FISSI.map((o, i) => (
        <Oggetto key={i} {...o} />
      ))}
      {/* capannone, messa a dimora: vassoi delle piantine e annaffiatoio sul tavolino in fondo al corridoio */}
      <InFase visibile={fasi.serra === 0}>
        <Oggetto nome="small_wooden_table_01" p={inSerra(24.5, 0, 12.7)} r={R} s={1.5} />
        {[0, 1, 2, 3].map((k) => (
          <Oggetto key={k} nome="seeding_tray_01" p={inSerra(24.0 + (k % 2) * 0.3 + Math.floor(k / 2) * 0.55 - 0.3, 0.8, 12.6 + (k % 2) * 0.1)} r={R + k * 0.2} />
        ))}
        <Oggetto nome="watering_can_metal_01" p={inSerra(25.6, 0, 9.3)} r={R + 2.4} />
      </InFase>
      {/* capannone, raccolta: le ceste di vimini nel corridoio */}
      <InFase visibile={fasi.serra === 4}>
        <Oggetto nome="wicker_basket_01" p={inSerra(12, 0.05, 9.7)} r={R + 0.3} />
        <Oggetto nome="wicker_basket_01" p={inSerra(9, 0.05, 11.3)} r={R + 1.2} />
      </InFase>
      {/* capannone, marmellata: la pentola smaltata sul tavolo */}
      <InFase visibile={fasi.serra === 5}>
        <Oggetto nome="pot_enamel_01" p={inSerra(22.05, 0.85, 10.4)} r={R + 0.6} s={1.3} />
        <Oggetto nome="wicker_basket_01" p={inSerra(21.9, 0.04, 11.3)} r={R + 2} />
      </InFase>
      <group position={ALTROVE}>
        {AL_FRANTOIO.map((o, i) => (
          <Oggetto key={i} {...o} />
        ))}
        {/* uliveto, raccolta: la scala sotto l'albero, le ceste */}
        <InFase visibile={fasi.uliveto === 3}>
          <Oggetto nome="wooden_ladder" p={[2.6, 0, -40.6]} r={0.9} s={1.6} />
          <Oggetto nome="wicker_basket_01" p={[0.4, 0.06, -38.0]} r={0.3} />
          <Oggetto nome="wicker_basket_01" p={[-2.4, 0.06, -39.4]} r={2.1} />
          <Oggetto nome="wooden_crate_01" p={[5.2, 0, -35.4]} r={0.4} />
        </InFase>
      </group>
    </group>
  );
}
