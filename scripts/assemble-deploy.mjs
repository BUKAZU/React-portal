/**
 * Assembles the S3 deploy tree for the website bundle.
 *
 * Embedder sites load the portal as a bare `<script src=".../static/main.js">`
 * tag, so the bucket layout is fixed and unhashed:
 *
 *   <out>/index.html         test page (deploy/index.html)
 *   <out>/static/main.js     build/portal.website.js
 *   <out>/static/main.css    build/portal.website.css
 *
 * Usage: node ./scripts/assemble-deploy.mjs [--source <dir>] [--out <dir>]
 *   --source  directory holding portal.website.js/.css (default: build)
 *   --out     directory to write the deploy tree to     (default: dist-deploy)
 */
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const { values } = parseArgs({
  options: {
    source: { type: 'string', default: 'build' },
    out: { type: 'string', default: 'dist-deploy' }
  }
});

const source = resolve(root, values.source);
const out = resolve(root, values.out);

const files = [
  {
    from: resolve(source, 'portal.website.js'),
    to: resolve(out, 'static/main.js')
  },
  {
    from: resolve(source, 'portal.website.css'),
    to: resolve(out, 'static/main.css')
  },
  { from: resolve(root, 'deploy/index.html'), to: resolve(out, 'index.html') }
];

async function sizeOf(path) {
  try {
    return (await stat(path)).size;
  } catch {
    return 0;
  }
}

const failures = [];
for (const { from } of files) {
  if ((await sizeOf(from)) === 0) {
    failures.push(`${from} is missing or empty`);
  }
}

if (failures.length > 0) {
  console.error('deploy assembly failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error(
    '\nrun "npm run build" first, or point --source at a directory with the website bundle'
  );
  process.exit(1);
}

await mkdir(resolve(out, 'static'), { recursive: true });
for (const { from, to } of files) {
  await copyFile(from, to);
  console.log(`${from} -> ${to}`);
}

console.log(`\ndeploy tree ready in ${out}`);
