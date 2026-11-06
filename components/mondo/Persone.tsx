"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { pillola } from "./base";
import { Fotogrammi, H, L, RIGHE, Y0, type Posa } from "./pixel";
import { PERSONAGGI, zona, type Azione, type Personaggio, type ZonaId } from "@/content/azienda";

/*
 * Andrea e i collaboratori. Andrea accompagna la visita: sta nella zona in cui si trova il visitatore,
 * e quando ci arriva saluta. I collaboratori stanno al loro posto e lavorano; si girano verso chi
 * si avvicina. Un clic su una persona apre il dialogo.
 */

function Figura({
  p,
  pos,
  verso,
  azione,
  parla,
  saluta,
  onParla,
}: {
  p: Personaggio;
  pos: [number, number, number];
  verso: number;
  azione: Azione;
  parla: boolean;
  saluta?: boolean;
  onParla: (id: string) => void;
}) {
  const alto = p.aspetto.altezza ?? 1.75;
  // un pixel in metri: la figura, dai capelli alla suola, è alta 52 righe
  const px = alto / (RIGHE - 1);
  const fotogrammi = useMemo(() => new Fotogrammi(p.aspetto), [p]);
  const materiale = useMemo(
    () => new THREE.MeshBasicMaterial({ map: fotogrammi.prendi({ posa: "fermo", f: 0, chiusi: false, bocca: false }), alphaTest: 0.5, side: THREE.DoubleSide, color: "#FFF6EA" }),
    [fotogrammi]
  );
  const g = useRef<THREE.Group>(null);
  const etichetta = useRef<THREE.Sprite>(null);
  const nome = useMemo(() => {
    if (p.id === "andrea") return pillola("Andrea · Bakita", p.sotto);
    const cosa = p.ruolo.split("·")[1]?.trim() ?? p.nome;
    return pillola(cosa[0].toUpperCase() + cosa.slice(1), p.sotto);
  }, [p]);
  const { camera } = useThree();
  const stato = useRef({ inizio: -1, battito: 2 + Math.random() * 3, bocca: false, prossimaBocca: 0, sfasa: Math.random() * 3 });
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime, s = stato.current;
    if (s.inizio < 0) s.inizio = t;
    const dx = camera.position.x - g.current.position.x, dz = camera.position.z - g.current.position.z;
    const d = Math.hypot(dx, dz);
    // sempre rivolta verso chi guarda, come nei giochi a 16 bit
    g.current.rotation.y = Math.atan2(dx, dz);
    const posa: Posa = parla ? "parla" : saluta && t - s.inizio < 2.8 ? "saluta" : azione === "fermo" ? "fermo" : azione;
    const ritmo = posa === "saluta" ? 0.22 : posa === "parla" ? 0.42 : posa === "abbacchia" ? 0.3 : posa === "fermo" ? 0.8 : 0.55;
    const f = (Math.floor((t + s.sfasa) / ritmo) % 2) as 0 | 1;
    if (t > s.battito) s.battito = t + 2.5 + Math.random() * 3.5;
    const chiusi = s.battito - t < 0.13;
    if (parla && t > s.prossimaBocca) {
      s.bocca = !s.bocca;
      s.prossimaBocca = t + 0.08 + Math.random() * 0.14;
    }
    const mappa = fotogrammi.prendi({ posa, f, chiusi, bocca: parla && s.bocca });
    if (materiale.map !== mappa) {
      materiale.map = mappa;
      materiale.needsUpdate = true;
    }
    if (etichetta.current) {
      const o = THREE.MathUtils.clamp(1.7 - d / 14, 0, 1);
      (etichetta.current.material as THREE.SpriteMaterial).opacity = o;
      etichetta.current.visible = o > 0.02;
    }
  });
  const clic = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return;
    e.stopPropagation();
    onParla(p.id);
  };
  // la tela è 32 × 80: la suola sta alla riga Y0 + 52, una riga sopra il bordo basso
  const largo = L * px, altoTela = H * px;
  const centro = altoTela / 2 - (H - (Y0 + RIGHE)) * px;
  void verso;
  return (
    <group
      ref={g}
      position={pos}
      onClick={clic}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <mesh position={[0, centro, 0]} material={materiale} renderOrder={3}>
        <planeGeometry args={[largo, altoTela]} />
      </mesh>
      {/* l'ombra morbida a terra */}
      <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.32, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {/* un volume invisibile, più facile da cliccare della figura */}
      <mesh position={[0, alto / 2, 0]} visible={false}>
        <boxGeometry args={[0.8, alto + 0.1, 0.8]} />
      </mesh>
      <sprite ref={etichetta} position={[0, alto + 0.45, 0]} scale={[0.3 * nome.rapporto, 0.3, 1]} renderOrder={10}>
        <spriteMaterial map={nome.texture} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

/** Due raccoglitori in più, solo durante la raccolta delle olive. */
const AIUTI: Personaggio[] = [
  {
    ...PERSONAGGI[3],
    id: "aiuto-a",
    aspetto: { ...PERSONAGGI[3].aspetto, pelle: "#C58E66", barba: undefined, cappello: { tipo: "coppola", colore: "#2E3440" }, maglia: { colore: "#3F5E7A", maniche: "lunghe" }, altezza: 1.69 },
  },
  {
    ...PERSONAGGI[3],
    id: "aiuto-b",
    aspetto: { ...PERSONAGGI[3].aspetto, pelle: "#A86E4A", barba: "baffi", capelli: { stile: "corti", colore: "#6A645C" }, cappello: undefined, maglia: { colore: "#7A6A3F", maniche: "lunghe" }, altezza: 1.77 },
  },
];

export default function Persone({
  zonaAndrea,
  faseUliveto,
  parlante,
  onParla,
}: {
  zonaAndrea: ZonaId;
  faseUliveto: number;
  parlante: string | null;
  onParla: (id: string) => void;
}) {
  const andrea = PERSONAGGI[0];
  const z = zona(zonaAndrea);
  const versoAndrea = Math.atan2(z.camera[0] - z.andrea[0], z.camera[2] - z.andrea[2]);
  const raccolta = faseUliveto === 3;
  return (
    <group>
      <Figura key={zonaAndrea} p={andrea} pos={z.andrea} verso={versoAndrea} azione="fermo" parla={parlante === "andrea"} saluta onParla={onParla} />
      {PERSONAGGI.slice(1).map((p) => (
        <Figura
          key={p.id}
          p={p}
          pos={p.pos as [number, number, number]}
          verso={p.verso ?? 0}
          azione={p.id === "raccoglitore" && !raccolta ? "fermo" : (p.azione ?? "fermo")}
          parla={parlante === p.id}
          onParla={onParla}
        />
      ))}
      {raccolta &&
        AIUTI.map((p, i) => (
          <Figura
            key={p.id}
            p={p}
            pos={i === 0 ? [3.4, 0, -38.2] : [-0.6, 0, -36.8]}
            verso={i === 0 ? 2.2 : -0.8}
            azione="abbacchia"
            parla={false}
            onParla={() => onParla("raccoglitore")}
          />
        ))}
    </group>
  );
}
