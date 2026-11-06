/*
 * Le musiche di sottofondo, una per zona, nello stile delle console a 8 e 16 bit: due voci a onda quadra
 * (melodia e armonia), un triangolo per il basso, il rumore per la batteria. Tutto sintetizzato nel browser
 * con la Web Audio API: nessun file da scaricare. Brani originali.
 *
 * Notazione dei brani: una battuta per stringa, un token per passo; "-" prolunga la nota precedente,
 * "." è una pausa. Batteria: k cassa, s rullante, h charleston, "." niente.
 */

import type { ZonaId } from "@/content/azienda";

type Brano = {
  /** durata di un passo, in secondi */
  passo: number;
  melodia: string[];
  /** fondamentale dell'accordo per battuta (es. "C", "Am"): da qui basso e armonia */
  accordi: string[];
  /** schema del basso in una battuta: r fondamentale, q quinta, o ottava, "." pausa */
  basso: string;
  /** schema dell'armonia: a arpeggio, c accordo, "." pausa */
  armonia: string;
  batteria: string;
  /** forma d'onda della melodia: 0.125, 0.25 o 0.5 */
  duty: number;
};

const BRANI: Record<ZonaId, Brano> = {
  // l'ingresso: una marcetta in Do, allegra, da schermata del titolo
  cancello: {
    passo: 0.23,
    duty: 0.25,
    melodia: [
      "C5 . E5 G5 C6 - G5 E5",
      "F5 - A5 - G5 - E5 .",
      "D5 . F5 A5 D6 - A5 F5",
      "G5 - - - B4 . D5 .",
      "E5 . G5 C6 E6 - D6 C6",
      "A5 - F5 - D6 - C6 .",
      "B5 . G5 . A5 B5 C6 D6",
      "C6 - - - G5 . C5 .",
    ],
    accordi: ["C", "F", "Dm", "G", "C", "F", "G", "C"],
    basso: "r . q . r . q .",
    armonia: ". c . c . c . c",
    batteria: "k h s h k h s h",
  },
  // lo spiazzo: il paese, rilassato e saltellante, in Fa
  spiazzo: {
    passo: 0.26,
    duty: 0.5,
    melodia: [
      "A4 C5 F5 . E5 . C5 .",
      "D5 - - . C5 . A4 .",
      "A#4 D5 F5 . G5 . F5 E5",
      "F5 - - - . . . .",
      "A5 . G5 F5 E5 . D5 .",
      "C5 . D5 E5 F5 . A5 .",
      "G5 . E5 . C5 . E5 G5",
      "F5 - - - . . C5 .",
    ],
    accordi: ["F", "Dm", "A#", "F", "F", "C", "C", "F"],
    basso: "r . . q r . q .",
    armonia: "a a a a a a a a",
    batteria: "k . h . s . h h",
  },
  // la serra: luminosa, arpeggi veloci, in Sol
  serra: {
    passo: 0.2,
    duty: 0.125,
    melodia: [
      "B5 . D6 . B5 A5 G5 .",
      "A5 . B5 . G5 . E5 .",
      "C6 . E6 . C6 B5 A5 .",
      "B5 - - . D5 . G5 .",
      "B5 . D6 . G6 . F#6 E6",
      "D6 . C6 . B5 . A5 .",
      "C6 . B5 . A5 . F#5 .",
      "G5 - - - . . . .",
    ],
    accordi: ["G", "Em", "C", "G", "G", "Bm", "D", "G"],
    basso: "r . o . q . o .",
    armonia: "a a a a a a a a",
    batteria: "k h h h s h h h",
  },
  // il campo di mais: country, basso "bum-cià", in Re
  mais: {
    passo: 0.24,
    duty: 0.25,
    melodia: [
      "D5 . F#5 A5 - . F#5 .",
      "G5 . F#5 E5 - . D5 .",
      "E5 . G5 B5 - . A5 G5",
      "F#5 - - . A4 . D5 .",
      "A5 . A5 B5 A5 . F#5 .",
      "G5 . G5 A5 G5 . E5 .",
      "F#5 . D5 . E5 . C#5 .",
      "D5 - - - . . . .",
    ],
    accordi: ["D", "G", "Em", "D", "D", "G", "A", "D"],
    basso: "r . q . r . q .",
    armonia: ". c . c . c . c",
    batteria: "k h s h k k s h",
  },
  // l'uliveto: in La minore, in sei ottavi, con l'andatura di una tarantella
  uliveto: {
    passo: 0.17,
    duty: 0.25,
    melodia: [
      "A4 C5 E5 A5 G5 E5",
      "F5 - E5 D5 - .",
      "E5 G#5 B5 E6 D6 B5",
      "C6 - B5 A5 - .",
      "A5 B5 C6 D6 C6 B5",
      "C6 A5 F5 D5 - .",
      "E5 F5 E5 D5 C5 B4",
      "A4 - - E4 - .",
    ],
    accordi: ["Am", "Dm", "E", "Am", "Am", "Dm", "E", "Am"],
    basso: "r . . q . .",
    armonia: ". c c . c c",
    batteria: "k h h s h h",
  },
  // il frantoio: in Mi minore, un ostinato meccanico, come le macine che girano
  frantoio: {
    passo: 0.28,
    duty: 0.5,
    melodia: [
      "E5 . . G5 . . F#5 .",
      "E5 . . B4 - - . .",
      "E5 . . G5 . . A5 .",
      "B5 - - - . . . .",
      "C6 . . B5 . . A5 .",
      "G5 . . F#5 - - . .",
      "E5 . G5 . F#5 . D#5 .",
      "E5 - - - . . . .",
    ],
    accordi: ["Em", "B", "Em", "B", "C", "D", "B", "Em"],
    basso: "r o q o r o q o",
    armonia: "a . a . a . a .",
    batteria: "k h s h k h s s",
  },
};

/* ------------------------------------------------------------------ note e accordi */

const NOMI: Record<string, number> = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
const frequenza = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
function midi(nota: string) {
  const m = nota.match(/^([A-G]#?)(\d)$/);
  if (!m) return null;
  return NOMI[m[1]] + (Number(m[2]) + 1) * 12;
}
/** Le note di un accordo ("Am", "F#", "Bm") a partire dall'ottava data: fondamentale, terza, quinta. */
function accordo(nome: string, ottava: number) {
  const m = nome.match(/^([A-G]#?)(m?)$/) as RegExpMatchArray;
  const r = NOMI[m[1]] + (ottava + 1) * 12;
  return [r, r + (m[2] ? 3 : 4), r + 7];
}

/* ------------------------------------------------------------------ il sintetizzatore */

type Voce = { tipo: "quadra" | "triangolo"; duty?: number; volume: number };

class Sintetizzatore {
  ctx: AudioContext;
  uscita: GainNode;
  private onde = new Map<number, PeriodicWave>();
  private rumore: AudioBuffer;
  constructor() {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new C();
    this.uscita = this.ctx.createGain();
    this.uscita.gain.value = 0;
    // un compressore leggero, per tenere insieme le voci senza saturare
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    this.uscita.connect(comp).connect(this.ctx.destination);
    this.rumore = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const d = this.rumore.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  /** Un'onda quadra con il ciclo utile dato, per serie di Fourier. */
  private quadra(duty: number) {
    let o = this.onde.get(duty);
    if (!o) {
      const n = 48;
      const re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
      o = this.ctx.createPeriodicWave(re, im);
      this.onde.set(duty, o);
    }
    return o;
  }
  nota(dest: AudioNode, v: Voce, midiNota: number, t: number, durata: number) {
    const o = this.ctx.createOscillator();
    if (v.tipo === "triangolo") o.type = "triangle";
    else o.setPeriodicWave(this.quadra(v.duty ?? 0.5));
    o.frequency.value = frequenza(midiNota);
    const g = this.ctx.createGain();
    const fine = t + durata;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v.volume, t + 0.006);
    g.gain.setTargetAtTime(v.volume * 0.7, t + 0.02, 0.08);
    g.gain.setTargetAtTime(0, fine - 0.02, 0.015);
    // un vibrato appena accennato sulle note lunghe della melodia
    if (v.tipo === "quadra" && durata > 0.45) {
      const lfo = this.ctx.createOscillator(), lg = this.ctx.createGain();
      lfo.frequency.value = 5.5;
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(frequenza(midiNota) * 0.008, t + 0.3);
      lfo.connect(lg).connect(o.frequency);
      lfo.start(t);
      lfo.stop(fine + 0.05);
    }
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(fine + 0.08);
  }
  colpo(dest: AudioNode, tipo: string, t: number) {
    if (tipo === "k") {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      o.connect(g).connect(dest);
      o.start(t);
      o.stop(t + 0.2);
      return;
    }
    const s = this.ctx.createBufferSource();
    s.buffer = this.rumore;
    const f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    if (tipo === "h") {
      f.type = "highpass";
      f.frequency.value = 7000;
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    } else {
      f.type = "bandpass";
      f.frequency.value = 1800;
      f.Q.value = 0.7;
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    }
    s.connect(f).connect(g).connect(dest);
    s.start(t, Math.random() * 0.5);
    s.stop(t + 0.2);
  }
}

/* ------------------------------------------------------------------ il lettore */

type Traccia = { id: ZonaId; brano: Brano; bus: GainNode; passo: number; prossimo: number; note: (number | null | "-")[]; durate: number[] };

/** La melodia in note e durate (in passi), con i "-" assorbiti nella nota che prolungano. */
function prepara(b: Brano) {
  const token = b.melodia.join(" ").split(/\s+/);
  const note: (number | null | "-")[] = token.map((t) => (t === "-" ? "-" : t === "." ? null : midi(t)));
  const durate = note.map((n, i) => {
    if (n === null || n === "-") return 0;
    let d = 1;
    while (note[i + d] === "-") d++;
    return d;
  });
  return { note, durate };
}

class Musica {
  private s: Sintetizzatore | null = null;
  private traccia: Traccia | null = null;
  private timer: number | null = null;
  private acceso = false;
  private zona: ZonaId = "cancello";
  private ascoltatori = new Set<(acceso: boolean) => void>();

  get attivo() {
    return this.acceso;
  }
  ascolta(f: (acceso: boolean) => void) {
    this.ascoltatori.add(f);
    f(this.acceso);
    return () => {
      this.ascoltatori.delete(f);
    };
  }

  /** Da chiamare dentro un gesto dell'utente (un clic): i browser aprono l'audio solo così. */
  accendi() {
    if (!this.s) this.s = new Sintetizzatore();
    void this.s.ctx.resume();
    this.acceso = true;
    const g = this.s.uscita.gain, t = this.s.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0.55, t + 0.6);
    if (!this.traccia) this.avvia(this.zona);
    if (this.timer === null) this.timer = window.setInterval(() => this.programma(), 25);
    this.ascoltatori.forEach((f) => f(true));
  }

  spegni() {
    this.acceso = false;
    this.ascoltatori.forEach((f) => f(false));
    if (!this.s) return;
    const g = this.s.uscita.gain, t = this.s.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0, t + 0.4);
    window.setTimeout(() => {
      if (this.acceso || !this.s) return;
      if (this.timer !== null) window.clearInterval(this.timer);
      this.timer = null;
      this.traccia = null;
      void this.s.ctx.suspend();
    }, 500);
  }

  interruttore() {
    if (this.acceso) this.spegni();
    else this.accendi();
  }

  /** Cambia brano: il vecchio sfuma, il nuovo entra all'inizio della battuta successiva. */
  zonaAttiva(id: ZonaId) {
    if (id === this.zona && this.traccia) return;
    this.zona = id;
    if (!this.acceso || !this.s) return;
    this.avvia(id);
  }

  private avvia(id: ZonaId) {
    const s = this.s as Sintetizzatore;
    const t = s.ctx.currentTime;
    if (this.traccia) {
      const vecchio = this.traccia.bus;
      vecchio.gain.cancelScheduledValues(t);
      vecchio.gain.setValueAtTime(vecchio.gain.value, t);
      vecchio.gain.linearRampToValueAtTime(0, t + 0.7);
      window.setTimeout(() => vecchio.disconnect(), 1500);
    }
    const bus = s.ctx.createGain();
    bus.gain.setValueAtTime(0, t);
    bus.gain.linearRampToValueAtTime(1, t + 0.5);
    bus.connect(s.uscita);
    const brano = BRANI[id];
    this.traccia = { id, brano, bus, passo: 0, prossimo: t + 0.12, ...prepara(brano) };
  }

  /** Programma le note dei prossimi 150 ms (il metodo del "guardare avanti"). */
  private programma() {
    const s = this.s, tr = this.traccia;
    if (!s || !tr) return;
    const b = tr.brano;
    const perBattuta = b.basso.split(" ").length;
    const totale = tr.note.length;
    while (tr.prossimo < s.ctx.currentTime + 0.15) {
      const i = tr.passo % totale, t = tr.prossimo;
      const battuta = Math.floor(i / perBattuta), dentro = i % perBattuta;
      const acc = b.accordi[battuta % b.accordi.length];
      // melodia
      const n = tr.note[i];
      if (typeof n === "number") s.nota(tr.bus, { tipo: "quadra", duty: b.duty, volume: 0.15 }, n, t, tr.durate[i] * b.passo * 0.92);
      // basso, al triangolo, due ottave sotto
      const sb = b.basso.split(" ")[dentro];
      if (sb !== ".") {
        const [r, , q] = accordo(acc, 2);
        s.nota(tr.bus, { tipo: "triangolo", volume: 0.3 }, sb === "q" ? q : sb === "o" ? r + 12 : r, t, b.passo * 0.85);
      }
      // armonia: arpeggio sulle tre note dell'accordo, oppure l'accordo "a colpi" sul contrattempo
      const sa = b.armonia.split(" ")[dentro];
      const tri = accordo(acc, 4);
      if (sa === "a") s.nota(tr.bus, { tipo: "quadra", duty: 0.125, volume: 0.045 }, tri[i % 3] + 12, t, b.passo * 0.6);
      if (sa === "c") tri.slice(1).forEach((m) => s.nota(tr.bus, { tipo: "quadra", duty: 0.5, volume: 0.04 }, m, t, b.passo * 0.5));
      // batteria
      const sd = b.batteria.split(" ")[dentro];
      if (sd !== ".") s.colpo(tr.bus, sd, t);
      tr.passo++;
      tr.prossimo += b.passo;
    }
  }
}

export const musica = new Musica();
