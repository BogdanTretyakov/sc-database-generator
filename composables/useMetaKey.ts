export const useMetaKeyProvider = () => {
  const value = ref(false);
  provide('metaKeyValue', value);

  onNuxtReady(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        value.value = true;
      }
    };
    const handleKeyup = () => {
      value.value = false;
    };

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);

    onScopeDispose(() => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
    });
  });
};

export const useMetaKey = () => {
  return inject('metaKeyValue', ref(false));
};
