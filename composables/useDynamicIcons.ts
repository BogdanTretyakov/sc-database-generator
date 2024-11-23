import type { IconBoundaries } from "~/components/GameIcon.vue";

interface Props {
  data: MaybeRef<Record<string, number|undefined>>;
  propsFn(id: string): IconBoundaries;
  interval?: number
}

export const useDynamicIcons = ({ data, propsFn, interval = 1000 }: Props) => {
  const maxValue = computed(() => Math.max(...Object.values(toValue(data)).filter(isNotNil)))
  const counter = ref(1)
  const id = useId()

  const increment = () => {
    counter.value = counter.value >= maxValue.value ? 1 : counter.value + 1
  }

  const timerId = ref(globalThis.setInterval(increment, interval))
  onUnmounted(() => globalThis.clearInterval(timerId.value))

  const icons = computed(() => mapObject(toValue(data), (iconsCount, id) => {
    if (!iconsCount || iconsCount === 1) {
      return propsFn(id)
    }
    const iconCount = Math.min(iconsCount, counter.value)
    return propsFn(`${id}-${iconCount}`)
  }))

  const key = computed(() => `${id}-${counter.value}`)
  return [icons, key]
}
