const CACHE_NAME = 'bookswap-v1'
const STATIC_CACHE = 'bookswap-static-v1'
const DYNAMIC_CACHE = 'bookswap-dynamic-v1'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html', // We'll create this
  '/static/css/app.css',
  '/static/js/app.js'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Handle API requests differently
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses for offline access
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached API response if network fails
          return caches.match(request)
        })
    )
    return
  }

  // Handle page requests
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse
        }
        
        return fetch(request)
          .then(response => {
            // Only cache successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            const responseToCache = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseToCache)
              })
            
            return response
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html')
            }
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'book-listing') {
    event.waitUntil(syncBookListings())
  }
  
  if (event.tag === 'message-send') {
    event.waitUntil(syncMessages())
  }
})

// Push notifications for new messages/exchanges
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'New activity in BookSwap!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('BookSwap', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard/messages')
    )
  }
})

// Sync functions
async function syncBookListings() {
  try {
    // Get pending book listings from IndexedDB
    const pendingListings = await getPendingBookListings()
    
    for (const listing of pendingListings) {
      try {
        await submitBookListing(listing)
        await removePendingBookListing(listing.id)
      } catch (error) {
        console.error('Failed to sync book listing:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

async function syncMessages() {
  try {
    // Get pending messages from IndexedDB
    const pendingMessages = await getPendingMessages()
    
    for (const message of pendingMessages) {
      try {
        await sendMessage(message)
        await removePendingMessage(message.id)
      } catch (error) {
        console.error('Failed to sync message:', error)
      }
    }
  } catch (error) {
    console.error('Message sync failed:', error)
  }
}

// IndexedDB helper functions (simplified)
async function getPendingBookListings() {
  // Implementation for getting pending listings from IndexedDB
  return []
}

async function getPendingMessages() {
  // Implementation for getting pending messages from IndexedDB
  return []
}

async function submitBookListing(listing) {
  // Implementation for submitting book listing to API
}

async function sendMessage(message) {
  // Implementation for sending message to API
}

async function removePendingBookListing(id) {
  // Implementation for removing from IndexedDB
}

async function removePendingMessage(id) {
  // Implementation for removing from IndexedDB
}