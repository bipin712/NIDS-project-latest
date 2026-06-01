# React Migration — ShieldNet NIDS Frontend

Migrate the entire NIDS frontend from **Jinja2 server-rendered templates + vanilla CSS/JS** to a **React SPA** with Tailwind CSS, professional SVG icons, and light theme — while keeping the existing Flask backend API unchanged.

---

## User Review Required

> [!IMPORTANT]
> **Tailwind CSS version**: The plan uses **Tailwind CSS v4** (the latest, installed via `@tailwindcss/vite` plugin). Let me know if you prefer v3 instead.

> [!IMPORTANT]
> **The Flask backend (`app.py`) will NOT be modified.** The React app will run on a separate Vite dev server (port 5173) and proxy API requests to Flask (port 5000). For production, you'll build the React app and serve it from Flask's `static/` folder.

> [!WARNING]
> **Emoji icons → SVG icons**: All emoji icons (📡🚨🤖⚠️ etc.) in the current templates will be replaced with proper **Lucide React** SVG icons — clean, professional, and consistent.

---

## Existing Frontend Inventory (13 pages)

| Page | Template | CSS | JS | Route |
|------|----------|-----|-----|-------|
| Login | `login.html` | `login.css` | `login.js` | `/login` |
| Register | `register.html` | `register.css` | `register.js` | `/register` |
| Dashboard | `dashboard.html` | `dashboard.css` | `dashboard.js` | `/dashboard` |
| Alerts | `alerts.html` | `alerts.css` | `alerts.js` | `/alerts` |
| Historical | `historical.html` | `historical.css` | `istorical.js` | `/historical` |
| Reports | `reports.html` | (inline) | (inline) | `/reports` |
| Settings | `settings.html` | (inline) | (inline) | `/settings` |
| Profile | `profile.html` | `profile.css` | `profile.js` | `/profile` |
| Admin Login | `admin_login.html` | `login.css` + `admin.css` | (inline) | `/admin-login` |
| Admin Register | `admin_register.html` | `register.css` | (inline) | `/admin-register` |
| Admin Dashboard | `admin_dashboard.html` | `admin.css` | `admin.js` | `/admin-dashboard` |
| Admin Users | `admin_users.html` | `admin.css` | (inline) | `/admin-users` |
| Base Layout | `base.html` | `components.css` | `socket.js`, `charts.js` | (layout) |

---

## Proposed Changes

### Phase 1: Project Scaffolding

#### [NEW] `d:\7th_sem_project\NIDS-project-latest\nids-frontend\`
- Initialize Vite + React project using `npx create-vite`
- Install dependencies:
  - `react-router-dom` — client-side routing
  - `@tailwindcss/vite` + `tailwindcss` — Tailwind CSS v4
  - `lucide-react` — professional SVG icon library
  - `chart.js` + `react-chartjs-2` — charts
  - `socket.io-client` — WebSocket connection to Flask-SocketIO
  - `clsx` — conditional classNames utility

#### [NEW] `vite.config.js`
- Configure Vite proxy to forward `/api/*` and `/socket.io/*` to Flask backend at `http://localhost:5000`

#### [NEW] `src/index.css`
- Import Tailwind base/components/utilities
- Import Google Fonts (Inter, JetBrains Mono)
- Define CSS custom properties matching existing design tokens
- Custom scrollbar styling

---

### Phase 2: Core Layout & Routing

#### [NEW] `src/App.jsx`
- React Router setup with all routes
- Auth-protected route wrapper
- Admin-protected route wrapper

#### [NEW] `src/layouts/AppLayout.jsx`
- Sidebar navigation (matches `base.html` sidebar structure)
- Topbar with clock, notification bell, page title
- Notification panel dropdown
- Help modal
- User avatar + logout in sidebar footer
- Active page highlighting

#### [NEW] `src/layouts/AuthLayout.jsx`
- Minimal layout for login/register pages (no sidebar)

---

### Phase 3: Auth Context & API Service

#### [NEW] `src/contexts/AuthContext.jsx`
- React context for user authentication state
- `login()`, `logout()`, `register()`, `checkAuth()` functions
- Persists auth state across page refreshes
- Handles both user and admin authentication

#### [NEW] `src/services/api.js`
- Centralized fetch wrapper for all API calls
- Base URL configuration
- Error handling
- All endpoints mapped:
  - `POST /api/login`, `POST /api/register`, `POST /api/logout`
  - `POST /api/admin/login`, `POST /api/admin/register`, `POST /api/admin/logout`
  - `GET /api/check-auth`, `GET /api/user/profile`
  - `POST /api/user/change-password`
  - `POST /api/user/send-reset-code`
  - `POST /api/user/reset-password-email`, `POST /api/user/reset-password-mobile`
  - `POST /api/user/update-profile`
  - `GET /api/admin/users`, `DELETE /api/admin/users/:id`
  - `POST /api/admin/users/:id/toggle-status`
  - `GET /api/alerts`, `GET /api/alerts/export`
  - `POST /api/settings`, `DELETE /api/alerts/clear`
  - `GET /api/dashboard-data`, `GET /api/historical-data`
  - `POST /api/reports/generate/:type`

#### [NEW] `src/services/socket.js`
- Socket.IO client connection
- Event listeners for `new_alert`, `normal_traffic`, `system_status`, `capture_started`, `capture_stopped`
- Emit functions for `start_capture`, `stop_capture`, `request_status`

---

### Phase 4: Shared Components

#### [NEW] `src/components/StatCard.jsx`
- Reusable stat card with colored top bar, label, value, sub-text, and icon
- Uses Lucide React icons instead of emoji

#### [NEW] `src/components/Badge.jsx`
- Severity badge (HIGH, MEDIUM, LOW, SAFE)
- Attack type badge (DoS, Probe, R2L, U2R, Normal)

#### [NEW] `src/components/Panel.jsx`
- Card panel with header and body sections

#### [NEW] `src/components/DataTable.jsx`
- Reusable data table with header and body slots

#### [NEW] `src/components/Modal.jsx`
- Reusable modal dialog (backdrop + card + close button)

#### [NEW] `src/components/EmptyState.jsx`
- Empty state placeholder with icon, title, description

#### [NEW] `src/components/Toast.jsx`
- Toast notification system (success/error)

#### [NEW] `src/components/ToggleSwitch.jsx`
- Custom toggle switch for settings

#### [NEW] `src/components/ConfidenceBar.jsx`
- Horizontal progress bar for metrics

---

### Phase 5: Auth Pages

#### [NEW] `src/pages/Login.jsx`
- Email/password login form with validation
- "Remember me" checkbox
- Forgot password modal with email/mobile reset flow
- Link to Register page
- Link to Admin Login

#### [NEW] `src/pages/Register.jsx`
- Name, email, mobile, password, confirm password
- Password strength indicator
- Real-time validation
- Link to Login page

#### [NEW] `src/pages/AdminLogin.jsx`
- Admin-specific login form (red accent)
- Back to user login link

#### [NEW] `src/pages/AdminRegister.jsx`
- Admin registration with admin key validation

---

### Phase 6: Main App Pages

#### [NEW] `src/pages/Dashboard.jsx`
**Full feature parity with `dashboard.html` + `dashboard.js`:**
- Interface selector dropdown
- Start/Stop capture button
- Ticker bar (scrolling alert feed)
- 4 stat cards: Total Events, Attacks Detected, ML Model Status, False Alarm Rate
- Traffic Timeline chart (Chart.js line chart)
- Attack Distribution chart (Chart.js doughnut)
- Live Alert Feed table (latest 20 alerts)
- SHAP Explanation panel
- Top Attack Sources panel
- Packet Stream panel
- System Health panel (CPU, Memory, Packet Rate, Model Load, DB Storage)
- Mock data simulation when capture is active

#### [NEW] `src/pages/Alerts.jsx`
**Full feature parity with `alerts.html` + `alerts.js`:**
- Summary stat cards (Total, High, Medium, Low, Unique Sources)
- Filter chips (All, Attacks, DoS, Probe, R2L, U2R, Normal)
- Search box
- Alert data table with all columns
- Detail modal for individual alerts
- Export CSV functionality
- Live indicator badge

#### [NEW] `src/pages/Historical.jsx`
**Full feature parity with `historical.html`:**
- Summary metrics (Total Events, Total Attacks, Detection Accuracy, Avg Response Time)
- Period selector (24h, 7d, 30d, All Time)
- Attack Trend Over Time chart (line)
- Attack Type Distribution chart (doughnut)
- ML Model Performance table
- Attack Pattern By Hour chart (bar)
- Top Attack Sources table

#### [NEW] `src/pages/Reports.jsx`
**Full feature parity with `reports.html`:**
- 6 report cards (Daily, Weekly, Monthly, ML Model, Attack Analysis, Data Export)
- Generate and download buttons with loading spinners
- Success toast notifications

#### [NEW] `src/pages/Settings.jsx`
**Full feature parity with `settings.html`:**
- Detection Thresholds section (DoS, Port Scan, SYN Flood, ML Score)
- Packet Capture section (Interface, BPF filter, Flow timeout)
- Notifications section (High/Medium alerts, Sound toggle)
- Database section (Auto-purge, DB path, Clear all alerts)
- Save Settings button
- Scroll to top button

#### [NEW] `src/pages/Profile.jsx`
**Full feature parity with `profile.html` + `profile.js`:**
- Profile header with avatar, name, email
- Account Information card
- Security Settings card (2FA, Password, Sessions)
- Danger Zone (Delete Account)
- Edit Profile modal
- Change Password modal
- Forgot Password modal

---

### Phase 7: Admin Pages

#### [NEW] `src/pages/AdminDashboard.jsx`
- Admin stats (Total Users, New Users, Total Alerts, Total Attacks)
- Quick action links
- Admin information box

#### [NEW] `src/pages/AdminUsers.jsx`
- User search
- Users table with all columns
- Toggle status (Activate/Deactivate) buttons
- Delete user buttons
- Empty state

---

### Phase 8: Polish & Integration

- Verify all API calls work with Flask backend
- Test Socket.IO real-time updates
- Responsive layout adjustments
- Final visual review

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React + Vite | Fast dev server, simple config, modern |
| CSS | Tailwind CSS v4 | User requested Tailwind; minimal, professional |
| Icons | Lucide React | Clean SVG icons, no emoji, tree-shakeable |
| Charts | react-chartjs-2 | Same Chart.js library, React wrapper |
| Routing | react-router-dom v7 | Standard React SPA routing |
| State | React Context | Sufficient for auth state; no Redux needed |
| Theme | Light only | User requested light theme |
| Font | Inter + JetBrains Mono | Matches existing design system |

---

## Verification Plan

### Automated Tests
```bash
# Build check — ensures no compilation errors
cd nids-frontend && npm run build

# Dev server starts without error
cd nids-frontend && npm run dev
```

### Manual Verification
1. Open `http://localhost:5173` in browser
2. Verify all 13 pages render correctly
3. Test login/register flow against running Flask backend
4. Test dashboard capture simulation
5. Verify chart rendering on Historical and Dashboard pages
6. Test admin login and user management
7. Verify responsive layout on different screen sizes
