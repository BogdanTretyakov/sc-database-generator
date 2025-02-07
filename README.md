# Survival Chaos Database Generator

Generator of static site for Survival Chaos advanced players

There is no any guides and/or basic info. If you wanna add some materials for beginners - please, contact me

## Where to see it?

Repository may be found [here](https://github.com/BogdanTretyakov/sc-database-generator)

Deployed generated site may be found [here](https://sc-helper.github.io/)

## How to use/develop

Because of OS/FS file path spec this repo will only works correct on **Windows** platform

### Instal & prepare

#### Default JS project things

```
git clone git@github.com:BogdanTretyakov/sc-database-generator.git
cd sc-database-generator
yarn
```

#### Prepare Warcraft III data (only once per large patch)

Some data from wc3 needed for generating static content
Use [CascView](http://www.zezula.net/en/casc/main.html) with installed last version of Warcraft III from Battle.net. Extract those folders from original game to `dataWarcraft`:

- replaceableTextures

#### Prepare Survival Chaos map

For **original/w3champions** version use any deprotection tool you want. We are recommend [WC3MapDeprotector](https://github.com/speige/WC3MapDeprotector). For **OZ** version of it's doesn't needs.

Then use [MPQ Editor](http://www.zezula.net/en/mpq/download.html) or any other MPQ file extractor and extract all map data to folder `dataMap`

#### Generate data & developing

_(Unnecessary)_ Generate debug data

```
yarn data:debug
```

Then generate unpacked map's raw data

```
yarn data:generate
# Choose type of unpacked version
yarn data:pack
# Enter version of the map
```

Generate database site

```
# Developer version
yarn dev
# or build production
yarn generate
```

For developer build open [http://localhost:3000](http://localhost:3000)

For production build deploy `dist/` to any static hosting you want

## Contribution

### Map data

Send me PR with new `data/` (just after `yarn data:pack` step)

### Features

Looking for help with:

- Generate buildings images (parsing 3D models)
- Guides section
- Any additional data for view
