/*
 * I contenuti della visita: le zone, le fasi di ogni coltura, i dialoghi.
 * I fatti su Andrea vengono da dottorbakita.it; le fasi delle colture sono pratica agricola generale,
 * senza dati specifici dell'azienda che non ci sono stati forniti.
 */

/** Messaggio di auguri all'apertura. Per toglierlo: false. */
export const AUGURI = true;

export const AZIENDA = {
  nome: "Azienda Agricola Angilletti",
  luogo: "Comiso · Sicilia",
};

export type ZonaId = "cancello" | "spiazzo" | "serra" | "mais" | "uliveto" | "frantoio";

export type Fase = { titolo: string; testo: string };

export type Zona = {
  id: ZonaId;
  nome: string;
  occhiello: string;
  titolo: string;
  testo: string;
  /** dove sta la camera e dove guarda */
  camera: [number, number, number];
  guarda: [number, number, number];
  /** il segnaposto cliccabile nella scena */
  segno: [number, number, number];
  /** dove si mette Andrea quando accompagna in questa zona */
  andrea: [number, number, number];
  fasi?: Fase[];
};

export const ZONE: Zona[] = [
  {
    id: "cancello",
    nome: "Cancello",
    occhiello: "Ingresso",
    titolo: "Benvenuti",
    testo:
      "Oltre il cancello: lo spiazzo, il casale in pietra, i carrubi. A sinistra le serre dei mirtilli, a destra il mais, dietro il casale l'uliveto e il frantoio.",
    camera: [0, 1.7, 46],
    guarda: [0, 2.2, 28],
    segno: [0, 3.6, 33],
    andrea: [2.6, 0, 37.5],
  },
  {
    id: "spiazzo",
    nome: "Spiazzo",
    occhiello: "Il cuore dell'azienda",
    titolo: "Lo spiazzo",
    testo:
      "Il casale è fatto di pietra calcarea iblea, a vista, con i coppi sul tetto. Qui si arriva, si scaricano le cassette, si decide la giornata. Andrea è qui: cliccalo per parlargli.",
    camera: [0, 1.7, 13],
    guarda: [0, 3, -10],
    segno: [0, 3.2, 4],
    andrea: [2.2, 0, 5.5],
  },
  {
    id: "serra",
    nome: "Serre dei mirtilli",
    occhiello: "Piccoli frutti fuori suolo",
    titolo: "La serra dei mirtilli",
    testo: "Mirtilli in vaso, su substrato, con la fertirrigazione: la specialità di Andrea.",
    camera: [-21.6, 1.7, 0.4],
    guarda: [-40, 1.2, -0.4],
    segno: [-19.5, 5.6, 0],
    andrea: [-26.8, 0, 1.4],
    fasi: [
      {
        titolo: "Messa a dimora",
        testo:
          "Le piantine vanno in vaso, su un substrato acido e leggero (torba o fibra di cocco). Il mirtillo vuole un pH basso, fra 4,5 e 5,5: fuori da lì non assorbe bene il ferro e ingiallisce.",
      },
      {
        titolo: "Fertirrigazione",
        testo:
          "Acqua e nutrienti arrivano insieme, goccia a goccia, a ogni vaso. Si misurano EC e pH della soluzione in entrata e del drenaggio: è così che si capisce cosa la pianta sta prendendo davvero.",
      },
      {
        titolo: "Fioritura",
        testo:
          "Fiori bianchi a campanella, rivolti in basso. In serra l'impollinazione la fanno i bombi: senza di loro l'allegagione cala e le bacche restano piccole.",
      },
      {
        titolo: "Frutto verde",
        testo:
          "Le bacche si ingrossano verdi, poi virano al rosa. È la fase in cui irrigazione e clima pesano di più su calibro e sapore.",
      },
      {
        titolo: "Raccolta",
        testo:
          "Blu pieno, con la pruina chiara sulla buccia. La raccolta è a mano e scalare: si ripassa sulle stesse piante più volte, prendendo solo le bacche mature.",
      },
      {
        titolo: "Marmellata",
        testo:
          "Mirtilli, zucchero, un po' di limone. Si cuoce finché non vela il cucchiaio, si invasa caldo in vasetti sterilizzati, si capovolgono e si lasciano raffreddare.",
      },
    ],
  },
  {
    id: "mais",
    nome: "Campo di mais",
    occhiello: "Pieno campo",
    titolo: "Il campo di mais",
    testo: "Dalla semina in primavera alla raccolta di fine estate.",
    camera: [15.2, 1.8, -4],
    guarda: [40, 1.4, 3],
    segno: [17.5, 5, 0],
    andrea: [18.0, 0, -5.2],
    fasi: [
      {
        titolo: "Semina",
        testo:
          "In primavera, col terreno ormai caldo, la seminatrice depone i semi a pochi centimetri di profondità, a file regolari.",
      },
      {
        titolo: "Emergenza",
        testo: "Dopo una o due settimane spuntano le prime foglie. Le file si leggono già da lontano.",
      },
      {
        titolo: "Crescita",
        testo:
          "La pianta allunga il fusto e moltiplica le foglie. È la fase in cui chiede più acqua e azoto.",
      },
      {
        titolo: "Fioritura",
        testo:
          "In cima si apre il pennacchio, il fiore maschile; più in basso escono le sete della spiga. Il polline cade dal pennacchio sulle sete: ogni seta feconda un chicco.",
      },
      {
        titolo: "Maturazione",
        testo: "Le piante seccano e ingialliscono, la granella indurisce dentro le brattee.",
      },
      {
        titolo: "Raccolta",
        testo: "Si raccolgono le pannocchie, restano le stoppie. Il campo si prepara per la stagione successiva.",
      },
    ],
  },
  {
    id: "uliveto",
    nome: "Uliveto",
    occhiello: "Fra i muretti a secco",
    titolo: "L'uliveto",
    testo: "Ulivi fra i muretti a secco, come sui Monti Iblei.",
    camera: [9.5, 1.7, -27],
    guarda: [-6, 1.9, -56],
    segno: [9, 4.6, -31],
    andrea: [5.6, 0, -30.6],
    fasi: [
      {
        titolo: "Fioritura",
        testo:
          "A maggio l'ulivo si copre di piccoli grappoli di fiori bianchi, la mignola. Quanto allega in queste settimane decide buona parte del raccolto.",
      },
      {
        titolo: "Frutto verde",
        testo: "Per tutta l'estate le olive crescono verdi e dure. Si irriga poco, quando serve.",
      },
      {
        titolo: "Invaiatura",
        testo:
          "In autunno le olive cominciano a cambiare colore, dal verde al viola. Per un olio fruttato e intenso si raccoglie qui, a inizio invaiatura.",
      },
      {
        titolo: "Raccolta",
        testo:
          "Si stendono le reti sotto la chioma, si fanno cadere le olive con abbacchiatori e scuotitori, si riempiono le cassette. Poi via al frantoio, senza aspettare.",
      },
    ],
  },
  {
    id: "frantoio",
    nome: "Frantoio",
    occhiello: "Dall'oliva all'olio",
    titolo: "Il frantoio",
    testo: "La molitura, entro poche ore dalla raccolta.",
    camera: [-14, 1.75, -36.2],
    guarda: [-14, 1.2, -46],
    segno: [-14, 5.6, -40],
    andrea: [-16.4, 0, -39.4],
    fasi: [
      {
        titolo: "Lavaggio",
        testo:
          "Le olive arrivano in cassetta, si tolgono foglie e rametti, si lavano. Meno tempo passa dalla raccolta, meglio è: l'oliva ferma in cassetta si scalda e fermenta.",
      },
      {
        titolo: "Molitura",
        testo:
          "Le macine in pietra frangono le olive, nocciolo compreso, fino a una pasta scura e profumata.",
      },
      {
        titolo: "Gramolatura",
        testo:
          "La pasta si rimescola lentamente nella gramola, perché le goccioline d'olio si uniscano. Sotto i 27 °C l'estrazione si dice a freddo.",
      },
      {
        titolo: "Estrazione",
        testo:
          "Il decanter separa l'olio dall'acqua e dalla sansa. Esce verde, torbido, pungente: l'olio nuovo.",
      },
    ],
  },
];

export const zona = (id: ZonaId) => ZONE.find((z) => z.id === id) as Zona;

/* ------------------------------------------------------------------ dialoghi */

export type Scelta = { etichetta: string; va: string | null };
export type Battuta = { testo: string; scelte: Scelta[] };
export type Personaggio = {
  id: string;
  nome: string;
  ruolo: string;
  /** zona fissa; Andrea non ce l'ha: accompagna */
  zona?: ZonaId;
  pos?: [number, number, number];
  /** di quanto è girato (radianti, attorno a y) */
  verso?: number;
  colori: { maglia: string; pantaloni: string; cappello?: string; pelle?: string; capelli?: string; grembiule?: string };
  dialogo: Record<string, Battuta>;
};

const fine: Scelta = { etichetta: "Grazie, a dopo", va: null };

export const PERSONAGGI: Personaggio[] = [
  {
    id: "andrea",
    nome: "Andrea Angilletti",
    ruolo: "Fondatore · agronomo, «Dottor Bakita»",
    colori: { maglia: "#183F35", pantaloni: "#C9B99A", cappello: "#2A2B2E", capelli: "#2B1F17" },
    dialogo: {
      inizio: {
        testo:
          "Ciao, sono Andrea. Qui mi chiamano Bakita. Faccio l'agronomo e il consulente: seguo serre di orticole e piccoli frutti, e impianti di fertirrigazione, dalla realizzazione alla gestione di tutti i giorni. Cosa vuoi sapere?",
        scelte: [
          { etichetta: "Cos'è la fertirrigazione?", va: "fertirrigazione" },
          { etichetta: "Perché i mirtilli in vaso?", va: "vaso" },
          { etichetta: "Il tuo metodo", va: "metodo" },
          { etichetta: "E l'ulivo?", va: "ulivo" },
          fine,
        ],
      },
      fertirrigazione: {
        testo:
          "Concimare con l'acqua d'irrigazione. Ogni goccia porta alla pianta quello che le serve, nella dose giusta. Ma va misurata: EC, pH, quanto entra e quanto drena. Senza dati si va a sensazione, e la sensazione costa.",
        scelte: [
          { etichetta: "E la salinità?", va: "salinita" },
          { etichetta: "Altro", va: "inizio" },
          fine,
        ],
      },
      salinita: {
        testo:
          "È il problema che cresce di più qui nella fascia serricola: acqua di pozzo e suolo sempre più salini. Si gestisce con l'analisi dell'acqua, con la frazione di drenaggio, con la scelta dei concimi. Non si risolve guardando le foglie.",
        scelte: [{ etichetta: "Altro", va: "inizio" }, fine],
      },
      vaso: {
        testo:
          "Fuori suolo controlli tutto: substrato, acqua, nutrizione, pH. Il mirtillo è esigente, vuole un ambiente acido che i nostri terreni calcarei non gli danno. In vaso glielo costruisci.",
        scelte: [
          { etichetta: "Andiamo in serra", va: "@serra" },
          { etichetta: "Altro", va: "inizio" },
          fine,
        ],
      },
      metodo: {
        testo:
          "Indicazioni chiare, per la tua coltura. Prima si guarda come stanno le cose davvero, poi si scrive un piano, poi si verifica. Nelle serre che visito, circa otto aziende su dieci non hanno ancora nessuna automazione: c'è tanto margine.",
        scelte: [{ etichetta: "Altro", va: "inizio" }, fine],
      },
      ulivo: {
        testo:
          "L'ulivo non è il mio mestiere da consulente: io sto in serra. Ma qui siamo in Sicilia, l'uliveto e il frantoio non possono mancare. Vieni, ti faccio vedere la raccolta.",
        scelte: [
          { etichetta: "Andiamo all'uliveto", va: "@uliveto" },
          { etichetta: "Altro", va: "inizio" },
          fine,
        ],
      },
    },
  },
  {
    id: "raccoglitrice",
    nome: "In serra",
    ruolo: "Collaboratrice · raccolta",
    zona: "serra",
    pos: [-31, 0, -1.1],
    verso: Math.PI / 2,
    colori: { maglia: "#8A5A7A", pantaloni: "#3A3F4A", capelli: "#4A2E1E", grembiule: "#D9D2C2" },
    dialogo: {
      inizio: {
        testo:
          "Il mirtillo maturo si stacca da solo, basta sfiorarlo. Se devi tirare, non è pronto. E non si lava prima di metterlo in vaschetta, se no la pruina va via.",
        scelte: [
          { etichetta: "Cos'è la pruina?", va: "pruina" },
          { etichetta: "E la marmellata?", va: "marmellata" },
          fine,
        ],
      },
      pruina: {
        testo: "Quel velo chiaro, quasi azzurro, sulla buccia. È naturale: dice che il frutto è fresco e maneggiato poco.",
        scelte: [{ etichetta: "E la marmellata?", va: "marmellata" }, fine],
      },
      marmellata: {
        testo:
          "Con quelli più morbidi, che non vanno in vaschetta. Niente si butta. Guarda l'ultima fase della serra, ci sono i vasetti sul tavolo.",
        scelte: [fine],
      },
    },
  },
  {
    id: "trattorista",
    nome: "Nel campo",
    ruolo: "Collaboratore · trattorista",
    zona: "mais",
    pos: [20.5, 0, -14.4],
    verso: -2.4,
    colori: { maglia: "#5B6B3A", pantaloni: "#2F3A4F", cappello: "#B8862E" },
    dialogo: {
      inizio: {
        testo:
          "Il mais lo semini quando il terreno è caldo, se no il seme sta lì e non parte. Poi d'estate vuole acqua, tanta, soprattutto quando esce il pennacchio.",
        scelte: [
          { etichetta: "Perché proprio lì?", va: "pennacchio" },
          fine,
        ],
      },
      pennacchio: {
        testo:
          "Perché è la fioritura. Se in quei giorni la pianta soffre la sete, le spighe restano vuote a metà. Lo vedi solo a settembre, quando apri la pannocchia.",
        scelte: [fine],
      },
    },
  },
  {
    id: "raccoglitore",
    nome: "Nell'uliveto",
    ruolo: "Collaboratore · raccolta olive",
    zona: "uliveto",
    pos: [-1.5, 0, -40.5],
    verso: 0.6,
    colori: { maglia: "#A0522D", pantaloni: "#3B3B3B", cappello: "#E6DCC4" },
    dialogo: {
      inizio: {
        testo:
          "Reti sotto, abbacchiatore in mano, e si scuotono i rami. Le olive non devono ammaccarsi: un'oliva rotta comincia subito a ossidarsi.",
        scelte: [
          { etichetta: "Che varietà ci sono qui?", va: "varieta" },
          fine,
        ],
      },
      varieta: {
        testo:
          "Sui Monti Iblei la varietà tipica è la Tonda Iblea: oliva grossa, olio verde, profumo di pomodoro e di erba tagliata.",
        scelte: [fine],
      },
    },
  },
  {
    id: "frantoiano",
    nome: "Al frantoio",
    ruolo: "Collaboratore · frantoiano",
    zona: "frantoio",
    pos: [-13.0, 0, -44.3],
    verso: 0.7,
    colori: { maglia: "#E8E2D0", pantaloni: "#4A4036", cappello: "#E8E2D0", grembiule: "#6B5440" },
    dialogo: {
      inizio: {
        testo:
          "Olive raccolte la mattina, molite entro sera. È questa la regola. L'olio buono si fa in campo, qui si cerca solo di non rovinarlo.",
        scelte: [
          { etichetta: "Cosa vuol dire «a freddo»?", va: "freddo" },
          fine,
        ],
      },
      freddo: {
        testo:
          "Che la pasta non supera i 27 gradi mentre si lavora. Scaldando si tirerebbe fuori più olio, ma si perdono profumi e polifenoli.",
        scelte: [fine],
      },
    },
  },
];
