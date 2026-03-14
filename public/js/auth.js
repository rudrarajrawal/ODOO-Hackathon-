// Backend-driven Authentication implementation

document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const emailTab = document.getElementById('emailTab');
    const phoneTab = document.getElementById('phoneTab');
    const loginForm = document.getElementById('loginForm');
    const phoneLoginForm = document.getElementById('phoneLoginForm');
    const viewSubtitle = document.getElementById('viewSubtitle');

    if (emailTab && phoneTab) {
        emailTab.addEventListener('click', () => {
            emailTab.classList.add('active');
            phoneTab.classList.remove('active');
            loginForm.classList.remove('d-none');
            phoneLoginForm.classList.add('d-none');
            viewSubtitle.textContent = "Access Inventory System";
        });

        phoneTab.click(); // Default to phone as requested
        phoneTab.addEventListener('click', () => {
            phoneTab.classList.add('active');
            emailTab.classList.remove('active');
            phoneLoginForm.classList.remove('d-none');
            loginForm.classList.add('d-none');
            viewSubtitle.textContent = "Secure Phone Login";
        });
    }

    // Email Login Handler
    const loginError = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                
                if (response.ok && data.success) {
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userEmail', email);
                    window.location.href = '/dashboard';
                } else {
                    throw new Error(data.message || "Invalid credentials");
                }
            } catch (error) {
                console.error("Login Error:", error);
                loginError.textContent = "AUTH_FAILURE: " + error.message;
                loginError.classList.remove('d-none');
            }
        });
    }

    // Phone Login & SMS Logic (SQLite Backend)
    let isResetMode = false;

    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const phoneError = document.getElementById('phoneError');
    const phoneInputStep = document.getElementById('phoneInputStep');
    const otpVerifyStep = document.getElementById('otpVerifyStep');
    const resetPasswordStep = document.getElementById('resetPasswordStep');
    const forgotPasswordPhone = document.getElementById('forgotPasswordPhone');

    if (forgotPasswordPhone) {
        forgotPasswordPhone.addEventListener('click', (e) => {
            e.preventDefault();
            isResetMode = true;
            phoneTab.click(); // Ensure phone tab is active
            viewSubtitle.textContent = "Reset Password via SMS";
            forgotPasswordPhone.classList.add('d-none');
        });
    }

    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', async () => {
            const phoneNumber = document.getElementById('phoneNumber').value;
            if (!phoneNumber) {
                phoneError.textContent = "Please enter a phone number";
                phoneError.classList.remove('d-none');
                return;
            }

            try {
                phoneError.classList.add('d-none');
                sendOtpBtn.disabled = true;
                
                const response = await fetch('/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phoneNumber })
                });
                const data = await response.json();

                if (data.success) {
                    phoneInputStep.classList.add('d-none');
                    otpVerifyStep.classList.remove('d-none');
                    if (isResetMode) {
                        resetPasswordStep.classList.remove('d-none');
                        verifyOtpBtn.textContent = "Verify & Reset";
                    }
                    console.log("OTP Sent (check server console)");
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error("SMS Error:", error);
                phoneError.textContent = "SMS_ERROR: " + error.message;
                phoneError.classList.remove('d-none');
                sendOtpBtn.disabled = false;
            }
        });
    }

    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', async () => {
            const code = document.getElementById('otpCode').value;
            const phoneNumber = document.getElementById('phoneNumber').value;

            try {
                if (isResetMode) {
                    // Verification logic moved to saveNewPasswordBtn for reset flow
                    // Just show the fields
                    phoneError.textContent = "Phone verified (OTP will be checked on reset).";
                    phoneError.classList.remove('d-none', 'alert-danger');
                    phoneError.classList.add('alert-success');
                    verifyOtpBtn.classList.add('d-none');
                } else {
                    // Login Flow
                    const response = await fetch('/api/auth/phone-login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: phoneNumber, code: code })
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        sessionStorage.setItem('isLoggedIn', 'true');
                        sessionStorage.setItem('userEmail', data.email);
                        window.location.href = '/dashboard';
                    } else {
                        throw new Error(data.message);
                    }
                }
            } catch (error) {
                console.error("Verification Error:", error);
                phoneError.textContent = "VERIFY_ERROR: " + error.message;
                phoneError.classList.remove('d-none');
            }
        });
    }

    const saveNewPasswordBtn = document.getElementById('saveNewPasswordBtn');
    if (saveNewPasswordBtn) {
        saveNewPasswordBtn.addEventListener('click', async () => {
            const newPassword = document.getElementById('newPhonePassword').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            const code = document.getElementById('otpCode').value;

            if (!newPassword || newPassword.length < 6) {
                phoneError.textContent = "Password must be at least 6 characters";
                phoneError.classList.remove('d-none');
                return;
            }

            try {
                const response = await fetch('/api/auth/reset-password-phone', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phoneNumber, code: code, newPassword: newPassword })
                });
                const data = await response.json();
                
                if (data.success) {
                    alert("Password reset successful! Please login with your new password.");
                    location.reload();
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                phoneError.textContent = "RESET_ERROR: " + error.message;
                phoneError.classList.remove('d-none');
            }
        });
    }

    // UI Toggle Logic (Original Email/Signup)
    const loginView = document.getElementById('loginView');
    const signupView = document.getElementById('signupView');
    const showSignupPage = document.getElementById('showSignupPage');
    const showLoginPage = document.getElementById('showLoginPage');

    if (showSignupPage && showLoginPage) {
        showSignupPage.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.classList.add('d-none');
            signupView.classList.remove('d-none');
        });

        showLoginPage.addEventListener('click', (e) => {
            e.preventDefault();
            signupView.classList.add('d-none');
            loginView.classList.remove('d-none');
        });
    }

    // Signup Form Handler
    const signupForm = document.getElementById('signupForm');
    const signupError = document.getElementById('signupError');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('regEmail').value;
            const phone = document.getElementById('regPhone').value;
            const password = document.getElementById('regPassword').value;
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, phone, password })
                });
                const data = await response.json();
                
                if (response.ok && data.success) {
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userEmail', email);
                    window.location.href = '/dashboard';
                } else {
                    throw new Error(data.message || "Registration failed");
                }
            } catch (error) {
                console.error("Signup Error:", error);
                signupError.textContent = "SIGNUP_FAILURE: " + error.message;
                signupError.classList.remove('d-none');
            }
        });
    }
});

// Global Logout
window.logout = function() {
    try {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userEmail');
        window.location.replace('/login');
    } catch (error) {
        console.error("Logout Error:", error);
    }
};
