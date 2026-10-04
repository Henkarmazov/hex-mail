import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  AtSign,
} from 'lucide-react';
import { AVAILABLE_DOMAINS, generateRandomUsername } from '../utils/domains';
import { tempMailApi } from '../services/tempMailApi';

interface InputNameSelectDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string, domain: string) => Promise<void> | void;
  currentUsername: string;
  currentDomain: string;
}

export const InputNameSelectDomainModal: React.FC<InputNameSelectDomainModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUsername,
  currentDomain,
}) => {
  const [username, setUsername] = useState<string>('');
  const [domainList, setDomainList] = useState<string[]>([...AVAILABLE_DOMAINS]);
  const [selectedDomain, setSelectedDomain] = useState<string>(
    currentDomain || AVAILABLE_DOMAINS[0]
  );
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || generateRandomUsername());
      setSelectedDomain(currentDomain || AVAILABLE_DOMAINS[0]);
      setError('');

      tempMailApi
        .getDomains()
        .then((domains) => {
          if (domains && domains.length > 0) {
            const unique = Array.from(new Set([...domains, ...AVAILABLE_DOMAINS]));
            setDomainList(unique);
            if (!unique.includes(selectedDomain)) {
              setSelectedDomain(unique[0]);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, currentUsername, currentDomain]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

    if (!cleanUsername) {
      setError('Masukkan nama email');
      return;
    }
    if (cleanUsername.length < 3) {
      setError('Nama email minimal 3 karakter');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(cleanUsername, selectedDomain);
      onClose();
    } catch {
      setError('Gagal membuat alamat email. Silakan coba domain lain.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewEmail = `${
    username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'nama'
  }@${selectedDomain}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-[#E5E0D5] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#F5F2EB] bg-gradient-to-b from-[#FAF9F6] to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#047857]">
                <AtSign className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                  Kostum Nama & Domain
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  Tentukan username dan pilih domain aktif untuk email baru Anda
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Section 1: Input Nama */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1F2937] block">
              1. Nama Email (Username)
            </label>

            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                onFocus={(e) => e.target.select()}
                placeholder="misal: henkaramazov"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E5E0D5] bg-[#FAF9F6] text-xs font-mono text-[#111827] focus:outline-none focus:bg-white focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/10 transition-all placeholder:text-[#9CA3AF]"
                autoFocus
              />
            </div>
            {error && <p className="text-[11px] text-[#DC2626] font-medium">{error}</p>}
          </div>

          {/* Section 2: Pilih Domain */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1F2937]">
                2. Pilih Domain Aktif
              </label>
              <span className="text-[10px] text-[#6B7280]">
                {domainList.length} domain tersedia
              </span>
            </div>

            {/* Modern Domain Grid / Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 pt-1">
              {domainList.map((dom) => {
                const isSelected = selectedDomain === dom;

                return (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => setSelectedDomain(dom)}
                    className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-[#047857] bg-[#ECFDF5] ring-1 ring-[#047857]'
                        : 'border-[#E5E0D5] bg-white hover:border-[#CBD5E1] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`font-mono text-xs truncate ${
                          isSelected ? 'font-bold text-[#065F46]' : 'text-[#111827]'
                        }`}
                      >
                        @{dom}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#047857] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Live Preview Box */}
          <div className="pt-2">
            <div className="p-3 bg-[#FAF9F6] border border-[#E5E0D5] rounded-xl flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280] block mb-0.5">
                  Pratinjau Alamat Email:
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-[#047857] truncate block">
                  {previewEmail}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#059669] shrink-0 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Siap Digunakan</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#047857] hover:bg-[#065F46] disabled:opacity-50 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menerapkan...' : 'Gunakan Alamat Ini'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#4B5563] bg-[#FAF9F6] hover:bg-[#F3F4F6] border border-[#E5E0D5] transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
