import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { IRawPatchData } from '~/data/types';

export abstract class BaseScriptParser {
  protected script: string;

  constructor() {
    this.script = readFileSync(
      resolve(
        process.cwd(),
        'dataMap',
        globalThis.mapVersion ?? 'w3c',
        'war3map.j'
      ),
      {
        encoding: 'utf8',
      }
    ).replace(/(\r\n)|\r/g, '\n');
  }

  abstract getPatchData(): IRawPatchData;

  abstract getBonusUnit(bonusID: string): string | undefined;

  abstract getHeroItems(heroID: string): Record<string, string> | undefined;

  protected getIfBlockByIndex(cursorPosition: number) {
    const isIf = this.script.startsWith('if', cursorPosition);
    const isElseif = this.script.startsWith('elseif', cursorPosition);

    if (!isIf && !isElseif) {
      throw new Error('Start position not ar if/elseif block');
    }

    let depth = 0;
    let i = cursorPosition + (isIf ? 2 : isElseif ? 6 : 4);

    while (i < this.script.length) {
      if (this.script.startsWith('if', i)) {
        depth++;
        i += 2;
      } else if (this.script.startsWith('else', i)) {
        if (depth === 0) {
          return this.script.slice(cursorPosition, i);
        }
        i += this.script.startsWith('elseif', i) ? 6 : 4;
      } else if (this.script.startsWith('endif', i)) {
        if (depth === 0) {
          return this.script.slice(cursorPosition, i + 5);
        }
        depth--;
        i += 5;
      } else if (this.script.startsWith('endfunction', i)) {
        return this.script.slice(cursorPosition, i);
      } else {
        i++;
      }
    }

    return this.script.slice(cursorPosition);
  }
}
