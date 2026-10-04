import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Shield, Zap, Lock, Mail } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  icon: React.ElementType;
}

const FAQS: FaqItem[] = [
  {
    question: 'Apa itu Hexmail dan bagaimana cara kerjanya?',
    answer:
      'Hexmail adalah platform email sementara yang memungkinkan Anda menerima surat elektronik, link verifikasi, dan kode OTP secara instan tanpa perlu mendaftar atau memberikan email pribadi Anda.',
    icon: Mail,
  },
  {
    question: 'Berapa lama email dan mailbox saya bertahan?',
    answer:
      'Setiap mailbox default aktif selama 10 menit dan dapat diperpanjang kapan saja dengan menekan tombol "+10m". Anda juga bisa langsung membuat mailbox baru dengan domain pilihan Anda kapan pun dibutuhkan.',
    icon: Zap,
  },
  {
    question: 'Apakah privasi dan data saya aman?',
    answer:
      'Sangat aman. Hexmail tidak meminta data pribadi atau password apa pun. Ketika Anda menekan "Hancurkan Mailbox", mailbox langsung ditutup dan pesan dapat dihapus secara permanen dari server.',
    icon: Shield,
  },
  {
    question: 'Dapatkah saya memilih nama pengguna dan domain sendiri?',
    answer:
      'Tentu! Anda dapat mengklik tombol "Kostum Nama & Domain" untuk menentukan username sesuai keinginan dan memilih salah satu dari sekian banyak domain aktif yang tersedia.',
    icon: Lock,
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="border border-[#E5E0D5] bg-white rounded-xl p-5 sm:p-7 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center border border-[#A7F3D0]">
          <HelpCircle className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-[#111827] tracking-tight">
          Pertanyaan Umum (FAQ)
        </h2>
      </div>
      <p className="text-xs text-[#6B7280] mb-5">
        Semua informasi penting seputar penggunaan alamat email sementara Hexmail.
      </p>

      <div className="space-y-2.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const Icon = faq.icon;

          return (
            <div
              key={idx}
              className={`border rounded-xl transition-all ${
                isOpen
                  ? 'border-[#A7F3D0] bg-[#FAFDFB]'
                  : 'border-[#E5E0D5] bg-white hover:border-[#D1D5DB]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-[#047857] text-white'
                        : 'bg-[#F3F4F6] text-[#4B5563]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#1F2937]">
                    {faq.question}
                  </span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[#6B7280] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#047857]' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-[#4B5563] leading-relaxed border-t border-[#F0ECE1] ml-10 mr-4 mt-1">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
