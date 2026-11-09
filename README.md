# Sprinklerkontroll

App for kontroll av sprinkleranlegg etter NS-EN 12845 og boligsprinkleranlegg etter NS-EN 16925, bygget etter FGs kontrollveiledning FG-920:5.

Laget av **Mads Fjærem**. Testversjon for intern bruk.

## Hva appen gjør

- **Bygg:** overskrift, adresse (gate og nummer, postnummer, sted), kontaktperson, mobil og e-post. Dokumenter som tegninger og FDV kan legges ved bygget og åpnes på telefonen.
- **Kontroll:** velg først anleggssystem (NS-EN 12845, NS-EN 16925 eller begge), deretter uavhengig 1. gangskontroll eller rutinekontroll.
  - Sjekklisten bygges etter FG-920 kapittel A-1, posisjon 01–13.
  - 1. gangskontroll tar med alle kontrollpunkter. Rutinekontroll tar bare med punktene FG har merket for rutinekontroll.
  - Punkter som bare gjelder NS-EN 12845 (for eksempel mellomnivåsprinklere) er utelatt når bare NS-EN 16925 er valgt.
- **Kontrollpunkter:** hvert punkt har status (ikke vurdert, OK, avvik, ikke aktuelt), notat og en forklaring etter FG-920 veiledningsskjema A-2. Forklaringen viser hva som skal kontrolleres, særskilte punkter for bolig, typiske avvik med FGs anbefalte kategori, maksimalt trekk og kommentarer.
- **Avvik:** overskrift, plassering, kommentar, alvorlighetsgrad (stor, middels, liten, merknad) og 1–10 bilder fra kamera eller galleri. Et typisk avvik fra FG-920 kan velges som mal. Andre avvik kan alltid legges til, på et hvilket som helst kontrollpunkt eller som «annet avvik».
- **Senere besøk:** tidligere kontroller og dokumenter ligger på bygget. Åpne avvik fra tidligere kontroller vises i den nye kontrollen og kan lukkes med dato og kommentar når de er utbedret.
- **Avviksoversikt per bygg:** del som PDF (med bilder), skriv ut, eller del som CSV for Excel. Du velger om lukkede avvik skal tas med.

Alle data lagres bare på telefonen og sikkerhetskopieres ikke automatisk.

## Personopplysninger og FG-innhold

- Byggene inneholder kontaktopplysninger (navn, mobil, e-post), og bildene kan vise personer eller kundeforhold. PDF- og CSV-filer som deles fra appen inneholder de samme opplysningene. Del dem bare innenfor godkjente systemer.
- `src/data/fg920.ts` inneholder kontrollpunkter og forklaringer fra FG-920:5. Innholdet tilhører FG. **Legg repoet ut som privat på GitHub.**

## Kom i gang på PC

Krever Node.js 22 eller nyere.

```bash
npm ci
npx expo start
```

Installer **Expo Go** fra Google Play eller App Store, og skann QR-koden. Dette er raskeste måte å teste på, både på Android og iPhone. Telefonen og PC-en må være på samme nett, eller bruk `npx expo start --tunnel`.

## Legg prosjektet på GitHub

1. Opprett et **privat** repo på github.com, for eksempel `sprinklerkontroll`.
2. Pakk ut zip-filen og kjør i mappen:
   ```bash
   git init
   git add .
   git commit -m "Sprinklerkontroll 0.1.0"
   git branch -M main
   git remote add origin https://github.com/<brukernavn>/sprinklerkontroll.git
   git push -u origin main
   ```

## Android: last ned APK fra GitHub

Workflowen `.github/workflows/android-apk.yml` bygger en APK på GitHubs servere.

- **Manuelt:** Actions → «Bygg Android-APK» → Run workflow. Når den er ferdig (10–20 min), last ned `Sprinklerkontroll-apk` under Artifacts.
- **Som release:** lag en tag, for eksempel `git tag v0.1.0 && git push origin v0.1.0`. APK-en legges da ved releasen under Releases.

Åpne APK-filen på telefonen og tillat installasjon fra ukjente kilder når Android spør. APK-en er signert med en testnøkkel og er bare ment for testing, ikke for Google Play.

## iPhone

Apple tillater ikke installasjon av apper direkte fra GitHub. Alternativene er:

1. **Expo Go (gratis, for testing):** se «Kom i gang på PC». Appen kjører i Expo Go mens PC-en kjører `npx expo start`.
2. **TestFlight eller intern distribusjon:** krever en betalt Apple-utviklerkonto. Bygg med EAS:
   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest build --platform ios --profile preview
   ```
   EAS kan også bygge Android-APK med `--platform android --profile preview`.

## Teknisk

- Expo SDK 58, React Native, TypeScript og Expo Router (`src/app`).
- SQLite (`expo-sqlite`) for data. Bilder og dokumenter ligger i appens egen mappe, og bare filnavnet lagres i databasen.
- Bilder lagres i to størrelser: 1600 px for visning og 600 px for PDF.
- `npm run typecheck` kjører typesjekk.

## Videre ideer

Eksport av hele kontrollen med status per kontrollpunkt, synkronisering mellom telefoner, sikkerhetskopi, egne maler og anleggsvurdering (0–100) etter FG-920 kapittel 3.
