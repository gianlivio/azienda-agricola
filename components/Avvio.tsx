"use client";

import { useEffect, useState } from "react";
import { AUGURI, AZIENDA } from "@/content/azienda";

/*
 * L'avvio: mentre la scena si carica, gli auguri lampeggiano come a una festa.
 * A caricamento finito il lampeggio si ferma, la scritta si posa in oro e compare "Entra".
 * Con "riduci movimento" niente lampeggi. Con AUGURI = false resta solo il nome dell'azienda.
 */

const MINIMO = 3800;

export default function Avvio({ progresso, pronta, onEntra }: { progresso: number; pronta: boolean; onEntra: () => void }) {
  const [tempo, setTempo] = useState(false);
  const [chiude, setChiude] = useState(false);
  const [via, setVia] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setTempo(true), AUGURI ? MINIMO : 600);
    return () => window.clearTimeout(id);
  }, []);
  const calmo = pronta && tempo;
  const entra = () => {
    setChiude(true);
    onEntra();
    window.setTimeout(() => setVia(true), 1300);
  };
  useEffect(() => {
    if (!calmo) return;
    const tasto = (e: KeyboardEvent) => {
      if (e.key === "Enter") entra();
    };
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
  }, [calmo]); // eslint-disable-line react-hooks/exhaustive-deps
  if (via) return null;

  const titolo = AUGURI ? ["BUON", "COMPLEANNO"] : [AZIENDA.nome];
  const pct = Math.round(Math.min(progresso, pronta ? 1 : 0.99) * 100);
  return (
    <div className={`avvio${AUGURI ? " avvio--festa" : ""}${calmo ? " avvio--calmo" : ""}${chiude ? " avvio--chiude" : ""}`} role="dialog" aria-label="Benvenuto">
      {AUGURI && (
        <>
          <div className="strobo" aria-hidden="true" />
          <div className="nastri" aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => (
              <p key={i} className={`nastro nastro--${i % 2 ? "dx" : "sx"}`} style={{ animationDuration: `${9 + i * 1.7}s` }}>
                {"BUON COMPLEANNO · ".repeat(10)}
              </p>
            ))}
          </div>
          <div className="coriandoli" aria-hidden="true">
            {Array.from({ length: 46 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${(i * 37) % 100}%`,
                  animationDelay: `${(i * 0.23) % 3}s`,
                  animationDuration: `${2.8 + ((i * 7) % 10) / 4}s`,
                  background: ["#D9C26A", "#F3F1EB", "#3556E6", "#C6462F", "#5E8A3A", "#8A5A7A"][i % 6],
                }}
              />
            ))}
          </div>
        </>
      )}
      <div className="avvio-centro">
        <h1 className="avvio-titolo" aria-label={titolo.join(" ")}>
          {titolo.map((parola, r) => (
            <span key={r} className="avvio-riga">
              {parola.split("").map((l, i) => (
                <span key={i} className="lettera" style={{ animationDelay: `${((i * 7 + r * 3) % 11) * 0.045}s` }}>
                  {l === " " ? " " : l}
                </span>
              ))}
            </span>
          ))}
        </h1>
        {AUGURI && <p className="avvio-sotto">{AZIENDA.nome}</p>}
        <div className="avvio-piede">
          {calmo ? (
            <button className="entra" onClick={entra} autoFocus>
              Entra nell&apos;azienda <span aria-hidden="true">→</span>
            </button>
          ) : (
            <>
              <p className="avvio-stato">
                {AZIENDA.luogo} — caricamento {pct}%
              </p>
              <span className="barra" aria-hidden="true">
                <i style={{ transform: `scaleX(${pct / 100})` }} />
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
