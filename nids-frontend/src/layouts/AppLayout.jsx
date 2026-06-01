import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { socketService } from '../services/socket';
import { 
  Shield, Activity, AlertTriangle, BarChart2, 
  FileText, Settings, User, LogOut, Bell, HelpCircle
} from 'lucide-react';

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [socketStatus, setSocketStatus] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    // Clock
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    
    // Socket events
    socketService.connect();
    const unsubConnect = socketService.on('connected', () => setSocketStatus(true));
    const unsubDisconnect = socketService.on('disconnected', () => setSocketStatus(false));

    return () => {
      clearInterval(timer);
      unsubConnect();
      unsubDisconnect();
      socketService.disconnect();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = isAdmin 
    ? [
        { path: '/admin-dashboard', icon: Activity, label: 'System Overview' },
        { path: '/admin-users', icon: User, label: 'User Management' }
      ]
    : [
        { path: '/dashboard', icon: Activity, label: 'Dashboard' },
        { path: '/alerts', icon: AlertTriangle, label: 'Live Alerts' },
        { path: '/historical', icon: BarChart2, label: 'Historical Data' },
        { path: '/reports', icon: FileText, label: 'Reports' },
        { path: '/settings', icon: Settings, label: 'Settings' }
      ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const item = navItems.find(n => n.path === currentPath);
    if (item) return item.label;
    if (currentPath === '/profile') return 'My Profile';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-[#f5f7fa] font-body text-[#333333]">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 bg-white border-r border-[#e0e4e8] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-[#e0e4e8] flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2c5f8a] rounded flex items-center justify-center text-white">
            <Shield size={20} />
          </div>
          <div>
            <div className="font-display font-bold text-[#1a1a2e] text-[14px]">ShieldNet NIDS</div>
            <div className="text-[10px] text-[#888888]">v2.1 College Build</div>
          </div>
        </div>

        <div className={`m-4 p-2 rounded border flex items-center gap-2 ${socketStatus ? 'bg-[rgba(46,125,100,0.08)] border-[#2e7d64]' : 'bg-[rgba(230,126,34,0.08)] border-[#e67e22]'}`}>
          <div className={`w-2 h-2 rounded-full ${socketStatus ? 'bg-[#2e7d64]' : 'bg-[#e67e22]'}`}></div>
          <span className={`text-[11px] font-medium ${socketStatus ? 'text-[#2e7d64]' : 'text-[#e67e22]'}`}>
            {socketStatus ? 'MONITORING ACTIVE' : 'RECONNECTING...'}
          </span>
        </div>

        <div className="px-5 py-3 text-[10px] font-semibold text-[#888888] uppercase">
          {isAdmin ? 'Administration' : 'Main Menu'}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-[2px]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 p-2.5 rounded text-[13px] ${
                  isActive
                    ? 'bg-[rgba(44,95,138,0.08)] text-[#2c5f8a] font-medium'
                    : 'text-[#666666] hover:bg-[rgba(44,95,138,0.08)] hover:text-[#1a1a2e]'
                }`
              }
            >
              <item.icon size={16} className="flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#e0e4e8] flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#2c5f8a] flex items-center justify-center text-white font-medium flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[#1a1a2e] truncate">{user?.name || 'User'}</div>
            <div className="text-[10px] text-[#888888]">{isAdmin ? 'Administrator' : 'Analyst'}</div>
          </div>
          <button onClick={handleLogout} className="p-1 text-[#888888] hover:text-[#c62828] cursor-pointer">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-[60px] px-6 bg-white border-b border-[#e0e4e8] flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-display text-[16px] font-semibold text-[#1a1a2e]">{getPageTitle()}</h1>
            <div className="text-[11px] text-[#888888] mt-0.5">Real-time threat monitoring and analysis</div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="font-mono text-[12px] px-3 py-1.5 bg-[#f5f7fa] border border-[#e0e4e8] rounded text-[#666666]">
              {time}
            </div>
            
            <button className="w-8 h-8 rounded bg-transparent border border-[#e0e4e8] flex items-center justify-center text-[#666666] hover:border-[#2c5f8a] hover:text-[#2c5f8a] cursor-pointer">
              <Bell size={14} />
            </button>
            <button className="w-8 h-8 rounded bg-transparent border border-[#e0e4e8] flex items-center justify-center text-[#666666] hover:border-[#2c5f8a] hover:text-[#2c5f8a] cursor-pointer">
              <HelpCircle size={14} />
            </button>
            
            {!isAdmin && (
              <NavLink 
                to="/profile"
                className="w-8 h-8 rounded bg-transparent border border-[#e0e4e8] flex items-center justify-center text-[#666666] hover:border-[#2c5f8a] hover:text-[#2c5f8a]"
              >
                <User size={14} />
              </NavLink>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
