import { SurvivalChaosParser } from './parser';
import { Sur5alScriptParser } from './script';

Sur5alScriptParser.create().then((script) => {
  const parser = new SurvivalChaosParser(script.getPatchData());
  parser.generate();
});
