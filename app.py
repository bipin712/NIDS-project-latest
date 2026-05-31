from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_socketio import SocketIO, emit
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import random
import datetime
import json
import sqlite3
import re
from functools import wraps
from flask import Blueprint

# Initialize Flask app with correct paths
app = Flask(__name__, 
            template_folder='frontend/templates',
            static_folder='frontend/static')
app.config['SECRET_KEY'] = 'nids-secret-key-2024-change-this-in-production'
bcrypt = Bcrypt(app)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# ========== DATABASE SETUP ==========
def init_db():
    """Initialize SQLite database for user authentication"""
    conn = sqlite3.connect('nids_database.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            mobile TEXT NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    # Alerts table (for storing user-specific alerts)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            alert_type TEXT,
            severity TEXT,
            message TEXT,
            source_ip TEXT,
            destination_ip TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Admins table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    # DO NOT create default admin account - admins must register themselves
    # =====================================================
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

# ========== AUTHENTICATION DECORATOR ==========
def login_required(f):
    """Decorator to require login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Allow access if either a normal user or an admin is logged in
        if 'user_id' not in session and 'admin_id' not in session:
            return redirect(url_for('login_page'))
        return f(*args, **kwargs)
    return decorated_function


# ========== ADMIN AUTHENTICATION DECORATOR ==========
def admin_login_required(f):
    """Decorator to require admin login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return redirect(url_for('admin.admin_login_page'))
        return f(*args, **kwargs)
    return decorated_function

# ========== AUTHENTICATION ROUTES ==========
@app.route('/register')
def register_page():
    """Registration page"""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('register.html')

@app.route('/login')
def login_page():
    """Login page"""
    if 'user_id' in session:
        return render_template('login.html', already_logged_in=True, user_name=session.get('user_name'))
    return render_template('login.html')

@app.route('/api/register', methods=['POST'])
def register():
    """API endpoint for user registration"""
    try:
        data = request.json
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        mobile = data.get('mobile', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        
        # Validation
        if not all([name, email, mobile, password]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400
        
        if not re.match(r'^[0-9]{10}$', mobile):
            return jsonify({'success': False, 'message': 'Mobile number must be 10 digits'}), 400
        
        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
        
        if password != confirm_password:
            return jsonify({'success': False, 'message': 'Passwords do not match'}), 400
        
        # Check if user exists
        conn = sqlite3.connect('nids_database.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
        
        # Hash password and save user
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        cursor.execute('''
            INSERT INTO users (name, email, mobile, password)
            VALUES (?, ?, ?, ?)
        ''', (name, email, mobile, hashed_password))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Registration successful! Redirecting to login...',
            'redirect': '/login'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """API endpoint for user login"""
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password required'}), 400
        
        conn = sqlite3.connect('nids_database.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, email, mobile, password FROM users WHERE email = ? AND is_active = 1', (email,))
        user = cursor.fetchone()
        
        if not user or not bcrypt.check_password_hash(user[4], password):
            conn.close()
            return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
        
        # Update last login
        cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (user[0],))
        conn.commit()
        conn.close()

        # Clear any admin session keys to avoid role overlap
        session.pop('admin_id', None)
        session.pop('admin_name', None)
        session.pop('admin_email', None)
        session.pop('is_admin', None)

        session['user_id'] = user[0]
        session['user_name'] = user[1]
        session['user_email'] = user[2]
        
        return jsonify({
            'success': True,
            'message': 'Login successful!',
            'redirect': '/dashboard',
            'user': {
                'id': user[0],
                'name': user[1],
                'email': user[2],
                'mobile': user[3]
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """API endpoint for logout"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully', 'redirect': '/login'})

# ========== ADMIN Blueprint ==========
admin_bp = Blueprint('admin', __name__, template_folder='frontend/templates')

# ========== NEW: ADMIN AUTHENTICATION ROUTES ==========
@admin_bp.route('/admin-login')
def admin_login_page():
    """Admin Login page"""
    if 'admin_id' in session:
        return render_template('admin_login.html', already_logged_in=True, admin_name=session.get('admin_name'))
    return render_template('admin_login.html')

@admin_bp.route('/api/admin/login', methods=['POST'])
def admin_login():
    """API endpoint for admin login"""
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password required'}), 400
        
        conn = sqlite3.connect('nids_database.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, email, password FROM admins WHERE email = ? AND is_active = 1', (email,))
        admin = cursor.fetchone()
        
        if not admin or not bcrypt.check_password_hash(admin[3], password):
            conn.close()
            return jsonify({'success': False, 'message': 'Invalid admin credentials'}), 401
        
        # Update last login
        cursor.execute('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (admin[0],))
        conn.commit()
        conn.close()

        # Clear any user session keys to avoid role overlap
        session.pop('user_id', None)
        session.pop('user_name', None)
        session.pop('user_email', None)

        session['admin_id'] = admin[0]
        session['admin_name'] = admin[1]
        session['admin_email'] = admin[2]
        session['is_admin'] = True
        
        return jsonify({
            'success': True,
            'message': 'Admin login successful!',
            'redirect': '/admin-dashboard'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/admin-register')
def admin_register_page():
    """Admin registration page"""
    if 'admin_id' in session:
        return render_template('admin_register.html', already_logged_in=True, admin_name=session.get('admin_name'))
    return render_template('admin_register.html')


@admin_bp.route('/api/admin/register', methods=['POST'])
def admin_register():
    """API endpoint for admin registration"""
    try:
        data = request.json
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        admin_key = data.get('admin_key', '')

        # Basic validation
        if not all([name, email, password, admin_key]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400

        # Server-side admin key check
        if admin_key != 'ADMIN123':
            return jsonify({'success': False, 'message': 'Invalid admin registration key'}), 403

        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400

        if len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400

        if password != confirm_password:
            return jsonify({'success': False, 'message': 'Passwords do not match'}), 400

        # Check if admin exists
        conn = sqlite3.connect('nids_database.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM admins WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'success': False, 'message': 'Email already registered as admin'}), 400

        # Hash password and save admin
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        cursor.execute('''
            INSERT INTO admins (name, email, password)
            VALUES (?, ?, ?)
        ''', (name, email, hashed_password))
        conn.commit()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Admin registration successful! Redirecting to admin login...',
            'redirect': '/admin-login'
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/api/admin/logout', methods=['POST'])
def admin_logout_api():
    """API endpoint for admin logout"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully', 'redirect': '/admin-login'})

@admin_bp.route('/admin-dashboard')
@admin_login_required
def admin_dashboard():
    """Admin Dashboard page - requires admin login"""
    conn = sqlite3.connect('nids_database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM users')
    total_users = cursor.fetchone()[0]
    cursor.execute('SELECT COUNT(*) FROM users WHERE created_at >= date("now", "-7 days")')
    new_users_week = cursor.fetchone()[0]
    conn.close()
    
    summary = get_summary_stats()
    
    return render_template('admin_dashboard.html',
                         total_users=total_users,
                         new_users_week=new_users_week,
                         total_alerts=summary.get('total', 0),
                         total_attacks=summary.get('high', 0) + summary.get('medium', 0),
                         admin_name=session.get('admin_name'))

@admin_bp.route('/admin-users')
@admin_login_required
def admin_users():
    """Admin User Management page"""
    conn = sqlite3.connect('nids_database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, mobile, created_at, last_login, is_active FROM users ORDER BY id')
    users = cursor.fetchall()
    conn.close()
    
    user_list = []
    for user in users:
        user_list.append({
            'id': user[0],
            'name': user[1],
            'email': user[2],
            'mobile': user[3],
            'created_at': user[4],
            'last_login': user[5],
            'is_active': user[6]
        })
    
    return render_template('admin_users.html',
                         users=user_list,
                         admin_name=session.get('admin_name'))


# Admin Reports and Settings (admin-only views)
@admin_bp.route('/admin-reports')
@admin_login_required
def admin_reports():
    """Admin Reports page - requires admin login"""
    summary = get_summary_stats()
    performance = get_performance_metrics()
    last_reports = {
        'daily': '2024-04-06 23:59:59',
        'weekly': '2024-03-31 23:59:59',
        'monthly': '2024-03-01 00:00:00'
    }
    weekly_stats = {
        'total_attacks': 8950,
        'unique_sources': 247,
        'avg_severity': 2.4,
        'top_ip': '192.168.1.105'
    }
    monthly_stats = {
        'total_events': 38500,
        'total_attacks': 11250,
        'unique_sources': 845
    }
    attack_distribution = {
        'DoS': 42,
        'Probe': 28,
        'R2L': 15,
        'U2R': 8,
        'Normal': 7
    }

    # Redirect to shared reports view (login_required now allows admin sessions)
    return redirect(url_for('reports'))


@admin_bp.route('/admin-settings')
@admin_login_required
def admin_settings():
    """Admin Settings page - requires admin login"""
    # Use shared settings view; admin sessions pass the `login_required` check
    return redirect(url_for('settings'))


@admin_bp.route('/admin-logout')
def admin_logout_page():
    """Admin logout (GET) - clear session and redirect to admin login"""
    session.clear()
    return redirect(url_for('admin.admin_login_page'))

# ========== NEW: ADMIN API ENDPOINTS ==========
@admin_bp.route('/api/admin/users')
@admin_login_required
def api_admin_users():
    """API endpoint to get all users"""
    conn = sqlite3.connect('nids_database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, mobile, created_at, last_login, is_active FROM users ORDER BY id')
    users = cursor.fetchall()
    conn.close()
    
    user_list = []
    for user in users:
        user_list.append({
            'id': user[0],
            'name': user[1],
            'email': user[2],
            'mobile': user[3],
            'created_at': user[4],
            'last_login': user[5],
            'is_active': user[6]
        })
    
    return jsonify({'success': True, 'users': user_list})

@admin_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_login_required
def api_admin_delete_user(user_id):
    """API endpoint to delete a user"""
    try:
        conn = sqlite3.connect('nids_database.db')
        cursor = conn.cursor()
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'User deleted successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/api/admin/users/<int:user_id>/toggle-status', methods=['POST'])
@admin_login_required
def api_admin_toggle_user_status(user_id):
    """API endpoint to activate/deactivate a user"""
    try:
        conn = sqlite3.connect('nids_database.db')
        cursor = conn.cursor()
        cursor.execute('SELECT is_active FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        if user:
            new_status = 0 if user[0] == 1 else 1
            cursor.execute('UPDATE users SET is_active = ? WHERE id = ?', (new_status, user_id))
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'User status updated'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/check-auth')
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'name': session['user_name'],
                'email': session['user_email']
            }
        })
    return jsonify({'authenticated': False}), 401

@app.route('/api/user/profile')
@login_required
def api_user_profile():
    """API endpoint to get user profile details"""
    conn = sqlite3.connect('nids_database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, mobile, created_at, last_login FROM users WHERE id = ?', (session['user_id'],))
    user_data = cursor.fetchone()
    conn.close()
    
    if user_data:
        return jsonify({
            'success': True,
            'user': {
                'id': user_data[0],
                'name': user_data[1],
                'email': user_data[2],
                'mobile': user_data[3],
                'created_at': user_data[4],
                'last_login': user_data[5]
            }
        })
    return jsonify({'success': False, 'message': 'User not found'}), 404

@app.route('/api/user/change-password', methods=['POST'])
@login_required
def api_change_password():
    """API endpoint to change user password"""
    try:
        data = request.json
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not current_password or not new_password:
            return jsonify({'success': False, 'message': 'Current and new password required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'success': False, 'message': 'New password must be at least 6 characters'}), 400
        
        # Get current user
        conn = sqlite3.connect('nids_database.db')
        cursor = conn.cursor()
        cursor.execute('SELECT password FROM users WHERE id = ?', (session['user_id'],))
        user_data = cursor.fetchone()
        
        if not user_data:
            conn.close()
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Verify current password
        if not bcrypt.check_password_hash(user_data[0], current_password):
            conn.close()
            return jsonify({'success': False, 'message': 'Current password is incorrect'}), 401
        
        # Hash new password
        new_hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        # Update password
        cursor.execute('UPDATE users SET password = ? WHERE id = ?', (new_hashed_password, session['user_id']))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully!'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/user/send-reset-code', methods=['POST'])
def api_send_reset_code():
    """API endpoint to send password reset code via email or mobile"""
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        mobile = data.get('mobile', '').strip()
        method = data.get('method', '')  # 'email' or 'mobile'
        
        if method not in ['email', 'mobile']:
            return jsonify({'success': False, 'message': 'Invalid method'}), 400
        
        conn = sqlite3.connect('nids_database.db')
        cursor = conn.cursor()
        
        if method == 'email':
            if not email:
                conn.close()
                return jsonify({'success': False, 'message': 'Email required'}), 400
            
            cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
            user = cursor.fetchone()
            
            if not user:
                conn.close()
                return jsonify({'success': False, 'message': 'Email not found in our system'}), 404
        
        elif method == 'mobile':
            if not mobile:
                conn.close()
                return jsonify({'success': False, 'message': 'Mobile number required'}), 400
            
            cursor.execute('SELECT id FROM users WHERE mobile = ?', (mobile,))
            user = cursor.fetchone()
            
            if not user:
                conn.close()
                return jsonify({'success': False, 'message': 'Mobile number not found in our system'}), 404
        
        # Generate a 6-digit reset code
        reset_code = str(random.randint(100000, 999999))
        
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Reset code sent successfully! (Dev: {reset_code})',
            'reset_code': reset_code
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/user/reset-password-email', methods=['POST'])
def api_reset_password_email():
    """API endpoint to reset password via email"""
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        reset_code = data.get('reset_code', '').strip()
        new_password = data.get('new_password', '')
        
        if not email or not reset_code or not new_password:
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
        
        conn = sqlite3.connect('nids_database.db')
        cursor = conn.cursor()
        
        # Verify user exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        if not reset_code.isdigit() or len(reset_code) != 6:
            conn.close()
            return jsonify({'success': False, 'message': 'Invalid verification code'}), 400
        
        # Hash new password
        new_hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        # Update password
        cursor.execute('UPDATE users SET password = ? WHERE id = ?', (new_hashed_password, user[0]))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Password reset successfully! You can now login with your new password.'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/user/reset-password-mobile', methods=['POST'])
def api_reset_password_mobile():
    """API endpoint to reset password via mobile number"""
    try:
        data = request.json
        mobile = data.get('mobile', '').strip()
        reset_code = data.get('reset_code', '').strip()
        new_password = data.get('new_password', '')
        
        if not mobile or not reset_code or not new_password:
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
        
        conn = sqlite3.connect('nids_database.db')
        cursor = conn.cursor()
        
        # Verify user exists
        cursor.execute('SELECT id FROM users WHERE mobile = ?', (mobile,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        if not reset_code.isdigit() or len(reset_code) != 6:
            conn.close()
            return jsonify({'success': False, 'message': 'Invalid verification code'}), 400
        
        # Hash new password
        new_hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        # Update password
        cursor.execute('UPDATE users SET password = ? WHERE id = ?', (new_hashed_password, user[0]))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Password reset successfully! You can now login with your new password.'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ========== MOCK DATA AND EXISTING FUNCTIONALITY ==========
# Mock data storage
mock_alerts = []
mock_packets = []

# Settings configuration
settings_config = {
    'dos_threshold': 100,
    'probe_threshold': 50,
    'r2l_threshold': 30,
    'u2r_threshold': 20,
    'ml_confidence_threshold': 0.85,
    'alert_retention_days': 30,
    'auto_ban_enabled': True,
    'email_alerts_enabled': False,
    'capture_interface': 'eth0',
    'packet_limit': 10000
}

def generate_mock_alert():
    """Generate a mock alert for testing"""
    attack_types = ['DoS', 'Probe', 'R2L', 'U2R', 'Normal']
    severities = ['HIGH', 'MEDIUM', 'LOW', 'SAFE']
    protocols = ['TCP', 'UDP', 'ICMP']
    
    attack = random.choice(attack_types)
    is_attack = attack != 'Normal'
    
    # Generate realistic IP addresses
    src_ip = f"192.168.{random.randint(1, 255)}.{random.randint(1, 255)}"
    dst_ip = f"10.0.{random.randint(1, 255)}.{random.randint(1, 255)}"
    
    # Generate timestamp (last 24 hours)
    hours_ago = random.randint(0, 24)
    alert_time = datetime.datetime.now() - datetime.timedelta(hours=hours_ago)
    
    return {
        'id': len(mock_alerts) + 1,
        'timestamp': alert_time.strftime('%Y-%m-%d %H:%M:%S'),
        'src_ip': src_ip,
        'dst_ip': dst_ip,
        'protocol': random.choice(protocols),
        'attack_type': attack,
        'severity': random.choice(severities) if is_attack else 'SAFE',
        'is_attack': is_attack,
        'combined_score': round(random.uniform(0.85 if is_attack else 0.1, 0.99), 3),
        'ml_confidence': round(random.uniform(0.80, 0.99), 3),
        'packet_count': random.randint(10, 1000),
        'rule_fired': f"RULE_{attack.upper()}_001" if is_attack else "NORMAL_TRAFFIC",
        'explanation': [
            {'feature': 'src_bytes', 'impact': round(random.uniform(-0.3, 0.3), 3)},
            {'feature': 'duration', 'impact': round(random.uniform(-0.2, 0.2), 3)},
            {'feature': 'protocol_type', 'impact': round(random.uniform(-0.1, 0.1), 3)}
        ] if is_attack else []
    }

# Generate initial mock data (50 alerts)
for _ in range(50):
    mock_alerts.append(generate_mock_alert())

# Sort by timestamp (newest first)
mock_alerts.sort(key=lambda x: x['timestamp'], reverse=True)

def get_summary_stats():
    """Calculate summary statistics from alerts"""
    total = len(mock_alerts)
    high = sum(1 for a in mock_alerts if a.get('severity') == 'HIGH')
    medium = sum(1 for a in mock_alerts if a.get('severity') == 'MEDIUM')
    safe = sum(1 for a in mock_alerts if a.get('attack_type') == 'Normal')
    unique_sources = len(set(a.get('src_ip') for a in mock_alerts))
    
    # Calculate attack type distribution
    attack_distribution = {}
    for alert in mock_alerts:
        attack_type = alert.get('attack_type', 'Unknown')
        attack_distribution[attack_type] = attack_distribution.get(attack_type, 0) + 1
    
    # Calculate hourly trends
    hourly_trends = {}
    for hour in range(24):
        hourly_trends[f"{hour:02d}:00"] = 0
    
    for alert in mock_alerts:
        try:
            alert_time = datetime.datetime.strptime(alert['timestamp'], '%Y-%m-%d %H:%M:%S')
            hour_key = f"{alert_time.hour:02d}:00"
            hourly_trends[hour_key] = hourly_trends.get(hour_key, 0) + 1
        except:
            pass
    
    return {
        'total': total,
        'high': high,
        'medium': medium,
        'safe': safe,
        'unique_sources': unique_sources,
        'attack_distribution': attack_distribution,
        'hourly_trends': hourly_trends
    }

def get_performance_metrics():
    """Get ML model performance metrics"""
    return {
        'accuracy': 97.4,
        'precision': 96.8,
        'recall': 97.2,
        'f1_score': 97.0,
        'auc_roc': 0.994,
        'false_positive_rate': 1.8,
        'false_negative_rate': 2.6
    }

# ========== PROTECTED ROUTES (with authentication) ==========
@app.route('/')
def index():
    """Home page - redirects to login if not authenticated"""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login_page'))

@app.route('/dashboard')
@login_required
def dashboard():
    """Dashboard page - requires authentication"""
    summary = get_summary_stats()
    performance = get_performance_metrics()
    return render_template('dashboard.html', 
                         summary=summary, 
                         performance=performance,
                         alerts=mock_alerts[:10],
                         user_name=session.get('user_name'),
                         interfaces=['eth0', 'wlan0', 'lo'])

@app.route('/alerts')
@login_required
def alerts():
    """Alerts page - requires authentication"""
    summary = get_summary_stats()
    return render_template('alerts.html', 
                         alerts=mock_alerts, 
                         summary=summary,
                         alerts_json=json.dumps(mock_alerts),
                         user_name=session.get('user_name'))

@app.route('/historical')
@login_required
def historical():
    """Historical analytics page - requires authentication"""
    summary = get_summary_stats()
    performance = get_performance_metrics()
    return render_template('historical.html', 
                         summary=summary,
                         performance=performance,
                         alerts=mock_alerts,
                         user_name=session.get('user_name'))

@app.route('/reports')
@login_required
def reports():
    """Reports page - requires authentication"""
    summary = get_summary_stats()
    performance = get_performance_metrics()
    
    last_reports = {
        'daily': '2024-04-06 23:59:59',
        'weekly': '2024-03-31 23:59:59',
        'monthly': '2024-03-01 00:00:00'
    }
    
    weekly_stats = {
        'total_attacks': 8950,
        'unique_sources': 247,
        'avg_severity': 2.4,
        'top_ip': '192.168.1.105'
    }
    
    monthly_stats = {
        'total_events': 38500,
        'total_attacks': 11250,
        'unique_sources': 845
    }
    
    attack_distribution = {
        'DoS': 42,
        'Probe': 28,
        'R2L': 15,
        'U2R': 8,
        'Normal': 7
    }
    
    return render_template('reports.html',
                         summary=summary,
                         performance=performance,
                         last_reports=last_reports,
                         weekly_stats=weekly_stats,
                         monthly_stats=monthly_stats,
                         attack_distribution=attack_distribution,
                         top_attack_type='DoS',
                         model_version='2.4.1',
                         model_last_trained='2024-04-01 10:30:00',
                         user_name=session.get('user_name'))

@app.route('/settings')
@login_required
def settings():
    """Settings page - requires authentication"""
    return render_template('settings.html', 
                         settings=settings_config,
                         user_name=session.get('user_name'))

@app.route('/profile')
@login_required
def profile():
    """User profile page - requires authentication"""
    conn = sqlite3.connect('nids_database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, mobile, created_at, last_login FROM users WHERE id = ?', (session['user_id'],))
    user_data = cursor.fetchone()
    conn.close()
    
    if user_data:
        user_info = {
            'id': user_data[0],
            'name': user_data[1],
            'email': user_data[2],
            'mobile': user_data[3],
            'created_at': user_data[4],
            'last_login': user_data[5]
        }
    else:
        user_info = {}
    
    return render_template('profile.html', user=user_info, user_name=session.get('user_name'))

@app.route('/logout')
@login_required
def logout_page():
    """Logout route - clears session and redirects to home"""
    session.clear()
    return redirect(url_for('index'))

# ========== API ENDPOINTS (with authentication) ==========
@app.route('/api/alerts')
@login_required
def api_alerts():
    return jsonify(mock_alerts)

@app.route('/api/alerts/recent')
@login_required
def api_recent_alerts():
    return jsonify(mock_alerts[:20])

@app.route('/api/alerts/<int:alert_id>')
@login_required
def api_alert_detail(alert_id):
    alert = next((a for a in mock_alerts if a['id'] == alert_id), None)
    if alert:
        return jsonify(alert)
    return jsonify({'error': 'Alert not found'}), 404

@app.route('/api/alerts/export')
@login_required
def export_alerts():
    format_type = request.args.get('format', 'csv')
    
    if format_type == 'csv':
        import csv
        from io import StringIO
        
        output = StringIO()
        if mock_alerts:
            writer = csv.DictWriter(output, fieldnames=mock_alerts[0].keys())
            writer.writeheader()
            writer.writerows(mock_alerts)
        
        response = app.response_class(
            response=output.getvalue(),
            status=200,
            mimetype='text/csv'
        )
        response.headers['Content-Disposition'] = 'attachment; filename=alerts_export.csv'
        return response
    
    return jsonify(mock_alerts)

@app.route('/api/summary')
@login_required
def api_summary():
    return jsonify(get_summary_stats())

@app.route('/api/performance')
@login_required
def api_performance():
    return jsonify(get_performance_metrics())

@app.route('/api/attack-trends')
@login_required
def api_attack_trends():
    trends = {}
    now = datetime.datetime.now()
    
    attack_types = ['DoS', 'Probe', 'R2L', 'U2R', 'Normal']
    for hour in range(24):
        hour_key = f"{hour:02d}:00"
        trends[hour_key] = {attack: 0 for attack in attack_types}
    
    for alert in mock_alerts:
        try:
            alert_time = datetime.datetime.strptime(alert['timestamp'], '%Y-%m-%d %H:%M:%S')
            hours_ago = (now - alert_time).total_seconds() / 3600
            if hours_ago <= 24:
                hour_key = f"{alert_time.hour:02d}:00"
                attack_type = alert['attack_type']
                if attack_type in trends[hour_key]:
                    trends[hour_key][attack_type] += 1
        except:
            pass
    
    return jsonify(trends)

@app.route('/api/settings', methods=['GET', 'POST'])
@login_required
def api_settings():
    global settings_config
    
    if request.method == 'POST':
        data = request.json
        for key, value in data.items():
            if key in settings_config:
                settings_config[key] = value
        return jsonify({'status': 'success', 'settings': settings_config})
    
    return jsonify(settings_config)

@app.route('/api/alerts/clear', methods=['DELETE'])
@login_required
def clear_alerts():
    global mock_alerts
    mock_alerts = []
    return jsonify({'status': 'success', 'message': 'All alerts cleared'})

# ========== WEBSOCKET EVENTS ==========
@socketio.on('connect')
def handle_connect():
    print('[+] Client connected to NIDS server')
    emit('connected', {'data': 'Connected to NIDS server', 'status': 'success'})

@socketio.on('disconnect')
def handle_disconnect():
    print('[-] Client disconnected')

@socketio.on('request_alerts')
def handle_request_alerts():
    emit('alerts_update', mock_alerts)

@socketio.on('request_summary')
def handle_request_summary():
    emit('summary_update', get_summary_stats())

@socketio.on('start_capture')
def handle_start_capture():
    print('[+] Packet capture started')
    emit('capture_started', {'status': 'started', 'message': 'Packet capture started successfully'})

@socketio.on('stop_capture')
def handle_stop_capture():
    print('[-] Packet capture stopped')
    emit('capture_stopped', {'status': 'stopped', 'message': 'Packet capture stopped'})

# ========== MAIN ENTRY POINT ==========
if __name__ == '__main__':
    print("\n" + "="*60)
    print("🛡️  SHIELDNET NIDS SERVER STARTED")
    print("="*60)
    print(f"📍 Server URL:        http://localhost:5000")
    print(f"🔐 User Login:        http://localhost:5000/login")
    print(f"📝 User Register:     http://localhost:5000/register")
    print(f"👑 Admin Login:       http://localhost:5000/admin-login")
    print(f"📝 Admin Register:    http://localhost:5000/admin-register")
    print(f"📊 User Dashboard:    http://localhost:5000/dashboard")
    print(f"👑 Admin Dashboard:   http://localhost:5000/admin-dashboard")
    print("="*60)
    print(f"📡 WebSocket:         ws://localhost:5000/socket.io")
    print(f"📊 Total Alerts:      {len(mock_alerts)}")
    print(f"🎯 Detection Rate:    97.4%")
    print("="*60)
    print("💡 Default Admin Credentials:")
    print("   Email: admin@nids.com")
    print("   Password: admin123")
    print("="*60)
    print("💡 Press CTRL+C to stop the server")
    print("="*60 + "\n")
    
    import sys
    sys.stdout.flush()
    
    # register admin blueprint
    app.register_blueprint(admin_bp)

    socketio.run(app, debug=True, host='0.0.0.0', port=5000)