import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  EmailMessage,
  TempMailbox,
  ActiveFolder,
  FilterType,
} from './types';
import {
  generateFullEmail,
  generateRandomUsername,
  DEFAULT_DOMAIN,
} from './utils/domains';
import { tempMailApi } from './services/tempMailApi';
import { Navbar } from './components/Navbar';
import { HeroAddressCard } from './components/HeroAddressCard';
import { Sidebar } from './components/Sidebar';
import { EmailList } from './components/EmailList';
import { EmailDetail } from './components/EmailDetail';
import { QRCodeModal } from './components/QRCodeModal';
import { InputNameSelectDomainModal } from './components/InputNameSelectDomainModal';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { ToastContainer, ToastItem } from './components/Toast';

const DEFAULT_LIFESPAN_SECONDS = 600; // 10 minutes
const POLLING_INTERVAL_SECONDS = 8; // Polling every 8 seconds

export default function App() {
  // 1. Mailbox State
  const [currentMailbox, setCurrentMailbox] = useState<TempMailbox>(() => {
    try {
      const saved = localStorage.getItem('hexmail_current_box');
      if (saved) return JSON.parse(saved);
    } catch {}
    const initialAddress = generateFullEmail(DEFAULT_DOMAIN);
    const [user, dom] = initialAddress.split('@');
    return {
      id: 'box-default',
      address: initialAddress,
      username: user,
      domain: dom,
      createdAt: Date.now(),
      expiresAt: Date.now() + DEFAULT_LIFESPAN_SECONDS * 1000,
    };
  });

  // 2. Emails State
  const [emails, setEmails] = useState<EmailMessage[]>(() => {
    try {
      const saved = localStorage.getItem('hexmail_messages');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 3. UI States
  const [activeFolder, setActiveFolder] = useState<ActiveFolder>('inbox');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // 4. Timers and Automation
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(DEFAULT_LIFESPAN_SECONDS);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [secondsToNextRefresh, setSecondsToNextRefresh] = useState<number>(POLLING_INTERVAL_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 5. Modals State
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isInputNameDomainModalOpen, setIsInputNameDomainModalOpen] = useState<boolean>(false);

  // 6. Toasts State
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Prevent race conditions with ref
  const activeEmailRef = useRef<string>(currentMailbox.address);
  useEffect(() => {
    activeEmailRef.current = currentMailbox.address;
  }, [currentMailbox.address]);

  const addToast = useCallback((message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hexmail_current_box', JSON.stringify(currentMailbox));
    } catch {}
  }, [currentMailbox]);

  useEffect(() => {
    try {
      localStorage.setItem('hexmail_messages', JSON.stringify(emails));
    } catch {}
  }, [emails]);

  // Update browser tab title
  const unreadCount = useMemo(() => {
    return emails.filter((e) => !e.isRead && e.toAddress === currentMailbox.address).length;
  }, [emails, currentMailbox.address]);

  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) Hexmail` : 'Hexmail - Email Sementara';
  }, [unreadCount]);

  // Fetch complete inbox for current address
  const fetchInbox = useCallback(async (isSilent = false) => {
    const targetEmail = activeEmailRef.current;
    if (!targetEmail) return;

    if (!isSilent) setIsRefreshing(true);

    try {
      const res = await tempMailApi.getInbox(targetEmail);
      if (activeEmailRef.current !== targetEmail) return;

      if (res && res.status && Array.isArray(res.messages)) {
        const incomingMessages: EmailMessage[] = res.messages.map((m) => {
          let parsedTimestamp = Date.now();
          if (m.time) {
            // If string has format "YYYY-MM-DD HH:mm:ss" without timezone, treat as UTC
            let timeStr = String(m.time).trim();
            if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
              timeStr = timeStr.replace(' ', 'T') + 'Z';
            }
            const parsed = new Date(timeStr).getTime();
            if (!isNaN(parsed) && parsed > 0) {
              parsedTimestamp = parsed;
            }
          }

          return {
            id: String(m.mail_id),
            fromName: m.from_name || m.from || 'Pengirim',
            fromAddress: m.from_mail || m.from || 'unknown@domain.com',
            toAddress: targetEmail,
            subject: m.subject || '(Tanpa Subjek)',
            preview: '',
            bodyHtml: '',
            bodyText: '',
            timestamp: parsedTimestamp,
            isRead: !m.is_new,
            isStarred: false,
          };
        });

        setEmails((prev) => {
          const merged = [...prev];
          let hasNewArrival = false;

          incomingMessages.forEach((inc) => {
            const existingIdx = merged.findIndex((e) => e.id === inc.id);
            if (existingIdx === -1) {
              merged.unshift(inc);
              hasNewArrival = true;
            }
          });

          if (hasNewArrival && !isSilent) {
            addToast('Pesan baru diterima!');
          }
          return merged;
        });
      }
    } catch (err) {
      console.warn('Failed to refresh inbox from /api/inbox', err);
    } finally {
      if (!isSilent) {
        setIsRefreshing(false);
      }
    }
  }, [addToast]);

  // Initial load
  useEffect(() => {
    fetchInbox(false);
  }, [currentMailbox.address, fetchInbox]);

  // Lifespan Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          addToast('Waktu habis, alamat diperbarui');
          return DEFAULT_LIFESPAN_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [addToast]);

  // Polling loop
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      setSecondsToNextRefresh((prev) => {
        if (prev <= 1) {
          const target = activeEmailRef.current;
          if (target) {
            tempMailApi.pollInbox(target)
              .then((pollRes) => {
                if (activeEmailRef.current === target && pollRes && pollRes.status) {
                  fetchInbox(true);
                }
              })
              .catch(() => {
                fetchInbox(true);
              });
          }
          return POLLING_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchInbox]);

  // Manual refresh trigger
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setSecondsToNextRefresh(POLLING_INTERVAL_SECONDS);
    fetchInbox(false).then(() => {
      addToast('Kotak masuk diperbarui');
    });
  };

  // Extend lifespan +10 mins
  const handleExtendTimer = () => {
    setTimeRemainingSeconds((prev) => prev + DEFAULT_LIFESPAN_SECONDS);
    addToast('Masa aktif ditambah 10 menit');
  };

  // Generate new random email
  const handleGenerateRandom = async () => {
    setIsRefreshing(true);
    try {
      const data = await tempMailApi.generateEmail();
      if (data && data.status && data.email) {
        const newBox: TempMailbox = {
          id: `box-${Date.now()}`,
          address: data.email,
          username: data.username,
          domain: data.domain,
          createdAt: Date.now(),
          expiresAt: Date.now() + DEFAULT_LIFESPAN_SECONDS * 1000,
        };
        setCurrentMailbox(newBox);
        setSelectedEmailId(null);
        setTimeRemainingSeconds(DEFAULT_LIFESPAN_SECONDS);
        addToast(`Alamat baru aktif: ${data.email}`);
      } else {
        throw new Error(data.error || 'Gagal menghasilkan email');
      }
    } catch {
      const newAddress = generateFullEmail(currentMailbox.domain || DEFAULT_DOMAIN);
      const [username, domain] = newAddress.split('@');
      setCurrentMailbox({
        id: `box-${Date.now()}`,
        address: newAddress,
        username,
        domain,
        createdAt: Date.now(),
        expiresAt: Date.now() + DEFAULT_LIFESPAN_SECONDS * 1000,
      });
      setSelectedEmailId(null);
      setTimeRemainingSeconds(DEFAULT_LIFESPAN_SECONDS);
      addToast('Alamat baru dibuat');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Set custom username and chosen domain
  const handleInputNameAndDomain = async (username: string, domain: string) => {
    setIsRefreshing(true);
    try {
      const data = await tempMailApi.generateEmail(username, domain);
      if (data && data.status && data.email) {
        const newBox: TempMailbox = {
          id: `box-${Date.now()}`,
          address: data.email,
          username: data.username,
          domain: data.domain,
          createdAt: Date.now(),
          expiresAt: Date.now() + DEFAULT_LIFESPAN_SECONDS * 1000,
        };
        setCurrentMailbox(newBox);
        setSelectedEmailId(null);
        setTimeRemainingSeconds(DEFAULT_LIFESPAN_SECONDS);
        addToast(`Alamat baru aktif: ${data.email}`);
      } else {
        throw new Error(data.error || 'Gagal membuat alamat email');
      }
    } catch {
      const address = `${username}@${domain}`;
      setCurrentMailbox({
        id: `box-${Date.now()}`,
        address,
        username,
        domain,
        createdAt: Date.now(),
        expiresAt: Date.now() + DEFAULT_LIFESPAN_SECONDS * 1000,
      });
      setSelectedEmailId(null);
      setTimeRemainingSeconds(DEFAULT_LIFESPAN_SECONDS);
      addToast(`Alamat baru aktif: ${address}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Destroy mailbox
  const handleDestroyMailbox = async () => {
    const emailToDestroy = currentMailbox.address;
    try {
      await tempMailApi.destroyMailbox(emailToDestroy);
      addToast('Mailbox telah dihancurkan');
    } catch (err) {
      console.warn('Destroy mailbox note', err);
    }
    setEmails((prev) => prev.filter((e) => e.toAddress !== emailToDestroy));
    handleGenerateRandom();
  };

  // Select email and fetch content
  const handleSelectEmail = async (id: string) => {
    setSelectedEmailId(id);

    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isRead: true } : e))
    );

    const targetEmail = emails.find((e) => e.id === id);
    if (targetEmail && (!targetEmail.bodyHtml && !targetEmail.bodyText)) {
      try {
        const readRes = await tempMailApi.readEmail(currentMailbox.address, id);
        if (readRes && readRes.status) {
          let updatedTimestamp: number | undefined;
          if (readRes.date) {
            let dateStr = String(readRes.date).trim();
            if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(dateStr)) {
              dateStr = dateStr.replace(' ', 'T') + 'Z';
            }
            const p = new Date(dateStr).getTime();
            if (!isNaN(p) && p > 0) {
              updatedTimestamp = p;
            }
          }

          setEmails((prev) =>
            prev.map((e) =>
              e.id === id
                ? {
                    ...e,
                    subject: readRes.subject || e.subject,
                    preview: readRes.text ? readRes.text.trim().substring(0, 80) : '',
                    bodyHtml: readRes.html || '',
                    bodyText: readRes.text || '',
                    fromName: readRes.from_name || readRes.from || e.fromName,
                    fromAddress: readRes.from_mail || e.fromAddress,
                    timestamp: updatedTimestamp || e.timestamp,
                    attachments: readRes.attachments?.map((a) => ({
                      name: a.name,
                      size: a.size || 'Attachment',
                      type: a.type || 'file',
                    })),
                  }
                : e
            )
          );
        }
      } catch (err) {
        console.warn('Failed to load email from /api/read', err);
      }
    }
  };

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEmails((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      )
    );
  };

  // Delete email permanently
  const handleDeleteEmail = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const emailToDelete = emails.find((item) => item.id === id);
    if (!emailToDelete) return;

    try {
      await tempMailApi.deleteEmail(currentMailbox.address, id);
    } catch (err) {
      console.warn('Delete email note', err);
    }

    setEmails((prev) => prev.filter((item) => item.id !== id));

    if (selectedEmailId === id) {
      const remaining = emails.filter((item) => item.id !== id);
      setSelectedEmailId(remaining[0]?.id || null);
    }
    addToast('Email telah dihapus');
  };

  // Filtered emails
  const displayedEmails = useMemo(() => {
    let list = emails.filter((e) => e.toAddress === currentMailbox.address);

    if (activeFolder === 'starred') {
      list = list.filter((e) => e.isStarred);
    }

    if (filter === 'unread') {
      list = list.filter((e) => !e.isRead);
    }

    return list;
  }, [
    emails,
    currentMailbox.address,
    activeFolder,
    filter,
  ]);

  const selectedEmail = useMemo(() => {
    if (!selectedEmailId) return null;
    return (
      emails.find((e) => e.id === selectedEmailId) ||
      null
    );
  }, [emails, selectedEmailId]);

  // Folder Counts
  const currentBoxEmails = useMemo(() => {
    return emails.filter((e) => e.toAddress === currentMailbox.address);
  }, [emails, currentMailbox.address]);

  const starredCount = useMemo(() => {
    return currentBoxEmails.filter((e) => e.isStarred).length;
  }, [currentBoxEmails]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111827] flex flex-col font-sans selection:bg-[#34D399] selection:text-[#065F46]">
      {/* Navbar */}
      <Navbar
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        secondsToNextRefresh={secondsToNextRefresh}
        onManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Address Card */}
        <HeroAddressCard
          currentMailbox={currentMailbox}
          onGenerateRandom={handleGenerateRandom}
          onOpenInputNameDomainModal={() => setIsInputNameDomainModalOpen(true)}
          onOpenQrModal={() => setIsQrModalOpen(true)}
          onExtendTimer={handleExtendTimer}
          onDestroyMailbox={handleDestroyMailbox}
          timeRemainingSeconds={timeRemainingSeconds}
          onNotify={addToast}
        />

        {/* Workspace Card */}
        <div className="flex-1 border border-[#E5E0D5] bg-white rounded-xl overflow-hidden flex flex-col lg:flex-row min-h-[560px]">
          {/* Sidebar (Desktop) */}
          <div className="hidden lg:block lg:w-56 shrink-0">
            <Sidebar
              activeFolder={activeFolder}
              onSelectFolder={(folder) => {
                setActiveFolder(folder);
                setSelectedEmailId(null);
              }}
              inboxCount={currentBoxEmails.length}
              unreadCount={unreadCount}
              starredCount={starredCount}
            />
          </div>

          {/* Email List Column */}
          <div
            className={`w-full lg:w-80 shrink-0 border-r border-[#E5E0D5] flex flex-col ${
              selectedEmailId ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Mobile Folder Selector Tabs */}
            <div className="lg:hidden px-3 py-2 bg-[#FAF9F6] border-b border-[#E5E0D5] flex gap-1 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveFolder('inbox')}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
                  activeFolder === 'inbox' ? 'bg-[#047857] text-white' : 'text-[#4B5563]'
                }`}
              >
                Kotak Masuk ({currentBoxEmails.length})
              </button>
              <button
                onClick={() => setActiveFolder('starred')}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
                  activeFolder === 'starred' ? 'bg-[#047857] text-white' : 'text-[#4B5563]'
                }`}
              >
                Bintang ({starredCount})
              </button>
            </div>

            <EmailList
              emails={displayedEmails}
              selectedEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              onToggleStar={handleToggleStar}
              onDeleteEmail={handleDeleteEmail}
              filter={filter}
              onFilterChange={setFilter}
            />
          </div>

          {/* Reading Column */}
          <div
            className={`flex-1 flex flex-col bg-white min-w-0 ${
              !selectedEmailId ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <EmailDetail
              email={selectedEmail}
              onBackToList={() => setSelectedEmailId(null)}
              onToggleStar={(id) => handleToggleStar(id)}
              onDeleteEmail={(id) => handleDeleteEmail(id)}
              onNotify={addToast}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <QRCodeModal
        email={currentMailbox.address}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onNotify={addToast}
      />

      <InputNameSelectDomainModal
        isOpen={isInputNameDomainModalOpen}
        onClose={() => setIsInputNameDomainModalOpen(false)}
        onSubmit={handleInputNameAndDomain}
        currentUsername={currentMailbox.username}
        currentDomain={currentMailbox.domain}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
