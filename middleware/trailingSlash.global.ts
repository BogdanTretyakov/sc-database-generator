export default defineNuxtRouteMiddleware((to) => {
  if (to.path.endsWith('/')) return;
  const newPath = to.fullPath.replace(to.path, `${to.path}/`);
  navigateTo(
    {
      path: newPath,
      hash: to.hash,
      query: to.query,
    },
    { redirectCode: 301 }
  );
});
