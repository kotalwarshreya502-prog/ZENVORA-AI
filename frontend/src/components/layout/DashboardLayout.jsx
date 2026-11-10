import { Activity, Bell, ChevronDown, Menu, Search, Sparkles, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import DashboardSidebar from './DashboardSidebar';

export const DashboardLayout = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.getHealth();
        setDbStatus(res.database || 'disconnected');
      } catch {
        setDbStatus('offline');
      }
    };
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="animate-spin text-brand-violet" size={18} />
          <span>Loading ZENVORA Workspace...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-brand-navy flex font-sans antialiased">
      {/* Sidebar */}
      <DashboardSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-brand-navy rounded-lg hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>

            {/* Quick Search Bar */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <input
                type="text"
                placeholder="Search campaigns, posts, SEO..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-brand-violet focus:bg-white transition-all"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Database Health Pill */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                dbStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>DB: {dbStatus}</span>
            </div>

            {/* Notification Bell */}
            <Link
              to="/dashboard/notifications"
              className="relative p-2 text-slate-500 hover:text-brand-navy rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-violet rounded-full ring-2 ring-white" />
              )}
            </Link>

            {/* User Profile Pill */}
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-brand-violet text-white text-xs font-bold flex items-center justify-center">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-bold text-brand-navy hidden sm:inline">{user?.name || 'Workspace'}</span>
            </Link>
          </div>
        </header>

        {/* Child Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
