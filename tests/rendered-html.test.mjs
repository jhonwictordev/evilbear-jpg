import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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
  assert.match(page, /aria-label="Navegação principal"/);
  assert.match(page, /useReducedMotion/);
  assert.match(layout, /EVILBEAR\.JPG — Som, Visual & Identidade/);
  assert.match(layout, /og\.jpg/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /Pirata\+One/);
  assert.doesNotMatch(css, /UnifrakturCook/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("public/site-image.webp", root));
  await access(new URL("public/og.jpg", root));
  await assert.rejects(access(new URL("app/_sites-preview/SkeletonPreview.tsx", root)));
});
