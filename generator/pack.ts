import { resolve } from 'path';
import { rename, readdir, mkdir, readFile, writeFile, rm } from 'fs/promises';
import { select, input } from '@inquirer/prompts';

const type = await select({
  message: 'Specify version do you pack',
  choices: [
    { value: 'w3c', name: 'Official Sur5al/W3C' },
    { value: 'oz', name: 'OZGame Edition' },
  ],
});

const version = await input({
  message: 'Version of packing map',
  transformer: (val) => val.trim(),
});
globalThis.mapVersion = version;

const inputDir = resolve(process.cwd(), 'dataGenerated');
const outputDir = resolve(process.cwd(), 'data', type);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir);

const files = await readdir(inputDir, {
  encoding: 'utf8',
  withFileTypes: true,
});

const promises = files
  .filter((dirent) => dirent.isFile() && dirent.name !== '.gitkeep')
  .map(async ({ name, parentPath }) => {
    await rename(resolve(parentPath, name), resolve(outputDir, name));
  });

await Promise.all(promises);

const indexFileTemplate = await readFile(
  resolve(process.cwd(), 'generator', 'index.ts.example'),
  { encoding: 'utf8' }
);
const indexFileContent = indexFileTemplate.replace('$$VERSION$$', version);
await writeFile(resolve(outputDir, 'index.ts'), indexFileContent, {
  encoding: 'utf8',
});
