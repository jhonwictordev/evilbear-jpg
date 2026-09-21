import { build } from "esbuild";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const output = join(root, "work", "netlify-functions-bundle");
const functions = ["checkout", "mercadopago-webhook", "order-status"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const name of functions) {
  await build({
    bundle: true,
    format: "cjs",
    stdin: {
      contents: `import endpoint from ${JSON.stringify(join(root, "netlify", "functions", `${name}.mjs`))};
import { connectLambda } from "@netlify/blobs";

module.exports.handler = async function handler(event) {
  connectLambda(event);
  const headers = new Headers(event.headers || {});
  const rawUrl = event.rawUrl || \`https://\${headers.get("host") || "evilbear-jpg.netlify.app"}\${event.path || "/"}\`;
  const body = event.body
    ? (event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body)
    : undefined;
  const request = new Request(rawUrl, {
    method: event.httpMethod || "GET",
    headers,
    body: ["GET", "HEAD"].includes(event.httpMethod || "GET") ? undefined : body,
  });
  const response = await endpoint(request, {});
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  };
};`,
      loader: "js",
      resolveDir: root,
      sourcefile: `${name}.wrapper.cjs`,
    },
    outfile: join(output, `${name}.js`),
    platform: "node",
    sourcemap: false,
    target: "node22",
  });
}
