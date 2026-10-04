export interface GenerateEmailResponse {
  status: boolean;
  email: string;
  username: string;
  domain: string;
  error?: string;
}

export interface UpstreamInboxMessage {
  mail_id: number;
  from: string;
  from_mail?: string;
  from_name?: string;
  subject: string;
  time?: string;
  is_new?: boolean;
  attachments_count?: number;
}

export interface InboxResponse {
  status: boolean;
  email: string;
  count: number;
  first_id?: number;
  last_id?: number;
  has_more?: boolean;
  messages: UpstreamInboxMessage[];
  error?: string;
}

export interface ReadEmailResponse {
  status: boolean;
  mail_id: number;
  from?: string;
  from_mail?: string;
  from_name?: string;
  to?: string;
  subject?: string;
  date?: string;
  is_tls?: boolean;
  text?: string;
  html?: string;
  attachments_count?: number;
  attachments?: Array<{
    name: string;
    size?: string;
    type?: string;
  }>;
  error?: string;
}

export interface PollResponse {
  status: boolean;
  email?: string;
  count?: number;
  messages?: UpstreamInboxMessage[];
  error?: string;
}

export interface DomainsResponse {
  status: boolean;
  domains: string[];
  error?: string;
}

export interface DeleteResultResponse {
  status: boolean;
  result?: boolean;
  error?: string;
}

export const tempMailApi = {
  async getDomains(): Promise<string[]> {
    try {
      const res = await fetch('/api/domains');
      const data: DomainsResponse = await res.json();
      if (data && data.status && Array.isArray(data.domains) && data.domains.length > 0) {
        return data.domains;
      }
    } catch (err) {
      console.error('Failed to fetch domains from /api/domains', err);
    }
    return [
      'mailto.plus',
      'fexpost.com',
      'fexbox.org',
      'mailbox.in.ua',
      'rover.info',
      'chitthi.in',
      'fextemp.com',
      'any.pink',
      'merepost.com',
    ];
  },

  async generateEmail(username?: string, domain?: string): Promise<GenerateEmailResponse> {
    const params = new URLSearchParams();
    if (username && username.trim()) params.set('username', username.trim());
    if (domain && domain.trim()) params.set('domain', domain.trim());

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/generate${qs}`);
    if (!res.ok) {
      throw new Error(`Failed to generate email: HTTP ${res.status}`);
    }
    return await res.json();
  },

  async getInbox(email: string): Promise<InboxResponse> {
    const params = new URLSearchParams({ email });
    const res = await fetch(`/api/inbox?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch inbox: HTTP ${res.status}`);
    }
    return await res.json();
  },

  async pollInbox(email: string): Promise<PollResponse> {
    const params = new URLSearchParams({ email });
    const res = await fetch(`/api/poll?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to poll inbox: HTTP ${res.status}`);
    }
    return await res.json();
  },

  async readEmail(email: string, mailId: string | number): Promise<ReadEmailResponse> {
    const params = new URLSearchParams({
      email,
      mail_id: String(mailId),
    });
    const res = await fetch(`/api/read?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to read email: HTTP ${res.status}`);
    }
    return await res.json();
  },

  async deleteEmail(email: string, mailId: string | number): Promise<DeleteResultResponse> {
    const params = new URLSearchParams({
      email,
      mail_id: String(mailId),
    });
    const res = await fetch(`/api/delete?${params.toString()}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete email: HTTP ${res.status}`);
    }
    return await res.json();
  },

  async destroyMailbox(email: string): Promise<DeleteResultResponse> {
    const params = new URLSearchParams({ email });
    const res = await fetch(`/api/destroy?${params.toString()}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to destroy mailbox: HTTP ${res.status}`);
    }
    return await res.json();
  },
};
