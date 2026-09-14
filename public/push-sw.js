self.addEventListener('push', event => {
  let data = {}

  try {
    data = event.data
      ? event.data.json()
      : {}
  } catch {
    data = {
      title: 'SUREEPI',
      body: event.data
        ? event.data.text()
        : 'New notification',
    }
  }

  const title =
    data.title || 'SUREEPI'

  const options = {
    body:
      data.body
      || 'Infrastructure notification',

    icon:
      '/pwa-192x192-v2.png',

    badge:
      '/pwa-192x192-v2.png',

    tag:
      data.tag
      || 'sureepi-alert',

    renotify: true,

    data: {
      url:
        data.url
        || '/',
    },
  }

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  )
})


self.addEventListener(
  'notificationclick',
  event => {
    event.notification.close()

    const url =
      event.notification.data?.url
      || '/'

    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      }).then(windowClients => {

        for (const client of windowClients) {
          if ('focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
    )
  }
)
