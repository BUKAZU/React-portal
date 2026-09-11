#!/usr/bin/env node
// Re-encodes every src/locales/<lang>.json as <lang>.msgpack, which is what the
// bundle loads at runtime (see src/intl.ts). Run after editing a locale JSON.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { encode } from '@msgpack/msgpack';

const dir = join(process.cwd(), 'src', 'locales');
const files = readdirSync(dir).filter((name) => name.endsWith('.json'));

for (const file of files) {
  const inputPath = join(dir, file);
  const outputPath = inputPath.replace(/\.json$/u, '.msgpack');
  const messages = JSON.parse(readFileSync(inputPath, 'utf8'));
  writeFileSync(outputPath, encode(messages));
  console.log(`packed ${file} -> ${outputPath.split('/').pop()}`);
}
