"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { modello, scatola, scritta, smorza, textura } from "./base";
import { usaPietra } from "./Casale";

/*
 * Il frantoio: un vano di pietra aperto sul davanti (verso +z), nella radura dell'uliveto.
 * Dentro la vasca con le macine, la gramola, il decanter con l'olio che scende nel serbatoio.
 * Fasi (0–3): lavaggio, molitura, gramolatura, estrazione.
 */

const C = new THREE.Vector3(-14, 0, -46);
const L = 10, P = 7, H = 4.4;

function Vano() {
  const pietra = usaPietra(1);
  const coppi = useMemo(() => {
    const falda = Math.hypot(P / 2, 1.4) + 0.5;
    return new THREE.MeshLambertMaterial({
      map: textura("coppi-colore.webp", true, [(L + 1) / 1.6, falda / 1.6]),
      normalMap: textura("coppi-rilievo.webp", false, [(L + 1) / 1.6, falda / 1.6]),
      color: "#F4D9C4",
      side: THREE.DoubleSide,
    });
  }, []);
  const muroFondo = useMemo(() => scatola(L, H, 0.6, 2.2), []);
  const muroLato = useMemo(() => scatola(0.6, H, P, 2.2), []);
  const pilastro = useMemo(() => scatola(0.6, H, 0.6, 2.2), []);
  const architrave = useMemo(() => scatola(L, 0.7, 0.62, 2.2), []);
  const angolo = Math.atan2(1.4, P / 2);
  const falda = Math.hypot(P / 2, 1.4) + 0.5;
  const cima = H + 1.4 + 0.06;
  const insegna = useMemo(
    () => scritta("FRANTOIO", { larghezza: 1024, altezza: 160, font: "400 96px Newsreader, Georgia, serif", colore: "#2A2016", fondo: "#E9DCC2" }),
    []
  );
  return (
    <group position={C}>
      <mesh geometry={muroFondo} material={pietra} position={[0, H / 2, -P / 2 + 0.3]} castShadow receiveShadow />
      <mesh geometry={muroLato} material={pietra} position={[-L / 2 + 0.3, H / 2, 0]} castShadow receiveShadow />
      <mesh geometry={muroLato} material={pietra} position={[L / 2 - 0.3, H / 2, 0]} castShadow receiveShadow />
      {/* i pilastri e l'architrave del davanti, aperto */}
      {[-L / 2 + 0.3, -1.7, 1.7, L / 2 - 0.3].map((x) => (
        <mesh key={x} geometry={pilastro} material={pietra} position={[x, H / 2, P / 2 - 0.3]} castShadow />
      ))}
      <mesh geometry={architrave} material={pietra} position={[0, H - 0.35, P / 2 - 0.3]} castShadow />
      {/* timpani */}
      {[-1, 1].map((s) => {
        const sh = new THREE.Shape();
        sh.moveTo(-P / 2, 0);
        sh.lineTo(P / 2, 0);
        sh.lineTo(0, 1.4);
        sh.closePath();
        return (
          <mesh key={s} material={pietra} position={[s * (L / 2 - 0.3), H, 0]} rotation-y={Math.PI / 2} castShadow>
            <shapeGeometry args={[sh]} />
          </mesh>
        );
      })}
      {[1, -1].map((s) => (
        <mesh key={s} material={coppi} position={[0, cima - Math.sin(angolo) * (falda / 2), s * Math.cos(angolo) * (falda / 2)]} rotation-x={Math.atan2(-s * Math.cos(angolo), Math.sin(angolo))} castShadow receiveShadow>
          <planeGeometry args={[L + 0.8, falda]} />
        </mesh>
      ))}
      {/* il pavimento di cotto */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[L - 1.2, P - 0.6]} />
        <meshLambertMaterial color="#B07A55" />
      </mesh>
      <mesh position={[0, H - 0.35, P / 2 + 0.02]}>
        <planeGeometry args={[3.2, 0.5]} />
        <meshLambertMaterial map={insegna} />
      </mesh>
      {/* la luce calda dentro */}
      <pointLight position={[0, H - 0.8, 0]} intensity={14} distance={11} decay={1.6} color="#FFC98A" />
    </group>
  );
}

/** La vasca con le due macine, che girano attorno all'albero centrale durante la molitura. */
function Macina({ fase }: { fase: number }) {
  const giro = useRef<THREE.Group>(null);
  const ruote = useRef<THREE.Mesh[]>([]);
  const pasta = useRef<THREE.Mesh>(null);
  const v = useRef(0);
  const granito = useMemo(() => new THREE.MeshLambertMaterial({ color: "#C9C2B4", flatShading: true }), []);
  useFrame((_, dt) => {
    v.current = smorza(v.current, fase === 1 ? 0.7 : 0, 1.5, dt);
    if (giro.current) giro.current.rotation.y += v.current * dt;
    // le macine rotolano: giro sulla vasca diviso il raggio della ruota
    ruote.current.forEach((r) => {
      if (r) r.rotation.x += (v.current * dt * 0.55) / 0.72;
    });
    if (pasta.current) {
      const s = smorza(pasta.current.scale.x, fase >= 1 ? 1 : 0.001, 2, dt);
      pasta.current.scale.set(s, 1, s);
      pasta.current.visible = s > 0.02;
    }
  });
  return (
    <group position={[C.x - 0.4, 0, C.z - 0.6]}>
      <mesh material={granito} position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.55, 1.65, 0.7, 28]} />
      </mesh>
      {/* la pasta, oppure le olive intere prima della molitura */}
      <mesh position={[0, 0.715, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.2, 1.45, 28]} />
        <meshStandardMaterial color={fase === 0 ? "#3A2533" : "#4C3A1C"} roughness={0.5} />
      </mesh>
      <mesh ref={pasta} position={[0, 0.74, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.2, 1.4, 28]} />
        <meshStandardMaterial color="#5A4721" roughness={0.3} />
      </mesh>
      <group ref={giro} position={[0, 0.72, 0]}>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 2.6, 10]} />
          <meshLambertMaterial color="#5A3E28" />
        </mesh>
        <mesh position={[0, 0.72, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.06, 0.06, 1.9, 8]} />
          <meshLambertMaterial color="#3A3A3A" />
        </mesh>
        {[-0.55, 0.55].map((x, i) => (
          <mesh
            key={x}
            ref={(m) => {
              if (m) ruote.current[i] = m;
            }}
            material={granito}
            position={[x, 0.72, 0]}
            rotation-z={Math.PI / 2}
            castShadow
          >
            <cylinderGeometry args={[0.72, 0.72, 0.36, 24]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

const acciaio = () => new THREE.MeshStandardMaterial({ color: "#C9CDD0", metalness: 0.85, roughness: 0.32 });

/** La gramola: una vasca d'acciaio orizzontale con la pala che gira. */
function Gramola({ fase }: { fase: number }) {
  const pala = useRef<THREE.Group>(null);
  const mat = useMemo(acciaio, []);
  useFrame((_, dt) => {
    if (pala.current && fase === 2) pala.current.rotation.x += dt * 0.9;
  });
  return (
    <group position={[C.x + 3.1, 0, C.z - 1.8]}>
      <mesh material={mat} position={[0, 1.15, 0]} rotation-z={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.7, 0.7, 2.4, 24, 1, true, 0, Math.PI * 1.6]} />
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} material={mat} position={[x, 1.15, 0]} rotation-y={Math.PI / 2}>
          <circleGeometry args={[0.7, 24]} />
        </mesh>
      ))}
      {/* la pasta dentro, vista dall'apertura */}
      <mesh position={[0, 1.15, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.62, 0.62, 2.3, 20]} />
        <meshStandardMaterial color="#5A4721" roughness={0.4} side={THREE.BackSide} />
      </mesh>
      <group ref={pala} position={[0, 1.15, 0]}>
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.05, 0.05, 2.5, 8]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
        </mesh>
        {[-0.7, 0, 0.7].map((x) => (
          <mesh key={x} position={[x, 0.35, 0]}>
            <boxGeometry args={[0.08, 0.6, 0.3]} />
            <meshStandardMaterial color="#AAA" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} material={mat} position={[x, 0.4, 0]}>
          <boxGeometry args={[0.1, 0.8, 1.0]} />
        </mesh>
      ))}
    </group>
  );
}

/** Il decanter e il filo d'olio che scende nel serbatoio; le bottiglie sulla mensola. */
function Estrazione({ fase }: { fase: number }) {
  const mat = useMemo(acciaio, []);
  const filo = useRef<THREE.Mesh>(null);
  const livello = useRef<THREE.Mesh>(null);
  const olio = useMemo(() => new THREE.MeshStandardMaterial({ color: "#9C9A1E", emissive: "#3E3A05", roughness: 0.1, transparent: true, opacity: 0.92 }), []);
  useFrame(({ clock }, dt) => {
    if (filo.current) {
      const s = smorza(filo.current.scale.y, fase === 3 ? 1 : 0.001, 3, dt);
      filo.current.scale.set(1 + Math.sin(clock.elapsedTime * 12) * 0.08, s, 1);
      filo.current.visible = s > 0.02;
    }
    if (livello.current) {
      const s = smorza(livello.current.scale.y, fase === 3 ? 1 : 0.05, 0.6, dt);
      livello.current.scale.y = s;
    }
  });
  const etichetta = useMemo(
    () => scritta("ANGILLETTI", { larghezza: 512, altezza: 128, font: "400 64px Newsreader, Georgia, serif", colore: "#2A2016", fondo: "#EDE3CC" }),
    []
  );
  return (
    <group>
      <group position={[C.x + 2.4, 0, C.z + 1.0]}>
        <mesh material={mat} position={[0, 1.3, 0]} rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.32, 0.26, 2.0, 18]} />
        </mesh>
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} material={mat} position={[x, 0.55, 0]}>
            <boxGeometry args={[0.12, 1.1, 0.6]} />
          </mesh>
        ))}
        {/* il beccuccio */}
        <mesh material={mat} position={[-1.0, 1.05, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        </mesh>
        <mesh ref={filo} material={olio} position={[-1.0, 0.55, 0]}>
          <cylinderGeometry args={[0.018, 0.012, 0.75, 6]} />
        </mesh>
        {/* il serbatoio */}
        <mesh material={mat} position={[-1.0, 0.09, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.3, 18, 1, true]} />
        </mesh>
        <mesh ref={livello} position={[-1.0, 0.0, 0]} scale={[1, 0.05, 1]}>
          <cylinderGeometry args={[0.26, 0.26, 0.42, 18]} />
          <meshStandardMaterial color="#8C8A18" roughness={0.15} />
        </mesh>
      </group>
      {/* la mensola con le bottiglie, contro il muro di sinistra */}
      <group position={[C.x - 4.15, 0, C.z + 0.5]} rotation-y={Math.PI / 2}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[2.2, 0.06, 0.4]} />
          <meshLambertMaterial color="#7A5A3E" />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <group key={i} position={[-0.9 + i * 0.3, 1.13, 0]}>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.055, 0.06, 0.32, 12]} />
              <meshStandardMaterial color="#3D4A14" roughness={0.1} transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.018, 0.04, 0.12, 10]} />
              <meshStandardMaterial color="#3D4A14" roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.15, 0.061]}>
              <planeGeometry args={[0.09, 0.08]} />
              <meshLambertMaterial map={etichetta} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/** Le cassette di olive all'ingresso e la lavatrice, nella fase del lavaggio. */
function Lavaggio({ fase }: { fase: number }) {
  const [cassetta, setCassetta] = useState<{ geometria: THREE.BufferGeometry; materiale: THREE.Material } | null>(null);
  useEffect(() => {
    let vivo = true;
    modello("cassetta.glb", 0.3).then((m) => vivo && setCassetta(m));
    return () => {
      vivo = false;
    };
  }, []);
  const mat = useMemo(acciaio, []);
  const acqua = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (acqua.current) acqua.current.position.y = 0.98 + Math.sin(clock.elapsedTime * 5) * 0.01;
  });
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    const s = smorza(g.current.scale.x, fase === 0 ? 1 : 0.6, 3, dt);
    g.current.scale.setScalar(s);
  });
  return (
    <group>
      <group ref={g} position={[C.x - 2.8, 0, C.z + 2.4]}>
        {cassetta &&
          [0, 1, 2, 3, 4, 5].map((k) => (
            <group key={k} position={[(k % 3) * 0.55, Math.floor(k / 3) * 0.3, 0]} rotation-y={0.08 * k}>
              <mesh geometry={cassetta.geometria} material={cassetta.materiale} castShadow />
              <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[0.46, 0.03, 0.32]} />
                <meshStandardMaterial color="#3A2633" roughness={0.4} />
              </mesh>
            </group>
          ))}
      </group>
      <group position={[C.x - 3.4, 0, C.z - 2.2]}>
        <mesh material={mat} position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.6, 1.0, 0.9]} />
        </mesh>
        <mesh ref={acqua} position={[0, 0.98, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1.5, 0.8]} />
          <meshStandardMaterial color={fase === 0 ? "#7FA7AE" : "#5E7F84"} roughness={0.05} metalness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

export default function Frantoio({ fase }: { fase: number }) {
  return (
    <group>
      <Vano />
      <Macina fase={fase} />
      <Gramola fase={fase} />
      <Estrazione fase={fase} />
      <Lavaggio fase={fase} />
    </group>
  );
}
