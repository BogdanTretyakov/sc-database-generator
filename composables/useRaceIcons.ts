import { versions } from '~/data';

export const useRaceIcons = async (raceName?: string) => {
  const [routeRace] = [useRoute().params.race].flat();
  const version = useVersion();
  const race = raceName ?? routeRace;
  const { data } = await useAsyncData(
    `icons-${version.value}-${race}`,
    async () => {
      if (!(version.value in versions)) {
        throw new Error('No version found');
      }
      const { racesIcons } = await versions[version.value]();
      if (!(race in racesIcons)) {
        throw new Error('No race found');
      }

      return racesIcons[race];
    },
    {
      default: String,
    }
  );

  return data;
};
