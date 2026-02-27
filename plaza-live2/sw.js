// 🚀 Plaza Service Worker v3.0
// PWA Support with Offline Caching

const CACHE_NAME = 'plaza-cache-v5'; // Updated after major fixes
const DYNAMIC_CACHE = 'plaza-dynamic-v3';

// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
    './',
    './index.html',
    './about.html',
    './contact.html',
    './privacy.html',
    './watch.html',
    './dashboard.html',
    './style.css',
    './script.js',
    './database.js',
    './auth.js',
    './modal.js',
    './ads.js',
    './scraper.js',
    './utils.js',
    './ui-components.js',
    './advanced-ui.js',
    './teams_data.json',
    './logo.png',
    './manifest.json',
    // External resources
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: Installed');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('❌ Cache error:', err);
            })
    );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
    console.log('⚡ Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
                        .map(name => {
                            console.log('🗑️ Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// استراتيجية الشبكة أولاً ثم التخزين المؤقت
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // تجاهل الطلبات غير HTTP/HTTPS
    if (!request.url.startsWith('http')) return;
    
    // تجاهل طلبات API الخارجية
    if (url.origin !== location.origin && !isAllowedOrigin(url.origin)) {
        return;
    }
    
    event.respondWith(
        // محاولة الشبكة أولاً
        fetch(request)
            .then(response => {
                // نسخ الاستجابة للتخزين المؤقت
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(request, responseClone));
                }
                return response;
            })
            .catch(() => {
                // عند فشل الشبكة، استخدم التخزين المؤقت
                return caches.match(request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // صفحة offline افتراضية للـ HTML
                        if (request.headers.get('accept')?.includes('text/html')) {
                            return caches.match('./index.html');
                        }
                        
                        // صورة افتراضية للصور
                        if (request.headers.get('accept')?.includes('image')) {
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#1a1a2e" width="200" height="200"/><text fill="#00f2ff" x="100" y="100" text-anchor="middle" font-size="14">PLAZA</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                    });
            })
    );
});

// الأصول المسموح بها
function isAllowedOrigin(origin) {
    const allowedOrigins = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com',
        'https://upload.wikimedia.org',
        'https://www.thesportsdb.com'
    ];
    return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

// رسائل من الصفحة الرئيسية
self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
});

// إشعارات Push (للمستقبل)
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    
    const options = {
        body: data.body || 'مباراة جديدة متاحة!',
        icon: './logo.png',
        badge: './logo.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || './'
        },
        actions: [
            { action: 'open', title: 'مشاهدة' },
            { action: 'close', title: 'إغلاق' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'PLAZA', options)
    );
});

// النقر على الإشعار
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// المزامنة في الخلفية
self.addEventListener('sync', event => {
    if (event.tag === 'sync-matches') {
        event.waitUntil(syncMatches());
    }
});

async function syncMatches() {
    try {
        // مزامنة البيانات عند الاتصال بالإنترنت
        console.log('🔄 Syncing matches...');
    } catch (error) {
        console.error('❌ Sync failed:', error);
    }
}

console.log('🎮 Plaza Service Worker loaded!');
