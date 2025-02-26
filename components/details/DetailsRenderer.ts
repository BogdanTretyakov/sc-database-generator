import {
  DetailsUnit,
  DetailsHero,
  DetailsUpgrade,
  DetailsSpell,
  DetailsBonus,
} from '#components';
import type { IBaseObject } from '~/data/types';

interface Props {
  item?: MaybeRef<IBaseObject | null>;
}

export default ({ item: propItem }: Props) => {
  const item = toValue(propItem);
  if (!item) return void 0;
  if (isUnitObject(item)) return h(DetailsUnit, { item });
  if (isHeroObject(item)) return h(DetailsHero, { item });
  if (isUpgradeObject(item)) return h(DetailsUpgrade, { item });
  if (isSpellObject(item)) return h(DetailsSpell, { item });
  if (isBonusObject(item)) return h(DetailsBonus, { item });
  return void 0;
};
