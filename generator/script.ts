import { readFile } from 'fs/promises';
import { resolve } from 'path'
import { scriptsVariables } from './constants';
import { abilitiesParser, unitsParser } from './objects';
import type { IRawRace } from '~/data/types';

class ScriptParser {
  private buildingsMap: Record<string, Record<string, string>>
  private constructor(private script: string) {
    this.buildingsMap = this.getBuildingsMap()
  }

  private getIfBlockByCondition(condition: string|RegExp, endCondition = 0) {
    let output = ''
    let pos = this.script.search(condition)
    if (pos < 0) return output
    let codeBlock = 0
    let done = false
    let word = ''
    while(!done && pos <= this.script.length) {
      const char = this.script[pos++];
      word += char;
      if (char !== ' ' && char !== '\n') continue
      if (word.startsWith('if(')) codeBlock += 1
      if (word.startsWith('endif')) {
        codeBlock -= 1
        if (codeBlock === endCondition) done = true
      }
      output += word
      word = ''
    }
    return output
  }

  private getBuildingsMap() {
    const initCodeBlock = this.script.match(/(?<=^function \w{3,5} takes nothing returns nothing$\n)(?:(?:[^function]^.*$)\n)*?^call SetTimeOfDay\(12\.\)$\n(?:(?:^.*$)\n)*?(?=^endfunction$)/mi)?.[0]

    if (!initCodeBlock) return {}

    return Array.from(
      initCodeBlock.matchAll(/^set (?<varName>.*?(?=\[))\[(?<varKey>.*?)\].*?['"](?<varValue>.{4})['"]$/gmi)
    ).reduce((acc, { groups }) => {
      if (!groups) return acc
      const { varName, varValue, varKey } = groups
      if (!(varName in acc)) {
        acc[varName] = {}
      }
      acc[varName][varKey] = varValue
      return acc
    }, {} as Record<string, Record<string, string>>)

  }

  static async create() {
    const content = (
      await readFile(
        resolve(process.cwd(), 'dataMap', 'war3map.j'),
        { encoding: 'utf8' }
      )
    ).replace(/(\r\n)|\r/g, '\n');

    return new this(content);
  }

  getRaceData(raceID: string) {
    const {
      raceName,
      upgrades,
      buildings,
      units,
    } = scriptsVariables;

    const checkRaceRegex = new RegExp(
      String.raw`(?<=function )\w*?(?=\s.*\n.*GetSoldUnit\(\)\)=='${raceID})`,
      'gmi'
    )
    const checkRaceFuncNames = Array.from(this.script.match(checkRaceRegex) ?? [])

    if (!checkRaceFuncNames.length) return

    const [fortVar, fortId] = checkRaceFuncNames.map(checkFuncName => {
      const setVarRegex = new RegExp(
        String.raw`^if\(${checkFuncName}\(\)\)then$\n^set (?<tempVar1>.*?)=(?<storedVarKey>.*?)$`,
        'm'
      )
      const { tempVar1, storedVarKey } = this.script.match(setVarRegex)?.groups ?? {}

      const escapedTempVar1 = tempVar1.replace('[', '\\[').replace(']', '\\]')

      const findReplacerRegex = new RegExp(
        String.raw`set (?<fortVar>.*)=ReplaceUnitBJ\(.*?,(?<storedVarName>.*?)\[${escapedTempVar1}\],bj_UNIT_STATE_METHOD_DEFAULTS\)`,
        'm'
      )

      const { fortVar, storedVarName } = this.script.match(findReplacerRegex)?.groups ?? {}

      const fortId = this.buildingsMap[storedVarName][storedVarKey]

      if (!fortId) return

      return [fortVar, fortId]
    }).reduce((acc, value) => {
      if (!value) return acc
      if (value[0].includes(`[${scriptsVariables.buildings.fort.key2}]`)) return value
      return acc
    }) ?? []

    if (!fortId) return

    const escapedFortVar = fortVar.replace('[', '\\[').replace(']', '\\]')

    const checkRaceFnRegex = new RegExp(
      String.raw`(?<=function ).*?(?=\s.*?$\n^return\(GetUnitTypeId\(${escapedFortVar}\)=='${fortId}'\))`,
      'gmi'
    )

    const checkRaceFn = Array.from(this.script.match(checkRaceFnRegex) ?? []).map(s => `(?:${s})`).join('|')

    if (!checkRaceFn.length) return


    const raceUpgradeBlockRegex = new RegExp(
      String.raw`(?<=if\((?:${checkRaceFn})\(\)\)then\n)[\s\S]*?set ${raceName.key}\[${raceName.short}\].*$`,
      'mi'
    )

    const raceUpgradeBlock = this.script.match(raceUpgradeBlockRegex)?.[0]

    if (!raceUpgradeBlock) return

    const varRegex =
      /^set (?<varName>.*?(?=\[))\[(?<varKey>.*?)\].*?['"](?<varValue>.*?)['"]$/gim;

    const rawRaceData = Array.from(raceUpgradeBlock.matchAll(varRegex)).reduce((acc, { groups }) => {
      if (!groups) return acc;
      const { varName, varKey, varValue } = groups;
      if (!(varName in acc)) {
        acc[varName] = {};
      }
      if (varKey in acc[varName]) return acc;
      acc[varName][varKey] = varValue;
      return acc
    }, {} as Record<string, Record<string, string>>)

    const hiddenDoomId = this.script.match(new RegExp(
      String.raw`(?<=^call BlzUnitHideAbility\(${escapedFortVar},['|"]).*?(?=['|"],true\)$)`,
      'i'
    ))?.[0] ?? ''

    const auraID = rawRaceData[scriptsVariables.replaceable.key][scriptsVariables.replaceable.aura]
    const auras = abilitiesParser.getById(auraID)?.withInstance(data => {
      return String(data.getValueByKey('pb1')).split(',')
    }) ?? []
    const ulti = rawRaceData[scriptsVariables.replaceable.key][scriptsVariables.replaceable.ulti]

    const [t1spell, t2spell] = unitsParser.getById(fortId)?.withInstance(data => {
      const skills = String(data.getValueByKey('abi')).split(',')
      return skills
        .filter(id => ![ulti, auraID, hiddenDoomId].includes(id))
        .filter(id => Boolean(abilitiesParser.getById(id)))
    }) ?? []


    const output: IRawRace = {
      id: raceID,
      name: rawRaceData[raceName.key][raceName.full],
      key: rawRaceData[raceName.key][raceName.short].toLocaleLowerCase(),
      bonuses: Object.values(rawRaceData[scriptsVariables.bonuses]),
      upgrades: scriptsVariables.upgrades.towerUpgrades
        .map(key => rawRaceData[upgrades.key][key]),
      auras,
      ulti,
      t1spell,
      t2spell,
      magic: rawRaceData[upgrades.key][upgrades.magic],
      baseUpgrades: {
        armor: rawRaceData[upgrades.key][upgrades.armor],
        melee: rawRaceData[upgrades.key][upgrades.melee],
        range: rawRaceData[upgrades.key][upgrades.range],
        wall: rawRaceData[upgrades.key][upgrades.wall],
      },
      heroes: scriptsVariables.heroes.map(key => Object.values(rawRaceData[key])),
      buildings: {
        fort: fortId,
        tower: rawRaceData[buildings.tower.key][buildings.tower.key2],
        barrack: rawRaceData[buildings.barrack.key][buildings.barrack.key2],
      },
      units: {
        melee: rawRaceData[units.melee][units.key],
        air: rawRaceData[units.air][units.key],
        catapult: rawRaceData[units.catapult][units.key],
        mage: rawRaceData[units.mage][units.key],
        range: rawRaceData[units.range][units.key],
        siege: rawRaceData[units.siege][units.key],
      },
      bonusUpgrades: {},
    }

    this.enrichRaceData(output)

    return output
  }

  private enrichRaceData(data: IRawRace) {
    data.bonuses.forEach(bonusID => {
      const conditionFnNameRegex = new RegExp(
        String.raw`\w+(?= takes nothing returns boolean$\n^return\(GetUnitTypeId\(GetTriggerUnit\(\)\)=='${bonusID}'\)$)`,
        'gmi'
      )

      const conditionFnName = this.script.match(conditionFnNameRegex)?.[0]
      if (!conditionFnName) return

      const codeBlock = this.getIfBlockByCondition(new RegExp(
        String.raw`^if\(${conditionFnName}\(\)\)`,
        'mi'
      ), 1);

      const heroesPrepared = scriptsVariables.heroes.map(k => `(?:${k})`).join('|')

      const heroReplace = codeBlock.match(new RegExp(
        String.raw`^set (?<heroVar>${heroesPrepared})\[1\].*?['|"](?<heroReplaceId>.*?)['|"].*?$`,
        'mi'
      ))

      if (heroReplace) {
        const { heroVar, heroReplaceId } = heroReplace.groups ?? {}
        const idx = scriptsVariables.heroes.indexOf(heroVar)
        if (idx < 0) return
        data.heroes[idx].push(heroReplaceId)
        return
      }

      const upgradesPrepared = scriptsVariables.upgrades.bonusUpgrades.map(k => `(?:${k})`).join('|')

      const upgrades = codeBlock.match(new RegExp(
        String.raw`(?<=^set ${scriptsVariables.upgrades.key}\[(?:${upgradesPrepared})\].*?['"])\w+(?=['"]$)`,
        'gmi'
      ))

      if (upgrades) {
        data.bonusUpgrades[bonusID] = Array.from(upgrades)
        return
      }

    })
  }

  getRaceIDs<const T extends string[]>(
    allianceIDs: T
  ): Record<T[number], string[]> {
    const alliancesRegexString = allianceIDs.map((a) => `(${a})`).join('|');

    const racePickersRegex = new RegExp(
      String.raw`^set (?<varName>.*?)=CreateUnit\(.*?,\s?'(?<unitName>${alliancesRegexString})'.*$`,
      'gmi'
    );

    const racePickers = Array.from(
      this.script.matchAll(racePickersRegex)
    ).reduce<Record<string, string>>((acc, { groups }) => {
      if (!groups) return acc;
      const { varName, unitName } = groups;
      acc[unitName] = varName;
      return acc;
    }, {});

    return allianceIDs.reduce((acc, allianceID) => {
      const raceAddRegex = new RegExp(
        String.raw`(?<=^call AddUnitToStockBJ\(').*(?=',\s?${racePickers[allianceID]})`,
        'gm'
      );
      acc[allianceID as T[number]] = Array.from(this.script.match(raceAddRegex) ?? []);
      return acc;
    }, {} as Record<T[number], string[]>);
  }
}

export const scriptParser = await ScriptParser.create();
