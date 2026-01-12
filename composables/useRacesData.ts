export const useRacesData = async <const T extends string[]>(
  races: T,
  type?: string,
  version?: string
) => {
  const data = await Promise.all(
    races.map((race) => useRaceData(race, type, version))
  );
  return Object.fromEntries(
    data.map((data) => [data.raceData.id, data] as const)
  );
};
