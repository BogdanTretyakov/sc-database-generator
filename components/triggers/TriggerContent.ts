interface Props {
  type: string;
  version: string;
}

const SurMinusArmor = defineAsyncComponent(() => import('./SurMinusArmor.vue'));
const OzMainTrigger = defineAsyncComponent(() => import('./OzMainTrigger.vue'));

export default ({ type, version }: Props) => {
  const Component = (() => {
    switch (type) {
      case 'oz': {
        switch (version) {
          default:
            return OzMainTrigger;
        }
      }

      case 'w3c': {
        switch (version) {
          case '4.25':
          default:
            return SurMinusArmor;
        }
      }

      default:
        return null;
    }
  })();
  if (!Component) return;

  return h(Component);
};
