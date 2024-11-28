import { readFileSync } from 'fs';
import { resolve } from 'path';
import type {
  IRawArtifacts,
  IRawPatchData,
  IRawRace,
  IRawUltimates,
} from '~/data/types';
import { abilitiesParser, unitsParser } from './objects';
import { mapObject } from '~/utils/object';
import { isNotNil } from '~/utils/guards';

export class OZScriptParser {
  private script: string;
  private scriptVariables = {
    aura: 'w',
    heroes: ['r', 's', 't', 'i'],
    bonusPicker: 'E',
    description: 'g',
    magic: 'C',
    buildings: {
      fort: 'F',
      barrack: 'x',
      tower: 'W',
    },
    baseUpgrades: {
      melee: 'L',
      armor: 'V',
      range: 'X',
      wall: 'B',
    },
    units: {
      melee: 'Z',
      range: 'U',
      mage: 'I',
      siege: 'P',
      air: 'A',
      catapult: 'D',
    },
    towerUpgrades: ['N', 'M', 'ww', 'uw', 'rw', 'sw', 'tw', 'iw', 'Sw'],
  };

  constructor() {
    this.script = readFileSync(resolve(process.cwd(), 'dataMap', 'war3map.j'), {
      encoding: 'utf8',
    });
  }

  public getPatchData(): IRawPatchData {
    const pickers = this.getPickers();

    return {
      pickers,
      races: Object.values(pickers).flat().map(this.getRace.bind(this)),
      shrines: this.getShrines(),
      ultimates: this.getUltimates(),
      artifacts: this.getArtifacts(),
    };
  }

  private getRace(id: string): IRawRace {
    const raceInitBlock = this.script.match(
      new RegExp(
        String.raw`call .+\(.+,${this.strToInt(
          id
        )}.+\n(?:^.+$\n){3,7}call setplayername.+$(?:[\s\S]*?)(?:endloop)`,
        'mi'
      )
    )?.[0];

    if (!raceInitBlock) this.getError(`get race block ${id}`);

    const raceVariables = Array.from(
      raceInitBlock.matchAll(
        /set (?<varName>\w+)(?:\[.+\])?\s?=\s?(?<varValue>.*)$/gim
      )
    ).reduce((acc, { groups }) => {
      if (!groups) return acc;
      const { varName, varValue } = groups;
      acc[varName] = this.intToStr(varValue);
      return acc;
    }, {} as Record<string, string>);

    const key = String(
      raceInitBlock.match(/(?<=call SetPlayerName\(.+,")(?:\w|\s)+/)?.[0] ?? ''
    )
      .toLocaleLowerCase()
      .replace(/[^\w\-]/g, '_');

    const [t1spell, t2spell] =
      unitsParser
        .getById(raceVariables[this.scriptVariables.buildings.fort])
        ?.withInstance((data) => {
          const skills = String(data.getValueByKey('abi')).split(',');
          return skills
            .filter(
              (id) =>
                ![
                  raceVariables[this.scriptVariables.aura],
                  raceVariables[this.scriptVariables.description],
                ].includes(id)
            )
            .filter((id) => Boolean(abilitiesParser.getById(id)));
        }) ?? [];

    const raceData = {
      id,
      name: String(abilitiesParser.getById(id)?.getValueByKey('tp1')).replace(
        /^.*?-\s+/,
        ''
      ),
      key,
      auras:
        abilitiesParser
          .getById(raceVariables[this.scriptVariables.aura])
          ?.withInstance((instance) =>
            String(instance.getValueByKey('pb1') || this.getError('get aura'))
              .split(',')
              .map((a) => a.trim())
          ) || this.getError('get aura'),
      units: mapObject(this.scriptVariables.units, (key) => raceVariables[key]),
      magic: raceVariables[this.scriptVariables.magic],
      buildings: mapObject(
        this.scriptVariables.buildings,
        (key) => raceVariables[key]
      ),
      baseUpgrades: mapObject(
        this.scriptVariables.baseUpgrades,
        (key) => raceVariables[key]
      ),
      upgrades: this.scriptVariables.towerUpgrades.map(
        (key) => raceVariables[key]
      ),
      heroes: this.scriptVariables.heroes.map((key) =>
        [raceVariables[key]].filter(isNotNil)
      ),
      bonuses:
        unitsParser
          .getById(raceVariables[this.scriptVariables.bonusPicker])
          ?.withInstance((instance) =>
            String(instance.getValueByKey('upt') || this.getError('bonus'))
              .split(',')
              .map((a) => a.trim())
          ) ?? this.getError('getting bonuses'),
      bonusUpgrades: {},
      t1spell,
      t2spell,
      towerAbilities:
        unitsParser
          .getById(raceVariables[this.scriptVariables.buildings.tower])
          ?.withInstance((instance) =>
            String(instance.getValueByKey('abi') || '')
              .split(',')
              .map((s) => s.trim())
              .filter((id) =>
                abilitiesParser.getById(id)?.withInstance((abiInstance) => {
                  return (
                    !!abiInstance.getValueByKey('art') &&
                    abiInstance.getValueByKey('ub1') !== 'Fuck You'
                  );
                })
              )
          ) ?? [],
    };

    return this.enrichRaceData(raceData);
  }

  private enrichRaceData(data: IRawRace) {
    const heroesPrepares = this.scriptVariables.heroes
      .map((i) => `(?:${i})`)
      .join('|');
    const setHeroRegex = new RegExp(
      String.raw`set (?<heroVar>${heroesPrepares})\[.{2,5}\]\s?=\s?(?<replaceHero>\d{5,})`,
      'g'
    );

    data.bonuses.forEach((bonusID) => {
      const intBonusId = this.strToInt(bonusID);

      const findSetBonusBlock = this.script.match(
        new RegExp(
          String.raw`(?:else)?if .{3,6}\s?==${intBonusId}(?!.*$\n^.+$\nendif)`,
          'mi'
        )
      );
      if (!findSetBonusBlock?.index) {
        this.getError(`no bonus block found for ${bonusID}`);
      }
      const codeBlock = this.getIfBlockByIndex(findSetBonusBlock.index, true);

      const heroesMatch = Array.from(codeBlock.matchAll(setHeroRegex) ?? []);
      heroesMatch.forEach(({ groups }) => {
        if (!groups) return;
        const { heroVar, replaceHero } = groups;
        if (!heroVar || !replaceHero) return;
        data.heroes[this.scriptVariables.heroes.indexOf(heroVar)].push(
          this.intToStr(replaceHero)
        );
      });

      const setUpgrades = Array.from(
        codeBlock.matchAll(
          /call SetPlayerTechResearched\(.{3,6},(?<research>\d+)(?:,(?<level>\d+))/gim
        )
      );
      setUpgrades.forEach(({ groups }) => {
        if (!groups) return;
        const { research, level = 0 } = groups;
        if (!research) return;
        if (!data.bonusUpgrades[bonusID]) {
          data.bonusUpgrades[bonusID] = [];
        }
        data.bonusUpgrades[bonusID].push([
          this.intToStr(research),
          Number(level),
        ]);
      });
    });

    return data;
  }

  private getPickers() {
    const codeBlock = this.script.match(
      /(?:call UnitAddAbility\(.+,\d+\)\n)+call ShowUnit\(.+,false\)/im
    )?.[0];

    if (!codeBlock) return this.getError('getting race pickers block');
    const pickers = Array.from(codeBlock.match(/\d+/gm) ?? []).map(
      this.intToStr
    );

    return pickers.reduce((acc, pickerId) => {
      acc[pickerId] =
        abilitiesParser.getById(pickerId)?.withInstance((instance) =>
          String(instance.getValueByKey('pb1') ?? '')
            .split(',')
            .map((a) => a.trim())
        ) ?? this.getError('process pickers');
      return acc;
    }, {} as Record<string, string[]>);
  }

  private getUltimates(): IRawUltimates {
    const codeBlock = this.script.match(
      /set (?<map>.{3,6})=.+\(.+\n(?:call .{3,6}\(\k<map>,\d+,\d+,.+\n){4,}/im
    )?.[0];
    if (!codeBlock) this.getError('getting ulti codeblock');

    const spells = Array.from(
      codeBlock.matchAll(/call .*?(?<picker>\d{5,}),\s?(?<spell>\d{5,})/gim)
    ).reduce((acc, { groups }) => {
      if (!groups) return acc;
      const { picker, spell } = groups;
      const additionalSpell = this.script.match(
        new RegExp(
          String.raw`(?<=if .{3,7}==${picker}.+$\n(?:^.+$\n){0,4}set (?<var>.{3,6})=)\d+(?=.*$\ncall UnitAddAbility\(.{3,6},\k<var>)`,
          'mi'
        )
      )?.[0];
      acc[this.intToStr(picker)] = [spell, additionalSpell]
        .filter(isNotNil)
        .map(this.intToStr);
      return acc;
    }, {} as Record<string, string[]>);

    return {
      spells,
      pickers: Object.keys(spells),
    };
  }

  private getShrines() {
    const codeBlock = this.script.match(
      /(?:call .+?\(.+?,(?:\d{6,},){7,}.*\)$\n){4}/im
    )?.[0];
    if (!codeBlock) return this.getError('getting shrine block');
    return Array.from(
      codeBlock.match(/\d{6,}/gm) ?? this.getError('getting shrine IDs')
    ).map(this.intToStr);
  }

  private getArtifacts(): IRawArtifacts {
    const combineMap = Array.from(
      this.script.matchAll(
        /if .{3,7} then\n(?=set .{3,6}=AddSpecialEffectTarget)/gim
      ) ?? []
    )
      .map(({ index }) => [index, this.getIfBlockByIndex(index)] as const)
      .reduce((acc, [index, codeBlock]) => {
        const match = Array.from(codeBlock.match(/UnitAddItemById/gi) ?? []);
        if (match.length === 0) return acc;
        const removeItems = Array.from(
          codeBlock.match(/(?<=call .{2,5}\(.+,\s?)\d{5,}/gi) ?? []
        );
        if (!removeItems.length) {
          this.getError(`no remove items found in block by index: ${index}`);
        }
        if (match.length > 1) {
          const { items, results } = codeBlock.split('\n').reduce(
            (blockAcc, line) => {
              return blockAcc;
            },
            { items: Array<string[]>(), results: Array<string>() }
          );
          // TODO: Work here
          return acc;
        }

        const addItem = codeBlock.match(
          /(?<=call UnitAddItemById\(.+,\s?)\d{5,}/
        )?.[0];
        if (!addItem)
          this.getError(`no add items found in block by index: ${index}`);

        acc[this.intToStr(addItem)] = removeItems.map(this.intToStr);

        return acc;
      }, {} as Record<string, string[]>);

    return {
      combineMap,
      list: Object.entries(combineMap)
        .flat(2)
        .filter((val, idx, arr) => arr.indexOf(val) === idx),
    };
  }

  private getError(reason?: string): never {
    throw new Error(`Error while ${reason ?? 'unknown reason'}`);
  }

  private intToStr(input: number | string) {
    let value = Number(input);
    let output = '';
    while (value > 8) {
      const char = value % 256;
      value = (value - char) / 256;
      output = String.fromCharCode(char) + output;
    }
    return output;
  }

  private getIfBlockByIndex(startPos: number, countElse = false) {
    if (startPos < 0) return '';
    const firstWord = this.script.slice(startPos, startPos + 6);
    const elseStarted = firstWord === 'elseif';

    let pos = startPos + (elseStarted ? 6 : 2);
    let codeBlock = 1;
    let depth = 0;
    let word = '';
    while (pos < this.script.length && codeBlock !== 0) {
      const char = this.script[pos++];
      if (char === ' ' || char === '\n') {
        if (word === 'if') {
          if (elseStarted) {
            depth += 1;
          } else {
            codeBlock += 1;
          }
        }
        if (word === 'endif') {
          if (elseStarted && depth) {
            depth -= 1;
            word = '';
            continue;
          } else {
            codeBlock -= 1;
          }
        }
        if (!depth && countElse && (word === 'elseif' || word === 'else')) {
          codeBlock -= 1;
        }
        if (word === 'endfunction') break;
        word = '';
      } else {
        word += char;
      }
    }
    return this.script.slice(startPos, pos);
  }

  private strToInt(string: string) {
    return Number(
      BigInt(string.charCodeAt(3)) |
        (BigInt(string.charCodeAt(2)) << 8n) |
        (BigInt(string.charCodeAt(1)) << 16n) |
        (BigInt(string.charCodeAt(0)) << 24n)
    );
  }
}
