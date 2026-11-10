import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  MoreVertical,
  CheckCircle,
  X,
  Trash2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TeamManagementPage = () => {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Content Creator');
  const [invitedSuccess, setInvitedSuccess] = useState(false);

  const [members, setMembers] = useState([
    {
      id: 'usr-1',
      name: user?.name || 'Zenvora Workspace Owner',
      email: user?.email || 'owner@zenvora.ai',
      role: 'Owner',
      status: 'Active',
      joinedDate: 'Oct 2024',
      avatarColor: 'from-brand-violet to-brand-teal',
    },
    {
      id: 'usr-2',
      name: 'Sarah Chen',
      email: 'sarah.chen@zenvora.ai',
      role: 'Marketing Admin',
      status: 'Active',
      joinedDate: 'Jan 2025',
      avatarColor: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'usr-3',
      name: 'Marcus Brody',
      email: 'm.brody@zenvora.ai',
      role: 'Content Creator',
      status: 'Active',
      joinedDate: 'Feb 2025',
      avatarColor: 'from-amber-500 to-pink-500',
    },
    {
      id: 'usr-4',
      name: 'Elena Rostova',
      email: 'elena@zenvora.ai',
      role: 'SEO Strategist',
      status: 'Invited',
      joinedDate: 'Pending',
      avatarColor: 'from-slate-400 to-slate-600',
    },
  ]);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember = {
      id: `usr-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'Invited',
      joinedDate: 'Pending',
      avatarColor: 'from-emerald-500 to-teal-600',
    };

    setMembers([...members, newMember]);
    setShowInviteModal(false);
    setInviteEmail('');
    setInvitedSuccess(true);
    setTimeout(() => setInvitedSuccess(false), 3000);
  };

  const handleRemove = (id) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Marketing Admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Content Creator':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'SEO Strategist':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-brand-violet" size={24} />
            Team Collaboration & Access Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your marketing team members, assign granular operational roles, and safeguard publishing permissions.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-sm shadow-md shadow-brand-violet/20 transition-all self-start sm:self-auto"
        >
          <UserPlus size={16} /> Invite Member
        </button>
      </div>

      {invitedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>Invitation email dispatched with magic sign-in link.</span>
        </div>
      )}

      {/* Role Explanations Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-purple-800 mb-1">Owner & Admin</div>
          <p className="text-xs text-slate-500">
            Full workspace control, billing management, API credentials, and integration authorization.
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-teal-800 mb-1">Content Creator</div>
          <p className="text-xs text-slate-500">
            Generate AI content, draft social posts and blogs, but requires approval before live publishing.
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-blue-800 mb-1">SEO & Analyst</div>
          <p className="text-xs text-slate-500">
            Access to Technical SEO auditing, performance analytics, and exportable reports.
          </p>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Active Members ({members.length})
          </h2>
          <span className="text-xs text-slate-400">
            Seat usage: {members.length} / 10 seats
          </span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${m.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {m.name}
                    {m.role === 'Owner' && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-mono font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{m.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getRoleBadge(m.role)}`}>
                  {m.role}
                </span>

                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    m.status === 'Active'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-amber-700 bg-amber-50'
                  }`}
                >
                  {m.status}
                </span>

                {m.role !== 'Owner' && (
                  <button
                    onClick={() => handleRemove(m.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Member"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="text-brand-violet" size={18} />
                Invite Team Member
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@yourcompany.com"
                    className="w-full text-sm rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                >
                  <option value="Marketing Admin">Marketing Admin (Full Access)</option>
                  <option value="Content Creator">Content Creator (Drafts & AI Studio)</option>
                  <option value="SEO Strategist">SEO Strategist (Audits & Keywords)</option>
                  <option value="Viewer">Viewer (Read-only Analytics)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-brand-violet hover:bg-brand-violet/90 text-white rounded-lg shadow-sm"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementPage;
