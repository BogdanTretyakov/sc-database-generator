import { select } from '@inquirer/prompts';

const type = await select({
  message: 'Select version to parse',
  choices: [
    { value: 'w3c', name: 'Official Sur5al/W3C' },
    { value: 'oz', name: 'OZGame Edition' },
  ],
});

globalThis.mapVersion = type;

const ScriptParser = await (async () => {
  if (type === 'oz')
    return import('./ozScript').then(({ OZScriptParser }) => OZScriptParser);
  return import('./script').then(
    ({ Sur5alScriptParser }) => Sur5alScriptParser
  );
})();

import('./parser').then(({ SurvivalChaosParser }) => {
  const scriptParser = new ScriptParser();
  const parser = new SurvivalChaosParser(scriptParser, type === 'oz');
  parser.generate();
});
