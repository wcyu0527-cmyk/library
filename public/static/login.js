/**
 * Login Page JavaScript
 * Handles user authentication and form interactions
 */

// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const loginButton = document.getElementById('loginButton');
const errorMessage = document.getElementById('errorMessage');

// Check if already logged in
checkAuthStatus();

// Form submission handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Validate inputs
    if (!username || !password) {
        showError('請輸入帳號和密碼');
        return;
    }

    // Show loading state
    setLoading(true);
    hideError();

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Store user info in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data.user));

            // If remember me is checked, also store in localStorage
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('username', username);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('username');
            }

            // Show success and redirect
            showSuccess('登入成功！正在跳轉...');

            setTimeout(() => {
                window.location.href = '/';
            }, 800);
        } else {
            // Show error message
            showError(data.error || '登入失敗，請檢查您的帳號密碼');
            setLoading(false);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('連線錯誤，請稍後再試');
        setLoading(false);
    }
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.authenticated) {
            // Already logged in, redirect to main page
            window.location.href = '/';
        } else {
            // Not logged in, check if remember me was enabled
            if (localStorage.getItem('rememberMe') === 'true') {
                const savedUsername = localStorage.getItem('username');
                if (savedUsername) {
                    usernameInput.value = savedUsername;
                    rememberMeCheckbox.checked = true;
                    passwordInput.focus();
                }
            }
        }
    } catch (error) {
        console.error('Auth check error:', error);
        // Continue to show login page
    }
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    // Shake animation
    errorMessage.style.animation = 'none';
    setTimeout(() => {
        errorMessage.style.animation = 'shake 0.4s ease';
    }, 10);
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Show success message
function showSuccess(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.background = 'rgba(40, 167, 69, 0.1)';
    errorMessage.style.borderColor = '#28a745';
    errorMessage.style.color = '#28a745';
}

// Set loading state
function setLoading(isLoading) {
    if (isLoading) {
        loginButton.disabled = true;
        loginButton.classList.add('loading');
        loginButton.querySelector('.btn-text').textContent = '登入中...';
    } else {
        loginButton.disabled = false;
        loginButton.classList.remove('loading');
        loginButton.querySelector('.btn-text').textContent = '登入';
    }
}

// Input field animations
[usernameInput, passwordInput].forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'translateY(-2px)';
    });

    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'translateY(0)';
    });
});

// Clear error on input
usernameInput.addEventListener('input', hideError);
passwordInput.addEventListener('input', hideError);

// Enter key handling
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});

// Prevent multiple form submissions
let isSubmitting = false;
loginForm.addEventListener('submit', (e) => {
    if (isSubmitting) {
        e.preventDefault();
        return false;
    }
    isSubmitting = true;

    // Reset after 3 seconds as a safety measure
    setTimeout(() => {
        isSubmitting = false;
    }, 3000);
});
