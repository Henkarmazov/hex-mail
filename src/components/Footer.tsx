import React from 'react';
import { Hexagon, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E5E0D5] bg-[#FAF9F6] py-6 px-4 mt-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#047857] flex items-center justify-center text-white">
            <Hexagon className="w-3 h-3 fill-[#34D399] stroke-[#047857]" />
          </div>
          <span className="font-semibold text-[#111827]">Hexmail</span>
          <span>·</span>
          <span>Privasi & Keamanan Terjaga</span>
        </div>

        <div className="font-medium text-[#4B5563]">
          © 2026 by Henkaramazov
        </div>
      </div>
    </footer>
  );
};
