"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { ZONE, zona, type ZonaId } from "@/content/azienda";
import { pillola } from "./mondo/base";
import Terreno from "./mondo/Terreno";
import Casale from "./mondo/Casale";
import Serra from "./mondo/Serra";
import Mais from "./mondo/Mais";
import Uliveto from "./mondo/Uliveto";
import Frantoio from "./mondo/Frantoio";
import Persone from "./mondo/Persone";
import Oggetti from "./mondo/Oggetti";
import Furgone, { Cartello } from "./mondo/Furgone";
import { ALTROVE, CARTELLO_ULIVETI, FURGONE_FATTORIA, altrove } from "@/content/luoghi";

export type Modo = "guida" | "cammina";
export type Movimento = { x: number; y: number };

type Props = {
  modo: Modo;
  zonaId: ZonaId;
  fasi: Record<ZonaId, number>;
  cancelloAperto: boolean;
  parlante: string | null;
  stretto: boolean;
  ridotto: boolean;
  movimento: React.MutableRefObject<Movimento>;
  onVai: (id: ZonaId) => void;
  onVicina: (id: ZonaId) => void;
  onParla: (id: string) => void;
  onPronta: () => void;
  onMosso: () => void;
  /** il velo nero del viaggio in furgone, con la scritta */
  schermo: React.RefObject<HTMLDivElement | null>;
};

/** In quale area sta un punto: la fattoria o l'area lontana degli uliveti. */
const lontano = (z: number) => z < ALTROVE[2] / 2;
const ZONE_LONTANE: ZonaId[] = ["uliveto", "frantoio"];

/** Il sole basso del tramonto, dalla stessa parte del sole del cielo (a +x, +z). */
const SOLE = new THREE.Vector3(0.81, 0.36, 0.59).normalize();
const OCCHI = 1.7;

function Cielo() {
  const { scene } = useThree();
  useEffect(() => {
    const t = new THREE.TextureLoader().load("/scena/cielo-tramonto.jpg");
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.colorSpace = THREE.SRGBColorSpace;
    scene.background = t;
    scene.backgroundIntensity = 1.05;
    scene.environment = t;
    scene.environmentIntensity = 0.45;
    scene.fog = new THREE.Fog("#B9A894", 80, 290);
    return () => {
      scene.background = null;
      scene.environment = null;
      t.dispose();
    };
  }, [scene]);
  return null;
}

function Luci({ ombre }: { ombre: boolean }) {
  const sole = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();
  useEffect(() => {
    const l = sole.current;
    if (!l) return;
    l.target.position.set(0, 0, -20);
    scene.add(l.target);
    const c = l.shadow.camera as THREE.OrthographicCamera;
    c.left = -75;
    c.right = 75;
    c.top = 75;
    c.bottom = -75;
    c.near = 1;
    c.far = 260;
    c.updateProjectionMatrix();
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.04;
    return () => {
      scene.remove(l.target);
    };
  }, [scene]);
  const p = SOLE.clone().multiplyScalar(120).add(new THREE.Vector3(0, 0, -20));
  // le ombre seguono l'area in cui si è: la fattoria o gli uliveti lontani
  useFrame(({ camera }) => {
    const l = sole.current;
    if (!l) return;
    const cz = lontano(camera.position.z) ? ALTROVE[2] - 45 : -20;
    if (l.target.position.z !== cz) {
      l.target.position.set(0, 0, cz);
      l.position.copy(SOLE).multiplyScalar(120).add(l.target.position);
    }
  });
  return (
    <>
      <hemisphereLight args={["#D2DCE8", "#8A6A52", 1.6]} />
      <directionalLight
        ref={sole}
        position={p}
        intensity={3.6}
        color="#FFD6A8"
        castShadow={ombre}
        shadow-mapSize={[2048, 2048]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ la camera */

const verso = (da: THREE.Vector3, a: THREE.Vector3) => {
  const d = a.clone().sub(da);
  return { yaw: Math.atan2(-d.x, -d.z), pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)) };
};
const facile = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const angolo = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** I centri delle aree, per sapere dove si trova chi cammina. */
const AREE: [ZonaId, number, number][] = [
  ["cancello", 0, 14],
  ["spiazzo", 1, 0],
  ["serra", -15.5, -22.7],
  ["mais", 30, -25],
  ["uliveto", 6, -50 + ALTROVE[2]],
  ["frantoio", -14, -43 + ALTROVE[2]],
];

/** Le strade del furgone: in partenza dalla fattoria, in arrivo all'uliveto, e viceversa. */
const V = (x: number, z: number) => new THREE.Vector3(x, 0, z);
const VA = (x: number, z: number) => new THREE.Vector3(...altrove([x, 0, z]));
const STRADE = {
  esceFattoria: [V(-3.2, 1.2), V(-0.6, 4.6), V(0, 7.6), V(3, 9.6), V(14, 8.4), V(34, 7), V(62, 6.5)],
  // rientrando fa il giro dietro il parcheggio, per fermarsi di nuovo col muso verso il cancello
  entraFattoria: [V(62, 6.5), V(34, 7), V(14, 8.4), V(3, 9.6), V(0, 7.6), V(0, 3.5), V(-2, -3), V(-5, -7.5), V(-8, -7), V(-7.2, -5.2), V(FURGONE_FATTORIA.p[0], FURGONE_FATTORIA.p[2])],
  esceUliveto: [VA(12, -22), VA(8, -19), VA(10, -8), VA(13.6, 6), VA(14, 40), VA(14, 75)],
  entraUliveto: [VA(14, 75), VA(14, 30), VA(14, 0), VA(14, -16)],
};
type Viaggio = { fase: "sale" | "parte" | "buio" | "arriva"; t: number; andata: THREE.CatmullRomCurve3; ritorno: THREE.CatmullRomCurve3; verso: "uliveto" | "fattoria" };

function Regia({
  modo,
  zonaId,
  movimento,
  onVicina,
  onMosso,
  stretto,
  furgone,
  schermo,
}: Pick<Props, "modo" | "zonaId" | "movimento" | "onVicina" | "onMosso" | "stretto" | "schermo"> & { furgone: React.RefObject<THREE.Group | null> }) {
  const { camera, gl } = useThree();
  const st = useRef({
    yaw: 0,
    pitch: 0,
    offYaw: 0,
    offPitch: 0,
    volo: null as null | { da: THREE.Vector3; a: THREE.Vector3; ctrl: THREE.Vector3; daYaw: number; aYaw: number; daPitch: number; aPitch: number; t: number; durata: number },
    vicina: "cancello" as ZonaId,
    premuto: false,
    puntatore: -1,
    ultimo: { x: 0, y: 0 },
    tasti: new Set<string>(),
    viaggio: null as Viaggio | null,
    zona: zonaId,
  });
  st.current.zona = zonaId;
  const subito = typeof location !== "undefined" && location.search.includes("subito");

  /** Prepara il volo della camera verso un punto, guardando un altro. */
  const vola = (a: THREE.Vector3, guarda: THREE.Vector3, durata?: number) => {
    const s = st.current;
    const da = camera.position.clone();
    const fine = verso(a, guarda);
    const d = da.distanceTo(a);
    const ctrl = da.clone().add(a).multiplyScalar(0.5);
    ctrl.y += Math.min(d * 0.32, 26);
    const yawAttuale = s.yaw + s.offYaw, pitchAttuale = s.pitch + s.offPitch;
    s.offYaw = 0;
    s.offPitch = 0;
    s.volo = {
      da,
      a,
      ctrl,
      daYaw: yawAttuale,
      aYaw: yawAttuale + angolo(fine.yaw - yawAttuale),
      daPitch: pitchAttuale,
      aPitch: fine.pitch,
      t: 0,
      // ?subito: niente volo (serve alle prove automatiche)
      durata: subito ? 0.001 : (durata ?? THREE.MathUtils.clamp(d / 14, 1.4, 3.6)),
    };
  };
  /** Dietro il furgone, come in un gioco di guida. */
  const dietroAlFurgone = () => {
    const f = furgone.current as THREE.Group;
    const avanti = new THREE.Vector3(-Math.sin(f.rotation.y), 0, -Math.cos(f.rotation.y));
    return {
      pos: f.position.clone().addScaledVector(avanti, -9.5).add(new THREE.Vector3(0, 3.4, 0)),
      guarda: f.position.clone().addScaledVector(avanti, 5).add(new THREE.Vector3(0, 1.2, 0)),
    };
  };

  // posizione iniziale: davanti al cancello
  useEffect(() => {
    const z = zona("cancello");
    camera.position.set(...z.camera);
    const v = verso(camera.position, new THREE.Vector3(...z.guarda));
    st.current.yaw = v.yaw;
    st.current.pitch = v.pitch;
    camera.rotation.order = "YXZ";
    if (location.search.includes("subito")) {
      // per le prove automatiche: mettere la camera in un punto, guardando un altro
      const w = window as unknown as { __camera: THREE.Camera; __guarda: (p: number[], t: number[]) => void };
      w.__camera = camera;
      w.__guarda = (p, t) => {
        camera.position.set(p[0], p[1], p[2]);
        const v = verso(camera.position, new THREE.Vector3(t[0], t[1], t[2]));
        st.current.yaw = v.yaw;
        st.current.pitch = v.pitch;
        st.current.offYaw = st.current.offPitch = 0;
      };
    }
  }, [camera]);

  // il volo verso la zona scelta; se la zona sta nell'altra area, prima il viaggio in furgone
  useEffect(() => {
    if (modo !== "guida") return;
    const s = st.current;
    if (s.viaggio) return; // a viaggio finito si va comunque alla zona scelta per ultima
    const z = zona(zonaId);
    const vaLontano = ZONE_LONTANE.includes(zonaId);
    if (vaLontano !== lontano(camera.position.z) && furgone.current) {
      const daFattoria = !vaLontano;
      s.viaggio = {
        fase: "sale",
        t: 0,
        verso: vaLontano ? "uliveto" : "fattoria",
        andata: new THREE.CatmullRomCurve3([furgone.current.position.clone(), ...(daFattoria ? STRADE.esceUliveto : STRADE.esceFattoria)]),
        ritorno: new THREE.CatmullRomCurve3(daFattoria ? STRADE.entraFattoria : STRADE.entraUliveto),
      };
      const d = dietroAlFurgone();
      vola(d.pos, d.guarda, 1.8);
      if (schermo.current) {
        const p = schermo.current.querySelector("p");
        if (p) p.textContent = vaLontano ? "In trattore verso gli uliveti…" : "Si torna in azienda…";
      }
      return;
    }
    const a = new THREE.Vector3(...z.camera);
    const fine = verso(a, new THREE.Vector3(...z.guarda));
    if (a.distanceTo(camera.position) < 0.05 && Math.abs(angolo(fine.yaw - s.yaw)) < 0.01) return;
    vola(a, new THREE.Vector3(...z.guarda));
  }, [modo, zonaId, camera]); // eslint-disable-line react-hooks/exhaustive-deps

  // passando alla camminata si parte da dove si guarda, a terra
  useEffect(() => {
    if (modo !== "cammina") return;
    const s = st.current;
    s.volo = null;
    s.yaw += s.offYaw;
    s.pitch = THREE.MathUtils.clamp(s.pitch + s.offPitch, -0.6, 0.6);
    s.offYaw = s.offPitch = 0;
  }, [modo]);

  // trascinare per guardarsi intorno; tasti per camminare
  useEffect(() => {
    const el = gl.domElement;
    const s = st.current;
    const giu = (e: PointerEvent) => {
      s.premuto = true;
      s.puntatore = e.pointerId;
      s.ultimo = { x: e.clientX, y: e.clientY };
    };
    const muovi = (e: PointerEvent) => {
      if (!s.premuto || e.pointerId !== s.puntatore) return;
      const dx = e.clientX - s.ultimo.x, dy = e.clientY - s.ultimo.y;
      s.ultimo = { x: e.clientX, y: e.clientY };
      const k = e.pointerType === "touch" ? 0.0055 : 0.0035;
      if (Math.abs(dx) + Math.abs(dy) > 0) onMosso();
      if (modo === "cammina") {
        s.yaw += dx * k;
        s.pitch = THREE.MathUtils.clamp(s.pitch + dy * k, -1.2, 1.2);
      } else {
        s.offYaw = THREE.MathUtils.clamp(s.offYaw + dx * k, -1.3, 1.3);
        s.offPitch = THREE.MathUtils.clamp(s.offPitch + dy * k, -0.5, 0.5);
      }
    };
    const su = (e: PointerEvent) => {
      if (e.pointerId === s.puntatore) s.premuto = false;
    };
    const tasto = (e: KeyboardEvent, giuTasto: boolean) => {
      if ((e.target as HTMLElement)?.closest?.("input, textarea")) return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k)) {
        if (giuTasto) s.tasti.add(k);
        else s.tasti.delete(k);
        if (k.startsWith("arrow")) e.preventDefault();
      }
    };
    const kd = (e: KeyboardEvent) => tasto(e, true);
    const ku = (e: KeyboardEvent) => tasto(e, false);
    el.addEventListener("pointerdown", giu);
    window.addEventListener("pointermove", muovi);
    window.addEventListener("pointerup", su);
    window.addEventListener("pointercancel", su);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      el.removeEventListener("pointerdown", giu);
      window.removeEventListener("pointermove", muovi);
      window.removeEventListener("pointerup", su);
      window.removeEventListener("pointercancel", su);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [gl, modo, onMosso]);

  useEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.fov = stretto ? 68 : 55;
    c.updateProjectionMatrix();
  }, [camera, stretto]);

  useFrame((_, dtGrezzo) => {
    const dt = Math.min(dtGrezzo, 0.1);
    const s = st.current;
    const f = furgone.current;
    if (s.viaggio && !s.volo && f) {
      const v = s.viaggio;
      v.t += subito ? 10 : dt;
      const velo = (o: number) => {
        if (schermo.current) schermo.current.style.opacity = String(THREE.MathUtils.clamp(o, 0, 1));
      };
      const sullaStrada = (curva: THREE.CatmullRomCurve3, u: number) => {
        const p = curva.getPointAt(THREE.MathUtils.clamp(u, 0, 1));
        const tg = curva.getTangentAt(THREE.MathUtils.clamp(u, 0, 1));
        f.position.copy(p);
        f.rotation.y = Math.atan2(-tg.x, -tg.z);
        // la camera insegue il furgone, morbida
        const d = dietroAlFurgone();
        if (v.fase === "arriva" && v.t < dt * 1.5) camera.position.copy(d.pos);
        camera.position.lerp(d.pos, 1 - Math.exp(-5 * dt));
        const g = verso(camera.position, d.guarda);
        s.yaw = s.yaw + angolo(g.yaw - s.yaw) * (1 - Math.exp(-6 * dt));
        s.pitch = THREE.MathUtils.lerp(s.pitch, g.pitch, 1 - Math.exp(-6 * dt));
      };
      if (v.fase === "sale") {
        v.fase = "parte";
        v.t = 0;
      } else if (v.fase === "parte") {
        const D = 3.6;
        sullaStrada(v.andata, Math.pow(Math.min(v.t / D, 1), 1.7));
        velo((v.t - 2.5) / 0.9);
        if (v.t >= D) {
          v.fase = "buio";
          v.t = 0;
          velo(1);
        }
      } else if (v.fase === "buio") {
        if (v.t >= 1.1) {
          v.fase = "arriva";
          v.t = 0;
          sullaStrada(v.ritorno, 0);
          camera.position.copy(dietroAlFurgone().pos);
        }
      } else {
        const D = 3.4;
        sullaStrada(v.ritorno, 1 - Math.pow(1 - Math.min(v.t / D, 1), 1.8));
        velo(1 - v.t / 0.9);
        if (v.t >= D) {
          velo(0);
          s.viaggio = null;
          const z = zona(s.zona);
          vola(new THREE.Vector3(...z.camera), new THREE.Vector3(...z.guarda), 2.2);
        }
      }
      camera.rotation.set(s.pitch, s.yaw, 0, "YXZ");
      return;
    }
    if (s.volo) {
      const v = s.volo;
      v.t = Math.min(1, v.t + dt / v.durata);
      const k = facile(v.t);
      // bezier quadratica: si alza un poco a metà strada, per non passare attraverso il casale
      const a = v.da.clone().multiplyScalar((1 - k) * (1 - k));
      const b = v.ctrl.clone().multiplyScalar(2 * (1 - k) * k);
      const c = v.a.clone().multiplyScalar(k * k);
      camera.position.copy(a.add(b).add(c));
      s.yaw = THREE.MathUtils.lerp(v.daYaw, v.aYaw, k);
      s.pitch = THREE.MathUtils.lerp(v.daPitch, v.aPitch, k);
      if (v.t >= 1) s.volo = null;
    } else if (modo === "guida") {
      // lo sguardo spostato col trascinamento torna piano al centro
      if (!s.premuto) {
        s.offYaw *= Math.exp(-0.25 * dt);
        s.offPitch *= Math.exp(-0.25 * dt);
      }
    } else {
      // camminata
      const t = s.tasti;
      let av = movimento.current.y, la = movimento.current.x;
      if (t.has("w") || t.has("arrowup")) av += 1;
      if (t.has("s") || t.has("arrowdown")) av -= 1;
      if (t.has("d")) la += 1;
      if (t.has("a")) la -= 1;
      if (t.has("arrowleft")) s.yaw += dt * 1.6;
      if (t.has("arrowright")) s.yaw -= dt * 1.6;
      const vel = (t.has("shift") ? 9 : 4.2) * dt;
      if (av || la) {
        onMosso();
        const fx = -Math.sin(s.yaw), fz = -Math.cos(s.yaw);
        const p = camera.position;
        p.x += (fx * av + -fz * la) * vel;
        p.z += (fz * av + fx * la) * vel;
        const base = lontano(p.z) ? ALTROVE[2] : 0;
        p.x = THREE.MathUtils.clamp(p.x, -60, 60);
        p.z = THREE.MathUtils.clamp(p.z, base - 84, base + 60);
        // il muretto davanti, tranne il cancello
        if (!lontano(p.z) && Math.abs(p.z - 6) < 0.5 && Math.abs(p.x) > 1.9 && Math.abs(p.x) < 9.2) p.z = p.z > 6 ? 6.5 : 5.5;
      }
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, OCCHI, 1 - Math.exp(-4 * dt));
      // in che zona si è
      let migliore: ZonaId = s.vicina, dm = Infinity;
      for (const [id, x, z] of AREE) {
        const d = Math.hypot(camera.position.x - x, camera.position.z - z);
        if (d < dm) {
          dm = d;
          migliore = id;
        }
      }
      if (migliore !== s.vicina) {
        s.vicina = migliore;
        onVicina(migliore);
      }
    }
    camera.rotation.set(s.pitch + s.offPitch, s.yaw + s.offYaw, 0, "YXZ");
  });
  return null;
}

/* ------------------------------------------------------------------ i segnaposti delle zone */

function Segnaposto({ id, attivo, onVai }: { id: ZonaId; attivo: boolean; onVai: (id: ZonaId) => void }) {
  const z = zona(id);
  const pill = useMemo(() => pillola(z.nome, "Vai"), [z.nome]);
  const sprite = useRef<THREE.Sprite>(null);
  const anello = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (anello.current) {
      const k = (t * 0.6) % 1;
      anello.current.scale.setScalar(0.6 + k * 1.6);
      (anello.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.7;
    }
    if (sprite.current) {
      // più grande da lontano, per restare leggibile; nascosto nella zona in cui si è
      const d = camera.position.distanceTo(sprite.current.position);
      const h = THREE.MathUtils.clamp(d * 0.042, 0.55, 3.4);
      sprite.current.scale.set(h * pill.rapporto, h, 1);
      sprite.current.position.y = z.segno[1] + Math.sin(t * 1.4 + z.segno[0]) * 0.12;
      const m = sprite.current.material as THREE.SpriteMaterial;
      const altraArea = ZONE_LONTANE.includes(id) !== lontano(camera.position.z);
      m.opacity = THREE.MathUtils.lerp(m.opacity, attivo || altraArea ? 0 : 1, 0.08);
      sprite.current.visible = m.opacity > 0.03;
    }
  });
  const clic = (e: ThreeEvent<MouseEvent>) => {
    if (attivo || e.delta > 8) return;
    e.stopPropagation();
    onVai(id);
  };
  return (
    <group>
      <sprite
        ref={sprite}
        position={z.segno}
        renderOrder={20}
        onClick={clic}
        onPointerOver={() => {
          if (!attivo) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <spriteMaterial map={pill.texture} transparent depthTest={false} depthWrite={false} />
      </sprite>
      {!attivo && ZONE_LONTANE.includes(id) === lontano(camera.position.z) && (
        <mesh ref={anello} position={[z.segno[0], 0.08, z.segno[2]]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.8, 0.95, 40]} />
          <meshBasicMaterial color="#D9C26A" transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function Pronta({ onPronta }: { onPronta: () => void }) {
  const n = useRef(0);
  useFrame(() => {
    n.current++;
    if (n.current === 4) onPronta();
  });
  return null;
}

export default function Scena(props: Props) {
  const ombre = !props.stretto;
  const furgone = useRef<THREE.Group>(null);
  // il furgone parcheggiato nello spiazzale, col muso verso il cancello (valori fissi: r3f non li riapplica)
  const parcheggio = useMemo(
    () => ({ p: FURGONE_FATTORIA.p, r: Math.atan2(-(0 - FURGONE_FATTORIA.p[0]), -(7.5 - FURGONE_FATTORIA.p[2])) }),
    []
  );
  return (
    <Canvas
      className="tela"
      shadows={ombre ? "soft" : false}
      dpr={props.stretto ? [1, 1.5] : [1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 55, near: 0.1, far: 600, position: [0, OCCHI, 46] }}
    >
      <Cielo />
      <Luci ombre={ombre} />
      <Regia
        modo={props.modo}
        zonaId={props.zonaId}
        movimento={props.movimento}
        onVicina={props.onVicina}
        onMosso={props.onMosso}
        stretto={props.stretto}
        furgone={furgone}
        schermo={props.schermo}
      />
      <Terreno ridotto={props.stretto} />
      <Casale cancelloAperto={props.cancelloAperto} />
      <Serra fase={props.fasi.serra} />
      <Mais fase={props.fasi.mais} />
      <group position={ALTROVE}>
        <Uliveto fase={props.fasi.uliveto} />
        <Frantoio fase={props.fasi.frantoio} />
      </group>
      <Furgone ref={furgone} position={parcheggio.p} rotation={[0, parcheggio.r, 0]} onClic={(qui) => props.onVai(qui ? "spiazzo" : "uliveto")} />
      <Cartello p={CARTELLO_ULIVETI} verso={0.22} onClic={() => props.onVai("uliveto")} />
      <Oggetti fasi={props.fasi} />
      <Persone zonaAndrea={props.zonaId} faseUliveto={props.fasi.uliveto} parlante={props.parlante} onParla={props.onParla} />
      {ZONE.map((z) => (
        <Segnaposto key={z.id} id={z.id} attivo={props.modo === "guida" && props.zonaId === z.id} onVai={props.onVai} />
      ))}
      <Pronta onPronta={props.onPronta} />
    </Canvas>
  );
}
