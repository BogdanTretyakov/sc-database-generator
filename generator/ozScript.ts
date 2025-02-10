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
import { BaseScriptParser } from './baseScriptParser';

export class OZScriptParser extends BaseScriptParser {
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
        )}\)\n(?:^.+$\n)+?(?:(?:elseif .{2,6}=\d{1,2})|(?:endfunction.+))`,
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
        /(?:(?<=set (?<var>.{2,6})\s?=\s?['"]).+(?=['"]$\ncall SetPlayerName\(.{2,6},\k<var>\)))|(?:(?<=call SetPlayerName\(.+?,\s?['"])\w+)/im
      )?.[0] || getError(`race ${id} key`)
    )
      .toLocaleLowerCase()
      .replace(/[^\w\-]/g, '_');

    const [t1spell, t2spell] =
      unitsParser
        .getById(raceVariables[this.scriptVariables.buildings.fort])
        ?.withInstance((data) => {
          return data
            .getArrayValue('abi')
            ?.filter(
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
          ?.getArrayValue('pb1') || getError('get aura'),
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
          ?.getArrayValue('upt') ?? getError(`getting bonuses ${id}`),
      bonusUpgrades: {},
      t1spell,
      t2spell,
      towerAbilities:
        unitsParser
          .getById(raceVariables[this.scriptVariables.buildings.tower])
          ?.withInstance((instance) =>
            instance.getArrayValue('abi')?.filter((id) =>
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
        // getError(`no bonus block found for ${bonusID}`);
        return;
      }
      const codeBlock = this.getIfBlockByIndex(findSetBonusBlock.index);

      const heroesMatch = Array.from(codeBlock.matchAll(setHeroRegex) ?? []);
      heroesMatch.forEach(({ groups }) => {
        if (!groups) return;
        const { heroVar, replaceHero } = groups;
        if (!heroVar || !replaceHero) return;

        const slot = this.scriptVariables.heroes.indexOf(heroVar);

        const output: IRawBonusHero = {
          id: this.intToStr(replaceHero),
          slot,
        };

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
        abilitiesParser.getById(pickerId)?.getArrayValue('pb1') ??
        getError('process pickers');
      return acc;
    }, {} as Record<string, string[]>);
  }

  private getUltimates(): IRawUltimates {
    const codeBlock = this.script.match(
      /(?:(?:call .{3,6}\(.{2,6},\d+,\d+,.+Ulti.+\n(?:set.+\n)?)+)|(?:(?:call .{3,6}\(.{3,6},\d+,\d+\)\n){10,11})/im
    )?.[0];
    if (!codeBlock) getError('getting ulti codeblock');

    const spells = Array.from(
      codeBlock.matchAll(/call .*?(?<picker>\d{5,}),\s?(?<spell>\d{5,})/gim)
    ).reduce((acc, { groups }) => {
      if (!groups) return acc;
      const { picker, spell } = groups;

      try {
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
      } catch (e) {
        acc[this.intToStr(picker)] = [this.intToStr(spell)];
        return acc;
      }
    }, {} as Record<string, string[]>);

    return {
      spells,
      pickers: Object.keys(spells),
    };
  }

  private getShrines() {
    const codeBlock = this.script.match(
      /(?:(?:call .{2,6}\(.+?,(?:\d{6,},)+.*Shrine.*\)$\n){3,})|(?:(?:call .{2,6}\(.{2,6}(?:,\d{9,11}){4,}\)\n){4,})/im
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
        /(?<=local integer array (?<varName>.+)\n)(?:^.+$\n){0,6}(?:set \k<varName>.+\n){9,}/gm
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

  private strToInt(string: string) {
    return Number(
      BigInt(string.charCodeAt(3)) |
        (BigInt(string.charCodeAt(2)) << 8n) |
        (BigInt(string.charCodeAt(1)) << 16n) |
        (BigInt(string.charCodeAt(0)) << 24n)
    );
  }

  override getHeroItems(heroID: string): Record<string, string> | undefined {
    const replaceMatch = this.script.match(
      new RegExp(
        String.raw`(?:else)?if .*?.{2,6}==${this.strToInt(
          heroID
        )} (?:or .{2,6}==\d+)*then(?=\n(?:^.+$\n){1,20}call UnitAddItem)`,
        'mi'
      )
    );
    if (!replaceMatch?.index) return;

    const output: Record<string, string> = {};
    const replaceCodeBlock = this.getIfBlockByIndex(replaceMatch.index);

    Array.from(
      replaceCodeBlock.matchAll(
        /if .{2,6}\s?>=(?<level>\d{1,2})\s.+\n(?:^.+$\n){0,20}?(?:call UnitAddItemById\(.{2,6},\s?(?<value>\d+))/gim
      )
    )
      .filter(({ groups }) => groups && !!groups.level)
      .forEach(({ groups }) => {
        if (!groups) return;
        const { level, value } = groups;
        output[level] = this.intToStr(value);
      });
    return output;
  }

  override getBonusUnit(bonusID: string): string | undefined {
    const findBlockIndex = this.script.match(
      new RegExp(String.raw`(?:else)?if {2,6}==${this.strToInt(bonusID)}`, 'mi')
    )?.index;
    if (!findBlockIndex) return;
    const codeBlock = this.getIfBlockByIndex(findBlockIndex);
    const preparedVars = Object.values(this.scriptVariables.units)
      .map((s) => `(?:${s})`)
      .join('|');
    const found = codeBlock.match(
      new RegExp(
        String.raw`(?<=set (?:${preparedVars})(?:\[w+\])?\s?=\s?)\d+`,
        'mi'
      )
    )?.[0];
    return found ? this.intToStr(found) : undefined;
  }
}
