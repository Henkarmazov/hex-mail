export const AVAILABLE_DOMAINS = [
  'any.pink',
  'mailto.plus',
  'fexpost.com',
  'fexbox.org',
  'mailbox.in.ua',
  'rover.info',
  'chitthi.in',
  'fextemp.com',
  'merepost.com',
] as const;

export const DEFAULT_DOMAIN = 'any.pink';

const ADJECTIVES = [
  'swift', 'mint', 'crypt', 'silent', 'pixel', 'vivid', 'sage', 'frost',
  'amber', 'quiet', 'shadow', 'clover', 'cosmo', 'leaf', 'velvet', 'zen'
];

const NOUNS = [
  'fox', 'wave', 'stream', 'falcon', 'otter', 'spark', 'breeze', 'echo',
  'harbor', 'forge', 'nexus', 'pulse', 'finch', 'cedar', 'haven', 'orbit'
];

export function generateRandomUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}.${noun}${num}`;
}

export function generateFullEmail(domain: string = DEFAULT_DOMAIN): string {
  return `${generateRandomUsername()}@${domain}`;
}
