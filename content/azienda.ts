/*
 * I contenuti della visita: le zone, le fasi di ogni coltura, i dialoghi.
 * I fatti su Andrea vengono da dottorbakita.it; le fasi delle colture sono pratica agricola generale,
 * senza dati specifici dell'azienda che non ci sono stati forniti.
 */

import { CANCELLO_Z, altrove, inSerra } from "./luoghi";

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
      "Dalla trazzera si entra nello spiazzale: le due casette sulla destra, di fronte il capannone dei frutti di bosco, a sinistra il laghetto, in fondo a destra il campo di mais. Gli uliveti e il frantoio sono altrove: ci si va in trattore.",
    camera: [0, 1.7, 17],
    guarda: [0, 2.2, -14],
    segno: [0, 3.8, CANCELLO_Z],
    andrea: [2.8, 0, 9.2],
  },
  {
    id: "spiazzo",
    nome: "Spiazzale",
    occhiello: "Il cuore dell'azienda",
    titolo: "Lo spiazzale",
    testo:
      "Qui si arriva, si scaricano le cassette, si decide la giornata. Sulla destra le due casette, di fronte il capannone, a sinistra il laghetto per l'irrigazione. Il trattore col cartello porta agli uliveti. Andrea è qui: cliccalo per parlargli.",
    camera: [-1.5, 1.7, 4.5],
    guarda: [-2, 2.6, -20],
    segno: [1, 3.2, -1],
    andrea: [1.8, 0, -1.2],
  },
  {
    id: "serra",
    nome: "Frutti di bosco",
    occhiello: "Piccoli frutti fuori suolo",
    titolo: "Il capannone dei frutti di bosco",
    testo:
      "Mirtilli, more e lamponi, coltivati per l'azienda a cui vengono conferiti. Le fasi sono quelle del mirtillo, in vaso e in fertirrigazione: la specialità di Andrea.",
    camera: inSerra(29, 1.7, 10.5),
    guarda: inSerra(-30, 1.3, 10.5),
    segno: inSerra(0, 7.4, 15.5),
    andrea: inSerra(23.5, 0, 9.8),
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
    camera: [19.6, 1.9, 2.5],
    guarda: [31, 1.2, -42],
    segno: [26, 5, 0],
    andrea: [22.8, 0, -3.4],
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
    camera: altrove([9.5, 1.7, -27]),
    guarda: altrove([-6, 1.9, -56]),
    segno: altrove([9, 4.6, -31]),
    andrea: altrove([5.6, 0, -30.6]),
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
    camera: altrove([-14, 1.75, -36.2]),
    guarda: altrove([-14, 1.2, -46]),
    segno: altrove([-14, 5.6, -40]),
    andrea: altrove([-16.4, 0, -39.4]),
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

/* ------------------------------------------------------------------ persone e dialoghi */

/**
 * Un tema di conversazione: la domanda (d), la risposta (r), le domande che ne seguono (poi),
 * e se la risposta porta altrove (vai). Le domande già fatte non tornano nel menu.
 */
export type Tema = { d: string; r: string; poi?: Tema[]; vai?: ZonaId };
/** Quello che un personaggio dice in una zona: il saluto, una domanda per ogni fase, i temi fissi. */
export type Copione = { saluto: string; perFase?: Tema[]; temi: Tema[] };

export type Aspetto = {
  pelle: string;
  capelli: { stile: "raccolti" | "corti" | "coda" | "rasati"; colore: string };
  barba?: "corta" | "baffi" | "lunga";
  cappello?: { tipo: "coppola" | "paglia" | "berretto"; colore: string };
  maglia: { colore: string; maniche: "corte" | "lunghe" };
  pantaloni: string;
  scarpe: string;
  grembiule?: string;
  gilet?: string;
  braccialetto?: string;
  /** altezza in metri */
  altezza?: number;
  /** 1 = media; più alto, più robusto */
  corpo?: number;
};

export type Azione = "fermo" | "raccoglie" | "abbacchia" | "lavora";

export type Personaggio = {
  id: string;
  nome: string;
  ruolo: string;
  /** la riga piccola sull'etichetta */
  sotto: string;
  zona?: ZonaId;
  pos?: [number, number, number];
  verso?: number;
  azione?: Azione;
  aspetto: Aspetto;
  copioni: Partial<Record<ZonaId, Copione>>;
};

/* ---------- Andrea ---------- */

const andrea: Personaggio = {
  id: "andrea",
  nome: "Andrea Angilletti",
  ruolo: "Fondatore · agronomo, «Dottor Bakita»",
  sotto: "Parla con me",
  // dalla foto nella sua serra: capelli scuri e mossi raccolti dietro, barba corta, t-shirt nera, braccialetto
  aspetto: {
    pelle: "#DDB08E",
    capelli: { stile: "raccolti", colore: "#33241A" },
    barba: "corta",
    maglia: { colore: "#1D1D20", maniche: "corte" },
    pantaloni: "#3A4150",
    scarpe: "#7C7468",
    braccialetto: "#6E4326",
    altezza: 1.78,
    corpo: 0.96,
  },
  copioni: {
    cancello: {
      saluto: "Benvenuto! Io sono Andrea, qui tutti mi chiamano Bakita. Entra, ti faccio fare il giro.",
      temi: [
        {
          d: "Chi sei?",
          r: "Agronomo e consulente. Seguo aziende con serre di orticole e di piccoli frutti, e impianti di fertirrigazione: dalla progettazione alla gestione di tutti i giorni.",
          poi: [
            {
              d: "Che colture segui?",
              r: "Piccoli frutti in vaso e su substrato: mirtillo, fragola, lampone, mora. E orticole in serra e in tunnel: pomodoro da mensa, peperone, cetriolo. Vite, cereali e olivo da consulente non li seguo.",
            },
          ],
        },
        {
          d: "Cosa c'è in azienda?",
          r: "Qui il capannone dei frutti di bosco, con mirtilli, more e lamponi, e il campo di mais. Gli uliveti e il frantoio sono a qualche chilometro: ci andiamo in trattore. Ogni zona ha le sue fasi: le puoi scorrere dal pannello a destra.",
          vai: "spiazzo",
        },
      ],
    },
    spiazzo: {
      saluto: "Questo è lo spiazzale: da qui si parte la mattina e qui si torna con le cassette. Chiedimi pure.",
      temi: [
        {
          d: "Andiamo agli uliveti?",
          r: "Andiamo: gli uliveti sono lontani da qui, saliamo sul trattore.",
          vai: "uliveto",
        },
        {
          d: "Cos'è la fertirrigazione?",
          r: "Concimare attraverso l'acqua d'irrigazione. Ogni turno porta alla pianta acqua e nutrienti insieme, nella dose che serve in quel momento. Funziona solo se si misura: EC e pH di quello che entra e di quello che drena.",
          poi: [
            {
              d: "Cosa sono EC e pH?",
              r: "L'EC, la conducibilità elettrica, dice quanti sali ci sono disciolti nella soluzione: in pratica quanto concime. Il pH dice quanto è acida. Se il pH è sbagliato, i nutrienti ci sono ma la radice non li prende.",
            },
            {
              d: "E la salinità?",
              r: "È il problema che cresce di più nella fascia serricola: acqua di pozzo e terreni sempre più salini. Si gestisce con l'analisi dell'acqua, la frazione di drenaggio e la scelta dei concimi. Non si risolve guardando le foglie, perché quando la pianta lo mostra il danno è già fatto.",
            },
          ],
        },
        {
          d: "Come lavori con un'azienda?",
          r: "Indicazioni chiare, per la coltura che hai. Prima un check operativo: una chiamata, una sintesi scritta, una verifica. Poi, se serve, un piano mirato per irrigazione o fertirrigazione. Chi vuole continuare ha l'affiancamento, con la revisione periodica dei dati. Il primo contatto è gratuito.",
        },
        {
          d: "Le serre sono automatizzate?",
          r: "Poche. Fra le aziende che visito, circa otto su dieci non hanno ancora nessuna automazione. Non serve partire da un impianto costoso: già un sensore e una bilancia del drenaggio cambiano il modo di decidere i turni.",
        },
        {
          d: "Cosa non fai?",
          r: "Non installo impianti, non faccio lavori elettrici, non firmo progetti esecutivi o strutturali e non comando gli attuatori a distanza. Io do le indicazioni e controllo che funzionino; il resto lo fanno gli installatori.",
        },
      ],
    },
    serra: {
      saluto: "Qui sono a casa mia: mirtillo fuori suolo, in vaso, tutto in fertirrigazione.",
      perFase: [
        {
          d: "Che vaso e che substrato usate?",
          r: "Vasi grandi, sui 30–40 litri, con buon drenaggio. Il substrato è acido e leggero: torba bionda e fibra di cocco, a volte con perlite. Il mirtillo vuole il pH fra 4,5 e 5,5; sui nostri terreni calcarei in piena terra non ci starebbe mai.",
        },
        {
          d: "Quanti turni d'irrigazione al giorno?",
          r: "Dipende dalla luce, non dall'orologio. In estate anche più di dieci turni brevi; d'inverno pochissimi. Il criterio è il drenaggio: deve uscire dal vaso fra il 20 e il 30% dell'acqua data, così i sali non si accumulano.",
          poi: [
            {
              d: "E che soluzione nutritiva?",
              r: "Il mirtillo è sensibile ai sali: EC basse, spesso sotto 1,5 mS/cm, e pH della soluzione intorno a 5–5,5, corretto con acido. L'azoto va dato soprattutto in forma ammoniacale: il nitrato tende ad alzare il pH vicino alla radice.",
            },
          ],
        },
        {
          d: "Come si impollina in serra?",
          r: "Con i bombi: si mettono le arnie dentro la serra all'inizio della fioritura. Il fiore del mirtillo è a campanella rivolta in basso, le api ci lavorano male. Intanto attenzione all'umidità: con i fiori aperti la botrite ci mette poco a partire. Si arieggia.",
        },
        {
          d: "Cosa può andare storto adesso?",
          r: "Il nemico vero è la Drosophila suzukii, un moscerino che depone le uova nel frutto che sta maturando. Reti antinsetto sulle aperture, trappole per monitorarla, e raccolta frequente: un frutto troppo maturo lasciato sulla pianta la richiama.",
        },
        {
          d: "Ogni quanto si raccoglie?",
          r: "Ogni tre, quattro giorni, a mano, sempre sulle stesse piante. Poi il frutto va portato subito a 0–2 °C: il mirtillo raccolto caldo e lasciato al sole perde consistenza in poche ore.",
        },
        {
          d: "Marmellata o confettura?",
          r: "A rigore è confettura: per legge «marmellata» si dice solo di agrumi. Se c'è almeno il 45% di frutta si può chiamare confettura extra. Ma in famiglia la chiamiamo marmellata lo stesso.",
        },
      ],
      temi: [
        {
          d: "Per chi coltivate?",
          r: "Per un'azienda a cui conferiamo la frutta: loro la selezionano, la confezionano e la vendono. Noi pensiamo a farla crescere bene e a raccoglierla al momento giusto.",
        },
        {
          d: "E le more?",
          r: "Le more stanno su spalliera, legate ai fili. I tralci nati quest'anno fruttificano l'anno dopo, poi si tagliano e si lascia spazio ai nuovi. In serra soffrono il caldo eccessivo: si ombreggia e si arieggia.",
        },
        {
          d: "Perché mirtilli in Sicilia?",
          r: "Perché con le varietà giuste maturano presto, quando sul mercato ce ne sono pochi. Servono cultivar a basso fabbisogno di freddo: le nostre invernate non bastano a quelle del Nord Europa.",
        },
        {
          d: "Che sensori servono davvero?",
          r: "Per cominciare: una sonda per EC e pH, una bilancia o un contenitore per misurare il drenaggio, un sensore di umidità del substrato. Con questi tre dati si decide quando irrigare e quanto concimare. Il resto si aggiunge dopo, se serve.",
        },
        {
          d: "Lei chi è?",
          r: "È lei che conosce ogni pianta di questa serra. Chiedi pure a lei della raccolta.",
        },
      ],
    },
    mais: {
      saluto: "Il mais da consulente non lo seguo, sono un uomo di serra. Ma qui in azienda lo facciamo, e un po' lo conosco.",
      perFase: [
        {
          d: "Quando e come si semina?",
          r: "Quando il terreno supera i 10–12 °C, di solito fra marzo e aprile. Seme a 4–6 centimetri, file a 75 centimetri, circa 7–8 piante per metro quadro se si fa granella.",
        },
        {
          d: "Cosa conta nei primi giorni?",
          r: "Che l'emergenza sia uniforme. Le piante nate in ritardo restano dominate dalle vicine e fanno spighe piccole. Per questo conta la preparazione del letto di semina, più di tutto il resto.",
        },
        {
          d: "Come si concima?",
          r: "L'azoto si frazione: una parte alla semina, il resto in copertura quando la pianta ha 6–8 foglie, prima che cominci a correre. Dare tutto subito vuol dire perderne buona parte.",
        },
        {
          d: "Perché la fioritura è critica?",
          r: "Dalle due settimane prima a quelle dopo l'uscita delle sete il mais non deve soffrire la sete. Se manca l'acqua proprio lì, le sete non vengono fecondate e la spiga resta vuota in punta. Qui in Sicilia l'acqua è il vero limite.",
        },
        {
          d: "Come capisci che è maturo?",
          r: "Alla base del chicco si forma il punto nero: lì la maturazione fisiologica è finita, con il chicco ancora al 30–35% di umidità. Si raccoglie più tardi, verso il 20–25%, poi si essicca fino al 14% per conservarlo.",
        },
        {
          d: "E dopo la raccolta?",
          r: "Si trinciano gli stocchi e si interrano: tornano sostanza organica e si toglie riparo alla piralide. E si ruota: il mais dopo mais richiama la diabrotica, che si combatte meglio cambiando coltura che con i trattamenti.",
        },
      ],
      temi: [
        {
          d: "Quali sono i parassiti del mais?",
          r: "I due principali sono la piralide, un bruco che scava nel fusto e nella spiga, e la diabrotica, un coleottero le cui larve mangiano le radici. Per la prima si monitora il volo degli adulti, per la seconda la difesa migliore è la rotazione.",
        },
        {
          d: "Lui chi è?",
          r: "È quello del trattore: semina, trincia, raccoglie. Chiedigli pure, il campo lo conosce meglio di me.",
        },
      ],
    },
    uliveto: {
      saluto: "L'uliveto: alberi vecchi, muretti a secco. Qui la tecnica conta, ma conta di più arrivare al momento giusto.",
      perFase: [
        {
          d: "Come si impollina l'ulivo?",
          r: "Col vento. Il polline viaggia da un albero all'altro, e molte varietà da sole allegano poco: per questo negli uliveti si mescolano le cultivar. Un vento caldo e secco in piena fioritura può costare mezzo raccolto.",
        },
        {
          d: "Cosa si controlla d'estate?",
          r: "La mosca dell'olivo. Depone l'uovo nell'oliva e la larva la scava da dentro: frutto rovinato e olio con difetti. Si mettono trappole, si contano le punture su un campione di olive, e si interviene solo oltre la soglia.",
        },
        {
          d: "Quando si decide di raccogliere?",
          r: "Guardando il colore di un campione di olive: c'è una scala, l'indice di maturazione. Più si aspetta, più olio si ottiene, ma calano i polifenoli: amaro, piccante, profumi. A inizio invaiatura si sceglie la qualità sulla quantità.",
        },
        {
          d: "Come si raccoglie bene?",
          r: "Reti sotto, abbacchiatori o scuotitori sui rami, e cassette basse e forate, mai sacchi: le olive devono respirare e non schiacciarsi. Poi al frantoio entro la giornata, al massimo entro ventiquattro ore.",
        },
      ],
      temi: [
        {
          d: "Come si pota l'ulivo?",
          r: "A vaso, aperto al centro, perché entri luce in tutta la chioma: l'ulivo fruttifica sui rami dell'anno prima, ben illuminati. Si pota a fine inverno, quando il rischio di gelate è passato, ogni anno o ogni due.",
        },
        {
          d: "Quali malattie fanno più danno?",
          r: "Oltre alla mosca, l'occhio di pavone: un fungo che fa macchie tonde sulle foglie e le fa cadere. Si previene arieggiando la chioma con la potatura e con trattamenti a base di rame nei periodi umidi.",
        },
        {
          d: "Andiamo al frantoio",
          r: "Andiamo, la raccolta di oggi deve essere molita stasera.",
          vai: "frantoio",
        },
      ],
    },
    frantoio: {
      saluto: "Il frantoio. Qui non si migliora l'olio: si cerca di non rovinare quello che è arrivato dal campo.",
      perFase: [
        {
          d: "Perché togliere le foglie?",
          r: "Le foglie danno note amare ed erbacee sgradevoli, e terra e sassi rovinano le macine. Defogliatrice e lavatrice prima di tutto. E le olive non devono restare ferme in cassetta: si scaldano e fermentano, ed è da lì che vengono i difetti.",
        },
        {
          d: "Macine o frangitore?",
          r: "Le macine di pietra sono il metodo antico: lente, scaldano poco, danno un olio più morbido. Il frangitore a martelli o a dischi è più veloce e spinge di più su amaro e piccante. Si sceglie in base all'olio che si vuole.",
        },
        {
          d: "Quanto dura la gramolatura?",
          r: "Fra mezz'ora e tre quarti d'ora. Più si gramola e più si scalda, più olio si estrae ma meno profumi restano. Se la pasta non supera i 27 °C si può scrivere «estratto a freddo».",
        },
        {
          d: "Due fasi o tre fasi?",
          r: "Il decanter a tre fasi aggiunge acqua per separare olio, acqua e sansa; quello a due fasi non ne aggiunge, e l'olio si tiene più polifenoli. Poi un separatore verticale toglie le ultime goccioline d'acqua.",
        },
      ],
      temi: [
        {
          d: "Quanto olio da un quintale di olive?",
          r: "Di solito fra 12 e 20 chili, a seconda di varietà, maturazione e annata. Le olive raccolte presto ne danno meno, ma è l'olio migliore.",
        },
        {
          d: "Quando un olio è extravergine?",
          r: "Quando l'acidità libera non supera lo 0,8%, gli altri parametri chimici sono nei limiti e il panel d'assaggio non trova difetti e sente il fruttato. Basta un difetto all'assaggio, per esempio di riscaldo, e non è più extravergine.",
        },
        {
          d: "Perché l'olio nuovo pizzica?",
          r: "Per i polifenoli: l'oleocantale dà il piccante in gola, l'oleuropeina l'amaro. Sono antiossidanti, e si attenuano coi mesi. Un olio nuovo che non pizzica per niente, di solito, viene da olive troppo mature.",
        },
        {
          d: "Come si conserva?",
          r: "In acciaio inox, al buio, fra 12 e 18 °C, possibilmente sotto azoto. Filtrato, se deve durare: i residui sul fondo fermentano. Nemici: luce, aria e calore.",
        },
      ],
    },
  },
};

/* ---------- i collaboratori ---------- */

const raccoglitrice: Personaggio = {
  id: "raccoglitrice",
  nome: "In serra",
  ruolo: "Collaboratrice · raccolta",
  sotto: "Collaboratrice",
  zona: "serra",
  pos: inSerra(8, 0, 9.8),
  verso: -Math.PI / 2,
  azione: "raccoglie",
  aspetto: {
    pelle: "#C68E68",
    capelli: { stile: "coda", colore: "#4A2E1E" },
    maglia: { colore: "#8A5A7A", maniche: "lunghe" },
    pantaloni: "#3A3F4A",
    scarpe: "#4B4F57",
    grembiule: "#D9D2C2",
    altezza: 1.65,
    corpo: 0.9,
  },
  copioni: {
    serra: {
      saluto: "Ciao! Sto passando le piante, oggi ce n'è da prendere.",
      perFase: [
        { d: "Come si mettono a dimora?", r: "Una piantina per vaso, il colletto a filo del substrato, mai interrato. Poi si bagna bene e si controlla che dreni dal fondo." },
        { d: "Cosa controlli ogni mattina?", r: "Che i gocciolatori gocciolino tutti. Basta un gocciolatore otturato e quel vaso in estate secca in un giorno." },
        { d: "I bombi pungono?", r: "Quasi mai, se non li disturbi. Lavorano tranquilli: guarda i fiori, quando ci sono stati lasciano un segnetto scuro." },
        { d: "Quando diventano blu?", r: "Dal verde passano al rosa, poi al blu. Ma blu non vuol dire pronto: deve essere blu anche attorno al picciolo, se no è ancora aspro." },
        { d: "Come capisci che è maturo?", r: "Il mirtillo maturo si stacca da solo, basta sfiorarlo. Se devi tirare, non è pronto. E non si lava prima della vaschetta, se no va via la pruina." },
        { d: "Quali usate per la marmellata?", r: "Quelli più morbidi, che in vaschetta non reggerebbero il viaggio. Niente si butta." },
      ],
      temi: [{ d: "Cos'è la pruina?", r: "Quel velo chiaro, quasi azzurro, sulla buccia. È naturale: dice che il frutto è fresco e che è stato toccato poco." }],
    },
  },
};

const trattorista: Personaggio = {
  id: "trattorista",
  nome: "Nel campo",
  ruolo: "Collaboratore · trattorista",
  sotto: "Collaboratore",
  zona: "mais",
  pos: [23.6, 0, 1.2],
  verso: -2.4,
  azione: "fermo",
  aspetto: {
    pelle: "#B97E58",
    capelli: { stile: "corti", colore: "#5A5650" },
    barba: "baffi",
    cappello: { tipo: "berretto", colore: "#B8862E" },
    maglia: { colore: "#5B6B3A", maniche: "lunghe" },
    gilet: "#2F3A2C",
    pantaloni: "#2F3A4F",
    scarpe: "#3A2E24",
    altezza: 1.74,
    corpo: 1.1,
  },
  copioni: {
    mais: {
      saluto: "Buongiorno. Il trattore è pronto, dimmi tu.",
      perFase: [
        { d: "Quanto ci vuole a seminare?", r: "Con la seminatrice a quattro file, mezza giornata per questo campo. Il difficile è prima: il terreno deve essere lavorato fine, senza zolle." },
        { d: "Si vedono già le file?", r: "Sì, e si vede subito se la seminatrice ha saltato qualche seme: buchi nella fila che non si recuperano più." },
        { d: "Quando si passa col concime?", r: "Quando le piante arrivano al ginocchio. Dopo il trattore non entra più, il mais è troppo alto." },
        { d: "Si irriga adesso?", r: "Adesso più che mai. Se in questi giorni manca l'acqua, a settembre apri la pannocchia e la trovi mezza vuota." },
        { d: "Quando si raccoglie?", r: "Quando le brattee sono secche e il chicco non si segna più con l'unghia. Prima si fa una prova di umidità." },
        { d: "E adesso le stoppie?", r: "Si trinciano e si interrano. Poi si decide cosa mettere: qui il mais due anni di fila non lo facciamo." },
      ],
      temi: [],
    },
  },
};

const raccoglitore: Personaggio = {
  id: "raccoglitore",
  nome: "Nell'uliveto",
  ruolo: "Collaboratore · raccolta olive",
  sotto: "Collaboratore",
  zona: "uliveto",
  pos: altrove([-1.5, 0, -40.5]),
  verso: 0.6,
  azione: "abbacchia",
  aspetto: {
    pelle: "#B07650",
    capelli: { stile: "corti", colore: "#1E1A18" },
    barba: "lunga",
    cappello: { tipo: "paglia", colore: "#D9C08A" },
    maglia: { colore: "#A0522D", maniche: "lunghe" },
    pantaloni: "#3B3B3B",
    scarpe: "#2E2620",
    altezza: 1.72,
    corpo: 1.05,
  },
  copioni: {
    uliveto: {
      saluto: "Eccoci, giornata buona per la raccolta: niente vento.",
      perFase: [
        { d: "In fioritura si fa qualcosa?", r: "Si guarda e si spera. Se arriva lo scirocco proprio adesso, i fiori seccano e c'è poco da fare." },
        { d: "D'estate cosa fate qui?", r: "Si controllano le trappole per la mosca e si tiene pulito sotto gli alberi. E si spera nella pioggia di fine estate." },
        { d: "Si può già raccogliere?", r: "Io comincerei adesso, con le prime viola. L'olio viene verde e pizzica: quello buono." },
        { d: "Come si usa l'abbacchiatore?", r: "Si pettina il ramo dall'interno verso fuori, senza picchiare. Se si spezzano i rametti, l'anno dopo l'albero produce meno." },
      ],
      temi: [{ d: "Che varietà ci sono qui?", r: "Sui Monti Iblei la varietà tipica è la Tonda Iblea: oliva grossa, olio verde, profumo di pomodoro e di erba tagliata." }],
    },
  },
};

const frantoiano: Personaggio = {
  id: "frantoiano",
  nome: "Al frantoio",
  ruolo: "Collaboratore · frantoiano",
  sotto: "Collaboratore",
  zona: "frantoio",
  pos: altrove([-13.0, 0, -44.3]),
  verso: 0.7,
  azione: "lavora",
  aspetto: {
    pelle: "#C7906A",
    capelli: { stile: "rasati", colore: "#3A3632" },
    cappello: { tipo: "coppola", colore: "#4A4440" },
    maglia: { colore: "#E8E2D0", maniche: "lunghe" },
    grembiule: "#6B5440",
    pantaloni: "#4A4036",
    scarpe: "#2A2420",
    altezza: 1.7,
    corpo: 1.15,
  },
  copioni: {
    frantoio: {
      saluto: "Benvenuto. Olive raccolte stamattina, molite entro sera: questa è la regola.",
      perFase: [
        { d: "Le olive arrivano pulite?", r: "Mai del tutto. Foglie, rametti, a volte un sasso: per questo prima passano dalla defogliatrice. Un sasso nelle macine è una giornata persa." },
        { d: "Quanto girano le macine?", r: "Piano, una ventina di giri al minuto. Si sente dal rumore quando la pasta è pronta: diventa più sordo." },
        { d: "Cosa vuol dire «a freddo»?", r: "Che la pasta non supera i 27 gradi mentre si lavora. Scaldando si tirerebbe fuori più olio, ma si perdono profumi e polifenoli." },
        { d: "Quando si imbottiglia?", r: "Quello nuovo, torbido, si assaggia subito. Il resto si lascia decantare o si filtra, e va nei serbatoi d'acciaio." },
      ],
      temi: [{ d: "Si può assaggiare?", r: "Certo: un goccio sul pane caldo con un pizzico di sale. Se ti pizzica in gola, è buono." }],
    },
  },
};

export const PERSONAGGI: Personaggio[] = [andrea, raccoglitrice, trattorista, raccoglitore, frantoiano];
