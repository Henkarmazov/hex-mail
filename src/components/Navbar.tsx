import React from 'react';
import {
  Hexagon,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  secondsToNextRefresh: number;
  onManualRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  autoRefresh,
  onToggleAutoRefresh,
  secondsToNextRefresh,
  onManualRefresh,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6] border-b border-[#E5E0D5] px-4 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#047857] flex items-center justify-center text-white">
            <Hexagon className="w-4 h-4 fill-[#34D399] stroke-[#047857]" />
          </div>
          <span className="text-base font-bold tracking-tight text-[#111827]">
            Hexmail
          </span>
        </div>

        {/* Status & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Auto Refresh pill */}
          <button
            onClick={onToggleAutoRefresh}
            title={autoRefresh ? 'Pembaruan otomatis aktif' : 'Pembaruan otomatis dijeda'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#E5E0D5] bg-white text-xs text-[#4B5563] hover:text-[#111827] transition-colors"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                autoRefresh ? 'bg-[#10B981]' : 'bg-[#9CA3AF]'
              }`}
            />
            <span className="tabular-nums font-mono text-[11px]">
              {autoRefresh ? `${secondsToNextRefresh}s` : 'Jeda'}
            </span>
          </button>

          {/* Refresh button */}
          <button
            onClick={onManualRefresh}
            title="Muat ulang kotak masuk"
            className="p-1.5 rounded-md border border-[#E5E0D5] bg-white text-[#4B5563] hover:text-[#111827] hover:bg-[#F5F2EB] transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#047857]' : ''}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
