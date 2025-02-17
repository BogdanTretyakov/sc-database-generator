import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ObjectsTranslator, StringsTranslator } from 'wc3maptranslator';
import type { JsonResult } from 'wc3maptranslator/dist/CommonInterfaces';
import XLSX from 'xlsx';
import { isNotNil } from '../utils/guards';
import { ozPatch, sur5alPatch } from './patches';

interface W3RawObject {
  id: string;
  type: string;
  level: number;
  column: number;
  value: any;
}

const w3strings = (() => {
  try {
    const { json } = StringsTranslator.warToJson(
      readFileSync(
        resolve(
          process.cwd(),
          'dataMap',
          globalThis.mapVersion ?? 'w3c',
          'war3map.wts'
        )
      )
    ) as JsonResult<Record<string, string>>;
    return json;
  } catch (e) {
    return {};
  }
})();

export abstract class W3Parser {
  public data: Record<string, W3RawObject[]>;
  abstract skins: Record<string, Record<string, string>>;

  abstract iconID: string;

  private processWarData(
    json: Record<string, any>
  ): Record<string, W3RawObject[]> {
    return Object.entries({
      ...json.original,
      ...json.custom,
    }).reduce((acc, [key, value]) => {
      const [newKey, origId] = key.split(':');
      if (origId) {
        (value as W3RawObject[]).push({
          id: 'Dwc3id',
          column: 0,
          level: 0,
          type: 'string',
          value: origId,
        });
      }
      acc[newKey] = (value as W3RawObject[]).map((obj) => {
        obj.id = obj.id.slice(1);
        return obj;
      });
      return acc;
    }, {} as Record<string, W3RawObject[]>);
  }

  private initData() {
    const w3Buffer = readFileSync(
      resolve(
        process.cwd(),
        'dataMap',
        globalThis.mapVersion || 'w3c',
        `war3map.${this.fileType}`
      )
    );
    const { json } = ObjectsTranslator.warToJson(this.type, w3Buffer);

    const skinsPath = resolve(
      process.cwd(),
      'dataMap',
      globalThis.mapVersion || 'w3c',
      `war3mapSkin.${this.fileType}`
    );

    const data = this.processWarData(json);

    if (existsSync(skinsPath)) {
      const w3SkinsBuffer = readFileSync(skinsPath);
      const { json: skinsJson } = ObjectsTranslator.warToJson(
        this.type,
        w3SkinsBuffer
      );
      const skinsData = this.processWarData(skinsJson);
      for (const key in skinsData) {
        data[key] = [...skinsData[key], ...(data[key] ?? [])];
      }
    }

    return data;
  }

  constructor(private fileType: string, private type: string) {
    this.data = this.initData();
  }

  findIDByKey(key: string, findValue: ((val: any) => boolean) | any) {
    const result = Object.entries(this.data)
      .filter(([id, items]) =>
        items.some(({ id, value }) =>
          id === key && typeof findValue === 'function'
            ? findValue(value)
            : value === findValue
        )
      )
      .map(([id]) => id);
    return result;
  }

  getById(id: string): W3Object<typeof this> | undefined {
    //@ts-expect-error
    return this.data[id] ? W3Object.create(this.data[id], this, id) : void 0;
  }

  getIcon(data: W3Object<typeof this>, level?: number): string {
    let icon = data.getRawValue(this.iconID, level);
    if (icon) return icon;
    const skin = this.skins[data.id] ?? this.skins[data.wc3id];
    if (!skin) return getError(`getting icon of ${data.id}`);
    const art =
      skin.art ??
      skin['art:sd'] ??
      skin['art:hd'] ??
      getError(`get icon of ${data.id}`);
    return art.split(',')[level ?? 0] ?? art.split(',')[0];
  }

  getName(data: W3Object<typeof this>): string {
    return data.getRawValue('nam');
  }

  protected getWithSlkFallback(
    data: W3Object,
    key: string,
    slk: W3Slk,
    slkKey: string
  ) {
    const value = data.getRawValue(key);
    if (value !== undefined) return value;
    return slk.data[data.id]?.[slkKey] ?? slk.data[data.wc3id]?.[slkKey];
  }
}

export class W3Object<T extends W3Parser = W3Parser> {
  private constructor(
    private data: W3RawObject[],
    public parser: T,
    public id: string
  ) {}

  get wc3id() {
    return this.getValueByKey('wc3id');
  }

  static create(data: W3RawObject[], parser: W3Parser, id: string) {
    return new this(data, parser, id);
  }

  withInstance<T>(cb: (instance: this) => T): T {
    const output = cb(this);
    if (typeof output === 'object' && output !== null && 'id' in output) {
      return {
        ...output,
        ...(this.patches[this.id] ?? {}),
      };
    }
    return output;
  }

  /**
   * @param icons icons map (will mutate)
   * @returns
   */
  withIcon(icons: Record<string, string>): this {
    const icon = this.getIcon();
    if (icon) {
      icons[this.id] = icon;
    }
    return this;
  }

  private prepareTrigStr(value: string) {
    if (value.startsWith('TRIGSTR_')) {
      const [key] = value.match(/(?<=TRIGSTR_.*?)[1-9]\d*/) ?? [''];
      return w3strings[key] ?? '';
    }
    return value;
  }

  private formatValue(value: any): any {
    if (typeof value === 'string') {
      return this.prepareTrigStr(value)
        .replace(
          /\|c(?<transparency>[0-9a-fA-F]{2})(?<color>[0-9a-fA-F]{6})(?<content>.*?)(?:(?:\|r)|(?=\|c)|$)/gms,
          (...args: any[]) => {
            const { color, content, transparency } = args.pop();
            return `<span class="w3-colored" style="color: #${color}${transparency}">${content}</span>`;
          }
        )
        .replace(/\|n/gm, '<br/>');
    }

    return value;
  }

  getValueByKey(key: string, level: number | void): any {
    const obj = this.data.find(
      (item) => item.id === key && (level === undefined || item.level === level)
    );

    return this.formatValue(obj?.value);
  }

  getArrayValue(key: string, level: number | void) {
    return String(this.getRawValue(key, level) ?? '')
      .split(',')
      .map((a) => a.trim())
      .filter(isNotNil);
  }

  getRawValue(key: string, level?: number | void) {
    const value = this.data.find(
      (item) => item.id === key && (level === undefined || item.level === level)
    )?.value;
    if (typeof value !== 'string') return value;
    return this.prepareTrigStr(value).replace(
      /(?:\|n)|(?:\|c[a-fA-F0-9]{8})|(?:\|r)/gm,
      ''
    );
  }

  getAllValuesByKey(key: string, filter?: (val: W3RawObject) => boolean) {
    return this.data
      .slice()
      .filter(({ id }) => id === key)
      .sort(({ level: l1 }, { level: l2 }) => l1 - l2)
      .filter((value) => (filter ? filter(value) : true))
      .map(({ value }) => value)
      .map(this.formatValue.bind(this));
  }

  getMaxLevel() {
    const value = this.getValueByKey('lvl');
    if (typeof value === 'number' && !!value) return value;
    const levels = this.data.map(({ level }) => level);
    return Math.max(...levels);
  }

  getName() {
    return this.parser.getName(this);
  }

  getIcon(level?: number) {
    return this.parser.getIcon(this, level);
  }

  private get patches() {
    switch (globalThis.mapVersion) {
      case 'w3c':
        return sur5alPatch;
      case 'oz':
        return ozPatch;
      default:
        return {};
    }
  }
}

export class W3Slk {
  public data: Record<string, Record<string, string>>;

  constructor(fileName: string, itemId: string) {
    const book = XLSX.readFile(
      resolve(process.cwd(), 'generator', 'skinsData', fileName)
    );
    const sheet = book.Sheets[book.SheetNames[0]];
    const parsed = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    this.data = Object.fromEntries(parsed.map((item) => [item[itemId], item]));
  }
}

export class W3File<const E extends String> {
  public path!: string;
  public extension!: E;

  constructor(path: string, extensions: E[], customPath?: string) {
    const nonExtPath = path.replace(/(?=.+)\.[^\.]*$/, '');
    [
      customPath,
      resolve(process.cwd(), 'dataMap', globalThis.mapVersion || 'w3c'),
      resolve(process.cwd(), 'dataWarcraft'),
    ]
      .filter(isNotNil)
      .forEach((basePath) => {
        if (!!this.path) return;
        for (let i = 0; i < extensions.length; i++) {
          const ext = extensions[i];
          const tmpPath = resolve(basePath, `${nonExtPath}.${ext}`);
          if (existsSync(tmpPath)) {
            this.path = tmpPath;
            this.extension = ext;
            return;
          }
        }
      });
    if (!this.path) {
      getError(`getting file ${path}`);
    }
  }
}

export function getError(reason?: string): never {
  throw new Error(`Error while ${reason ?? 'unknown reason'}`);
}
