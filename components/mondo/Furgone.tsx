"use client";

import * as THREE from "three";
import { forwardRef, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Trattore } from "./Mais";
import { pillola } from "./base";
import { ALTROVE } from "@/content/luoghi";

/*
 * Il mezzo per andare agli uliveti: il trattore col rimorchio a panche. Guarda verso −z, come la camera a riposo;
 * dove sta e come si muove lo decide la regia della scena. Si clicca per partire: dalla fattoria verso
 * gli uliveti, dagli uliveti verso la fattoria. Sopra, un'etichetta che dice dove porta.
 */

const lontano = (z: number) => z < ALTROVE[2] / 2;

const Furgone = forwardRef<
  THREE.Group,
  { position?: [number, number, number]; rotation?: [number, number, number]; onClic: (lontano: boolean) => void }
>(function Furgone({ position, rotation, onClic }, ref) {
  const andata = useMemo(() => pillola("Giro negli uliveti", "Sali sul trattore"), []);
  const ritorno = useMemo(() => pillola("Torna in azienda", "Sali sul trattore"), []);
  const a = useRef<THREE.Sprite>(null), r = useRef<THREE.Sprite>(null);
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const qui = lontano(camera.position.z);
    if (a.current) a.current.visible = !qui;
    if (r.current) r.current.visible = qui;
    const y = 3.5 + Math.sin(clock.elapsedTime * 1.6) * 0.1;
    a.current?.position.setY(y);
    r.current?.position.setY(y);
  });
  const clic = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return;
    e.stopPropagation();
    onClic(lontano(camera.position.z));
  };
  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      onClick={clic}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {/* il trattore ha il muso verso +x: girato di un quarto, guarda verso −z */}
      <group rotation-y={Math.PI / 2}>
        <Trattore carico={false} seminatrice={false} panche />
      </group>
      <sprite ref={a} position={[0, 3.5, 1.2]} scale={[0.62 * andata.rapporto, 0.62, 1]} renderOrder={20}>
        <spriteMaterial map={andata.texture} transparent depthTest={false} depthWrite={false} />
      </sprite>
      <sprite ref={r} position={[0, 3.5, 1.2]} scale={[0.62 * ritorno.rapporto, 0.62, 1]} renderOrder={20}>
        <spriteMaterial map={ritorno.texture} transparent depthTest={false} depthWrite={false} />
      </sprite>
      {/* un volume invisibile, più facile da cliccare */}
      <mesh position={[0, 1.3, 1.2]} visible={false}>
        <boxGeometry args={[2.4, 2.6, 5.2]} />
      </mesh>
    </group>
  );
});

export default Furgone;

/** Il cartello di legno accanto al trattore, nello spiazzale: anche questo si clicca per partire. */
export function Cartello({ p, verso, onClic }: { p: [number, number, number]; verso: number; onClic: () => void }) {
  const tela = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 560;
    const x = c.getContext("2d") as CanvasRenderingContext2D;
    x.fillStyle = "#E9DCC2";
    x.fillRect(0, 0, 1024, 560);
    x.strokeStyle = "#7A5A3A";
    x.lineWidth = 18;
    x.strokeRect(14, 14, 996, 532);
    x.fillStyle = "#2A2016";
    x.textAlign = "center";
    x.font = "400 92px Newsreader, Georgia, serif";
    x.fillText("Andiamo a fare un giro", 512, 170);
    x.fillText("negli uliveti", 512, 290);
    x.fillStyle = "#183F35";
    x.font = "500 46px 'IBM Plex Mono', monospace";
    x.fillText("SALI SUL TRATTORE  →", 512, 430);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  return (
    <group
      position={p}
      rotation-y={verso}
      onClick={(e) => {
        if (e.delta > 8) return;
        e.stopPropagation();
        onClic();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.95, -0.02]} castShadow>
          <boxGeometry args={[0.1, 1.9, 0.1]} />
          <meshLambertMaterial color="#6A4A31" />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0.04]} castShadow>
        <boxGeometry args={[1.9, 1.06, 0.06]} />
        <meshLambertMaterial color="#7A5A3A" />
      </mesh>
      <mesh position={[0, 1.55, 0.075]}>
        <planeGeometry args={[1.78, 0.97]} />
        <meshLambertMaterial map={tela} />
      </mesh>
    </group>
  );
}
