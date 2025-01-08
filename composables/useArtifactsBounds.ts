import debounce from 'lodash/debounce';

interface Props {
  combineMap: MaybeRef<Record<string, string[][]>>;
  stroke?: number;
  colorsCount: MaybeRef<number>;
  excludeItems?: MaybeRef<string[]>;
}

const getElement = (el: Element | ComponentPublicInstance | null) => {
  if (!el) return null;
  if ('$el' in el) return el.$el as HTMLElement;
  return el as HTMLElement;
};

export const useArtifactsBounds = ({
  combineMap,
  colorsCount,
  stroke = 4,
  excludeItems,
}: Props) => {
  const items = reactive<Record<string, HTMLElement | null>>({});
  const bounds = reactive<Record<string, HTMLElement | null>>({});
  const container = ref<HTMLElement | null>(null);
  const observer = shallowRef<ResizeObserver | null>();

  const colors = computed(() =>
    Array.from(
      { length: toValue(colorsCount) },
      (_, idx) => `hsl(${(360 / toValue(colorsCount)) * idx} 30% 40%)`
    )
  );

  const setPath = debounce(() => {
    const pathMap = toValue(combineMap);
    const nodes = toValue(bounds);
    const exclude = toValue(excludeItems);

    const nodeBounds = mapObject(toValue(items), (el) => {
      if (!el) return;
      return {
        x: el.offsetLeft,
        y: el.offsetTop,
        w: el.offsetWidth,
        h: el.offsetHeight,
      };
    });

    const yOffsetMap = Object.fromEntries(
      Object.values(nodeBounds)
        .filter(isNotNil)
        .map(({ y }) => [y, stroke * 3])
    );
    const maxElHeight = Math.max(
      ...Object.values(nodeBounds)
        .filter(isNotNil)
        .map(({ h }) => h)
    );

    const yDiff = Object.values(yOffsetMap).reduce((acc, val, idx, arr) => {
      if (!idx) {
        return acc;
      }
      return Math.min(
        Math.abs(Number(val) - Number(arr[idx - 1]) - maxElHeight),
        acc
      );
    }, 10000);

    const getYOffset = (y: number) => {
      const oldVal = yOffsetMap[y];
      let newVal = oldVal + stroke * 3;
      if (newVal > yDiff - stroke) newVal = stroke;
      yOffsetMap[y] = newVal;
      return newVal;
    };

    const xOffsetMap: Record<string, number> = {};
    const minElWidth = Math.min(
      ...Object.values(nodeBounds)
        .filter(isNotNil)
        .map(({ w }) => w)
    );
    const getXOffset = (nodeId: string) => {
      if (!(nodeId in xOffsetMap)) {
        xOffsetMap[nodeId] = minElWidth / 4;
        return xOffsetMap[nodeId];
      }
      let newValue = xOffsetMap[nodeId] + minElWidth / 4;
      if (newValue > minElWidth) newValue = minElWidth / 4;
      xOffsetMap[nodeId] = newValue;
      return newValue;
    };

    const colorsMap: Record<string, number> = {};
    const getColor = (y: number) => {
      if (!(y in colorsMap)) {
        colorsMap[y] = 0;
        return colors.value[0];
      }
      let newIdx = colorsMap[y] + 1;
      if (newIdx > colors.value.length - 1) newIdx = 0;
      colorsMap[y] = newIdx;
      return colors.value[newIdx];
    };

    let zIndex = -1;

    for (const parentNodeId in nodeBounds) {
      if (exclude?.includes(parentNodeId)) continue;
      zIndex--;
      const parentNodeBound = nodeBounds[parentNodeId];
      if (!parentNodeBound) continue;
      const { x: px, y: py, w: pw, h: ph } = parentNodeBound;
      const nodeColor = getColor(py);

      const inNode = nodes[`${parentNodeId}-connect-inner`];
      if (!inNode) continue;

      const bridgeNodes = Object.fromEntries(
        pathMap[parentNodeId]
          .flat()
          .map((id) => [id, nodes[`${parentNodeId}-connect-${id}`]])
      );
      const bridgeNodesArr = Object.values(bridgeNodes).filter(isNotNil);
      if (bridgeNodesArr.length !== pathMap[parentNodeId].flat().length)
        continue;

      const childConnectNodes = Object.fromEntries(
        pathMap[parentNodeId]
          .flat()
          .map((id) => [id, nodes[`${parentNodeId}-child-${id}`]])
      );

      const childConnectNodesArr =
        Object.values(childConnectNodes).filter(isNotNil);

      if (childConnectNodesArr.length !== pathMap[parentNodeId].flat().length)
        continue;

      const allNodes = childConnectNodesArr
        .concat(bridgeNodesArr)
        .concat(inNode);

      allNodes.forEach(({ style }) => {
        style.borderWidth = `${stroke / 2}px`;
        style.borderColor = nodeColor;
        style.zIndex = `${zIndex}`;
      });
      const offsetHeight = py + ph + stroke + getYOffset(py);

      bridgeNodesArr.forEach(({ style }) => {
        style.top = `${offsetHeight}px`;
      });

      const inNodeConnectX = px + pw / 2 - stroke / 2;

      inNode.style.left = `${inNodeConnectX}px`;
      inNode.style.top = `${py + ph}px`;
      inNode.style.height = `${offsetHeight - py - ph}px`;

      for (const childId in childConnectNodes) {
        if (exclude?.includes(childId)) continue;
        const node = childConnectNodes[childId];
        const bridgeNode = bridgeNodes[childId];
        const childNodeBounds = nodeBounds[childId];
        if (!childNodeBounds || !node || !bridgeNode) continue;
        const { x: cx, y: cy, w: cw } = childNodeBounds;
        const connectX =
          px === cx ? cx + cw / 2 - stroke / 2 : cx + getXOffset(childId);
        node.style.left = `${connectX}px`;
        node.style.top = `${offsetHeight + stroke / 2}px`;
        node.style.height = `${cy - offsetHeight}px`;

        const bridgeX = Math.min(inNodeConnectX, connectX);
        bridgeNode.style.left = `${bridgeX}px`;
        bridgeNode.style.width = `${
          Math.abs(inNodeConnectX - connectX) + stroke * 0.75
        }px`;
      }
    }
  }, 200);

  onNuxtReady(() => {
    observer.value = new ResizeObserver(() => {
      setPath();
    });
    if (!container.value) return;
    observer.value.observe(container.value);
    const item = Object.values(items).filter(isNotNil).at(0);
    if (item) {
      observer.value?.observe(item);
    }
  });

  watch(container, (val, oldVal) => {
    if (oldVal) {
      observer.value?.unobserve(oldVal);
    }
    if (val) {
      observer.value?.observe(val);
      const item = Object.values(items).filter(isNotNil).at(0);
      if (item) {
        observer.value?.observe(item);
      }
      nextTick(() => setPath.flush());
    }
  });

  onDeactivated(() => {
    observer.value?.disconnect();
  });

  const containerRef = (el: Element | ComponentPublicInstance | null) => {
    container.value = getElement(el);
  };

  const itemRef =
    (id: string) => (el: Element | ComponentPublicInstance | null) => {
      items[id] = getElement(el);
    };

  const boundRef =
    (parentId: string, type: 'connect' | 'child', id: string) =>
    (el: Element | ComponentPublicInstance | null) => {
      bounds[`${parentId}-${type}-${id}`] = getElement(el);
    };

  return { containerRef, itemRef, boundRef };
};
