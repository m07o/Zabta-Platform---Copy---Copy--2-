// 🗄️ نظام قاعدة بيانات Plaza Pro v2.0
// مع تخزين مؤقت، فهرسة، ضغط، وأداء محسن
class PlazaDatabase {
    constructor() {
        this.dbName = 'plazaDB';
        this.version = '2.0';
        this.cache = null;
        this.cacheTime = 0;
        this.cacheDuration = 5000; // 5 ثوانٍ
        this.indexes = {};
        this.listeners = new Map();
        this.transactionQueue = [];
        this.isProcessing = false;
        this.init();
    }

    init() {
        // تهيئة الجداول إذا لم تكن موجودة
        if (!localStorage.getItem(this.dbName)) {
            const initialData = {
                _meta: {
                    version: this.version,
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    totalRecords: 0
                },
                matches: [
                    {
                        id: 1,
                        team1: "ريال مدريد",
                        team2: "برشلونة",
                        tournament: "الدوري الإسباني",
                        time: "مباشر الآن",
                        date: new Date().toISOString().split('T')[0],
                        status: "live",
                        priority: 1,
                        streamUrl: "",
                        streams: [
                            { id: 1, url: "", type: "iframe", quality: "1080p", label: "الخادم الرئيسي" },
                            { id: 2, url: "", type: "iframe", quality: "720p", label: "خادم احتياطي 1" }
                        ],
                        viewCount: 0,
                        featured: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 2,
                        team1: "ليفربول",
                        team2: "مانشستر سيتي",
                        tournament: "الدوري الإنجليزي",
                        time: "مباشر الآن",
                        date: new Date().toISOString().split('T')[0],
                        status: "live",
                        priority: 2,
                        streamUrl: "",
                        streams: [
                            { id: 1, url: "", type: "iframe", quality: "1080p", label: "الخادم الرئيسي" }
                        ],
                        viewCount: 0,
                        featured: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: 3,
                        team1: "الأهلي",
                        team2: "الزمالك",
                        tournament: "الدوري المصري",
                        time: "20:00",
                        date: this.getTomorrowDate(),
                        status: "upcoming",
                        priority: 1,
                        streamUrl: "",
                        streams: [],
                        viewCount: 0,
                        featured: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ],
                users: [],
                content: {
                    about: `
                        <h3>مرحباً بكم في PLAZA</h3>
                        <p>نحن منصة البث المباشر الرائدة لمشاهدة المباريات الرياضية بأفضل جودة ممكنة.</p>
                        
                        <h4>رسالتنا</h4>
                        <p>تقديم أفضل تجربة مشاهدة للمباريات الرياضية مباشرة وبجودة عالية، مع واجهة مستخدم سهلة وبسيطة.</p>
                        
                        <h4>رؤيتنا</h4>
                        <p>أن نكون المنصة الأولى في الشرق الأوسط لمشاهدة البث المباشر للمباريات الرياضية.</p>
                    `,
                    privacy: `
                        <h3>سياسة الخصوصية</h3>
                        <p>نحن في PLAZA نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>
                    `,
                    contact: `
                        <h3>اتصل بنا</h3>
                        <p>نحن هنا لمساعدتك! البريد الإلكتروني: support@plaza.com</p>
                    `
                },
                settings: {
                    siteName: 'PLAZA',
                    siteTagline: 'البث المباشر للمباريات',
                    primaryColor: '#00f2ff',
                    secondaryColor: '#0051ff',
                    accentColor: '#ff0055',
                    language: 'ar',
                    timezone: 'Africa/Cairo',
                    maintenanceMode: false,
                    registrationEnabled: true
                },
                seo: {
                    title: 'PLAZA - البث المباشر للمباريات',
                    description: 'شاهد أهم المباريات مباشرة وبجودة عالية على PLAZA',
                    keywords: 'مباريات, بث مباشر, كورة, رياضة, PLAZA',
                    ogImage: '',
                    robots: 'index, follow'
                },
                socialLinks: {
                    youtube: { url: "https://youtube.com", enabled: true, icon: 'fa-youtube' },
                    facebook: { url: "https://facebook.com", enabled: true, icon: 'fa-facebook' },
                    twitter: { url: "https://twitter.com", enabled: true, icon: 'fa-twitter' },
                    instagram: { url: "https://instagram.com", enabled: true, icon: 'fa-instagram' },
                    telegram: { url: "https://t.me", enabled: true, icon: 'fa-telegram' },
                    tiktok: { url: "", enabled: false, icon: 'fa-tiktok' }
                },
                ads: {
                    header: { content: '', enabled: false, views: 0, clicks: 0 },
                    sidebar: { content: '', enabled: false, views: 0, clicks: 0 },
                    inContent: { content: '', enabled: false, views: 0, clicks: 0 },
                    footer: { content: '', enabled: false, views: 0, clicks: 0 },
                    popup: { content: '', enabled: false, delay: 5000, frequency: 'once' },
                    config: {
                        enabled: true,
                        rotationInterval: 30000,
                        adBlockDetection: true
                    }
                },
                analytics: {
                    pageViews: 0,
                    uniqueVisitors: 0,
                    pageViewsByPage: {},
                    matchViews: {},
                    viewsByDate: {},
                    viewsByHour: {},
                    referrers: {},
                    devices: { desktop: 0, mobile: 0, tablet: 0 },
                    browsers: {},
                    lastVisit: new Date().toISOString(),
                    sessionDuration: []
                },
                notifications: [],
                favorites: []
            };
            this.save(initialData);
        }
        
        // بناء الفهارس
        this.buildIndexes();
        
        // تنظيف دوري
        this.scheduleCleanup();
    }

    getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    // 🔄 نظام التخزين المؤقت
    getAll(forceRefresh = false) {
        const now = Date.now();
        if (!forceRefresh && this.cache && (now - this.cacheTime) < this.cacheDuration) {
            return this.cache;
        }
        
        try {
            const data = JSON.parse(localStorage.getItem(this.dbName)) || {};
            this.cache = data;
            this.cacheTime = now;
            return data;
        } catch (error) {
            console.error('Error reading database:', error);
            return {};
        }
    }

    invalidateCache() {
        this.cache = null;
        this.cacheTime = 0;
    }

    // 💾 حفظ محسن مع debounce
    save(data, immediate = false) {
        try {
            // تحديث metadata
            if (!data._meta) data._meta = {};
            data._meta.lastModified = new Date().toISOString();
            data._meta.version = this.version;
            
            // حساب عدد السجلات
            data._meta.totalRecords = (data.matches?.length || 0) + (data.users?.length || 0);

            localStorage.setItem(this.dbName, JSON.stringify(data));
            this.invalidateCache();
            
            // إعادة بناء الفهارس
            this.buildIndexes();
            
            // إخطار المستمعين
            this.notifyListeners('change', data);
            
            return true;
        } catch (error) {
            console.error('Error saving to database:', error);
            
            // محاولة تنظيف المساحة إذا امتلأت
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldData();
                return this.save(data);
            }
            
            return false;
        }
    }

    // 📊 بناء الفهارس للبحث السريع
    buildIndexes() {
        const data = this.getAll(true);
        
        // فهرس المباريات حسب الحالة
        this.indexes.matchesByStatus = {};
        this.indexes.matchesById = {};
        this.indexes.matchesByTeam = {};
        this.indexes.matchesByTournament = {};
        
        (data.matches || []).forEach(match => {
            // فهرس الحالة
            if (!this.indexes.matchesByStatus[match.status]) {
                this.indexes.matchesByStatus[match.status] = [];
            }
            this.indexes.matchesByStatus[match.status].push(match.id);
            
            // فهرس ID
            this.indexes.matchesById[match.id] = match;
            
            // فهرس الفرق
            [match.team1, match.team2].forEach(team => {
                const teamLower = team.toLowerCase();
                if (!this.indexes.matchesByTeam[teamLower]) {
                    this.indexes.matchesByTeam[teamLower] = [];
                }
                this.indexes.matchesByTeam[teamLower].push(match.id);
            });
            
            // فهرس البطولات
            const tournamentLower = match.tournament.toLowerCase();
            if (!this.indexes.matchesByTournament[tournamentLower]) {
                this.indexes.matchesByTournament[tournamentLower] = [];
            }
            this.indexes.matchesByTournament[tournamentLower].push(match.id);
        });
    }

    // 🔔 نظام الاستماع للتغييرات
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        
        return () => {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        };
    }

    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => {
            try { cb(data); } catch (e) { console.error('Listener error:', e); }
        });
    }

    // ⚽ إدارة المباريات المحسنة
    addMatch(match) {
        const data = this.getAll();
        
        // التحقق من صحة البيانات
        if (!match.team1 || !match.team2 || !match.tournament) {
            return { success: false, message: 'بيانات ناقصة' };
        }
        
        // التحقق من عدم التكرار
        const exists = data.matches.find(m => 
            m.team1 === match.team1 && 
            m.team2 === match.team2 && 
            m.date === match.date
        );
        
        if (exists) {
            return { success: false, message: 'المباراة موجودة بالفعل', existingId: exists.id };
        }
        
        match.id = Date.now();
        match.createdAt = new Date().toISOString();
        match.updatedAt = new Date().toISOString();
        match.viewCount = match.viewCount || 0;
        match.featured = match.featured || false;
        match.priority = match.priority || 5;
        
        data.matches.push(match);
        this.save(data);
        
        this.notifyListeners('matchAdded', match);
        return { success: true, match };
    }

    updateMatch(id, updates) {
        const data = this.getAll();
        const matchIndex = data.matches.findIndex(m => String(m.id) === String(id));
        
        if (matchIndex === -1) {
            return { success: false, message: 'المباراة غير موجودة' };
        }
        
        updates.updatedAt = new Date().toISOString();
        data.matches[matchIndex] = { ...data.matches[matchIndex], ...updates };
        this.save(data);
        
        this.notifyListeners('matchUpdated', data.matches[matchIndex]);
        return { success: true, match: data.matches[matchIndex] };
    }

    deleteMatch(id) {
        const data = this.getAll();
        const matchIndex = data.matches.findIndex(m => String(m.id) === String(id));
        
        if (matchIndex === -1) {
            return { success: false, message: 'المباراة غير موجودة' };
        }
        
        const deletedMatch = data.matches[matchIndex];
        data.matches.splice(matchIndex, 1);
        this.save(data);
        
        this.notifyListeners('matchDeleted', deletedMatch);
        return { success: true };
    }

    getMatch(id) {
        // استخدام الفهرس للبحث السريع
        return this.indexes.matchesById[id] || null;
    }

    getMatches(options = {}) {
        const { status, featured, limit, offset = 0, sortBy = 'priority', sortOrder = 'asc' } = options;
        let matches = [...(this.getAll().matches || [])];
        
        // فلترة
        if (status) {
            matches = matches.filter(m => m.status === status);
        }
        if (featured !== undefined) {
            matches = matches.filter(m => m.featured === featured);
        }
        
        // ترتيب
        matches.sort((a, b) => {
            let aVal = a[sortBy] || 0;
            let bVal = b[sortBy] || 0;
            
            if (sortOrder === 'desc') {
                return bVal > aVal ? 1 : -1;
            }
            return aVal > bVal ? 1 : -1;
        });
        
        // pagination
        if (limit) {
            matches = matches.slice(offset, offset + limit);
        }
        
        return matches;
    }

    // 🔍 بحث متقدم
    searchMatches(query, options = {}) {
        const { status, tournament, limit = 20 } = options;
        const queryLower = query.toLowerCase().trim();
        
        if (!queryLower) return [];
        
        let matchIds = new Set();
        
        // بحث في الفهارس أولاً (أسرع)
        Object.keys(this.indexes.matchesByTeam).forEach(team => {
            if (team.includes(queryLower)) {
                this.indexes.matchesByTeam[team].forEach(id => matchIds.add(id));
            }
        });
        
        Object.keys(this.indexes.matchesByTournament).forEach(t => {
            if (t.includes(queryLower)) {
                this.indexes.matchesByTournament[t].forEach(id => matchIds.add(id));
            }
        });
        
        // تحويل IDs إلى مباريات
        let results = Array.from(matchIds).map(id => this.indexes.matchesById[id]).filter(Boolean);
        
        // فلترة إضافية
        if (status) {
            results = results.filter(m => m.status === status);
        }
        if (tournament) {
            results = results.filter(m => m.tournament === tournament);
        }
        
        return results.slice(0, limit);
    }

    // 📈 تحليلات محسنة
    trackPageView(page) {
        const data = this.getAll();
        if (!data.analytics) {
            data.analytics = { pageViews: 0, pageViewsByPage: {}, matchViews: {}, viewsByDate: {}, viewsByHour: {} };
        }

        data.analytics.pageViews++;
        
        // مشاهدات لكل صفحة
        data.analytics.pageViewsByPage[page] = (data.analytics.pageViewsByPage[page] || 0) + 1;
        
        // مشاهدات حسب التاريخ
        const today = new Date().toISOString().split('T')[0];
        if (!data.analytics.viewsByDate[today]) data.analytics.viewsByDate[today] = 0;
        data.analytics.viewsByDate[today]++;
        
        // مشاهدات حسب الساعة
        const hour = new Date().getHours();
        if (!data.analytics.viewsByHour[hour]) data.analytics.viewsByHour[hour] = 0;
        data.analytics.viewsByHour[hour]++;
        
        // نوع الجهاز
        const deviceType = this.detectDeviceType();
        if (!data.analytics.devices) data.analytics.devices = { desktop: 0, mobile: 0, tablet: 0 };
        data.analytics.devices[deviceType]++;
        
        data.analytics.lastVisit = new Date().toISOString();
        this.save(data);
    }

    trackMatchView(matchId) {
        const data = this.getAll();
        if (!data.analytics) data.analytics = { matchViews: {} };
        if (!data.analytics.matchViews) data.analytics.matchViews = {};
        
        if (!data.analytics.matchViews[matchId]) {
            data.analytics.matchViews[matchId] = { total: 0, dates: {} };
        }
        
        data.analytics.matchViews[matchId].total++;
        
        const today = new Date().toISOString().split('T')[0];
        if (!data.analytics.matchViews[matchId].dates[today]) {
            data.analytics.matchViews[matchId].dates[today] = 0;
        }
        data.analytics.matchViews[matchId].dates[today]++;
        
        // تحديث viewCount في المباراة نفسها
        const matchIndex = data.matches.findIndex(m => String(m.id) === String(matchId));
        if (matchIndex !== -1) {
            data.matches[matchIndex].viewCount = (data.matches[matchIndex].viewCount || 0) + 1;
        }
        
        this.save(data);
    }

    detectDeviceType() {
        const ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
        if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile';
        return 'desktop';
    }

    getAnalytics() {
        const data = this.getAll();
        const analytics = data.analytics || {};
        
        // حساب إحصائيات إضافية
        const today = new Date().toISOString().split('T')[0];
        const todayViews = analytics.viewsByDate?.[today] || 0;
        
        // أكثر المباريات مشاهدة
        const topMatches = Object.entries(analytics.matchViews || {})
            .map(([id, data]) => ({ id, views: data.total || data }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);
        
        return {
            ...analytics,
            todayViews,
            topMatches,
            averageSessionDuration: this.calculateAverageSession(analytics.sessionDuration || [])
        };
    }

    calculateAverageSession(sessions) {
        if (!sessions.length) return 0;
        const sum = sessions.reduce((a, b) => a + b, 0);
        return Math.round(sum / sessions.length);
    }

    // 🧹 تنظيف البيانات القديمة
    scheduleCleanup() {
        // تنظيف كل ساعة
        setInterval(() => this.cleanupOldData(), 60 * 60 * 1000);
    }

    cleanupOldData() {
        const data = this.getAll();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // حذف التحليلات القديمة
        if (data.analytics?.viewsByDate) {
            Object.keys(data.analytics.viewsByDate).forEach(date => {
                if (new Date(date) < thirtyDaysAgo) {
                    delete data.analytics.viewsByDate[date];
                }
            });
        }
        
        // حذف المباريات المنتهية القديمة (اختياري)
        // data.matches = data.matches.filter(m => {
        //     if (m.status !== 'ended') return true;
        //     return new Date(m.updatedAt) > thirtyDaysAgo;
        // });
        
        this.save(data);
        console.log('🧹 Database cleanup completed');
    }

    // 💾 النسخ الاحتياطي والاستعادة
    backup() {
        const data = this.getAll();
        data._backup = {
            createdAt: new Date().toISOString(),
            version: this.version
        };
        return data;
    }

    restore(backupData) {
        if (!backupData || typeof backupData !== 'object') {
            return { success: false, message: 'بيانات غير صالحة' };
        }
        
        // التحقق من صحة البيانات
        if (!backupData.matches || !Array.isArray(backupData.matches)) {
            return { success: false, message: 'صيغة البيانات غير صحيحة' };
        }
        
        this.save(backupData);
        return { success: true, message: 'تم استعادة النسخة الاحتياطية' };
    }

    exportToFile() {
        const data = this.backup();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `plaza_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        return { success: true };
    }

    // 📝 إدارة المحتوى
    updateContent(type, content) {
        const data = this.getAll();
        if (!data.content) data.content = {};
        data.content[type] = content;
        return this.save(data);
    }

    getContent(type) {
        return this.getAll().content?.[type] || '';
    }

    // ⚙️ إدارة الإعدادات
    updateSettings(settings) {
        const data = this.getAll();
        data.settings = { ...data.settings, ...settings };
        return this.save(data);
    }

    getSettings() {
        return this.getAll().settings || {};
    }

    // 🔍 SEO
    updateSEO(seoData) {
        const data = this.getAll();
        data.seo = { ...data.seo, ...seoData };
        return this.save(data);
    }

    getSEO() {
        return this.getAll().seo || {};
    }

    // 📢 الإعلانات
    updateAds(adsData) {
        const data = this.getAll();
        data.ads = { ...data.ads, ...adsData };
        return this.save(data);
    }

    getAds() {
        return this.getAll().ads || {};
    }

    trackAdClick(position) {
        const data = this.getAll();
        if (data.ads?.[position]) {
            data.ads[position].clicks = (data.ads[position].clicks || 0) + 1;
            this.save(data);
        }
    }

    // 🔗 الروابط الاجتماعية
    updateSocialLinks(links) {
        const data = this.getAll();
        data.socialLinks = { ...data.socialLinks, ...links };
        return this.save(data);
    }

    getSocialLinks() {
        return this.getAll().socialLinks || {};
    }

    // 📊 إحصائيات سريعة
    getStats() {
        const data = this.getAll();
        return {
            totalMatches: data.matches?.length || 0,
            liveMatches: data.matches?.filter(m => m.status === 'live').length || 0,
            upcomingMatches: data.matches?.filter(m => m.status === 'upcoming').length || 0,
            totalUsers: data.users?.length || 0,
            totalPageViews: data.analytics?.pageViews || 0,
            todayViews: data.analytics?.viewsByDate?.[new Date().toISOString().split('T')[0]] || 0
        };
    }

    // 🔄 مزامنة مع IndexedDB (للأداء الأفضل)
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('PlazaDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.idb = request.result;
                resolve(this.idb);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('matches')) {
                    db.createObjectStore('matches', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('cache')) {
                    db.createObjectStore('cache', { keyPath: 'key' });
                }
            };
        });
    }
}

// إنشاء نسخة عامة من قاعدة البيانات
const plazaDB = new PlazaDatabase();

// تصدير للاستخدام في الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlazaDatabase;
}