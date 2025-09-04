declare global {
  var dataLayer: any[];
}

declare module 'nuxt' {
  interface NuxtApp {
    $gtag: (action: GtagEvent) => void;
  }
}

interface GtagEvent {
  action: string;
  category: string;
  label: string;
  value: string;
}

export default defineNuxtPlugin((app) => {
  globalThis.dataLayer = globalThis.dataLayer ?? [];
  function gtag(...args: any[]) {
    dataLayer.push(arguments);
  }
  onNuxtReady(() => {
    globalThis.dataLayer = globalThis.dataLayer ?? [];

    gtag('js', new Date());
    gtag('config', 'G-KW4BMH97RN');
  });

  app.provide('$gtag', ({ action, category, label, value }: GtagEvent) =>
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  );
});
