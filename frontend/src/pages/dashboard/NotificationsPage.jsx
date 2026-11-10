import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  Calendar,
  Sparkles,
  AlertTriangle,
  Info,
  Check,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api';

export const NotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 'nt-1',
      title: 'Scheduled Campaign Post Published',
      message: 'Your scheduled LinkedIn post "Autonomous marketing orchestration" has been successfully published to your company feed.',
      category: 'publishing',
      read: false,
      timestamp: '15 minutes ago',
      icon: 'check',
    },
    {
      id: 'nt-2',
      title: 'SEO Audit Completed for zenvora.ai',
      message: 'Your technical SEO health score improved to 92/100 after meta description updates.',
      category: 'seo',
      read: false,
      timestamp: '2 hours ago',
      icon: 'sparkles',
    },
    {
      id: 'nt-3',
      title: 'Upcoming Scheduled Content Alert',
      message: 'You have 2 scheduled social threads scheduled to release tomorrow at 10:00 AM UTC.',
      category: 'calendar',
      read: true,
      timestamp: 'Yesterday',
      icon: 'calendar',
    },
    {
      id: 'nt-4',
      title: 'Monthly AI Words Allocation Restored',
      message: 'Your Professional Growth plan quota has refreshed with 250,000 high-speed Gemini 1.5 tokens.',
      category: 'system',
      read: true,
      timestamp: '3 days ago',
      icon: 'info',
    },
  ]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.log('Using default in-app notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
    } catch (err) {
      // offline fallback
    }
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.category === filter;
  });

  const getNotificationIcon = (icon) => {
    switch (icon) {
      case 'check':
        return <CheckCircle className="text-emerald-500" size={18} />;
      case 'sparkles':
        return <Sparkles className="text-brand-violet" size={18} />;
      case 'calendar':
        return <Calendar className="text-blue-500" size={18} />;
      default:
        return <Info className="text-slate-500" size={18} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="text-brand-violet" size={24} />
            Notifications & Event Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time feed for content publishing confirmations, SEO alerts, and workspace actions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors self-start sm:self-auto"
          >
            <Check size={14} className="text-brand-teal" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'publishing', label: 'Publishing' },
          { id: 'seo', label: 'SEO Diagnostics' },
          { id: 'calendar', label: 'Calendar' },
          { id: 'system', label: 'System & Billing' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === tab.id
                ? 'bg-brand-violet text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No notifications in this filter view.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  !n.read ? 'bg-brand-violet/5 font-medium' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{getNotificationIcon(n.icon)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{n.title}</span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-violet shrink-0" />
                      )}
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        [{n.category}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl font-normal">
                      {n.message}
                    </p>
                    <span className="text-[11px] text-slate-400 block pt-1 font-normal">
                      {n.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleRead(n.id)}
                    className="text-xs text-slate-500 hover:text-brand-violet p-1"
                    title={n.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    <Check size={14} className={n.read ? 'text-slate-300' : 'text-brand-violet'} />
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-xs text-slate-400 hover:text-red-600 p-1"
                    title="Dismiss"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
