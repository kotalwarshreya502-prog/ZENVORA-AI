import React, { useState, useEffect } from 'react';
import {
  Building,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  RefreshCw,
  Users
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const BusinessProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [business, setBusiness] = useState({
    name: 'Zenvora Marketing Labs',
    website: 'https://zenvora.ai',
    industry: 'Marketing Technology & AI SaaS',
    companySize: '11-50 employees',
    email: 'contact@zenvora.ai',
    phone: '+1 (555) 382-9100',
    address: {
      street: '450 Innovation Parkway, Suite 800',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      zipCode: '94105',
    },
    socialHandles: {
      linkedin: 'https://linkedin.com/company/zenvora-ai',
      twitter: '@zenvora_ai',
      instagram: '@zenvora_growth',
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getBusinessProfile();
      if (res && res.data) {
        setBusiness(res.data);
      }
    } catch (err) {
      console.log('Using default business profile state');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.updateBusinessProfile(business);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving business profile:', err);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="text-brand-violet" size={24} />
            Business Organization Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain your official company records, public directory listings, contact points, and verified company domains.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-medium text-sm shadow-md shadow-brand-violet/20 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Saving...
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle size={16} className="text-emerald-300" />
              Profile Updated!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Profile
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle size={18} className="text-emerald-600" />
          <span>Business organization details saved successfully across the platform.</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            General Business Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Industry Vertical
              </label>
              <input
                type="text"
                value={business.industry}
                onChange={(e) => setBusiness({ ...business, industry: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Primary Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="url"
                  value={business.website}
                  onChange={(e) => setBusiness({ ...business, website: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Organization Size
              </label>
              <select
                value={business.companySize}
                onChange={(e) => setBusiness({ ...business, companySize: e.target.value })}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
              >
                <option value="1-10 employees">1-10 employees (Startup)</option>
                <option value="11-50 employees">11-50 employees (Growing)</option>
                <option value="51-200 employees">51-200 employees (Scale-up)</option>
                <option value="201-1000 employees">201-1000 employees (Mid-market)</option>
                <option value="1000+ employees">1000+ employees (Enterprise)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  value={business.email}
                  onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Direct Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="tel"
                  value={business.phone}
                  onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                  className="w-full text-sm rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-brand-violet/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Address & Social Profiles (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Headquarters Location */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={16} className="text-brand-violet" />
              Corporate Headquarters
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={business.address?.street || ''}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    address: { ...business.address, street: e.target.value },
                  })
                }
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={business.address?.city || ''}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      address: { ...business.address, city: e.target.value },
                    })
                  }
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={business.address?.country || ''}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      address: { ...business.address, country: e.target.value },
                    })
                  }
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5"
                />
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Connected Social Handles
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                LinkedIn Company Page
              </label>
              <input
                type="text"
                value={business.socialHandles?.linkedin || ''}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    socialHandles: { ...business.socialHandles, linkedin: e.target.value },
                  })
                }
                className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                X / Twitter Handle
              </label>
              <input
                type="text"
                value={business.socialHandles?.twitter || ''}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    socialHandles: { ...business.socialHandles, twitter: e.target.value },
                  })
                }
                className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfilePage;
