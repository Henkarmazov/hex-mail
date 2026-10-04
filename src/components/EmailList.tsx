import React from 'react';
import {
  Star,
  Trash2,
  Inbox,
} from 'lucide-react';
import { EmailMessage, FilterType } from '../types';

interface EmailListProps {
  emails: EmailMessage[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onDeleteEmail: (id: string, e: React.MouseEvent) => void;
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
}

function formatTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 0 || diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
}

function renderListSubject(subject: string) {
  if (!subject) return '(Tanpa Subjek)';
  return subject;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  onToggleStar,
  onDeleteEmail,
  filter,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Filter Tabs Header */}
      <div className="p-2.5 border-b border-[#E5E0D5]">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-[#111827] text-white font-medium'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF9F6]'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => onFilterChange('unread')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filter === 'unread'
                ? 'bg-[#ECFDF5] text-[#065F46] font-medium border border-[#A7F3D0]'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF9F6]'
            }`}
          >
            Belum Dibaca
          </button>
        </div>
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#F5F2EB]">
        {emails.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <Inbox className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-[#4B5563]">Belum ada pesan</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              Email yang masuk akan muncul otomatis di sini.
            </p>
          </div>
        ) : (
          emails.map((email) => {
            const isSelected = email.id === selectedEmailId;

            return (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email.id)}
                className={`p-3 transition-colors cursor-pointer border-l-2 ${
                  isSelected
                    ? 'bg-[#F9F8F5] border-l-[#047857]'
                    : !email.isRead
                    ? 'bg-[#FAFCFB] border-l-[#34D399] hover:bg-[#FAF9F6]'
                    : 'border-l-transparent hover:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-xs truncate ${
                      !email.isRead ? 'font-bold text-[#111827]' : 'font-medium text-[#4B5563]'
                    }`}
                  >
                    {email.fromName}
                  </span>
                  <span className="text-[10px] font-mono text-[#9CA3AF] shrink-0">
                    {formatTime(email.timestamp)}
                  </span>
                </div>

                <div
                  className={`text-xs truncate mb-1 ${
                    !email.isRead ? 'font-medium text-[#111827]' : 'text-[#6B7280]'
                  }`}
                >
                  {renderListSubject(email.subject)}
                </div>

                {email.preview && email.preview.trim() !== email.subject.trim() && (
                  <div className="mt-1">
                    <span className="text-[11px] text-[#9CA3AF] truncate block">
                      {email.preview}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 mt-1">
                  <button
                    onClick={(e) => onToggleStar(email.id, e)}
                    className={`p-1 rounded ${
                      email.isStarred ? 'text-[#EAB308]' : 'text-[#D1D5DB] hover:text-[#EAB308]'
                    }`}
                  >
                    <Star
                      className={`w-3 h-3 ${email.isStarred ? 'fill-[#EAB308]' : ''}`}
                    />
                  </button>
                  <button
                    onClick={(e) => onDeleteEmail(email.id, e)}
                    className="p-1 rounded text-[#D1D5DB] hover:text-[#DC2626]"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
