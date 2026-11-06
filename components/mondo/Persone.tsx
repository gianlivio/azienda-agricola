"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { pillola, smorza } from "./base";
import { PERSONAGGI, zona, type Personaggio, type ZonaId } from "@/content/azienda";

/*
 * Andrea e i collaboratori: figure semplici, alte 1,75 m, che si girano verso chi si avvicina.
 * Andrea accompagna la visita: sta nella zona in cui si trova il visitatore.
 * Un clic su una figura apre il dialogo.
 */

const PELLE = "#C9936C";

function arto(raggio: number, lungo: number, colore: string) {
  const g = new THREE.CapsuleGeometry(raggio, lungo, 3, 8).translate(0, -lungo / 2, 0);
  return { g, m: new THREE.MeshLambertMaterial({ color: colore }) };
}

type Corpo = { radice: THREE.Group; braccia: THREE.Group[]; testa: THREE.Group; asta?: THREE.Object3D };

function costruisci(p: Personaggio): Corpo {
  const c = p.colori;
  const radice = new THREE.Group();
  const add = (o: THREE.Object3D) => {
    o.traverse((x) => {
      if ((x as THREE.Mesh).isMesh) x.castShadow = true;
    });
    radice.add(o);
    return o;
  };
  // gambe
  for (const s of [-1, 1]) {
    const a = arto(0.075, 0.7, c.pantaloni);
    const g = new THREE.Mesh(a.g, a.m);
    g.position.set(s * 0.1, 0.86, 0);
    add(g);
    const scarpa = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.24), new THREE.MeshLambertMaterial({ color: "#2A231E" }));
    scarpa.position.set(s * 0.1, 0.04, 0.04);
    add(scarpa);
  }
  // busto
  const busto = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.42, 4, 10), new THREE.MeshLambertMaterial({ color: c.maglia }));
  busto.scale.set(1, 1, 0.72);
  busto.position.y = 1.17;
  add(busto);
  if (c.grembiule) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.02), new THREE.MeshLambertMaterial({ color: c.grembiule }));
    g.position.set(0, 0.98, 0.13);
    add(g);
  }
  // braccia, appese alle spalle
  const braccia: THREE.Group[] = [];
  for (const s of [-1, 1]) {
    const spalla = new THREE.Group();
    spalla.position.set(s * 0.235, 1.43, 0);
    const a = arto(0.052, 0.5, c.maglia);
    spalla.add(new THREE.Mesh(a.g, a.m));
    const mano = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshLambertMaterial({ color: c.pelle ?? PELLE }));
    mano.position.y = -0.6;
    spalla.add(mano);
    spalla.rotation.z = s * 0.08;
    braccia.push(spalla);
    add(spalla);
  }
  // testa
  const testa = new THREE.Group();
  testa.position.y = 1.66;
  testa.add(new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 12), new THREE.MeshLambertMaterial({ color: c.pelle ?? PELLE })));
  const naso = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.05, 6), new THREE.MeshLambertMaterial({ color: c.pelle ?? PELLE }));
  naso.rotation.x = Math.PI / 2;
  naso.position.set(0, -0.01, 0.115);
  testa.add(naso);
  for (const s of [-1, 1]) {
    const occhio = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), new THREE.MeshBasicMaterial({ color: "#1A1410" }));
    occhio.position.set(s * 0.042, 0.022, 0.104);
    testa.add(occhio);
  }
  if (c.cappello) {
    const coppola = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.125, 0.07, 16), new THREE.MeshLambertMaterial({ color: c.cappello }));
    coppola.position.y = 0.08;
    testa.add(coppola);
    const visiera = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.015, 0.09), new THREE.MeshLambertMaterial({ color: c.cappello }));
    visiera.position.set(0, 0.055, 0.13);
    testa.add(visiera);
  } else {
    const capelli = new THREE.Mesh(
      new THREE.SphereGeometry(0.122, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.56),
      new THREE.MeshLambertMaterial({ color: c.capelli ?? "#2B1F17" })
    );
    capelli.rotation.x = -0.35;
    testa.add(capelli);
  }
  add(testa);
  return { radice, braccia, testa };
}

function Figura({
  p,
  pos,
  verso,
  parla,
  onParla,
  conAsta,
}: {
  p: Personaggio;
  pos: [number, number, number];
  verso: number;
  parla: boolean;
  onParla: (id: string) => void;
  conAsta?: boolean;
}) {
  const corpo = useMemo(() => costruisci(p), [p]);
  const g = useRef<THREE.Group>(null);
  const nome = useMemo(() => {
    if (p.id === "andrea") return pillola("Andrea · Bakita", "Parla con me");
    const [chi, cosa] = p.ruolo.split("·").map((s) => s.trim());
    return pillola(cosa ? cosa[0].toUpperCase() + cosa.slice(1) : p.nome, chi);
  }, [p]);
  const etichetta = useRef<THREE.Sprite>(null);
  const asta = useMemo(() => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 3.2, 6).translate(0, 1.6, 0), new THREE.MeshLambertMaterial({ color: "#C9B48A" }));
    return m;
  }, []);
  const { camera } = useThree();
  const t0 = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }, dt) => {
    if (!g.current) return;
    const t = clock.elapsedTime + t0;
    // si gira verso chi guarda, se è vicino
    const dx = camera.position.x - g.current.position.x, dz = camera.position.z - g.current.position.z;
    const d = Math.hypot(dx, dz);
    const obiettivo = d < 12 && !conAsta ? Math.atan2(dx, dz) : verso;
    let delta = obiettivo - g.current.rotation.y;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    g.current.rotation.y += delta * (1 - Math.exp(-3 * dt));
    // respiro, e il gesto quando parla
    corpo.radice.position.y = Math.sin(t * 1.6) * 0.006;
    corpo.testa.rotation.x = parla ? Math.sin(t * 5) * 0.08 : smorza(corpo.testa.rotation.x, 0, 3, dt);
    const [sx, dx_] = corpo.braccia;
    if (conAsta) {
      // l'abbacchiatura: braccia alte, avanti e indietro
      const k = Math.sin(t * 4.2);
      sx.rotation.x = -2.6 + k * 0.25;
      dx_.rotation.x = -2.4 + k * 0.25;
    } else {
      sx.rotation.x = smorza(sx.rotation.x, parla ? -0.5 + Math.sin(t * 3) * 0.3 : Math.sin(t * 1.1) * 0.04, 4, dt);
      dx_.rotation.x = smorza(dx_.rotation.x, Math.sin(t * 1.1 + 1) * 0.04, 4, dt);
    }
    if (etichetta.current) {
      const s = THREE.MathUtils.clamp(1.6 - d / 14, 0, 1);
      (etichetta.current.material as THREE.SpriteMaterial).opacity = s;
      etichetta.current.visible = s > 0.02;
    }
  });
  const clic = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return;
    e.stopPropagation();
    onParla(p.id);
  };
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
      <primitive object={corpo.radice} />
      {conAsta && <primitive object={asta} position={[0.24, 1.0, 0.25]} rotation={[0.35, 0, -0.15]} />}
      {/* un volume invisibile, più facile da cliccare della figura */}
      <mesh position={[0, 0.95, 0]} visible={false}>
        <boxGeometry args={[0.8, 1.9, 0.8]} />
      </mesh>
      <sprite ref={etichetta} position={[0, 2.18, 0]} scale={[0.3 * nome.rapporto, 0.3, 1]} renderOrder={10}>
        <spriteMaterial map={nome.texture} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

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
  const vista = new THREE.Vector3(...z.camera);
  const versoAndrea = Math.atan2(vista.x - z.andrea[0], vista.z - z.andrea[2]);
  return (
    <group>
      <Figura key={zonaAndrea} p={andrea} pos={z.andrea} verso={versoAndrea} parla={parlante === "andrea"} onParla={onParla} />
      {PERSONAGGI.slice(1).map((p) => (
        <Figura
          key={p.id}
          p={p}
          pos={p.pos as [number, number, number]}
          verso={p.verso ?? 0}
          parla={parlante === p.id}
          onParla={onParla}
          conAsta={p.id === "raccoglitore" && faseUliveto === 3 && parlante !== p.id}
        />
      ))}
      {/* nella raccolta, altri due con l'abbacchiatore */}
      {faseUliveto === 3 &&
        (
          [
            [3.4, -38.2, 2.2, "a"],
            [-0.6, -36.8, -0.8, "b"],
          ] as const
        ).map(([x, zz, v, k]) => (
          <Figura
            key={k}
            p={{ ...PERSONAGGI[3], id: `aiuto-${k}`, colori: { maglia: k === "a" ? "#3F5E7A" : "#7A6A3F", pantaloni: "#33302C", cappello: "#E6DCC4" } }}
            pos={[x, 0, zz]}
            verso={v}
            parla={false}
            onParla={() => onParla("raccoglitore")}
            conAsta
          />
        ))}
    </group>
  );
}
