import { resolve } from 'path';
import { readdir, mkdir, readFile, writeFile, chmod } from 'fs/promises';
import { mkdirSync, chmodSync, chownSync } from 'fs';
import os from 'os';
// @ts-expect-error no typings
import { grant_permission } from 'webp-converter';

const webpDir = resolve(process.cwd(), 'node_modules/webp-converter');
const user = os.userInfo();

mkdirSync(resolve(webpDir, 'temp'), { recursive: true });
chmodSync(webpDir, 0o775);
chmodSync(resolve(webpDir, 'temp'), 0o775);
chownSync(resolve(webpDir, 'temp'), user.uid, user.gid);
grant_permission();
import { select } from '@inquirer/prompts';

const type =
  globalThis.mapVersion ??
  (await select({
    message: 'Select version to parse',
    choices: [
      { value: 'og', name: 'Official Sur5al/W3C' },
      { value: 'oz', name: 'OZGame Edition' },
    ],
  }));

globalThis.mapVersion = type;

export default type;
