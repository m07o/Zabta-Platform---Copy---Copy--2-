// 📝 Plaza Form Validator v2.0 - نظام تحقق متقدم
// ═══════════════════════════════════════════════════════════════════════

class FormValidator {
    constructor(formElement, options = {}) {
        this.form = typeof formElement === 'string' 
            ? document.querySelector(formElement) 
            : formElement;
        
        this.options = {
            validateOnBlur: true,
            validateOnInput: true,
            showErrors: true,
            scrollToError: true,
            errorClass: 'form-error',
            successClass: 'form-success',
            ...options
        };
        
        this.rules = {};
        this.errors = {};
        this.isValid = false;
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.setAttribute('novalidate', 'true');
        
        this.form.addEventListener('submit', (e) => {
            if (!this.validate()) {
                e.preventDefault();
            }
        });

        if (this.options.validateOnBlur) {
            this.form.addEventListener('blur', (e) => {
                if (e.target.matches('input, textarea, select')) {
                    this.validateField(e.target);
                }
            }, true);
        }

        if (this.options.validateOnInput) {
            this.form.addEventListener('input', (e) => {
                if (e.target.matches('input, textarea')) {
                    // Debounce
                    clearTimeout(e.target._validateTimeout);
                    e.target._validateTimeout = setTimeout(() => {
                        this.validateField(e.target);
                    }, 300);
                }
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📋 Define Rules
    // ═══════════════════════════════════════════════════════════════════════

    addRule(fieldName, rules) {
        this.rules[fieldName] = Array.isArray(rules) ? rules : [rules];
        return this;
    }

    addRules(rulesMap) {
        Object.entries(rulesMap).forEach(([field, rules]) => {
            this.addRule(field, rules);
        });
        return this;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ✅ Built-in Validators
    // ═══════════════════════════════════════════════════════════════════════

    static validators = {
        required: {
            validate: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
            message: 'هذا الحقل مطلوب'
        },
        
        email: {
            validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'يرجى إدخال بريد إلكتروني صحيح'
        },
        
        url: {
            validate: (value) => {
                if (!value) return true;
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'يرجى إدخال رابط صحيح'
        },
        
        minLength: (min) => ({
            validate: (value) => !value || value.length >= min,
            message: `يجب أن يكون على الأقل ${min} حروف`
        }),
        
        maxLength: (max) => ({
            validate: (value) => !value || value.length <= max,
            message: `يجب ألا يتجاوز ${max} حرف`
        }),
        
        min: (min) => ({
            validate: (value) => !value || parseFloat(value) >= min,
            message: `يجب أن تكون القيمة ${min} على الأقل`
        }),
        
        max: (max) => ({
            validate: (value) => !value || parseFloat(value) <= max,
            message: `يجب ألا تتجاوز القيمة ${max}`
        }),
        
        pattern: (regex, message) => ({
            validate: (value) => !value || regex.test(value),
            message: message || 'القيمة غير صحيحة'
        }),
        
        match: (fieldName, message) => ({
            validate: (value, form) => {
                const otherField = form.querySelector(`[name="${fieldName}"]`);
                return !value || value === otherField?.value;
            },
            message: message || 'القيمتان غير متطابقتين'
        }),
        
        phone: {
            validate: (value) => !value || /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
            message: 'يرجى إدخال رقم هاتف صحيح'
        },
        
        arabicOnly: {
            validate: (value) => !value || /^[\u0600-\u06FF\s]+$/.test(value),
            message: 'يرجى الكتابة بالعربية فقط'
        },
        
        englishOnly: {
            validate: (value) => !value || /^[a-zA-Z\s]+$/.test(value),
            message: 'يرجى الكتابة بالإنجليزية فقط'
        },
        
        alphanumeric: {
            validate: (value) => !value || /^[a-zA-Z0-9\u0600-\u06FF]+$/.test(value),
            message: 'يسمح بالحروف والأرقام فقط'
        },
        
        date: {
            validate: (value) => !value || !isNaN(Date.parse(value)),
            message: 'يرجى إدخال تاريخ صحيح'
        },
        
        time: {
            validate: (value) => !value || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
            message: 'يرجى إدخال وقت صحيح'
        },
        
        password: {
            validate: (value) => {
                if (!value) return true;
                return value.length >= 8 && 
                       /[a-z]/.test(value) && 
                       /[A-Z]/.test(value) && 
                       /[0-9]/.test(value);
            },
            message: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير ورقم'
        },
        
        custom: (validateFn, message) => ({
            validate: validateFn,
            message
        })
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 🔍 Validation
    // ═══════════════════════════════════════════════════════════════════════

    validateField(field) {
        const fieldName = field.name || field.id;
        const rules = this.rules[fieldName];
        
        if (!rules) return true;
        
        const value = this.getFieldValue(field);
        const errors = [];
        
        for (const rule of rules) {
            const validator = typeof rule === 'string' 
                ? FormValidator.validators[rule] 
                : rule;
            
            if (!validator) continue;
            
            const isValid = validator.validate(value, this.form);
            
            if (!isValid) {
                errors.push(validator.message);
            }
        }
        
        if (errors.length > 0) {
            this.errors[fieldName] = errors;
            this.showFieldError(field, errors[0]);
            return false;
        } else {
            delete this.errors[fieldName];
            this.showFieldSuccess(field);
            return true;
        }
    }

    validate() {
        this.errors = {};
        let firstErrorField = null;
        
        // Validate all fields with rules
        Object.keys(this.rules).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (field) {
                const isValid = this.validateField(field);
                if (!isValid && !firstErrorField) {
                    firstErrorField = field;
                }
            }
        });
        
        this.isValid = Object.keys(this.errors).length === 0;
        
        // Scroll to first error
        if (!this.isValid && this.options.scrollToError && firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
        }
        
        return this.isValid;
    }

    getFieldValue(field) {
        if (field.type === 'checkbox') {
            return field.checked;
        }
        if (field.type === 'radio') {
            const checked = this.form.querySelector(`[name="${field.name}"]:checked`);
            return checked ? checked.value : '';
        }
        return field.value;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🎨 UI Feedback
    // ═══════════════════════════════════════════════════════════════════════

    showFieldError(field, message) {
        if (!this.options.showErrors) return;
        
        this.clearFieldState(field);
        field.classList.add(this.options.errorClass);
        
        const errorEl = document.createElement('div');
        errorEl.className = 'field-error-message';
        errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        field.parentNode.appendChild(errorEl);
    }

    showFieldSuccess(field) {
        this.clearFieldState(field);
        field.classList.add(this.options.successClass);
    }

    clearFieldState(field) {
        field.classList.remove(this.options.errorClass, this.options.successClass);
        const errorEl = field.parentNode.querySelector('.field-error-message');
        if (errorEl) errorEl.remove();
    }

    clearAllErrors() {
        this.errors = {};
        this.form.querySelectorAll('input, textarea, select').forEach(field => {
            this.clearFieldState(field);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📦 Form Data
    // ═══════════════════════════════════════════════════════════════════════

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        formData.forEach((value, key) => {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });
        
        return data;
    }

    setFormData(data) {
        Object.entries(data).forEach(([key, value]) => {
            const field = this.form.querySelector(`[name="${key}"], #${key}`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = Boolean(value);
                } else if (field.type === 'radio') {
                    const radio = this.form.querySelector(`[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    field.value = value;
                }
            }
        });
    }

    reset() {
        this.form.reset();
        this.clearAllErrors();
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🛡️ Error Boundary for JavaScript
// ═══════════════════════════════════════════════════════════════════════

class ErrorBoundary {
    constructor(options = {}) {
        this.options = {
            logToServer: false,
            showNotification: false, // DISABLED
            notificationDuration: 5000,
            onError: null,
            ...options
        };
        
        this.errors = [];
        // DISABLED - don't init error handlers
        // this.init();
    }

    init() {
        // DISABLED - All error handlers disabled
    }

    handleError(errorInfo) {
        // DISABLED - No error handling
    }

    async sendToServer(error) {
        // DISABLED
    }

    getErrors() {
        return [];
    }

    clearErrors() {
        this.errors = [];
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 📊 Performance Monitor
// ═══════════════════════════════════════════════════════════════════════

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // Wait for page load
        window.addEventListener('load', () => {
            setTimeout(() => this.collectMetrics(), 100);
        });
    }

    collectMetrics() {
        if (!window.performance) return;

        const timing = performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0];
        
        this.metrics = {
            // Page Load Metrics
            pageLoad: timing.loadEventEnd - timing.navigationStart,
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            firstByte: timing.responseStart - timing.navigationStart,
            domInteractive: timing.domInteractive - timing.navigationStart,
            
            // Resource Metrics
            dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
            tcpConnect: timing.connectEnd - timing.connectStart,
            serverResponse: timing.responseEnd - timing.requestStart,
            domParsing: timing.domComplete - timing.domLoading,
            
            // Memory (if available)
            memory: performance.memory ? {
                usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
                totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576)
            } : null,
            
            // Core Web Vitals (approximation)
            timestamp: new Date().toISOString()
        };

        // LCP (Largest Contentful Paint)
        try {
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {}

        // FID (First Input Delay)
        try {
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = Math.round(entry.processingStart - entry.startTime);
                });
            }).observe({ entryTypes: ['first-input'] });
        } catch (e) {}

        // CLS (Cumulative Layout Shift)
        try {
            let cls = 0;
            new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                });
                this.metrics.cls = cls.toFixed(4);
            }).observe({ entryTypes: ['layout-shift'] });
        } catch (e) {}

        console.log('📊 Performance Metrics:', this.metrics);
    }

    getMetrics() {
        return { ...this.metrics };
    }

    // قياس وقت تنفيذ دالة
    measure(name, fn) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        
        return result;
    }

    // قياس وقت تنفيذ async
    async measureAsync(name, fn) {
        const start = performance.now();
        const result = await fn();
        const duration = performance.now() - start;
        
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        
        return result;
    }
}

// ═══════════════════════════════════════════════════════════════════════
// ♿ Accessibility Enhancements
// ═══════════════════════════════════════════════════════════════════════

class A11yEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.enhanceKeyboardNav();
        this.enhanceScreenReaders();
        // Skip links disabled - causing UI issues
        // this.addSkipLinks();
        this.enhanceFocusStyles();
    }

    enhanceKeyboardNav() {
        // Focus trap for modals
        document.addEventListener('keydown', (e) => {
            const modal = document.querySelector('.modal-dialog.active');
            if (modal && e.key === 'Tab') {
                const focusables = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        // Arrow key navigation for menu
        document.addEventListener('keydown', (e) => {
            const menu = document.querySelector('.main-nav');
            if (menu?.contains(document.activeElement)) {
                const items = Array.from(menu.querySelectorAll('a'));
                const currentIndex = items.indexOf(document.activeElement);
                
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    e.preventDefault();
                    items[currentIndex - 1].focus();
                } else if (e.key === 'ArrowRight' && currentIndex < items.length - 1) {
                    e.preventDefault();
                    items[currentIndex + 1].focus();
                }
            }
        });
    }

    enhanceScreenReaders() {
        // Add live region for announcements
        if (!document.getElementById('a11y-announcer')) {
            const announcer = document.createElement('div');
            announcer.id = 'a11y-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
    }

    announce(message, priority = 'polite') {
        const announcer = document.getElementById('a11y-announcer');
        if (announcer) {
            announcer.setAttribute('aria-live', priority);
            announcer.textContent = '';
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }
    }

    addSkipLinks() {
        if (document.querySelector('.skip-link')) return;
        
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'تخطي إلى المحتوى الرئيسي';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    enhanceFocusStyles() {
        // Add visible focus indicator
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🔄 Real-time Updates (WebSocket simulation for localStorage)
// ═══════════════════════════════════════════════════════════════════════

class RealtimeSync {
    constructor() {
        this.listeners = new Map();
        this.init();
    }

    init() {
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key && this.listeners.has(e.key)) {
                const callbacks = this.listeners.get(e.key);
                const newValue = e.newValue ? JSON.parse(e.newValue) : null;
                const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null;
                
                callbacks.forEach(cb => cb(newValue, oldValue, e.key));
            }
        });

        // Broadcast channel for same-tab updates
        if ('BroadcastChannel' in window) {
            this.channel = new BroadcastChannel('plaza_sync');
            this.channel.onmessage = (e) => {
                const { key, value } = e.data;
                if (this.listeners.has(key)) {
                    this.listeners.get(key).forEach(cb => cb(value, null, key));
                }
            };
        }
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
        
        return () => {
            const callbacks = this.listeners.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        };
    }

    broadcast(key, value) {
        if (this.channel) {
            this.channel.postMessage({ key, value });
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// CSS للتحقق من الـ Forms (moved to style.css)
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
// 🎯 Initialize All
// ═══════════════════════════════════════════════════════════════════════

// ErrorBoundary disabled - was causing error popups
// const errorBoundary = new ErrorBoundary({ showNotification: false });
const perfMonitor = new PerformanceMonitor();
const a11y = new A11yEnhancer();
const realtimeSync = new RealtimeSync();

// Expose globally
window.FormValidator = FormValidator;
// window.errorBoundary = errorBoundary;
window.perfMonitor = perfMonitor;
window.a11y = a11y;
window.realtimeSync = realtimeSync;

// console.log('✅ Plaza Utilities v2.0 loaded');