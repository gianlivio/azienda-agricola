"use client";

import * as THREE from "three";
import { forwardRef, useMemo } from "react";
import { scritta } from "./base";

/*
 * Il furgone dell'azienda: bianco, con la fascia verde e la scritta sul fianco. Guarda verso −z
 * (come la camera a riposo), le ruote poggiano a y = 0. Lungo 5,2 m, largo 2 m.
 * Dove sta e come si muove lo decide la regia della scena.
 */

const Ruota = ({ x, z }: { x: number; z: number }) => (
  <group position={[x, 0.36, z]} rotation-z={Math.PI / 2}>
    <mesh castShadow>
      <cylinderGeometry args={[0.36, 0.36, 0.26, 18]} />
      <meshLambertMaterial color="#1B1B1B" />
    </mesh>
    <mesh>
      <cylinderGeometry args={[0.2, 0.2, 0.27, 12]} />
      <meshStandardMaterial color="#B8BCC0" metalness={0.6} roughness={0.35} />
    </mesh>
  </group>
);

const Furgone = forwardRef<THREE.Group, { position?: [number, number, number]; rotation?: [number, number, number] }>(function Furgone({ position, rotation }, ref) {
  const fianco = useMemo(
    () => scritta("AZIENDA AGRICOLA ANGILLETTI", { larghezza: 1600, altezza: 160, font: "500 74px 'IBM Plex Mono', monospace", colore: "#F3F1EB", fondo: "#183F35" }),
    []
  );
  const bianco = useMemo(() => new THREE.MeshStandardMaterial({ color: "#F2F2EE", roughness: 0.35, metalness: 0.1 }), []);
  const vetro = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1C2630", roughness: 0.08, metalness: 0.5 }), []);
  return (
    <group ref={ref} position={position} rotation={rotation}>
      {/* il cassone */}
      <mesh material={bianco} position={[0, 1.42, 0.7]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 2.1, 3.7]} />
      </mesh>
      {/* la cabina e il muso */}
      <mesh material={bianco} position={[0, 1.5, -1.55]} castShadow>
        <boxGeometry args={[1.98, 1.7, 0.9]} />
      </mesh>
      <mesh material={bianco} position={[0, 0.98, -2.25]} castShadow>
        <boxGeometry args={[1.94, 0.95, 0.75]} />
      </mesh>
      {/* il parabrezza inclinato */}
      <mesh material={vetro} position={[0, 1.85, -2.04]} rotation-x={-0.55}>
        <planeGeometry args={[1.8, 0.95]} />
      </mesh>
      {/* i finestrini della cabina */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={vetro} position={[s * 1.0, 1.82, -1.55]} rotation-y={s * Math.PI / 2}>
          <planeGeometry args={[0.8, 0.6]} />
        </mesh>
      ))}
      {/* paraurti, fari, griglia */}
      <mesh position={[0, 0.55, -2.64]}>
        <boxGeometry args={[2.0, 0.28, 0.12]} />
        <meshLambertMaterial color="#3A3D40" />
      </mesh>
      <mesh position={[0, 1.08, -2.63]}>
        <boxGeometry args={[1.0, 0.22, 0.03]} />
        <meshLambertMaterial color="#2A2D30" />
      </mesh>
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, 1.12, -2.63]}>
          <boxGeometry args={[0.32, 0.16, 0.03]} />
          <meshStandardMaterial color="#FFF6D8" emissive="#FFE9A8" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* la fascia verde con la scritta, sui due fianchi */}
      {[-1, 1].map((s) => (
        <mesh key={`f${s}`} position={[s * 1.006, 1.25, 0.7]} rotation-y={s * Math.PI / 2}>
          <planeGeometry args={[3.5, 0.36]} />
          <meshLambertMaterial map={fianco} />
        </mesh>
      ))}
      {/* le porte posteriori */}
      <mesh position={[0, 1.42, 2.56]}>
        <boxGeometry args={[0.02, 1.9, 0.02]} />
        <meshLambertMaterial color="#9A9C9E" />
      </mesh>
      {[-0.86, 0.86].map((x) => (
        <mesh key={x} position={[x, 0.55, 2.55]}>
          <boxGeometry args={[0.18, 0.12, 0.03]} />
          <meshStandardMaterial color="#C8322A" emissive="#7A1410" />
        </mesh>
      ))}
      <Ruota x={-0.9} z={-1.75} />
      <Ruota x={0.9} z={-1.75} />
      <Ruota x={-0.9} z={1.55} />
      <Ruota x={0.9} z={1.55} />
    </group>
  );
});

export default Furgone;
