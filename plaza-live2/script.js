// إعدادات الموقع
const SITE_CONFIG = {
    seo: {
        title: "PLAZA - البث المباشر للمباريات",
        description: "شاهد أهم المباريات مباشرة وبجودة عالية على PLAZA - أفضل منصة بث مباشر للمباريات الرياضية",
        keywords: "مباريات, بث مباشر, كورة, رياضة, مشاهدة مباريات, بث حي, PLAZA"
    }
};

// متغير لتخزين بيانات الفرق
let teamsData = {};

// خريطة الأسماء العربية للإنجليزية
const teamNameMap = {
    // الدوري الإنجليزي
    "ليفربول": "Liverpool",
    "مانشستر سيتي": "Manchester City",
    "مانشستر يونايتد": "Manchester United",
    "تشيلسي": "Chelsea",
    "آرسنال": "Arsenal",
    "توتنهام": "Tottenham Hotspur",
    "نيوكاسل": "Newcastle United",
    "أستون فيلا": "Aston Villa",
    "برايتون": "Brighton",
    "وست هام": "West Ham United",
    // الدوري الإسباني
    "ريال مدريد": "Real Madrid",
    "برشلونة": "Barcelona",
    "أتلتيكو مدريد": "Atletico Madrid",
    "إشبيلية": "Sevilla",
    "فالنسيا": "Valencia",
    "فياريال": "Villarreal",
    "ريال بيتيس": "Real Betis",
    "ريال سوسيداد": "Real Sociedad",
    // الدوري الإيطالي
    "يوفنتوس": "Juventus",
    "ميلان": "AC Milan",
    "إنتر ميلان": "Inter Milan",
    "نابولي": "Napoli",
    "روما": "Roma",
    "لاتسيو": "Lazio",
    "أتالانتا": "Atalanta",
    "فيورنتينا": "Fiorentina",
    // الدوري الألماني
    "بايرن ميونخ": "Bayern Munich",
    "بايرن ميونيخ": "Bayern Munich",
    "بوروسيا دورتموند": "Borussia Dortmund",
    "دورتموند": "Borussia Dortmund",
    "لايبزيج": "RB Leipzig",
    "باير ليفركوزن": "Bayer Leverkusen",
    // الدوري الفرنسي
    "باريس سان جيرمان": "Paris Saint-Germain",
    "مارسيليا": "Marseille",
    "ليون": "Lyon",
    "موناكو": "Monaco",
    "ليل": "Lille",
    // الدوري المصري
    "الأهلي": "Al Ahly",
    "الزمالك": "Zamalek",
    "بيراميدز": "Pyramids",
    "المصري": "Al Masry",
    "إنبي": "ENPPI",
    "الإسماعيلي": "Ismaily",
    "سموحة": "Smouha",
    "المقاولون العرب": "Al Mokawloon",
    "فيوتشر": "Future FC",
    "سيراميكا كليوباترا": "Ceramica Cleopatra",
    "فاركو": "Pharco",
    "الجونة": "El Gouna",
    "الاتحاد السكندري": "Al Ittihad Alexandria",
    "البنك الأهلي": "National Bank",
    "حرس الحدود": "Haras El Hodood",
    "غزل المحلة": "Ghazl El Mahalla",
    // الدوري السعودي
    "الهلال": "Al Hilal",
    "النصر": "Al Nassr",
    "الاتحاد": "Al Ittihad",
    "الأهلي السعودي": "Al Ahli SFC",
    "الشباب": "Al Shabab",
    "الاتفاق": "Al Ettifaq",
    "الفتح": "Al Fateh",
    "الخليج": "Al Khaleej",
    "الرائد": "Al Raed",
    "التعاون": "Al Taawoun",
    "ضمك": "Damac",
    "الفيحاء": "Al Fayha",
    "الوحدة": "Al Wehda",
    "أبها": "Al Orubah",
    // المنتخبات
    "مصر": "Egypt",
    "المغرب": "Morocco",
    "الجزائر": "Algeria",
    "السنغال": "Senegal",
    "تونس": "Tunisia",
    "نيجيريا": "Nigeria",
    "الكاميرون": "Cameroon",
    "غانا": "Ghana",
    "السعودية": "Saudi Arabia",
    "قطر": "Qatar",
    "الإمارات": "United Arab Emirates",
    "العراق": "Iraq",
    "الأردن": "Jordan",
    "فلسطين": "Palestine",
    "فرنسا": "France",
    "ألمانيا": "Germany",
    "إسبانيا": "Spain",
    "إنجلترا": "England",
    "إيطاليا": "Italy",
    "البرتغال": "Portugal",
    "هولندا": "Netherlands",
    "بلجيكا": "Belgium",
    "الأرجنتين": "Argentina",
    "البرازيل": "Brazil"
};

// تحميل بيانات الفرق من ملف JSON
async function loadTeamsData() {
    try {
        const response = await fetch('teams_data.json');
        if (response.ok) {
            teamsData = await response.json();
            console.log('✅ Teams data loaded from JSON file');
        } else {
            throw new Error('Failed to fetch teams_data.json');
        }
    } catch (error) {
        console.warn('⚠️ Could not load teams_data.json, using fallback data:', error.message);
        // Fallback minimal data
        teamsData = {
            "tournaments": [
                "الدوري الإنجليزي الممتاز", "الدوري الإسباني", "الدوري الإيطالي", "الدوري الألماني", "الدوري الفرنسي",
                "دوري أبطال أوروبا", "الدوري الأوروبي", "الدوري المصري", "الدوري السعودي للمحترفين",
                "دوري أبطال أفريقيا", "دوري أبطال آسيا", "كأس العالم", "كأس الأمم الأفريقية", "الودية الدولية"
            ],
            "clubs": {},
            "national": {},
            "default": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"
        };
    }

    // تحميل البطولات في dropdown إذا موجود
    loadTournaments();

    return teamsData;
}

// تحميل قائمة البطولات في dropdown
function loadTournaments() {
    const tournamentSelect = document.getElementById('matchTournament');
    if (!tournamentSelect || !teamsData.tournaments) return;

    // تأكد أنه select وليس عنصر آخر
    if (tournamentSelect.tagName !== 'SELECT') return;

    // مسح الخيارات القديمة
    tournamentSelect.innerHTML = '<option value="">اختر البطولة...</option>';

    // إضافة البطولات
    teamsData.tournaments.forEach(tournament => {
        const option = document.createElement('option');
        option.value = tournament;
        option.textContent = tournament;
        tournamentSelect.appendChild(option);
    });
}

// الحصول على شعار الفريق
function getTeamLogo(teamName) {
    if (!teamName) return teamsData.default || '';

    // تحويل الاسم العربي للإنجليزي إن وجد
    const englishName = teamNameMap[teamName] || teamName;

    // البحث في الأندية
    if (teamsData.clubs) {
        for (const region in teamsData.clubs) {
            for (const league in teamsData.clubs[region]) {
                const team = teamsData.clubs[region][league].find(t =>
                    t.name === englishName || t.name === teamName ||
                    t.name.toLowerCase() === englishName.toLowerCase()
                );
                if (team) return team.logo;
            }
        }
    }
    // البحث في المنتخبات
    if (teamsData.national) {
        for (const region in teamsData.national) {
            const team = teamsData.national[region].find(t =>
                t.name === englishName || t.name === teamName ||
                t.name.toLowerCase() === englishName.toLowerCase()
            );
            if (team) return team.logo;
        }
    }
    return teamsData.default || '';
}

// تحميل الموقع
function initializeSite() {
    // تحديد الصفحة الحالية
    const path = window.location.pathname;

    loadTeamsData().then(() => {
        if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
            loadMatches();
        }
    });

    loadStaticContent();
    setupNavigation();
    initializeSEO();
    setupContactForm();
    loadSocialLinks();

    // تحميل الإعلانات
    const currentPage = getCurrentPageType();
    if (window.plazaAds) plazaAds.loadAds(currentPage);

    // تتبع إحصائيات الصفحة
    if (window.plazaDB) plazaDB.trackPageView(currentPage);

    // تحميل إضافي حسب الصفحة
    if (path.includes('watch.html')) {
        initializeVideoPlayer();
    }

    // تحميل لوحة التحكم
    if (path.includes('dashboard.html')) {
        // تم التحقق من الجلسة بالفعل عبر الكود المضمن في الصفحة
        loadAdminData();
        loadTournaments();
    }
}

// تحديد نوع الصفحة الحالية
function getCurrentPageType() {
    const path = window.location.pathname;
    if (path.includes('watch.html')) return 'match';
    if (path.includes('dashboard.html')) return 'admin';
    if (path.includes('index.html') || path === '/') return 'home';
    return 'general';
}

// تحميل المباريات في الصفحة الرئيسية
function loadMatches() {
    const liveContainer = document.getElementById('liveMatches');
    const upcomingContainer = document.getElementById('upcomingMatches');

    if (!liveContainer || !upcomingContainer) return;

    liveContainer.innerHTML = '';
    upcomingContainer.innerHTML = '';

    const liveMatches = plazaDB.getMatches('live');
    const upcomingMatches = plazaDB.getMatches('upcoming');

    if (liveMatches.length > 0) {
        liveMatches.forEach(match => createMatchCard(match, liveContainer));
    } else {
        liveContainer.innerHTML = '<div class="no-matches">لا توجد مباريات مباشرة حالياً</div>';
    }

    if (upcomingMatches.length > 0) {
        upcomingMatches.forEach(match => createMatchCard(match, upcomingContainer));
    } else {
        upcomingContainer.innerHTML = '<div class="no-matches">لا توجد مباريات قادمة</div>';
    }
}

// إنشاء بطاقة مباراة (التصميم الجديد)
function createMatchCard(match, container) {
    const matchCard = document.createElement('a');
    matchCard.href = `watch.html?match=${match.id}`;
    matchCard.className = 'match-card';

    const statusText = match.status === 'live' ? 'مباشر' : 'قريباً';
    const statusClass = match.status;

    const logo1 = getTeamLogo(match.team1);
    const logo2 = getTeamLogo(match.team2);

    // تنسيق التاريخ والوقت
    const timeDisplay = match.time.split(' ').pop();
    const dateDisplay = match.time.split(' ').shift() || 'اليوم';

    matchCard.innerHTML = `
        <div class="match-card-header">
            <span class="match-tournament"><i class="fa-solid fa-trophy"></i> ${match.tournament}</span>
            <span class="match-status-badge ${statusClass}">${statusText}</span>
        </div>
        
        <div class="match-card-body">
            <div class="team-column">
                <div class="team-logo-wrapper">
                    <img src="${logo1}" alt="${match.team1}" class="team-logo" onerror="this.src='${teamsData.default}'">
                </div>
                <span class="team-name">${match.team1}</span>
            </div>
            
            <div class="match-info-center">
                <div class="match-time-display">${timeDisplay}</div>
                <div class="match-date-display">${dateDisplay}</div>
            </div>
            
            <div class="team-column">
                <div class="team-logo-wrapper">
                    <img src="${logo2}" alt="${match.team2}" class="team-logo" onerror="this.src='${teamsData.default}'">
                </div>
                <span class="team-name">${match.team2}</span>
            </div>
        </div>
        
        <div class="match-card-footer">
            <div class="watch-btn">
                <i class="fa-solid fa-play"></i> مشاهدة المباراة
            </div>
        </div>
    `;

    container.appendChild(matchCard);
}

// تحميل محتوى الصفحات الثابتة
function loadStaticContent() {
    const aboutContent = document.getElementById('aboutContent');
    const privacyContent = document.getElementById('privacyContent');
    const contactContent = document.getElementById('contactContent');

    if (aboutContent) {
        aboutContent.innerHTML = plazaDB.getContent('about');
    }

    if (privacyContent) {
        privacyContent.innerHTML = plazaDB.getContent('privacy');
    }

    if (contactContent) {
        contactContent.innerHTML = plazaDB.getContent('contact');
    }
}

// إعدادات SEO
function initializeSEO() {
    const seo = plazaDB.getSEO();
    document.title = seo.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = seo.description;

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = "keywords";
        document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = seo.keywords;
}

// إعداد التنقل
function setupNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        // Remove old event listeners to prevent duplicates if called multiple times
        const newMenuToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);

        newMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container') && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        });
    }

    updateAuthUI();
}

function updateAuthUI() {
    const adminLink = document.querySelector('.admin-link');
    if (adminLink) {
        if (typeof plazaAuth !== 'undefined' && plazaAuth.isAuthenticated()) {
            const user = plazaAuth.getCurrentUser();
            if (user.role === 'admin') {
                adminLink.style.display = 'flex';
                adminLink.href = 'dashboard.html';
                adminLink.innerHTML = '<i class="fa-solid fa-cog"></i> لوحة التحكم';
            } else {
                // For normal users, show "Logout" or "Profile" (future)
                adminLink.style.display = 'flex';
                adminLink.href = '#';
                adminLink.onclick = (e) => { e.preventDefault(); plazaAuth.logout(); };
                adminLink.innerHTML = '<i class="fa-solid fa-sign-out-alt"></i> خروج';
            }
        } else {
            // Show Login Modal trigger
            adminLink.style.display = 'flex';
            adminLink.href = '#';
            adminLink.onclick = (e) => { e.preventDefault(); ModalSystem.show('login'); };
            adminLink.innerHTML = '<i class="fa-solid fa-sign-in-alt"></i> دخول';
        }
    }
}

// Listen for auth changes
window.addEventListener('authChanged', updateAuthUI);

// إعداد نموذج الاتصال
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = this.querySelector('[name="name"]')?.value || this.querySelectorAll('input')[0]?.value || '';
            const email = this.querySelector('[name="email"]')?.value || this.querySelectorAll('input')[1]?.value || '';
            const message = this.querySelector('[name="message"]')?.value || this.querySelector('textarea')?.value || '';
            
            if (!name || !email || !message) {
                alert('يرجى ملء جميع الحقول');
                return;
            }
            
            // حفظ الرسالة في قاعدة البيانات المحلية
            const data = plazaDB.getAll();
            if (!data.messages) data.messages = [];
            data.messages.push({
                id: Date.now(),
                name, email, message,
                date: new Date().toISOString(),
                read: false
            });
            plazaDB.save(data);
            
            alert('شكراً لك! تم استلام رسالتك وسيتم الرد عليك قريباً.');
            this.reset();
        });
    }
}

// مشغل الفيديو المتقدم
function initializeVideoPlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('match');
    const match = plazaDB.getMatches().find(m => m.id == matchId);

    if (match) {
        document.getElementById('matchTitle').textContent = `مشاهدة: ${match.team1} vs ${match.team2}`;

        // Update match info
        if (document.getElementById('team1Name')) document.getElementById('team1Name').textContent = match.team1;
        if (document.getElementById('team2Name')) document.getElementById('team2Name').textContent = match.team2;
        if (document.getElementById('matchTournament')) document.getElementById('matchTournament').textContent = match.tournament;
        if (document.getElementById('matchTime')) document.getElementById('matchTime').textContent = match.time;

        // Logos
        if (document.getElementById('team1Logo')) document.getElementById('team1Logo').innerHTML = `<img src="${getTeamLogo(match.team1)}" alt="${match.team1}" class="team-logo">`;
        if (document.getElementById('team2Logo')) document.getElementById('team2Logo').innerHTML = `<img src="${getTeamLogo(match.team2)}" alt="${match.team2}" class="team-logo">`;

        document.title = `مشاهدة ${match.team1} vs ${match.team2} - PLAZA`;

        // Load Streams
        const serversList = document.getElementById('serversList');
        if (serversList) {
            serversList.innerHTML = '';
            const streams = match.streams && match.streams.length > 0 ? match.streams : [{ id: 0, url: match.streamUrl, label: 'الخادم الرئيسي', type: 'iframe' }];

            streams.forEach((stream, index) => {
                const btn = document.createElement('button');
                btn.className = 'server-btn';
                btn.innerHTML = `<i class="fa-solid fa-play"></i> ${stream.label} <span class="quality-badge">${stream.quality || 'HD'}</span>`;
                btn.onclick = (e) => changeServer(stream.url, stream.type, e.target);
                if (index === 0) btn.classList.add('active');
                serversList.appendChild(btn);
            });

            // Play first stream
            if (streams.length > 0) {
                changeServer(streams[0].url, streams[0].type);
            }
        }

        plazaDB.trackMatchView(match.id);

        // Start Viewer Count Update
        updateViewerCount();
        setInterval(updateViewerCount, 30000);
    }
    setupPlayerControls();
}

function changeServer(url, type, btnElement) {
    const videoPlayer = document.getElementById('videoPlayer');
    const container = document.querySelector('.video-container');

    if (videoPlayer) {
        // Validate URL to prevent XSS
        try {
            const parsedUrl = new URL(url);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                console.error('Invalid stream URL protocol:', parsedUrl.protocol);
                return;
            }
            videoPlayer.src = url;
        } catch (e) {
            // Allow relative URLs
            if (url.startsWith('/') || url.startsWith('./')) {
                videoPlayer.src = url;
            } else {
                console.error('Invalid stream URL:', url);
                return;
            }
        }
    }

    // Update active button state
    if (btnElement) {
        document.querySelectorAll('.server-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.closest('.server-btn')?.classList.add('active');
    }
}

function refreshStream() {
    const player = document.getElementById('videoPlayer');
    if (player) player.src = player.src;
}

function updateViewerCount() {
    const countEl = document.getElementById('countValue');
    if (countEl) {
        // Show actual page view count from database
        const analytics = plazaDB.getAnalytics();
        countEl.textContent = analytics.pageViews || 0;
    }
}

function setupPlayerControls() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const pipBtn = document.getElementById('pipBtn');
    const qualitySelect = document.getElementById('qualitySelect');

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    if (pipBtn) {
        pipBtn.addEventListener('click', togglePictureInPicture);
    }

    if (qualitySelect) {
        qualitySelect.addEventListener('change', changeQuality);
    }
}

function toggleFullscreen() {
    const videoContainer = document.querySelector('.video-container');
    if (!document.fullscreenElement) {
        if (videoContainer.requestFullscreen) videoContainer.requestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}

async function togglePictureInPicture() {
    const videoPlayer = document.getElementById('videoPlayer');
    try {
        if (document.pictureInPictureEnabled && !videoPlayer.disablePictureInPicture) {
            if (videoPlayer !== document.pictureInPictureElement) {
                await videoPlayer.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        } else {
            alert('المتصفح لا يدعم وضع النافذة العائمة');
        }
    } catch (error) {
        console.log('PiP error:', error);
    }
}

function changeQuality() {
    const qualitySelect = document.getElementById('qualitySelect');
    const selectedQuality = qualitySelect.value;
    if (selectedQuality !== 'auto') {
        alert(`سيتم تغيير جودة البث إلى ${selectedQuality}p`);
    }
}

// --- وظائف لوحة التحكم الجديدة ---

// التحقق من جلسة الأدمن
function checkAdminSession() {
    if (!plazaAuth.isAuthenticated()) {
        // Redirect to home and show login modal
        window.location.href = 'index.html';
    } else {
        showAdminPanel();
    }
}

function showAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = 'grid';
        loadAdminData();
    }
}

// تسجيل الخروج
function logout() {
    plazaAuth.logout();
    window.location.href = 'index.html';
}

// تبديل التبويبات في لوحة التحكم
function switchAdminTab(tabId) {
    // إخفاء كل المحتوى
    document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
    // إظهار التبويب المطلوب
    const tabEl = document.getElementById(`tab-${tabId}`);
    if (tabEl) tabEl.style.display = 'block';

    // تحديث القائمة النشطة
    document.querySelectorAll('.admin-menu-item').forEach(el => el.classList.remove('active'));
    // استخدام Event delegation بدلاً من event العام
    const clickedItem = document.querySelector(`.admin-menu-item[onclick*="${tabId}"]`);
    if (clickedItem) clickedItem.classList.add('active');

    // تحميل البيانات الخاصة بالتبويب
    if (tabId === 'users') loadUsers();
    if (tabId === 'stats') loadStats();
    if (tabId === 'social') loadSocialSettings();
}

function loadAdminData() {
    loadMatchesList();
    loadAdSettings();
    loadSocialSettings();

    if (document.getElementById('aboutContent')) {
        document.getElementById('aboutContent').value = plazaDB.getContent('about');
    }
    if (document.getElementById('privacyContent')) {
        document.getElementById('privacyContent').value = plazaDB.getContent('privacy');
    }
    if (document.getElementById('contactContent')) {
        document.getElementById('contactContent').value = plazaDB.getContent('contact');
    }
}

// 1. تحديث المناطق بناءً على النوع
function updateRegions(teamPrefix) {
    const typeSelect = document.getElementById(`${teamPrefix}Type`);
    const regionSelect = document.getElementById(`${teamPrefix}Region`);
    const leagueSelect = document.getElementById(`${teamPrefix}League`);
    const teamSelect = document.getElementById(`${teamPrefix}Name`);

    // إعادة تعيين القوائم التابعة
    regionSelect.innerHTML = '<option value="">اختر المنطقة...</option>';
    leagueSelect.innerHTML = '<option value="">اختر البطولة...</option>';
    teamSelect.innerHTML = '<option value="">اختر الفريق...</option>';

    regionSelect.disabled = true;
    leagueSelect.disabled = true;
    teamSelect.disabled = true;

    if (!typeSelect.value) return;

    const type = typeSelect.value; // 'clubs' or 'national'
    let regions = [];

    if (type === 'clubs') {
        regions = Object.keys(teamsData.clubs);
    } else if (type === 'national') {
        regions = Object.keys(teamsData.national);
    }

    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });

    regionSelect.disabled = false;
}

// 2. تحديث الدوريات بناءً على المنطقة
function updateLeagues(teamPrefix) {
    const typeSelect = document.getElementById(`${teamPrefix}Type`);
    const regionSelect = document.getElementById(`${teamPrefix}Region`);
    const leagueSelect = document.getElementById(`${teamPrefix}League`);
    const teamSelect = document.getElementById(`${teamPrefix}Name`);

    leagueSelect.innerHTML = '<option value="">اختر البطولة...</option>';
    teamSelect.innerHTML = '<option value="">اختر الفريق...</option>';

    leagueSelect.disabled = true;
    teamSelect.disabled = true;

    if (!regionSelect.value) return;

    const type = typeSelect.value;
    const region = regionSelect.value;

    if (type === 'clubs') {
        const leagues = Object.keys(teamsData.clubs[region]);
        leagues.forEach(league => {
            const option = document.createElement('option');
            option.value = league;
            option.textContent = league;
            leagueSelect.appendChild(option);
        });
        leagueSelect.disabled = false;
    } else if (type === 'national') {
        const teams = teamsData.national[region];
        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.name;
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });
        teamSelect.disabled = false;

        leagueSelect.innerHTML = '<option value="national">المنتخبات الوطنية</option>';
        leagueSelect.value = 'national';
        leagueSelect.disabled = true;
    }
}

// 3. تحديث الفرق بناءً على الدوري
function updateTeams(teamPrefix) {
    const typeSelect = document.getElementById(`${teamPrefix}Type`);
    const regionSelect = document.getElementById(`${teamPrefix}Region`);
    const leagueSelect = document.getElementById(`${teamPrefix}League`);
    const teamSelect = document.getElementById(`${teamPrefix}Name`);

    // If national, teams are already populated by updateLeagues, so don't clear them
    if (typeSelect.value === 'national') return;

    teamSelect.innerHTML = '<option value="">اختر الفريق...</option>';
    teamSelect.disabled = true;

    if (!leagueSelect.value) return;

    const type = typeSelect.value;
    const region = regionSelect.value;
    const league = leagueSelect.value;

    if (type === 'clubs') {
        const teams = teamsData.clubs[region][league];
        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.name;
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });
        teamSelect.disabled = false;
    }
}

// --- إدارة مصادر البث ---

let streamSourceCount = 0;

function addSourceField(data = null) {
    const container = document.getElementById('streamSourcesContainer');
    if (!container) return;

    const id = streamSourceCount++;

    const div = document.createElement('div');
    div.className = 'source-row';
    div.id = `source-row-${id}`;
    div.style.cssText = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #333;';

    div.innerHTML = `
        <div class="form-row" style="margin-bottom: 10px;">
            <div class="form-group" style="flex: 1;">
                <label>اسم المصدر (مثال: Yalla Shoot)</label>
                <input type="text" class="form-control source-label" placeholder="الخادم الرئيسي" value="${data ? data.label : ''}">
            </div>
            <div class="form-group" style="width: 120px;">
                <label>الجودة</label>
                <select class="form-control source-quality">
                    <option value="1080p" ${data && data.quality === '1080p' ? 'selected' : ''}>1080p (FHD)</option>
                    <option value="720p" ${data && data.quality === '720p' ? 'selected' : ''}>720p (HD)</option>
                    <option value="480p" ${data && data.quality === '480p' ? 'selected' : ''}>480p (SD)</option>
                    <option value="360p" ${data && data.quality === '360p' ? 'selected' : ''}>360p (Low)</option>
                    <option value="Auto" ${data && data.quality === 'Auto' ? 'selected' : ''}>Auto</option>
                </select>
            </div>
        </div>
        <div class="form-row" style="align-items: flex-end;">
            <div class="form-group" style="flex: 2;">
                <label>رابط البث (URL)</label>
                <input type="text" class="form-control source-url" placeholder="https://..." value="${data ? data.url : ''}">
            </div>
            <div class="form-group" style="width: 120px;">
                <label>النوع</label>
                <select class="form-control source-type">
                    <option value="iframe" ${data && data.type === 'iframe' ? 'selected' : ''}>iFrame</option>
                    <option value="m3u8" ${data && data.type === 'm3u8' ? 'selected' : ''}>M3U8</option>
                    <option value="direct" ${data && data.type === 'direct' ? 'selected' : ''}>Direct</option>
                </select>
            </div>
            <button onclick="removeSourceField(${id})" class="danger" style="height: 42px; margin-bottom: 2px;"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;

    container.appendChild(div);
}

function removeSourceField(id) {
    const row = document.getElementById(`source-row-${id}`);
    if (row) row.remove();
}

function addNewMatch() {
    const team1 = document.getElementById('team1Name').value;
    const team2 = document.getElementById('team2Name').value;
    const tournament = document.getElementById('matchTournament').value;
    const date = document.getElementById('matchDate').value;
    const timeVal = document.getElementById('matchTime').value;
    const status = document.getElementById('matchStatus').value;

    if (!team1 || !team2 || !tournament || !date) {
        alert('الرجاء ملء جميع الحقول واختيار الفرق');
        return;
    }

    const matchTime = `${date} ${timeVal}`;

    // تجميع المصادر
    const streams = [];
    document.querySelectorAll('.source-row').forEach(row => {
        const label = row.querySelector('.source-label').value;
        const url = row.querySelector('.source-url').value;
        const quality = row.querySelector('.source-quality').value;
        const type = row.querySelector('.source-type').value;

        if (label && url) {
            streams.push({
                id: Date.now() + Math.random(),
                label,
                url,
                quality,
                type
            });
        }
    });

    if (streams.length === 0) {
        if (!confirm('لم تقم بإضافة أي مصادر بث. هل تريد المتابعة؟')) return;
    }

    const editId = document.getElementById('editMatchId').value;

    if (editId) {
        // UPDATE MODE
        const updates = {
            team1: team1,
            team2: team2,
            tournament: tournament,
            time: matchTime,
            status: status,
            streams: streams.length > 0 ? streams : undefined
        };
        if (streams.length > 0) updates.streams = streams;
        if (streams.length > 0) updates.streamUrl = streams[0].url;

        if (plazaDB.updateMatch(editId, updates)) {
            alert('تم تحديث المباراة بنجاح!');
            loadMatchesList();
            resetForm();
        } else {
            alert('حدث خطأ أثناء تحديث المباراة');
        }
    } else {
        // CREATE MODE
        const newMatch = {
            team1: team1,
            team2: team2,
            tournament: tournament,
            time: matchTime,
            status: status,
            streams: streams,
            streamUrl: streams.length > 0 ? streams[0].url : ''
        };

        if (plazaDB.addMatch(newMatch)) {
            loadMatchesList();
            alert('تم إضافة المباراة بنجاح!');
            resetForm();
        } else {
            alert('حدث خطأ أثناء إضافة المباراة');
        }
    }
}

function resetForm() {
    document.getElementById('editMatchId').value = '';
    // Optional: Reset team dropdowns if needed, but keeping them might be useful for batch entry? 
    // Usually reset is better.
    document.getElementById('team1Name').value = '';
    document.getElementById('team2Name').value = '';

    document.getElementById('matchTournament').value = '';
    document.getElementById('matchDate').value = '';
    document.getElementById('matchTime').value = '';

    // Reset Button Text
    const submitBtn = document.querySelector('#addMatchForm button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'إضافة المباراة';

    const container = document.getElementById('streamSourcesContainer');
    if (container) {
        container.innerHTML = '';
        addSourceField();
    }
}

// Initialize with one empty source field when admin panel loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        addSourceField();
    }
});

function saveSEOSettings() {
    // Placeholder
}

// دالة عرض نموذج إضافة مباراة
function showAddMatchForm() {
    const form = document.getElementById('addMatchForm');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

function savePageContent(type) {
    const content = document.getElementById(`${type}Content`).value;
    if (plazaDB.updateContent(type, content)) {
        loadStaticContent();
        alert(`تم حفظ محتوى ${type} بنجاح!`);
    } else {
        alert(`حدث خطأ أثناء حفظ محتوى ${type}`);
    }
}

function loadMatchesList() {
    const matchesList = document.getElementById('adminMatchesList');
    if (!matchesList) return;

    matchesList.innerHTML = '';

    const matches = plazaDB.getMatches();
    if (matches.length === 0) {
        matchesList.innerHTML = '<div class="no-matches">لا توجد مباريات مضافة حالياً</div>';
        return;
    }

    matches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.className = 'match-card';
        matchElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${match.team1} vs ${match.team2}</strong>
                <br>
                <small>${match.tournament} - ${match.time}</small>
            </div>
            <div>
                <button class="primary edit-btn" data-id="${match.id}" style="padding: 0.5rem 1rem; margin-left: 5px;">تعديل</button>
                <button class="danger delete-btn" data-id="${match.id}" style="padding: 0.5rem 1rem;">حذف</button>
            </div>
        </div>
    `;
        matchesList.appendChild(matchElement);
    });

    // Remove existing listener to prevent duplicates if function called multiple times? 
    // Actually, simpler to just replace innerHTML destroys old elements, so we need to re-attach delegation or individual listeners
    // Best approach: Add listeners to the NEW elements

    matchesList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = function () { deleteMatch(this.getAttribute('data-id')); };
    });

    matchesList.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = function () { editMatch(this.getAttribute('data-id')); };
    });
}

function editMatch(matchId) {
    const matches = plazaDB.getMatches();
    // Use String comparison for ID safety
    const match = matches.find(m => String(m.id) === String(matchId));

    if (!match) {
        alert('المباراة غير موجودة');
        return;
    }

    // Populate Form
    document.getElementById('editMatchId').value = match.id;

    // Note: We cannot easily reverse generic text inputs to the dropdowns without complex logic
    // But we will try to set values if they match. 
    // Ideally, we just set the text inputs if we had them, but we have dropdowns.
    // For now, we assume user selects teams again or we try to find them in dropdowns.
    // Actually, setting team1Name (select) value works if the value exists.

    // Try to set values (might fail if team not in current list, but usually works)
    // We need to trigger updates potentially? No, simple value set
    // Wait, team1Name values are "Real Madrid". 
    // If match.team1 is "Real Madrid", it works.

    /* 
       Optimized Edit: Just alert user to re-select teams if they are complex, 
       but for date/time/tournament we can set easily.
    */

    document.getElementById('matchTournament').value = match.tournament;

    // Split date/time if possible
    // match.time format: "YYYY-MM-DD HH:MM"
    const parts = match.time.split(' ');
    if (parts.length === 2) {
        document.getElementById('matchDate').value = parts[0];
        document.getElementById('matchTime').value = parts[1];
    } else {
        // Handle "Live Now" or other formats if any
        document.getElementById('matchDate').value = '';
        document.getElementById('matchTime').value = '';
    }

    document.getElementById('matchStatus').value = match.status;

    // Change Button Text
    const submitBtn = document.querySelector('#addMatchForm button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'تحديث المباراة';

    // Scroll to form
    document.getElementById('addMatchForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteMatch(matchId) {
    console.log('deleteMatch called with ID:', matchId, 'Type:', typeof matchId);
    if (confirm('هل أنت متأكد من حذف هذه المباراة؟')) {
        console.log('User confirmed deletion');
        if (plazaDB.deleteMatch(matchId)) {
            console.log('plazaDB.deleteMatch returned TRUE');
            loadMatchesList();
            alert('تم حذف المباراة بنجاح!');
        } else {
            console.error('plazaDB.deleteMatch returned FALSE');
            alert('حدث خطأ أثناء حذف المباراة');
        }
    } else {
        console.log('User cancelled deletion');
    }
}

// --- إدارة الإعلانات ---
function loadAdSettings() {
    const ads = plazaDB.getAds();
    if (document.getElementById('headerAd')) document.getElementById('headerAd').value = ads.header || '';
    if (document.getElementById('sidebarAd')) document.getElementById('sidebarAd').value = ads.sidebar || '';
    if (document.getElementById('inContentAd')) document.getElementById('inContentAd').value = ads.inContent || '';
    if (document.getElementById('footerAd')) document.getElementById('footerAd').value = ads.footer || '';

    // إعدادات التدوير والتفعيل
    if (ads.config) {
        if (document.getElementById('adsEnabledToggle')) {
            document.getElementById('adsEnabledToggle').checked = ads.config.enabled;
        }
        if (document.getElementById('adsRotationInterval')) {
            document.getElementById('adsRotationInterval').value = ads.config.rotationInterval || 30000;
        }
    }
}

function saveAdSettings() {
    const adSettings = {
        header: document.getElementById('headerAd').value,
        sidebar: document.getElementById('sidebarAd').value,
        inContent: document.getElementById('inContentAd').value,
        footer: document.getElementById('footerAd').value,
        config: {
            enabled: document.getElementById('adsEnabledToggle').checked,
            rotationInterval: parseInt(document.getElementById('adsRotationInterval').value) || 30000
        }
    };

    if (plazaAds.updateAdSettings(adSettings)) {
        alert('تم حفظ إعدادات الإعلانات بنجاح!');
    } else {
        alert('حدث خطأ أثناء حفظ إعدادات الإعلانات');
    }
}

function previewAd(elementId) {
    const content = document.getElementById(elementId).value;
    plazaAds.previewAd(content);
}

// --- إدارة الروابط الاجتماعية ---
function loadSocialSettings() {
    const links = plazaDB.getSocialLinks();
    const platforms = ['youtube', 'facebook', 'twitter', 'instagram', 'telegram'];

    platforms.forEach(p => {
        const input = document.getElementById(`${p}Link`);
        if (input) input.value = links[p] || '';
    });

    const toggle = document.getElementById('socialEnabledToggle');
    if (toggle) toggle.checked = links.enabled;
}

function saveSocialSettings() {
    const platforms = ['youtube', 'facebook', 'twitter', 'instagram', 'telegram'];
    const links = {};

    platforms.forEach(p => {
        const input = document.getElementById(`${p}Link`);
        if (input) links[p] = input.value;
    });

    const toggle = document.getElementById('socialEnabledToggle');
    if (toggle) links.enabled = toggle.checked;

    if (plazaDB.updateSocialLinks(links)) {
        alert('تم حفظ إعدادات التواصل الاجتماعي بنجاح!');
        loadSocialLinks(); // Update footer immediately
    } else {
        alert('حدث خطأ أثناء الحفظ');
    }
}

function loadSocialLinks() {
    const links = plazaDB.getSocialLinks();
    if (!links.enabled) return;

    const container = document.getElementById('footerSocialLinks');
    if (container) {
        container.innerHTML = '';
        const platforms = ['youtube', 'facebook', 'twitter', 'instagram', 'telegram'];
        platforms.forEach(p => {
            if (links[p]) {
                const a = document.createElement('a');
                a.href = links[p];
                a.target = '_blank';
                a.innerHTML = `<i class="fa-brands fa-${p}"></i>`;
                container.appendChild(a);
            }
        });
    }
}

// --- إدارة المستخدمين ---
function loadUsers() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    usersList.innerHTML = '';
    const users = plazaDB.getAll().users || [];

    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        userDiv.style.padding = '10px';
        userDiv.style.borderBottom = '1px solid #333';
        userDiv.style.display = 'flex';
        userDiv.style.justifyContent = 'space-between';

        userDiv.innerHTML = `
        <span>${user.username} (${user.role})</span>
        ${user.username !== 'admin' ? `<button class="danger" onclick="deleteUser(${user.id})">حذف</button>` : ''}
    `;
        usersList.appendChild(userDiv);
    });
}

async function addNewUser() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!username || !password) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }

    const passwordHash = await plazaAuth.hashPassword(password);
    const newUser = {
        id: Date.now(),
        username: username,
        passwordHash: passwordHash,
        role: role,
        createdAt: new Date().toISOString()
    };

    const data = plazaDB.getAll();
    if (!data.users) data.users = [];

    if (data.users.find(u => u.username === username)) {
        alert('اسم المستخدم موجود بالفعل');
        return;
    }

    data.users.push(newUser);
    plazaDB.save(data);

    loadUsers();
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    alert('تم إضافة المستخدم بنجاح');
}

function deleteUser(userId) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        const data = plazaDB.getAll();
        data.users = data.users.filter(u => u.id !== userId);
        plazaDB.save(data);
        loadUsers();
    }
}

// --- الإحصائيات ---
function loadStats() {
    const analytics = plazaDB.getAnalytics();

    document.getElementById('totalViews').textContent = analytics.pageViews;
    document.getElementById('activeMatches').textContent = plazaDB.getMatches('live').length;

    if (window.liveUsersTracker) {
        document.getElementById('totalUsers').textContent = liveUsersTracker.getActiveCount();
    }
}

// Initialize

/* Auto Scraper Integration */
function loadScraperSettings() {
    if (!window.plazaScraper) return;

    const config = plazaScraper.config;
    const sources = plazaScraper.sources;

    // Update UI
    const toggle = document.getElementById('scraperEnabledToggle');
    if (toggle) toggle.checked = config.enabled;

    const interval = document.getElementById('scraperInterval');
    if (interval) interval.value = config.interval;

    document.getElementById('activeSourcesCount').innerText = sources.filter(s => s.enabled).length;

    renderScraperSources();
}

function renderScraperSources() {
    const list = document.getElementById('scraperSourcesList');
    if (!list) return;

    list.innerHTML = plazaScraper.sources.map(source => `
        <div class="source-item">
            <div>
                <strong>${source.name}</strong>
                <div style="font-size: 0.8rem; color: #888;">${source.url}</div>
            </div>
            <div style="display: flex; gap: 10px;">
                <label class="switch" style="transform: scale(0.8);">
                    <input type="checkbox" ${source.enabled ? 'checked' : ''} onchange="toggleSource(${source.id})">
                    <span class="slider round"></span>
                </label>
                <button onclick="deleteSource(${source.id})" class="btn-danger btn-small"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function toggleScraperScheduler() {
    const enabled = document.getElementById('scraperEnabledToggle').checked;
    plazaScraper.config.enabled = enabled;
    plazaScraper.saveSettings();

    if (enabled) {
        plazaScraper.startScheduler();
        document.getElementById('scraperStatus').innerText = 'يعمل';
        document.getElementById('scraperStatus').style.color = '#4caf50';
    } else {
        plazaScraper.stopScheduler();
        document.getElementById('scraperStatus').innerText = 'متوقف';
        document.getElementById('scraperStatus').style.color = '#f44336';
    }
}

function saveScraperSettings() {
    const interval = document.getElementById('scraperInterval').value;
    plazaScraper.config.interval = parseInt(interval);
    plazaScraper.saveSettings();

    if (plazaScraper.config.enabled) {
        plazaScraper.startScheduler(); // Restart with new interval
    }
}

function runScraperNow() {
    plazaScraper.run();
}

function addScraperSource() {
    const name = prompt('اسم المصدر:');
    if (!name) return;
    const url = prompt('رابط المصدر:');
    if (!url) return;

    const newSource = {
        id: Date.now(),
        name: name,
        url: url,
        enabled: true,
        selectors: {
            matchItem: '.match-item', // Default selectors, user would need a UI to edit these in a real app
            team1: '.left-team',
            team2: '.right-team',
            time: '.match-time',
            tournament: '.league-title',
            link: 'a.match-link'
        }
    };

    plazaScraper.sources.push(newSource);
    plazaScraper.saveSettings();
    renderScraperSources();
    document.getElementById('activeSourcesCount').innerText = plazaScraper.sources.filter(s => s.enabled).length;
}

function toggleSource(id) {
    const source = plazaScraper.sources.find(s => s.id === id);
    if (source) {
        source.enabled = !source.enabled;
        plazaScraper.saveSettings();
        document.getElementById('activeSourcesCount').innerText = plazaScraper.sources.filter(s => s.enabled).length;
    }
}

function deleteSource(id) {
    if (confirm('هل أنت متأكد من حذف هذا المصدر؟')) {
        plazaScraper.sources = plazaScraper.sources.filter(s => s.id !== id);
        plazaScraper.saveSettings();
        renderScraperSources();
        document.getElementById('activeSourcesCount').innerText = plazaScraper.sources.filter(s => s.enabled).length;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🔄 Auto-Refresh System - تحديث تلقائي للمباريات
// ═══════════════════════════════════════════════════════════════════════

const AutoRefresh = {
    interval: null,
    refreshRate: 60000, // كل دقيقة
    isEnabled: true,
    lastRefresh: null,
    
    init() {
        this.loadSettings();
        if (this.isEnabled) {
            this.start();
        }
        this.addIndicator();
    },
    
    loadSettings() {
        const stored = localStorage.getItem('plaza_autorefresh');
        if (stored) {
            const settings = JSON.parse(stored);
            this.refreshRate = settings.rate || 60000;
            this.isEnabled = settings.enabled !== false;
        }
    },
    
    saveSettings() {
        localStorage.setItem('plaza_autorefresh', JSON.stringify({
            rate: this.refreshRate,
            enabled: this.isEnabled
        }));
    },
    
    start() {
        this.stop();
        this.interval = setInterval(() => {
            this.refresh();
        }, this.refreshRate);
        console.log(`🔄 Auto-refresh started (${this.refreshRate / 1000}s)`);
    },
    
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },
    
    toggle() {
        this.isEnabled = !this.isEnabled;
        if (this.isEnabled) {
            this.start();
            if (window.plazaUI) plazaUI.success('تم تفعيل التحديث التلقائي');
        } else {
            this.stop();
            if (window.plazaUI) plazaUI.warning('تم إيقاف التحديث التلقائي');
        }
        this.saveSettings();
        this.updateIndicator();
    },
    
    refresh() {
        this.lastRefresh = new Date();
        
        const path = window.location.pathname;
        
        // تحديث الصفحة الرئيسية
        if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
            loadMatches();
        }
        
        // تحديث لوحة التحكم
        if (path.includes('dashboard.html')) {
            loadMatchesList();
        }
        
        this.updateIndicator();
        console.log('🔄 Auto-refreshed at:', this.lastRefresh.toLocaleTimeString());
    },
    
    addIndicator() {
        if (document.getElementById('refresh-indicator')) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'refresh-indicator';
        indicator.className = 'refresh-indicator';
        indicator.innerHTML = `
            <button onclick="AutoRefresh.toggle()" class="refresh-btn" title="التحديث التلقائي">
                <i class="fas fa-sync-alt"></i>
            </button>
        `;
        document.body.appendChild(indicator);
        this.updateIndicator();
    },
    
    updateIndicator() {
        const btn = document.querySelector('.refresh-btn');
        if (btn) {
            btn.classList.toggle('active', this.isEnabled);
            if (this.isEnabled) {
                btn.style.color = '#34d399';
            } else {
                btn.style.color = '';
            }
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════
// 🎯 Keyboard Shortcuts
// ═══════════════════════════════════════════════════════════════════════

const KeyboardShortcuts = {
    shortcuts: {
        'r': () => AutoRefresh.refresh(),
        '/': () => document.querySelector('.search-input')?.focus(),
        'h': () => window.location.href = 'index.html',
        'd': () => {
            const session = localStorage.getItem('plaza_session');
            if (session) {
                const user = JSON.parse(session);
                if (user.role === 'admin') {
                    window.location.href = 'dashboard.html';
                }
            }
        }
    },
    
    init() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.matches('input, textarea, select')) return;
            
            // Ctrl/Cmd + Key
            if (e.ctrlKey || e.metaKey) return;
            
            const handler = this.shortcuts[e.key.toLowerCase()];
            if (handler) {
                e.preventDefault();
                handler();
            }
        });
        
        console.log('⌨️ Keyboard shortcuts enabled');
    }
};

// ═══════════════════════════════════════════════════════════════════════
// 📊 View Counter (عداد المشاهدات)
// ═══════════════════════════════════════════════════════════════════════

const ViewCounter = {
    init(matchId) {
        if (!matchId) return;
        
        // تسجيل المشاهدة
        this.track(matchId);
        
        // عداد وهمي متحرك
        this.animateCounter();
    },
    
    track(matchId) {
        const matches = JSON.parse(localStorage.getItem('plaza_matches') || '[]');
        const match = matches.find(m => m.id == matchId);
        if (match) {
            match.viewCount = (match.viewCount || 0) + 1;
            localStorage.setItem('plaza_matches', JSON.stringify(matches));
        }
    },
    
    animateCounter() {
        const counter = document.getElementById('viewerCount');
        if (!counter) return;
        
        let count = parseInt(counter.textContent.replace(/,/g, '')) || Math.floor(Math.random() * 5000) + 500;
        
        setInterval(() => {
            const change = Math.floor(Math.random() * 20) - 8;
            count = Math.max(100, count + change);
            counter.textContent = count.toLocaleString('ar-EG');
        }, 5000);
    }
};

// ═══════════════════════════════════════════════════════════════════════
// 🔍 SEARCH FUNCTIONALITY - البحث عن المباريات
// ═══════════════════════════════════════════════════════════════════════

const SearchBox = {
    matches: [],
    debounceTimer: null,

    init() {
        const input = document.getElementById('searchInput');
        const results = document.getElementById('searchResults');
        
        if (!input || !results) return;

        // Load matches
        this.loadMatches();

        // Setup events
        input.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.search(e.target.value.trim());
            }, 300);
        });

        input.addEventListener('focus', () => {
            if (input.value.trim()) {
                this.search(input.value.trim());
            }
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#searchBox')) {
                results.classList.remove('active');
            }
        });

        // ESC to close
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                results.classList.remove('active');
                input.blur();
            }
        });
    },

    loadMatches() {
        try {
            this.matches = JSON.parse(localStorage.getItem('plaza_matches') || '[]');
        } catch (e) {
            this.matches = [];
        }
    },

    search(query) {
        const results = document.getElementById('searchResults');
        if (!results) return;

        if (!query || query.length < 2) {
            results.classList.remove('active');
            return;
        }

        this.loadMatches();
        
        const filtered = this.matches.filter(match => {
            const searchString = `${match.team1} ${match.team2} ${match.tournament}`.toLowerCase();
            return searchString.includes(query.toLowerCase());
        });

        if (filtered.length === 0) {
            results.innerHTML = `
                <div class="search-no-results">
                    <i class="fa-solid fa-search" style="font-size: 1.5rem; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
                    لا توجد نتائج لـ "${query}"
                </div>
            `;
        } else {
            results.innerHTML = filtered.slice(0, 5).map(match => `
                <div class="search-result-item" onclick="SearchBox.goToMatch(${match.id})">
                    <img src="${this.getTeamLogo(match.team1)}" alt="${match.team1}" onerror="this.src='logo.png'">
                    <div class="result-info">
                        <div class="result-teams">${match.team1} vs ${match.team2}</div>
                        <div class="result-tournament">
                            <i class="fa-solid fa-trophy" style="font-size: 0.7rem; margin-left: 4px;"></i>
                            ${match.tournament}
                        </div>
                    </div>
                    ${match.status === 'live' ? '<span style="color: var(--accent-color); font-size: 0.8rem; font-weight: 700;">🔴 مباشر</span>' : ''}
                </div>
            `).join('');
        }

        results.classList.add('active');
    },

    getTeamLogo(teamName) {
        if (typeof getTeamLogo === 'function') {
            return getTeamLogo(teamName);
        }
        return 'logo.png';
    },

    goToMatch(matchId) {
        window.location.href = `watch.html?match=${matchId}`;
    }
};

// ═══════════════════════════════════════════════════════════════════════
// 📊 HERO VIEWER COUNTER - عداد المشاهدين في الهيرو
// ═══════════════════════════════════════════════════════════════════════

const HeroViewerCounter = {
    init() {
        const badge = document.getElementById('viewerBadge');
        const counter = document.getElementById('viewerCount');
        
        if (!badge || !counter) return;

        // Check if there are live matches
        const matches = plazaDB.getMatches('live');

        if (matches.length > 0) {
            badge.style.display = 'flex';
            
            // Show actual page view count from analytics
            const analytics = plazaDB.getAnalytics();
            const count = analytics.pageViews || 0;
            counter.textContent = count.toLocaleString('ar-EG');
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════
// CSS للـ Auto-Refresh
// ═══════════════════════════════════════════════════════════════════════

const refreshStyles = document.createElement('style');
refreshStyles.textContent = `
    .refresh-indicator {
        position: fixed;
        bottom: 90px;
        left: 30px;
        z-index: 998;
    }
    
    .refresh-btn {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: var(--bg-card, rgba(30, 30, 40, 0.6));
        border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
        color: var(--text-gray, #b0b0c0);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1rem;
    }
    
    .refresh-btn:hover {
        background: var(--primary-color, #00f2ff);
        color: #000;
        transform: rotate(180deg);
    }
    
    .refresh-btn.active i {
        animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(refreshStyles);

// ═══════════════════════════════════════════════════════════════════════
// 🚀 Initialize Everything
// ═══════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initializeSite();
    // AutoRefresh.init(); // تم إلغاء التحديث التلقائي
    KeyboardShortcuts.init();
    SearchBox.init();
    HeroViewerCounter.init();
    
    // Initialize view counter on watch page
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('match');
    if (matchId && window.location.pathname.includes('watch.html')) {
        ViewCounter.init(matchId);
    }
    
    // Realtime sync for matches
    if (window.realtimeSync) {
        realtimeSync.subscribe('plaza_matches', (newValue) => {
            console.log('📡 Matches updated from another tab');
            loadMatches();
        });
    }
    
    // console.log('🚀 PLAZA v2.0 Pro fully loaded!');
});