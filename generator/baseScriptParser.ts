import { readFileSync } from 'fs';
import { resolve } from 'path';
import type {
  IRaceData,
  IRawBalanceData,
  IRawPatchData,
  IUnitObject,
} from '~/data/types';
import { unitsParser } from './objects';
import mapValues from 'lodash/mapValues';

export abstract class BaseScriptParser {
  protected script: string;

  constructor() {
    this.script = readFileSync(
      resolve(
        process.cwd(),
        'dataMap',
        globalThis.mapVersion ?? 'og',
        'war3map.j'
      ),
      {
        encoding: 'utf8',
      }
    ).replace(/(\r\n)|\r/g, '\n');
  }

  abstract getPatchData(): IRawPatchData;

  abstract getBonusUnit(bonusID: string): string | undefined;
  abstract enrichUnitRequires(item: IUnitObject): IUnitObject;
  abstract getHeroItems(heroID: string): Record<string, string> | undefined;

  protected getBuildAllLevels(unitID: string) {
    const output = [unitID];

    let [prev] = unitsParser.findIDByKey('upt', unitID);
    while (!!prev) {
      output.unshift(prev);
      [prev] = unitsParser.findIDByKey('upt', prev);
    }

    let next = unitsParser.getById(unitID)?.getValueByKey('upt');
    while (!!next) {
      output.push(next);
      next = unitsParser.getById(next)?.getValueByKey('upt');
    }

    return output;
  }

  protected getIfBlockByIndex(
    cursorPosition: number,
    text = this.script,
    startDepth = 0
  ) {
    const isIf = text.startsWith('if', cursorPosition);
    const isElseif = text.startsWith('elseif', cursorPosition);

    if (!isIf && !isElseif) {
      throw new Error('Start position not ar if/elseif block');
    }

    let depth = startDepth;
    let i = cursorPosition + (isIf ? 2 : isElseif ? 6 : 4);

    while (i < text.length) {
      if (text.startsWith('if', i)) {
        depth++;
        i += 2;
      } else if (text.startsWith('else', i)) {
        if (depth <= 0) {
          return text.slice(cursorPosition, i);
        }
        i += text.startsWith('elseif', i) ? 6 : 4;
      } else if (text.startsWith('endif', i)) {
        if (depth <= 0) {
          return text.slice(cursorPosition, i + 5);
        }
        depth--;
        i += 5;
      } else if (text.startsWith('endfunction', i)) {
        return text.slice(cursorPosition, i);
      } else {
        i++;
      }
    }

    return text.slice(cursorPosition);
  }

  protected getBalanceData() {
    const ballanceFile = readFileSync(
      resolve(
        process.cwd(),
        'dataMap',
        globalThis.mapVersion ?? 'og',
        'war3mapMisc.txt'
      ),
      {
        encoding: 'utf8',
      }
    );

    const rawData = Object.fromEntries(
      ballanceFile
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => !s.startsWith('['))
        .map((s) => s.split('=').map((s) => s.trim()))
    );

    const output: IRawBalanceData = {
      StrAttackBonus: 0,
      AgiDefenseBase: 0,
      AgiDefenseBonus: 0,
      StrHitPointBonus: 0,
      AgiAttackSpeedBonus: 0,
      StrRegenBonus: 0,
      IntRegenBonus: 0,
      IntManaBonus: 0,
    };

    return mapValues(output, (_, key) => {
      const value = Number(rawData[key]);
      return isNaN(value) ? 0 : value;
    });
  }
}
