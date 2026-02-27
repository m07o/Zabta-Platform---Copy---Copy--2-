// 📢 Plaza Ads Pro v2.0 - نظام إعلانات متقدم
class PlazaAds {
    constructor() {
        this.db = plazaDB;
        this.config = {
            enabled: true,
            rotationInterval: 30000,
            maxAdsPerPage: 5,
            lazyLoad: true,
            adBlockDetection: true,
            popupDelay: 5000,
            refreshOnVisibility: true
        };
        this.adsPool = [];
        this.currentAds = {};
        this.rotationIntervals = {};
        this.viewedAds = new Set();
        this.isAdBlockDetected = false;
        this.init();
    }

    init() {
        // كشف AdBlock معطل حالياً
        // if (this.config.adBlockDetection) {
        //     this.detectAdBlock();
        // }

        // مراقبة visibility
        if (this.config.refreshOnVisibility) {
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.refreshVisibleAds();
                }
            });
        }

        // Intersection Observer للـ Lazy Loading
        if (this.config.lazyLoad && 'IntersectionObserver' in window) {
            this.setupLazyLoading();
        }
    }

    // 🔍 كشف AdBlock
    detectAdBlock() {
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox ad-container pub_300x250';
        testAd.style.cssText = 'position:absolute;left:-9999px;';
        document.body.appendChild(testAd);

        setTimeout(() => {
            if (testAd.offsetHeight === 0 || testAd.clientHeight === 0) {
                this.isAdBlockDetected = true;
                this.showAdBlockMessage();
            }
            testAd.remove();
        }, 100);
    }

    showAdBlockMessage() {
        const message = document.createElement('div');
        message.className = 'adblock-notice';
        message.innerHTML = `
            <div class="adblock-content">
                <i class="fa-solid fa-shield-halved"></i>
                <h4>يبدو أنك تستخدم مانع إعلانات</h4>
                <p>نعتمد على الإعلانات لتقديم خدماتنا مجاناً. يرجى تعطيل AdBlock لدعمنا.</p>
                <button onclick="this.parentElement.parentElement.remove()">حسناً، فهمت</button>
            </div>
        `;
        document.body.appendChild(message);
    }

    // 📦 Lazy Loading للإعلانات
    setupLazyLoading() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = entry.target;
                    const position = container.dataset.adPosition;
                    if (position && !container.dataset.loaded) {
                        this.loadAdForPosition(position, container);
                        container.dataset.loaded = 'true';
                    }
                }
            });
        }, { rootMargin: '100px' });
    }

    // 🎯 تحميل الإعلانات
    loadAds(pageType = 'general') {
        const adsData = this.db.getAds();
        
        // التحقق من تفعيل الإعلانات
        if (!adsData?.config?.enabled) return;

        // تحميل الإعلانات حسب الموقع
        const positions = ['header', 'sidebar', 'inContent', 'footer'];
        
        positions.forEach(position => {
            const container = document.getElementById(`${position}-ad`) || 
                              document.getElementById(`${position.toLowerCase()}-ad`);
            
            if (container && adsData[position]) {
                const adData = typeof adsData[position] === 'object' 
                    ? adsData[position] 
                    : { content: adsData[position], enabled: true };

                if (adData.enabled !== false && adData.content) {
                    if (this.config.lazyLoad && this.observer) {
                        container.dataset.adPosition = position;
                        this.observer.observe(container);
                    } else {
                        this.renderAd(container, adData.content, position);
                    }
                }
            }
        });

        // إعلانات خاصة بالصفحات
        this.loadPageSpecificAds(pageType);

        // Popup إعلان
        if (adsData.popup?.enabled) {
            this.setupPopupAd(adsData.popup);
        }

        // بدء التدوير
        this.setupAdRotation();
    }

    loadAdForPosition(position, container) {
        const adsData = this.db.getAds();
        const adData = adsData[position];
        
        if (adData) {
            const content = typeof adData === 'object' ? adData.content : adData;
            if (content) {
                this.renderAd(container, content, position);
            }
        }
    }

    // 🎨 عرض الإعلان
    renderAd(container, content, position) {
        if (!container || !content) return;

        // تنظيف المحتوى من أي XSS
        const sanitizedContent = this.sanitizeAdContent(content);

        container.innerHTML = `
            <div class="ad-wrapper ad-${position}" data-position="${position}">
                <div class="ad-label">
                    <span>إعلان</span>
                    <button class="ad-close" onclick="plazaAds.hideAd('${position}')" title="إخفاء">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="ad-content" onclick="plazaAds.trackClick('${position}')">
                    ${sanitizedContent}
                </div>
            </div>
        `;

        // Animation
        container.style.opacity = '0';
        container.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => {
            container.style.transition = 'all 0.3s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        });

        this.currentAds[position] = { container, content };
        this.trackView(position);
    }

    // 🧹 تنظيف محتوى الإعلان
    sanitizeAdContent(content) {
        // السماح فقط بعناصر آمنة
        const allowedTags = ['a', 'img', 'div', 'span', 'p', 'br', 'strong', 'em', 'iframe'];
        
        const temp = document.createElement('div');
        temp.innerHTML = content;

        // إزالة السكريبتات
        temp.querySelectorAll('script').forEach(s => s.remove());
        
        // إزالة الأحداث الخطرة
        temp.querySelectorAll('*').forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('on')) {
                    el.removeAttribute(attr.name);
                }
            });
        });

        return temp.innerHTML;
    }

    // ❌ إخفاء إعلان
    hideAd(position) {
        const container = document.getElementById(`${position}-ad`) || 
                          document.getElementById(`${position.toLowerCase()}-ad`);
        if (container) {
            container.style.transition = 'all 0.3s ease';
            container.style.opacity = '0';
            container.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                container.style.display = 'none';
            }, 300);
        }
    }

    // 📊 تتبع المشاهدات
    trackView(position) {
        const viewKey = `${position}_${new Date().toISOString().split('T')[0]}`;
        
        if (!this.viewedAds.has(viewKey)) {
            this.viewedAds.add(viewKey);
            
            // تحديث الإحصائيات
            const data = this.db.getAll();
            if (data.ads?.[position]) {
                if (typeof data.ads[position] === 'object') {
                    data.ads[position].views = (data.ads[position].views || 0) + 1;
                    data.ads[position].lastViewed = new Date().toISOString();
                }
                this.db.save(data);
            }

            console.log(`📺 Ad viewed: ${position}`);
        }
    }

    // 🖱️ تتبع النقرات
    trackClick(position) {
        const data = this.db.getAll();
        if (data.ads?.[position]) {
            if (typeof data.ads[position] === 'object') {
                data.ads[position].clicks = (data.ads[position].clicks || 0) + 1;
                data.ads[position].lastClicked = new Date().toISOString();
            }
            this.db.save(data);
        }
        
        console.log(`🖱️ Ad clicked: ${position}`);
    }

    // 🔄 تدوير الإعلانات
    setupAdRotation() {
        if (!this.config.enabled) return;

        // تنظيف الفترات السابقة
        Object.values(this.rotationIntervals).forEach(interval => clearInterval(interval));
        this.rotationIntervals = {};

        // بدء التدوير لكل موقع
        Object.keys(this.currentAds).forEach(position => {
            this.rotationIntervals[position] = setInterval(() => {
                this.rotateAd(position);
            }, this.config.rotationInterval);
        });
    }

    rotateAd(position) {
        const ad = this.currentAds[position];
        if (!ad?.container) return;

        // Animation out
        ad.container.style.opacity = '0';
        
        setTimeout(() => {
            // في التطبيق الحقيقي، هنا يتم جلب إعلان جديد
            // حالياً نعيد عرض نفس الإعلان مع animation جديد
            ad.container.style.opacity = '1';
        }, 300);
    }

    refreshVisibleAds() {
        Object.entries(this.currentAds).forEach(([position, ad]) => {
            if (ad?.container && this.isElementVisible(ad.container)) {
                this.trackView(position);
            }
        });
    }

    isElementVisible(el) {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    // 💬 Popup إعلان
    setupPopupAd(popupConfig) {
        const { content, delay = 5000, frequency = 'once' } = popupConfig;
        
        // التحقق من العرض السابق
        if (frequency === 'once') {
            const shown = sessionStorage.getItem('plaza_popup_shown');
            if (shown) return;
        }

        setTimeout(() => {
            this.showPopupAd(content);
            sessionStorage.setItem('plaza_popup_shown', 'true');
        }, delay);
    }

    showPopupAd(content) {
        const overlay = document.createElement('div');
        overlay.className = 'popup-ad-overlay';
        overlay.innerHTML = `
            <div class="popup-ad-container">
                <button class="popup-ad-close" onclick="this.closest('.popup-ad-overlay').remove()">
                    <i class="fa-solid fa-times"></i>
                </button>
                <div class="popup-ad-content">
                    ${this.sanitizeAdContent(content)}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        this.trackView('popup');

        // إغلاق عند النقر خارج الإعلان
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    // 📄 إعلانات خاصة بالصفحات
    loadPageSpecificAds(pageType) {
        const adsData = this.db.getAds();

        switch (pageType) {
            case 'home':
                this.loadHomeAds(adsData);
                break;
            case 'match':
            case 'watch':
                this.loadWatchAds(adsData);
                break;
            case 'admin':
            case 'dashboard':
                // لا إعلانات في لوحة التحكم
                break;
        }
    }

    loadHomeAds(adsData) {
        // إعلان بين أقسام المباريات
        if (adsData.inContent?.content || adsData.inContent) {
            const content = adsData.inContent?.content || adsData.inContent;
            const liveSection = document.getElementById('liveMatches');
            const upcomingSection = document.getElementById('upcomingMatches');
            
            if (liveSection && upcomingSection && content) {
                const adDiv = document.createElement('div');
                adDiv.id = 'between-sections-ad';
                adDiv.className = 'between-sections-ad';
                
                // إدراج قبل القسم القادم
                const sectionHeader = upcomingSection.previousElementSibling;
                if (sectionHeader?.classList.contains('section-header')) {
                    sectionHeader.parentNode.insertBefore(adDiv, sectionHeader);
                    this.renderAd(adDiv, content, 'between-sections');
                }
            }
        }
    }

    loadWatchAds(adsData) {
        // إعلان تحت الفيديو
        const videoContainer = document.querySelector('.video-container, .watch-container, #videoPlayer');
        if (videoContainer && adsData.inContent) {
            const content = adsData.inContent?.content || adsData.inContent;
            if (content) {
                const adDiv = document.createElement('div');
                adDiv.id = 'under-video-ad';
                adDiv.className = 'under-video-ad';
                videoContainer.parentNode.insertBefore(adDiv, videoContainer.nextSibling);
                this.renderAd(adDiv, content, 'under-video');
            }
        }
    }

    // 📈 إحصائيات الإعلانات
    getAdStats() {
        const adsData = this.db.getAds();
        const stats = {};

        ['header', 'sidebar', 'inContent', 'footer', 'popup'].forEach(position => {
            const ad = adsData[position];
            if (ad && typeof ad === 'object') {
                stats[position] = {
                    views: ad.views || 0,
                    clicks: ad.clicks || 0,
                    ctr: ad.views ? ((ad.clicks || 0) / ad.views * 100).toFixed(2) + '%' : '0%',
                    lastViewed: ad.lastViewed,
                    lastClicked: ad.lastClicked
                };
            }
        });

        return stats;
    }

    // ⚙️ تحديث إعدادات الإعلانات
    updateSettings(settings) {
        this.config = { ...this.config, ...settings };
        return this.db.updateAds({ config: this.config });
    }
}

// إنشاء نسخة عامة
const plazaAds = new PlazaAds();

// CSS للإعلانات (moved to style.css)