import {
  BarChart3,
  Bell,
  Bot,
  Building,
  Calendar,
  ChevronDown,
  CreditCard,
  FileText,
  Globe,
  Hash,
  HelpCircle,
  History,
  Image as ImageIcon,
  Key,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandSymbol from '../common/BrandSymbol';

export const DashboardSidebar = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Business Profile', path: '/dashboard/business-profile', icon: <Building size={18} /> },
      ],
    },
    {
      title: 'AI CONTENT STUDIO',
      items: [
        { name: 'Content Studio', path: '/dashboard/content-studio', icon: <Bot size={18} />, badge: 'Gemini' },
        { name: 'AI Blog Generator', path: '/dashboard/blog-generator', icon: <FileText size={18} /> },
        { name: 'Social Post Creator', path: '/dashboard/social-generator', icon: <Share2 size={18} /> },
        { name: 'Caption Generator', path: '/dashboard/caption-generator', icon: <MessageSquare size={18} /> },
        { name: 'Hashtag Clusters', path: '/dashboard/hashtag-generator', icon: <Hash size={18} /> },
        { name: 'Image Creator', path: '/dashboard/image-generation', icon: <ImageIcon size={18} /> },
      ],
    },
    {
      title: 'CAMPAIGNS & CALENDAR',
      items: [
        { name: 'Campaign Hub', path: '/dashboard/campaigns', icon: <Layers size={18} /> },
        { name: 'Content Calendar', path: '/dashboard/calendar', icon: <Calendar size={18} /> },
        { name: 'Publishing History', path: '/dashboard/publishing-history', icon: <History size={18} /> },
      ],
    },
    {
      title: 'INTELLIGENCE & SEO',
      items: [
        { name: 'SEO Website Audit', path: '/dashboard/seo-analysis', icon: <Search size={18} /> },
        { name: 'Marketing Analytics', path: '/dashboard/analytics', icon: <BarChart3 size={18} /> },
        { name: 'Brand Knowledge Base', path: '/dashboard/brand-guidelines', icon: <ShieldCheck size={18} /> },
      ],
    },
    {
      title: 'ADMIN & SETTINGS',
      items: [
        { name: 'Social Integrations', path: '/dashboard/integrations', icon: <Globe size={18} /> },
        { name: 'Team & Roles', path: '/dashboard/team', icon: <Users size={18} /> },
        { name: 'Billing & Usage', path: '/dashboard/billing', icon: <CreditCard size={18} /> },
        { name: 'Notifications', path: '/dashboard/notifications', icon: <Bell size={18} /> },
        { name: 'Account Settings', path: '/dashboard/settings', icon: <Settings size={18} /> },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-brand-navy text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <BrandSymbol size={34} />
            <div className="font-extrabold text-lg tracking-tight text-white">
              ZENVORA <span className="text-brand-violet">AI</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-violet text-white shadow-sm shadow-brand-violet/30'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-brand-teal text-brand-navy px-1.5 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card & Sign Out footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand-violet/20 border border-brand-violet text-brand-violet font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Marketer'}</div>
              <div className="text-[10px] text-slate-300 truncate">{user?.businessName || user?.email || 'Admin'}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-300 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
