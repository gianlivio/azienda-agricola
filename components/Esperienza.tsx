"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { AZIENDA, PERSONAGGI, ZONE, zona, type Tema, type ZonaId } from "@/content/azienda";
import { ascoltaCaricamento } from "./mondo/base";
import Avvio from "./Avvio";
import type { Modo, Movimento } from "./Scena";

const Scena = dynamic(() => import("./Scena"), { ssr: false });

type Ambiente = { webgl: boolean; stretto: boolean; tocco: boolean; ridotto: boolean };

function supportaWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const FASI_INIZIALI: Record<ZonaId, number> = { cancello: 0, spiazzo: 0, serra: 0, mais: 0, uliveto: 3, frantoio: 1 };

export default function Esperienza() {
  const [ambiente, setAmbiente] = useState<Ambiente | null>(null);
  const [fontPronti, setFontPronti] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [pronta, setPronta] = useState(false);
  const [entrato, setEntrato] = useState(false);
  const [modo, setModo] = useState<Modo>("guida");
  const [zonaId, setZonaId] = useState<ZonaId>("cancello");
  const [vicina, setVicina] = useState<ZonaId>("cancello");
  const [fasi, setFasi] = useState(FASI_INIZIALI);
  const [cancelloAperto, setCancelloAperto] = useState(false);
  /** il dialogo aperto: con chi, e la catena delle domande fatte (vuota = il saluto) */
  const [dialogo, setDialogo] = useState<{ chi: string; percorso: Tema[] } | null>(null);
  /** le domande già fatte, per persona e zona: non tornano nel menu */
  const [chiesti, setChiesti] = useState<Record<string, string[]>>({});
  const [pannello, setPannello] = useState(true);
  const [mosso, setMosso] = useState(false);
  const movimento = useRef<Movimento>({ x: 0, y: 0 });

  useEffect(() => {
    const leggi = () =>
      setAmbiente({
        webgl: supportaWebGL(),
        stretto: window.innerWidth < 760,
        tocco: window.matchMedia("(pointer: coarse)").matches,
        ridotto: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
    leggi();
    let attesa: ReturnType<typeof setTimeout>;
    const ridim = () => {
      clearTimeout(attesa);
      attesa = setTimeout(() => setAmbiente((a) => (a ? { ...a, stretto: window.innerWidth < 760 } : a)), 250);
    };
    window.addEventListener("resize", ridim);
    // i font servono anche alle scritte disegnate nella scena: si aspetta che siano pronti (al massimo 2 s)
    const fonti = ["300 20px Newsreader", "400 20px Newsreader", "500 20px 'IBM Plex Sans'", "400 20px 'IBM Plex Mono'", "500 20px 'IBM Plex Mono'"];
    Promise.race([Promise.all(fonti.map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 2000))]).then(() => setFontPronti(true));
    const via = ascoltaCaricamento(setProgresso);
    return () => {
      window.removeEventListener("resize", ridim);
      via();
    };
  }, []);

  const vai = useCallback((id: ZonaId) => {
    setModo("guida");
    setZonaId(id);
    setVicina(id);
    setDialogo(null);
    setPannello(true);
    if (id !== "cancello") setCancelloAperto(true);
  }, []);

  const parla = useCallback((id: string) => {
    setDialogo({ chi: id, percorso: [] });
  }, []);

  const cambiaModo = useCallback(
    (m: Modo) => {
      if (m === modo) return;
      if (m === "guida") {
        setZonaId(vicina);
      } else {
        setCancelloAperto(true);
      }
      setModo(m);
      setMosso(false);
    },
    [modo, vicina]
  );

  const zonaAttiva = modo === "guida" ? zonaId : vicina;
  const z = zona(zonaAttiva);
  const fase = fasi[zonaAttiva];
  const cambiaFase = (n: number) => {
    if (!z.fasi) return;
    const k = (n + z.fasi.length) % z.fasi.length;
    setFasi((f) => ({ ...f, [zonaAttiva]: k }));
  };

  // da tastiera: frecce sinistra e destra cambiano fase (in visita guidata), Esc chiude il dialogo
  useEffect(() => {
    const tasti = (e: KeyboardEvent) => {
      if (!entrato) return;
      if (e.key === "Escape") setDialogo(null);
      if (modo !== "guida" || !z.fasi) return;
      if (e.key === "ArrowRight") cambiaFase(fase + 1);
      if (e.key === "ArrowLeft") cambiaFase(fase - 1);
    };
    window.addEventListener("keydown", tasti);
    return () => window.removeEventListener("keydown", tasti);
  });

  if (!ambiente) return null;

  if (!ambiente.webgl) {
    return (
      <main className="senza-3d">
        <h1>{AZIENDA.nome}</h1>
        <p className="occhiello">{AZIENDA.luogo}</p>
        {ZONE.map((zz) => (
          <section key={zz.id}>
            <h2>{zz.titolo}</h2>
            <p>{zz.testo}</p>
            {zz.fasi && (
              <ol>
                {zz.fasi.map((f) => (
                  <li key={f.titolo}>
                    <strong>{f.titolo}.</strong> {f.testo}
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </main>
    );
  }

  const personaggio = dialogo ? PERSONAGGI.find((p) => p.id === dialogo.chi) ?? null : null;
  // Andrea parla della zona in cui si è; i collaboratori della loro
  const zonaDialogo: ZonaId = personaggio?.zona ?? zonaAttiva;
  const copione = personaggio ? personaggio.copioni[zonaDialogo] : undefined;
  const chiave = `${personaggio?.id}|${zonaDialogo}`;
  const giaChiesti = chiesti[chiave] ?? [];
  const faseDialogo = fasi[zonaDialogo];
  const nomeFase = zona(zonaDialogo).fasi?.[faseDialogo]?.titolo;
  const ultimo = dialogo && dialogo.percorso.length ? dialogo.percorso[dialogo.percorso.length - 1] : null;
  const nuove = (temi: (Tema | undefined)[]) => temi.filter((t): t is Tema => !!t && !giaChiesti.includes(t.d));
  const domande = copione ? (ultimo ? nuove(ultimo.poi ?? []) : nuove([copione.perFase?.[faseDialogo], ...copione.temi])) : [];
  const testoDialogo = !copione
    ? ""
    : ultimo
      ? ultimo.r
      : domande.length
        ? copione.saluto
        : copione.perFase
          ? "Su questa fase ti ho detto tutto. Cambia fase dal pannello: a ogni fase c'è qualcosa di diverso da raccontare."
          : "Ti ho raccontato quello che c'era da sapere qui. Andiamo avanti?";
  const chiedi = (t: Tema) => {
    if (!personaggio) return;
    setChiesti((c) => ({ ...c, [chiave]: [...(c[chiave] ?? []), t.d] }));
    setDialogo({ chi: personaggio.id, percorso: [...(dialogo?.percorso ?? []), t] });
  };
  const collaboratore = PERSONAGGI.find((p) => p.zona === zonaAttiva);

  return (
    <>
      {fontPronti && (
        <div className={`esperienza${entrato ? " esperienza--dentro" : ""}`}>
          <Scena
            modo={modo}
            zonaId={zonaId}
            fasi={fasi}
            cancelloAperto={cancelloAperto}
            parlante={dialogo?.chi ?? null}
            stretto={ambiente.stretto}
            ridotto={ambiente.ridotto}
            movimento={movimento}
            onVai={vai}
            onVicina={setVicina}
            onParla={parla}
            onPronta={() => setPronta(true)}
            onMosso={() => setMosso(true)}
          />
        </div>
      )}

      <Avvio progresso={progresso} pronta={pronta} onEntra={() => setEntrato(true)} />

      {entrato && (
        <div className="interfaccia">
          <header className="testata">
            <div>
              <p className="firma-nome">{AZIENDA.nome}</p>
              <p className="firma-ruolo">{AZIENDA.luogo}</p>
            </div>
            <div className="modi" role="group" aria-label="Modo di visita">
              <button aria-pressed={modo === "guida"} onClick={() => cambiaModo("guida")}>
                Visita guidata
              </button>
              <button aria-pressed={modo === "cammina"} onClick={() => cambiaModo("cammina")}>
                Cammina
              </button>
            </div>
          </header>

          <p className={`guida${mosso ? " guida--via" : ""}`} aria-hidden="true">
            {modo === "guida"
              ? ambiente.tocco
                ? "Trascina per guardarti intorno · tocca le etichette per spostarti · tocca le persone per parlare"
                : "Trascina per guardarti intorno · clic sulle etichette per spostarti · clic sulle persone per parlare"
              : ambiente.tocco
                ? "Usa il joystick per camminare · trascina per guardarti intorno"
                : "W A S D o frecce per camminare · Shift per correre · trascina per guardarti intorno"}
          </p>

          {/* il pannello della zona, con le fasi */}
          <aside className={`pannello${pannello ? "" : " pannello--chiuso"}`} key={zonaAttiva} aria-labelledby="pannello-titolo">
            <button className="pannello-maniglia" onClick={() => setPannello((v) => !v)} aria-expanded={pannello}>
              <span className="occhiello">{z.occhiello}</span>
              <span className="pannello-segno" aria-hidden="true">
                {pannello ? "–" : "+"}
              </span>
            </button>
            <h2 id="pannello-titolo" className="pannello-titolo">
              {z.fasi ? z.fasi[fase].titolo : z.titolo}
            </h2>
            {pannello && (
              <>
                {z.fasi && (
                  <p className="pannello-luogo">
                    {z.titolo} · fase {fase + 1} di {z.fasi.length}
                  </p>
                )}
                <p className="pannello-testo" key={`${zonaAttiva}-${fase}`}>
                  {z.fasi ? z.fasi[fase].testo : z.testo}
                </p>
                {z.fasi && (
                  <div className="fasi">
                    <button className="freccia" onClick={() => cambiaFase(fase - 1)} aria-label="Fase precedente">
                      ←
                    </button>
                    <ol className="fasi-punti">
                      {z.fasi.map((f, i) => (
                        <li key={f.titolo}>
                          <button aria-current={i === fase ? "step" : undefined} onClick={() => cambiaFase(i)} title={f.titolo}>
                            <span className="solo-schermo">{f.titolo}</span>
                          </button>
                        </li>
                      ))}
                    </ol>
                    <button className="freccia" onClick={() => cambiaFase(fase + 1)} aria-label="Fase successiva">
                      →
                    </button>
                  </div>
                )}
                <div className="parla-con">
                  <button className="parla" onClick={() => parla("andrea")}>
                    Parla con Andrea
                  </button>
                  {collaboratore && (
                    <button className="parla parla--altro" onClick={() => parla(collaboratore.id)}>
                      Parla con chi lavora qui
                    </button>
                  )}
                </div>
              </>
            )}
          </aside>

          {personaggio && copione && (
            <aside className="dialogo" aria-live="polite" key={`${personaggio.id}-${zonaDialogo}-${dialogo?.percorso.length}-${faseDialogo}`}>
              <p className="occhiello">
                {personaggio.ruolo}
                {nomeFase && ` · ${zona(zonaDialogo).titolo}, ${nomeFase.toLowerCase()}`}
              </p>
              {personaggio.id === "andrea" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="ritratto" src="/andrea.jpg" alt="Andrea Angilletti nella sua serra" width={64} height={64} />
              )}
              <h2 className="dialogo-nome">{personaggio.id === "andrea" ? personaggio.nome : personaggio.ruolo.split("·")[1]?.trim().replace(/^./, (c) => c.toUpperCase())}</h2>
              {ultimo && <p className="dialogo-domanda">{ultimo.d}</p>}
              <p className="dialogo-testo">{testoDialogo}</p>
              <div className="scelte">
                {domande.map((t) => (
                  <button key={t.d} onClick={() => chiedi(t)}>
                    {t.d}
                  </button>
                ))}
                {ultimo?.vai && (
                  <button className="scelta-vai" onClick={() => vai(ultimo.vai as ZonaId)}>
                    Andiamo: {zona(ultimo.vai).nome} →
                  </button>
                )}
                {ultimo && (
                  <button className="scelta-tenue" onClick={() => setDialogo({ chi: personaggio.id, percorso: [] })}>
                    Altra domanda
                  </button>
                )}
                <button className="scelta-tenue" onClick={() => setDialogo(null)}>
                  Grazie, a dopo
                </button>
              </div>
              <button className="chiudi" onClick={() => setDialogo(null)} aria-label="Chiudi">
                ×
              </button>
            </aside>
          )}

          <nav className="zone" aria-label="Zone dell'azienda">
            {ZONE.map((zz) => (
              <button key={zz.id} aria-current={zonaAttiva === zz.id ? "true" : undefined} onClick={() => vai(zz.id)}>
                {zz.nome}
              </button>
            ))}
          </nav>

          {modo === "cammina" && ambiente.tocco && <Joystick movimento={movimento} />}
        </div>
      )}
    </>
  );
}

function Joystick({ movimento }: { movimento: React.MutableRefObject<Movimento> }) {
  const base = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 0, y: 0 });
  const id = useRef<number | null>(null);
  const muovi = (e: React.PointerEvent) => {
    if (id.current !== e.pointerId || !base.current) return;
    const r = base.current.getBoundingClientRect();
    let x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    setP({ x, y });
    movimento.current = { x, y: -y };
  };
  const fine = () => {
    id.current = null;
    setP({ x: 0, y: 0 });
    movimento.current = { x: 0, y: 0 };
  };
  return (
    <div
      ref={base}
      className="joystick"
      onPointerDown={(e) => {
        e.stopPropagation();
        id.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        muovi(e);
      }}
      onPointerMove={muovi}
      onPointerUp={fine}
      onPointerCancel={fine}
    >
      <i style={{ transform: `translate(${p.x * 34}px, ${p.y * 34}px)` }} />
    </div>
  );
}
