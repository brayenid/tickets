/* eslint-disable */

const CACHE_NAME = 'kl-static'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/script/packages/flowbite.min.js',
        '/script/packages/smoothscroll.min.js',
        '/script/packages/sweetalert2.all.min.js',
        '/script/packages/toastify-js.js',
        '/style/packages/flowbite.min.css',
        '/style/packages/toastify.min.css'
      ])
    })
  )
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            // Memeriksa cache mana yang ingin Anda hapus
            return cacheName !== CACHE_NAME
          })
          .map(function (cacheName) {
            // Menghapus cache yang tidak diperlukan
            return caches.delete(cacheName)
          })
      )
    })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'script' || event.request.destination === 'style') {
    console.log(event.request.destination)
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Jika ada sumber daya yang cocok di cache, kembalikan dari cache
        if (response) {
          return response
        }
        // Jika tidak ada sumber daya yang cocok di cache, ambil dari jaringan
        return fetch(event.request)
      })
    )
  }
})
