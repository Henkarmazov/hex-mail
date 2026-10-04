import { EmailMessage } from '../types';

export function getInitialMockEmails(toAddress: string): EmailMessage[] {
  const now = Date.now();

  return [
    {
      id: 'hex-msg-1',
      fromName: 'Tim Keamanan Hexmail',
      fromAddress: 'security@system.hexmail.online',
      toAddress: toAddress,
      subject: 'Selamat Datang di Hexmail — Lindungi Privasi Kotak Masuk Anda',
      preview: 'Alamat email sementara Anda telah siap digunakan. Nikmati kotak masuk otomatis yang aman tanpa spam.',
      timestamp: now - 1000 * 60 * 2,
      isRead: false,
      isStarred: true,
      bodyText: `Halo Pengguna Hexmail,

Selamat datang di Hexmail! Alamat email sementara Anda (${toAddress}) kini aktif dan siap menerima pesan masuk.

Fitur Utama Hexmail:
1. Kotak Masuk Otomatis: Email masuk otomatis terdeteksi tanpa perlu me-refresh halaman terus menerus.
2. Nol Jejak & Spam: Alamat ini melindungi kotak masuk pribadi Anda dari spam, pialang data, dan langganan tidak diinginkan.

Masa aktif default alamat ini adalah 10 menit. Anda dapat memperpanjang masa aktif kapan saja dengan tombol "+10 Menit".

Kunjungi dokumentasi kami:
https://hexmail.online/docs

Salam hangat,
Tim Hexmail Indonesia`,
      bodyHtml: '',
    },
    {
      id: 'hex-msg-2',
      fromName: 'Alight Creative',
      fromAddress: 'noreply@alight-creative.firebaseapp.com',
      toAddress: toAddress,
      subject: 'Sign in to Alight Creative requested at 2026 September 25 02:29 UTC',
      preview: 'We received a request to sign in to Alight Creative using this email address...',
      timestamp: now - 1000 * 60 * 5,
      isRead: false,
      isStarred: false,
      bodyText: `Hello,

We received a request to sign in to Alight Creative using this email address, at 2026 September 25 02:29 UTC. If you want to sign in with your ${toAddress} account, click this link:

https://alightcreative.com/sign-in?token=demo-auth-link-7782

If you did not request this link, you can safely ignore this email.

Thanks,

Your Alight Creative team`,
      bodyHtml: '',
    },
  ];
}
