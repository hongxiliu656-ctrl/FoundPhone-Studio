// Retire previous offline worker so Safari and WeChat always load the same live site.
self.addEventListener("install", event => { self.skipWaiting(); });
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(name => caches.delete(name)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({type:"window"});
    await Promise.all(clients.map(client => client.navigate(client.url).catch(() => {})));
  })());
});
