import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'api/data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const VOUCHERS_FILE = path.join(DATA_DIR, 'vouchers.json');
const MEMBERSHIPS_FILE = path.join(DATA_DIR, 'memberships.json');
const PAGES_DIR = path.join(DATA_DIR, 'pages');
const CONTENT_DIR = path.join(DATA_DIR, 'content');
const TESTIMONIALS_FILE = path.join(CONTENT_DIR, 'testimonials.json');

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

export function readEvents(): Event[] {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading events:', e);
  }
  return [];
}

export function readReservations(): Reservation[] {
  try {
    if (fs.existsSync(RESERVATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(RESERVATIONS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading reservations:', e);
  }
  return [];
}

// Note: Write operations won't persist on Vercel serverless (read-only filesystem)
// These are here for local development only
export function writeEvents(events: Event[]): void {
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing events:', e);
  }
}

export function writeReservations(reservations: Reservation[]): void {
  try {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing reservations:', e);
  }
}

// Settings
export function readSettings(): SiteSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading settings:', e);
  }
  return {
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
}

export function writeSettings(settings: SiteSettings): void {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing settings:', e);
  }
}

// Contacts
export function readContacts(): Contact[] {
  try {
    if (fs.existsSync(CONTACTS_FILE)) {
      return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading contacts:', e);
  }
  return [];
}

export function writeContacts(contacts: Contact[]): void {
  try {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing contacts:', e);
  }
}

// Vouchers
export function readVouchers(): VoucherOrder[] {
  try {
    if (fs.existsSync(VOUCHERS_FILE)) {
      return JSON.parse(fs.readFileSync(VOUCHERS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading vouchers:', e);
  }
  return [];
}

export function writeVouchers(vouchers: VoucherOrder[]): void {
  try {
    fs.writeFileSync(VOUCHERS_FILE, JSON.stringify(vouchers, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing vouchers:', e);
  }
}

// Memberships
export function readMemberships(): MembershipApplication[] {
  try {
    if (fs.existsSync(MEMBERSHIPS_FILE)) {
      return JSON.parse(fs.readFileSync(MEMBERSHIPS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading memberships:', e);
  }
  return [];
}

export function writeMemberships(memberships: MembershipApplication[]): void {
  try {
    fs.writeFileSync(MEMBERSHIPS_FILE, JSON.stringify(memberships, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing memberships:', e);
  }
}

// Page Content (CMS)
export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  page: string;
}

export function readPageContent(pageName: string): any {
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

export function writePageContent(pageName: string, content: any): void {
  try {
    const filePath = path.join(PAGES_DIR, `${pageName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing page ${pageName}:`, e);
  }
}

export function listPages(): string[] {
  try {
    if (fs.existsSync(PAGES_DIR)) {
      return fs.readdirSync(PAGES_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    }
  } catch (e) {
    console.error('Error listing pages:', e);
  }
  return [];
}

export function readTestimonials(): Testimonial[] {
  try {
    if (fs.existsSync(TESTIMONIALS_FILE)) {
      return JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading testimonials:', e);
  }
  return [];
}

export function writeTestimonials(testimonials: Testimonial[]): void {
  try {
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing testimonials:', e);
  }
}
