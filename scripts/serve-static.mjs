/**
 * Minimal static file server for the end-to-end tests.
 *
 * The website bundle has to be exercised the way an embedder loads it: a plain
 * `<script>` tag pointing at the built file. The Vite dev server would push it
 * through its transform pipeline instead, so the e2e run serves the repository
 * as-is from here.
 *
 * Usage: node ./scripts/serve-static.mjs [--port 4174]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const portArgIndex = process.argv.indexOf('--port');
const port =
  portArgIndex === -1
    ? 4174
    : Number.parseInt(process.argv[portArgIndex + 1], 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.msgpack': 'application/octet-stream'
};

// Fail loudly rather than letting Playwright wait on a server that can only
// serve 404s for the file under test.
const bundle = join(root, 'build/portal.website.js');
try {
  await stat(bundle);
} catch {
  console.error(
    `build/portal.website.js not found — run "npm run build:website" first`
  );
  process.exit(1);
}

createServer(async (request, response) => {
  const requestPath = new URL(request.url ?? '/', 'http://localhost').pathname;
  // `normalize` collapses any `..` segments before the join, so requests cannot
  // escape the repository root.
  const filePath = join(root, normalize(requestPath));

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      'content-type':
        MIME_TYPES[extname(filePath)] ?? 'application/octet-stream',
      'cache-control': 'no-store'
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(`not found: ${requestPath}`);
  }
}).listen(port, () => {
  console.log(`static server listening on http://localhost:${port}`);
});
