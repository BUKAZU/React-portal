import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encode } from '@msgpack/msgpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../src/_lib/countries');
const localesDir = path.resolve(__dirname, '../src/locales');

async function generateMsgpackFilesForDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const jsonFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('.json')
  );

  await Promise.all(
    jsonFiles.map(async (file) => {
      const inputPath = path.join(directory, file.name);
      const outputPath = inputPath.replace(/\.json$/u, '.msgpack');

      const json = await fs.readFile(inputPath, 'utf8');
      const countryData = JSON.parse(json);
      const packed = encode(countryData);

      await fs.writeFile(outputPath, Buffer.from(packed));
    })
  );
}

async function generateMsgpackFiles() {
  await generateMsgpackFilesForDirectory(countriesDir);
  await generateMsgpackFilesForDirectory(localesDir);
}

generateMsgpackFiles().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
