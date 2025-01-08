import { readFileSync } from 'fs';
import { resolve } from 'path';
import type {
  IRawArtifacts,
  IRawBonusHero,
  IRawPatchData,
  IRawRace,
  IRawUltimates,
} from '~/data/types';
import { abilitiesParser, unitsParser } from './objects';
import { mapObject } from '~/utils/object';
import { isNotNil } from '~/utils/guards';
import { uniq } from '~/utils/array';
import { getError } from './utils';

export class OZScriptParser {
  private script: string;
  private pickers = [
    1346978609, 1346978610, 1346978611, 1346978612, 1346978613,
  ];
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
      ultimates: this.getUltimates(),
      artifacts: this.getArtifacts(),
      misc: {
        shrines: this.getShrines(),
        neutrals: this.getNeutrals(),
      },
    };
  }

  private getRace(id: string): IRawRace {
    const raceInitBlock = this.script.match(
      new RegExp(
        String.raw`call .+\(.+,${this.strToInt(
          id
        )}.+\n(?=call .+\n)(?:^.+$\n)+?(?:(?:elseif .{2,6}=\d{1,2})|(?:endfunction.+))`,
        'mi'
      )
    )?.[0];

    if (!raceInitBlock) getError(`get race block ${id}`);

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
      raceInitBlock.match(
        /(?<=set (?<var>.{2,6})\s?=\s?['"]).+(?=['"]$\ncall SetPlayerName\(.{2,6},\k<var>\))/im
      )?.[0] || getError(`race ${id} key`)
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
      name: String(abilitiesParser.getById(id)?.getName())
        .replace(/^.*?-\s+/, '')
        .replace(/\[.+\]/, '')
        .trim(),
      key,
      auras:
        abilitiesParser
          .getById(raceVariables[this.scriptVariables.aura])
          ?.withInstance((instance) =>
            String(instance.getValueByKey('pb1') || getError('get aura'))
              .split(',')
              .map((a) => a.trim())
          ) || getError('get aura'),
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
      heroes: this.scriptVariables.heroes.map((key) => raceVariables[key]),
      bonuses:
        unitsParser
          .getById(raceVariables[this.scriptVariables.bonusPicker])
          ?.withInstance((instance) =>
            String(instance.getValueByKey('upt') || getError('bonus'))
              .split(',')
              .map((a) => a.trim())
          ) ?? getError(`getting bonuses ${id}`),
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
      bonusHeroes: [],
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
        getError(`no bonus block found for ${bonusID}`);
      }
      const codeBlock = this.getIfBlockByIndex(findSetBonusBlock.index, true);

      const heroesMatch = Array.from(codeBlock.matchAll(setHeroRegex) ?? []);
      heroesMatch.forEach(({ groups }) => {
        if (!groups) return;
        const { heroVar, replaceHero } = groups;
        if (!heroVar || !replaceHero) return;

        const slot = this.scriptVariables.heroes.indexOf(heroVar);

        const output: IRawBonusHero = {
          id: this.intToStr(replaceHero),
          slot,
          items: {},
        };

        const replaceMatch = this.script.match(
          new RegExp(
            String.raw`(?:else)?if .{2,6}==${replaceHero} then(?=\n(?:^.+$\n){1,20}call UnitAddItem)`,
            'mi'
          )
        );
        if (replaceMatch && replaceMatch.index) {
          const replaceCodeBlock = this.getIfBlockByIndex(
            replaceMatch.index,
            true
          );
          Array.from(
            replaceCodeBlock.matchAll(
              /if .{2,6}\s?=(?<level>\d{1,2})\s.+\n(?:^.+$\n){0,20}?set (?<varName>.{2,6})\s?=\s?(?<value>\d+)\n(?:^.+$\n){0,6}?call UnitAddItemById\(.+,\k<varName>\)/gim
            )
          ).forEach(({ groups }) => {
            if (!groups) return;
            const { level, value } = groups;
            output.items[level] = this.intToStr(value);
          });
        }
        data.bonusHeroes.push(output);
      });

      const setUpgrades = Array.from(
        codeBlock.matchAll(
          /call SetPlayerTechResearched\(.{3,6},(?<research>\d+)(?:,(?<level>\d+))/gim
        )
      );

      const researches = (
        unitsParser.getById(bonusID)?.getArrayValue('res') ?? []
      )
        .filter(isNotNil)
        .map((id) => {
          const setUpgradeLevel = setUpgrades.find(
            ({ groups }) => groups?.research === String(this.strToInt(id))
          )?.groups?.level;
          return [id, Number(setUpgradeLevel ?? 0)] as [string, number];
        });

      if (researches.length > 0) {
        data.bonusUpgrades[bonusID] = researches;
      }
    });

    return data;
  }

  private getPickers() {
    return this.pickers.map(this.intToStr).reduce((acc, pickerId) => {
      acc[pickerId] =
        abilitiesParser.getById(pickerId)?.withInstance((instance) =>
          String(instance.getValueByKey('pb1') ?? '')
            .split(',')
            .map((a) => a.trim())
        ) ?? getError('process pickers');
      return acc;
    }, {} as Record<string, string[]>);
  }

  private getUltimates(): IRawUltimates {
    const codeBlock = this.script.match(
      /(?:call .{3,6}\(.{2,6},\d+,\d+,.+Ulti.+\n(?:set.+\n)?)+/im
    )?.[0];
    if (!codeBlock) getError('getting ulti codeblock');

    const spells = Array.from(
      codeBlock.matchAll(/call .*?(?<picker>\d{5,}),\s?(?<spell>\d{5,})/gim)
    ).reduce((acc, { groups }) => {
      if (!groups) return acc;
      const { picker, spell } = groups;

      const ultimateCodeBlock = this.getIfBlockByIndex(
        this.script.search(new RegExp(String.raw`if .{3,7}\s?=\s?${picker}`))
      );

      const spells = Array.from(
        ultimateCodeBlock?.match(/(?<=^set .{3,7}=)\d+/gm) ?? []
      ).filter(uniq);

      switch (spells.length) {
        case 1:
          acc[this.intToStr(picker)] = [spell, spells[0]].map(this.intToStr);
          break;
        case 2:
          acc[this.intToStr(picker)] = spells.map(this.intToStr);
          break;
        case 0:
        default:
          acc[this.intToStr(picker)] = [this.intToStr(spell)];
          break;
      }

      return acc;
    }, {} as Record<string, string[]>);

    return {
      spells,
      pickers: Object.keys(spells),
    };
  }

  private getShrines() {
    const codeBlock = this.script.match(
      /(?:call .{2,6}\(.+?,(?:\d{6,},)+.*Shrine.*\)$\n){3,}/im
    )?.[0];
    if (!codeBlock) return getError('getting shrine block');
    return Array.from(
      codeBlock.match(/\d{6,}/gm) ?? getError('getting shrine IDs')
    )
      .map(this.intToStr)
      .filter((item, idx, arr) => arr.indexOf(item) === idx);
  }

  private getArtifacts(): IRawArtifacts {
    const combineMap = {
      I034: [['I00E', 'I00F', 'I00G']],
      I70F: [['I00E', 'I00F', 'I00G', 'I034']],
      I03H: [['I00H', 'I00J']],
      I03E: [['I00H', 'I00I']],
      I03J: [['I00H', 'I00K']],
      I03G: [['I00J', 'I00I']],
      I03F: [['I00J', 'I00K']],
      I03I: [['I00K', 'I00I']],
      I03V: [['I03E', 'I03H']],
      I03R: [['I03H', 'I03J']],
      I03S: [['I03H', 'I03I']],
      I03Q: [['I03E', 'I03J']],
      I03T: [['I03E', 'I03I']],
      I03U: [['I03G', 'I03F']],
      I03O: [['I03G', 'I03I']],
      I03M: [['I03G', 'I03H']],
      I03Y: [['I03H', 'I03F']],
      I03K: [['I03G', 'I03E']],
      I03W: [['I03E', 'I03F']],
      I03L: [['I03G', 'I03J']],
      I03N: [['I03F', 'I03I']],
      I03P: [['I03F', 'I03J']],
      I70B: [['I034'], ['I03N'], ['I03U']],
      I70A: [['I034'], ['I03W'], ['I03Q']],
      I70C: [['I034'], ['I03T'], ['I03L']],
      I70E: [['I034'], ['I03Y'], ['I03R']],
      I70D: [['I034'], ['I03S'], ['I03K']],
      I03Z: [['I034'], ['I03P'], ['I03O']],
      I03X: [['I034'], ['I03M'], ['I03V']],
    };

    return {
      combineMap,
      list: Object.entries(combineMap)
        .flat(3)
        .filter((val, idx, arr) => arr.indexOf(val) === idx),
    };
  }

  private getNeutrals() {
    const codeBlock =
      this.script.match(
        /(?<=local integer array (?<varName>.+)\n)(?:set \k<varName>.+\n)+/
      )?.[0] || getError('no neutral blocks found');

    return Array.from(codeBlock.match(/\d{4,}/gm) ?? []).map(this.intToStr);
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
