"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { pillola } from "./base";
import { Persona } from "./persona";
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
  const persona = useMemo(() => new Persona(p.aspetto), [p]);
  useEffect(() => {
    if (azione === "abbacchia") persona.conAsta();
    if (persona.asta) persona.asta.visible = azione === "abbacchia";
  }, [azione, persona]);
  const g = useRef<THREE.Group>(null);
  const etichetta = useRef<THREE.Sprite>(null);
  const nome = useMemo(() => {
    if (p.id === "andrea") return pillola("Andrea · Bakita", p.sotto);
    const cosa = p.ruolo.split("·")[1]?.trim() ?? p.nome;
    return pillola(cosa[0].toUpperCase() + cosa.slice(1), p.sotto);
  }, [p]);
  const { camera } = useThree();
  const inizio = useRef<number | null>(null);
  useFrame(({ clock }, dt) => {
    if (!g.current) return;
    const t = clock.elapsedTime;
    if (inizio.current === null) inizio.current = t;
    const dx = camera.position.x - g.current.position.x, dz = camera.position.z - g.current.position.z;
    const d = Math.hypot(dx, dz);
    const versoCamera = Math.atan2(dx, dz);
    // chi lavora resta rivolto al lavoro e gira solo la testa; gli altri si girano del tutto quando parlano o sei vicino
    const lavora = azione !== "fermo" && !parla;
    const obiettivo = !lavora && (parla || d < 10) ? versoCamera : verso;
    let delta = obiettivo - g.current.rotation.y;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    g.current.rotation.y += delta * (1 - Math.exp(-2.5 * dt));
    let testa = versoCamera - g.current.rotation.y;
    testa = Math.atan2(Math.sin(testa), Math.cos(testa));
    persona.sguardo = d < 14 && Math.abs(testa) < 1.6 ? testa : 0;
    persona.aggiorna(t, Math.min(dt, 0.1), parla ? "fermo" : azione, parla, !!saluta && t - inizio.current < 2.6);
    if (etichetta.current) {
      const s = THREE.MathUtils.clamp(1.7 - d / 14, 0, 1);
      (etichetta.current.material as THREE.SpriteMaterial).opacity = s;
      etichetta.current.visible = s > 0.02;
    }
  });
  const clic = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return;
    e.stopPropagation();
    onParla(p.id);
  };
  const alto = p.aspetto.altezza ?? 1.75;
  return (
    <group
      ref={g}
      position={pos}
      rotation-y={verso}
      onClick={clic}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <primitive object={persona.radice} />
      {/* un volume invisibile, più facile da cliccare della figura */}
      <mesh position={[0, alto / 2, 0]} visible={false}>
        <boxGeometry args={[0.8, alto + 0.1, 0.8]} />
      </mesh>
      <sprite ref={etichetta} position={[0, alto + 0.42, 0]} scale={[0.3 * nome.rapporto, 0.3, 1]} renderOrder={10}>
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
