"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { albero, generatore, modello, posa, scatola, scritta, smorza, textura } from "./base";
import { AZIENDA } from "@/content/azienda";

/*
 * Il casale in pietra a vista con i coppi, l'annesso del magazzino, il cancello con la targa,
 * i carrubi e le cose dello spiazzo (botti, cassette, l'abbeveratoio).
 */

const rilievo = new THREE.Vector2(1, 1);

export function usaPietra(passo = 1) {
  return useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        map: textura("muretto-colore.webp", true, [passo, passo]),
        normalMap: textura("muretto-rilievo.webp", false, [passo, passo]),
        normalScale: rilievo,
        color: "#FFF0DA",
      }),
    [passo]
  );
}

/** Un tetto a capanna lungo x: falde di coppi e timpani di pietra. */
function Tetto({ l, p, alto, salita, sporto = 0.45, pietra }: { l: number; p: number; alto: number; salita: number; sporto?: number; pietra: THREE.Material }) {
  const coppi = useMemo(() => {
    const falda = Math.hypot(p / 2 + sporto, salita);
    return new THREE.MeshLambertMaterial({
      map: textura("coppi-colore.webp", true, [(l + sporto * 2) / 1.6, falda / 1.6]),
      normalMap: textura("coppi-rilievo.webp", false, [(l + sporto * 2) / 1.6, falda / 1.6]),
      normalScale: rilievo,
      color: "#F4D9C4",
      side: THREE.DoubleSide,
    });
  }, [l, p, salita, sporto]);
  const angolo = Math.atan2(salita, p / 2);
  const falda = Math.hypot(p / 2, salita) + sporto;
  const timpano = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-p / 2, 0);
    s.lineTo(p / 2, 0);
    s.lineTo(0, salita);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false });
    // le coordinate di texture in metri
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2, uv.getY(i) / 2);
    g.rotateY(Math.PI / 2);
    return g;
  }, [p, salita]);
  // ogni falda scende dal colmo verso z = ±p/2 e sporge oltre il muro
  const cima = alto + salita + 0.06;
  return (
    <group>
      {[1, -1].map((s) => (
        <mesh
          key={s}
          material={coppi}
          position={[0, cima - Math.sin(angolo) * (falda / 2), s * Math.cos(angolo) * (falda / 2)]}
          rotation-x={Math.atan2(-s * Math.cos(angolo), Math.sin(angolo))}
          castShadow
          receiveShadow
        >
          <planeGeometry args={[l + sporto * 2, falda]} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <mesh key={`t${s}`} geometry={timpano} material={pietra} position={[s > 0 ? l / 2 - 0.5 : -l / 2, alto, 0]} castShadow receiveShadow />
      ))}
    </group>
  );
}

/** Finestra con architrave di pietra chiara e scuri aperti. */
function Finestra({ x, y, z, l = 1.0, a = 1.4, ruota = 0, scuri = "#56675A" }: { x: number; y: number; z: number; l?: number; a?: number; ruota?: number; scuri?: string }) {
  return (
    <group position={[x, y, z]} rotation-y={ruota}>
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[l, a, 0.12]} />
        <meshLambertMaterial color="#1B1714" />
      </mesh>
      <mesh position={[0, a / 2 + 0.12, 0.06]} castShadow>
        <boxGeometry args={[l + 0.4, 0.24, 0.2]} />
        <meshLambertMaterial color="#E9DCC2" />
      </mesh>
      <mesh position={[0, -a / 2 - 0.06, 0.1]} castShadow>
        <boxGeometry args={[l + 0.3, 0.12, 0.28]} />
        <meshLambertMaterial color="#E9DCC2" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (l / 2 + l / 4 + 0.02), 0, 0.12]} castShadow>
          <boxGeometry args={[l / 2, a, 0.05]} />
          <meshLambertMaterial color={scuri} />
        </mesh>
      ))}
    </group>
  );
}

/** Portale ad arco con portone di legno. */
function Portale({ x, y = 0, z, l = 2.0, a = 2.5, ruota = 0 }: { x: number; y?: number; z: number; l?: number; a?: number; ruota?: number }) {
  const arco = useMemo(() => new THREE.CircleGeometry(l / 2, 24, 0, Math.PI), [l]);
  const cornice = useMemo(() => new THREE.TorusGeometry(l / 2 + 0.16, 0.18, 6, 24, Math.PI), [l]);
  return (
    <group position={[x, y, z]} rotation-y={ruota}>
      <mesh position={[0, a / 2, 0.02]}>
        <boxGeometry args={[l, a, 0.1]} />
        <meshLambertMaterial color="#4A3020" />
      </mesh>
      <mesh geometry={arco} position={[0, a, 0.075]}>
        <meshLambertMaterial color="#4A3020" />
      </mesh>
      <mesh geometry={cornice} position={[0, a, 0.08]} castShadow>
        <meshLambertMaterial color="#E9DCC2" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (l / 2 + 0.16), a / 2, 0.08]} castShadow>
          <boxGeometry args={[0.36, a, 0.36]} />
          <meshLambertMaterial color="#E9DCC2" />
        </mesh>
      ))}
      {/* le assi del portone */}
      {[-0.3, 0, 0.3].map((k) => (
        <mesh key={k} position={[k * l, a / 2, 0.08]}>
          <boxGeometry args={[0.03, a, 0.02]} />
          <meshLambertMaterial color="#2E1D13" />
        </mesh>
      ))}
    </group>
  );
}

function Edificio() {
  const pietra = usaPietra(1);
  // casale: 16 × 7 × 8, fronte a z = −10
  const muri = useMemo(() => scatola(16, 7, 8, 2.2), []);
  const annesso = useMemo(() => scatola(8, 4.2, 7, 2.2), []);
  return (
    <group>
      <group position={[0, 0, -14]}>
        <mesh geometry={muri} material={pietra} position={[0, 3.5, 0]} castShadow receiveShadow />
        <Tetto l={16} p={8} alto={7} salita={2.2} pietra={pietra} />
        {/* cornicione */}
        <mesh position={[0, 6.95, 4.05]} castShadow>
          <boxGeometry args={[16.3, 0.22, 0.3]} />
          <meshLambertMaterial color="#E9DCC2" />
        </mesh>
        <mesh position={[0, 6.95, -4.05]} castShadow>
          <boxGeometry args={[16.3, 0.22, 0.3]} />
          <meshLambertMaterial color="#E9DCC2" />
        </mesh>
        <Portale x={0} z={4} />
        {[-5.6, -2.9, 2.9, 5.6].map((x) => (
          <Finestra key={x} x={x} y={1.75} z={4} l={0.9} a={1.2} />
        ))}
        {[-5.6, -2.4, 2.4, 5.6].map((x) => (
          <Finestra key={x} x={x} y={4.9} z={4} />
        ))}
        {/* il balcone al centro, con la ringhiera in ferro */}
        <Finestra x={0} y={5.0} z={4} l={1.1} a={1.9} />
        <mesh position={[0, 3.95, 4.45]} castShadow>
          <boxGeometry args={[2.2, 0.14, 0.9]} />
          <meshLambertMaterial color="#E9DCC2" />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[-1.05 + i * 0.19, 4.4, 4.85]}>
            <boxGeometry args={[0.025, 0.8, 0.025]} />
            <meshLambertMaterial color="#1E1C1A" />
          </mesh>
        ))}
        <mesh position={[0, 4.8, 4.85]}>
          <boxGeometry args={[2.2, 0.05, 0.05]} />
          <meshLambertMaterial color="#1E1C1A" />
        </mesh>
        {/* finestre di lato */}
        <Finestra x={8} y={4.9} z={0} ruota={Math.PI / 2} />
        <Finestra x={8} y={1.8} z={-1.8} ruota={Math.PI / 2} l={0.9} a={1.2} />
        {/* comignolo */}
        <mesh position={[4.5, 8.6, -1]} material={pietra} castShadow>
          <boxGeometry args={[0.8, 1.8, 0.8]} />
        </mesh>
      </group>
      {/* annesso: il magazzino, più basso, a ovest */}
      <group position={[-12, 0, -14]}>
        <mesh geometry={annesso} material={pietra} position={[0, 2.1, 0]} castShadow receiveShadow />
        <Tetto l={8} p={7} alto={4.2} salita={1.5} pietra={pietra} />
        <Portale x={0} z={3.5} l={3} a={2.6} />
        <Finestra x={-2.8} y={2.2} z={3.5} l={0.7} a={0.8} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ il cancello */

function Anta({ verso, aperto }: { verso: 1 | -1; aperto: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.rotation.y = smorza(g.current.rotation.y, aperto ? verso * 1.6 : 0, 1.4, dt);
  });
  const ferro = useMemo(() => new THREE.MeshLambertMaterial({ color: "#23211F" }), []);
  const L = 2.0;
  return (
    <group ref={g} position={[verso * -2.0, 0, 34]}>
      <group position={[verso * (L / 2), 0, 0]}>
        {[0.2, 1.1, 2.0].map((y) => (
          <mesh key={y} material={ferro} position={[0, y, 0]}>
            <boxGeometry args={[L, 0.06, 0.06]} />
          </mesh>
        ))}
        {Array.from({ length: 13 }, (_, i) => {
          const x = -L / 2 + 0.07 + i * ((L - 0.14) / 12);
          // le punte salgono verso il centro, come un arco
          const h = 2.05 + 0.35 * Math.sin(((verso > 0 ? i : 12 - i) / 12) * Math.PI * 0.5);
          return (
            <group key={i}>
              <mesh material={ferro} position={[x, h / 2, 0]}>
                <boxGeometry args={[0.03, h, 0.03]} />
              </mesh>
              <mesh material={ferro} position={[x, h + 0.05, 0]}>
                <coneGeometry args={[0.04, 0.14, 4]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

function Cancello({ aperto }: { aperto: boolean }) {
  const pietra = usaPietra(1);
  const targa = useMemo(
    () =>
      scritta(AZIENDA.nome.toUpperCase(), {
        larghezza: 1600,
        altezza: 220,
        font: "400 104px Newsreader, Georgia, serif",
        colore: "#2A2016",
        fondo: "#E9DCC2",
        bordo: "#8A6E4B",
      }),
    []
  );
  const comune = useMemo(
    () => scritta("COMISO", { larghezza: 512, altezza: 120, font: "500 64px 'IBM Plex Mono', monospace", colore: "#E9DCC2", fondo: "#1B1A18" }),
    []
  );
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 2.45, 0, 34]}>
          <mesh material={pietra} position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 3.0, 0.9]} />
          </mesh>
          <mesh position={[0, 3.08, 0]} castShadow>
            <boxGeometry args={[1.1, 0.18, 1.1]} />
            <meshLambertMaterial color="#E9DCC2" />
          </mesh>
          <mesh position={[0, 3.35, 0]} castShadow>
            <sphereGeometry args={[0.24, 12, 8]} />
            <meshLambertMaterial color="#E9DCC2" />
          </mesh>
        </group>
      ))}
      <Anta verso={1} aperto={aperto} />
      <Anta verso={-1} aperto={aperto} />
      {/* la targa sul muretto a destra del cancello, verso chi arriva */}
      <mesh position={[5.6, 0.62, 34.32]}>
        <planeGeometry args={[4.2, 0.58]} />
        <meshLambertMaterial map={targa} />
      </mesh>
      <mesh position={[-4.4, 0.62, 34.32]}>
        <planeGeometry args={[1.6, 0.38]} />
        <meshLambertMaterial map={comune} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ carrubi e cose dello spiazzo */

const CARRUBI: [number, number, number, number][] = [
  // x, z, grandezza, seme
  [10.5, 8, 1.25, 11],
  [-11, 11, 1.1, 23],
  [-26, 22, 1.4, 37],
  [30, 24, 1.3, 41],
  [42, -21, 1.2, 53],
  [-44, -16, 1.35, 67],
  [-8, 26, 0.9, 71],
];

export function Carrubi() {
  const forma = useMemo(() => {
    const a = albero(901, 1.25, 0.7);
    return a;
  }, []);
  const corteccia = useMemo(() => textura("corteccia-colore.webp", true, [2, 2]), []);
  const matrici = useMemo(
    () => CARRUBI.map(([x, z, s, seme]) => posa(x, 0, z, generatore(seme)() * 6.28, [s * 2.3, s * 1.9, s * 2.3])),
    []
  );
  return (
    <group>
      <instancedMesh
        args={[forma.legnoGeo, undefined, matrici.length]}
        ref={(m) => {
          if (!m) return;
          matrici.forEach((mt, i) => m.setMatrixAt(i, mt));
          m.instanceMatrix.needsUpdate = true;
        }}
        castShadow
        frustumCulled={false}
      >
        <meshLambertMaterial map={corteccia} color="#8C7B6A" />
      </instancedMesh>
      <instancedMesh
        args={[forma.frondeGeo, undefined, matrici.length]}
        ref={(m) => {
          if (!m) return;
          matrici.forEach((mt, i) => m.setMatrixAt(i, mt));
          m.instanceMatrix.needsUpdate = true;
        }}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <meshLambertMaterial color="#3E5A2A" flatShading />
      </instancedMesh>
    </group>
  );
}

function Cose() {
  const pietra = usaPietra(1);
  const [botte, setBotte] = useState<{ geometria: THREE.BufferGeometry; materiale: THREE.Material } | null>(null);
  const [cassetta, setCassetta] = useState<{ geometria: THREE.BufferGeometry; materiale: THREE.Material } | null>(null);
  useEffect(() => {
    let vivo = true;
    modello("botte.glb", 1.1).then((m) => vivo && setBotte(m));
    modello("cassetta.glb", 0.3).then((m) => vivo && setCassetta(m));
    return () => {
      vivo = false;
    };
  }, []);
  const pile = useMemo(() => {
    const m: THREE.Matrix4[] = [];
    // due pile di cassette accanto al portone
    for (let k = 0; k < 4; k++) m.push(posa(5.2, k * 0.3, -9.2, 0.05 * k, 1));
    for (let k = 0; k < 3; k++) m.push(posa(5.9, k * 0.3, -8.8, 0.3 + 0.04 * k, 1));
    m.push(posa(5.5, 0, -8.1, 1.2, 1));
    return m;
  }, []);
  return (
    <group>
      {botte && (
        <>
          <mesh geometry={botte.geometria} material={botte.materiale} position={[-5.3, 0, -9.3]} castShadow />
          <mesh geometry={botte.geometria} material={botte.materiale} position={[-6.5, 0, -9.1]} rotation-y={0.7} castShadow />
        </>
      )}
      {cassetta && (
        <instancedMesh
          args={[cassetta.geometria, cassetta.materiale, pile.length]}
          ref={(m) => {
            if (!m) return;
            pile.forEach((mt, i) => m.setMatrixAt(i, mt));
            m.instanceMatrix.needsUpdate = true;
          }}
          castShadow
          frustumCulled={false}
        />
      )}
      {/* l'abbeveratoio di pietra */}
      <group position={[-8.6, 0, -3]} rotation-y={0.3}>
        <mesh material={pietra} position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.8, 1]} />
        </mesh>
        <mesh position={[0, 0.76, 0]}>
          <boxGeometry args={[2.3, 0.05, 0.7]} />
          <meshLambertMaterial color="#5E7A78" />
        </mesh>
      </group>
    </group>
  );
}

export default function Casale({ cancelloAperto }: { cancelloAperto: boolean }) {
  return (
    <group>
      <Edificio />
      <Cancello aperto={cancelloAperto} />
      <Carrubi />
      <Cose />
    </group>
  );
}
