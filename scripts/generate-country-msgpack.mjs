import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encode } from '@msgpack/msgpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countriesDir = path.resolve(__dirname, '../src/_lib/countries');

async function generateCountryMsgpackFiles() {
  const entries = await fs.readdir(countriesDir, { withFileTypes: true });
  const jsonFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith('.json')
  );

  await Promise.all(
    jsonFiles.map(async (file) => {
      const inputPath = path.join(countriesDir, file.name);
      const outputPath = inputPath.replace(/\.json$/u, '.msgpack');

      const json = await fs.readFile(inputPath, 'utf8');
      const countryData = JSON.parse(json);
      const packed = encode(countryData);

      await fs.writeFile(outputPath, Buffer.from(packed));
    })
  );
}

generateCountryMsgpackFiles().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
