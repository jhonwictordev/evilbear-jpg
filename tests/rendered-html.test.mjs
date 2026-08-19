import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", process.pid + "-" + Date.now());
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the EVILBEAR.JPG portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /EVILBEAR\.JPG/i);
  assert.match(html, /Creating sounds/);
  assert.match(html, /Selected/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
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
  assert.match(page, /aria-label="Navegação principal"/);
  assert.match(page, /useReducedMotion/);
  assert.match(layout, /EVILBEAR\.JPG — Sound, Visual & Identity/);
  assert.match(layout, /og\.jpg/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /Pirata\+One/);
  assert.doesNotMatch(css, /UnifrakturCook/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("public/site-image.webp", root));
  await access(new URL("public/og.jpg", root));
  await assert.rejects(access(new URL("app/_sites-preview/SkeletonPreview.tsx", root)));
});
