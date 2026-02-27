// 🔐 Plaza Modal System v2.0 - نظام النوافذ المنبثقة المحسن
// ═══════════════════════════════════════════════════════════════════════

const ModalSystem = {
    currentModal: null,
    isAnimating: false,

    init() {
        this.injectStyles();
        this.injectModals();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    },

    injectStyles() {
        /* CSS moved to style.css */
    },

    injectModals() {
        // Remove old modals if exist
        document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
        
        const modalHTML = `
            <!-- Login Modal -->
            <div id="loginModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="login-title">
                <div class="modal-content">
                    <button class="modal-close" onclick="ModalSystem.closeAll()" aria-label="إغلاق">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    
                    <div class="modal-header">
                        <div class="modal-header-icon">
                            <i class="fa-solid fa-right-to-bracket"></i>
                        </div>
                        <h2 id="login-title">تسجيل الدخول</h2>
                        <p>مرحباً بعودتك إلى PLAZA</p>
                    </div>
                    
                    <div class="modal-body">
                        <div id="loginError" class="modal-error">
                            <i class="fa-solid fa-circle-exclamation"></i>
                            <span id="loginErrorText"></span>
                        </div>
                        
                        <form id="modalLoginForm" class="modal-form" autocomplete="on">
                            <div class="form-group">
                                <label for="modalLoginUsername">اسم المستخدم</label>
                                <div class="input-wrapper">
                                    <input 
                                        type="text" 
                                        id="modalLoginUsername" 
                                        placeholder="أدخل اسم المستخدم"
                                        autocomplete="username"
                                        required
                                    >
                                    <i class="fa-solid fa-user input-icon"></i>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="modalLoginPassword">كلمة المرور</label>
                                <div class="input-wrapper">
                                    <input 
                                        type="password" 
                                        id="modalLoginPassword" 
                                        placeholder="أدخل كلمة المرور"
                                        autocomplete="current-password"
                                        required
                                    >
                                    <i class="fa-solid fa-lock input-icon"></i>
                                </div>
                            </div>
                            
                            <button type="submit" class="modal-btn" id="loginSubmitBtn">
                                <i class="fa-solid fa-sign-in-alt"></i>
                                <span>دخول</span>
                            </button>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        ليس لديك حساب؟ 
                        <a onclick="ModalSystem.switchModal('register')">إنشاء حساب جديد</a>
                    </div>
                </div>
            </div>

            <!-- Register Modal -->
            <div id="registerModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="register-title">
                <div class="modal-content">
                    <button class="modal-close" onclick="ModalSystem.closeAll()" aria-label="إغلاق">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    
                    <div class="modal-header">
                        <div class="modal-header-icon">
                            <i class="fa-solid fa-user-plus"></i>
                        </div>
                        <h2 id="register-title">إنشاء حساب</h2>
                        <p>انضم إلى مجتمع PLAZA</p>
                    </div>
                    
                    <div class="modal-body">
                        <div id="registerError" class="modal-error">
                            <i class="fa-solid fa-circle-exclamation"></i>
                            <span id="registerErrorText"></span>
                        </div>
                        
                        <div id="registerSuccess" class="modal-success">
                            <i class="fa-solid fa-check-circle"></i>
                            <span>تم إنشاء الحساب بنجاح!</span>
                        </div>
                        
                        <form id="modalRegisterForm" class="modal-form" autocomplete="on">
                            <div class="form-group">
                                <label for="modalRegUsername">اسم المستخدم</label>
                                <div class="input-wrapper">
                                    <input 
                                        type="text" 
                                        id="modalRegUsername" 
                                        placeholder="اختر اسم مستخدم"
                                        autocomplete="username"
                                        minlength="3"
                                        required
                                    >
                                    <i class="fa-solid fa-user input-icon"></i>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="modalRegPassword">كلمة المرور</label>
                                <div class="input-wrapper">
                                    <input 
                                        type="password" 
                                        id="modalRegPassword" 
                                        placeholder="أدخل كلمة مرور قوية"
                                        autocomplete="new-password"
                                        minlength="8"
                                        required
                                    >
                                    <i class="fa-solid fa-lock input-icon"></i>
                                </div>
                                <div class="password-strength">
                                    <div id="passwordStrengthBar" class="password-strength-bar"></div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="modalRegConfirmPassword">تأكيد كلمة المرور</label>
                                <div class="input-wrapper">
                                    <input 
                                        type="password" 
                                        id="modalRegConfirmPassword" 
                                        placeholder="أعد إدخال كلمة المرور"
                                        autocomplete="new-password"
                                        required
                                    >
                                    <i class="fa-solid fa-lock input-icon"></i>
                                </div>
                            </div>
                            
                            <button type="submit" class="modal-btn" id="registerSubmitBtn">
                                <i class="fa-solid fa-user-plus"></i>
                                <span>إنشاء حساب</span>
                            </button>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        لديك حساب بالفعل؟ 
                        <a onclick="ModalSystem.switchModal('login')">تسجيل الدخول</a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    setupEventListeners() {
        // Close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeAll();
            });
        });

        // Login Form Submit
        const loginForm = document.getElementById('modalLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }

        // Register Form Submit
        const registerForm = document.getElementById('modalRegisterForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister();
            });
        }

        // Password strength checker
        const regPassword = document.getElementById('modalRegPassword');
        if (regPassword) {
            regPassword.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
            });
        }

        // Confirm password match
        const confirmPassword = document.getElementById('modalRegConfirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', (e) => {
                const password = document.getElementById('modalRegPassword').value;
                if (e.target.value && e.target.value !== password) {
                    e.target.classList.add('error');
                    e.target.classList.remove('success');
                } else if (e.target.value === password) {
                    e.target.classList.remove('error');
                    e.target.classList.add('success');
                }
            });
        }
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });
    },

    async handleLogin() {
        const username = document.getElementById('modalLoginUsername').value.trim();
        const password = document.getElementById('modalLoginPassword').value;
        const errorEl = document.getElementById('loginError');
        const errorText = document.getElementById('loginErrorText');
        const submitBtn = document.getElementById('loginSubmitBtn');

        // Reset error
        errorEl.style.display = 'none';

        // Validation
        if (!username || !password) {
            errorText.textContent = 'يرجى إدخال اسم المستخدم وكلمة المرور';
            errorEl.style.display = 'block';
            return;
        }

        // Show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div><span>جاري الدخول...</span>';

        try {
            const result = await plazaAuth.login(username, password);
            
            if (result.success) {
                this.closeAll();
                
                // Show success toast
                if (window.plazaUI) {
                    plazaUI.success('مرحباً ' + result.user.username + '!', 'تم تسجيل الدخول');
                }
                
                // Update UI
                if (typeof updateAuthUI === 'function') updateAuthUI();
                if (typeof setupNavigation === 'function') setupNavigation();

                // Redirect admins to dashboard
                if (result.user.role === 'admin') {
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                } else {
                    // Reload current page to update state
                    window.location.reload();
                }
            } else {
                errorText.textContent = result.message || 'فشل تسجيل الدخول';
                errorEl.style.display = 'block';
                
                // Shake input
                document.getElementById('modalLoginPassword').classList.add('error');
            }
        } catch (error) {
            console.error('Login error:', error);
            // Silently log error without showing message
            errorText.textContent = 'يرجى التحقق من البيانات والمحاولة مرة أخرى';
            errorEl.style.display = 'block';
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-sign-in-alt"></i><span>دخول</span>';
        }
    },

    async handleRegister() {
        const username = document.getElementById('modalRegUsername').value.trim();
        const password = document.getElementById('modalRegPassword').value;
        const confirm = document.getElementById('modalRegConfirmPassword').value;
        const errorEl = document.getElementById('registerError');
        const errorText = document.getElementById('registerErrorText');
        const successEl = document.getElementById('registerSuccess');
        const submitBtn = document.getElementById('registerSubmitBtn');

        // Reset messages
        errorEl.style.display = 'none';
        successEl.style.display = 'none';

        // Validation
        if (!username || username.length < 3) {
            errorText.textContent = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
            errorEl.style.display = 'block';
            return;
        }

        if (!password || password.length < 8) {
            errorText.textContent = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
            errorEl.style.display = 'block';
            return;
        }

        if (password !== confirm) {
            errorText.textContent = 'كلمات المرور غير متطابقة';
            errorEl.style.display = 'block';
            document.getElementById('modalRegConfirmPassword').classList.add('error');
            return;
        }

        // Show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner"></div><span>جاري إنشاء الحساب...</span>';

        try {
            const result = await plazaAuth.register(username, password);
            
            if (result.success) {
                successEl.style.display = 'block';
                
                // Show success toast
                if (window.plazaUI) {
                    plazaUI.success('تم إنشاء الحساب بنجاح!');
                }
                
                // Switch to login after 1.5s
                setTimeout(() => {
                    this.switchModal('login');
                }, 1500);
            } else {
                errorText.textContent = result.message || 'فشل إنشاء الحساب';
                errorEl.style.display = 'block';
            }
        } catch (error) {
            console.error('Register error:', error);
            // Silently log error without showing message
            errorText.textContent = 'يرجى التحقق من البيانات والمحاولة مرة أخرى';
            errorEl.style.display = 'block';
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i><span>إنشاء حساب</span>';
        }
    },

    checkPasswordStrength(password) {
        const bar = document.getElementById('passwordStrengthBar');
        if (!bar) return;

        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        bar.className = 'password-strength-bar';
        
        if (strength <= 2) {
            bar.classList.add('weak');
        } else if (strength <= 3) {
            bar.classList.add('medium');
        } else {
            bar.classList.add('strong');
        }
    },

    show(type) {
        if (this.isAnimating) return;
        
        this.closeAll();
        this.isAnimating = true;
        
        const modal = document.getElementById(type + 'Modal');
        if (modal) {
            modal.classList.add('active');
            this.currentModal = type;
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input');
                if (firstInput) firstInput.focus();
                this.isAnimating = false;
            }, 300);

            // Reset forms
            const form = modal.querySelector('form');
            if (form) form.reset();
            
            // Hide error messages
            modal.querySelectorAll('.modal-error, .modal-success').forEach(el => {
                el.style.display = 'none';
            });
            
            // Reset input states
            modal.querySelectorAll('input').forEach(input => {
                input.classList.remove('error', 'success');
            });
            
            // Reset password strength
            const strengthBar = modal.querySelector('.password-strength-bar');
            if (strengthBar) strengthBar.className = 'password-strength-bar';
        }
    },

    closeAll() {
        document.querySelectorAll('.modal-overlay').forEach(m => {
            m.classList.remove('active');
        });
        this.currentModal = null;
        document.body.style.overflow = '';
    },

    switchModal(type) {
        if (this.isAnimating) return;
        
        this.closeAll();
        setTimeout(() => this.show(type), 300);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ModalSystem.init();
});

// Export globally
window.ModalSystem = ModalSystem;

// console.log('🔐 Plaza Modal System v2.0 loaded!');