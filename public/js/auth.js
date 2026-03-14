// Backend-driven Authentication implementation

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
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

    // UI Toggle Logic
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
            const password = document.getElementById('regPassword').value;
            
            try {
                const response = await fetch('/api/auth/register', {
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
