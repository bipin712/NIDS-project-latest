// Dashboard JavaScript - NIDS College Project

// Global variables
let isCapturing = false;
let captureInterval = null;
let alertCount = 0;
let attackCount = 0;

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized');
    updateStats();
});

// Toggle packet capture
function toggleCapture() {
    const btn = document.getElementById('capture-btn');
    
    if (!isCapturing) {
        // Start capture
        startCapture();
        btn.innerHTML = '⏸ PAUSE CAPTURE';
        btn.classList.add('capturing');
        isCapturing = true;
        
        // Show live indicators
        const liveBadges = document.querySelectorAll('.badge-live');
        liveBadges.forEach(badge => {
            if (badge) badge.style.display = 'inline-block';
        });
        
        // Show ticker bar
        const ticker = document.getElementById('ticker-bar');
        if (ticker) ticker.style.display = 'block';
        
        // Hide placeholders, show charts
        const trafficPlaceholder = document.getElementById('traffic-placeholder');
        const trafficCanvas = document.getElementById('traffic-canvas');
        if (trafficPlaceholder) trafficPlaceholder.style.display = 'none';
        if (trafficCanvas) trafficCanvas.style.display = 'block';
        
        const distPlaceholder = document.getElementById('dist-placeholder');
        const distCanvas = document.getElementById('dist-canvas');
        if (distPlaceholder) distPlaceholder.style.display = 'none';
        if (distCanvas) distCanvas.style.display = 'block';
        
        // Start simulation
        startSimulation();
        
        showNotification('Capture started', 'success');
        
    } else {
        // Stop capture
        stopCapture();
        btn.innerHTML = '▶ START CAPTURE';
        btn.classList.remove('capturing');
        isCapturing = false;
        
        // Hide live indicators
        const liveBadges = document.querySelectorAll('.badge-live');
        liveBadges.forEach(badge => {
            if (badge) badge.style.display = 'none';
        });
        
        // Hide ticker bar
        const ticker = document.getElementById('ticker-bar');
        if (ticker) ticker.style.display = 'none';
        
        stopSimulation();
        
        showNotification('Capture stopped', 'info');
    }
}

// Start simulation (for demo purposes)
function startSimulation() {
    if (captureInterval) clearInterval(captureInterval);
    
    // Simulate packet capture every 3 seconds
    captureInterval = setInterval(function() {
        generateMockAlert();
    }, 3000);
}

// Stop simulation
function stopSimulation() {
    if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
    }
}

// Generate mock alert for testing
function generateMockAlert() {
    const attackTypes = ['DoS', 'Probe', 'R2L', 'U2R', 'Normal'];
    const severities = ['HIGH', 'MEDIUM', 'LOW', 'SAFE'];
    const protocols = ['TCP', 'UDP', 'ICMP'];
    const srcIPs = ['192.168.1.105', '10.0.0.45', '172.16.8.22', '192.168.1.200'];
    
    const isAttack = Math.random() > 0.6;
    const attackType = isAttack ? attackTypes[Math.floor(Math.random() * 4)] : 'Normal';
    const severity = isAttack ? severities[Math.floor(Math.random() * 3)] : 'SAFE';
    
    const alert = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        src_ip: srcIPs[Math.floor(Math.random() * srcIPs.length)],
        dst_ip: '192.168.56.101',
        protocol: protocols[Math.floor(Math.random() * 3)],
        attack_type: attackType,
        severity: severity,
        is_attack: isAttack,
        combined_score: isAttack ? (0.7 + Math.random() * 0.29).toFixed(3) : (0.1 + Math.random() * 0.3).toFixed(3)
    };
    
    addAlertToTable(alert);
    updateStats();
    
    // Show browser notification for HIGH severity
    if (severity === 'HIGH') {
        showBrowserNotification(alert);
    }
    
    // Add to ticker
    addToTicker(alert);
    
    // Update SHAP explanation
    updateShapExplanation(alert);
}

// Add alert to the table
function addAlertToTable(alert) {
    const tbody = document.getElementById('alert-tbody');
    const alertWrap = document.getElementById('alert-wrap');
    const alertEmpty = document.getElementById('alert-empty');
    
    // Hide empty state if showing
    if (alertEmpty && alertEmpty.style.display !== 'none') {
        alertEmpty.style.display = 'none';
        if (alertWrap) alertWrap.style.display = 'block';
    }
    
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.className = alert.is_attack ? 'row-attack' : 'row-normal';
    row.innerHTML = `
        <td class="mono-cell" style="font-size: 11px;">${alert.timestamp}</td>
        <td class="mono-cell">${alert.src_ip}</td>
        <td><span class="badge b-${alert.attack_type.toLowerCase()}">${alert.attack_type}</span></td>
        <td><span class="badge b-${alert.severity.toLowerCase()}">${alert.severity}</span></td>
        <td class="mono-cell">${alert.combined_score}</td>
        <td class="mono-cell">${alert.protocol}</td>
    `;
    
    // Insert at top
    if (tbody.firstChild) {
        tbody.insertBefore(row, tbody.firstChild);
    } else {
        tbody.appendChild(row);
    }
    
    // Keep only last 20 rows
    while (tbody.children.length > 20) {
        tbody.removeChild(tbody.lastChild);
    }
    
    // Update alert count
    alertCount++;
    if (alert.is_attack) attackCount++;
}

// Update statistics
function updateStats() {
    const totalEl = document.getElementById('stat-total');
    const attacksEl = document.getElementById('stat-attacks');
    
    if (totalEl) totalEl.textContent = alertCount;
    if (attacksEl) attacksEl.textContent = attackCount;
    
    // Update false alarm rate (mock calculation)
    const farEl = document.getElementById('stat-far');
    if (farEl && alertCount > 0) {
        const falseAlarms = Math.max(0, alertCount - attackCount);
        const far = ((falseAlarms / alertCount) * 100).toFixed(1);
        farEl.textContent = `${far}%`;
    }
}

// Add to ticker bar
function addToTicker(alert) {
    const tickerTrack = document.getElementById('ticker-track');
    if (!tickerTrack) return;
    
    const dotClass = alert.is_attack ? 'attack' : 'safe';
    const item = document.createElement('div');
    item.className = 'ticker-item';
    item.innerHTML = `
        <div class="ticker-dot ${dotClass}"></div>
        <span><em>${alert.src_ip}</em> → ${alert.attack_type} (${alert.severity})</span>
    `;
    
    tickerTrack.appendChild(item);
    
    // Keep only last 15 items
    while (tickerTrack.children.length > 15) {
        tickerTrack.removeChild(tickerTrack.firstChild);
    }
}

// Update SHAP explanation panel
function updateShapExplanation(alert) {
    const shapBody = document.getElementById('shap-body');
    if (!shapBody) return;
    
    if (!alert.is_attack) {
        shapBody.innerHTML = `
            <div class="shap-wait">
                <span class="shap-wait-icon">✅</span>
                <span class="shap-wait-text">Normal traffic - No threats detected</span>
            </div>
        `;
        return;
    }
    
    // Mock SHAP values based on attack type
    const shapValues = {
        'DoS': [
            { feature: 'packet_rate', impact: 0.42, color: '#c62828' },
            { feature: 'src_bytes', impact: 0.28, color: '#e67e22' },
            { feature: 'protocol_type', impact: 0.15, color: '#2c5f8a' },
            { feature: 'duration', impact: 0.08, color: '#2e7d64' },
            { feature: 'flag', impact: 0.07, color: '#888' }
        ],
        'Probe': [
            { feature: 'dst_host_count', impact: 0.38, color: '#e67e22' },
            { feature: 'srv_count', impact: 0.25, color: '#c62828' },
            { feature: 'same_srv_rate', impact: 0.18, color: '#2c5f8a' },
            { feature: 'diff_srv_rate', impact: 0.12, color: '#2e7d64' },
            { feature: 'dst_port', impact: 0.07, color: '#888' }
        ],
        'R2L': [
            { feature: 'num_failed_logins', impact: 0.45, color: '#c62828' },
            { feature: 'logged_in', impact: 0.22, color: '#e67e22' },
            { feature: 'root_shell', impact: 0.15, color: '#2c5f8a' },
            { feature: 'hot', impact: 0.10, color: '#2e7d64' },
            { feature: 'num_compromised', impact: 0.08, color: '#888' }
        ],
        'U2R': [
            { feature: 'num_root', impact: 0.35, color: '#c62828' },
            { feature: 'num_shells', impact: 0.28, color: '#e67e22' },
            { feature: 'root_shell', impact: 0.20, color: '#2c5f8a' },
            { feature: 'is_guest_login', impact: 0.10, color: '#2e7d64' },
            { feature: 'su_attempted', impact: 0.07, color: '#888' }
        ]
    };
    
    const features = shapValues[alert.attack_type] || shapValues['DoS'];
    
    let shapHtml = `
        <div class="shap-intro">🔍 Why was this flagged as ${alert.attack_type}?</div>
    `;
    
    features.forEach(f => {
        const width = f.impact * 100;
        shapHtml += `
            <div class="shap-item">
                <span class="shap-feat">${f.feature}</span>
                <div class="shap-track">
                    <div class="shap-fill" style="width: ${width}%; background: ${f.color};"></div>
                </div>
                <span class="shap-score">${(f.impact * 100).toFixed(0)}%</span>
            </div>
        `;
    });
    
    shapHtml += `<div style="margin-top: 12px; font-size: 10px; color: #888;">Higher impact = stronger contribution to detection</div>`;
    
    shapBody.innerHTML = shapHtml;
}

// Show browser notification
function showBrowserNotification(alert) {
    if (Notification && Notification.permission === 'granted') {
        new Notification('🚨 NIDS Alert Detected!', {
            body: `${alert.attack_type} attack from ${alert.src_ip} (${alert.severity} severity)`,
            icon: '/static/favicon.ico'
        });
    }
}

// Show notification in dashboard
function showNotification(message, type) {
    // Check if NIDS.pushNotif exists (from base.html)
    if (window.NIDS && NIDS.pushNotif) {
        const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
        NIDS.pushNotif(icon, message, type === 'success' ? '#2e7d64' : '#c62828');
    }
    
    // Also show in-page alert
    let alertDiv = document.getElementById('save-alert');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.id = 'save-alert';
        alertDiv.className = 'alert-msg';
        document.querySelector('.page-body')?.prepend(alertDiv);
    }
    
    alertDiv.textContent = message;
    alertDiv.className = `alert-msg ${type === 'success' ? 'success' : 'error'} show`;
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
    }, 3000);
}

// Export alerts (placeholder)
function exportAlerts() {
    showNotification('Exporting alerts to CSV...', 'success');
    // In production: window.location.href = '/api/alerts/export';
}

// Update system health (mock data)
function updateSystemHealth() {
    const cpuEl = document.getElementById('h-cpu');
    const memEl = document.getElementById('h-mem');
    const pktEl = document.getElementById('h-pkt');
    
    if (cpuEl) cpuEl.style.width = Math.floor(20 + Math.random() * 40) + '%';
    if (memEl) memEl.style.width = Math.floor(30 + Math.random() * 30) + '%';
    if (pktEl && isCapturing) pktEl.style.width = Math.floor(10 + Math.random() * 60) + '%';
}

// Update health every 5 seconds
setInterval(updateSystemHealth, 5000);

// Request notification permission
if (Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
}