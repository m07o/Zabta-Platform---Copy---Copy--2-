// 🕷️ Plaza Scraper Pro v2.0 - نظام استخراج متقدم
class PlazaScraper {
    constructor() {
        this.sources = this.loadSources();
        this.config = this.loadConfig();
        this.isRunning = false;
        this.intervalId = null;
        this.logs = [];
        this.stats = {
            totalRuns: 0,
            totalMatchesAdded: 0,
            lastRun: null,
            errors: 0,
            successRate: 100
        };
        this.corsProxies = [
            'https://api.allorigins.win/get?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest='
        ];
        this.currentProxyIndex = 0;
        this.retryAttempts = 3;
        this.retryDelay = 2000;
        this.loadStats();
    }

    // 📦 تحميل المصادر
    loadSources() {
        const stored = localStorage.getItem('plaza_scraper_sources');
        return stored ? JSON.parse(stored) : [
            {
                id: 1,
                name: 'Yalla Shoot',
                url: 'https://www.yallashoot.com/live',
                enabled: true,
                priority: 1,
                lastSuccess: null,
                failCount: 0,
                selectors: {
                    matchItem: '.match-card, .match-item, .liItem',
                    team1: '.team-home, .team1, .teamA',
                    team2: '.team-away, .team2, .teamB',
                    time: '.match-time, .time, .kickoff',
                    tournament: '.league, .competition, .tournament',
                    status: '.status, .live-badge',
                    link: 'a[href*="match"], a[href*="live"]'
                }
            },
            {
                id: 2,
                name: 'Kooora',
                url: 'https://www.kooora.com',
                enabled: false,
                priority: 2,
                lastSuccess: null,
                failCount: 0,
                selectors: {
                    matchItem: '.matchCard',
                    team1: '.homeTeam',
                    team2: '.awayTeam',
                    time: '.matchTime',
                    tournament: '.compName',
                    status: '.matchStatus',
                    link: 'a.matchLink'
                }
            },
            {
                id: 3,
                name: 'FilGoal',
                url: 'https://www.filgoal.com/matches',
                enabled: false,
                priority: 3,
                lastSuccess: null,
                failCount: 0,
                selectors: {
                    matchItem: '.match-block',
                    team1: '.home-team',
                    team2: '.away-team',
                    time: '.match-time',
                    tournament: '.comp-name',
                    status: '.match-status',
                    link: 'a.match-link'
                }
            }
        ];
    }

    // ⚙️ تحميل الإعدادات
    loadConfig() {
        const stored = localStorage.getItem('plaza_scraper_config');
        return stored ? JSON.parse(stored) : {
            enabled: false,
            interval: 30,
            autoRetry: true,
            maxRetries: 3,
            timeout: 15000,
            mergeStreams: true,
            notifyOnNew: true,
            logLevel: 'info'
        };
    }

    loadStats() {
        const stored = localStorage.getItem('plaza_scraper_stats');
        if (stored) {
            this.stats = { ...this.stats, ...JSON.parse(stored) };
        }
    }

    saveSettings() {
        localStorage.setItem('plaza_scraper_sources', JSON.stringify(this.sources));
        localStorage.setItem('plaza_scraper_config', JSON.stringify(this.config));
        localStorage.setItem('plaza_scraper_stats', JSON.stringify(this.stats));
    }

    // 📝 نظام السجلات المحسن
    log(message, type = 'info') {
        if (this.config.logLevel === 'error' && type !== 'error') return;
        
        const timestamp = new Date().toLocaleTimeString('ar-EG');
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            debug: '🔧'
        };
        
        const logEntry = { 
            time: timestamp, 
            message, 
            type,
            icon: icons[type] || 'ℹ️'
        };
        
        this.logs.unshift(logEntry);
        if (this.logs.length > 200) this.logs.pop();
        
        // Console output
        const consoleMethod = type === 'error' ? console.error : 
                             type === 'warning' ? console.warn : console.log;
        consoleMethod(`[Scraper ${timestamp}] ${message}`);
        
        this.updateLogUI();
        this.dispatchEvent('log', logEntry);
    }

    updateLogUI() {
        const logContainer = document.getElementById('scraperLogs');
        if (!logContainer) return;

        logContainer.innerHTML = this.logs.map(log => `
            <div class="log-entry log-${log.type}">
                <span class="log-icon">${log.icon}</span>
                <span class="log-time">[${log.time}]</span>
                <span class="log-message">${log.message}</span>
            </div>
        `).join('');
        
        // Auto-scroll to top
        logContainer.scrollTop = 0;
    }

    // 🎯 Events
    dispatchEvent(eventName, data) {
        window.dispatchEvent(new CustomEvent(`scraper:${eventName}`, { detail: data }));
    }

    // 🌐 جلب البيانات مع Retry و Proxy Rotation
    async fetchWithRetry(url, retries = this.retryAttempts) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const proxy = this.corsProxies[this.currentProxyIndex];
                const proxyUrl = proxy + encodeURIComponent(url);
                
                this.log(`محاولة ${attempt}/${retries} - استخدام Proxy ${this.currentProxyIndex + 1}`, 'debug');
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                
                const response = await fetch(proxyUrl, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml',
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!data.contents && !data.body) {
                    throw new Error('No content in response');
                }
                
                return data.contents || data.body || data;
                
            } catch (error) {
                this.log(`فشلت المحاولة ${attempt}: ${error.message}`, 'warning');
                
                // تبديل الـ Proxy
                this.currentProxyIndex = (this.currentProxyIndex + 1) % this.corsProxies.length;
                
                if (attempt < retries) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        
        return null;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 🔍 استخراج البيانات من HTML
    parseMatches(html, source) {
        this.log(`تحليل البيانات من ${source.name}...`);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const matches = [];
        const selectors = source.selectors;

        try {
            // محاولة عدة selectors
            const matchItems = doc.querySelectorAll(selectors.matchItem);
            
            if (matchItems.length > 0) {
                this.log(`وُجد ${matchItems.length} عنصر مباراة`, 'info');
                
                matchItems.forEach((el, index) => {
                    try {
                        const match = this.extractMatchData(el, selectors, source);
                        if (match && match.team1 && match.team2) {
                            matches.push(match);
                        }
                    } catch (e) {
                        this.log(`خطأ في تحليل المباراة ${index + 1}: ${e.message}`, 'debug');
                    }
                });
            }

            // إذا لم نجد شيء، جرب selectors بديلة
            if (matches.length === 0) {
                const altMatches = this.tryAlternativeSelectors(doc, source);
                matches.push(...altMatches);
            }

            // Demo fallback
            if (matches.length === 0 && source.name.includes('Demo')) {
                this.log(`لا توجد مباريات - إضافة بيانات تجريبية`, 'warning');
                matches.push(...this.getDemoMatches(source));
            }

        } catch (error) {
            this.log(`خطأ في التحليل: ${error.message}`, 'error');
            this.stats.errors++;
        }

        return matches;
    }

    extractMatchData(element, selectors, source) {
        const getText = (selector) => {
            const el = element.querySelector(selector);
            return el ? el.textContent.trim() : '';
        };

        const getLink = (selector) => {
            const el = element.querySelector(selector);
            return el ? el.getAttribute('href') : '';
        };

        const team1 = getText(selectors.team1);
        const team2 = getText(selectors.team2);
        const time = getText(selectors.time);
        const tournament = getText(selectors.tournament);
        const status = getText(selectors.status);
        const link = getLink(selectors.link);

        if (!team1 || !team2) return null;

        return {
            team1,
            team2,
            time: time || 'غير محدد',
            tournament: tournament || 'غير محدد',
            status: this.parseStatus(status),
            source: source.name,
            sourceUrl: link ? new URL(link, source.url).href : source.url,
            extractedAt: new Date().toISOString()
        };
    }

    parseStatus(statusText) {
        const text = statusText.toLowerCase();
        if (text.includes('live') || text.includes('مباشر') || text.includes('جاري')) {
            return 'live';
        }
        if (text.includes('end') || text.includes('انتهت') || text.includes('finished')) {
            return 'ended';
        }
        return 'upcoming';
    }

    tryAlternativeSelectors(doc, source) {
        const matches = [];
        const altSelectors = [
            { item: '.match', team1: '.home', team2: '.away' },
            { item: '[data-match]', team1: '[data-home]', team2: '[data-away]' },
            { item: 'tr.match-row', team1: 'td:nth-child(1)', team2: 'td:nth-child(3)' }
        ];

        for (const alt of altSelectors) {
            const items = doc.querySelectorAll(alt.item);
            if (items.length > 0) {
                this.log(`وُجد ${items.length} باستخدام selector بديل`, 'info');
                items.forEach(el => {
                    const team1 = el.querySelector(alt.team1)?.textContent.trim();
                    const team2 = el.querySelector(alt.team2)?.textContent.trim();
                    if (team1 && team2) {
                        matches.push({
                            team1, team2,
                            time: 'غير محدد',
                            tournament: 'غير محدد',
                            status: 'upcoming',
                            source: source.name
                        });
                    }
                });
                break;
            }
        }

        return matches;
    }

    getDemoMatches(source) {
        const demoMatches = [
            { team1: 'Real Madrid', team2: 'Barcelona', tournament: 'La Liga', time: '22:00', status: 'upcoming' },
            { team1: 'Liverpool', team2: 'Manchester City', tournament: 'Premier League', time: '20:00', status: 'live' },
            { team1: 'الأهلي', team2: 'الزمالك', tournament: 'الدوري المصري', time: '21:00', status: 'upcoming' },
            { team1: 'الهلال', team2: 'النصر', tournament: 'الدوري السعودي', time: '20:30', status: 'upcoming' }
        ];

        return demoMatches.map(m => ({
            ...m,
            source: source.name,
            extractedAt: new Date().toISOString()
        }));
    }

    // 🔄 دمج المباريات مع التحقق من التكرار
    mergeMatches(newMatches) {
        let addedCount = 0;
        let updatedCount = 0;
        const currentMatches = plazaDB.getMatches() || [];

        newMatches.forEach(match => {
            // تطبيع أسماء الفرق للمقارنة
            const normalizedTeam1 = this.normalizeTeamName(match.team1);
            const normalizedTeam2 = this.normalizeTeamName(match.team2);

            const existingIndex = currentMatches.findIndex(m => {
                const t1 = this.normalizeTeamName(m.team1);
                const t2 = this.normalizeTeamName(m.team2);
                return (t1 === normalizedTeam1 && t2 === normalizedTeam2) ||
                       (t1 === normalizedTeam2 && t2 === normalizedTeam1);
            });

            if (existingIndex === -1) {
                // إضافة مباراة جديدة
                const matchData = {
                    ...match,
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    streams: [],
                    viewCount: 0,
                    featured: false,
                    createdAt: new Date().toISOString()
                };
                
                const result = plazaDB.addMatch(matchData);
                if (result.success) {
                    addedCount++;
                    this.log(`✅ أُضيفت: ${match.team1} vs ${match.team2}`, 'success');
                }
            } else if (this.config.mergeStreams) {
                // تحديث المباراة الموجودة إذا تغيرت الحالة
                const existing = currentMatches[existingIndex];
                if (existing.status !== match.status) {
                    plazaDB.updateMatch(existing.id, { status: match.status });
                    updatedCount++;
                    this.log(`🔄 تحديث حالة: ${match.team1} vs ${match.team2}`, 'info');
                }
            }
        });

        return { added: addedCount, updated: updatedCount };
    }

    normalizeTeamName(name) {
        return name
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/fc|sc|cf|club/gi, '')
            .trim();
    }

    // 🚀 تشغيل الاستخراج
    async run(sourceId = null) {
        if (this.isRunning) {
            this.log('الاستخراج قيد التشغيل بالفعل', 'warning');
            return;
        }

        this.isRunning = true;
        this.stats.totalRuns++;
        this.stats.lastRun = new Date().toISOString();
        
        this.log('═══════════════════════════════', 'info');
        this.log('🚀 بدء عملية الاستخراج...', 'success');
        this.dispatchEvent('start', {});

        const sourcesToRun = sourceId
            ? this.sources.filter(s => s.id === sourceId)
            : this.sources.filter(s => s.enabled).sort((a, b) => a.priority - b.priority);

        if (sourcesToRun.length === 0) {
            this.log('لا توجد مصادر نشطة!', 'warning');
            this.isRunning = false;
            return;
        }

        let totalAdded = 0;
        let totalUpdated = 0;
        let successfulSources = 0;

        for (const source of sourcesToRun) {
            this.log(`📡 جاري الاتصال بـ ${source.name}...`, 'info');
            
            const html = await this.fetchWithRetry(source.url);
            
            if (html) {
                source.lastSuccess = new Date().toISOString();
                source.failCount = 0;
                successfulSources++;
                
                const matches = this.parseMatches(html, source);
                
                if (matches.length > 0) {
                    const result = this.mergeMatches(matches);
                    totalAdded += result.added;
                    totalUpdated += result.updated;
                    this.log(`📊 ${source.name}: ${matches.length} مباراة، ${result.added} جديدة، ${result.updated} محدثة`, 'info');
                } else {
                    this.log(`${source.name}: لم يتم العثور على مباريات`, 'warning');
                }
            } else {
                source.failCount = (source.failCount || 0) + 1;
                this.log(`فشل الاتصال بـ ${source.name} (${source.failCount} مرات)`, 'error');
                this.stats.errors++;
            }
        }

        // تحديث الإحصائيات
        this.stats.totalMatchesAdded += totalAdded;
        this.stats.successRate = Math.round((successfulSources / sourcesToRun.length) * 100);
        this.saveSettings();

        // ملخص
        this.log('═══════════════════════════════', 'info');
        this.log(`✨ اكتملت العملية: ${totalAdded} مباراة جديدة، ${totalUpdated} تحديث`, 'success');
        this.log(`📈 معدل النجاح: ${this.stats.successRate}%`, 'info');

        // تحديث الواجهة
        if (totalAdded > 0 && typeof loadMatchesList === 'function') {
            loadMatchesList();
        }

        // إشعار
        if (totalAdded > 0 && this.config.notifyOnNew) {
            this.showNotification(`تمت إضافة ${totalAdded} مباراة جديدة!`);
        }

        this.dispatchEvent('complete', { added: totalAdded, updated: totalUpdated });
        this.isRunning = false;
    }

    // 🔔 إشعارات
    showNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('PLAZA Scraper', {
                body: message,
                icon: 'logo.png'
            });
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    // ⏰ الجدولة
    startScheduler() {
        this.stopScheduler();
        
        if (this.config.enabled && this.config.interval > 0) {
            this.log(`⏰ بدء الجدولة - كل ${this.config.interval} دقيقة`, 'success');
            this.intervalId = setInterval(() => {
                this.run();
            }, this.config.interval * 60 * 1000);
            
            // تشغيل فوري
            this.run();
        }
    }

    stopScheduler() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.log('⏹️ تم إيقاف الجدولة', 'warning');
        }
    }

    toggleScheduler() {
        this.config.enabled = !this.config.enabled;
        if (this.config.enabled) {
            this.startScheduler();
        } else {
            this.stopScheduler();
        }
        this.saveSettings();
        return this.config.enabled;
    }

    // 📊 الإحصائيات
    getStats() {
        return {
            ...this.stats,
            isRunning: this.isRunning,
            schedulerEnabled: this.config.enabled,
            activeSources: this.sources.filter(s => s.enabled).length,
            totalSources: this.sources.length,
            logsCount: this.logs.length
        };
    }

    // ➕ إدارة المصادر
    addSource(source) {
        const newSource = {
            id: Date.now(),
            name: source.name,
            url: source.url,
            enabled: true,
            priority: this.sources.length + 1,
            lastSuccess: null,
            failCount: 0,
            selectors: source.selectors || {
                matchItem: '.match-item',
                team1: '.team1',
                team2: '.team2',
                time: '.time',
                tournament: '.tournament',
                status: '.status',
                link: 'a'
            }
        };
        
        this.sources.push(newSource);
        this.saveSettings();
        this.log(`➕ أُضيف مصدر جديد: ${source.name}`, 'success');
        return newSource;
    }

    updateSource(id, updates) {
        const index = this.sources.findIndex(s => s.id === id);
        if (index !== -1) {
            this.sources[index] = { ...this.sources[index], ...updates };
            this.saveSettings();
            return true;
        }
        return false;
    }

    deleteSource(id) {
        const index = this.sources.findIndex(s => s.id === id);
        if (index !== -1) {
            const deleted = this.sources.splice(index, 1)[0];
            this.saveSettings();
            this.log(`🗑️ حُذف مصدر: ${deleted.name}`, 'warning');
            return true;
        }
        return false;
    }

    toggleSource(id) {
        const source = this.sources.find(s => s.id === id);
        if (source) {
            source.enabled = !source.enabled;
            this.saveSettings();
            return source.enabled;
        }
        return null;
    }

    // 🧹 تنظيف
    clearLogs() {
        this.logs = [];
        this.updateLogUI();
        this.log('تم مسح السجلات', 'info');
    }

    resetStats() {
        this.stats = {
            totalRuns: 0,
            totalMatchesAdded: 0,
            lastRun: null,
            errors: 0,
            successRate: 100
        };
        this.saveSettings();
        this.log('تم إعادة تعيين الإحصائيات', 'info');
    }

    // 📤 تصدير/استيراد
    exportConfig() {
        return {
            sources: this.sources,
            config: this.config,
            stats: this.stats,
            exportedAt: new Date().toISOString()
        };
    }

    importConfig(data) {
        if (data.sources) this.sources = data.sources;
        if (data.config) this.config = { ...this.config, ...data.config };
        this.saveSettings();
        this.log('تم استيراد الإعدادات', 'success');
    }
}

// إنشاء النسخة العامة
const plazaScraper = new PlazaScraper();

// CSS للسجلات (moved to style.css)
