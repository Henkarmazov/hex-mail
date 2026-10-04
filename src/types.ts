export interface EmailAttachment {
  name: string;
  size: string;
  type: string;
}

export interface EmailMessage {
  id: string;
  fromName: string;
  fromAddress: string;
  toAddress: string;
  subject: string;
  preview: string;
  bodyHtml: string;
  bodyText: string;
  timestamp: number;
  isRead: boolean;
  isStarred: boolean;
  attachments?: EmailAttachment[];
  rawHeaders?: string;
}

export interface TempMailbox {
  id: string;
  address: string;
  username: string;
  domain: string;
  createdAt: number;
  expiresAt: number;
  label?: string;
}

export type ActiveFolder = 'inbox' | 'starred';

export type FilterType = 'all' | 'unread';
