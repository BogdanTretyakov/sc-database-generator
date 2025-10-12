import type { IDataFile } from '~/data/types';

const subscribers: Record<string, number> = {};

export const useIconsDataUri = (
  imageSrc: string,
  icons: IDataFile['icons'],
  keys: string[]
) => {
  const cacheKey = `iconsDataUri-${imageSrc}-${keys.slice().sort().join('-')}`;
  const data = useState<Record<string, string>>(cacheKey, () => ({}));
  subscribers[cacheKey] = subscribers[cacheKey] + 1 || 1;

  onScopeDispose(() => {
    subscribers[cacheKey]--;
    if (subscribers[cacheKey] === 0) {
      Object.values(data.value).forEach(URL.revokeObjectURL);
      data.value = {};
    }
  });

  watch(
    () => imageSrc,
    (src) => {
      if (!import.meta.client) return;
      const img = new Image();
      img.src = src;
      img.onload = () => {
        keys.forEach(async (key) => {
          if (!icons[key]) return;
          data.value[key] = await getCrop(img, ...icons[key]);
        });
      };
    },
    {
      immediate: true,
    }
  );

  return computed(() => data.value);
};

function getCrop(
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no ctx');
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
  return new Promise<string>((res, rej) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        return rej(new Error('no blob'));
      }
      const url = URL.createObjectURL(blob);
      res(url);
    }, 'image/png');
  });
}
