import { AlertCircle, ArrowRight, Building, Lock, Mail, Sparkles, User } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandSymbol from '../components/common/BrandSymbol';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    industry: 'Software / Technology',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setAlreadyExists(false);

    // Client-side validation — must match backend & Mongoose schema
    if (formData.name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters. Please choose a stronger password.');
      return;
    }
    if (!formData.businessName.trim()) {
      setError('Company name is required.');
      return;
    }

    setLoading(true);
    const res = await register(formData);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      // Surface the exact backend error message
      const msg = res.message || 'Registration failed. Please try again.';
      setError(msg);
      // If email already registered, prompt to login instead
      if (res.status === 409 || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already registered')) {
        setAlreadyExists(true);
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandSymbol size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">Create your ZENVORA account</h2>
          <p className="text-xs text-slate-500">Start your 14-day full access trial • No credit card required</p>
        </div>

        <Card className="p-8 space-y-6 shadow-xl border-slate-200/80">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <span>{error}</span>
                {alreadyExists && (
                  <div className="mt-1.5">
                    <Link to="/login" className="font-bold text-brand-violet hover:underline">
                      Sign in to your existing account →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Your Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                />
                <User size={15} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Work Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                />
                <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                />
                <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 pl-1">Must be at least 8 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Digital"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet bg-white"
                >
                  <option value="Software / Technology">Software / Tech</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Digital Agency">Digital Agency</option>
                  <option value="Consulting / Services">Consulting</option>
                  <option value="Healthcare / Fitness">Healthcare</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full shadow-md shadow-brand-violet/25 font-bold"
            >
              <span>{loading ? 'Creating Workspace...' : 'Start Free Trial'}</span>
              <ArrowRight size={15} />
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-violet hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
