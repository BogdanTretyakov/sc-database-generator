import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ObjectsTranslator } from 'wc3maptranslator';
import { hotkeys } from '~/utils/constants';

interface W3RawObject {
  id: string;
  type: string;
  level: number;
  column: number;
  value: any;
}

export abstract class W3Parser {
  protected data: Record<string, W3RawObject[]>;
  protected ObjectConstructor: typeof W3Object

  private initData() {
    const w3Buffer = readFileSync(resolve(process.cwd(), 'dataMap', this.fileName));
    const { json } = ObjectsTranslator.warToJson(this.type, w3Buffer);

    return Object.entries({
      ...json.original,
      ...json.custom,
    }).reduce((acc, [key, value]) => {
      const [newKey, origId] = key.split(':');
      if (origId) {
        (value as W3RawObject[]).push({
          id: 'origId',
          column: 0,
          level: 0,
          type: 'string',
          value: origId
        })
      }
      acc[newKey] = (value as W3RawObject[]).map((obj) => {
        obj.id = obj.id.slice(1);
        return obj;
      });
      return acc;
    }, {} as Record<string, W3RawObject[]>);
  }

  private initSkinsData() {
    const fileContent = readFileSync(
      resolve(process.cwd(), 'generator', 'skinsData', this.skinsFileName),
      { encoding: 'utf8' }
    )

    return Array
      .from(fileContent.matchAll(/^\[(?<id>\w+)\]$\n(?<content>[\s\S]+?)^$/gm))
      .reduce((acc, { groups: blockGroups }) => {
        if (!blockGroups) return acc
        const { id, content } = blockGroups
        acc[id] = Array
          .from(content.matchAll(/^(?<key>.+)=(?<value>.+)$/gm))
          .reduce((innerAcc, { groups }) => {
            if (!groups) return innerAcc
            const { key, value } = groups
            innerAcc[key.toLocaleLowerCase()] = value
            return innerAcc
          }, {} as Record<string, string>)
        return acc
      }, {} as Record<string, Record<string, string>>)
  }

  constructor(
    private fileName: string,
    private type: string,
    private skinsFileName: string,
    iconId = 'ico',
  ) {
    this.data = this.initData()
    this.ObjectConstructor = withIcon(iconId, this.initSkinsData())
  }

  findIDByKey(key: string, findValue: any) {
    const result = Object.entries(this.data).find(([id, items]) =>
      items.some(({ id, value }) => id === key && value === findValue)
    );
    return result?.[0];
  }

  getById(id: string): W3Object | undefined {
    return this.data[id] ? this.ObjectConstructor.create(this.data[id], id) : void 0;
  }
}

const withIcon = (
  iconId: string,
  skinsData: Record<string, Record<string,string>>
) => class extends W3Object {
  override iconId = iconId
  override skinsData = skinsData
}

export class W3Object {
  protected iconId = 'ico';
  protected skinsData: Record<string, Record<string,string>> = {}

  constructor(
    private data: W3RawObject[],
    public id = '',
  ) {}

  static create(
    data: W3RawObject[],
    id = ''
  ) {
    return new this(data, id);
  }

  withInstance<T>(cb: (instance: this) => T): T {
    return cb(this);
  }

  private formatValue(value: any) {
    if (typeof value === 'string') {
      return value
        .replace(
          /\|c(?<transparency>[0-9a-fA-F]{2})(?<color>[0-9a-fA-F]{6})(?<content>.*?)(?:(?:\|r)|(?=\|c)|$)/gms,
          (...args) => {
            const { color, content, transparency } = args.pop();
            return `<span class="w3-colored" style="color: #${color}${transparency}">${content}</span>`;
          }
        )
        .replace(/(?:\|n)+/gm, '<br/>');
    }

    return value;
  }

  getValueByKey(key: string, level: number | void) {
    const value = this.data.find(
      (item) => item.id === key && (level === undefined || item.level === level)
    )?.value;

    return this.formatValue(value);
  }

  getAllValuesByKey(key: string, filter?: (val: W3RawObject) => boolean) {
    return this.data
      .slice()
      .sort(({ level: l1 }, { level: l2 }) => l1 - l2)
      .filter(({ id }) => id === key)
      .filter(value => filter ? filter(value) : true)
      .map(({ value }) => value)
      .map(this.formatValue);
  }

  getMaxLevel() {
    const value = this.getValueByKey('lvl');
    if (typeof value === 'number') return value;
    const levels = this.data
      .filter(({ id }) => id === 'nam')
      .map(({ level }) => level);
    return Math.max(...levels);
  }

  getIcon(level?: number) {
    let icon = this.getValueByKey(this.iconId, level)
    if (icon) return icon
    const skin = this.skinsData[this.id]
    if (!skin) return
    return skin.art ?? skin['art:sd']
  }
}
