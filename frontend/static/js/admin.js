// ============================================
// ADMIN PANEL JAVASCRIPT - NIDS College Project
// ============================================

// Display floating alert message
function showAdminAlert(message, type) {
    let alertDiv = document.getElementById('adminAlert');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.id = 'adminAlert';
        alertDiv.className = 'floating-alert';
        document.body.appendChild(alertDiv);
    }
    
    alertDiv.textContent = message;
    alertDiv.className = `floating-alert ${type}`;
    
    setTimeout(() => {
        alertDiv.style.display = 'none';
        alertDiv.className = 'floating-alert';
    }, 3000);
}

// Toggle user status (activate/deactivate)
async function toggleUserStatus(userId, currentStatus) {
    const action = currentStatus === 1 ? 'deactivate' : 'activate';
    
    if (confirm(`Are you sure you want to ${action} this user?`)) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
            if (data.success) {
                showAdminAlert(`User ${action}d successfully!`, 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showAdminAlert(data.message, 'error');
            }
        } catch (error) {
            showAdminAlert('Network error. Please try again.', 'error');
        }
    }
}

// Delete user permanently
async function deleteUser(userId, userName) {
    if (confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
            if (data.success) {
                showAdminAlert(`User "${userName}" deleted successfully!`, 'success');
                setTimeout(() => location.reload(), 1500);
            } else {
                showAdminAlert(data.message, 'error');
            }
        } catch (error) {
            showAdminAlert('Network error. Please try again.', 'error');
        }
    }
}

// Search users in table
function initUserSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#usersTableBody tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
            const name = row.getAttribute('data-name') || '';
            const email = row.getAttribute('data-email') || '';
            
            if (name.includes(searchTerm) || email.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        const userCountSpan = document.getElementById('user-count');
        if (userCountSpan) {
            userCountSpan.textContent = visibleCount;
        }
    });
}

// Initialize admin dashboard
function initAdminDashboard() {
    console.log('Admin dashboard initialized');
    // Any additional initialization can go here
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initUserSearch();
    initAdminDashboard();
});