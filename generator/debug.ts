import { ObjectsTranslator } from 'wc3maptranslator';
import { resolve } from 'path';
import { readFile, writeFile } from 'fs/promises';

const files = [
  ['war3map.w3q', 'upgrades'],
  ['war3map.w3a', 'abilities'],
  ['war3map.w3u', 'units'],
  ['war3map.w3t', 'items'],
];

files.forEach(async ([name, type]) => {
  const [, newFileName] = name.split('.');
  const w3Buffer = await readFile(resolve(process.cwd(), 'dataMap', name));
  const { json } = ObjectsTranslator.warToJson(type, w3Buffer);

  await writeFile(
    resolve(process.cwd(), 'generator', 'debug', `${newFileName}.json`),
    JSON.stringify(json, null, 4),
    { encoding: 'utf8' }
  );
  await writeFile(
    resolve(
      process.cwd(),
      'generator',
      'debug',
      `${newFileName}.formatted.json`
    ),
    JSON.stringify(restore(json), null, 4),
    { encoding: 'utf8' }
  );
});

function restore(data: any) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (!Array.isArray(value)) {
      acc[key] = restore(value);
      return acc;
    }

    const output = value.reduce((innerAcc, { id, value }) => {
      if (id in innerAcc) {
        innerAcc[id] = [...[innerAcc[id]].flat(), value];
      } else {
        innerAcc[id] = value;
      }
      return innerAcc;
    }, {} as any);

    acc[key] = output;

    return acc;
  }, {} as any);
}
