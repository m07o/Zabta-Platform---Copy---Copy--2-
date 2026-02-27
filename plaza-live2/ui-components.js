// 🎨 Plaza UI Components v2.0 - مكونات واجهة متقدمة
// ═══════════════════════════════════════════════════════════════════════

class PlazaUI {
    constructor() {
        this.toastQueue = [];
        this.isProcessingToast = false;
        this.init();
    }

    init() {
        // Disabled all UI components that cause issues
        // this.createToastContainer();
        this.createThemeToggleInHeader();
        this.loadTheme();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📢 Toast Notifications System - DISABLED
    // ═══════════════════════════════════════════════════════════════════════
    
    createToastContainer() {
        // Disabled
    }

    toast(options) {
        // Disabled - no more toast notifications
        console.log('Toast disabled:', options);
    }

    async processToastQueue() {
        // Disabled - no toast processing
    }

    createToastElement(config) {
        // Disabled
        return null;
    }

    removeToast(toast) {
        // Disabled
    }

    // Shorthand methods - all disabled
    success(message, title = 'نجاح') {
        console.log('Toast disabled:', message);
    }

    error(message, title = 'خطأ') {
        console.log('Toast disabled:', message);
    }

    warning(message, title = 'تحذير') {
        console.log('Toast disabled:', message);
    }

    info(message, title = 'معلومة') {
        console.log('Toast disabled:', message);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🌙 Theme Toggle (Dark/Light Mode)
    // ═══════════════════════════════════════════════════════════════════════
    
    createThemeToggle() {
        if (document.getElementById('theme-toggle')) return;
        
        const toggle = document.createElement('button');
        toggle.id = 'theme-toggle';
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'تبديل الوضع المظلم/الفاتح');
        toggle.innerHTML = '<i class="fas fa-moon"></i>';
        
        toggle.addEventListener('click', () => this.toggleTheme());
        document.body.appendChild(toggle);
    }

    createThemeToggleInHeader() {
        if (document.getElementById('theme-toggle-header')) return;
        
        const navContainer = document.querySelector('.nav-container');
        if (!navContainer) {
            // Fallback to body if no nav-container
            this.createThemeToggle();
            return;
        }
        
        const toggle = document.createElement('button');
        toggle.id = 'theme-toggle-header';
        toggle.className = 'theme-toggle-header';
        toggle.setAttribute('aria-label', 'تبديل الوضع المظلم/الفاتح');
        toggle.innerHTML = '<i class="fas fa-moon"></i>';
        
        toggle.addEventListener('click', () => this.toggleThemeHeader());
        
        // Insert before menu-toggle button
        const menuToggle = navContainer.querySelector('.menu-toggle');
        if (menuToggle) {
            navContainer.insertBefore(toggle, menuToggle);
        } else {
            navContainer.insertBefore(toggle, navContainer.firstChild);
        }
    }

    toggleThemeHeader() {
        const body = document.body;
        const toggle = document.getElementById('theme-toggle-header');
        
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        
        if (toggle) {
            toggle.innerHTML = isLight 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }
        
        localStorage.setItem('plaza_theme', isLight ? 'light' : 'dark');
    }

    toggleTheme() {
        const body = document.body;
        const toggle = document.getElementById('theme-toggle');
        
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        
        toggle.innerHTML = isLight 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        
        localStorage.setItem('plaza_theme', isLight ? 'light' : 'dark');
        
        this.toast({
            type: 'info',
            title: 'تم تغيير المظهر',
            message: isLight ? 'تم التبديل للوضع الفاتح' : 'تم التبديل للوضع المظلم',
            duration: 2000
        });
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('plaza_theme');
        const toggle = document.getElementById('theme-toggle');
        const toggleHeader = document.getElementById('theme-toggle-header');
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            if (toggle) toggle.innerHTML = '<i class="fas fa-sun"></i>';
            if (toggleHeader) toggleHeader.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ⬆️ Scroll to Top Button
    // ═══════════════════════════════════════════════════════════════════════
    
    createScrollTopButton() {
        if (document.getElementById('scroll-top')) return;
        
        const btn = document.createElement('button');
        btn.id = 'scroll-top';
        btn.className = 'scroll-top';
        btn.setAttribute('aria-label', 'الذهاب لأعلى الصفحة');
        btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
        
        document.body.appendChild(btn);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 💧 Ripple Effect
    // ═══════════════════════════════════════════════════════════════════════
    
    initRippleEffect() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.ripple, .btn-primary, .btn-secondary, .watch-btn');
            if (!target) return;

            const rect = target.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            
            ripple.className = 'ripple-effect';
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            
            target.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 👁️ Animation Observer (Animate on scroll)
    // ═══════════════════════════════════════════════════════════════════════
    
    initAnimationObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-visible');
                    
                    // Animate children with stagger
                    const children = entry.target.querySelectorAll('.stagger-item');
                    children.forEach((child, index) => {
                        child.style.animationDelay = `${index * 0.1}s`;
                        child.classList.add('animate-visible');
                    });
                }
            });
        }, observerOptions);

        // Observe elements with animate-on-scroll class
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📊 Loading States
    // ═══════════════════════════════════════════════════════════════════════
    
    showLoading(message = 'جاري التحميل...') {
        let overlay = document.getElementById('loading-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p id="loading-message">${this.escapeHtml(message)}</p>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            document.getElementById('loading-message').textContent = message;
        }
        
        requestAnimationFrame(() => overlay.classList.add('active'));
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    updateLoadingMessage(message) {
        const msg = document.getElementById('loading-message');
        if (msg) msg.textContent = message;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🦴 Skeleton Loading
    // ═══════════════════════════════════════════════════════════════════════
    
    createSkeleton(type = 'card', count = 1) {
        const skeletons = [];
        
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = `skeleton skeleton-${type}`;
            
            if (type === 'card') {
                skeleton.innerHTML = `
                    <div class="skeleton-header" style="height: 40px; margin-bottom: 10px;"></div>
                    <div class="skeleton-body" style="height: 120px; margin-bottom: 10px;"></div>
                    <div class="skeleton-footer" style="height: 50px;"></div>
                `;
            }
            
            skeletons.push(skeleton);
        }
        
        return skeletons;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🎊 Confetti Animation
    // ═══════════════════════════════════════════════════════════════════════
    
    showConfetti(count = 50) {
        const colors = ['#00f2ff', '#0051ff', '#ff0055', '#ffd700', '#34d399'];
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3500);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔢 Counter Animation
    // ═══════════════════════════════════════════════════════════════════════
    
    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            
            element.textContent = current.toLocaleString('ar-EG');
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString('ar-EG');
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📋 Copy to Clipboard
    // ═══════════════════════════════════════════════════════════════════════
    
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.success('تم النسخ للحافظة');
            return true;
        } catch (error) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                this.success('تم النسخ للحافظة');
                return true;
            } catch (e) {
                this.error('فشل النسخ');
                return false;
            } finally {
                textarea.remove();
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔧 Utility Methods
    // ═══════════════════════════════════════════════════════════════════════
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Format numbers with Arabic numerals
    formatNumber(num) {
        return num.toLocaleString('ar-EG');
    }

    // Format time ago
    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        const intervals = {
            سنة: 31536000,
            شهر: 2592000,
            أسبوع: 604800,
            يوم: 86400,
            ساعة: 3600,
            دقيقة: 60,
            ثانية: 1
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `منذ ${interval} ${unit}`;
            }
        }
        
        return 'الآن';
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🎯 Modal Manager
// ═══════════════════════════════════════════════════════════════════════

class ModalManager {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
        this.init();
    }

    init() {
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.close(this.activeModal);
            }
        });
    }

    create(id, options = {}) {
        const defaults = {
            title: '',
            content: '',
            size: 'medium',
            closable: true,
            onOpen: null,
            onClose: null
        };

        const config = { ...defaults, ...options };
        
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.id = `${id}-backdrop`;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = `modal-dialog modal-${config.size}`;
        modal.id = id;
        modal.innerHTML = `
            <div class="content-box">
                <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>${config.title}</h3>
                    ${config.closable ? '<button class="modal-close-btn" style="background: none; border: none; color: var(--text-gray); font-size: 1.5rem; cursor: pointer;"><i class="fas fa-times"></i></button>' : ''}
                </div>
                <div class="modal-body">${config.content}</div>
            </div>
        `;
        
        // Event listeners
        if (config.closable) {
            backdrop.addEventListener('click', () => this.close(id));
            modal.querySelector('.modal-close-btn')?.addEventListener('click', () => this.close(id));
        }
        
        // Add to DOM
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
        
        this.modals.set(id, { modal, backdrop, config });
        
        return modal;
    }

    open(id) {
        const modalData = this.modals.get(id);
        if (!modalData) return;

        const { modal, backdrop, config } = modalData;
        
        backdrop.classList.add('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.activeModal = id;
        
        if (config.onOpen) config.onOpen();
    }

    close(id) {
        const modalData = this.modals.get(id);
        if (!modalData) return;

        const { modal, backdrop, config } = modalData;
        
        backdrop.classList.remove('active');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.activeModal = null;
        
        if (config.onClose) config.onClose();
    }

    destroy(id) {
        const modalData = this.modals.get(id);
        if (!modalData) return;

        modalData.modal.remove();
        modalData.backdrop.remove();
        this.modals.delete(id);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🎨 Progress Bar Component
// ═══════════════════════════════════════════════════════════════════════

class ProgressBar {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        this.options = {
            value: 0,
            max: 100,
            animated: true,
            showLabel: false,
            ...options
        };
        
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${this.getPercentage()}%"></div>
            </div>
            ${this.options.showLabel ? `<span class="progress-label">${this.getPercentage()}%</span>` : ''}
        `;
        
        this.fill = this.container.querySelector('.progress-fill');
        this.label = this.container.querySelector('.progress-label');
    }

    getPercentage() {
        return Math.min(100, Math.max(0, (this.options.value / this.options.max) * 100));
    }

    setValue(value) {
        this.options.value = value;
        this.fill.style.width = `${this.getPercentage()}%`;
        if (this.label) this.label.textContent = `${Math.round(this.getPercentage())}%`;
    }

    increment(amount = 1) {
        this.setValue(this.options.value + amount);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🔄 Initialize
// ═══════════════════════════════════════════════════════════════════════

// Create global instances
const plazaUI = new PlazaUI();
const modalManager = new ModalManager();

// Expose globally
window.plazaUI = plazaUI;
window.modalManager = modalManager;
window.ProgressBar = ProgressBar;

// console.log('🎨 Plaza UI Components v2.0 loaded successfully!');