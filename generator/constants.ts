export const alliances = [
  "Alliance",
  "Horde",
  "Chaos",
  "Ancients",
]

export const scriptsVariables = {
  raceName: {
    key: 'OQ',
    full: 30,
    short: 38,
  },
  replaceable: {
    key: 'I0Q',
    aura: 1,
    ulti: 5,
    description: 38,
  },
  upgrades: {
    key: 'I2Q',
    melee: '$D',
    range: 17,
    magic: 5,
    armor: 1,
    wall: 9,
    towerUpgrades: [
      21,
      25,
      29,
      33,
      37,
      41,
      45,
      49,
      53,
    ],
    bonusUpgrades: [61, 65, 69],
  },
  buildings: {
    tower: {
      key: 'I1',
      key2: 1,
    },
    fort: {
      key: 'OI',
      key2: 1,
    },
    barrack: {
      key: 'Q1',
      key2: 1,
    }
  },
  units: {
    key: 1,
    melee: 'QO',
    mage: 'IO',
    range: 'OO',
    siege: 'QI',
    air: 'Q6',
    catapult: 'O6',
  },
  bonuses: 'I7',
  heroes: [
    'Q2', 'O2', 'I2', 'Q3',
  ]
}
