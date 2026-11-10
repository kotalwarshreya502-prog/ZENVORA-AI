import { ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandSymbol from '../components/common/BrandSymbol';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { api } from '../services/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword({ email });
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandSymbol size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">Reset your password</h2>
          <p className="text-xs text-slate-500">Enter your email and we'll send recovery instructions</p>
        </div>

        <Card className="p-8 space-y-6 shadow-xl border-slate-200/80">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Check your inbox</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an account exists for <strong>{email}</strong>, we have dispatched a password reset link.
              </p>
              <Link to="/login" className="inline-block pt-2">
                <Button variant="outline" size="sm">
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Account Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-violet"
                  />
                  <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full shadow-md shadow-brand-violet/25 font-bold"
              >
                <span>{loading ? 'Sending link...' : 'Send Recovery Link'}</span>
                <Send size={15} />
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-brand-navy inline-flex items-center gap-1">
                  <ArrowLeft size={13} />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
