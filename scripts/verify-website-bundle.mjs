/**
 * Gate that stops a broken website bundle from being published.
 *
 * `portal.website.js` is consumed as a bare `<script>` tag by embedders who
 * have no build step, so a bundle that lost its inlined stylesheet — or its
 * Sentry DSN — is a silent production regression rather than a build failure.
 * This script asserts the properties that no unit test can see, because they
 * only exist after Vite has run.
 *
 * Usage: node ./scripts/verify-website-bundle.mjs
 */
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jsPath = resolve(root, 'build/portal.website.js');
const cssPath = resolve(root, 'build/portal.website.css');

const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

async function sizeOf(path) {
  try {
    return (await stat(path)).size;
  } catch {
    return 0;
  }
}

const jsSize = await sizeOf(jsPath);
const cssSize = await sizeOf(cssPath);

check(
  jsSize > 0,
  `build/portal.website.js is missing or empty — run "npm run build:website"`
);
check(cssSize > 0, 'build/portal.website.css is missing or empty');

if (jsSize > 0) {
  const js = await readFile(jsPath, 'utf8');
  const { version } = require('../package.json');

  check(
    js.includes('bukazu-portal-styles'),
    'the bundle does not inject its stylesheet (no "bukazu-portal-styles" marker)'
  );
  check(
    js.includes('#bukazu-app'),
    'the bundle does not contain the portal stylesheet (no "#bukazu-app" rules)'
  );
  // A `<script>` tag has no bundler behind it to define `process`, so any
  // surviving reference throws "process is not defined" and the portal never
  // mounts. Vite does not substitute these in library mode by default.
  check(
    !js.includes('process.env'),
    'the bundle still references process.env, which throws in a browser'
  );
  check(
    js.includes(`data-bukazu-version","${version}"`) ||
      js.includes(`data-bukazu-version",'${version}'`),
    `the injected style element is not stamped with version ${version}`
  );

  // The DSN is only baked in when the environment supplies one, so this is a
  // conditional check: locally an empty DSN is expected, in the publish
  // workflow an empty DSN means production lost its error reporting.
  if (process.env.BUKAZU_SENTRY_DSN) {
    check(
      js.includes(process.env.BUKAZU_SENTRY_DSN),
      'BUKAZU_SENTRY_DSN is set but the bundle does not contain it'
    );
  }
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
console.log(`portal.website.js  ${kb(jsSize)}`);
console.log(`portal.website.css ${kb(cssSize)}`);
console.log(
  process.env.BUKAZU_SENTRY_DSN
    ? 'Sentry DSN: baked in'
    : 'Sentry DSN: not set (BUKAZU_SENTRY_DSN unset)'
);

if (failures.length > 0) {
  console.error('\nwebsite bundle verification failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('\nwebsite bundle OK');
