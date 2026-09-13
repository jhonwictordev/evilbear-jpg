import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function loadServer() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", process.pid + "-" + Date.now());
  const { default: server } = await import(workerUrl.href);
  return server;
}

test("builds a runnable EVILBEAR.JPG server entry", async () => {
  const server = await loadServer();
  assert.equal(typeof server, "function");
});

test("keeps the finished portfolio metadata and accessibility features", async () => {
  const [page, layout, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /CustomCursor/);
  assert.match(page, /site-image\.webp/);
  assert.match(page, /youtube\.com\/@EVILBEARJPG/);
  assert.match(page, /instagram\.com\/evilbear\.jpg/);
  assert.match(page, /Capas & animações/);
  assert.match(page, /behance\.net\/gallery\/171434971\/Visualizer/);
  assert.match(page, /behance\.net\/gallery\/158804245\/Artist-cover/);
  assert.match(page, /LanguageSwitch/);
  assert.match(page, /id="beats"/);
  assert.match(page, /<BeatsCatalog language=\{language\} \/>/);
  assert.match(page, /CartShortcut/);
  assert.match(page, /aria-label="Navegação principal"/);
  assert.match(page, /useReducedMotion/);
  assert.match(layout, /EVILBEAR\.JPG — Som, Visual & Identidade/);
  assert.match(layout, /og\.jpg/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /Pirata\+One/);
  assert.match(css, /\.hero-art img \{ width: 100%; height: 100%; object-fit: contain; object-position: right center;/);
  assert.doesNotMatch(css, /UnifrakturCook/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("public/site-image.webp", root));
  await access(new URL("public/og.jpg", root));
  await assert.rejects(access(new URL("app/_sites-preview/SkeletonPreview.tsx", root)));
});

test("includes the protected Beat Store foundations", async () => {
  const [catalog, checkout, api, migration, manifest, previews] = await Promise.all([
    readFile(new URL("../lib/beat-catalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/beat-store/checkout-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../worker/beat-store-api.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0001_beat_store.sql", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readdir(new URL("../public/audio/previews/", import.meta.url)),
  ]);

  assert.match(catalog, /BLOCO 13/);
  assert.match(catalog, /REPLAY DA MADRUGADA/);
  assert.match(catalog, /\/audio\/previews\/bloco-13\.mp3/);
  assert.doesNotMatch(catalog, /musicalKey:\s*null/);
  assert.doesNotMatch(catalog, /bpm:\s*null/);
  assert.match(catalog, /WAV \+ STEMS/);
  assert.match(checkout, /\/api\/checkout/);
  assert.match(api, /MERCADO_PAGO_ACCESS_TOKEN/);
  assert.match(api, /validSignature/);
  assert.match(api, /payment_status = 'approved'/);
  assert.match(api, /download_count < dt\.max_downloads/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS orders/);
  assert.match(manifest, /"d1": "DB"/);
  assert.match(manifest, /"r2": "BEAT_FILES"/);
  assert.equal(previews.length, 10);
  assert.ok(previews.every((file) => file.endsWith(".mp3")));
});
