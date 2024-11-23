import { createInterface } from "readline/promises";
import { resolve } from 'path'
import { existsSync } from 'fs'
import { rename, readdir, mkdir, readFile, writeFile } from 'fs/promises'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = async (question: string) => {
  const answer = await rl.question(question);
  return answer.trim();
};

const versionName = await askQuestion('Version name for packing:\n')

const outputDir = resolve(process.cwd(), 'data', versionName);

if (existsSync(outputDir)) {
  throw new Error(`Version ${versionName} already exists, remove folder before continue`);
}

const inputDir = resolve(process.cwd(), 'dataGenerated');

await mkdir(outputDir)

const files = await readdir(inputDir, { encoding: 'utf8', withFileTypes: true })

const promises = files
  .filter(dirent => dirent.isFile() && dirent.name !== '.gitkeep')
  .map(async ({name, parentPath}) => {
    await rename(
      resolve(parentPath, name),
      resolve(outputDir, name)
    )
  })

await Promise.all(promises)

const constantsFile = resolve(process.cwd(), 'data', 'index.ts')
const constantContent = await readFile(constantsFile, { encoding: 'utf8' });
await writeFile(
  constantsFile,
  constantContent.replace(/(?<=^export const lastVersion.*?['"]).*?(?=['"])/mi, versionName),
  { encoding: 'utf8' }
);

rl.close()
