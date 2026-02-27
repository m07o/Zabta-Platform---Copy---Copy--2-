// Plaza Advanced UI v2.0 - Tooltip & Performance Animations
// CSS is in style.css
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// 💬 TOOLTIP COMPONENT - تلميحات احترافية
// ═══════════════════════════════════════════════════════════════════════
const Tooltip = {
    init() {
        this.setupTooltips();
    },

    setupTooltips() {
        // Auto-add tooltips to common elements
        document.querySelectorAll('[title]').forEach(el => {
            if (!el.hasAttribute('data-tooltip')) {
                el.setAttribute('data-tooltip', el.getAttribute('title'));
                el.removeAttribute('title');
            }
        });
    },

    add(element, text, position = 'top') {
        element.setAttribute('data-tooltip', text);
        element.setAttribute('data-tooltip-position', position);
    }
};

// ═══════════════════════════════════════════════════════════════════════
// ⚡ PERFORMANCE ANIMATIONS - تحسينات الأداء
// ═══════════════════════════════════════════════════════════════════════
const PerformanceAnimations = {
    init() {
        this.setupIntersectionObserver();
    },

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements with animation classes
        document.querySelectorAll('.animate-on-scroll, .animate-scale, .animate-slide-right, .animate-stagger').forEach(el => {
            observer.observe(el);
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════
// 🎯 INITIALIZE
// ═══════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    Tooltip.init();
    PerformanceAnimations.init();
});

// Export globally
window.PlazaAdvancedUI = {
    Tooltip,
    PerformanceAnimations
};
