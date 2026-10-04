import React from 'react';
import {
  Inbox,
  Star,
} from 'lucide-react';
import { ActiveFolder } from '../types';

interface SidebarProps {
  activeFolder: ActiveFolder;
  onSelectFolder: (folder: ActiveFolder) => void;
  inboxCount: number;
  unreadCount: number;
  starredCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeFolder,
  onSelectFolder,
  inboxCount,
  unreadCount,
  starredCount,
}) => {
  const folders = [
    {
      id: 'inbox' as ActiveFolder,
      label: 'Kotak Masuk',
      icon: Inbox,
      count: inboxCount,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'starred' as ActiveFolder,
      label: 'Berbintang',
      icon: Star,
      count: starredCount,
    },
  ];

  return (
    <aside className="w-full lg:w-56 bg-[#FAF9F6] border-r border-[#E5E0D5] p-3 flex flex-col justify-between h-full">
      <div className="space-y-1">
        {folders.map((item) => {
          const Icon = item.icon;
          const isActive = activeFolder === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectFolder(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#047857] text-white'
                  : 'text-[#4B5563] hover:bg-[#F0ECE1]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-[#6B7280]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-1">
                {item.badge && !isActive && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#34D399] text-[#065F46] font-semibold">
                    {item.badge}
                  </span>
                )}
                <span
                  className={`font-mono text-[11px] ${
                    isActive ? 'text-[#A7F3D0]' : 'text-[#9CA3AF]'
                  }`}
                >
                  {item.count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-[11px] text-[#9CA3AF] px-3 pt-3 border-t border-[#E5E0D5]">
        Hexmail • Bebas Spam
      </div>
    </aside>
  );
};
