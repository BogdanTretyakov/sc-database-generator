import type { StatisticMeta } from '~/types/statistic';

export const useStatisticMeta = async () => {
  const config = useRuntimeConfig();
  const cache = useState<{ data: StatisticMeta | null; ts: number }>(
    'statisticMetaCache',
    () => ({ data: null, ts: 0 })
  );

  const TTL = 30 * 60 * 1000;
  const now = Date.now();

  if (cache.value.data && now - cache.value.ts < TTL) {
    return computed(() => cache.value.data);
  }

  const { data } = await useFetch<StatisticMeta>('/analytic/meta', {
    key: 'statisticMeta',
    server: false,
    baseURL: config.public.backendUrl,
  });

  watchEffect(() => {
    if (data.value && import.meta.client) {
      cache.value = { data: data.value, ts: now };
    }
  });

  return computed(() => cache.value.data);
};
