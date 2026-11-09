// Kontrollpunkter fra FG-920:5 «Kontroll av faste automatiske vannbaserte slokkeanlegg» (gyldig fra 01.11.2024),
// kapittel A-1 (sjekklister) og A-2 (veiledningsskjema). Innholdet tilhører FG / Finans Norge og er hentet for intern bruk.
// Kategorier: stor, middels, liten, merknad, iv (ingen anleggsvurdering).

export type FgCategory = 'stor' | 'middels' | 'liten' | 'merknad' | 'iv';
export type FgAvvik = { text: string; cats: FgCategory[] };
export type FgPoint = {
  code: string; pos: string; title: string; ref12845: string; ref16925: string; applies16925: boolean;
  first: boolean; routine: boolean; page: number; scope: string[]; bolig: string[]; avvik: FgAvvik[]; trekk: string; comment: string;
};

export const FG_POSITIONS: Record<string, string> = {
  "01": "Dokumentasjon",
  "02": "Sprinklerbeskyttelsens omfang",
  "03": "Klassifisering",
  "04": "Vannforsyning, generelt",
  "05": "Vannforsyning, spesielt",
  "06": "Pumper",
  "07": "Anleggstyper og omfang",
  "08": "Sprinklerhoder, karakteristikk og plassering",
  "09": "Ventiler",
  "10": "Alarmer og alarmutstyr",
  "11": "Rørledninger",
  "12": "Skilt, angivelser og informasjon",
  "13": "Ettersyn, kontroll og vedlikehold"
};

export const FG_POINTS: FgPoint[] = [
 {
  "code": "1-1",
  "pos": "01",
  "title": "Grunnlagsdata",
  "ref12845": "4.1, 4.2, 4.3",
  "ref16925": "NA 4.2, 4.1, 4.2, 4.3",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 46,
  "scope": [
   "Objekt (adresse, gnr/bnr., bygningsnummer).",
   "Eier og bruker.",
   "Virksomhet.",
   "Bygningskonstruksjon.",
   "Prosjekterende, kontroll av prosjekterende, utførende og kontroll av utførende.",
   "Installasjons år.",
   "Standard.",
   "Sprinklet og usprinklet areal.",
   "Alarmoverføring."
  ],
  "bolig": [
   "Systemløsning med prosjektert anlegg og klassifisering i ulike områder."
  ],
  "avvik": [],
  "trekk": "0 < Liten≤5 | 5 < Middels≤10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "1-2",
  "pos": "01",
  "title": "Prosjekteringsgrunnlag",
  "ref12845": "4.4",
  "ref16925": "NA. 6.1, 4.4",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 47,
  "scope": [
   "Følgende må minst være beskrevet:",
   "Generell beskrivelse av objektet.",
   "Systemløsning (f.eks. anleggstype, endeanlegg, spesialsystemer og andre regelverk).",
   "Virksomhet og klassifisering.",
   "Lagringsforhold.",
   "Spesielle forhold."
  ],
  "bolig": [
   "Systemløsning med oppdeling bolig/næring/garasje/boder",
   "Type sprinklerhoder brukt i ulike arealer, dekningsområder i henhold til datablad og hydrauliske beregninger.",
   "Lagring og hindringer i bodarealer.",
   "Særskilte løsninger for parkering – automatiske parkeringsanlegg.",
   "Sprinkling av balkonger i henhold til «Byggteknisk forskrift med veiledning».",
   "Innredninger i leiligheter som eks. garderobeskap."
  ],
  "avvik": [
   {
    "text": "Mangelfullt beskrevet prosjekteringsgrunnlag.",
    "cats": [
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 6< Middels≤10 | 8< Stor≤50",
  "comment": "Anleggsvurdering gjennomføres i øvrige sjekkpunkter."
 },
 {
  "code": "1-3",
  "pos": "01",
  "title": "Tegninger",
  "ref12845": "4.4.3.1",
  "ref16925": "4.4.3.1, NA. 4.2",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 48,
  "scope": [
   "Det skal foreligge «som bygget» tegninger hvor minimum følgende opplysninger skal komme frem:",
   "Systemoppbygning.",
   "Plassering av kontrollventilsett og soneventiler.",
   "Kontrollventilsettenes dekningsområder.",
   "Rørføring med dimensjoner.",
   "Plassering av sprinklerhoder.",
   "Plassering dreneringspunkter.",
   "Plassering av prøvingsventiler.",
   "Angivelse av utløsningsarealer med referanser til hydrauliske beregninger.",
   "Angivelse av type sprinklerhoder med symbolforklaring.",
   "Brannteknisk skille mellom sprinklet og usprinklet område.",
   "Bruk av spesialkomponenter (f.eks. fleksible slanger, rør og komponenter)."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende opplysninger på tegningsgrunnlaget.",
    "cats": [
     "liten",
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "Kontrolløren selv må vurdere om tegningen må inkludere flere opplysningen enn hva som fremkommer under omfang."
 },
 {
  "code": "1-4",
  "pos": "01",
  "title": "Beregninger/dimensjonering",
  "ref12845": "4.4.3.2, 4.4.3.3, 7.1, 7.2, 7.3, 13",
  "ref16925": "NA.6, 4.4.3.2, 4.4.4.2, 6, Tillegg D",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 49,
  "scope": [
   "Følgende må foreligge:",
   "Utskrift av hydrauliske beregninger for fullstendig beregnende systemer med referanser til tegninger, eller beregning for forhåndskalkulerte systemer dersom dette er benyttet.",
   "Tydelig indentifisering, som angir plassering av areal som ligger til grunn for hydraulisk beregning, ved f.eks. tegningsnummer, etasje, arealbetegnelse, rom navn, romnummer.",
   "Strømningsskjema med nodenummer (bør foreligge).",
   "Hydrauliske beregninger skal foreligge for følgende systemer: grid, ring, systemer med reolsprinkler og i systemer hvor det er benyttet spesialsprinklere (f.eks. EC, ESFR, CMSA,",
   "Attic, Bolig sprinkler) eller spesielle rør eller komponenter (f.eks. pressfittingssystemer, fleksible slanger).",
   "Følgende må kontrolleres:",
   "Prosjektforutsetninger og systemkrav.",
   "Samsvar mellom tegningsgrunnlag og hydraulisk beregning.",
   "Fremstår hydrauliske beregninger som sannsynlige og i samsvar med overslagsberegning.",
   "Spesialkomponenter (f.eks. fleksible slanger, rør og komponenter) er hensyntatt i hydrauliske beregninger."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Hydraulisk beregning er feil, eller foreligger ikke på systemer hvor det ikke kan benyttes tabelldimensjonering.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Hydrauliske beregninger foreligger, men er mangelfulle.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Beregning for forhåndskalkulert systemer foreligger ikke, er feil eller mangelfulle.",
    "cats": [
     "middels",
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels≤10 | 15 < Stor≤30",
  "comment": ""
 },
 {
  "code": "1-5",
  "pos": "01",
  "title": "Type og valg av vannforsyning",
  "ref12845": "4.4.4, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6",
  "ref16925": "4.4.4,7, 8",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 50,
  "scope": [
   "Følgende må minst være beskrevet:",
   "Type vannforsyning:",
   "o Offentlig vanntilførsel o Offentlig vanntilførsel med trykkøkningspumpe o Basseng med full kapasitet og en eller flere pumper o Basseng med etterfylling og en eller flere pumper o Utømmelig kilde med eller uten pumper o Trykktanker",
   "Valg av vannforsyning:",
   "o Enkel vannforsyning o Forbedret enkel vannforsyning o Dobbel vannforsyning",
   "Følgende må foreligge:",
   "Situasjonsplan",
   "Systemskjema"
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende opplysninger om vannforsyning.",
    "cats": [
     "liten",
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels≤15 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "1-6",
  "pos": "01",
  "title": "Dokumentasjon av fravik fra prosjekteringsstandard og bruk av typegodkjente produkter utenfor standard.",
  "ref12845": "19.2",
  "ref16925": "NA. 5, Tillegg F",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 51,
  "scope": [
   "Det foreligger dokumentasjon som viser at valgt fraviksløsning er likeverdig med krav i NS",
   "12845.",
   "Forutsetningene og kriteriene for valgt fraviksløsning er ivaretatt.",
   "Verifisere at krav i datablad er ivaretatt ved fraviksløsning som innebærer bruk av produkter som ikke omhandles i NS-EN 12845."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende dokumentasjon av fraviksløsning.",
    "cats": [
     "stor",
     "middels",
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Forutsetninger for fraviksløsning er ikke ivaretatt.",
    "cats": [
     "stor",
     "middels",
     "liten",
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels≤15 | 15 < Stor≤30",
  "comment": "Alvorlighetsgrad vurderes av kontrollør. Større trekk/ingen anleggsvurdering kan være aktuelt."
 },
 {
  "code": "1-7",
  "pos": "01",
  "title": "FDV-dokumentasjon",
  "ref12845": "19.2, 20",
  "ref16925": "17.4, NA.18",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 52,
  "scope": [
   "Det foreligger komplett FDV dokumentasjon (f.eks. FDV i henhold til BTF)."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende eller mangelfull FDV dokumentasjon.",
    "cats": [
     "liten",
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels≤10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "2-1",
  "pos": "02",
  "title": "Sprinklerbeskyttelsens omfang",
  "ref12845": "5.1, 5.2",
  "ref16925": "NA.5",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 53,
  "scope": [
   "Samsvar mellom tegning og installert anlegg.",
   "Bruk av tillatte unntak og oppfyllelse av forutsetninger for disse.",
   "Bruk av nødvendige unntak.",
   "Tilfredsstillende dekning av usprinklede arealer med annet automatisk slokkeanlegg.",
   "Avstand mellom utvendig lagring (i friluft) av brennbare materialer og bygning."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende beskyttelse i mindre arealer, som enkeltstående kontor eller toaletter hvor forutsetninger for tillatte unntak ikke er ivaretatt.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Manglende beskyttelse i trapperom.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Manglende beskyttelse i større arealer, som ikke er tillatt i henhold til 5.1.1 og 5.1.2.",
    "cats": [
     "stor",
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels≤15 | 10 < Stor ≤ 20",
  "comment": "Alvorlighetsgrad på avvik knyttet til større usprinklede arealer vurderes av kontrollør. Større trekk/ingen anleggsvurdering kan være aktuelt."
 },
 {
  "code": "2-2",
  "pos": "02",
  "title": "Skille mellom sprinklet og usprinklet område",
  "ref12845": "5.3 TEK10/VTEK10",
  "ref16925": "5.4",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 54,
  "scope": [
   "Kvaliteten og brannmotstand på brannteknisk skille mellom sprinklet og usprinklet område."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende skille mellom sprinklet og usprinklet areal.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Mangelfullt skille mellom sprinklet og usprinklet areal (f.eks. gjennomføringer, dør uten brannmotstand).",
    "cats": [
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels≤10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "2-3",
  "pos": "02",
  "title": "Beskyttelse av skjulte hulrom",
  "ref12845": "5.4",
  "ref16925": "5.2, NA.5",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 55,
  "scope": [
   "Skjulte hulrom er sprinklet i henhold til standard.",
   "Himlingen er intakt (himlingsplater er på plass)."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Punktsprinkling av kabelgate eller tilsvarende.",
    "cats": [
     "middels",
     "liten"
    ]
   },
   {
    "text": "Manglende sprinkling av skjulte hulrom med høyde over 800 mm.",
    "cats": [
     "middels",
     "liten"
    ]
   },
   {
    "text": "Manglende sprinkling av skjulte hulrom med brennbare installasjoner utover det som er tillatt i standard.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Manglende sprinkling av skjulte hulrom utført med brennbare materialer.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Manglende sprinkling av skjulte hulrom med høyde under 300 mm.",
    "cats": [
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Åpninger i himling (f.eks. manglende himlingsplater).",
    "cats": [
     "liten",
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels≤10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "2-4",
  "pos": "02",
  "title": "Høydeforskjell mellom de høyeste beliggende og laveste beliggende sprinklerne",
  "ref12845": "5.5 Tillegg E",
  "ref16925": "NA.1",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 56,
  "scope": [
   "Høydeforskjell mellom høyeste beliggende og laveste beliggende sprinklerne."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Høydeforskjell større enn 45 m mellom høyeste beliggende og laveste beliggende sprinklerne.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Høydesystem med feil fareklasse.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Høydesystem uten forbedret enkel vannforsyning.",
    "cats": [
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "3-1",
  "pos": "03",
  "title": "Klassifisering i fareklasse",
  "ref12845": "6.1, 6.2 Tillegg A, B og C",
  "ref16925": "NA.2",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 57,
  "scope": [
   "Samsvar mellom virksomhet og prosjektert fareklasse."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Anlegget er plassert i feil OH klasse i forhold til bygningens virksomhet.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Anlegget er plassert i fareklasse OH men virksomhet samsvarer med fareklasse HHP.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Anlegget er plassert i fareklasse OH3 men virksomhet samsvarer med fareklasse HHS.",
    "cats": [
     "stor",
     "iv"
    ]
   },
   {
    "text": "Krav i forhold til spesialsystemer er ikke ivaretatt.",
    "cats": [
     "stor",
     "iv"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 15< Stor ≤ 50",
  "comment": "Eventuelle mangler knyttet til vannforsyning som følge av feil fareklasse vurderes under relevante sjekkpunkter knyttet til anlegges vannforsyning. Anlegg hvor feil fareklasse innebærer alvorlige feil i forutsetninger, dekning, vannmengder, mv., skal ikke gis anleggsvurdering. Tilsvarende gjelder hvor krav til spesialsystemer ikke er ivaretatt i prosjekteringen."
 },
 {
  "code": "3-2",
  "pos": "03",
  "title": "Lagringsforhold –varekategori, lagringsmåte og lagringshøyde",
  "ref12845": "6.3",
  "ref16925": "-",
  "applies16925": false,
  "first": true,
  "routine": true,
  "page": 58,
  "scope": [
   "Samsvar mellom lagret vare og prosjektert varekategori.",
   "Samsvar mellom lagringsmåte og prosjektert lagringsmåte.",
   "Samsvar mellom lagringshøyde og prosjektert lagringshøyde."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Feil varekategori.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Feil lagringsmåte.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Feil lagringshøyde.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "Avvikets alvorlighetsgrad må vurderes av kontrollør."
 },
 {
  "code": "3-3",
  "pos": "03",
  "title": "Mellomnivåsprinkler",
  "ref12845": "6.3.2, 12.5",
  "ref16925": "-",
  "applies16925": false,
  "first": true,
  "routine": true,
  "page": 59,
  "scope": [
   "Riktig plassering.",
   "Avstandsmål i reol.",
   "Skade på sprinklerhoder.",
   "Egen kontrollventil ved mer enn 50 sprinklerhoder.",
   "Drenering på laveste nivå."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Feil plassering.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Manglende avstandsmål.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Skade på sprinklerhode.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Ikke eget kontrollventilsett ved mer enn 50 sprinklerhoder.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Manglende drenering.",
    "cats": [
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "Alvorlighetsgrad på avvik knyttet til feil plassering og manglende avstandsmål må vurderes av kontrollør."
 },
 {
  "code": "3-4",
  "pos": "03",
  "title": "Beskyttelse av spesiell risiko",
  "ref12845": "Tillegg G",
  "ref16925": "-",
  "applies16925": false,
  "first": true,
  "routine": true,
  "page": 60,
  "scope": [
   "Beskyttelse av spesiell risiko i henhold til tillegg G.",
   "o Aerosoler.",
   "o Lagring av klær på hengere i flere høyder.",
   "o Lagring av brennbare væsker.",
   "o Tomme paller.",
   "o Alkoholholdige væsker i tre tønner.",
   "o Ikke-vevde syntetiske stoffer.",
   "o Lagring av polypropylen eller polyetylen."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Anlegget er utformet slik at krav i tillegg G ikke er ivaretatt.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 10< Stor ≤ 20",
  "comment": "Avvikets alvorlighetsgrad må vurderes av kontrollør."
 },
 {
  "code": "4-1",
  "pos": "04",
  "title": "Operasjonstid, kontinuitet og vanntrykk",
  "ref12845": "8.1, 8.2",
  "ref16925": "7",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 61,
  "scope": [
   "Frostsikring av tilførselsrør og kontrollventilsett.",
   "Vannforsyningens kontinuitet (f.eks. rørbrudds ventil, trykkreduksjonsventil)."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende frostsikring.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Vannforsyningens kontinuitet.",
    "cats": [
     "stor"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10< Stor ≤ 50",
  "comment": ""
 },
 {
  "code": "4-2",
  "pos": "04",
  "title": "Oppbygning vannforsyning –uttak andre formål og trykkbryter for lavt trykk.",
  "ref12845": "8.3, 9.2 Tillegg H",
  "ref16925": "7.1.3",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 62,
  "scope": [
   "Tilkobling og uttak for annet forbruk.",
   "Trykkbryter for lavt trykk."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Uttak for annet forbruk etter krav fra vannverket.",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Uttak for annet forbruk og hensyntatt ved prosjektering.",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Uttak for annet forbruk og ikke hensyntatt ved prosjektering.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Ikke montert trykkbryter for lavt trykk.",
    "cats": [
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "Alvorlighetsgrad på avvik hvor annet forbruk ikke er hensyntatt ved prosjektering må vurderes av kontrollør."
 },
 {
  "code": "4-3",
  "pos": "04",
  "title": "Plassering vannforsyningsutstyr",
  "ref12845": "8.4",
  "ref16925": "7.4",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 63,
  "scope": [
   "Tilgang på vannforsyning, stengeventiler og kontrollventilsett ved brann.",
   "Omfang av sprinklerbeskyttelse av sprinklerrommet eller områder som inneholder komponenter som inngår i anleggets vannforsyning."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende sprinklerbeskyttelse av sprinklerrommet eller tilsvarende områder/rom.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Punktbeskyttelse av sprinklersentral og rørføring.",
    "cats": [
     "liten",
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "4-4",
  "pos": "04",
  "title": "Tilbakeslagssikring og tilpasning til lokale forhold",
  "ref12845": "NS1717",
  "ref16925": "7.2",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 64,
  "scope": [
   "Tetthet – manometer avlesning før og etter tilbakeslagsventil dersom dette er montert",
   "Lekkasjer fra kat. 4 ventiler",
   "Gjeldende kommunale krav"
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Vedlikeholdav tilbakeslagsventil og filtreer ikke utført i henhold til produsentens beskrivelse",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Dokumentasjon avvedlikehold er mangelfulleller er ufullstendig i forhold til kommunale krav.",
    "cats": [
     "stor",
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels≤10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "4-5",
  "pos": "04",
  "title": "Kapasitetsmåling",
  "ref12845": "8.5, 8.6",
  "ref16925": "7.5",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 65,
  "scope": [
   "Vannforsyningens kapasitet.",
   "o Fullstendig tappeprøve.",
   "o Nettverksberegning med delvis tappeprøve.",
   "o Nettverksberegning."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende kapasitetsmålingsutstyr hvor tappeprøve ikke tillattes. Forutsetter verifisert nettverksberegning og mulighet for test via hoved drenering på kontrollventilsett.",
    "cats": [
     "middels",
     "liten"
    ]
   },
   {
    "text": "Manglende kapasitetsmålingsutstyr hvor tappeprøve kan tillattes.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Manglende drenering av prøvevann.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Ikke mulig å verifisere vannforsyning.",
    "cats": [
     "iv"
    ]
   },
   {
    "text": "Ikke mulig å gjennomføre tappeprøve (full eller delvis) hvor kalibrert nettverksberegning viser tilfredsstillende kapasitet.",
    "cats": [
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 15 | 15< Stor ≤ 50",
  "comment": "Anlegg skal ikke gis anleggsvurdering dersom vannforsyningens kapasitet ikke kan verifiseres. Se også utfyllende beskrivelse i avsnitt 5.3. Betydning av forhold som ikke er omhandlet i dette veiledningsskjema eller i avsnitt 5.3 må vurderes av kontrollør."
 },
 {
  "code": "5-1",
  "pos": "05",
  "title": "Lagringstank",
  "ref12845": "9.3, 20.3.5, 20.3.6 Tillegg H",
  "ref16925": "8.3",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 66,
  "scope": [
   "Tilgjengelighet for inspeksjon.",
   "Vannvolum.",
   "Vannstandindikator.",
   "Etterfylling.",
   "Filtre.",
   "Lufttilførsel (unngå vakuum).",
   "Overvåking av kritisk væskenivå.",
   "Oppvarming/overvåking lav temperatur.",
   "Vedlikeholds intervall."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende inspeksjonsåpninger.",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Tank eventuelt med etterfylling, har avvik i beregnet vannmengde på < 5%",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Tank eventuelt med etterfylling, har avvik i beregnet vannmengde på 5% til 15 %",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Tank eventuelt med etterfylling, har avvik i beregnet vannmengde på > 15%",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Flottører for etterfylling ikke kontrollert årlig.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Vanntanker ikke kontrollert hvert 3.år.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Vanntanker ikke hatt 10 års kontroll.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Ikke etablert løsning for etterfylling innen 36 timer",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Manglende overvåking av vannstand i tank.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Manglende sikring mot frost.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Manglende filter når det er krav om dette.",
    "cats": [
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 15< Stor ≤ 30",
  "comment": ""
 },
 {
  "code": "5-2",
  "pos": "05",
  "title": "Utømmelig kilde",
  "ref12845": "9.4",
  "ref16925": "8.2",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 68,
  "scope": [
   "Dimensjon sugekammer.",
   "Plassering vanninntak.",
   "Filtre."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Felle og sugekammer ikke iht. krav.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Sugeledning ikke utført iht. til krav.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Krevde filtre ikke montert.",
    "cats": [
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "5-3",
  "pos": "05",
  "title": "Trykktanker",
  "ref12845": "9.5, 20.3.5, 20.3.6, Tillegg H",
  "ref16925": "8.4",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 69,
  "scope": [
   "Plassering.",
   "Tilgjengelighet for inspeksjon.",
   "Vannvolum.",
   "Lufttrykk.",
   "Kontroll og sikkerhetsutstyr.",
   "Overvåking av kritisk væskenivå.",
   "Oppvarming/overvåking lav temperatur.",
   "Vedlikeholds intervall."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Trykktank er ikke plassert i «brannsikkert område».",
    "cats": [
     "middels",
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Trykktanken har < 5 % avvik i forhold til beregnet krav til vannvolum.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Trykktanken har fra 5 til 15 % avvik i forhold til beregnet krav til vannvolum.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Trykktanken har > 15 % avvik i forhold til beregnet krav til vannvolum.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Avvik i forhold til lufttrykk.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Feil på kontroll og sikkerhetsutstyr.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Manglende sikring mot frost.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Manglende eller feil på alarmfunksjoner.",
    "cats": [
     "stor"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 15 < Stor≤30",
  "comment": "For avvik hvor det er flere vurderingsmuligheter må det vurderes ut fra hvilken konsekvens avviket vil kunne ha for anleggets funksjon."
 },
 {
  "code": "6-1",
  "pos": "06",
  "title": "Pumperommet utforming og sikring.",
  "ref12845": "10.3",
  "ref16925": "9.2",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 70,
  "scope": [
   "Pumperommet er utformet som egen branncelle med brannmotstand på minst 60 minutter, og brukes kun til brannvern.",
   "Det er direkte tilkomst til pumperommet fra det fri.",
   "Pumperommet er sprinkler beskyttet.",
   "Pumperommet er frostsikret og ventilert."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Pumperommets utførelse tilfredsstiller ikke krav til brannskille og/eller tilkomst. F.eks. manglende brannskille eller manglende tilkomst fra det fri.",
    "cats": [
     "stor",
     "middels",
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Pumperommet er ikke sprinklet.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Pumperommet er ikke sikret mot frost.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Manglende ventilasjon i pumperom med dieselpumpe.",
    "cats": [
     "stor"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 15 < Stor≤30",
  "comment": "For avvik hvor det er flere vurderingsmuligheter må det vurderes ut fra hvilken konsekvens avviket vil kunne ha for anleggets funksjon."
 },
 {
  "code": "6-2",
  "pos": "06",
  "title": "Sprinklerpumpens utførelse og kapasitet",
  "ref12845": "10.5, 10.6, 10.7, 10.8, 10.9",
  "ref16925": "9",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 71,
  "scope": [
   "Omfang/montasje av stenge- og tilbakeslagsventil.",
   "Omfang/montasje av lufting og kjøling.",
   "To pressostater per pumpe med testmulighet og finjustert.",
   "Rett utførelse av strøm til elektropumpe.",
   "Rett utførelse av startautomatikk.",
   "Sugehøyde og dimensjon sugeledning.",
   "Nødvendig drivstoff.",
   "Trykkøkningspumpe montert med bypass.",
   "Nødvendig verktøy.",
   "Navneplate/merkeskilt montert på sprinklerpumpen skal minimum ha følgende informasjon.",
   "o Produsent o Serienummer o Modell o Vannmengde i liter/min eller USgpm o Utløpstrykk i bar/psi o Turtall o Største effektbehov",
   "Navneplate/merkeskilt montert på dieselmotor skal minimum ha følgende informasjon.",
   "o Produsent o Serienummer o Modell o Turtall o Effekt",
   "Navneplate/merkeskilt montert på elektromotor skal minimum ha følgende informasjon.",
   "o Produsent o Serienummer o Turtall o Effekt o Spenning"
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Stenge-og tilbakeslagsventiler er ikke montert i henhold til krav.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Lufting og kjøling av pumper er mangelfull.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Ikke mulig å teste start pressostater separat.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Strømforsyning til el. pumpe er ikke utført med brannsikker kabel.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Strømforsyning til el. pumpe er ikke hentet fra egen kurs i hovedtavlen.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Startautomatikk med alarmer er ikke utført i henhold til krav.",
    "cats": [
     "stor",
     "middels",
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Krevd drivstoffmengde for dieselpumpe er ikke til stede.",
    "cats": [
     "stor",
     "middels",
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Sugehøyde og/eller dimensjon sugeledning er ikke i henhold til krav.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Trykkøkningspumpe montert uten bypass.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Nødvendig verktøy er ikke tilgjengelig.",
    "cats": [
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Avvik merkeskilt",
    "cats": [
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Betongfundamenter ikkeutført i henhold til produsentens krav.",
    "cats": [
     "middels",
     "liten"
    ]
   },
   {
    "text": "Pumpesett uten typegodkjenning",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Produsentens pumpekurvesamsvare ikke med produsentens pumpekurve med informasjon på navneplate/merkeskilt.",
    "cats": [
     "stor",
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 15 < Stor≤40",
  "comment": "For avvik hvor det er flere vurderingsmuligheter må det vurderes ut fra hvilken konsekvens avviket vil kunne ha for anleggets funksjon."
 },
 {
  "code": "6-3",
  "pos": "06",
  "title": "Alarmer, prøving og ettersyn",
  "ref12845": "10, 20.2, 20.3",
  "ref16925": "9.6.3",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 74,
  "scope": [
   "Påkrevde alarmfunksjoner er montert og prøvd.",
   "Påkrevd prøving og testing gjennomført.",
   "Nødvendig instruks for ettersyn levert."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Alarmer fungerer ikke.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Igangkjøring og testing er ikke utført i henhold til krav.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Ettersyn av pumpeinstallasjon er mangelfullt.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Vedlikehold av dieselpumper er ikke utført. F.eks. oljeskift, filterskifte, batterisjekk ol.",
    "cats": [
     "stor"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 15< Stor ≤ 30",
  "comment": "For avvik hvor det er flere vurderingsmuligheter må det vurderes ut fra hvilken konsekvens avviket vil kunne ha for anleggets funksjon."
 },
 {
  "code": "7-1",
  "pos": "07",
  "title": "Våtanlegg",
  "ref12845": "11.1, 11.5",
  "ref16925": "10.1",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 75,
  "scope": [
   "Krav til minimumstemperatur.",
   "Soner med frostbeskyttelse – frostvæske.",
   "Soner med frostbeskyttelse – varmekabler.",
   "Beskyttet areal per kontrollventilsett."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Våtanlegg (uten frostsikring) er benyttet i arealer hvor det er frostfare.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Glykolanlegg har feil utførelse. F.eks. i forhold til stengeventil, tilbakeslagsventil, manometer, dreneringsventil, testventil, instrukser og skilting.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Glykolanlegg har flere sprinklere enn det som er tillatt.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Det er ikke benyttet giftfri frostvæske.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Frysepunkt til frostvæskeløsning er ikke tilstrekkelig i forhold til forventet minimumstemperatur.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Utførelse av varmekabler fraviker utførelse beskrevet i standard (11.1.2.3).",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Anleggets største beskyttede areal per kontrollventilsett er overskredet.",
    "cats": [
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 15< Stor ≤ 30",
  "comment": "Avvik knyttet til minimumstemperatur, type frostvæske og feil frysepunkt må utbedres og settes til stort trekk inntil forholdet er utbedret. Avhengig av omfang og konsekvens, kan det være aktuelt å øke trekk knyttet til overskridelse av areal per kontrollventilsett."
 },
 {
  "code": "7-2",
  "pos": "07",
  "title": "Tørranlegg",
  "ref12845": "11.2",
  "ref16925": "10.2",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 76,
  "scope": [
   "Rørvolum/vann til ugunstigste sprinkler innen 60 sekunder.",
   "Det er ikke benyttet gitter eller ringsystem.",
   "Rørnett – fall – drenspunkter – kuleventiler i frostutsatte områder.",
   "Luft eller Nitrogen tilførsel – korrekt struping – mengde og trykkregulering inn på anlegg."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "For stort rørvolum eller overskridelse av 60 sekunders regel.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Feil rørkonfigurasjon (gitter, ring).",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Manglende fall og drenspunkter.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Luft-eller nitrogen tilførsel er ikke korrekt utført.",
    "cats": [
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "Alvorlighetsgrad av overskridelse av rørvolum eller 60 sekunders må vurderes av kontrollør i forhold til omfang og konsekvens. I forbindelse med rutinekontroll skal tegn eller mistanke om sterk korrosjon føre til en rapportering til eier med anbefalinger om videre undersøkelser."
 },
 {
  "code": "7-3",
  "pos": "07",
  "title": "Pre-action anlegg",
  "ref12845": "11.1.3, 11.4, 11.4.2, NS3960",
  "ref16925": "10.3",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 77,
  "scope": [
   "Beskyttet areal pr. kontrollventilsett.",
   "Brannalarmanlegg iht. krav i NS3960 og NS 12845.",
   "Type Pre-action anlegg og funksjoner i henhold til systembeskrivelse, utførelse av eventuelt overvåket rørnett med etter fylling av luft eller nitrogen.",
   "Muligheter for prøving av funksjonalitet.",
   "Dreneringsmuligheter og fall på rørnett om anlegget er utsatt for frost.",
   "Brukerinstruks på norsk."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Anleggets største beskyttede areal per kontrollventilsett er overskredet.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Mangler knyttet til brannalarmanlegg. F.eks. funksjonalitet i forbindelse med aktivering, melding på panel, osv.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Mangler knyttet til prøving av funksjonalitet.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Manglende fall eller dreneringsmuligheter.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Mangler knyttet til instruks.",
    "cats": [
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 15< Stor ≤ 50",
  "comment": "Konsekvens av avvik knyttet til brannalarmanlegg må vurderes av kontrollør. Funksjonsfeil skal settes til stor alvorlighetsgrad. Dersom anlegget ofte er utsatt for feilutløsninger og i tillegg har lavpunkter som ikke lar seg drenere, skal anlegget sjekkes i forhold til tegn på korrosjon."
 },
 {
  "code": "7-4",
  "pos": "07",
  "title": "Endeanlegg",
  "ref12845": "11.5, Tillegg H, Tillegg I",
  "ref16925": "-",
  "applies16925": false,
  "first": true,
  "routine": true,
  "page": 78,
  "scope": [
   "Oppbygning.",
   "Omfang og størrelse.",
   "Overvåkning – alarmfunksjoner."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Avvik knyttet til endeanleggets omfang og størrelse",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Mangler knyttet til hydraulisk beregning ved bruk av delugeanlegg.",
    "cats": [
     "stor"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "Se også pos. 7-1, 7-2 og 7-3."
 },
 {
  "code": "7-5",
  "pos": "07",
  "title": "Soneinndeling",
  "ref12845": "Tillegg D, Tillegg H, Tillegg I",
  "ref16925": "Tillegg A",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 79,
  "scope": [
   "Inndeling og omfang.",
   "Høyeste fareklasse OH3.",
   "Anleggets kontrollventilsett.",
   "Ventilarrangement for hver sone med strømningsvakter, prøve funksjon og drenering.",
   "Overvåking, alarm og overføringer.",
   "Oversiktsplan."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Anleggets utførelse samsvarer ikke med retningslinjer og begrensninger som er satt ved bruk av soneinndeling.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Mangler knyttet til overvåking, testmuligheter eller overføring.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Mangler knyttet oversiktsplan.",
    "cats": [
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "7-6",
  "pos": "07",
  "title": "Personsikringsanlegg",
  "ref12845": "Tillegg F, Tillegg D",
  "ref16925": "-",
  "applies16925": false,
  "first": true,
  "routine": true,
  "page": 80,
  "scope": [
   "Oppbygning og soneinndeling.",
   "Anleggstype.",
   "Kontrollventilsett.",
   "Sprinklerkarakteristikk.",
   "Vannforsyning."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Anleggets utførelse samsvarer ikke med retningslinjer og begrensninger som er gjeldende for personsikringsanlegg. F.eks. knyttet til oppbygging, anleggstype, kontrollventilsett, soneinndeling, osv.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Feil karakteristikk på sprinklerhoder.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Vannforsyning er ikke en forbedret enkel forsyning.",
    "cats": [
     "stor"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "Anleggsformen er sjeldent brukt, men når benyttet vil det være en rekke forhold som må kontrolleres. Kontrolløren må sette seg inn i kravene og vurdere avvik ut ifra konsekvens. Avvikene gitt ovenfor er kun orienterende."
 },
 {
  "code": "8-1",
  "pos": "08",
  "title": "Typer og bruk",
  "ref12845": "14.2, 14.4, 14.5",
  "ref16925": "11",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 81,
  "scope": [
   "Type (spray, konvensjonell, bolig).",
   "Type i forhold til anleggets fareklasse.",
   "Bruksbegrensninger knyttet til type.",
   "K-faktor.",
   "Respons/RTI.",
   "Temperaturklasse/aktiveringstemperatur."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Sprinklerhoder ikke godkjent for bruk i aktuell fareklasse.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Feil respons på sprinklerhoder hvor spesielle krav er gjeldende. F.eks. hvor det er krav til kvikkrespons på reolsprinkler eller i personsikringsanlegg.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Sprinklerhoder med ulik respons i samme areal.",
    "cats": [
     "middels",
     "liten"
    ]
   },
   {
    "text": "Sprinklerhoder har feil temperaturklasse. F.eks. under glasstak o.l.",
    "cats": [
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "For avvik hvor det er flere vurderingsmuligheter skal konsekvens vurderes ut fra antall og omfang av avviket. For datablad hvor sprinklerhodets godkjenning er gitt med fareklasse i henhold til NFPA kan følgende retningslinjer normalt benyttes: LH (NFPA) = OH1, OH (NFPA) = OH2, 3 og 4, Storage (NFPA) = HH."
 },
 {
  "code": "8-2",
  "pos": "08",
  "title": "Funksjonalitet",
  "ref12845": "14.1, 14.6, 14.7, 14.8, 14.9, Datablad",
  "ref16925": "12",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 82,
  "scope": [
   "Tildekning (f.eks. overmaling).",
   "Valg av tilbehør (f.eks. rosetter, gitter).",
   "Vannskjerming.",
   "Korrosjonsbeskyttelse."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Sprinklerhoder er overmalt e.l.",
    "cats": [
     "middels",
     "liten"
    ]
   },
   {
    "text": "Sprinklerhode og rosett ikke godkjent for bruk sammen.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Lavereliggende sprinklerhode er ikke skjermet mot kjøling fra høyereliggende sprinklerhode.",
    "cats": [
     "middels",
     "liten"
    ]
   },
   {
    "text": "Manglende korrosjonsbeskyttelse av sprinklerhoder i aggressivt miljø.",
    "cats": [
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "For avvik hvor det er flere vurderingsmuligheter skal konsekvens vurderes ut fra antall og omfang av avviket."
 },
 {
  "code": "8-3",
  "pos": "08",
  "title": "Plassering, generelt",
  "ref12845": "12.1",
  "ref16925": "11",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 83,
  "scope": [
   "Retning.",
   "Leverandørens spesifikasjon/datablad.",
   "Klaring under sprinklerhode.",
   "Mekanisk skade."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Sprinklerhode er ikke montert med korrekt orientering.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Sprinklerhode er ikke montert med tilstrekkelig klaring (0,5 m) til lagring/hindring i fareklasse OH. Gjelder både standard og EC sprinkler.",
    "cats": [
     "middels",
     "liten"
    ]
   },
   {
    "text": "Sprinklerhode er ikke montert med tilstrekkelig klaring (1,0 m) til lagring/hindring i fareklasse HH. Gjelder både standard og EC sprinkler.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Sprinklerhode er har mekanisk skade e.l.",
    "cats": [
     "middels",
     "liten"
    ]
   },
   {
    "text": "Spesielle krav i sprinklerhodets datablad er ikke hensyntatt.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 7 | 10 < Stor ≤ 20",
  "comment": "For avvik hvor det er flere vurderingsmuligheter skal konsekvens vurderes ut fra antall og omfang av avviket."
 },
 {
  "code": "8-4",
  "pos": "08",
  "title": "Plassering, dekning og omfang (standard sprinkler)",
  "ref12845": "12.2, 12.3, 12.4",
  "ref16925": "11",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 84,
  "scope": [
   "Dekningsareal.",
   "Minimums- og maksimumsavstand.",
   "Avstand bygningskonstruksjoner.",
   "Hindringer.",
   "Plattformer/kanaler.",
   "Deflektorplassering/avstand i forhold til tak/himling.",
   "Lyssjakter eller tilsvarende volum.",
   "Sjakter.",
   "Åpninger i dekke.",
   "Himling/åpne himlinger."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Avstand til vegg fra standard geometri taksprinkler (spray) er mellom 2,0 til 2,3 m.",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Avstand til vegg fra standard geometri taksprinkler > 2,3 m.",
    "cats": [
     "middels",
     "liten"
    ]
   },
   {
    "text": "Overskredet avstand til vegger for veggsprinkler ≤ 10 %.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Overskredet avstand til vegger for veggsprinkler ˃ 10 %.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Maksimalt dekningsareal på sprinkler overskredet med ≤ 5 %.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Maksimalt dekningsareal på sprinkler overskredet med mellom 5 til 15 %.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Maksimalt dekningsareal på sprinkler overskredet med ˃ 15 %.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Overskridelse av avstand og areal > 15 %.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Sprinklere (spray) plassert med innbyrdes avstand mellom 1,8 til 2,0 m.",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Sprinklere plassert med innbyrdes avstand mellom < 1,8 m.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Avstand fra sprinklerens deflektor til tak/himling er mer enn 0,15 hvor dette er unødvendig.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Avstand fra sprinklerens deflektor til tak/himling er større enn tillatt maksavstand (0,3 m/0,45 m).",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Veggsprinkler er montert nærmere tak enn 0,1 m.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Sprinklere er ikke montert parallelt med takvinkel.",
    "cats": [
     "stor",
     "middels",
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Sprinklere er ikke montert stående i tørr-eller pre-action anlegg (bortsett fra hengende tørrsprinkler montert i henhold til datablad).",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Sprinkler er ikke riktig plassert i forhold til bygningskonstruksjoner (bjelker, søyler o.l.).",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Lyssjakter ikke sprinklet i henhold til krav.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Det er ikke montert sprinkler under hindringer som kanaler, plattformer, o.l.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Det er ikke montert fortetning av sprinklere rundt åpninger i dekker.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Det er ikke montert sprinklere i sjakter hvor dette kreves.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Ved åpne himlinger (70% lysåpning): Feil høyde mellom sprinkler og himling (≥ 0,8 m ved spraysprinkler) eller for stort dekningsareal per sprinkler (≤ 9 m2).",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Automatiske røyklukeri arealerder det benyttes ESFR eller CMSAog løsningen fravviker fra NS-EN 12845-2 (blir utgitt i 2025)",
    "cats": [
     "stor",
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "For avvik hvor det er flere vurderingsmuligheter skal konsekvens vurderes ut fra antall og omfang av avviket. Se 8-6 hvis det er benyttet spesial sprinklere som EC, ESFR, Attic o.l."
 },
 {
  "code": "8-5",
  "pos": "08",
  "title": "Plassering, mellomnivåsprinklere",
  "ref12845": "12.5, 14.7",
  "ref16925": "-",
  "applies16925": false,
  "first": true,
  "routine": true,
  "page": 86,
  "scope": [
   "Generelle retningslinjer for plassering.",
   "Hensyn til elementer som kan forstyrre vannfordeling.",
   "Vannskjerm.",
   "Klaring deflektor og topp lagret gods.",
   "Vertikal og horisontal avstand.",
   "Sprinklerrekker på rette nivåer."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Det er ikke etablert 0,15 m klaring i lengdespalten.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Det er ikke 0,15 m klaring mellom topp lagring og sprinklerhode.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Sprinklerhode er skadet.",
    "cats": [
     "stor",
     "liten"
    ]
   },
   {
    "text": "Sprinklerhoder er ikke skjermet mot kjøling fra høyereliggende sprinklerhode.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Feil plassering av sprinkler i nivået.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Ikke sprinklet i henhold til retningslinjer for aktuell varekategori.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Krav til maksavstander og areal (produkt av horisontal og vertikal avstand) er ikke overholdt.",
    "cats": [
     "stor"
    ]
   }
  ],
  "trekk": "0 < Liten ≤ 5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "8-6",
  "pos": "08",
  "title": "Plassering, spesielle sprinklere",
  "ref12845": "Tillegg N og P, NFPA 13, Datablad",
  "ref16925": "-",
  "applies16925": false,
  "first": true,
  "routine": true,
  "page": 87,
  "scope": [
   "EC.",
   "CMSA.",
   "ESFR.",
   "Andre spesialsprinklere (eks. Attic, vindu).",
   "Type sprinklerhoder brukt i ulike arealer inklusive bolig, dekningsområder i henhold til datablad og hydrauliske beregninger."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "EC: for liten innbyrdes avstand mellom sprinklerhoder.",
    "cats": [
     "middels",
     "liten"
    ]
   },
   {
    "text": "EC: for stor innbyrdes avstand mellom sprinklerhoder.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "EC: maksimalt dekningsareal per sprinklerhode er overskredet.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "EC: sprinklerhode har manglende dekning på grunn av hindringer.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "EC: veggsprinkler er montert med deflektor nærmere tak/himling enn 10 cm.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "EC: sprinklerhode er ikke montert vinkelrett i forhold til tak/himling.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Attic sprinkler: montasje er ikke i henhold til krav i datablad.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "CMSA og ESFR: krav til minimums-og maksimumsareal er ikke overholdt.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "CMSA og ESFR: krav til minimums-og maksimumsavstand mellom deflektor og tak/himling er ikke overholdt.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "CMSA og ESFR: krav til minimums-og maksimumsavstander mellom sprinklerhoder er ikke overholdt.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "CMSA og ESFR: krav til klaring mellom sprinklerhode og lagring er ikke overholdt.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "CMSA og ESFR: krav til avstand mellom sprinklerhode og hindringer er ikke overholdt.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "CMSA og ESFR: krav til undersprinkling er ikke overholdt.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "CMSA og ESFR: krav til maksimal takhøyde, lagringshøyde og lagringsmetode er ikke overholdt i forhold til aktuell varekategori.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "CMSA: ikke valgt korrekt utløsningstemperatur på sprinkler.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Vindussprinkler: montasje er ikke i henhold til krav i datablad.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Spesielle krav til spesialsprinkler i datablad ikke overholdt.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 15 | 15< Stor ≤ 30",
  "comment": "For avvik hvor det er flere vurderingsmuligheter skal konsekvens vurderes ut fra antall og omfang av avviket."
 },
 {
  "code": "8-7",
  "pos": "08",
  "title": "Inspeksjon av sprinklere (25 år)",
  "ref12845": "Tillegg K",
  "ref16925": "Tillegg E",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 89,
  "scope": [
   "Gjennomspyling",
   "Sprinklere",
   "Trykkprøving",
   "Kontroll av sprinklerrør"
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Ikke utført 25-års kontroll i henhold til vedlegg K.",
    "cats": [
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "9-1",
  "pos": "09",
  "title": "Kontrollventilsett",
  "ref12845": "15.1, Tillegg H, Tillegg I",
  "ref16925": "13.1",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 90,
  "scope": [
   "Oppbygning/komponenter.",
   "Stengeventil.",
   "Overvåkning."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Kontrollventilsettets oppbygning/komponenter er mangelfull.",
    "cats": [
     "stor",
     "middels",
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Hovedstengeventil har ikke indikator som viser om ventil er åpen/lukket.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Hovedstengeventil er ikke sikret i riktig stilling med rem og hengelås eller tilsvarende.",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Manglende overvåkning av stengeventil før pressostat ved bruk av doble pressostater.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Manglende overvåkning av hovedstengeventil.Gjelder anlegg som er montert fra og med 2016.",
    "cats": [
     "middels",
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "Mangler knyttet til service eller vedlikehold vurderes under øvrige kontrollpunkter. Manglende overvåking av hoved stengeventil kan vurderes som merknad hvis anlegget er prosjektering før NS-EN 12845:2015."
 },
 {
  "code": "9-2",
  "pos": "09",
  "title": "Stengeventiler nedstrøms kontrollventilsett",
  "ref12845": "15.2, Tillegg D, Tillegg H, Tillegg I, FG krav",
  "ref16925": "13.2",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 91,
  "scope": [
   "Soner.",
   "Serviceventil.",
   "Endeanlegg."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Stengeventil er ikke overvåket.",
    "cats": [
     "stor",
     "middels"
    ]
   },
   {
    "text": "Stengeventil har ikke indikator som viser om ventil er åpen/lukket.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Stengeventil er ikke sikret i riktig stilling med rem og hengelås eller tilsvarende.",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Manglende overvåkning av stengeventil i forbindelse med endeanlegg eller soner.",
    "cats": [
     "stor",
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "9-3",
  "pos": "09",
  "title": "Ventiler i ringledning",
  "ref12845": "15.3",
  "ref16925": "-",
  "applies16925": false,
  "first": true,
  "routine": true,
  "page": 92,
  "scope": [
   "Hvor sprinklersystemet forsynes via ringledning fra hovedledningsnettet, skal det installeres stengeventiler for å dele ringledningen inn i seksjoner slik at ingen seksjon omfatter mer enn fire kontrollventilsett."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende eller mangelfull inndeling av ringledning.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "Gjelder vannforsyning,for eksempel plassert i en kulvert."
 },
 {
  "code": "9-4",
  "pos": "09",
  "title": "Dreneringsventiler",
  "ref12845": "15.4",
  "ref16925": "13.3",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 93,
  "scope": [
   "Omfang.",
   "Tilkomst og plassering."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende dreneringsventiler i våtanlegg/boliganlegg",
    "cats": [
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Manglende dreneringsventiler i tørranlegg, alternerende og pre- action anlegg.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Feil dimensjon på dreneringsventil.",
    "cats": [
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Dårlig tilkomst til dreneringsventiler.",
    "cats": [
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Manglende mulighet for bortføring av vann ved drenering.",
    "cats": [
     "liten",
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "9-5",
  "pos": "09",
  "title": "Prøvingsventiler",
  "ref12845": "15.5",
  "ref16925": "13.4",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 94,
  "scope": [
   "Omfang.",
   "Tilkomst og plassering.",
   "Dimensjon."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Mangler prøveventil for prøving av strømningsvakter i forbindelse med sonearrangement eller tilsvarende.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Mangler prøveventil i tilknytning til pumpeinstallasjoner.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Fjerntliggende prøveventil (tørranlegg, alternerende og pre-action) mangler eller er feil plassert.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Manglende mulighet for bortføring av prøvevann.",
    "cats": [
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Dimensjon på prøveventil er feil.",
    "cats": [
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "9-6",
  "pos": "09",
  "title": "Tilkobling for spyling",
  "ref12845": "15.6",
  "ref16925": "13.2",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 95,
  "scope": [
   "Omfang.",
   "Tilkomst og plassering.",
   "Dimensjon."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Tilkoblinger for spyling mangler.",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Feil dimensjon på tilkobling for spyling.",
    "cats": [
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "9-7",
  "pos": "09",
  "title": "Manometer",
  "ref12845": "15.7",
  "ref16925": "13.5",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 96,
  "scope": [
   "Omfang og plassering.",
   "Skala og måleenhet.",
   "Mulighet for demontering uten å stenge ned anlegg."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manometer mangler eller er defekt.",
    "cats": [
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Manometer har feil skala eller måleenhet.",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Manometer kan ikke demonteres uten å stenge ned anlegget.",
    "cats": [
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "10-1",
  "pos": "10",
  "title": "Alarmutstyr kontrollventilsett, aktivert sprinkler",
  "ref12845": "16.1, 16.2, FG krav",
  "ref16925": "14.2, Tillegg B",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 97,
  "scope": [
   "Løsning (doble pressostater eller en pressostat og en hydraulisk alarmklokke).",
   "Plassering og utførelse hydraulisk alarmklokke.",
   "Plassering, utførelse og testmulighet pressostat(er).",
   "«Sprinklerkontrollboks»: melding på brannpanel når signal er avstilt.",
   "Arrangement for prøving av strømningsvakter.",
   "Sprinkler og boligventiler med etablerte prøvemuligheter og avløp.",
   "Merking."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Utførelse av alarmfunksjoner er ikke i henhold til standard eller FG krav (se kommentar under).",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Mangler knyttet til prøvefunksjoner.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Avstilt «sprinkler-kontroll boks» indikeres ikke.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Alarmsonene er ikke tydelig merket.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Alarmutstyr mangler eller fungerer ikke.",
    "cats": [
     "stor"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "FG krav: Det tillates å fravike standardens krav til hydraulisk alarmklokke, ved at det installeres to uavhengige alarmpressostater. Disse skal kunne testes hver for seg, enten ved en overvåket stengeventil før hver pressostat eller med en elektronisk prøve funksjon i sprinkler «kontrollboksen». Det skal alltid være alarmoverføring til brannvesen eller annen bemannet vaktsentral hvor det benyttes løsning med to uavhengige alarmpressostater. «Sprinklerkontrollboks» for avstilling av alarm ved alarmprøving er ikke et krav, men den skal alltid anbefales installert. Dersom brannalarmsignalet avstilles i «kontrollboksen» skal det gjøres tiltak (f.eks. melding om feil på sprinkleranlegget i brannsentral) for å hindre at tilbake stilling ikke blir utført."
 },
 {
  "code": "10-2",
  "pos": "10",
  "title": "Alarmutstyr kontrollventilsett, lavt lufttrykk",
  "ref12845": "11.4.1.1. 16.2.3, Tillegg I",
  "ref16925": "Tillegg B, B.3.4",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 98,
  "scope": [
   "Alarm ved lavt lufttrykk/gasstrykk på Tørranlegg eller pre action-anlegg.",
   "Muligheter for prøving.",
   "Alarmoverføring."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende alarmfunksjon.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Ventilsettet og overvåkning av luftrykk er ikke tilfredsstillende utført.",
    "cats": [
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "10-3",
  "pos": "10",
  "title": "Alarmutstyr soner",
  "ref12845": "16.2, Tillegg D",
  "ref16925": "Tillegg A,A.2.3",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 99,
  "scope": [
   "Strømningsvakt.",
   "Arrangement for prøving."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Feil montasje eller mangler ved prøvearrangement.",
    "cats": [
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 15 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "10-4",
  "pos": "10",
  "title": "Overvåkning og alarmoverføring",
  "ref12845": "16.3, 20.3.3.3, Tillegg H, Tillegg I, FG krav",
  "ref16925": "14, Tillegg B og C",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 100,
  "scope": [
   "Tilstrekkelig omfang.",
   "Funksjonalitet.",
   "Mulighet for prøving.",
   "Overføring av alarmsignal til bemannet alarmsentral.",
   "Alarm for lav temperatur."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Omfang av overvåking er ikke i henhold til tillegg H.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Overføring av alarmer er ikke i henhold til tillegg I.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Funksjonalitet på brytere og utstyr er ikke tilfredsstillende.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Funksjonalitet er ikke mulig å prøve.",
    "cats": [
     "middels"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "11-1",
  "pos": "11",
  "title": "Rørkvalitet, behandling og sikring",
  "ref12845": "17.1.2, 17.1.6, 17.1.7",
  "ref16925": "15",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 101,
  "scope": [
   "Godkjent rørsystem i henhold til standarden.",
   "Typegodkjent rørsystem utenfor standarden, installert i henhold til sertifikater og installasjonsbeskrivelse.",
   "Korrosjonsbeskyttelse.",
   "Brannbeskyttelse.",
   "Beskyttelse mot mekanisk skade.",
   "Frostsikring av rør i frostutsatte områder.",
   "Bruk av galvaniserte rør eller lettvekts rør skal rapporteres som en merknad dersom dette var tillatt ved installasjonstidspunktet."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Rør er ikke frostsikret.",
    "cats": [
     "middels",
     "liten",
     "merknad"
    ]
   },
   {
    "text": "Fravik i minste godstykkelse i forhold til rørdeler og bearbeidelse.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Typegodkjent rør er ikke installert i henhold til sertifikater og beskrivelse.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Manglende beskyttelse mot korrosjon, brann eller mekaniske skader.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Rør er ikke i henhold til standard og mangler en typegodkjennelse.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Manglende tiltak for å unngå hydrogengass der det er benyttet rør med innvendig galvanisering.",
    "cats": [
     "stor"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "I tilfeller hvor det benyttes andre rør typer, kvaliteter eller godstykkelser enn det som er beskrevet i standarden, gjelder ikke alle bestemmelser i standarden om utførelse, klamring osv. Rørene skal da ha en typegodkjenning og være listeført av FG. Rørsystemets sertifikater med installasjonskrav og veiledninger vil være gjeldende. Dette skal være dokumentert og beskrevet på et skandinavisk språk. Rørene skal være tydelig merket slik at de kan identifiseres. Punkt sprinkling av rørledningen kan aksepteres som brannbeskyttelse, men ikke i tilfeller hvor rørføringen ligger i et særlig utsatt område brannteknisk sett eller i forhold til anleggets sårbarhet."
 },
 {
  "code": "11-2",
  "pos": "11",
  "title": "Rørdimensjoner",
  "ref12845": "13.3, 13.4, 13.4.5",
  "ref16925": "6.4.2, 6.4.3",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 102,
  "scope": [
   "Forhåndskalkulerte systemer: Rørdimensjoner i henhold til tabell.",
   "Fullstendig beregnede systemer: Rørdimensjoner i henhold til hydraulisk beregning.",
   "Minste rørdiameter i henhold til fareklasse."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Feil på rørdimensjoner i forhold til beregning eller fareklasse.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 15< Stor ≤ 30",
  "comment": "Avvikets alvorlighetsgrad må vurderes opp mot omfang og konsekvens i forhold til beregningene. I kontrollrapport må det kreves nye beregninger ved mistanke om at dette har en konsekvens for anleggets PQ-krav."
 },
 {
  "code": "11-3",
  "pos": "11",
  "title": "Drenering og fall",
  "ref12845": "17.1.8",
  "ref16925": "10.2.1, 10.3.1,15.1.3",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 103,
  "scope": [
   "Dreneringsmulighet rørledninger.",
   "Grenrør tilkoblet på topp eller side av fordeler rør.",
   "Fall og drenering av tørr-, pre action og alternerende anlegg."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende dreneringsmuligheter.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Manglende fall og drenering i tørr-, pre-action-og alternerende anlegg.",
    "cats": [
     "stor"
    ]
   },
   {
    "text": "Feil tilkobling av grenrør til fordelerrør.",
    "cats": [
     "middels",
     "liten",
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "Avvik knyttet til manglende drenering vurderes i forhold til omfang og anleggstype. Se også kontrollpunkter under pos. 09."
 },
 {
  "code": "11-4",
  "pos": "11",
  "title": "Lufteventiler",
  "ref12845": "15.6",
  "ref16925": "-",
  "applies16925": false,
  "first": true,
  "routine": false,
  "page": 104,
  "scope": [
   "Plassering og omfang."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Feil knyttet til plassering og omfang.",
    "cats": [
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10< Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "11-5",
  "pos": "11",
  "title": "Fleksible slanger",
  "ref12845": "Datablad",
  "ref16925": "6.5",
  "applies16925": true,
  "first": true,
  "routine": false,
  "page": 105,
  "scope": [
   "Godkjenning - løsning og montasje i henhold til datablad.",
   "Tilkobling.",
   "Innfesting."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Avvik knyttet til typegodkjenning, utførelse og innfesting i henhold til datablad.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10< Stor ≤ 30",
  "comment": "Vurdering settes etter omfang og avvikets alvorlighetsgrad. Behov for utskifting skal vurderes av kontrollør, og hvor dette vurderes som nødvendig bør plassering beskrives nøyaktig i kontrollrapport, eventuelt kan slangen merkes."
 },
 {
  "code": "11-6",
  "pos": "11",
  "title": "Oppheng",
  "ref12845": "17.2",
  "ref16925": "15.2",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 106,
  "scope": [
   "Godkjent for bruk.",
   "Innfesting.",
   "Avstand og plassering.",
   "Dimensjonering.",
   "Benyttes rørnett for oppheng av andre formål."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Klammer/oppheng er i henhold til styrke og dimensjonskravene i standarden, eller mangler typegodkjenning.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Feil knyttet til innfesting av klammer/oppheng.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Feil knyttet til avstand mellom og plassering av klammer/oppheng.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   },
   {
    "text": "Rørnett benyttes for oppheng av andre formål.",
    "cats": [
     "stor",
     "middels",
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10< Stor ≤ 20",
  "comment": "Avvikets alvorlighetsgrad vurderes ut ifra omfang og konsekvens."
 },
 {
  "code": "11-7",
  "pos": "11",
  "title": "Innvendig rørkontroll",
  "ref12845": "Tillegg K",
  "ref16925": "18.5, Tillegg E",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 107,
  "scope": [
   "Se tillegg K."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Se kommentar under.",
    "cats": []
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10< Stor ≤ 20",
  "comment": "Dette er et punkt som er til utredning for vurdering av omfang. Kontrollør skal ikke ta stilling til dette punktet, med mindre det er tydelig hva som bør kommenteres eller kontrolleres."
 },
 {
  "code": "12-1",
  "pos": "12",
  "title": "Oversiktsplan",
  "ref12845": "18.1",
  "ref16925": "16.1",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 108,
  "scope": [
   "Tilstrekkelig informasjon.",
   "Plassering."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende, feil eller ufullstendig oversiktsplan.",
    "cats": [
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10< Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "12-2",
  "pos": "12",
  "title": "Skilt og anvisning",
  "ref12845": "18.2",
  "ref16925": "16.2",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 109,
  "scope": [
   "Skilting fra hovedangrepsvei brannvesen til sprinklersentral.",
   "Merking av hoved stengeventil.",
   "Merking av sekundærventiler tilførsel - drenering",
   "Merking av kontrollventilsett.",
   "Merking alarmprøvingsventiler.",
   "Merking av uttak for andre formål.",
   "Merking og tilstrekkelig informasjon ved pumper."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende merking av adkomst til avstengning og drenering.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Manglende merking av ventiler og funksjoner.",
    "cats": [
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": "Manglende merking av adkomst til stenge og dreneringsventiler skal i tillegg til avvik medføre en tydelig merknad til i eier i kontrollrapporten. I tilfeller hvor skilting er tydelig og formålstjenlig kan detaljkrav om utførelse i standarden fravikes uten kommentar."
 },
 {
  "code": "13-1",
  "pos": "13",
  "title": "Ettersyn",
  "ref12845": "20.1, 20.2, 20.3",
  "ref16925": "18.1, NA.18.1",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 110,
  "scope": [
   "Inngår i virksomhetens KS- eller HMS-program.",
   "Ansvarlig person.",
   "Omfang tilpasset anlegg/system.",
   "Journal ved kontrollventilsett hvor utført ettersyn er dokumentert."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Rutiner og instrukser for gjennomføring av ettersyn mangler.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Omfang av ettersyn er ikke tilpasset anlegget.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Ettersyn inngår ikke som en del av virksomhetens KS-/HMS- program. Mangelfull dokumentasjon på gjennomføring av ettersyn.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Ansvarlig personell for gjennomføring av ettersyn er ikke utnevnt.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Navn og kontakt til ansvarlig personell er ikke lett synlig i sprinklerrommet.",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Manglende dokumentasjon på opplæring av ansvarlig personell.",
    "cats": [
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "13-2",
  "pos": "13",
  "title": "Kontroll",
  "ref12845": "20.3, 21",
  "ref16925": "18.1, 18.4",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 111,
  "scope": [
   "Tidligere avvik utbedret."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Kontrollavtale med FG-sertifisert foretak er ikke etablert.",
    "cats": [
     "merknad"
    ]
   },
   {
    "text": "Avvik fra tidligere kontroller er ikke utbedret.",
    "cats": [
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "13-3",
  "pos": "13",
  "title": "Vedlikehold",
  "ref12845": "20.3",
  "ref16925": "18.1, NA.18.1",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 112,
  "scope": [
   "Vedlikeholds-/servicerapport.",
   "Tidligere avvik utbedret.",
   "At det er etablerte rutiner for egenkontroll, vedlikehold og kontroll"
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Manglende vedlikeholds-/serviceavtale.",
    "cats": [
     "middels"
    ]
   },
   {
    "text": "Manglende dokumentasjon av gjennomført vedlikehold/service.",
    "cats": [
     "liten"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 },
 {
  "code": "13-4",
  "pos": "13",
  "title": "Reservesprinklere og deler",
  "ref12845": "20.1.4, 20.3.2.9",
  "ref16925": "18.2",
  "applies16925": true,
  "first": true,
  "routine": true,
  "page": 113,
  "scope": [
   "Tilstrekkelig antall av hver type.",
   "Sprinklernøkkel.",
   "Oppbevaring."
  ],
  "bolig": [],
  "avvik": [
   {
    "text": "Ikke tilstrekkelig antall reservesprinklere og tilhørende sprinklernøkler.",
    "cats": [
     "liten"
    ]
   },
   {
    "text": "Mangelfull oppbevaring av reservesprinklere.",
    "cats": [
     "merknad"
    ]
   }
  ],
  "trekk": "0 < Liten≤5 | 5 < Middels ≤ 10 | 10 < Stor ≤ 20",
  "comment": ""
 }
];
