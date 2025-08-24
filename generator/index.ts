import './versionSelect';

const ScriptParser = await (async () => {
  if (mapVersion === 'oz')
    return import('./ozScript').then(({ OZScriptParser }) => OZScriptParser);
  return import('./script').then(
    ({ Sur5alScriptParser }) => Sur5alScriptParser
  );
})();

import('./parser').then(({ SurvivalChaosParser }) => {
  const scriptParser = new ScriptParser();
  const parser = new SurvivalChaosParser(scriptParser, mapVersion === 'oz');
  parser.generate();
});
