import { lastVersion, versions } from '~/data';
import { storage } from '~/utils/storage';

export const useVersion = () => {
  const version = useState(
    'version',
    () => storage.get('version') ?? lastVersion
  );

  const switchVersion = (version: string) => {
    navigateTo({ params: { version } });
  };

  watch(
    () => version.value,
    (value, oldValue) => {
      if (value === oldValue) return;
      if (!(value in versions)) {
        version.value = oldValue;
        return;
      }
      storage.set('version', value);
      switchVersion(value);
    }
  );

  return version;
};
