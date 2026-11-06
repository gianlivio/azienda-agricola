"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { generatore, smorza } from "./base";

/*
 * Il campo di mais: x da 18 a 44, z da −13 a 13, file lungo x (chi guarda dallo spiazzo vede i corridoi).
 * Fasi (0–5): semina, emergenza, crescita, fioritura, maturazione, raccolta.
 */

const XA = 18.5, XB = 44, ZA = -12.6, ZB = 12.6;
const FRA_FILE = 0.75, SULLA_FILA = 0.46;

/** Altezza (y) e larghezza della pianta per fase. */
const ALTEZZA = [0, 0.13, 0.62, 1, 1, 0.2];
const LARGO = [0, 0.3, 0.85, 1, 0.95, 0.75];
const VERDE = ["#5E8A3A", "#6C9A3E", "#5A8838", "#56833A", "#C3A861", "#AE9864"];

function geometriaPianta() {
  const pezzi: THREE.BufferGeometry[] = [];
  pezzi.push(new THREE.CylinderGeometry(0.014, 0.022, 2.2, 5, 1).translate(0, 1.1, 0));
  // le foglie: nastri curvi che escono dal fusto e ricadono
  const n = 7;
  for (let i = 0; i < n; i++) {
    const g = new THREE.PlaneGeometry(0.075, 0.85, 1, 4);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let k = 0; k < pos.count; k++) {
      const t = (pos.getY(k) + 0.425) / 0.85; // 0 alla base, 1 in punta
      pos.setX(k, pos.getX(k) * (1 - t * 0.8));
      pos.setY(k, t * 0.62);
      pos.setZ(k, t * 0.55 - t * t * 0.32);
    }
    g.rotateY((i * 2.4) % 6.28);
    g.translate(0, 0.25 + i * 0.26, 0);
    pezzi.push(g);
  }
  const g = mergeGeometries(pezzi.map((p) => (p.index ? p.toNonIndexed() : p)));
  g.computeVertexNormals();
  return g;
}

function geometriaPennacchio() {
  const pezzi: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) {
    const c = new THREE.ConeGeometry(0.012, 0.32, 3);
    c.translate(0, 0.16, 0);
    c.rotateZ(0.35);
    c.rotateY(i * 1.26);
    c.translate(0, 2.2, 0);
    pezzi.push(c.toNonIndexed());
  }
  pezzi.push(new THREE.ConeGeometry(0.01, 0.4, 3).translate(0, 2.4, 0).toNonIndexed());
  return mergeGeometries(pezzi);
}

function geometriaSpiga() {
  const s = new THREE.CylinderGeometry(0.03, 0.022, 0.24, 6).rotateZ(0.32).translate(0.05, 1.12, 0).toNonIndexed();
  return s;
}

function Terra({ fase }: { fase: number }) {
  // i solchi: righe scure su terra lavorata, una ogni fila
  const solchi = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 256;
    const x = c.getContext("2d") as CanvasRenderingContext2D;
    x.fillStyle = "#7A4F35";
    x.fillRect(0, 0, 32, 256);
    for (let i = 0; i < 400; i++) {
      x.fillStyle = `rgba(${40 + Math.random() * 60},${25 + Math.random() * 30},${15},${0.2 + Math.random() * 0.3})`;
      x.fillRect(Math.random() * 32, Math.random() * 256, 2, 2);
    }
    const g = x.createLinearGradient(0, 0, 32, 0);
    g.addColorStop(0, "rgba(40,22,12,0.0)");
    g.addColorStop(0.5, "rgba(40,22,12,0.55)");
    g.addColorStop(1, "rgba(40,22,12,0.0)");
    x.fillStyle = g;
    x.fillRect(10, 0, 12, 256);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set((ZB - ZA) / FRA_FILE, 4);
    return t;
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2} position={[(XA + XB) / 2, 0.03, 0]} receiveShadow>
      <planeGeometry args={[ZB - ZA + 1, XB - XA + 1]} />
      <meshLambertMaterial map={solchi} color={fase === 5 ? "#D9C2A0" : "#FFFFFF"} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
  );
}

function Piante({ fase }: { fase: number }) {
  const { posti, pianta, pennacchio, spiga } = useMemo(() => {
    const caso = generatore(808);
    const posti: { x: number; z: number; ry: number; s: number; h: number }[] = [];
    for (let z = ZA; z <= ZB; z += FRA_FILE)
      for (let x = XA; x <= XB; x += SULLA_FILA)
        posti.push({ x: x + (caso() - 0.5) * 0.12, z: z + (caso() - 0.5) * 0.08, ry: caso() * 6.28, s: 0.9 + caso() * 0.2, h: 0.88 + caso() * 0.24 });
    return { posti, pianta: geometriaPianta(), pennacchio: geometriaPennacchio(), spiga: geometriaSpiga() };
  }, []);
  const a = useRef<THREE.InstancedMesh>(null);
  const b = useRef<THREE.InstancedMesh>(null);
  const c = useRef<THREE.InstancedMesh>(null);
  const matPianta = useMemo(() => new THREE.MeshLambertMaterial({ color: VERDE[fase], side: THREE.DoubleSide }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const matPenn = useMemo(() => new THREE.MeshLambertMaterial({ color: "#D8C58A" }), []);
  const matSpiga = useMemo(() => new THREE.MeshLambertMaterial({ color: "#8FAF5A" }), []);
  const stato = useRef({ h: ALTEZZA[fase], l: LARGO[fase], fiore: 0, primo: true });
  const bersaglio = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    const s = stato.current;
    const ph = s.h, pl = s.l, pf = s.fiore;
    s.h = smorza(s.h, ALTEZZA[fase], 1.8, dt);
    s.l = smorza(s.l, LARGO[fase], 1.8, dt);
    s.fiore = smorza(s.fiore, fase === 3 || fase === 4 ? 1 : 0, 2.5, dt);
    bersaglio.set(VERDE[fase]);
    matPianta.color.lerp(bersaglio, 1 - Math.exp(-2 * dt));
    matSpiga.color.lerp(bersaglio.set(fase === 4 ? "#C8B26A" : "#8FAF5A"), 1 - Math.exp(-2 * dt));
    if (!s.primo && Math.abs(ph - s.h) + Math.abs(pl - s.l) + Math.abs(pf - s.fiore) < 1e-5) return;
    s.primo = false;
    if (!a.current || !b.current || !c.current) return;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), su = new THREE.Vector3(0, 1, 0);
    posti.forEach((p, i) => {
      q.setFromAxisAngle(su, p.ry);
      const h = Math.max(0.0001, s.h * p.h), l = Math.max(0.0001, s.l * p.s);
      m.compose(v.set(p.x, 0, p.z), q, sc.set(l, h, l));
      a.current!.setMatrixAt(i, m);
      const f = Math.max(0.0001, s.fiore);
      m.compose(v.set(p.x, 0, p.z), q, sc.set(l * f, h, l * f));
      b.current!.setMatrixAt(i, m);
      c.current!.setMatrixAt(i, m);
    });
    a.current.instanceMatrix.needsUpdate = true;
    b.current.instanceMatrix.needsUpdate = true;
    c.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh ref={a} args={[pianta, matPianta, posti.length]} castShadow receiveShadow frustumCulled={false} />
      <instancedMesh ref={b} args={[pennacchio, matPenn, posti.length]} frustumCulled={false} />
      <instancedMesh ref={c} args={[spiga, matSpiga, posti.length]} frustumCulled={false} />
    </group>
  );
}

/* ------------------------------------------------------------------ il trattore */

function Ruota({ r, l, x, z }: { r: number; l: number; x: number; z: number }) {
  return (
    <group position={[x, r, z]} rotation-x={Math.PI / 2}>
      <mesh castShadow>
        <cylinderGeometry args={[r, r, l, 18]} />
        <meshLambertMaterial color="#1B1B1B" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[r * 0.55, r * 0.55, l + 0.02, 12]} />
        <meshLambertMaterial color="#C9A23A" />
      </mesh>
    </group>
  );
}

function Trattore({ carico, seminatrice }: { carico: boolean; seminatrice: boolean }) {
  const rosso = "#B3322A";
  const pannocchie = useMemo(() => {
    const caso = generatore(19);
    return Array.from({ length: 70 }, () => ({
      p: [-3.2 + caso() * 2.2, 1.15 + caso() * 0.35, -0.6 + caso() * 1.2] as [number, number, number],
      r: [caso() * 3, caso() * 3, caso() * 3] as [number, number, number],
    }));
  }, []);
  return (
    <group>
      {/* corpo: il muso va verso +x */}
      <mesh position={[0.9, 0.95, 0]} castShadow>
        <boxGeometry args={[1.7, 0.7, 0.8]} />
        <meshLambertMaterial color={rosso} />
      </mesh>
      <mesh position={[-0.2, 1.05, 0]} castShadow>
        <boxGeometry args={[0.9, 0.6, 1.1]} />
        <meshLambertMaterial color={rosso} />
      </mesh>
      <mesh position={[-0.25, 1.55, 0]} castShadow>
        <boxGeometry args={[0.6, 0.12, 0.6]} />
        <meshLambertMaterial color="#2A2A2A" />
      </mesh>
      {/* il roll-bar */}
      {[-0.55, 0.55].map((z) => (
        <mesh key={z} position={[-0.55, 1.9, z]}>
          <boxGeometry args={[0.06, 1.3, 0.06]} />
          <meshLambertMaterial color="#2A2A2A" />
        </mesh>
      ))}
      <mesh position={[-0.55, 2.55, 0]}>
        <boxGeometry args={[0.06, 0.06, 1.16]} />
        <meshLambertMaterial color="#2A2A2A" />
      </mesh>
      {/* il tubo di scarico */}
      <mesh position={[1.35, 1.6, 0.25]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
        <meshLambertMaterial color="#2A2A2A" />
      </mesh>
      <Ruota r={0.72} l={0.42} x={-0.35} z={0.72} />
      <Ruota r={0.72} l={0.42} x={-0.35} z={-0.72} />
      <Ruota r={0.4} l={0.25} x={1.45} z={0.55} />
      <Ruota r={0.4} l={0.25} x={1.45} z={-0.55} />
      {seminatrice && (
        <group position={[-1.5, 0, 0]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[0.5, 0.25, 3.0]} />
            <meshLambertMaterial color="#2F6A9A" />
          </mesh>
          {[-1.1, -0.37, 0.37, 1.1].map((z) => (
            <group key={z}>
              <mesh position={[0, 0.85, z]} castShadow>
                <cylinderGeometry args={[0.2, 0.14, 0.4, 10]} />
                <meshLambertMaterial color="#2F6A9A" />
              </mesh>
              <mesh position={[0, 0.2, z]} rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[0.2, 0.2, 0.05, 12]} />
                <meshLambertMaterial color="#333" />
              </mesh>
            </group>
          ))}
        </group>
      )}
      {carico && (
        <group>
          {/* il rimorchio */}
          <mesh position={[-2.1, 0.95, 0]} castShadow>
            <boxGeometry args={[2.6, 0.12, 1.6]} />
            <meshLambertMaterial color="#6E7A42" />
          </mesh>
          {[-0.8, 0.8].map((z) => (
            <mesh key={z} position={[-2.1, 1.25, z]}>
              <boxGeometry args={[2.6, 0.5, 0.06]} />
              <meshLambertMaterial color="#6E7A42" />
            </mesh>
          ))}
          <mesh position={[-3.4, 1.25, 0]}>
            <boxGeometry args={[0.06, 0.5, 1.6]} />
            <meshLambertMaterial color="#6E7A42" />
          </mesh>
          <Ruota r={0.42} l={0.25} x={-2.1} z={0.85} />
          <Ruota r={0.42} l={0.25} x={-2.1} z={-0.85} />
          {pannocchie.map((p, i) => (
            <mesh key={i} position={p.p} rotation={p.r} castShadow>
              <cylinderGeometry args={[0.045, 0.035, 0.24, 7]} />
              <meshLambertMaterial color={i % 5 === 0 ? "#E0B640" : "#EFC64A"} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

/** Nella semina il trattore percorre il campo avanti e indietro; nella raccolta aspetta col rimorchio pieno. */
function TrattoreInCampo({ fase }: { fase: number }) {
  const g = useRef<THREE.Group>(null);
  const t = useRef(0);
  useEffect(() => {
    t.current = 0;
  }, [fase]);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.visible = fase === 0 || fase === 5;
    if (fase === 0) {
      t.current += dt;
      const giro = (t.current * 1.6) % ((XB - XA) * 2);
      const andata = giro < XB - XA;
      const x = andata ? XA + giro : XB - (giro - (XB - XA));
      const z = -2.2 + Math.floor((t.current * 1.6) / ((XB - XA) * 2)) % 4 * 3;
      g.current.position.set(x, 0, z);
      g.current.rotation.y = andata ? 0 : Math.PI;
    } else if (fase === 5) {
      g.current.position.set(27, 0, -6.6);
      g.current.rotation.y = 0.25;
    }
  });
  return (
    <group ref={g}>
      <Trattore carico={fase === 5} seminatrice={fase === 0} />
    </group>
  );
}

export default function Mais({ fase }: { fase: number }) {
  return (
    <group>
      <Terra fase={fase} />
      <Piante fase={fase} />
      <TrattoreInCampo fase={fase} />
    </group>
  );
}
