import type { ShallowRef } from 'vue';
import type { IconBoundaries } from '~/components/GameIcon.vue';
import type { MaybeArray } from '~/utils/types';

interface Props {
  src: MaybeRefOrGetter<string>;
  imageRef: ShallowRef<HTMLElement | null>;
  coords: MaybeRefOrGetter<MaybeArray<IconBoundaries>>;
  idx: MaybeRefOrGetter<number>;
}

const isEnabled = !globalThis?.CSS?.supports(
  'object-view-box: xywh(1px 1px 1px 1px)'
);

type WH = [width: number, height: number];

export const useFallbackImage = ({ src, imageRef, coords, idx }: Props) => {
  const imageDimensions = useState(
    'imageDimensions',
    () => ({} as Record<string, WH>)
  );
  const containerWidth = ref(0);

  watch(
    () => toValue(src),
    (srcValue) => {
      if (!isEnabled) return;
      if (srcValue in imageDimensions.value) return;
      imageDimensions.value[srcValue] = [0, 0];
      const img = new Image();
      img.onload = async () => {
        imageDimensions.value[srcValue] = [img.width ?? 0, img.height ?? 0];
      };
      img.src = srcValue;
    },
    { immediate: true }
  );

  watch(
    () => toValue(imageRef),
    (image) => {
      if (!image) return;
      containerWidth.value = imageRef.value?.clientWidth ?? 0;
    },
    { immediate: true }
  );

  return computed(() => {
    if (!isEnabled) return null;
    const [totalWidth, totalHeight] = imageDimensions.value[toValue(src)] ?? [
      0, 0,
    ];
    const { x, y, width, height } = [toValue(coords)].flat()[toValue(idx ?? 0)];

    if (!containerWidth.value || !totalWidth || !isEnabled) {
      return {};
    }

    const scaleFactor = totalWidth / width;
    const xOffset = x / (totalWidth - width);
    const yOffset = y / (totalHeight - height);

    return {
      backgroundSize: `${scaleFactor * 100}%`,
      backgroundPositionX: `${xOffset * 100}%`,
      backgroundPositionY: `${yOffset * 100}%`,
      backgroundImage: `url(${toValue(src)})`,
    } as CSSStyleDeclaration;
  });
};
