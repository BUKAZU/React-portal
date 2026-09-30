/**
 * Assembles the S3 deploy tree for the website bundle.
 *
 * Embedder sites load the portal as a bare `<script src=".../static/main.js">`
 * tag, so the bucket layout is fixed and unhashed:
 *
 *   <out>/static/main.js     build/portal.website.js
 *   <out>/static/main.css    build/portal.website.css
 *   <out>/*.html             preview pages (deploy/*.html): an index linking to
 *                            one page per portal type (search, calendar, reviews)
 *
 * Usage: node ./scripts/assemble-deploy.mjs [--source <dir>] [--out <dir>]
 *   --source  directory holding portal.website.js/.css (default: build)
 *   --out     directory to write the deploy tree to     (default: dist-deploy)
 */
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
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
const previews = resolve(root, 'deploy');

async function sizeOf(path) {
  try {
    return (await stat(path)).size;
  } catch {
    return 0;
  }
}

async function previewPages() {
  try {
    return (await readdir(previews)).filter((name) => name.endsWith('.html'));
  } catch {
    return [];
  }
}

const failures = [];

const pages = (await previewPages()).sort();
if (!pages.includes('index.html')) {
  failures.push(`${resolve(previews, 'index.html')} is missing`);
}

const files = [
  {
    from: resolve(source, 'portal.website.js'),
    to: resolve(out, 'static/main.js')
  },
  {
    from: resolve(source, 'portal.website.css'),
    to: resolve(out, 'static/main.css')
  },
  ...pages.map((name) => ({
    from: resolve(previews, name),
    to: resolve(out, name)
  }))
];
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
