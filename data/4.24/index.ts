import type { IRaceData } from '~/data/types'

const racesData = Object.entries(import.meta.glob(
  './*.json',
  { import: 'default' },
)).reduce((acc, [key, value]) => {
  const path = key.split(/\\|\/|\./g)
  const name = path[path.length-2]
  acc[name] = value as () => Promise<IRaceData>
  return acc
}, {} as Record<string, () => Promise<IRaceData>>)

const racesIcons = Object.entries(import.meta.glob(
  './*.webp',
  { import: 'default', eager: true, },
)).reduce((acc, [key, value]) => {
  const path = key.split(/\\|\/|\./g)
  const name = path[path.length-2]
  acc[name] = value as string
  return acc
}, {} as Record<string, string>)

export default { racesData, racesIcons }
