// Profile Page Functionality

// Scroll to top button functionality
window.addEventListener('scroll', function() {
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if (window.scrollY > 300) {
        scrollBtn.classList.add('show');
    } else {
        scrollBtn.classList.remove('show');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ========== EDIT PROFILE MODAL ==========
function editProfile() {
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

function saveProfile() {
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    const mobile = document.getElementById('editMobile').value;
    
    if (!name || !email || !mobile) {
        alert('Please fill in all fields');
        return;
    }
    
    // Here you would typically make an API call to update the profile
    console.log('Profile updated:', { name, email, mobile });
    closeEditModal();
    // Reload page to reflect changes
    location.reload();
}

// ========== CHANGE PASSWORD MODAL ==========
function changePassword() {
    document.getElementById('changePasswordModal').classList.add('active');
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('active');
    document.getElementById('changePasswordForm').reset();
}

function submitChangePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('New password must be at least 6 characters long');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }
    
    if (currentPassword === newPassword) {
        alert('New password must be different from current password');
        return;
    }
    
    // Call API to change password
    fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            closeChangePasswordModal();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

// ========== FORGOT PASSWORD MODAL ==========
function showForgotPasswordModal() {
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

function sendResetCodeEmail() {
    const email = document.getElementById('resetEmail').value.trim();
    const btn = document.getElementById('sendCodeEmailBtn');
    const errorDiv = document.getElementById('emailCodeError');
    const successDiv = document.getElementById('emailCodeSentMessage');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
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
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
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

// ========== OTHER FUNCTIONS ==========
function enable2FA() {
    alert('Two-Factor Authentication setup coming soon!');
}

function viewSessions() {
    alert('Session management coming soon!');
}

function deleteAccount() {
    const confirmDelete = confirm('Are you sure you want to permanently delete your account? This action cannot be undone.');
    
    if (confirmDelete) {
        const secondConfirm = confirm('Type "DELETE" to confirm account deletion.');
        if (secondConfirm) {
            alert('Account deletion feature coming soon!');
        }
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    const changePasswordModal = document.getElementById('changePasswordModal');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    
    if (event.target === editModal) {
        closeEditModal();
    }
    if (event.target === changePasswordModal) {
        closeChangePasswordModal();
    }
    if (event.target === forgotPasswordModal) {
        closeForgotPasswordModal();
    }
}

// Load user profile data on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
});

// Allow forgot password to be accessed from login page too
function openForgotPasswordFromLogin() {
    showForgotPasswordModal();
}
