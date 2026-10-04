import React from 'react';
import { Check } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-1.5 max-w-xs pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111827] text-white text-xs shadow-md border border-[#374151]"
        >
          <Check className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
          <span className="truncate">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
