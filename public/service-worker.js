// Handle push event
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || "Notification";
  const options = {
    body: data.message || "You have a new message.",
    icon: "/icons/icon_192.png",       // Make sure path is correct and cached
    badge: "/icons/icon_64.png",       // Optional badge icon
    vibrate: [100, 50, 100],           // Optional: adds vibration pattern for mobile
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const redirectUrl = event.notification.data?.url || "/"; // 👈 use `data.url` if passed

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(redirectUrl) && "focus" in client) {
          return client.focus();
        }
      }

      // If app isn't open, open it with target URL
      if (clients.openWindow) {
        return clients.openWindow(redirectUrl);
      }
    })
  );
});

// Optional: activate and claim right away
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Skip waiting phase to activate new service worker immediately
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim()); // Take control of uncontrolled clients
});
