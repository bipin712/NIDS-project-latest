// Login page functionality
const form = document.getElementById('loginForm');
const alertDiv = document.getElementById('alert');

// Check for remembered email
if (localStorage.getItem('remembered_email')) {
    const emailInput = document.getElementById('email');
    const rememberCheck = document.getElementById('remember');
    if (emailInput && rememberCheck) {
        emailInput.value = localStorage.getItem('remembered_email');
        rememberCheck.checked = true;
    }
}

function validateEmail(email) {
    const error = document.getElementById('emailError');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        if (error) error.classList.add('show');
        return false;
    }
    if (error) error.classList.remove('show');
    return true;
}

function validatePassword(password) {
    const error = document.getElementById('passwordError');
    if (password.length === 0) {
        if (error) error.classList.add('show');
        return false;
    }
    if (error) error.classList.remove('show');
    return true;
}

function showAlert(message, type) {
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.display = 'block';
    
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 5000);
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        if (!validateEmail(email) || !validatePassword(password)) {
            showAlert('Please enter valid credentials', 'error');
            return;
        }
        
        // Handle remember me
        if (remember) {
            localStorage.setItem('remembered_email', email);
        } else {
            localStorage.removeItem('remembered_email');
        }
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showAlert(data.message, 'success');
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1000);
            } else {
                showAlert(data.message, 'error');
            }
        } catch (error) {
            showAlert('Network error. Please try again.', 'error');
        }
    });
    
    // Add Enter key support
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                form.dispatchEvent(new Event('submit'));
            }
        });
    }
}

// ========== FORGOT PASSWORD FUNCTIONALITY ==========
function openForgotPasswordModal(event) {
    event.preventDefault();
    document.getElementById('forgotPasswordModal').classList.add('active');
    showResetMethodSelection();
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').classList.remove('active');
    showResetMethodSelection();
    // Reset form fields
    resetEmailFormFields();
    resetMobileFormFields();
}

function showResetMethodSelection() {
    document.getElementById('forgotPasswordStep1').style.display = 'block';
    document.getElementById('forgotPasswordStep2').style.display = 'none';
    document.getElementById('forgotPasswordStep3').style.display = 'none';
}

function showResetViaEmail() {
    document.getElementById('forgotPasswordStep1').style.display = 'none';
    document.getElementById('forgotPasswordStep2').style.display = 'block';
    document.getElementById('forgotPasswordStep3').style.display = 'none';
}

function showResetViaMobile() {
    document.getElementById('forgotPasswordStep1').style.display = 'none';
    document.getElementById('forgotPasswordStep2').style.display = 'none';
    document.getElementById('forgotPasswordStep3').style.display = 'block';
}

function goBackResetMethod() {
    showResetMethodSelection();
    resetEmailFormFields();
    resetMobileFormFields();
}

function resetEmailFormFields() {
    document.getElementById('resetEmail').value = '';
    document.getElementById('resetCode').value = '';
    document.getElementById('newResetPassword').value = '';
    document.getElementById('confirmResetPassword').value = '';
    document.getElementById('resetCode').disabled = true;
    document.getElementById('newResetPassword').disabled = true;
    document.getElementById('confirmResetPassword').disabled = true;
    document.getElementById('emailCodeSentMessage').style.display = 'none';
    document.getElementById('emailCodeError').style.display = 'none';
    document.getElementById('sendCodeEmailBtn').disabled = false;
    document.getElementById('sendCodeEmailBtn').textContent = 'Send Code to Email';
}

function resetMobileFormFields() {
    document.getElementById('resetMobile').value = '';
    document.getElementById('resetCodeMobile').value = '';
    document.getElementById('newResetPasswordMobile').value = '';
    document.getElementById('confirmResetPasswordMobile').value = '';
    document.getElementById('resetCodeMobile').disabled = true;
    document.getElementById('newResetPasswordMobile').disabled = true;
    document.getElementById('confirmResetPasswordMobile').disabled = true;
    document.getElementById('mobileCodeSentMessage').style.display = 'none';
    document.getElementById('mobileCodeError').style.display = 'none';
    document.getElementById('sendCodeMobileBtn').disabled = false;
    document.getElementById('sendCodeMobileBtn').textContent = 'Send Code to Mobile';
}

// Starts a resend cooldown timer (seconds) and updates UI elements
function startResendTimer(btnId, timerValueId, displayContainerId, durationSeconds) {
    const btn = document.getElementById(btnId);
    const timerValue = document.getElementById(timerValueId);
    const displayContainer = document.getElementById(displayContainerId);

    if (!btn || !timerValue) return;

    let remaining = durationSeconds;
    // show timer container if exists
    if (displayContainer) displayContainer.style.display = 'block';

    btn.disabled = true;

    const update = () => {
        const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
        const secs = String(remaining % 60).padStart(2, '0');
        timerValue.textContent = `${mins}:${secs}`;
        if (remaining <= 0) {
            clearInterval(intervalId);
            // re-enable button
            btn.disabled = false;
            btn.textContent = 'Resend Code';
            if (displayContainer) displayContainer.style.display = 'none';
        }
        remaining -= 1;
    };

    update();
    const intervalId = setInterval(update, 1000);
}

function sendResetCodeEmail() {
    const email = document.getElementById('resetEmail').value.trim();
    const btn = document.getElementById('sendCodeEmailBtn');
    const errorDiv = document.getElementById('emailCodeError');
    const successDiv = document.getElementById('emailCodeSentMessage');
    const codeBox = document.getElementById('emailCodeBox');
    const codeValue = document.getElementById('emailCodeValue');
    const codeText = document.getElementById('emailCodeText');
    const timerContainer = document.getElementById('emailTimer');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    if (codeBox) codeBox.style.display = 'none';
    if (codeText) codeText.style.display = 'none';
    if (timerContainer) timerContainer.style.display = 'none';
    
    if (!email) {
        errorDiv.textContent = '⚠ Please enter your email address';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        errorDiv.textContent = '⚠ Please enter a valid email address';
        errorDiv.style.display = 'block';
        return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Sending...';
    
    // Call API to send reset code
    fetch('/api/user/send-reset-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            method: 'email'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            successDiv.style.display = 'block';
            // display demo code in UI (for development/testing only)
            if (data.reset_code && codeBox && codeValue) {
                codeValue.textContent = data.reset_code;
                codeBox.style.display = 'block';
            }
            // Enable the code and password fields
            document.getElementById('resetCode').disabled = false;
            document.getElementById('newResetPassword').disabled = false;
            document.getElementById('confirmResetPassword').disabled = false;
            
            // Disable email field after successful send
            document.getElementById('resetEmail').disabled = true;
            btn.disabled = true;
            btn.textContent = 'Code Sent ✓';
            
            // For demo purposes, show the code in console
            console.log('Reset Code (Demo):', data.reset_code);
            // start 5-minute resend cooldown
            startResendTimer('sendCodeEmailBtn', 'emailTimerValue', 'emailTimer', 300);
        } else {
            errorDiv.textContent = '⚠ ' + data.message;
            errorDiv.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Send Code to Email';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorDiv.textContent = '⚠ An error occurred. Please try again.';
        errorDiv.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Send Code to Email';
    });
}

function sendResetCodeMobile() {
    const mobile = document.getElementById('resetMobile').value.trim();
    const btn = document.getElementById('sendCodeMobileBtn');
    const errorDiv = document.getElementById('mobileCodeError');
    const successDiv = document.getElementById('mobileCodeSentMessage');
    const codeBox = document.getElementById('mobileCodeBox');
    const codeValue = document.getElementById('mobileCodeValue');
    const codeText = document.getElementById('mobileCodeText');
    const timerContainer = document.getElementById('mobileTimer');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    if (codeBox) codeBox.style.display = 'none';
    if (codeText) codeText.style.display = 'none';
    if (timerContainer) timerContainer.style.display = 'none';
    
    if (!mobile) {
        errorDiv.textContent = '⚠ Please enter your mobile number';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validate mobile format (10 digits)
    if (!/^[0-9]{10}$/.test(mobile)) {
        errorDiv.textContent = '⚠ Please enter a valid 10-digit mobile number';
        errorDiv.style.display = 'block';
        return;
    }
    
    btn.disabled = true;
    btn.textContent = 'Sending...';
    
    // Call API to send reset code
    fetch('/api/user/send-reset-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            mobile: mobile,
            method: 'mobile'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            successDiv.style.display = 'block';
            if (data.reset_code && codeBox && codeValue) {
                codeValue.textContent = data.reset_code;
                codeBox.style.display = 'block';
            }
            // Enable the code and password fields
            document.getElementById('resetCodeMobile').disabled = false;
            document.getElementById('newResetPasswordMobile').disabled = false;
            document.getElementById('confirmResetPasswordMobile').disabled = false;
            
            // Disable mobile field after successful send
            document.getElementById('resetMobile').disabled = true;
            btn.disabled = true;
            btn.textContent = 'Code Sent ✓';
            
            // For demo purposes, show the code in console
            console.log('Reset Code (Demo):', data.reset_code);
            // start 5-minute resend cooldown
            startResendTimer('sendCodeMobileBtn', 'mobileTimerValue', 'mobileTimer', 300);
        } else {
            errorDiv.textContent = '⚠ ' + data.message;
            errorDiv.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Send Code to Mobile';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorDiv.textContent = '⚠ An error occurred. Please try again.';
        errorDiv.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Send Code to Mobile';
    });
}

function submitResetPassword() {
    const step1 = document.getElementById('forgotPasswordStep1').style.display;
    const step2 = document.getElementById('forgotPasswordStep2').style.display;
    const step3 = document.getElementById('forgotPasswordStep3').style.display;
    
    if (step2 === 'block') {
        // Email reset
        const email = document.getElementById('resetEmail').value;
        const resetCode = document.getElementById('resetCode').value;
        const newPassword = document.getElementById('newResetPassword').value;
        const confirmPassword = document.getElementById('confirmResetPassword').value;
        
        if (!email || !resetCode || !newPassword || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        // Call API to reset password via email
        fetch('/api/user/reset-password-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                reset_code: resetCode,
                new_password: newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                closeForgotPasswordModal();
                // Optionally redirect to login page
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
        
    } else if (step3 === 'block') {
        // Mobile reset
        const mobile = document.getElementById('resetMobile').value;
        const resetCode = document.getElementById('resetCodeMobile').value;
        const newPassword = document.getElementById('newResetPasswordMobile').value;
        const confirmPassword = document.getElementById('confirmResetPasswordMobile').value;
        
        if (!mobile || !resetCode || !newPassword || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        // Call API to reset password via mobile
        fetch('/api/user/reset-password-mobile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mobile: mobile,
                reset_code: resetCode,
                new_password: newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                closeForgotPasswordModal();
                // Optionally redirect to login page
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('forgotPasswordModal');
    if (event.target === modal) {
        closeForgotPasswordModal();
    }
}