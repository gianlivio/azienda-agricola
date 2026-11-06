"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { albero, generatore, modello, posa, scatola, scritta, smorza, textura } from "./base";
import { AZIENDA } from "@/content/azienda";
import { ALBERI_FATTORIA, CANCELLO_Z, CASETTE, LAGHETTO, SPIAZZALE } from "@/content/luoghi";

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

/** Una casetta di campagna: muri di pietra o d'intonaco, tetto a capanna di coppi, porta e finestra verso lo spiazzale. */
function Casetta({ x, z, l, p, h, tipo }: { x: number; z: number; l: number; p: number; h: number; tipo: "pietra" | "intonaco" }) {
  const pietra = usaPietra(1);
  const intonaco = useMemo(() => new THREE.MeshLambertMaterial({ color: "#EDE6D8" }), []);
  const muri = useMemo(() => scatola(l, h, p, 2.2), [l, h, p]);
  const verso = Math.atan2(SPIAZZALE.x - x, SPIAZZALE.z - z);
  const muro = tipo === "pietra" ? pietra : intonaco;
  return (
    <group position={[x, 0, z]} rotation-y={verso}>
      <mesh geometry={muri} material={muro} position={[0, h / 2, 0]} castShadow receiveShadow />
      <group rotation-y={Math.PI / 2}>
        <Tetto l={p} p={l} alto={h} salita={tipo === "pietra" ? 1.3 : 1.0} sporto={0.35} pietra={muro} />
      </group>
      {/* zoccolo */}
      <mesh position={[0, 0.2, p / 2 + 0.02]}>
        <boxGeometry args={[l + 0.04, 0.4, 0.06]} />
        <meshLambertMaterial color={tipo === "pietra" ? "#B8A88E" : "#C9BFAE"} />
      </mesh>
      <Portale x={-l * 0.18} z={p / 2} l={1.1} a={1.95} />
      <Finestra x={l * 0.26} y={1.55} z={p / 2} l={0.8} a={0.95} scuri={tipo === "pietra" ? "#56675A" : "#4E6A7A"} />
    </group>
  );
}

/** Il casotto bianco accanto al laghetto, con il serbatoio dell'acqua. */
function Casotto() {
  return (
    <group position={[-7.2, 0, 3.2]} rotation-y={0.25}>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 2.2, 2.1]} />
        <meshLambertMaterial color="#F1EEE6" />
      </mesh>
      <mesh position={[0, 2.25, 0]} castShadow>
        <boxGeometry args={[2.9, 0.1, 2.4]} />
        <meshLambertMaterial color="#B9BDB8" />
      </mesh>
      <mesh position={[0.4, 0.95, 1.06]}>
        <boxGeometry args={[0.9, 1.9, 0.04]} />
        <meshLambertMaterial color="#6E7F86" />
      </mesh>
      <mesh position={[-2.2, 1.0, -0.2]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 2.0, 20]} />
        <meshLambertMaterial color="#2D4E7A" />
      </mesh>
    </group>
  );
}

/** Il laghetto: una vasca d'irrigazione col telo scuro, gli argini di terra, qualche canna. */
function Laghetto() {
  const { x, z, l, p, r } = LAGHETTO;
  const canne = useMemo(() => {
    const caso = generatore(404);
    return Array.from({ length: 26 }, () => {
      const lato = Math.floor(caso() * 4);
      const u = caso() - 0.5;
      const px = lato < 2 ? u * l : (lato === 2 ? -1 : 1) * (l / 2 + 0.3);
      const pz = lato < 2 ? (lato === 0 ? -1 : 1) * (p / 2 + 0.3) : u * p;
      return { px, pz, h: 0.8 + caso() * 0.9, r: caso() * 0.3 };
    });
  }, [l, p]);
  return (
    <group position={[x, 0, z]} rotation-y={r}>
      {/* gli argini */}
      {[
        [0, -p / 2 - 0.5, l + 2, 1],
        [0, p / 2 + 0.5, l + 2, 1],
        [-l / 2 - 0.5, 0, 1, p],
        [l / 2 + 0.5, 0, 1, p],
      ].map(([ax, az, al, ap], i) => (
        <mesh key={i} position={[ax, 0.25, az]} castShadow receiveShadow>
          <boxGeometry args={[al, 0.5, ap]} />
          <meshLambertMaterial color="#8E6A4E" />
        </mesh>
      ))}
      {/* il telo scuro */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[l, 0.3, p]} />
        <meshLambertMaterial color="#2A2C2E" />
      </mesh>
      {/* l'acqua */}
      <mesh position={[0, 0.3, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[l - 0.5, p - 0.5]} />
        <meshStandardMaterial color="#3E5A52" roughness={0.08} metalness={0.35} />
      </mesh>
      {canne.map((c, i) => (
        <mesh key={i} position={[c.px, c.h / 2 + 0.4, c.pz]} rotation-z={c.r - 0.15}>
          <coneGeometry args={[0.05, c.h, 4]} />
          <meshLambertMaterial color={i % 3 ? "#7E8F4A" : "#A39A5E"} />
        </mesh>
      ))}
    </group>
  );
}

function Edificio() {
  return (
    <group>
      {CASETTE.map((c, i) => (
        <Casetta key={i} {...c} />
      ))}
      <Casotto />
      <Laghetto />
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
    <group ref={g} position={[verso * -2.0, 0, CANCELLO_Z]}>
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
        <group key={s} position={[s * 2.45, 0, CANCELLO_Z]}>
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
      <mesh position={[5.6, 0.62, CANCELLO_Z + 0.32]}>
        <planeGeometry args={[4.2, 0.58]} />
        <meshLambertMaterial map={targa} />
      </mesh>
      <mesh position={[-5.4, 0.62, CANCELLO_Z + 0.32]}>
        <planeGeometry args={[1.6, 0.38]} />
        <meshLambertMaterial map={comune} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ carrubi e cose dello spiazzo */

const CARRUBI = ALBERI_FATTORIA.map(([x, z, g], i) => [x, z, g, 11 + i * 13] as [number, number, number, number]);

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
    for (let k = 0; k < 4; k++) m.push(posa(7.4, k * 0.3, -12.6, 0.05 * k, 1));
    for (let k = 0; k < 3; k++) m.push(posa(8.1, k * 0.3, -12.2, 0.3 + 0.04 * k, 1));
    m.push(posa(7.7, 0, -11.5, 1.2, 1));
    return m;
  }, []);
  return (
    <group>
      {botte && (
        <>
          <mesh geometry={botte.geometria} material={botte.materiale} position={[2.6, 0, -4.4]} castShadow />
          <mesh geometry={botte.geometria} material={botte.materiale} position={[2.9, 0, -5.7]} rotation-y={0.7} castShadow />
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
