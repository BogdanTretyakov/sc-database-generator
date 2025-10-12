export const formatMillisecondsToHuman = (
  ms: number
): `${string}:${string}:${string}` => {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 1000 / 60) % 60;
  const hours = Math.floor(ms / 1000 / 60 / 60) % 24;
  return [hours, minutes, seconds]
    .map(String)
    .map((s) => s.padStart(2, '0'))
    .join(':') as `${string}:${string}:${string}`;
};
