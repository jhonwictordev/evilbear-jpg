import { spawn } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const output = join(root, "work", "vercel-static");
const port = 4173;
const routes = ["/", "/beats", "/cart", "/checkout", "/checkout/success"];
const beatSlugs = [
  "bloco-13",
  "corte-seco",
  "eco-do-abismo",
  "fita-vermelha",
  "flash-vermelho",
  "midnight-estate",
  "neon-funeral",
  "profit-mode",
  "purple-static",
  "replay-da-madrugada",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(join(root, "dist", "client"), output, { recursive: true });

const server = process.platform === "win32"
  ? spawn("cmd.exe", ["/d", "/s", "/c", `npm run start -- --host 127.0.0.1 --port ${port}`], {
    cwd: root,
    env: { ...process.env, WRANGLER_LOG_PATH: ".wrangler/wrangler.log" },
    stdio: ["ignore", "ignore", "ignore"],
  })
  : spawn("npm", ["run", "start", "--", "--host", "127.0.0.1", "--port", String(port)], {
    cwd: root,
    env: { ...process.env, WRANGLER_LOG_PATH: ".wrangler/wrangler.log" },
    stdio: ["ignore", "ignore", "ignore"],
  });

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error("Static export server did not start.");
}

function targetFor(route) {
  if (route === "/") return join(output, "index.html");
  return join(output, route.slice(1), "index.html");
}

try {
  await waitForServer();
  for (const route of [...routes, ...beatSlugs.map((slug) => `/beats/${slug}`)]) {
    const response = await fetch(`http://127.0.0.1:${port}${route}`);
    if (!response.ok) throw new Error(`Failed to export ${route}: ${response.status}`);
    const target = targetFor(route);
    await mkdir(join(target, ".."), { recursive: true });
    await writeFile(target, await response.text(), "utf8");
  }
} finally {
  if (process.platform === "win32" && server.pid) {
    spawn("taskkill.exe", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore" });
  } else {
    server.kill();
  }
}
