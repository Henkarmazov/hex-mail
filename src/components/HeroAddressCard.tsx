import React, { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Edit3,
  Clock,
  Plus,
  Trash2,
} from 'lucide-react';
import { TempMailbox } from '../types';

interface HeroAddressCardProps {
  currentMailbox: TempMailbox;
  onGenerateRandom: () => void;
  onOpenInputNameDomainModal: () => void;
  onOpenQrModal: () => void;
  onExtendTimer: () => void;
  onDestroyMailbox?: () => void;
  timeRemainingSeconds: number;
  onNotify: (msg: string) => void;
}

export const HeroAddressCard: React.FC<HeroAddressCardProps> = ({
  currentMailbox,
  onGenerateRandom,
  onOpenInputNameDomainModal,
  onOpenQrModal,
  onExtendTimer,
  onDestroyMailbox,
  timeRemainingSeconds,
  onNotify,
}) => {
  const [copied, setCopied] = useState(false);

  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMailbox.address);
    setCopied(true);
    onNotify('Alamat email disalin');
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="bg-white border border-[#E5E0D5] rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Email Address & Copy */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-medium text-[#6B7280]">
              Alamat Sementara Anda
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          </div>

          <div className="flex items-center gap-2">
            <div
              onClick={handleCopy}
              className="flex-1 min-w-0 font-mono text-base sm:text-lg font-semibold text-[#111827] truncate select-all cursor-pointer hover:text-[#047857] transition-colors"
              title="Klik untuk menyalin"
            >
              {currentMailbox.address}
            </div>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                copied
                  ? 'bg-[#047857] text-white'
                  : 'bg-[#111827] text-white hover:bg-[#047857]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#A7F3D0]" />
                  <span>Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lifespan & Timer */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:border-l sm:border-[#E5E0D5] sm:pl-4 pt-2 sm:pt-0 border-t border-[#F5F2EB]">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Clock className="w-3.5 h-3.5 text-[#047857]" />
            <span className="font-mono font-medium tabular-nums text-[#111827]">
              {timeFormatted}
            </span>
          </div>

          <button
            onClick={onExtendTimer}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] transition-colors"
            title="Tambah masa aktif 10 menit"
          >
            <Plus className="w-3 h-3" />
            <span>+10m</span>
          </button>
        </div>
      </div>

      {/* Bottom Minimal Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F2EB]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onGenerateRandom}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-[#4B5563] hover:text-[#111827] hover:bg-[#FAF9F6] border border-[#E5E0D5] transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-[#047857]" />
            <span>Ganti Acak</span>
          </button>

          <button
            onClick={onOpenInputNameDomainModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-[#047857] hover:text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] transition-colors shadow-xs"
            title="Tentukan nama email dan pilih domain aktif"
          >
            <Edit3 className="w-3 h-3 text-[#047857]" />
            <span>Kostum Nama & Domain</span>
          </button>

          <button
            onClick={onOpenQrModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-[#4B5563] hover:text-[#111827] hover:bg-[#FAF9F6] border border-[#E5E0D5] transition-colors"
          >
            <QrCode className="w-3 h-3 text-[#0284C7]" />
            <span>QR</span>
          </button>
        </div>

        {onDestroyMailbox && (
          <button
            onClick={onDestroyMailbox}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
            title="Hapus mailbox ini dan ganti alamat baru"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Hancurkan Mailbox</span>
          </button>
        )}
      </div>
    </div>
  );
};
