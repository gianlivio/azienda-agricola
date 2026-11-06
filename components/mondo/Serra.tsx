"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { generatore, modello, posa, scritta, smorza } from "./base";

/*
 * La serra dei mirtilli: un tunnel ad arco lungo x, da x = −20 (la porta, verso lo spiazzo) a x = −44.
 * Dentro quattro file di vasi con le piante, la manichetta a goccia, il corridoio al centro.
 * Le fasi (0–5): messa a dimora, fertirrigazione, fioritura, frutto verde, raccolta, marmellata.
 */

const X0 = -20, X1 = -44, R = 4.5, PARETE = 1.2;
const FILE = [-3.1, -1.65, 1.65, 3.1];
const PRIMO = -23.6, PASSO = 0.78;

const CRESCITA = [0.42, 0.62, 0.9, 1, 1, 0.98];

function Struttura() {
  const telo = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#EEF3F0",
        transparent: true,
        opacity: 0.16,
        roughness: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    []
  );
  const tubo = useMemo(() => new THREE.MeshLambertMaterial({ color: "#B9BDB8" }), []);
  const volta = useMemo(() => {
    const g = new THREE.CylinderGeometry(R, R, X0 - X1, 40, 1, true, 0, Math.PI);
    g.rotateZ(Math.PI / 2);
    g.translate((X0 + X1) / 2, PARETE, 0);
    return g;
  }, []);
  // le testate: semicerchio sopra un rettangolo; quella davanti con la porta
  const testata = (conPorta: boolean) => {
    const s = new THREE.Shape();
    s.moveTo(-R, 0);
    s.lineTo(-R, PARETE);
    s.absarc(0, PARETE, R, Math.PI, 0, true);
    s.lineTo(R, 0);
    s.closePath();
    if (conPorta) {
      const h = new THREE.Path();
      h.moveTo(-1.3, 0);
      h.lineTo(1.3, 0);
      h.lineTo(1.3, 2.6);
      h.lineTo(-1.3, 2.6);
      h.closePath();
      s.holes.push(h);
    }
    const g = new THREE.ShapeGeometry(s, 24);
    g.rotateY(Math.PI / 2);
    return g;
  };
  const davanti = useMemo(() => testata(true), []);
  const dietro = useMemo(() => testata(false), []);
  const archi = useMemo(() => {
    const pezzi: THREE.BufferGeometry[] = [];
    for (let x = X0; x >= X1 - 0.01; x -= 2) {
      const a = new THREE.TorusGeometry(R, 0.035, 5, 28, Math.PI);
      a.rotateY(Math.PI / 2);
      a.translate(x, PARETE, 0);
      pezzi.push(a);
      for (const z of [-R, R]) pezzi.push(new THREE.CylinderGeometry(0.035, 0.035, PARETE, 5).translate(x, PARETE / 2, z));
    }
    // il colmo e due correnti
    pezzi.push(new THREE.CylinderGeometry(0.03, 0.03, X0 - X1, 5).rotateZ(Math.PI / 2).translate((X0 + X1) / 2, PARETE + R, 0));
    for (const s of [-1, 1])
      pezzi.push(new THREE.CylinderGeometry(0.03, 0.03, X0 - X1, 5).rotateZ(Math.PI / 2).translate((X0 + X1) / 2, PARETE + R * 0.7, s * R * 0.71));
    return mergeGeometries(pezzi.map((g) => g.toNonIndexed()));
  }, []);
  const lati = useMemo(() => new THREE.PlaneGeometry(X0 - X1, PARETE), []);
  return (
    <group>
      <mesh geometry={volta} material={telo} renderOrder={2} />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={lati} material={telo} position={[(X0 + X1) / 2, PARETE / 2, s * R]} renderOrder={2} />
      ))}
      <mesh geometry={davanti} material={telo} position={[X0, 0, 0]} renderOrder={2} />
      <mesh geometry={dietro} material={telo} position={[X1, 0, 0]} renderOrder={2} />
      <mesh geometry={archi} material={tubo} castShadow />
      {/* il telo pacciamante bianco a terra */}
      <mesh rotation-x={-Math.PI / 2} position={[(X0 + X1) / 2, 0.03, 0]} receiveShadow>
        <planeGeometry args={[X0 - X1, R * 2]} />
        <meshLambertMaterial color="#D8D9D2" />
      </mesh>
      {/* il corridoio in terra battuta */}
      <mesh rotation-x={-Math.PI / 2} position={[(X0 + X1) / 2, 0.04, 0]} receiveShadow>
        <planeGeometry args={[X0 - X1, 2.2]} />
        <meshLambertMaterial color="#9A7A5E" />
      </mesh>
      {/* il cartello sulla porta */}
      <Cartello />
    </group>
  );
}

function Cartello() {
  const t = useMemo(
    () => scritta("SERRA · MIRTILLI", { larghezza: 1024, altezza: 160, font: "500 72px 'IBM Plex Mono', monospace", colore: "#F3F1EB", fondo: "#183F35" }),
    []
  );
  return (
    <mesh position={[X0 + 0.05, 3.1, 0]} rotation-y={Math.PI / 2}>
      <planeGeometry args={[2.6, 0.4]} />
      <meshLambertMaterial map={t} />
    </mesh>
  );
}

type Pianta = { x: number; z: number; ry: number; s: number };
type Bacca = { p: number; o: THREE.Vector3; meta: boolean };

function Piante({ fase }: { fase: number }) {
  const { piante, bacche, cespuglio } = useMemo(() => {
    const caso = generatore(1234);
    const piante: Pianta[] = [];
    for (const z of FILE) for (let x = PRIMO; x > X1 + 1; x -= PASSO) piante.push({ x, z, ry: caso() * 6.28, s: 0.85 + caso() * 0.3 });
    // il cespuglio: tre masse su rametti
    const pezzi: THREE.BufferGeometry[] = [];
    const masse = [new THREE.Vector3(0, 0.62, 0), new THREE.Vector3(0.18, 0.88, 0.08), new THREE.Vector3(-0.14, 0.95, -0.1)];
    masse.forEach((c, i) => {
      const g = new THREE.IcosahedronGeometry(0.3 - i * 0.05, 1);
      const pos = g.attributes.position as THREE.BufferAttribute;
      for (let k = 0; k < pos.count; k++) pos.setXYZ(k, pos.getX(k) * (0.85 + caso() * 0.3), pos.getY(k) * (0.8 + caso() * 0.3), pos.getZ(k) * (0.85 + caso() * 0.3));
      g.translate(c.x, c.y, c.z);
      pezzi.push(g.toNonIndexed());
    });
    const cespuglio = mergeGeometries(pezzi);
    cespuglio.computeVertexNormals();
    // le bacche: sulla superficie delle masse, a grappoli
    const bacche: Bacca[] = [];
    piante.forEach((_, p) => {
      for (let k = 0; k < 18; k++) {
        const c = masse[k % 3];
        const r = 0.3 - (k % 3) * 0.05;
        const a = caso() * 6.28, b = 0.2 + caso() * 1.2;
        const o = new THREE.Vector3(Math.sin(b) * Math.cos(a), Math.cos(b) * 0.7, Math.sin(b) * Math.sin(a)).multiplyScalar(r * 1.02).add(c);
        bacche.push({ p, o, meta: caso() < 0.5 });
      }
    });
    return { piante, bacche, cespuglio };
  }, []);

  const vasi = useRef<THREE.InstancedMesh>(null);
  const foglie = useRef<THREE.InstancedMesh>(null);
  const frutti = useRef<THREE.InstancedMesh>(null);
  const fiori = useRef<THREE.InstancedMesh>(null);
  const stato = useRef({ g: CRESCITA[fase], fiori: 0, frutti: 0, blu: 0, meta: 1, primo: true });
  const colore = useMemo(() => ({ verde: new THREE.Color("#86A65B"), rosa: new THREE.Color("#B5677A"), blu: new THREE.Color("#2F3C70"), c: new THREE.Color() }), []);

  useEffect(() => {
    if (!vasi.current) return;
    piante.forEach((p, i) => vasi.current!.setMatrixAt(i, posa(p.x, 0, p.z, p.ry)));
    vasi.current.instanceMatrix.needsUpdate = true;
  }, [piante]);

  useFrame((_, dt) => {
    const s = stato.current;
    const obiettivo = {
      g: CRESCITA[fase],
      fiori: fase === 2 ? 1 : 0,
      frutti: fase >= 3 ? 1 : 0,
      blu: fase >= 4 ? 1 : fase === 3 ? 0.18 : 0,
      meta: fase === 5 ? 0 : 1,
    };
    const prima = { ...s };
    s.g = smorza(s.g, obiettivo.g, 2.5, dt);
    s.fiori = smorza(s.fiori, obiettivo.fiori, 3, dt);
    s.frutti = smorza(s.frutti, obiettivo.frutti, 2.5, dt);
    s.blu = smorza(s.blu, obiettivo.blu, 2, dt);
    s.meta = smorza(s.meta, obiettivo.meta, 3, dt);
    const fermo = !s.primo && Math.abs(prima.g - s.g) + Math.abs(prima.fiori - s.fiori) + Math.abs(prima.frutti - s.frutti) + Math.abs(prima.blu - s.blu) + Math.abs(prima.meta - s.meta) < 1e-5;
    if (fermo || !foglie.current || !frutti.current || !fiori.current) return;
    s.primo = false;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), su = new THREE.Vector3(0, 1, 0), v = new THREE.Vector3(), sc = new THREE.Vector3();
    piante.forEach((p, i) => {
      q.setFromAxisAngle(su, p.ry);
      m.compose(v.set(p.x, 0.3, p.z), q, sc.setScalar(p.s * s.g));
      foglie.current!.setMatrixAt(i, m);
    });
    foglie.current.instanceMatrix.needsUpdate = true;
    if (s.blu < 0.5) colore.c.copy(colore.verde).lerp(colore.rosa, s.blu * 2);
    else colore.c.copy(colore.rosa).lerp(colore.blu, (s.blu - 0.5) * 2);
    bacche.forEach((b, i) => {
      const p = piante[b.p];
      q.setFromAxisAngle(su, p.ry);
      v.copy(b.o).applyQuaternion(q).multiplyScalar(p.s * s.g).add(new THREE.Vector3(p.x, 0.3, p.z));
      const k = b.meta ? s.meta : 1;
      m.compose(v, q, sc.setScalar(s.frutti * k * (0.6 + 0.4 * s.blu)));
      frutti.current!.setMatrixAt(i, m);
      frutti.current!.setColorAt(i, colore.c);
      m.compose(v, q, sc.setScalar(s.fiori));
      fiori.current!.setMatrixAt(i, m);
    });
    frutti.current.instanceMatrix.needsUpdate = true;
    if (frutti.current.instanceColor) frutti.current.instanceColor.needsUpdate = true;
    fiori.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={vasi} args={[undefined, undefined, piante.length]} castShadow receiveShadow frustumCulled={false}>
        <cylinderGeometry args={[0.24, 0.19, 0.34, 12]} />
        <meshLambertMaterial color="#1E1F1E" />
      </instancedMesh>
      <instancedMesh ref={foglie} args={[cespuglio, undefined, piante.length]} castShadow receiveShadow frustumCulled={false}>
        <meshLambertMaterial color="#4E6E37" flatShading />
      </instancedMesh>
      <instancedMesh ref={frutti} args={[undefined, undefined, bacche.length]} frustumCulled={false}>
        <sphereGeometry args={[0.032, 6, 4]} />
        <meshStandardMaterial roughness={0.45} color="#FFFFFF" />
      </instancedMesh>
      <instancedMesh ref={fiori} args={[undefined, undefined, bacche.length]} frustumCulled={false}>
        <coneGeometry args={[0.03, 0.05, 5, 1, true]} />
        <meshLambertMaterial color="#F6F1E6" side={THREE.DoubleSide} />
      </instancedMesh>
      {/* le manichette a goccia lungo le file */}
      {FILE.map((z) => (
        <mesh key={z} position={[(PRIMO + X1) / 2 + 0.5, 0.36, z + 0.2]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.012, 0.012, PRIMO - X1, 4]} />
          <meshLambertMaterial color="#111" />
        </mesh>
      ))}
      <Gocce attive={fase === 1} piante={piante} />
      <Bombi attivi={fase === 2} />
    </group>
  );
}

/** Le gocce: cadono dal gocciolatore nel vaso, solo nella fase della fertirrigazione. */
function Gocce({ attive, piante }: { attive: boolean; piante: Pianta[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const t = useRef(0);
  const vis = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    vis.current = smorza(vis.current, attive ? 1 : 0, 4, dt);
    const m = ref.current;
    if (!m) return;
    m.visible = vis.current > 0.02;
    if (!m.visible) return;
    const mt = new THREE.Matrix4();
    piante.forEach((p, i) => {
      const k = (t.current * 0.9 + i * 0.137) % 1;
      mt.makeScale(vis.current, vis.current * 1.6, vis.current).setPosition(p.x, 0.36 - k * 0.12, p.z + 0.2);
      m.setMatrixAt(i, mt);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, piante.length]} frustumCulled={false}>
      <sphereGeometry args={[0.018, 6, 4]} />
      <meshStandardMaterial color="#9CC9E6" roughness={0.1} transparent opacity={0.85} />
    </instancedMesh>
  );
}

/** I bombi dell'impollinazione: girano fra le piante vicino all'ingresso. */
function Bombi({ attivi }: { attivi: boolean }) {
  const g = useRef<THREE.Group>(null);
  const caso = useMemo(() => generatore(55), []);
  const voli = useMemo(() => Array.from({ length: 9 }, () => ({ cx: PRIMO - caso() * 7, cz: FILE[Math.floor(caso() * 4)], r: 0.25 + caso() * 0.4, v: 1.5 + caso() * 2, f: caso() * 6 })), [caso]);
  useFrame(({ clock }) => {
    if (!g.current) return;
    g.current.visible = attivi;
    if (!attivi) return;
    const t = clock.elapsedTime;
    g.current.children.forEach((b, i) => {
      const v = voli[i];
      b.position.set(v.cx + Math.cos(t * v.v + v.f) * v.r, 1.0 + Math.sin(t * 3 + v.f) * 0.12, v.cz + Math.sin(t * v.v * 1.3 + v.f) * v.r);
      b.rotation.y = -t * v.v;
    });
  });
  return (
    <group ref={g} visible={false}>
      {voli.map((_, i) => (
        <group key={i}>
          <mesh scale={[1.3, 1, 1]}>
            <sphereGeometry args={[0.03, 8, 6]} />
            <meshLambertMaterial color="#E1B22E" />
          </mesh>
          <mesh position={[-0.03, 0, 0]} scale={[1, 0.95, 0.95]}>
            <sphereGeometry args={[0.028, 8, 6]} />
            <meshLambertMaterial color="#1A1714" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Le cassette di mirtilli (raccolta) e il tavolo con i vasetti (marmellata). */
function Raccolta({ fase }: { fase: number }) {
  const [cassetta, setCassetta] = useState<{ geometria: THREE.BufferGeometry; materiale: THREE.Material } | null>(null);
  useEffect(() => {
    let vivo = true;
    modello("cassetta.glb", 0.3).then((m) => vivo && setCassetta(m));
    return () => {
      vivo = false;
    };
  }, []);
  const etichetta = useMemo(
    () => scritta("MIRTILLI · ANGILLETTI", { larghezza: 512, altezza: 128, font: "500 40px 'IBM Plex Mono', monospace", colore: "#2A2016", fondo: "#F1E7D0" }),
    []
  );
  const vetro = useMemo(() => new THREE.MeshStandardMaterial({ color: "#E9F1F3", transparent: true, opacity: 0.32, roughness: 0.05 }), []);
  const g1 = useRef<THREE.Group>(null), g2 = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    for (const [g, su] of [[g1.current, fase === 4], [g2.current, fase === 5]] as const) {
      if (!g) continue;
      const s = smorza(g.scale.x, su ? 1 : 0.001, 4, dt);
      g.scale.setScalar(s);
      g.visible = s > 0.01;
    }
  });
  return (
    <group>
      <group ref={g1} position={[-27.5, 0.05, 0.2]} scale={0.001}>
        {cassetta &&
          [0, 1, 2].map((k) => (
            <group key={k} position={[-k * 1.1, 0, (k % 2) * 0.25 - 0.1]} rotation-y={k * 0.15}>
              <mesh geometry={cassetta.geometria} material={cassetta.materiale} castShadow />
              <mesh position={[0, 0.24, 0]}>
                <boxGeometry args={[0.48, 0.03, 0.34]} />
                <meshStandardMaterial color="#2C3567" roughness={0.6} />
              </mesh>
            </group>
          ))}
      </group>
      <group ref={g2} position={[-24.6, 0, 0]} scale={0.001}>
        {/* il tavolo */}
        <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.06, 0.9]} />
          <meshLambertMaterial color="#8A6343" />
        </mesh>
        {[[-0.72, -0.38], [0.72, -0.38], [-0.72, 0.38], [0.72, 0.38]].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0.4, z]}>
            <boxGeometry args={[0.06, 0.8, 0.06]} />
            <meshLambertMaterial color="#6A4A31" />
          </mesh>
        ))}
        {/* i vasetti */}
        {Array.from({ length: 6 }, (_, i) => {
          const x = -0.55 + (i % 3) * 0.26, z = i < 3 ? -0.15 : 0.15;
          return (
            <group key={i} position={[x, 0.85, z]} rotation-y={Math.PI / 2 + 0.2 * (i - 2)}>
              <mesh position={[0, 0.07, 0]} material={vetro}>
                <cylinderGeometry args={[0.07, 0.07, 0.15, 16]} />
              </mesh>
              <mesh position={[0, 0.065, 0]}>
                <cylinderGeometry args={[0.064, 0.064, 0.12, 16]} />
                <meshStandardMaterial color="#3C1734" roughness={0.25} />
              </mesh>
              <mesh position={[0, 0.16, 0]}>
                <cylinderGeometry args={[0.072, 0.072, 0.03, 16]} />
                <meshStandardMaterial color="#C9A34A" metalness={0.6} roughness={0.35} />
              </mesh>
              <mesh position={[0, 0.07, 0.0715]}>
                <planeGeometry args={[0.13, 0.06]} />
                <meshLambertMaterial map={etichetta} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

export default function Serra({ fase }: { fase: number }) {
  return (
    <group>
      <Struttura />
      <Piante fase={fase} />
      <Raccolta fase={fase} />
    </group>
  );
}
