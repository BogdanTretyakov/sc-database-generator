export interface IRawRace {
  name: string;
  key: string;
  id: string;
  bonuses: string[];
  upgrades: string[];
  magic: string;
  baseUpgrades: {
    melee: string;
    armor: string;
    range: string;
    wall: string;
  };
  auras: string[];
  ulti: string;
  t1spell: string;
  t2spell: string;
  heroes: string[][];
  buildings: {
    tower: string;
    fort: string;
    barrack: string;
  };
  units: {
    melee: string;
    range: string;
    mage: string;
    siege: string;
    air: string;
    catapult: string;
  };
  bonusUpgrades: Record<string, string[]>;
}

export interface IBaseObject {
  id: string;
  name: string;
  hotkey: string;
  description: string;
}

export interface IRacePickerObject extends IBaseObject {
  key: string;
}

export interface IBonusObject extends IBaseObject {
  buildingName: string;
}

export interface IMagicObject extends IUpgradeObject {
  level: number;
}

export interface IUpgradeObject extends IBaseObject {
  cost: number[];
  iconsCount?: number;
}

export interface IBuildingObject {
  attackType: string;
}

export interface IUnitObject extends IBaseObject {
  cost: number;
  atkType: string;
  defType: string;
}

export interface IHeroObject extends IBaseObject {
  fullName: string;
  cost: number;
}

export interface IRaceData {
  name: string;
  key: string;
  id: string;
  description: string;
  ultimateId: string;
  auras: IBaseObject[];
  bonuses: IBonusObject[];
  towerUpgrades: IUpgradeObject[];
  magic: IMagicObject[];
  baseUpgrades: {
    melee: IUpgradeObject;
    armor: IUpgradeObject;
    range: IUpgradeObject;
    wall: IUpgradeObject;
  };
  units: {
    melee: IUnitObject;
    range: IUnitObject;
    mage: IUnitObject;
    siege: IUnitObject;
    air: IUnitObject;
    catapult: IUnitObject;
  };
  buildings: {
    fort: IBuildingObject;
    tower: IBuildingObject;
    barrack: IBuildingObject;
  };
  t1spell: IBaseObject;
  t2spell: IBaseObject;
  heroes: Array<IHeroObject[]>;
  bonusUpgrades: Record<string, IUpgradeObject[]>;
}

export type IRaceIcons = Record<
  string,
  [x: number, y: number, width: number, height: number]
>;

export interface IRaceDataFile<T = IRaceData> {
  data: T;
  icons: IRaceIcons;
}
