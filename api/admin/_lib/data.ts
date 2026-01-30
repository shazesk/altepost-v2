import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';

// Fallback to local JSON files for development
const DATA_DIR = path.join(process.cwd(), 'api/data');
const PAGES_DIR = path.join(DATA_DIR, 'pages');

// Check if Redis is configured
function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// Lazy-initialize Redis client only when needed and configured
let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!isRedisConfigured()) return null;
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

// Helper to read from local JSON file
function readLocalFile<T>(filename: string, defaultValue: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading ${filename}:`, e);
  }
  return defaultValue;
}

// Helper to write to local JSON file (for development)
function writeLocalFile(filename: string, data: any): void {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing ${filename}:`, e);
  }
}

// Interfaces
export interface Event {
  id: number;
  title: string;
  artist: string;
  date: string;
  time: string;
  price: number;
  genre: string;
  month: string;
  availability: 'available' | 'few-left' | 'sold-out';
  description: string;
  image: string | null;
  is_archived: boolean;
}

export interface Reservation {
  id: number;
  eventId: number;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export interface SiteSettings {
  logo: { mainText: string; subtitle: string };
  address: { street: string; postalCode: string; city: string };
  contact: {
    phone: string;
    emailGeneral: string;
    emailTickets: string;
    emailArtists: string;
    emailSponsors: string;
  };
  social: { instagram: string; facebook: string };
  organization: {
    name: string;
    registrationNumber: string;
    court: string;
    taxNumber: string;
    description: string;
  };
  officeHours: { days: string; hours: string };
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  formType: 'general' | 'artist' | 'sponsor';
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
  notes: string;
}

export interface VoucherOrder {
  id: number;
  voucherType: 'amount' | 'event';
  amount: string | null;
  eventName: string | null;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  recipientName: string;
  recipientEmail: string;
  message: string;
  delivery: 'email' | 'pickup';
  status: 'pending' | 'paid' | 'sent' | 'redeemed' | 'cancelled';
  createdAt: string;
  notes: string;
}

export interface MembershipApplication {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  membershipType: string;
  membershipPrice: string;
  message: string;
  status: 'pending' | 'approved' | 'active' | 'cancelled';
  createdAt: string;
  notes: string;
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  page: string;
}

// Default settings
const defaultSettings: SiteSettings = {
  logo: { mainText: 'Alte Post', subtitle: 'BRENSBACH' },
  address: { street: 'Hauptstraße 15', postalCode: '64395', city: 'Brensbach' },
  contact: {
    phone: '+49 (0) 6161 12 34 56',
    emailGeneral: 'info@alte-post-brensbach.de',
    emailTickets: 'tickets@alte-post-brensbach.de',
    emailArtists: 'programm@alte-post-brensbach.de',
    emailSponsors: 'foerderung@alte-post-brensbach.de',
  },
  social: { instagram: '', facebook: '' },
  organization: {
    name: 'KleinKunstKneipe Alte Post Brensbach e.V.',
    registrationNumber: 'VR 1234',
    court: 'Amtsgericht Darmstadt',
    taxNumber: '12/345/67890',
    description: '',
  },
  officeHours: { days: 'Montag bis Freitag', hours: '10:00 - 18:00 Uhr' },
};

// ============ EVENTS ============
export async function readEvents(): Promise<Event[]> {
  if (isRedisConfigured()) {
    try {
      const data = await getRedis()!.get<Event[]>('events');
      return data || [];
    } catch (e) {
      console.error('Redis error reading events:', e);
    }
  }
  return readLocalFile<Event[]>('events.json', []);
}

export async function writeEvents(events: Event[]): Promise<void> {
  if (isRedisConfigured()) {
    try {
      await getRedis()!.set('events', events);
      return;
    } catch (e) {
      console.error('Redis error writing events:', e);
    }
  }
  writeLocalFile('events.json', events);
}

// ============ RESERVATIONS ============
export async function readReservations(): Promise<Reservation[]> {
  if (isRedisConfigured()) {
    try {
      const data = await getRedis()!.get<Reservation[]>('reservations');
      return data || [];
    } catch (e) {
      console.error('Redis error reading reservations:', e);
    }
  }
  return readLocalFile<Reservation[]>('reservations.json', []);
}

export async function writeReservations(reservations: Reservation[]): Promise<void> {
  if (isRedisConfigured()) {
    try {
      await getRedis()!.set('reservations', reservations);
      return;
    } catch (e) {
      console.error('Redis error writing reservations:', e);
    }
  }
  writeLocalFile('reservations.json', reservations);
}

// ============ SETTINGS ============
export async function readSettings(): Promise<SiteSettings> {
  if (isRedisConfigured()) {
    try {
      const data = await getRedis()!.get<SiteSettings>('settings');
      return data || defaultSettings;
    } catch (e) {
      console.error('Redis error reading settings:', e);
    }
  }
  return readLocalFile<SiteSettings>('settings.json', defaultSettings);
}

export async function writeSettings(settings: SiteSettings): Promise<void> {
  if (isRedisConfigured()) {
    try {
      await getRedis()!.set('settings', settings);
      return;
    } catch (e) {
      console.error('Redis error writing settings:', e);
    }
  }
  writeLocalFile('settings.json', settings);
}

// ============ CONTACTS ============
export async function readContacts(): Promise<Contact[]> {
  if (isRedisConfigured()) {
    try {
      const data = await getRedis()!.get<Contact[]>('contacts');
      return data || [];
    } catch (e) {
      console.error('Redis error reading contacts:', e);
    }
  }
  return readLocalFile<Contact[]>('contacts.json', []);
}

export async function writeContacts(contacts: Contact[]): Promise<void> {
  if (isRedisConfigured()) {
    try {
      await getRedis()!.set('contacts', contacts);
      return;
    } catch (e) {
      console.error('Redis error writing contacts:', e);
    }
  }
  writeLocalFile('contacts.json', contacts);
}

// ============ VOUCHERS ============
export async function readVouchers(): Promise<VoucherOrder[]> {
  if (isRedisConfigured()) {
    try {
      const data = await getRedis()!.get<VoucherOrder[]>('vouchers');
      return data || [];
    } catch (e) {
      console.error('Redis error reading vouchers:', e);
    }
  }
  return readLocalFile<VoucherOrder[]>('vouchers.json', []);
}

export async function writeVouchers(vouchers: VoucherOrder[]): Promise<void> {
  if (isRedisConfigured()) {
    try {
      await getRedis()!.set('vouchers', vouchers);
      return;
    } catch (e) {
      console.error('Redis error writing vouchers:', e);
    }
  }
  writeLocalFile('vouchers.json', vouchers);
}

// ============ MEMBERSHIPS ============
export async function readMemberships(): Promise<MembershipApplication[]> {
  if (isRedisConfigured()) {
    try {
      const data = await getRedis()!.get<MembershipApplication[]>('memberships');
      return data || [];
    } catch (e) {
      console.error('Redis error reading memberships:', e);
    }
  }
  return readLocalFile<MembershipApplication[]>('memberships.json', []);
}

export async function writeMemberships(memberships: MembershipApplication[]): Promise<void> {
  if (isRedisConfigured()) {
    try {
      await getRedis()!.set('memberships', memberships);
      return;
    } catch (e) {
      console.error('Redis error writing memberships:', e);
    }
  }
  writeLocalFile('memberships.json', memberships);
}

// ============ PAGE CONTENT (CMS) ============
export async function readPageContent(pageName: string): Promise<any> {
  if (isRedisConfigured()) {
    try {
      const data = await getRedis()!.get(`page:${pageName}`);
      if (data) return data;
    } catch (e) {
      console.error(`Redis error reading page ${pageName}:`, e);
    }
  }
  // Fallback to local file
  try {
    const filePath = path.join(PAGES_DIR, `${pageName}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading page ${pageName}:`, e);
  }
  return null;
}

export async function writePageContent(pageName: string, content: any): Promise<void> {
  if (isRedisConfigured()) {
    try {
      await getRedis()!.set(`page:${pageName}`, content);
      // Also update the pages list
      const pages = await listPages();
      if (!pages.includes(pageName)) {
        await getRedis()!.set('pages_list', [...pages, pageName]);
      }
      return;
    } catch (e) {
      console.error(`Redis error writing page ${pageName}:`, e);
    }
  }
  // Fallback to local file
  try {
    const filePath = path.join(PAGES_DIR, `${pageName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing page ${pageName}:`, e);
  }
}

export async function listPages(): Promise<string[]> {
  if (isRedisConfigured()) {
    try {
      const data = await getRedis()!.get<string[]>('pages_list');
      if (data) return data;
    } catch (e) {
      console.error('Redis error listing pages:', e);
    }
  }
  // Fallback to local files
  try {
    if (fs.existsSync(PAGES_DIR)) {
      return fs.readdirSync(PAGES_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    }
  } catch (e) {
    console.error('Error listing pages:', e);
  }
  // Return default page list if file system not available
  return ['home', 'about', 'membership', 'artists', 'sponsors'];
}

// ============ TESTIMONIALS ============
export async function readTestimonials(): Promise<Testimonial[]> {
  if (isRedisConfigured()) {
    try {
      const data = await getRedis()!.get<Testimonial[]>('testimonials');
      return data || [];
    } catch (e) {
      console.error('Redis error reading testimonials:', e);
    }
  }
  return readLocalFile<Testimonial[]>('content/testimonials.json', []);
}

export async function writeTestimonials(testimonials: Testimonial[]): Promise<void> {
  if (isRedisConfigured()) {
    try {
      await getRedis()!.set('testimonials', testimonials);
      return;
    } catch (e) {
      console.error('Redis error writing testimonials:', e);
    }
  }
  writeLocalFile('content/testimonials.json', testimonials);
}

// ============ SESSIONS (for auth) ============
export async function readSessions(): Promise<any[]> {
  if (isRedisConfigured()) {
    try {
      const data = await getRedis()!.get<any[]>('sessions');
      return data || [];
    } catch (e) {
      console.error('Redis error reading sessions:', e);
    }
  }
  return readLocalFile<any[]>('sessions.json', []);
}

export async function writeSessions(sessions: any[]): Promise<void> {
  if (isRedisConfigured()) {
    try {
      await getRedis()!.set('sessions', sessions);
      return;
    } catch (e) {
      console.error('Redis error writing sessions:', e);
    }
  }
  writeLocalFile('sessions.json', sessions);
}

// ============ ADMINS ============
export async function readAdmins(): Promise<any[]> {
  if (isRedisConfigured()) {
    try {
      const data = await getRedis()!.get<any[]>('admins');
      if (data && data.length > 0) return data;
    } catch (e) {
      console.error('Redis error reading admins:', e);
    }
  }
  return readLocalFile<any[]>('admins.json', []);
}
