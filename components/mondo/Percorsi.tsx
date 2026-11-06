"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SERRA, altrove, inSerra, type P3 } from "@/content/luoghi";

/*
 * Le indicazioni per chi cammina, come nei videogiochi: briciole dorate a terra lungo i sentieri (un'onda di luce
 * le percorre verso la meta), cartelli segnavia agli incroci, anelli dorati sugli ingressi dei luoghi.
 * Le briciole e gli anelli si vedono solo camminando; i cartelli sempre.
 */

const V = (x: number, z: number) => new THREE.Vector3(x, 0, z);
const VS = (x: number, z: number) => {
  const p = inSerra(x, 0, z);
  return new THREE.Vector3(p[0], 0, p[2]);
};
const VA = (x: number, z: number) => new THREE.Vector3(...altrove([x, 0, z]));
const LATO = SERRA.largo / 2;

/** I sentieri guidati, dal punto di partenza alla meta. */
const SENTIERI: THREE.Vector3[][] = [
  // dal cancello allo spiazzale
  [V(0, 15), V(0, 6), V(0, 1.5)],
  // dallo spiazzale alla porta del capannone, poi dentro, lungo il corridoio
  [V(-0.5, 0), V(-3, -7), V(-8.6, -9.4), VS(0, LATO + 1.2), VS(0, LATO - 1.5), VS(3, 10.5), VS(18, 10.5)],
  // dallo spiazzale al campo di mais
  [V(1.5, 0.2), V(12, 1), V(20.5, -1.2)],
  // dallo spiazzale al trattore per gli uliveti
  [V(-0.5, 0.8), V(-3.2, 0.8), V(-4.6, -0.6)],
  // all'uliveto: dal trattore alla raccolta, poi al frantoio
  [VA(13.5, -20), VA(14, -24), VA(10, -30), VA(4, -35.5)],
  [VA(4, -35.5), VA(-4, -39), VA(-11, -40), VA(-14, -41.5)],
];

/** Gli ingressi: dove si entra nei luoghi. */
const INGRESSI: { p: P3; nome: string }[] = [
  { p: [0, 0, 6], nome: "Spiazzale" },
  { p: inSerra(0, 0, LATO + 0.8), nome: "Frutti di bosco" },
  { p: [21, 0, -1.6], nome: "Campo di mais" },
  { p: [-4.6, 0, -0.6], nome: "Trattore" },
  { p: altrove([-14, 0, -42]), nome: "Frantoio" },
  { p: altrove([4, 0, -35.5]), nome: "Raccolta" },
];

function Briciole({ visibile }: { visibile: boolean }) {
  const punti = useMemo(() => {
    const out: { p: THREE.Vector3; d: number }[] = [];
    for (const s of SENTIERI) {
      const curva = new THREE.CatmullRomCurve3(s, false, "catmullrom", 0.2);
      const L = curva.getLength();
      const n = Math.max(2, Math.floor(L / 1.6));
      for (let i = 0; i <= n; i++) out.push({ p: curva.getPointAt(i / n).setY(0.07), d: (i / n) * L });
    }
    return out;
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const vis = useRef(0);
  useFrame(({ clock }, dt) => {
    const m = ref.current;
    if (!m) return;
    vis.current += ((visibile ? 1 : 0) - vis.current) * (1 - Math.exp(-4 * dt));
    m.visible = vis.current > 0.02;
    if (!m.visible) return;
    const t = clock.elapsedTime;
    const mt = new THREE.Matrix4();
    punti.forEach((b, i) => {
      // un'onda che corre verso la meta
      const onda = 0.75 + 0.45 * Math.max(0, Math.sin(b.d * 0.55 - t * 4.5)) ** 3;
      const s = onda * vis.current;
      mt.makeScale(s, 1, s).setPosition(b.p);
      m.setMatrixAt(i, mt);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, punti.length]} frustumCulled={false} renderOrder={1}>
      <cylinderGeometry args={[0.16, 0.16, 0.02, 14]} />
      <meshBasicMaterial color="#F2D46A" transparent opacity={0.92} depthWrite={false} />
    </instancedMesh>
  );
}

function Anello({ p, visibile }: { p: P3; visibile: boolean }) {
  const a = useRef<THREE.Mesh>(null), b = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    [a.current, b.current].forEach((m, i) => {
      if (!m) return;
      const k = (t * 0.5 + i * 0.5) % 1;
      m.scale.setScalar(0.7 + k * 1.1);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.8;
      m.visible = visibile;
    });
  });
  return (
    <group position={[p[0], 0.06, p[2]]}>
      {[a, b].map((r, i) => (
        <mesh key={i} ref={r} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[1.0, 1.18, 48]} />
          <meshBasicMaterial color="#F2D46A" transparent depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Un cartello segnavia: un palo con le assi a freccia, ciascuna col nome di un luogo. */
function Segnavia({ p, verso, assi }: { p: P3; verso: number; assi: { testo: string; dir: "sx" | "dx" | "su" }[] }) {
  const tele = useMemo(
    () =>
      assi.map(({ testo, dir }) => {
        const c = document.createElement("canvas");
        c.width = 768;
        c.height = 128;
        const x = c.getContext("2d") as CanvasRenderingContext2D;
        x.fillStyle = "#E9DCC2";
        x.beginPath();
        // l'asse a forma di freccia: la punta dalla parte della direzione
        if (dir === "sx") {
          x.moveTo(0, 64);
          x.lineTo(60, 4);
          x.lineTo(764, 4);
          x.lineTo(764, 124);
          x.lineTo(60, 124);
        } else {
          x.moveTo(768, 64);
          x.lineTo(708, 4);
          x.lineTo(4, 4);
          x.lineTo(4, 124);
          x.lineTo(708, 124);
        }
        x.closePath();
        x.fill();
        x.strokeStyle = "#7A5A3A";
        x.lineWidth = 8;
        x.stroke();
        x.fillStyle = "#2A2016";
        x.font = "400 62px Newsreader, Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        const freccia = dir === "su" ? "↑ " : "";
        x.fillText(freccia + testo, dir === "sx" ? 412 : 356, 68);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        return t;
      }),
    [assi]
  );
  return (
    <group position={p} rotation-y={verso}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.11, 2.4, 0.11]} />
        <meshLambertMaterial color="#6A4A31" />
      </mesh>
      {assi.map((a, i) => (
        <mesh key={i} position={[a.dir === "sx" ? -0.55 : a.dir === "dx" ? 0.55 : 0, 2.15 - i * 0.36, 0.07]}>
          <planeGeometry args={[1.6, 0.27]} />
          <meshLambertMaterial map={tele[i]} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export default function Percorsi({ visibile }: { visibile: boolean }) {
  return (
    <group>
      <Briciole visibile={visibile} />
      {INGRESSI.map((g) => (
        <Anello key={g.nome} p={g.p} visibile={visibile} />
      ))}
      {/* nello spiazzale, per chi arriva dal cancello */}
      <Segnavia
        p={[1.2, 0, 2.2]}
        verso={0}
        assi={[
          { testo: "Frutti di bosco", dir: "sx" },
          { testo: "Trattore per gli uliveti", dir: "sx" },
          { testo: "Campo di mais", dir: "dx" },
        ]}
      />
      {/* all'uliveto, per chi scende dal trattore */}
      <Segnavia
        p={altrove([11.6, 0, -22.5])}
        verso={0}
        assi={[
          { testo: "Uliveto, raccolta", dir: "sx" },
          { testo: "Frantoio", dir: "sx" },
          { testo: "Trattore: si torna", dir: "dx" },
        ]}
      />
    </group>
  );
}
