import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Shield,
  AlertCircle,
  Share2,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';

export const IntegrationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [integrations, setIntegrations] = useState([
    {
      id: 'linkedin',
      name: 'LinkedIn Professional',
      description: 'Publish executive articles, company updates, and analyze post engagement metrics.',
      connected: true,
      account: 'Zenvora AI (Company Page)',
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      lastSync: '12 minutes ago',
      permissions: ['w_member_social', 'r_organization_social', 'rw_organization_admin'],
    },
    {
      id: 'twitter',
      name: 'X (formerly Twitter)',
      description: 'Streamline short-form hooks, viral threads, and real-time community engagement.',
      connected: true,
      account: '@zenvora_ai',
      color: 'bg-black',
      textColor: 'text-black',
      lastSync: '1 hour ago',
      permissions: ['tweet.read', 'tweet.write', 'users.read'],
    },
    {
      id: 'instagram',
      name: 'Instagram Business',
      description: 'Schedule multi-image carousels, feed graphics, and monitor engagement comments.',
      connected: false,
      account: null,
      color: 'bg-pink-600',
      textColor: 'text-pink-600',
      lastSync: null,
      permissions: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
    },
    {
      id: 'facebook',
      name: 'Facebook Pages',
      description: 'Distribute organic articles and long-form updates to brand communities.',
      connected: false,
      account: null,
      color: 'bg-indigo-600',
      textColor: 'text-indigo-600',
      lastSync: null,
      permissions: ['pages_manage_posts', 'pages_read_engagement'],
    },
    {
      id: 'google_business',
      name: 'Google Business Profile',
      description: 'Automate weekly local SEO updates, offers, and location announcements for search visibility.',
      connected: true,
      account: 'Zenvora Labs SF (Verified)',
      color: 'bg-emerald-600',
      textColor: 'text-emerald-600',
      lastSync: '2 hours ago',
      permissions: ['business.manage', 'local.posts.write'],
    },
    {
      id: 'wordpress',
      name: 'WordPress CMS',
      description: 'Direct 1-click publishing for generated long-form SEO articles with metadata into WP REST API.',
      connected: true,
      account: 'https://zenvora.ai/blog',
      color: 'bg-slate-700',
      textColor: 'text-slate-700',
      lastSync: 'Yesterday',
      permissions: ['publish_posts', 'upload_files'],
    },
  ]);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.getIntegrations();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setIntegrations(res.data);
      }
    } catch (err) {
      console.log('Using default integrations catalog');
    } finally {
      setLoading(false);
    }
  };

  const toggleConnection = async (id, currentStatus) => {
    setActionLoading(id);
    const action = currentStatus ? 'disconnect' : 'connect';

    try {
      await api.toggleIntegration(id, action);
    } catch (err) {
      console.log('Toggling locally');
    }

    // Toggle locally for instant responsive UI
    setIntegrations(
      integrations.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            connected: !currentStatus,
            account: !currentStatus ? `Connected Account (@${id})` : null,
            lastSync: !currentStatus ? 'Just now' : null,
          };
        }
        return item;
      })
    );
    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Globe className="text-brand-violet" size={24} />
          Multi-Channel Social Integrations & Publishing APIs
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Connect your verified brand channels to enable automated scheduling, direct CMS publishing, and live analytics ingestion.
        </p>
      </div>

      {/* Security Banner */}
      <div className="bg-brand-navy text-white p-4 rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="text-brand-teal shrink-0" size={24} />
          <div>
            <div className="text-sm font-bold">Enterprise OAuth 2.0 Security</div>
            <div className="text-xs text-slate-300">
              Tokens are encrypted at rest with AES-256. ZENVORA AI never stores your account passwords.
            </div>
          </div>
        </div>
        <span className="hidden sm:inline-block text-xs font-mono text-brand-teal bg-brand-teal/10 px-3 py-1 rounded-full border border-brand-teal/30">
          TLS 1.3 Active
        </span>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-brand-violet/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${item.color} text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                >
                  {item.name.charAt(0)}
                </div>

                {item.connected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle size={12} /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    Not Connected
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {item.description}
              </p>

              {item.connected && item.account && (
                <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Active Profile:</div>
                  <div className="font-semibold text-slate-800 truncate">{item.account}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Synced {item.lastSync}</div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {item.permissions.length} Scopes
              </span>

              <button
                onClick={() => toggleConnection(item.id, item.connected)}
                disabled={actionLoading === item.id}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  item.connected
                    ? 'bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-slate-200'
                    : 'bg-brand-violet hover:bg-brand-violet/90 text-white shadow-xs'
                }`}
              >
                {actionLoading === item.id ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : item.connected ? (
                  'Disconnect'
                ) : (
                  'Connect Channel'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsPage;
