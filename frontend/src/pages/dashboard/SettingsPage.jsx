import React, { useState } from 'react';
import {
  Settings,
  User,
  Key,
  Shield,
  Bell,
  Sparkles,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Zenvora Growth Lead');
  const [email, setEmail] = useState(user?.email || 'growth@zenvora.ai');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // AI Model settings
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [customApiKey, setCustomApiKey] = useState('');

  // Notifications toggles
  const [notifyPublish, setNotifyPublish] = useState(true);
  const [notifySeo, setNotifySeo] = useState(true);
  const [notifyCampaign, setNotifyCampaign] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="text-brand-violet" size={24} />
          Account & AI Engine Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal credentials, server AI parameters, and organizational notification routing.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>Account preferences and AI configurations saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Profile & Security (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-brand-violet" />
              Personal Profile
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500 p-2.5 cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Email change requires identity re-verification.
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
              >
                {saving ? 'Updating...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Password Update */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Key size={16} className="text-brand-teal" />
              Security & Password
            </h2>

            {passwordError && (
              <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                Password updated successfully!
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPassword ? 'Hide characters' : 'Show characters'}
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-lg transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: AI Engine & Notifications (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* AI Engine Configuration */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-brand-violet" />
              Google Gemini AI Engine Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Active Model Architecture
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                >
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra-low latency, 1M context)</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep reasoning & long-form SEO)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 uppercase tracking-wider">
                    Generation Creativity (Temperature):
                  </span>
                  <span className="font-mono text-brand-violet font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-brand-violet"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Precise / Technical (0.2)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative / Viral (1.0)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy... (Leave empty to use server default key)"
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Keys are stored exclusively in memory and never exposed in frontend code.
                </span>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Bell size={16} className="text-brand-violet" />
              Notification Routing
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Publishing Confirmations</div>
                  <div className="text-[11px] text-slate-500">Receive alert when a scheduled social thread goes live.</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyPublish}
                  onChange={(e) => setNotifyPublish(e.target.checked)}
                  className="rounded text-brand-violet focus:ring-brand-violet"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Weekly SEO Health Digest</div>
                  <div className="text-[11px] text-slate-500">Summary of keyword rank movements and technical audit fixes.</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifySeo}
                  onChange={(e) => setNotifySeo(e.target.checked)}
                  className="rounded text-brand-violet focus:ring-brand-violet"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Campaign Budget Alerts</div>
                  <div className="text-[11px] text-slate-500">Notify when campaign reaches 80% of defined spend limit.</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyCampaign}
                  onChange={(e) => setNotifyCampaign(e.target.checked)}
                  className="rounded text-brand-violet focus:ring-brand-violet"
                />
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 p-6 rounded-xl border border-red-200 space-y-3">
            <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-red-600" />
              Danger Zone
            </h3>
            <p className="text-xs text-red-700 leading-relaxed">
              Permanently delete all workspace campaigns, generated blog history, and revoke all active OAuth tokens. This cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => alert('Account deletion is locked for demo safety.')}
              className="px-3.5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete Organization Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
