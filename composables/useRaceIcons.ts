export const useRaceIcons = async (raceName?: string) => {
  const [routeRace] = [useRoute().params.race].flat();
  const versionIndex = useVersionIndex();
  const race = raceName ?? routeRace;

  const { data } = await useAsyncData(
    `icons-${versionIndex.value.version}-${race}`,
    async () => {
      if (!(race in versionIndex.value.racesIcons)) {
        throw new Error('No race found');
      }

      return versionIndex.value.racesIcons[race];
    },
    {
      default: String,
    }
  );

  return data;
};
