# Azienda Agricola Angilletti · Comiso

Visita in 3D dell'azienda: il cancello, lo spiazzo col casale in pietra e i carrubi, la serra dei mirtilli (dalla messa a dimora alla marmellata), il campo di mais (dalla semina alla raccolta), l'uliveto (fioritura, invaiatura, raccolta) e il frantoio (lavaggio, molitura, gramolatura, estrazione). Si parla con Andrea Angilletti e con i collaboratori.

Next.js 16 · React 19 · three.js con @react-three/fiber. Tutta la geometria è generata in codice; nessun asset da build esterni.

## Avvio

```
npm install
npm run dev
```

Su Vercel: importare il repo, nessuna configurazione aggiuntiva.

## Dove sono le cose

- `content/azienda.ts` — testi: zone, fasi, dialoghi, posizioni della camera e delle persone.
  - `AUGURI = true` mostra il "Buon compleanno" stroboscopico all'apertura; con `false` resta solo il nome dell'azienda.
  - I collaboratori sono indicati per ruolo: nomi veri vanno nei campi `nome` e `ruolo`.
- `components/Esperienza.tsx` — stato e interfaccia (pannello delle fasi, dialogo, zone, modo guidato/camminata, joystick).
- `components/Avvio.tsx` — schermata di caricamento con gli auguri.
- `components/Scena.tsx` — canvas, cielo, luci, camera (voli fra le zone, trascinamento, camminata), segnaposti.
- `components/mondo/` — terreno e muretti, casale e cancello, serra, mais, uliveto, frantoio, persone.

`?subito` nell'URL annulla i voli della camera (serve alle prove automatiche).

## Comandi

- Visita guidata: clic sulle etichette nella scena o sui pulsanti in basso; frecce ← → per le fasi.
- Cammina: W A S D o frecce, Shift per correre, trascinare per guardarsi intorno; su telefono il joystick.

## Crediti

Texture e modelli da [Poly Haven](https://polyhaven.com), licenza CC0 (gli oggetti in `public/scena/oggetti` compressi con gltf-transform, meshopt e texture webp a 512 px): wooden_ladder, wicker_basket_01, seeding_tray_01, watering_can_metal_01, pot_enamel_01, small_wooden_table_01, planter_pot_clay, outdoor_table_chair_set_01, wooden_crate_01, wooden_bucket_01, shrub_02, jug_01, painted_wooden_bench, stone_wall, clay_roof_tiles_02, red_laterite_soil_stones, dirt_floor, bark_willow_02, qwantani_sunset_puresky, plastic_crate_02, wine_barrel_01, namaqualand_boulder_05, grass_medium_02.
Font: Newsreader, IBM Plex Sans, IBM Plex Mono (SIL Open Font License).

`public/andrea.jpg`: ritaglio di una foto di Andrea pubblicata da FreshPlaza (© FreshPlaza), usata come ritratto nel dialogo.
