// Gjør web-eksporten (dist/) til en installerbar PWA for GitHub Pages:
// manifest, metadata for iPhone, tjenestearbeider for bruk uten nett og støtte for direkte lenker.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const app = JSON.parse(readFileSync('app.json', 'utf8')).expo;
const BASE = (app.experiments?.baseUrl ?? '').replace(/\/$/, '');
const DIST = 'dist';

const manifest = {
  name: 'Sprinklerkontroll',
  short_name: 'Sprinklerkontroll',
  description: 'Kontroll av sprinkleranlegg etter FG-920. Laget av Mads Fjærem.',
  lang: 'no',
  start_url: `${BASE}/`,
  scope: `${BASE}/`,
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#F2F4F6',
  theme_color: '#16202A',
  icons: [
    { src: `${BASE}/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: `${BASE}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: `${BASE}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
writeFileSync(join(DIST, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));

let html = readFileSync(join(DIST, 'index.html'), 'utf8');
const head = [
  `<link rel="manifest" href="${BASE}/manifest.webmanifest">`,
  `<link rel="apple-touch-icon" href="${BASE}/apple-touch-icon.png">`,
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black">',
  '<meta name="apple-mobile-web-app-title" content="Sprinklerkontroll">',
].join('\n');
html = html.replace(/<html lang="[^"]*"/, '<html lang="no"').replace('</head>', `${head}\n</head>`);
writeFileSync(join(DIST, 'index.html'), html);
// GitHub Pages viser 404.html for adresser den ikke kjenner, slik at direkte lenker til skjermer virker.
copyFileSync(join(DIST, 'index.html'), join(DIST, '404.html'));
writeFileSync(join(DIST, '.nojekyll'), '');

// Tjenestearbeider: lagrer appen for bruk uten nett, og leverer bilder og dokumenter fra nettleserens lagring.
const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
};
walk(DIST);
const precache = files
  .map((p) => `${BASE}/${relative(DIST, p).split('\\').join('/')}`)
  .filter((u) => !u.endsWith('/404.html') && !u.endsWith('/.nojekyll') && !u.endsWith('.map'));
const hash = createHash('sha256');
for (const p of files) hash.update(p).update(readFileSync(p));
const version = hash.digest('hex').slice(0, 12);

const sw = `// Laget automatisk av scripts/pwa.mjs. Versjon ${version}.
const BASE = ${JSON.stringify(BASE)};
const APP = 'sk-app-${version}';
const FILES = 'sk-files-v1';
const PRECACHE = ${JSON.stringify([`${BASE}/`, ...precache])};

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(APP).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('sk-app-') && k !== APP).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  if (url.pathname.startsWith(BASE + '/_files/')) {
    e.respondWith(caches.open(FILES).then((c) => c.match(e.request)).then((r) => r || new Response('Filen finnes ikke på denne enheten.', { status: 404 })));
    return;
  }
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match(BASE + '/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
`;
writeFileSync(join(DIST, 'sw.js'), sw);
console.log(`PWA klar: ${precache.length} filer i hurtigbuffer, versjon ${version}, base "${BASE}"`);
