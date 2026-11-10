import { Activity, CheckCircle2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import React from 'react';
import useHealth from '../../hooks/useHealth';
import BrandLogo from '../common/BrandLogo';
import Badge from '../ui/Badge';

export const Header = () => {
  const { health, loading, error, refresh } = useHealth(8000);

  const isConnected = health?.database === 'connected';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <BrandLogo size={40} showTagline={true} />

        <div className="flex items-center gap-3">
          {/* Phase 1 Pill */}
          <Badge variant="violet" size="md">
            Phase 1: Foundation
          </Badge>

          {/* Backend Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              error
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
            title="Backend API Connection Status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                error ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            {loading && !health ? (
              <span>Connecting API...</span>
            ) : error ? (
              <span>API Offline</span>
            ) : (
              <span>API Active (:5000)</span>
            )}
          </div>

          {/* Database Status Pill */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isConnected
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title="MongoDB Atlas Status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-teal-500' : 'bg-amber-500'
              }`}
            />
            <span>DB: {health?.database || 'disconnected'}</span>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={refresh}
            title="Refresh Health Status"
            className="p-2 text-slate-400 hover:text-brand-navy rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

