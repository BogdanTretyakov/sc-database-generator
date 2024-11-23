import type { IconBoundaries } from "~/components/GameIcon.vue";
import { versions } from "~/data";
import type { IRaceData, IRaceDataFile } from "~/data/types"


export const useRaceData = async <T = IRaceData>(raceName?: string) => {
  const [routeRace] = [useRoute().params.race].flat()
  const race = raceName ?? routeRace;
  const version = useVersion()
  const { data } = await useAsyncData(
    `race-${version.value}-${race}`,
    async () => {
      if (!(version.value in versions)) {
        throw new Error("No version found");
      }
      const { racesData } = await versions[version.value]()
      if (!(race in racesData)) {
        throw new Error("No race found");
      }
      return racesData[race]() as Promise<IRaceDataFile<T>>
    },
    {
      default: () => ({}) as IRaceDataFile<T>,
      deep: false,
    }
  )

  function iconProps(id: string, count?: number): IconBoundaries|IconBoundaries[] {
    if (!count || count === 1) {
      const [x, y, width, height] = data.value.icons[id] ?? [0,0,1,1]
      return {x, y, width, height}
    }
    return Array.from({ length: count }, (_, idx) => {
      const countedId = `${id}-${idx+1}`
      const [x, y, width, height] = data.value.icons[countedId] ?? [0,0,1,1]
      return {x, y, width, height}
    })
  }

  return {
    raceData: data.value.data,
    raceIconsCoords: data.value.icons,
    iconProps,
  }
}
