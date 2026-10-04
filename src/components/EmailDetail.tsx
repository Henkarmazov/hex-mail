import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  Trash2,
  Download,
  Mail,
} from 'lucide-react';
import { EmailMessage } from '../types';

interface EmailDetailProps {
  email: EmailMessage | null;
  onBackToList: () => void;
  onToggleStar: (id: string) => void;
  onDeleteEmail: (id: string) => void;
  onNotify: (msg: string) => void;
}

// Convert plain URLs in text into clickable <a> tags
function linkifyText(text: string): string {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#047857] hover:text-[#065F46] font-semibold underline underline-offset-2 break-all">${url}</a>`;
  });
}

// Render clean subject without altering sender text
function renderFormattedSubject(subject: string) {
  if (!subject) return <h2 className="text-base sm:text-lg font-semibold text-[#111827]">(Tanpa Subjek)</h2>;
  return (
    <h2 className="text-base sm:text-lg font-semibold text-[#111827] leading-snug">
      {subject}
    </h2>
  );
}

export const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  onBackToList,
  onToggleStar,
  onDeleteEmail,
  onNotify,
}) => {
  if (!email) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
        <Mail className="w-8 h-8 text-[#9CA3AF] mb-2 stroke-[1.5]" />
        <p className="text-xs font-medium text-[#4B5563]">Pilih email untuk dibaca</p>
        <p className="text-[11px] text-[#9CA3AF] mt-0.5">
          Klik salah satu pesan dari daftar sebelah kiri.
        </p>
      </div>
    );
  }

  const handleDownloadEml = () => {
    const emlContent = email.rawHeaders || `From: ${email.fromName} <${email.fromAddress}>
To: <${email.toAddress}>
Subject: ${email.subject}
Date: ${new Date(email.timestamp).toUTCString()}

${email.bodyText || email.bodyHtml}`;

    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hexmail_${email.id}.eml`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('File .eml diunduh');
  };

  // Prepare sanitized content
  const renderedContent = useMemo(() => {
    if (email.bodyHtml && email.bodyHtml.trim()) {
      return { isHtml: true, content: email.bodyHtml };
    }
    const plainText = email.bodyText || email.preview || '';
    return {
      isHtml: false,
      text: plainText,
      linkedHtml: linkifyText(plainText),
    };
  }, [email.bodyHtml, email.bodyText, email.preview]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Detail Toolbar */}
      <div className="px-4 py-2.5 border-b border-[#E5E0D5] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToList}
            className="lg:hidden flex items-center gap-1 text-xs text-[#4B5563] hover:text-[#111827]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <span className="text-xs text-[#6B7280]">
            {new Date(email.timestamp).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            })}
            {', '}
            {new Date(email.timestamp).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleStar(email.id)}
            className={`p-1.5 rounded hover:bg-[#FAF9F6] transition-colors ${
              email.isStarred ? 'text-[#EAB308]' : 'text-[#6B7280]'
            }`}
            title={email.isStarred ? 'Bintang aktif' : 'Beri bintang'}
          >
            <Star className={`w-4 h-4 ${email.isStarred ? 'fill-[#EAB308]' : ''}`} />
          </button>

          <button
            onClick={handleDownloadEml}
            className="p-1.5 rounded text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF9F6] transition-colors"
            title="Unduh email (.eml)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDeleteEmail(email.id)}
            className="p-1.5 rounded text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Email Header: Clean with sender name only and smaller formatted date/time */}
        <div>
          {renderFormattedSubject(email.subject)}
          <div className="mt-1 text-xs text-[#4B5563]">
            <span className="font-medium text-[#111827]">{email.fromName}</span>
          </div>
        </div>

        {/* Message Body: Preserve line breaks and colorize links */}
        <div className="pt-3 border-t border-[#F5F2EB]">
          {renderedContent.isHtml ? (
            <div
              className="email-content text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderedContent.content || '' }}
            />
          ) : (
            <div
              className="email-content text-sm leading-relaxed whitespace-pre-wrap font-sans"
              dangerouslySetInnerHTML={{ __html: renderedContent.linkedHtml || '' }}
            />
          )}
        </div>

        {/* Attachments if any */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#F5F2EB]">
            <span className="text-xs font-semibold text-[#374151]">Lampiran:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {email.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1.5 rounded border border-[#E5E0D5] bg-[#FAF9F6] text-xs text-[#4B5563] flex items-center gap-1.5"
                >
                  <span>{att.name}</span>
                  {att.size && <span className="text-[#9CA3AF] ({att.size})">({att.size})</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
