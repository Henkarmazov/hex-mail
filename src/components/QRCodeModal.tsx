import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Check } from 'lucide-react';

interface QRCodeModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ email, isOpen, onClose, onNotify }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloaded, setDownloaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !email) return;
    QRCode.toDataURL(email, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [isOpen, email]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!qrDataUrl) return;
    try {
      const link = document.createElement('a');
      link.href = qrDataUrl;
      const sanitizedName = email.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `qrcode_${sanitizedName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloaded(true);
      onNotify('QR Code berhasil diunduh');
      setTimeout(() => setDownloaded(false), 2000);
    } catch {
      onNotify('Gagal mengunduh QR Code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div 
        className="w-full max-w-xs bg-white border border-[#E5E0D5] rounded-xl p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#F5F2EB]">
          <h3 className="text-sm font-semibold text-[#111827]">Kode QR</h3>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#111827]"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 flex flex-col items-center">
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt={email}
              className="w-48 h-48 rounded border border-[#E5E0D5]"
            />
          )}
          <p className="mt-2 text-center font-mono text-xs text-[#4B5563] break-all">
            {email}
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={!qrDataUrl}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-white bg-[#047857] hover:bg-[#065F46] disabled:opacity-50 transition-colors shadow-xs"
        >
          {downloaded ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#A7F3D0]" />
              <span>QR Diunduh</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download QR</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
