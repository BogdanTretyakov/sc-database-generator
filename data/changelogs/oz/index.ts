import { type IDataFile, type IChangelog } from '~/data/types';

const data = Object.entries(
  import.meta.glob<any>('./*.json', { import: 'default', eager: false })
).reduce((acc, [key, value]) => {
  const path = key.split(/\\|\//g);
  const name = path[path.length - 1].replace(/\.[^.]*$/, '');
  acc[name] = value as () => Promise<IDataFile<IChangelog>>;
  return acc;
}, {} as Record<string, () => Promise<IDataFile<IChangelog>>>);

const icons = Object.entries(
  import.meta.glob<any>('./*.webp', { import: 'default', eager: true })
).reduce((acc, [key, value]) => {
  const path = key.split(/\\|\//g);
  const name = path[path.length - 1].replace(/\.[^.]*$/, '');
  acc[name] = value as string;
  return acc;
}, {} as Record<string, string>);

export default {
  data,
  icons,
};
