# Overleveringsnotat – Sprinklerkontroll

Notatet beskriver appen slik den står ved versjon **0.5.0** (november 2026), slik at en annen person eller en ny Claude-samtale kan gjøre endringer uten forkunnskaper. Les dette først, deretter `README.md`.

Laget av Mads Fjærem. Testversjon for intern bruk.

---

## 1. Kort om appen

Sprinklerkontroll brukes til kontroll av sprinkleranlegg etter NS-EN 12845 og boligsprinkleranlegg etter NS-EN 16925, etter FGs kontrollveiledning FG-920:5.

Hovedfunksjoner:
- Bygg med adresse, kontaktperson og vedlagte dokumenter (tegninger, FDV).
- Kontroller: velg anleggssystem (12845, 16925 eller begge) og kontrolltype (1. gangskontroll eller rutinekontroll). Sjekklisten bygges etter FG-920 A-1, posisjon 01–13.
- Kontrollpunkter med status, notat og forklaring fra FG-920 A-2 (hva som kontrolleres, bolig, typiske avvik med anbefalt kategori, maksimalt trekk).
- Avvik med overskrift, plassering, kommentar, alvorlighetsgrad (stor, middels, liten, merknad) og 1–10 bilder.
- Lukking av avvik ved senere kontroller.
- Kapasitetsmåling med kurvetilpasning p = p0 − k·Q^1,85 og graf.
- Rapporter: avviksoversikt per bygg (PDF, utskrift, CSV) og rapport for én kontroll (PDF, utskrift).
- Firmanavn og logo i rapportene.
- Eksport og import av hele databasen, ett bygg eller én kontroll (zip-fil).

## 2. Hvor alt ligger

| Hva | Hvor |
|---|---|
| Kildekode | https://github.com/HaalandMads/Sprinklerkontroll (offentlig repo, bevisst valg) |
| Web-app (PWA) | https://haalandmads.github.io/Sprinklerkontroll/ |
| Android-APK | GitHub → Actions → «Bygg Android-APK» → Artifacts |
| Bygg av APK | `.github/workflows/android-apk.yml` (startes manuelt eller med tag `v*`) |
| Publisering av PWA | `.github/workflows/pages.yml` (kjører automatisk ved hver push til `main`) |

Det finnes to versjoner av samme app, bygget fra samme kode:
- **APK** for Android. Bruker telefonens egne funksjoner (SQLite, filsystem, PDF-generering, delemeny).
- **PWA** for iPhone, iPad og Android. Kjører i nettleseren og installeres med «Legg til på Hjem-skjerm» / «Installer app».

APK og PWA har hver sin lagring på telefonen. Data flyttes mellom dem med eksport og import.

## 3. Teknisk oppbygging

- **Rammeverk:** Expo SDK 58, React Native 0.88, React 19, TypeScript, Expo Router (filbasert navigasjon i `src/app`).
- **Viktig:** Expo endrer API-er mellom versjoner. Les typedefinisjonene i `node_modules` eller dokumentasjonen for SDK 58 før du bruker en Expo-modul. Ikke stol på hukommelse eller eldre eksempler. Se også `AGENTS.md`.

### Mappestruktur

```
src/app/            Skjermer (Expo Router). [id] og [code] er dynamiske ruter.
  index.tsx           Forside med bygg, import og sikkerhetskopi
  building/[id]/      Byggets skjerm med fanene Oversikt, Avvik, Kapasitet, Dokumenter
  inspection/         Ny kontroll, kontrollskjerm og kontrollpunkt (point/[code].tsx)
  deviation/          Nytt avvik, visning og endring
  capacity/           Kapasitetsmåling
  settings.tsx        Firma og logo
  import.tsx          Import av eksportfil
  info/[code].tsx     Forklaring til et kontrollpunkt
src/components/     Gjenbrukbare komponenter (skjema, graf, punktvelger, UI-elementer)
src/lib/            Logikk
  db.ts               Databaseskjema og alle spørringer
  fg.ts               Hjelpefunksjoner for FG-920 (hvilke punkter som gjelder, etiketter)
  capacity.ts         Kurvetilpasning og grafmodell (felles for app og PDF)
  report.ts           Rapporter (HTML som blir PDF eller utskrift)
  transfer.ts         Eksport og import (zip)
  files.ts            Bilder og dokumenter
  settings.ts         Firma og logo
  platform.ts         Plattformlag for appen (filer, deling, PDF)
  platform.web.ts     Plattformlag for web
  sqlite.ts           Database i appen (expo-sqlite)
  sqlite.web.ts       Database i web (sql.js, lagres i IndexedDB)
  webSetup(.web).ts   Web-oppsett: dialoger og service worker
src/data/fg920.ts   Kontrollpunktene fra FG-920:5 (63 punkter)
scripts/icons.py    Lager PWA-ikonene (mørk bakgrunn, oransje dråper, «WEB»)
scripts/pwa.mjs     Gjør web-bygget til PWA: manifest, service worker, 404.html
```

### App og web fra samme kode

Filer med endelsen `.web.ts` / `.web.tsx` brukes automatisk i web-versjonen, og filen uten `.web` brukes i appen. Bare disse delene er forskjellige:

| Del | App (APK) | Web (PWA) |
|---|---|---|
| Database | `sqlite.ts` (expo-sqlite) | `sqlite.web.ts` (sql.js, hele databasen lagres i IndexedDB etter hver endring) |
| Filer | `platform.ts` (appens dokumentmappe) | `platform.web.ts` (Cache Storage, levert av service worker på `/_files/...`) |
| PDF | `expo-print` lager PDF-fil | Utskriftsvinduet åpnes («Lagre som PDF» / Del) |
| Deling | `expo-sharing` | Web Share API, ellers nedlasting |
| Tastatur | `react-native-keyboard-controller` | Vanlig rullefelt |
| Dialoger | `Alert.alert` | `webSetup.web.ts` erstatter `Alert.alert` med `confirm`/`alert` |

All annen kode, med skjermer, spørringer, rapporter og FG-data, er felles. Ny funksjonalitet bør skrives slik at den bruker `platform.ts` i stedet for å importere `expo-file-system`, `expo-print` eller `expo-sharing` direkte.

## 4. Datamodell (SQLite)

Skjemaet opprettes i `getDb()` i `src/lib/db.ts`.

| Tabell | Innhold |
|---|---|
| `buildings` | Bygg: tittel, adresse, kontaktperson |
| `documents` | Vedlegg til bygg (filnavn lagres, selve filen ligger i plattformens lagring) |
| `inspections` | Kontroller: dato, `type` (`forste`/`rutine`), `system` (`12845`/`16925`/`begge`), kontrollør, notat |
| `inspection_points` | Status og notat per kontrollpunkt per kontroll (nøkkel: `inspection_id` + `code`) |
| `deviations` | Avvik: `nr` (unikt per bygg, vises som A-1, A-2 …), `point_code` (FG-punkt eller `null` = annet avvik), status, lukking |
| `photos` | Bilder per avvik: `file` (1600 px) og `thumb` (600 px til PDF) |
| `capacity_tests` | Kapasitetsmålinger: krav og målepunkter lagret som JSON |
| `settings` | Nøkkel/verdi (firmanavn, logo). Opprettes i `settings.ts` |

Fremmednøkler med `ON DELETE CASCADE`: sletter du et bygg, forsvinner alt som hører til.

**Viktig ved endring av skjemaet:** det finnes ikke migreringer ennå. `CREATE TABLE IF NOT EXISTS` legger ikke til nye kolonner i eksisterende databaser. Ved nye kolonner må det legges inn migrering (for eksempel med `PRAGMA user_version` og `ALTER TABLE`), ellers feiler appen hos brukere som har data fra før. Øk også `FORMAT` i `transfer.ts` hvis eksportformatet endres.

## 5. Eksportformat

En zip med:
- `manifest.json`: app, format (nå 1), omfang (`database`/`building`/`inspection`), tellere.
- `data.json`: rader fra tabellene.
- `files/bilder/…` og `files/dokumenter/…`.

Import slår sammen på ID. Brukeren velger om filen eller telefonen vinner. Ingenting slettes. Avviksnummer som kolliderer, får neste ledige nummer.

## 6. FG-920-data

`src/data/fg920.ts` er hentet fra FG-920:5, veiledningsskjemaene side 46–113, med tabelluttrekk (pdfplumber). Hvert punkt har kode, tittel, standardhenvisninger, om det gjelder ved 1. gangskontroll og/eller rutinekontroll, hva som kontrolleres, særskilte punkter for bolig, typiske avvik med kategori, maksimalt trekk og kommentar.

Kommer det en ny utgave av FG-920, må filen lages på nytt. Ta da med FG-920-PDF-en i samtalen. Innholdet tilhører FG.

## 7. Bygg og publisering

### Android-APK
- Actions → «Bygg Android-APK» → Run workflow (15–25 min). Last ned `Sprinklerkontroll-apk` under Artifacts.
- Workflowen bruker `npm install --legacy-peer-deps` (ikke `npm ci`) på grunn av en avhengighetskonflikt.
- APK-en signeres med Expo-malens faste testnøkkel. Den er lik i hvert bygg, så nye versjoner installeres over gamle uten at data går tapt. Egen nøkkel trengs først ved Google Play.
- Fra 2027 krever Android verifisert utvikler også for APK utenfor Play (med unntak av en egen, tungvint installasjonsprosess). PWA-en er alternativet.

### Web (PWA)
- Publiseres automatisk ved hver push til `main` (ca. 1 minutt).
- GitHub Pages må stå på kilden «GitHub Actions» (Settings → Pages).
- `app.json` → `experiments.baseUrl` er `/Sprinklerkontroll` (undermappen på GitHub Pages).
- Service workeren (`sw.js`, laget av `scripts/pwa.mjs`) lagrer appen for bruk uten nett. Programfiler har versjon i navnet og hentes fra lageret. Manifest og ikoner hentes fra nettet først. Ikonene får sjekksum i filnavnet, slik at endrede ikoner slår gjennom.
- Når en ny versjon tar over, laster appen seg selv på nytt.

### Versjonsnummer
Ved ny versjon: oppdater `version` i `app.json` og `package.json`, øk `android.versionCode` i `app.json` med 1, og legg til en linje under «Versjoner» i `README.md`.

## 8. Slik gjør du endringer

### Alternativ A: Claude Code (anbefalt)
Koble Claude Code til repoet. Den kan lese, endre, typesjekke og committe direkte. Be den lese `OVERLEVERING.md` og `AGENTS.md` først.

### Alternativ B: Claude i chat
Repoet er offentlig, så en ny Claude-samtale med kodekjøring kan hente koden selv:
`https://codeload.github.com/HaalandMads/Sprinklerkontroll/zip/refs/heads/main`
Virker ikke det, last opp en zip av repoet (GitHub → Code → Download ZIP). Endrede filer lastes tilbake via GitHub → Add file → Upload files i riktig mappe.

### Alternativ C: Selv på PC
```bash
npm install --legacy-peer-deps
npx tsc --noEmit                              # typesjekk
npx expo start                                # test med Expo Go eller i nettleser (trykk w)
npx expo export --platform web --output-dir dist   # bygg web lokalt
```
`npx expo install <pakke>` skal brukes for nye Expo-pakker, slik at versjonen passer SDK 58.

### Sjekk før du committer
1. `npx tsc --noEmit` uten feil.
2. `npx expo export --platform android` og `--platform web` uten feil (fanger importfeil).
3. Lint: `npx expo lint` krasjer på avhengighetskonflikt i prosjektet. Kjør ESLint i en kopi av prosjektet med `npm install -D eslint@^9 eslint-config-expo@~58.0.4 --legacy-peer-deps` og en `eslint.config.js` med `eslint-config-expo/flat`. Ikke legg ESLint inn i prosjektets `package.json`, det har tidligere ødelagt bygget.

## 9. Kjente fallgruver

- **Opplasting via GitHubs nettside hopper over filer og mapper som starter med punktum** (`.github`, `.gitignore`). Lag dem med Add file → Create new file i stedet.
- **Mapper med hakeparentes** (`[id]`, `[code]`) må URL-kodes i opplastingsadressen: `.../upload/main/src/app/inspection/%5Bid%5D`.
- **`package-lock.json` i repoet er utdatert.** Byggene bruker `npm install`, så det har ingen betydning, men ikke bytt til `npm ci` uten å oppdatere låsefilen.
- **sql.js:** `db.export()` lukker og åpner databasen på nytt, så `PRAGMA foreign_keys = ON` må settes igjen etterpå. Det gjøres i `sqlite.web.ts`.
- **`Alert.alert` gjør ingenting i nettleseren.** Den er erstattet i `webSetup.web.ts`. Nye dialoger bør bruke `Alert.alert` som før.
- **Bilder og dokumenter:** bare filnavnet lagres i databasen, aldri hele stien. Stien kan endres ved app-oppdatering på iPhone.
- **iPhone (PWA):** fjernes appen fra hjemskjermen, kan dataene slettes. Brukerne må ta sikkerhetskopi.
- **Rapportene** lages som HTML i `report.ts`. Samme HTML brukes til PDF i appen og utskrift i web. Grafen er SVG laget av `chartSvgString` i `capacity.ts`.

## 10. Personvern og innhold

- Appen lagrer kontaktopplysninger (navn, mobil, e-post) og bilder lokalt på enheten. Rapporter og eksportfiler inneholder de samme opplysningene og skal bare deles i godkjente systemer.
- Repoet inneholder ingen passord, nøkler eller kundedata. Ikke legg inn slike ting i koden eller repoet.
- `src/data/fg920.ts` inneholder innhold fra FG-920:5, som tilhører FG.

## 11. Ideer til videre arbeid

- Migreringer for databaseskjemaet (bør gjøres før neste skjemaendring).
- Anleggsvurdering 0–100 etter FG-920 kapittel 3, med trekk per avvik.
- Synkronisering mellom telefoner (f.eks. SharePoint, krever avklaring med IT).
- Påminnelse om sikkerhetskopi i PWA-en.
- Egne maler for typiske avvik.
- Skript i repoet for å lage `fg920.ts` på nytt fra FG-920-PDF-en.

## 12. Filer en ny bruker trenger

| Fil | Når |
|---|---|
| Ingen, hvis Claude kan hente repoet fra GitHub | Alltid først forsøk |
| Zip av repoet (GitHub → Code → Download ZIP) | Hvis Claude ikke kan hente koden selv |
| `OVERLEVERING.md` (ligger i repoet) | Følger med zip-en |
| FG-920:5-PDF-en | Bare hvis kontrollpunktene eller forklaringene skal endres |
| En eksportfil fra appen | Bare ved feilsøking på konkrete data (inneholder personopplysninger) |
