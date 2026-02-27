// 🔐 نظام أمان محسن - Plaza Auth Pro v2.0
class PlazaAuth {
    constructor() {
        this.db = plazaDB;
        this.sessionKey = 'plaza_session';
        this.loginAttemptsKey = 'plaza_login_attempts';
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 دقيقة
        this.sessionDuration = 24 * 60 * 60 * 1000; // 24 ساعة
        this.csrfToken = null;
        this.initCSRF();
    }

    // 🔒 CSRF Protection
    initCSRF() {
        this.csrfToken = localStorage.getItem('plaza_csrf') || this.generateSecureToken(32);
        localStorage.setItem('plaza_csrf', this.csrfToken);
    }

    getCSRFToken() {
        return this.csrfToken;
    }

    validateCSRF(token) {
        return token === this.csrfToken;
    }

    // 🔐 تشفير محسن SHA-256 + Salt
    async hashPassword(password, salt = null) {
        salt = salt || this.generateSalt();
        // Double hashing with salt for stronger security
        const saltedPassword = salt + password + salt.split('').reverse().join('');
        const msgBuffer = new TextEncoder().encode(saltedPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // Second round of hashing
        const secondPass = new TextEncoder().encode(hashArray.join('') + salt);
        const finalBuffer = await crypto.subtle.digest('SHA-256', secondPass);
        const finalArray = Array.from(new Uint8Array(finalBuffer));
        const hash = finalArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return { hash, salt };
    }

    generateSalt() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    generateSecureToken(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 🛡️ حماية من Brute Force
    getLoginAttempts(username) {
        const attempts = JSON.parse(localStorage.getItem(this.loginAttemptsKey) || '{}');
        return attempts[username] || { count: 0, lastAttempt: 0, lockedUntil: 0 };
    }

    recordLoginAttempt(username, success) {
        const attempts = JSON.parse(localStorage.getItem(this.loginAttemptsKey) || '{}');
        const now = Date.now();

        if (success) {
            delete attempts[username];
        } else {
            const current = attempts[username] || { count: 0, lastAttempt: 0, lockedUntil: 0 };
            current.count++;
            current.lastAttempt = now;

            if (current.count >= this.maxLoginAttempts) {
                current.lockedUntil = now + this.lockoutDuration;
                current.count = 0;
            }

            attempts[username] = current;
        }

        localStorage.setItem(this.loginAttemptsKey, JSON.stringify(attempts));
    }

    isAccountLocked(username) {
        const attempts = this.getLoginAttempts(username);
        if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
            const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
            return { locked: true, remainingMinutes: remainingTime };
        }
        return { locked: false };
    }

    // ✅ التحقق من الجلسة
    isAuthenticated() {
        try {
            const sessionStr = localStorage.getItem(this.sessionKey);
            if (!sessionStr) return false;

            const session = JSON.parse(sessionStr);
            if (!session || !session.expiresAt || !session.token) return false;

            const now = new Date();
            const expiresAt = new Date(session.expiresAt);

            if (now > expiresAt) {
                this.logout();
                return false;
            }

            // التحقق من صحة الـ fingerprint
            if (session.fingerprint && session.fingerprint !== this.getBrowserFingerprint()) {
                console.warn('Session fingerprint mismatch - possible session hijacking');
                this.logout();
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    getBrowserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Plaza Security Check', 0, 0);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL().slice(-50)
        ].join('|');
        
        return btoa(fingerprint).slice(0, 32);
    }

    getCurrentUser() {
        if (!this.isAuthenticated()) return null;
        try {
            return JSON.parse(localStorage.getItem(this.sessionKey));
        } catch {
            return null;
        }
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    // 🔑 تسجيل الدخول المحسن
    async login(username, password) {
        // تنظيف المدخلات
        username = this.sanitizeInput(username);

        // التحقق من القفل
        const lockStatus = this.isAccountLocked(username);
        if (lockStatus.locked) {
            return { 
                success: false, 
                message: `الحساب مقفل. حاول مرة أخرى بعد ${lockStatus.remainingMinutes} دقيقة`,
                locked: true
            };
        }

        // التحقق من المدخلات
        if (!username || !password) {
            return { success: false, message: 'يرجى ملء جميع الحقول' };
        }

        if (username.length < 3) {
            return { success: false, message: 'اسم المستخدم غير صحيح' };
        }

        const users = this.db.getAll().users || [];
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (!user) {
            this.recordLoginAttempt(username, false);
            // رسالة عامة لمنع تخمين أسماء المستخدمين
            return { success: false, message: 'بيانات الدخول غير صحيحة' };
        }

        try {
            // التحقق من كلمة المرور
            let isValid = false;
            
            if (user.salt) {
                // كلمة مرور مشفرة بـ salt
                const { hash } = await this.hashPassword(password, user.salt);
                isValid = hash === user.passwordHash;
            } else {
                // التوافق مع النظام القديم
                const oldHash = await this.legacyHashPassword(password);
                isValid = oldHash === user.passwordHash;
                
                // تحديث لاستخدام التشفير الجديد
                if (isValid) {
                    await this.upgradeUserPassword(user.id, password);
                }
            }

            if (isValid) {
                this.recordLoginAttempt(username, true);
                this.createSession(user);
                this.logSecurityEvent('login_success', { username });
                return { success: true, user: { id: user.id, username: user.username, role: user.role } };
            } else {
                this.recordLoginAttempt(username, false);
                const attempts = this.getLoginAttempts(username);
                const remaining = this.maxLoginAttempts - attempts.count;
                return { 
                    success: false, 
                    message: `بيانات الدخول غير صحيحة. المحاولات المتبقية: ${remaining}` 
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            this.logSecurityEvent('login_error', { username, error: error.message });
            return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
        }
    }

    async legacyHashPassword(password) {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async upgradeUserPassword(userId, password) {
        const data = this.db.getAll();
        const userIndex = data.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            const { hash, salt } = await this.hashPassword(password);
            data.users[userIndex].passwordHash = hash;
            data.users[userIndex].salt = salt;
            data.users[userIndex].passwordUpgraded = true;
            this.db.save(data);
        }
    }

    // 📝 تسجيل حساب جديد
    async register(username, password, confirmPassword) {
        // تنظيف المدخلات
        username = this.sanitizeInput(username);

        // التحقق من المدخلات
        if (!username || !password) {
            return { success: false, message: 'يرجى ملء جميع الحقول' };
        }

        if (username.length < 3) {
            return { success: false, message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' };
        }

        if (username.length > 20) {
            return { success: false, message: 'اسم المستخدم طويل جداً' };
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { success: false, message: 'اسم المستخدم يجب أن يحتوي فقط على حروف وأرقام' };
        }

        if (password.length < 8) {
            return { success: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
        }

        // التحقق من قوة كلمة المرور
        const passwordStrength = this.checkPasswordStrength(password);
        if (passwordStrength.score < 2) {
            return { success: false, message: passwordStrength.feedback };
        }

        if (confirmPassword && password !== confirmPassword) {
            return { success: false, message: 'كلمتا المرور غير متطابقتين' };
        }

        const data = this.db.getAll();
        const users = data.users || [];

        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, message: 'اسم المستخدم مستخدم بالفعل' };
        }

        try {
            const { hash, salt } = await this.hashPassword(password);
            const newUser = {
                id: Date.now(),
                username: username,
                passwordHash: hash,
                salt: salt,
                role: 'user',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                loginCount: 0
            };

            users.push(newUser);
            data.users = users;
            this.db.save(data);

            this.logSecurityEvent('register_success', { username });
            return { success: true, user: { id: newUser.id, username: newUser.username, role: newUser.role } };
        } catch (error) {
            console.error('Register error:', error);
            this.logSecurityEvent('register_error', { username, error: error.message });
            return { success: false, message: 'حدث خطأ أثناء إنشاء الحساب' };
        }
    }

    checkPasswordStrength(password) {
        let score = 0;
        const feedback = [];

        if (password.length >= 8) score++;
        else feedback.push('يجب أن تكون 8 أحرف على الأقل');

        if (password.length >= 12) score++;

        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        else feedback.push('استخدم حروف كبيرة وصغيرة');

        if (/\d/.test(password)) score++;
        else feedback.push('أضف أرقام');

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        else feedback.push('أضف رموز خاصة');

        // التحقق من كلمات مرور شائعة
        const commonPasswords = ['password', '123456', 'admin', 'qwerty', 'admin123'];
        if (commonPasswords.includes(password.toLowerCase())) {
            score = 0;
            feedback.unshift('كلمة المرور شائعة جداً');
        }

        return {
            score,
            strength: score < 2 ? 'ضعيفة' : score < 4 ? 'متوسطة' : 'قوية',
            feedback: feedback.join('. ') || 'كلمة مرور قوية'
        };
    }

    // 🎫 إنشاء جلسة آمنة
    createSession(user) {
        const session = {
            userId: user.id,
            username: user.username,
            role: user.role,
            token: this.generateSecureToken(64),
            fingerprint: this.getBrowserFingerprint(),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.sessionDuration).toISOString(),
            lastActivity: new Date().toISOString()
        };

        localStorage.setItem(this.sessionKey, JSON.stringify(session));

        // تحديث آخر تسجيل دخول
        const data = this.db.getAll();
        const userIndex = data.users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            data.users[userIndex].lastLogin = new Date().toISOString();
            data.users[userIndex].loginCount = (data.users[userIndex].loginCount || 0) + 1;
            this.db.save(data);
        }

        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: session } }));
    }

    // 🔄 تحديث نشاط الجلسة
    refreshSession() {
        if (!this.isAuthenticated()) return false;
        
        try {
            const session = JSON.parse(localStorage.getItem(this.sessionKey));
            session.lastActivity = new Date().toISOString();
            // تمديد الجلسة إذا كان المستخدم نشطاً
            session.expiresAt = new Date(Date.now() + this.sessionDuration).toISOString();
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            return true;
        } catch {
            return false;
        }
    }

    // 🚪 تسجيل الخروج
    logout() {
        const user = this.getCurrentUser();
        if (user) {
            this.logSecurityEvent('logout', { username: user.username });
        }

        localStorage.removeItem(this.sessionKey);
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: null } }));

        if (window.location.href.includes('dashboard.html')) {
            window.location.href = 'index.html';
        }
    }

    // 🔒 تغيير كلمة المرور
    async changePassword(currentPassword, newPassword, confirmPassword) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return { success: false, message: 'يجب تسجيل الدخول أولاً' };
        }

        if (newPassword !== confirmPassword) {
            return { success: false, message: 'كلمتا المرور غير متطابقتين' };
        }

        const passwordStrength = this.checkPasswordStrength(newPassword);
        if (passwordStrength.score < 2) {
            return { success: false, message: passwordStrength.feedback };
        }

        const data = this.db.getAll();
        const user = data.users.find(u => u.id === currentUser.userId);
        
        if (!user) {
            return { success: false, message: 'المستخدم غير موجود' };
        }

        // التحقق من كلمة المرور الحالية
        let isValid = false;
        if (user.salt) {
            const { hash } = await this.hashPassword(currentPassword, user.salt);
            isValid = hash === user.passwordHash;
        } else {
            const oldHash = await this.legacyHashPassword(currentPassword);
            isValid = oldHash === user.passwordHash;
        }

        if (!isValid) {
            return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
        }

        // تحديث كلمة المرور
        const { hash, salt } = await this.hashPassword(newPassword);
        const userIndex = data.users.findIndex(u => u.id === user.id);
        data.users[userIndex].passwordHash = hash;
        data.users[userIndex].salt = salt;
        data.users[userIndex].passwordChangedAt = new Date().toISOString();
        this.db.save(data);

        this.logSecurityEvent('password_changed', { username: user.username });
        return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
    }

    // 🧹 تنظيف المدخلات من XSS
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input
            .trim()
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .slice(0, 100);
    }

    // 📊 سجل أحداث الأمان
    logSecurityEvent(event, details = {}) {
        const logs = JSON.parse(localStorage.getItem('plaza_security_logs') || '[]');
        logs.unshift({
            event,
            details,
            timestamp: new Date().toISOString(),
            ip: 'client-side',
            userAgent: navigator.userAgent.slice(0, 100)
        });
        
        // الاحتفاظ بآخر 100 سجل فقط
        localStorage.setItem('plaza_security_logs', JSON.stringify(logs.slice(0, 100)));
    }

    getSecurityLogs() {
        return JSON.parse(localStorage.getItem('plaza_security_logs') || '[]');
    }

    // 👤 إنشاء المستخدم الافتراضي (مرة واحدة فقط)
    async ensureDefaultUser() {
        const data = this.db.getAll();
        let users = data.users || [];

        const adminExists = users.find(u => u.username === 'admin');
        
        // إنشاء الأدمن فقط إذا لم يكن موجوداً - لا نعيد كتابة كلمة المرور
        if (!adminExists) {
            const defaultPassword = 'Plaza@Admin2026!';
            const { hash, salt } = await this.hashPassword(defaultPassword);

            const defaultUser = {
                id: 1,
                username: 'admin',
                passwordHash: hash,
                salt: salt,
                role: 'admin',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                loginCount: 0,
                requirePasswordChange: true
            };
            users.push(defaultUser);
            data.users = users;
            this.db.save(data);
            console.log('✅ Default admin user created - please change password immediately');
        }
    }

    // 👥 إدارة المستخدمين (للأدمن)
    getAllUsers() {
        if (!this.isAdmin()) return [];
        const data = this.db.getAll();
        return (data.users || []).map(u => ({
            id: u.id,
            username: u.username,
            role: u.role,
            createdAt: u.createdAt,
            lastLogin: u.lastLogin,
            loginCount: u.loginCount
        }));
    }

    async updateUserRole(userId, newRole) {
        if (!this.isAdmin()) return { success: false, message: 'غير مصرح' };
        
        const data = this.db.getAll();
        const userIndex = data.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) return { success: false, message: 'المستخدم غير موجود' };
        if (data.users[userIndex].id === 1) return { success: false, message: 'لا يمكن تعديل الأدمن الرئيسي' };
        
        data.users[userIndex].role = newRole;
        this.db.save(data);
        
        return { success: true, message: 'تم تحديث الصلاحية' };
    }

    async deleteUser(userId) {
        if (!this.isAdmin()) return { success: false, message: 'غير مصرح' };
        
        const data = this.db.getAll();
        if (userId === 1) return { success: false, message: 'لا يمكن حذف الأدمن الرئيسي' };
        
        data.users = data.users.filter(u => u.id !== userId);
        this.db.save(data);
        
        return { success: true, message: 'تم حذف المستخدم' };
    }
}

// إنشاء نسخة واحدة فقط
const plazaAuth = new PlazaAuth();
plazaAuth.ensureDefaultUser();

// تحديث نشاط الجلسة كل دقيقة
setInterval(() => plazaAuth.refreshSession(), 60000);

// Export globally
window.plazaAuth = plazaAuth;
