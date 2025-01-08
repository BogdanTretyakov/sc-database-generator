import { SurvivalChaosParser } from './parser';
import { Sur5alScriptParser } from './script';
import { OZScriptParser } from './ozScript';
import { select } from '@inquirer/prompts';

const type = await select({
  message: 'Select version to parse',
  choices: [
    { value: 'w3c', name: 'Official Sur5al/W3C' },
    { value: 'oz', name: 'OZGame Edition' },
  ],
});

switch (type) {
  case 'w3c': {
    const scriptParser = new Sur5alScriptParser();
    const parser = new SurvivalChaosParser(scriptParser.getPatchData());
    parser.generate();

    break;
  }
  case 'oz': {
    const scriptParser = new OZScriptParser();
    const parser = new SurvivalChaosParser(scriptParser.getPatchData(), true);
    parser.generate();
    break;
  }
}
