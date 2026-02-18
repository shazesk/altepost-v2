import React from "react";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Archive, RotateCcw, LogOut, Calendar, ArchiveIcon, Ticket, Check, X, Clock, Eye, Mail, Phone, User, MessageSquare, Gift, Users, Settings, FileText, Save, ChevronRight, ImageIcon, RefreshCw, Handshake, Newspaper, ExternalLink, Download, Camera } from 'lucide-react';

interface Event {
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
  photos?: string[];
}

interface Reservation {
  id: number;
  eventId: number;
  eventTitle?: string;
  eventDate?: string;
  eventArtist?: string;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  status: 'active' | 'archived';
  notes: string;
  createdAt: string;
}

interface Stats {
  upcoming: number;
  archived: number;
  total: number;
  reservations?: {
    active: number;
    archived: number;
    total: number;
    totalTickets: number;
  };
  contacts?: { active: number; archived: number; total: number };
  vouchers?: { active: number; archived: number; total: number };
  memberships?: { active: number; archived: number; total: number };
  newsletter?: { active: number; unsubscribed: number; total: number };
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  formType: 'general' | 'artist' | 'sponsor';
  newsletterOptIn?: boolean;
  status: 'active' | 'archived';
  createdAt: string;
  notes: string;
}

interface VoucherOrder {
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
  delivery: 'email' | 'post' | 'pickup';
  status: 'active' | 'archived';
  createdAt: string;
  notes: string;
}

interface MembershipApplication {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  membershipType: string;
  birthdate: string;
  memberSince: string;
  iban: string;
  ibanLast4: string;
  message: string;
  status: 'active' | 'archived';
  createdAt: string;
  notes: string;
}

interface SiteSettings {
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
  images?: { logo: string; hero: string };
}

interface Sponsor {
  id: number;
  name: string;
  logo: string | null;
  url: string | null;
  category: 'hauptfoerderer' | 'foerderer' | 'kooperationspartner';
  position: number;
}

interface NewsletterSubscriber {
  id: number;
  email: string;
  name: string;
  source: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

const API_BASE = '/api/admin';

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeView, setActiveView] = useState<'events' | 'archive' | 'reservations' | 'contacts' | 'vouchers' | 'memberships' | 'settings' | 'cms' | 'gallery' | 'sponsors' | 'newsletter'>('events');
  const [reservationFilter, setReservationFilter] = useState<'active' | 'archived'>('active');
  const [selectedEventFilter, setSelectedEventFilter] = useState<number | null>(null);
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null);

  // New state for contacts, vouchers, memberships, settings
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [vouchers, setVouchers] = useState<VoucherOrder[]>([]);
  const [memberships, setMemberships] = useState<MembershipApplication[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [contactFilter, setContactFilter] = useState<'active' | 'archived'>('active');
  const [voucherFilter, setVoucherFilter] = useState<'active' | 'archived'>('active');
  const [membershipFilter, setMembershipFilter] = useState<'active' | 'archived'>('active');
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [editingSettings, setEditingSettings] = useState(false);

  // CMS state
  const [cmsPages, setCmsPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<any>(null);
  const [editingPageContent, setEditingPageContent] = useState(false);
  const [savingPage, setSavingPage] = useState(false);

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Settings image state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<Array<{ id: number; position: number; image: string; alt: string; label: string }>>([]);
  const [editingGallerySlot, setEditingGallerySlot] = useState<number | null>(null);
  const [galleryAlt, setGalleryAlt] = useState('');
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(null);
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [savingGallery, setSavingGallery] = useState(false);

  // Sponsors state
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [isCreatingSponsor, setIsCreatingSponsor] = useState(false);

  // Newsletter state
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);

  // Event photos state
  const [managingPhotosEvent, setManagingPhotosEvent] = useState<Event | null>(null);
  const [eventPhotos, setEventPhotos] = useState<string[]>([]);
  const [savingPhotos, setSavingPhotos] = useState(false);

  // Check stored session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('adminSessionId');
    if (storedSession) {
      setSessionId(storedSession);
      checkAuth(storedSession);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && sessionId) {
      loadStats();
      loadEvents();
      loadReservations();
      loadContacts();
      loadVouchers();
      loadMemberships();
      loadSettings();
    }
  }, [isAuthenticated, sessionId, showArchived]);

  async function checkAuth(session: string) {
    try {
      const res = await fetch(`${API_BASE}/auth?action=check`, {
        headers: { 'x-session-id': session }
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('adminSessionId');
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/auth?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('adminSessionId', data.sessionId);
        setSessionId(data.sessionId);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch {
      setLoginError('Connection error');
    }
  }

  async function handleLogout() {
    if (sessionId) {
      await fetch(`${API_BASE}/auth?action=logout`, {
        method: 'POST',
        headers: { 'x-session-id': sessionId }
      });
    }
    localStorage.removeItem('adminSessionId');
    setSessionId(null);
    setIsAuthenticated(false);
  }

  async function loadStats() {
    try {
      const res = await fetch(`${API_BASE}/data?type=stats`, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error('Failed to load stats');
    }
  }

  async function loadEvents() {
    try {
      const res = await fetch(`${API_BASE}/events?archived=${showArchived ? '1' : '0'}`, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (e) {
      console.error('Failed to load events');
    }
  }

  async function loadReservations() {
    try {
      let url = `${API_BASE}/reservations`;
      const params = new URLSearchParams();
      params.append('status', reservationFilter);
      if (selectedEventFilter) params.append('eventId', String(selectedEventFilter));
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setReservations(data.data);
      }
    } catch (e) {
      console.error('Failed to load reservations');
    }
  }

  // Reload reservations when filter changes
  useEffect(() => {
    if (isAuthenticated && sessionId) {
      loadReservations();
    }
  }, [reservationFilter, selectedEventFilter]);

  async function loadContacts() {
    try {
      const res = await fetch(`${API_BASE}/data?type=contacts`, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (e) {
      console.error('Failed to load contacts');
    }
  }

  async function loadVouchers() {
    try {
      const res = await fetch(`${API_BASE}/data?type=vouchers`, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setVouchers(data.data);
      }
    } catch (e) {
      console.error('Failed to load vouchers');
    }
  }

  async function loadMemberships() {
    try {
      const res = await fetch(`${API_BASE}/data?type=memberships`, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setMemberships(data.data);
      }
    } catch (e) {
      console.error('Failed to load memberships');
    }
  }

  async function loadSettings() {
    try {
      const res = await fetch(`${API_BASE}/data?type=settings`, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setSiteSettings(data.data);
      }
    } catch (e) {
      console.error('Failed to load settings');
    }
  }

  // No need to reload on filter change - contacts/vouchers/memberships are filtered at render time

  // Sponsors functions
  async function loadSponsors() {
    try {
      const res = await fetch(`${API_BASE}/data?type=sponsors`, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setSponsors(data.data);
      }
    } catch (e) {
      console.error('Failed to load sponsors');
    }
  }

  async function handleSaveSponsor(sponsor: Sponsor) {
    try {
      if (sponsor.id) {
        // Update existing
        const res = await fetch(`${API_BASE}/data?type=sponsors&id=${sponsor.id}`, {
          method: 'PUT',
          headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
          body: JSON.stringify(sponsor)
        });
        const data = await res.json();
        if (data.success) {
          setMessage({ text: 'Sponsor aktualisiert', type: 'success' });
          loadSponsors();
        }
      } else {
        // Create new
        const res = await fetch(`${API_BASE}/data?type=sponsors`, {
          method: 'POST',
          headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
          body: JSON.stringify(sponsor)
        });
        const data = await res.json();
        if (data.success) {
          setMessage({ text: 'Sponsor erstellt', type: 'success' });
          loadSponsors();
        }
      }
    } catch {
      setMessage({ text: 'Fehler beim Speichern', type: 'error' });
    }
    setEditingSponsor(null);
    setIsCreatingSponsor(false);
  }

  async function handleDeleteSponsor(id: number) {
    if (!confirm('Sponsor wirklich löschen?')) return;
    try {
      const res = await fetch(`${API_BASE}/data?type=sponsors&id=${id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Sponsor gelöscht', type: 'success' });
        loadSponsors();
      }
    } catch {
      setMessage({ text: 'Fehler beim Löschen', type: 'error' });
    }
  }

  // Newsletter functions
  async function loadNewsletter() {
    try {
      const res = await fetch(`${API_BASE}/data?type=newsletter`, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterSubscribers(data.data);
      }
    } catch (e) {
      console.error('Failed to load newsletter');
    }
  }

  async function handleToggleSubscription(subscriber: NewsletterSubscriber) {
    const newStatus = subscriber.status === 'active' ? 'unsubscribed' : 'active';
    try {
      const res = await fetch(`${API_BASE}/data?type=newsletter&id=${subscriber.id}`, {
        method: 'PUT',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: newStatus === 'active' ? 'Abo reaktiviert' : 'Abo deaktiviert', type: 'success' });
        loadNewsletter();
        loadStats();
      }
    } catch {
      setMessage({ text: 'Fehler beim Aktualisieren', type: 'error' });
    }
  }

  async function handleDeleteSubscriber(id: number) {
    if (!confirm('Abonnent wirklich löschen?')) return;
    try {
      const res = await fetch(`${API_BASE}/data?type=newsletter&id=${id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Abonnent gelöscht', type: 'success' });
        loadNewsletter();
        loadStats();
      }
    } catch {
      setMessage({ text: 'Fehler beim Löschen', type: 'error' });
    }
  }

  // CMS functions
  async function loadCmsPages() {
    try {
      const res = await fetch(`${API_BASE}/data?type=pages`, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setCmsPages(data.data);
      }
    } catch (e) {
      console.error('Failed to load CMS pages');
    }
  }

  async function loadPageContent(pageName: string) {
    try {
      const res = await fetch(`${API_BASE}/data?type=page&name=${pageName}`, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setPageContent(data.data);
        setSelectedPage(pageName);
      }
    } catch (e) {
      console.error('Failed to load page content');
    }
  }

  async function handleSavePageContent() {
    if (!selectedPage || !pageContent) return;
    setSavingPage(true);
    try {
      const res = await fetch(`${API_BASE}/data?type=page&name=${selectedPage}`, {
        method: 'PUT',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify(pageContent)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Seite gespeichert', type: 'success' });
        setEditingPageContent(false);
      } else {
        setMessage({ text: data.error || 'Speichern fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    } finally {
      setSavingPage(false);
    }
  }

  // Load CMS pages when entering CMS view
  useEffect(() => {
    if (isAuthenticated && sessionId && activeView === 'cms') {
      loadCmsPages();
    }
  }, [activeView, isAuthenticated, sessionId]);

  // Load gallery when entering gallery view
  useEffect(() => {
    if (isAuthenticated && sessionId && activeView === 'gallery') {
      loadGallery();
    }
  }, [activeView, isAuthenticated, sessionId]);

  // Load sponsors when entering sponsors view
  useEffect(() => {
    if (isAuthenticated && sessionId && activeView === 'sponsors') {
      loadSponsors();
    }
  }, [activeView, isAuthenticated, sessionId]);

  // Load newsletter when entering newsletter view
  useEffect(() => {
    if (isAuthenticated && sessionId && activeView === 'newsletter') {
      loadNewsletter();
    }
  }, [activeView, isAuthenticated, sessionId]);

  async function loadGallery() {
    try {
      const res = await fetch(`${API_BASE}/data?type=gallery`, {
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setGalleryImages(data.data);
      }
    } catch {
      console.error('Failed to load gallery');
    }
  }

  function handleGalleryImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: 'Bild zu groß. Maximum: 2MB', type: 'error' });
        return;
      }
      setGalleryImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setGalleryImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSaveGallerySlot() {
    if (editingGallerySlot === null) return;
    setSavingGallery(true);
    try {
      const updated = galleryImages.map(img => {
        if (img.position === editingGallerySlot) {
          return {
            ...img,
            image: galleryImagePreview || img.image,
            alt: galleryAlt || img.alt
          };
        }
        return img;
      });
      const res = await fetch(`${API_BASE}/data?type=gallery`, {
        method: 'PUT',
        headers: {
          'x-session-id': sessionId!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        setGalleryImages(updated);
        setEditingGallerySlot(null);
        setGalleryImagePreview(null);
        setGalleryImageFile(null);
        setGalleryAlt('');
        setMessage({ text: 'Galerie-Bild aktualisiert', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Speichern fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    } finally {
      setSavingGallery(false);
    }
  }

  async function handleSaveEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Build JSON data from form
      const eventData: Record<string, any> = {
        title: formData.get('title'),
        artist: formData.get('artist'),
        date: formData.get('date'),
        time: formData.get('time'),
        price: formData.get('price'),
        genre: formData.get('genre'),
        availability: formData.get('availability'),
        description: formData.get('description'),
        is_archived: formData.get('is_archived') === 'true'
      };

      // Handle image - convert to base64 if new file selected
      if (selectedImageFile) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedImageFile);
        });
        eventData.image = base64;
      } else if (editingEvent?.image && !imagePreview) {
        // Keep existing image if not changed and not removed
        eventData.image = editingEvent.image;
      } else if (imagePreview === null && editingEvent?.image) {
        // Image was removed
        eventData.image = null;
      }

      const res = await fetch(`${API_BASE}/events`, {
        method: editingEvent ? 'PUT' : 'POST',
        headers: {
          'x-session-id': sessionId!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingEvent ? { ...eventData, id: editingEvent.id } : eventData)
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: editingEvent ? 'Event aktualisiert' : 'Event erstellt', type: 'success' });
        setEditingEvent(null);
        setIsCreating(false);
        setImagePreview(null);
        setSelectedImageFile(null);
        loadEvents();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Speichern fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB for base64 storage)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: 'Bild zu groß. Maximum: 2MB', type: 'error' });
        return;
      }
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveImage() {
    setImagePreview(null);
    setSelectedImageFile(null);
  }

  async function handleDelete(id: number) {
    if (id === undefined || id === null) {
      setMessage({ text: 'Fehler: Event-ID fehlt', type: 'error' });
      return;
    }

    if (!confirm('Wirklich löschen?')) return;

    try {
      // Use POST with action=delete (more reliable than DELETE with body)
      const res = await fetch(`${API_BASE}/events?action=delete`, {
        method: 'POST',
        headers: {
          'x-session-id': sessionId!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: 'Event gelöscht', type: 'success' });
        loadEvents();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Löschen fehlgeschlagen', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleToggleArchive(id: number) {
    try {
      const res = await fetch(`${API_BASE}/events?action=toggle-archive`, {
        method: 'POST',
        headers: {
          'x-session-id': sessionId!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: 'Archivstatus geändert', type: 'success' });
        loadEvents();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Aktualisierung fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  function openPhotoManager(event: Event) {
    setManagingPhotosEvent(event);
    setEventPhotos(event.photos || []);
  }

  function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (eventPhotos.length + newPhotos.length >= 5) {
        setMessage({ text: 'Maximum 5 Fotos pro Veranstaltung', type: 'error' });
        break;
      }
      const compressed = await compressImage(file);
      newPhotos.push(compressed);
    }

    setEventPhotos(prev => [...prev, ...newPhotos]);
    e.target.value = '';
  }

  function handleRemovePhoto(index: number) {
    setEventPhotos(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSavePhotos() {
    if (!managingPhotosEvent) return;
    setSavingPhotos(true);
    try {
      const res = await fetch(`${API_BASE}/events?action=update-photos`, {
        method: 'POST',
        headers: {
          'x-session-id': sessionId!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: managingPhotosEvent.id, photos: eventPhotos })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Fotos gespeichert', type: 'success' });
        setManagingPhotosEvent(null);
        loadEvents();
      } else {
        setMessage({ text: data.error || 'Speichern fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    } finally {
      setSavingPhotos(false);
    }
  }

  async function handleSaveReservation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => { data[key] = value.toString(); });

    try {
      const url = editingReservation
        ? `${API_BASE}/reservations/${editingReservation.id}`
        : `${API_BASE}/reservations`;

      const res = await fetch(url, {
        method: editingReservation ? 'PUT' : 'POST',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ text: editingReservation ? 'Reservierung aktualisiert' : 'Reservierung erstellt', type: 'success' });
        setEditingReservation(null);
        setIsCreatingReservation(false);
        loadReservations();
        loadStats();
      } else {
        setMessage({ text: result.error || 'Speichern fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleReservationRestore(id: number) {
    // Optimistic: move item to active immediately
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'active' } : r));
    try {
      const res = await fetch(`${API_BASE}/data?type=reservations&id=${id}`, {
        method: 'PUT',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Wiederhergestellt', type: 'success' });
        loadStats();
      } else {
        setMessage({ text: data.error || 'Wiederherstellen fehlgeschlagen', type: 'error' });
        loadReservations(); // revert on failure
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
      loadReservations(); // revert on failure
    }
  }

  async function handleReservationArchive(id: number) {
    // Optimistic: move item to archived immediately
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'archived' } : r));
    try {
      const res = await fetch(`${API_BASE}/data?type=reservations&id=${id}`, {
        method: 'PUT',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: 'Archiviert', type: 'success' });
        loadStats();
      } else {
        setMessage({ text: data.error || 'Archivierung fehlgeschlagen', type: 'error' });
        loadReservations(); // revert on failure
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
      loadReservations(); // revert on failure
    }
  }

  async function handleDeleteReservation(id: number) {
    if (!confirm('Reservierung wirklich löschen?')) return;

    // Optimistic: remove item immediately
    setReservations(prev => prev.filter(r => r.id !== id));
    try {
      const res = await fetch(`${API_BASE}/data?type=reservations&id=${id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId! }
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: 'Reservierung gelöscht', type: 'success' });
        loadStats();
      } else {
        setMessage({ text: data.error || 'Löschen fehlgeschlagen', type: 'error' });
        loadReservations(); // revert on failure
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
      loadReservations(); // revert on failure
    }
  }

  // Handler functions for contacts, vouchers, memberships
  async function handleContactRestore(id: number) {
    try {
      const res = await fetch(`${API_BASE}/data?type=contacts&id=${id}`, {
        method: 'PUT',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Wiederhergestellt', type: 'success' });
        loadContacts();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Wiederherstellen fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleContactArchive(id: number) {
    try {
      const res = await fetch(`${API_BASE}/data?type=contacts&id=${id}`, {
        method: 'PUT',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Archiviert', type: 'success' });
        loadContacts();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Archivierung fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleDeleteContact(id: number) {
    if (!confirm('Nachricht wirklich löschen?')) return;
    try {
      const res = await fetch(`${API_BASE}/data?type=contacts&id=${id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Nachricht gelöscht', type: 'success' });
        loadContacts();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Löschen fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleVoucherRestore(id: number) {
    try {
      const res = await fetch(`${API_BASE}/data?type=vouchers&id=${id}`, {
        method: 'PUT',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Wiederhergestellt', type: 'success' });
        loadVouchers();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Wiederherstellen fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleVoucherArchive(id: number) {
    try {
      const res = await fetch(`${API_BASE}/data?type=vouchers&id=${id}`, {
        method: 'PUT',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Archiviert', type: 'success' });
        loadVouchers();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Archivierung fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleDeleteVoucher(id: number) {
    if (!confirm('Gutschein-Bestellung wirklich löschen?')) return;
    try {
      const res = await fetch(`${API_BASE}/data?type=vouchers&id=${id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Gutschein-Bestellung gelöscht', type: 'success' });
        loadVouchers();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Löschen fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleMembershipRestore(id: number) {
    try {
      const res = await fetch(`${API_BASE}/data?type=memberships&id=${id}`, {
        method: 'PUT',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Wiederhergestellt', type: 'success' });
        loadMemberships();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Wiederherstellen fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleMembershipArchive(id: number) {
    try {
      const res = await fetch(`${API_BASE}/data?type=memberships&id=${id}`, {
        method: 'PUT',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Archiviert', type: 'success' });
        loadMemberships();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Archivierung fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleDeleteMembership(id: number) {
    if (!confirm('Mitgliedsantrag wirklich löschen?')) return;
    try {
      const res = await fetch(`${API_BASE}/data?type=memberships&id=${id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId! }
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Mitgliedsantrag gelöscht', type: 'success' });
        loadMemberships();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Löschen fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const updatedSettings: SiteSettings = {
      logo: {
        mainText: formData.get('logo_mainText') as string,
        subtitle: formData.get('logo_subtitle') as string,
      },
      address: {
        street: formData.get('address_street') as string,
        postalCode: formData.get('address_postalCode') as string,
        city: formData.get('address_city') as string,
      },
      contact: {
        phone: formData.get('contact_phone') as string,
        emailGeneral: formData.get('contact_emailGeneral') as string,
        emailTickets: formData.get('contact_emailTickets') as string,
        emailArtists: formData.get('contact_emailArtists') as string,
        emailSponsors: formData.get('contact_emailSponsors') as string,
      },
      social: {
        instagram: formData.get('social_instagram') as string,
        facebook: formData.get('social_facebook') as string,
      },
      organization: {
        name: formData.get('org_name') as string,
        registrationNumber: formData.get('org_registrationNumber') as string,
        court: formData.get('org_court') as string,
        taxNumber: formData.get('org_taxNumber') as string,
        description: formData.get('org_description') as string,
      },
      officeHours: {
        days: formData.get('hours_days') as string,
        hours: formData.get('hours_hours') as string,
      },
      images: {
        logo: siteSettings?.images?.logo || '/logo.png',
        hero: siteSettings?.images?.hero || '/hero-band.jpg',
      },
    };

    // Handle logo upload
    if (logoFile) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(logoFile);
      });
      updatedSettings.images!.logo = base64;
    }

    // Handle hero image upload
    if (heroFile) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(heroFile);
      });
      updatedSettings.images!.hero = base64;
    }

    try {
      const res = await fetch(`${API_BASE}/data?type=settings`, {
        method: 'PUT',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Einstellungen gespeichert', type: 'success' });
        setSiteSettings(updatedSettings);
        setEditingSettings(false);
        setLogoPreview(null);
        setHeroPreview(null);
        setLogoFile(null);
        setHeroFile(null);
      } else {
        setMessage({ text: data.error || 'Speichern fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="animate-pulse text-[#666666]">Lädt...</div>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf9f7] to-[#e8e4df] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-[rgba(107,142,111,0.2)]">
          <div className="text-center mb-8">
            <h1 className="font-['Playfair_Display',serif] text-3xl text-[#2d2d2d] mb-2">Alte Post</h1>
            <p className="text-[#666666]">Admin-Bereich</p>
          </div>

          {loginError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Benutzername</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#6b8e6f] text-white py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors"
            >
              Anmelden
            </button>
          </form>

          <p className="text-center mt-6">
            <a href="/" className="text-[#6b8e6f] hover:underline text-sm">&larr; Zurück zur Website</a>
          </p>
        </div>
      </div>
    );
  }

  // Reservation detail view
  if (viewingReservation) {
    const r = viewingReservation;
    return (
      <div className="min-h-screen bg-[#faf9f7]">
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">Reservierungsdetails</h1>
            <button onClick={() => setViewingReservation(null)} className="text-[#666666] hover:text-[#2d2d2d]">
              Schließen
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)] space-y-4">
            <div className="flex justify-between items-start">
              <div>
                {r.status === 'archived' && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#e8e4df] text-[#666666]">
                    Archiviert
                  </span>
                )}
              </div>
              <div className="text-sm text-[#666666]">#{r.id}</div>
            </div>

            <div className="border-t border-[rgba(107,142,111,0.1)] pt-4">
              <h3 className="font-medium text-[#2d2d2d] mb-2">Veranstaltung</h3>
              <div className="text-[#666666]">
                <div className="font-medium text-[#2d2d2d]">{r.eventTitle}</div>
                <div>{r.eventArtist} • {r.eventDate}</div>
              </div>
            </div>

            <div className="border-t border-[rgba(107,142,111,0.1)] pt-4">
              <h3 className="font-medium text-[#2d2d2d] mb-2">Kontaktdaten</h3>
              <div className="space-y-2 text-[#666666]">
                <div className="flex items-center gap-2"><User className="w-4 h-4" /> {r.name}</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {r.email}</div>
                {r.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {r.phone}</div>}
              </div>
            </div>

            <div className="border-t border-[rgba(107,142,111,0.1)] pt-4">
              <h3 className="font-medium text-[#2d2d2d] mb-2">Tickets</h3>
              <div className="text-2xl font-['Playfair_Display',serif] text-[#6b8e6f]">{r.tickets} Tickets</div>
            </div>

            {r.notes && (
              <div className="border-t border-[rgba(107,142,111,0.1)] pt-4">
                <h3 className="font-medium text-[#2d2d2d] mb-2">Notizen</h3>
                <div className="text-[#666666] bg-[#faf9f7] p-3 rounded-lg">{r.notes}</div>
              </div>
            )}

            <div className="border-t border-[rgba(107,142,111,0.1)] pt-4">
              <h3 className="font-medium text-[#2d2d2d] mb-2">Erstellt am</h3>
              <div className="text-[#666666]">{formatDate(r.createdAt)}</div>
            </div>

            <div className="border-t border-[rgba(107,142,111,0.1)] pt-4 flex gap-2 flex-wrap">
              <a
                href={`mailto:${r.email}?subject=Ihre Reservierung - ${r.eventTitle}`}
                className="flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-lg hover:bg-[#5a7a5e]"
              >
                <Mail className="w-4 h-4" /> Antworten
              </a>
              {r.status === 'archived' ? (
                <button
                  onClick={() => { handleReservationRestore(r.id); setViewingReservation(null); }}
                  className="flex items-center gap-2 bg-[#e8e4df] text-[#2d2d2d] px-4 py-2 rounded-lg hover:bg-[#d8d4cf]"
                >
                  <RotateCcw className="w-4 h-4" /> Wiederherstellen
                </button>
              ) : (
                <button
                  onClick={() => { handleReservationArchive(r.id); setViewingReservation(null); }}
                  className="flex items-center gap-2 bg-[#e8e4df] text-[#2d2d2d] px-4 py-2 rounded-lg hover:bg-[#d8d4cf]"
                >
                  <Archive className="w-4 h-4" /> Archivieren
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reservation form
  if (isCreatingReservation || editingReservation) {
    const r = editingReservation;
    const allEvents = [...events];
    // Load all events for dropdown
    return (
      <div className="min-h-screen bg-[#faf9f7]">
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">
              {r ? 'Reservierung bearbeiten' : 'Neue Reservierung'}
            </h1>
            <button
              onClick={() => { setEditingReservation(null); setIsCreatingReservation(false); }}
              className="text-[#666666] hover:text-[#2d2d2d]"
            >
              Abbrechen
            </button>
          </div>

          <form onSubmit={handleSaveReservation} className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Veranstaltung *</label>
                <select
                  name="eventId"
                  defaultValue={r?.eventId || ''}
                  required
                  className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                >
                  <option value="">Bitte wählen...</option>
                  {events.filter(e => !e.is_archived).map(event => (
                    <option key={event.id} value={event.id}>{event.title} - {event.date}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={r?.name || ''}
                    required
                    className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-1">E-Mail *</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={r?.email || ''}
                    required
                    className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={r?.phone || ''}
                    className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Anzahl Tickets *</label>
                  <input
                    type="number"
                    name="tickets"
                    min="1"
                    max="20"
                    defaultValue={r?.tickets || 1}
                    required
                    className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                  />
                </div>
              </div>

              {r && (
                <div>
                  <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={r.status}
                    className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                  >
                    <option value="active">Aktiv</option>
                    <option value="archived">Archiviert</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Notizen</label>
                <textarea
                  name="notes"
                  defaultValue={r?.notes || ''}
                  rows={3}
                  className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="bg-[#6b8e6f] text-white px-6 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors"
              >
                {r ? 'Speichern' : 'Erstellen'}
              </button>
              <button
                type="button"
                onClick={() => { setEditingReservation(null); setIsCreatingReservation(false); }}
                className="bg-[#e8e4df] text-[#2d2d2d] px-6 py-2 rounded-lg hover:bg-[#d8d4cf] transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Event form
  if (isCreating || editingEvent) {
    const event = editingEvent;
    return (
      <div className="min-h-screen bg-[#faf9f7]">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">
              {event ? 'Veranstaltung bearbeiten' : 'Neue Veranstaltung'}
            </h1>
            <button
              onClick={() => { setEditingEvent(null); setIsCreating(false); setImagePreview(null); setSelectedImageFile(null); }}
              className="text-[#666666] hover:text-[#2d2d2d]"
            >
              Abbrechen
            </button>
          </div>

          <form onSubmit={handleSaveEvent} className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Titel *</label>
                <input type="text" name="title" defaultValue={event?.title || ''} required className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Künstler *</label>
                <input type="text" name="artist" defaultValue={event?.artist || ''} required className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Datum *</label>
                <input type="date" name="date" defaultValue={event?.date || ''} required className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Uhrzeit *</label>
                <input type="time" name="time" defaultValue={event?.time?.substring(0, 5) || ''} required className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Preis (EUR)</label>
                <input type="number" name="price" step="0.01" min="0" defaultValue={event?.price || 0} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Genre *</label>
                <input type="text" name="genre" defaultValue={event?.genre || ''} required list="genre-suggestions" className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]" />
                <datalist id="genre-suggestions">
                  <option value="Jazz" /><option value="Kabarett" /><option value="Theater" /><option value="Liedermacher" /><option value="Folk" /><option value="Klassik" /><option value="Blues" /><option value="Literatur" />
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Verfügbarkeit</label>
                <select name="availability" defaultValue={event?.availability || 'available'} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]">
                  <option value="available">Verfügbar</option>
                  <option value="few-left">Wenige Tickets</option>
                  <option value="sold-out">Ausverkauft</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Bild</label>
                <div className="space-y-3">
                  {/* Current/Preview Image */}
                  {(imagePreview || event?.image) && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || event?.image || ''}
                        alt="Vorschau"
                        className="w-48 h-32 object-cover rounded-lg border border-[rgba(107,142,111,0.3)]"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Bild entfernen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {/* File Input */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                    />
                    <p className="text-xs text-[#666666] mt-1">Max. 2 MB. Empfohlen: 800x600px</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Beschreibung</label>
              <textarea name="description" defaultValue={event?.description || ''} rows={3} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]" />
            </div>
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_archived" value="true" defaultChecked={event?.is_archived || false} className="w-4 h-4 accent-[#6b8e6f]" />
                <span className="text-sm text-[#2d2d2d]">Archiviert</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-[#6b8e6f] text-white px-6 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors">{event ? 'Speichern' : 'Erstellen'}</button>
              <button type="button" onClick={() => { setEditingEvent(null); setIsCreating(false); setImagePreview(null); setSelectedImageFile(null); }} className="bg-[#e8e4df] text-[#2d2d2d] px-6 py-2 rounded-lg hover:bg-[#d8d4cf] transition-colors">Abbrechen</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main admin panel
  return (
    <div className="min-h-screen bg-[#faf9f7] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2d2d2d] text-white flex flex-col min-h-screen">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-['Playfair_Display',serif] text-xl">Alte Post</h1>
          <p className="text-white/60 text-sm">Admin</p>
        </div>

        <nav className="flex-1 p-4">
          <button
            onClick={() => { setActiveView('events'); setShowArchived(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'events' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Calendar className="w-5 h-5" />
            Veranstaltungen
          </button>
          <button
            onClick={() => { setActiveView('reservations'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'reservations' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Ticket className="w-5 h-5" />
            Reservierungen
            {stats?.reservations?.active ? (
              <span className="ml-auto bg-[#6b8e6f]/50 text-white text-xs px-2 py-0.5 rounded-full">{stats.reservations.active}</span>
            ) : null}
          </button>
          <button
            onClick={() => { setActiveView('archive'); setShowArchived(true); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'archive' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <ArchiveIcon className="w-5 h-5" />
            Archiv
          </button>

          <div className="border-t border-white/10 my-4" />

          <button
            onClick={() => { setActiveView('contacts'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'contacts' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <MessageSquare className="w-5 h-5" />
            Nachrichten
            {stats?.contacts?.active ? (
              <span className="ml-auto bg-[#6b8e6f]/50 text-white text-xs px-2 py-0.5 rounded-full">{stats.contacts.active}</span>
            ) : null}
          </button>
          <button
            onClick={() => { setActiveView('vouchers'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'vouchers' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Gift className="w-5 h-5" />
            Gutscheine
            {stats?.vouchers?.active ? (
              <span className="ml-auto bg-[#6b8e6f]/50 text-white text-xs px-2 py-0.5 rounded-full">{stats.vouchers.active}</span>
            ) : null}
          </button>
          <button
            onClick={() => { setActiveView('memberships'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'memberships' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Users className="w-5 h-5" />
            Mitglieder
            {stats?.memberships?.active ? (
              <span className="ml-auto bg-[#6b8e6f]/50 text-white text-xs px-2 py-0.5 rounded-full">{stats.memberships.active}</span>
            ) : null}
          </button>
          <button
            onClick={() => { setActiveView('sponsors'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'sponsors' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Handshake className="w-5 h-5" />
            Sponsoren
          </button>
          <button
            onClick={() => { setActiveView('newsletter'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'newsletter' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Newspaper className="w-5 h-5" />
            Newsletter
            {stats?.newsletter?.active ? (
              <span className="ml-auto bg-[#6b8e6f]/50 text-white text-xs px-2 py-0.5 rounded-full">{stats.newsletter.active}</span>
            ) : null}
          </button>
          <button
            onClick={() => { setActiveView('settings'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'settings' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Settings className="w-5 h-5" />
            Einstellungen
          </button>

          <div className="border-t border-white/10 my-4" />
          <div className="text-xs text-white/40 uppercase tracking-wider px-4 mb-2">CMS</div>

          <button
            onClick={() => { setActiveView('cms'); setSelectedPage(null); setPageContent(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'cms' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <FileText className="w-5 h-5" />
            Seiten bearbeiten
          </button>
          <button
            onClick={() => { setActiveView('gallery'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'gallery' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <ImageIcon className="w-5 h-5" />
            Galerie
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Abmelden
          </button>
          <p className="text-white/40 text-xs mt-4 text-center">build: v3-post-delete</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {message && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Refresh notice */}
        <div className="mb-6 bg-[#f5f3ef] border border-[rgba(107,142,111,0.25)] rounded-xl px-5 py-4 flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-[#6b8e6f] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#555555] leading-relaxed">
            Neue Nachrichten, Reservierungen, Gutschein-Bestellungen und Mitgliedsanträge werden beim Laden der Seite abgerufen. Bitte aktualisieren Sie die Seite, um die neuesten Eingänge zu sehen.
          </p>
        </div>

        {activeView === 'reservations' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">Reservierungen</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReservationFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      reservationFilter === 'active'
                        ? 'bg-[#6b8e6f] text-white'
                        : 'bg-[#e8e4df] text-[#666666] hover:bg-[#d8d4cf]'
                    }`}
                  >
                    Aktiv
                  </button>
                  <button
                    onClick={() => setReservationFilter('archived')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      reservationFilter === 'archived'
                        ? 'bg-[#6b8e6f] text-white'
                        : 'bg-[#e8e4df] text-[#666666] hover:bg-[#d8d4cf]'
                    }`}
                  >
                    Archiv {stats?.reservations?.archived > 0 && <span>({stats.reservations.archived})</span>}
                  </button>
                </div>
              </div>
              <button onClick={() => setIsCreatingReservation(true)} className="flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors">
                <Plus className="w-5 h-5" /> Neue Reservierung
              </button>
            </div>

            {/* Event filter - only show for active view */}
            {reservationFilter === 'active' && (
              <div className="flex flex-wrap gap-4 mb-6">
                <div>
                  <label className="block text-sm text-[#666666] mb-1">Veranstaltung</label>
                  <select
                    value={selectedEventFilter || ''}
                    onChange={(e) => setSelectedEventFilter(e.target.value ? parseInt(e.target.value) : null)}
                    className="px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                  >
                    <option value="">Alle</option>
                    {events.filter(e => !e.is_archived).map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Reservations table */}
            <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#faf9f7]">
                  <tr>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Name</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Veranstaltung</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Tickets</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Status</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Datum</th>
                    <th className="text-right p-4 font-medium text-[#2d2d2d]">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(107,142,111,0.1)]">
                  {reservations.filter(r => r.status === reservationFilter).map(r => (
                    <tr key={r.id} className="hover:bg-[#faf9f7]">
                      <td className="p-4">
                        <div className="font-medium text-[#2d2d2d]">{r.name}</div>
                        <div className="text-sm text-[#666666]">{r.email}</div>
                      </td>
                      <td className="p-4 text-[#666666]">
                        <div>{r.eventTitle}</div>
                        <div className="text-sm">{r.eventDate}</div>
                      </td>
                      <td className="p-4 text-[#2d2d2d] font-medium">{r.tickets}</td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          r.status === 'archived' ? 'bg-[#e8e4df] text-[#666666]' : 'bg-green-100 text-green-800'
                        }`}>
                          {r.status === 'archived' ? 'Archiviert' : 'Aktiv'}
                        </span>
                      </td>
                      <td className="p-4 text-[#666666] text-sm">{formatDate(r.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setViewingReservation(r)} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Details"><Eye className="w-4 h-4" /></button>
                          <a href={`mailto:${r.email}?subject=Ihre Reservierung - ${r.eventTitle}`} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Antworten"><Mail className="w-4 h-4" /></a>
                          {r.status === 'archived' ? (
                            <button onClick={() => handleReservationRestore(r.id)} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Wiederherstellen"><RotateCcw className="w-4 h-4" /></button>
                          ) : (
                            <button onClick={() => handleReservationArchive(r.id)} className="p-2 text-[#666666] hover:bg-[#666666]/10 rounded-lg" title="Archivieren"><Archive className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => handleDeleteReservation(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Löschen"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reservations.filter(r => r.status === reservationFilter).length === 0 && (
                <div className="p-8 text-center text-[#666666]">{reservationFilter === 'archived' ? 'Keine archivierten Reservierungen.' : 'Keine aktiven Reservierungen.'}</div>
              )}
            </div>
          </>
        )}

        {(activeView === 'events' || activeView === 'archive') && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">{showArchived ? 'Archiv' : 'Veranstaltungen'}</h2>
              <button onClick={() => { setIsCreating(true); setImagePreview(null); setSelectedImageFile(null); }} className="flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors">
                <Plus className="w-5 h-5" /> Neue Veranstaltung
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#faf9f7]">
                  <tr>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Veranstaltung</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Künstler</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Datum</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Status</th>
                    <th className="text-right p-4 font-medium text-[#2d2d2d]">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(107,142,111,0.1)]">
                  {events.map(event => (
                    <tr key={event.id} className="hover:bg-[#faf9f7]">
                      <td className="p-4">
                        <div className="font-medium text-[#2d2d2d]">{event.title}</div>
                        <div className="text-sm text-[#666666]">{event.genre}</div>
                      </td>
                      <td className="p-4 text-[#666666]">{event.artist}</td>
                      <td className="p-4 text-[#666666]">{event.date}</td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          event.availability === 'available' ? 'bg-green-100 text-green-800' :
                          event.availability === 'few-left' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.availability === 'available' ? 'Verfügbar' : event.availability === 'few-left' ? 'Wenige' : 'Ausverkauft'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingEvent(event); setImagePreview(event.image); setSelectedImageFile(null); }} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Bearbeiten"><Edit2 className="w-4 h-4" /></button>
                          {event.is_archived && (
                            <button onClick={() => openPhotoManager(event)} className="p-2 text-[#d4a574] hover:bg-[#d4a574]/10 rounded-lg" title="Fotos verwalten">
                              <Camera className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleToggleArchive(event.id)} className="p-2 text-[#666666] hover:bg-[#666666]/10 rounded-lg" title={event.is_archived ? 'Wiederherstellen' : 'Archivieren'}>
                            {event.is_archived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDelete(event.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Löschen"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {events.length === 0 && <div className="p-8 text-center text-[#666666]">Keine Veranstaltungen vorhanden.</div>}
            </div>

            {/* Photo Management Panel */}
            {managingPhotosEvent && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d]">Fotos verwalten</h3>
                      <p className="text-sm text-[#666666] mt-1">{managingPhotosEvent.title} – {managingPhotosEvent.artist}</p>
                    </div>
                    <button onClick={() => setManagingPhotosEvent(null)} className="p-2 text-[#666666] hover:text-[#2d2d2d]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Photo Grid */}
                  {eventPhotos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                      {eventPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded-lg border border-[rgba(107,142,111,0.2)]" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Foto entfernen"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {eventPhotos.length === 0 && (
                    <div className="text-center py-8 bg-[#faf9f7] rounded-lg border border-dashed border-[rgba(107,142,111,0.3)] mb-6">
                      <Camera className="w-8 h-8 text-[#666666] mx-auto mb-2" />
                      <p className="text-[#666666] text-sm">Noch keine Fotos hochgeladen</p>
                    </div>
                  )}

                  {/* Upload */}
                  {eventPhotos.length < 5 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-2">Fotos hinzufügen ({eventPhotos.length}/5)</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAddPhotos}
                        className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                      />
                      <p className="text-xs text-[#666666] mt-1">Max. 2 MB pro Bild. Bis zu {5 - eventPhotos.length} weitere möglich.</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setManagingPhotosEvent(null)} className="px-4 py-2 text-[#666666] hover:text-[#2d2d2d] rounded-lg">Abbrechen</button>
                    <button
                      onClick={handleSavePhotos}
                      disabled={savingPhotos}
                      className="flex items-center gap-2 bg-[#6b8e6f] text-white px-6 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {savingPhotos ? 'Speichern...' : 'Fotos speichern'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Contacts View */}
        {activeView === 'contacts' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">Nachrichten</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setContactFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      contactFilter === 'active'
                        ? 'bg-[#6b8e6f] text-white'
                        : 'bg-[#e8e4df] text-[#666666] hover:bg-[#d8d4cf]'
                    }`}
                  >
                    Aktiv
                  </button>
                  <button
                    onClick={() => setContactFilter('archived')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      contactFilter === 'archived'
                        ? 'bg-[#6b8e6f] text-white'
                        : 'bg-[#e8e4df] text-[#666666] hover:bg-[#d8d4cf]'
                    }`}
                  >
                    Archiv {contacts.filter(c => c.status === 'archived').length > 0 && <span>({contacts.filter(c => c.status === 'archived').length})</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Detail Modal */}
            {viewingContact && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-[rgba(107,142,111,0.1)] flex justify-between items-center">
                    <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d]">Nachricht von {viewingContact.name}</h3>
                    <button onClick={() => setViewingContact(null)} className="text-[#666666] hover:text-[#2d2d2d]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="text-sm text-[#666666]">Betreff</div>
                      <div className="font-medium text-[#2d2d2d]">{viewingContact.subject}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666666]">Typ</div>
                      <div className="text-[#2d2d2d]">{viewingContact.formType === 'general' ? 'Allgemein' : viewingContact.formType === 'artist' ? 'Künstler' : 'Förderer'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666666]">Kontakt</div>
                      <div className="text-[#2d2d2d]">{viewingContact.email}</div>
                      {viewingContact.phone && <div className="text-[#2d2d2d]">{viewingContact.phone}</div>}
                    </div>
                    <div>
                      <div className="text-sm text-[#666666]">Nachricht</div>
                      <div className="text-[#2d2d2d] whitespace-pre-wrap bg-[#faf9f7] p-4 rounded-lg">{viewingContact.message}</div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666666]">Newsletter</div>
                      <div className="text-[#2d2d2d]">
                        {viewingContact.newsletterOptIn ? (
                          <span className="inline-flex items-center gap-1 text-green-700">Ja, angemeldet</span>
                        ) : (
                          <span className="text-[#999999]">Nein</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-[#666666]">Erhalten am</div>
                      <div className="text-[#2d2d2d]">{formatDate(viewingContact.createdAt)}</div>
                    </div>
                    <div className="flex gap-2 flex-wrap pt-4 border-t border-[rgba(107,142,111,0.1)]">
                      <a href={`mailto:${viewingContact.email}?subject=Re: ${viewingContact.subject}`} className="flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-lg hover:bg-[#5a7a5e]">
                        <Mail className="w-4 h-4" /> Antworten
                      </a>
                      {viewingContact.status === 'archived' ? (
                        <button onClick={() => { handleContactRestore(viewingContact.id); setViewingContact(null); }} className="flex items-center gap-2 bg-[#e8e4df] text-[#2d2d2d] px-4 py-2 rounded-lg hover:bg-[#d8d4cf]">
                          <RotateCcw className="w-4 h-4" /> Wiederherstellen
                        </button>
                      ) : (
                        <button onClick={() => { handleContactArchive(viewingContact.id); setViewingContact(null); }} className="flex items-center gap-2 bg-[#e8e4df] text-[#2d2d2d] px-4 py-2 rounded-lg hover:bg-[#d8d4cf]">
                          <Archive className="w-4 h-4" /> Archivieren
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contacts table */}
            <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#faf9f7]">
                  <tr>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Datum</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Name</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Betreff</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Typ</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Newsletter</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Status</th>
                    <th className="text-right p-4 font-medium text-[#2d2d2d]">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(107,142,111,0.1)]">
                  {contacts.filter(c => c.status === contactFilter).map(c => (
                    <tr key={c.id} className="hover:bg-[#faf9f7]">
                      <td className="p-4 text-[#666666] text-sm">{formatDate(c.createdAt)}</td>
                      <td className="p-4">
                        <div className="font-medium text-[#2d2d2d]">{c.name}</div>
                        <div className="text-sm text-[#666666]">{c.email}</div>
                      </td>
                      <td className="p-4 text-[#2d2d2d]">{c.subject}</td>
                      <td className="p-4 text-[#666666]">{c.formType === 'general' ? 'Allgemein' : c.formType === 'artist' ? 'Künstler' : 'Förderer'}</td>
                      <td className="p-4">
                        {c.newsletterOptIn ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Ja</span>
                        ) : (
                          <span className="text-[#999999] text-sm">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          c.status === 'archived' ? 'bg-[#e8e4df] text-[#666666]' : 'bg-green-100 text-green-800'
                        }`}>
                          {c.status === 'archived' ? 'Archiviert' : 'Aktiv'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setViewingContact(c)} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Anzeigen"><Eye className="w-4 h-4" /></button>
                          <a href={`mailto:${c.email}?subject=Re: ${c.subject}`} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Antworten"><Mail className="w-4 h-4" /></a>
                          {c.status === 'archived' ? (
                            <button onClick={() => handleContactRestore(c.id)} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Wiederherstellen"><RotateCcw className="w-4 h-4" /></button>
                          ) : (
                            <button onClick={() => handleContactArchive(c.id)} className="p-2 text-[#666666] hover:bg-[#666666]/10 rounded-lg" title="Archivieren"><Archive className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => handleDeleteContact(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Löschen"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.filter(c => c.status === contactFilter).length === 0 && (
                <div className="p-8 text-center text-[#666666]">{contactFilter === 'archived' ? 'Keine archivierten Nachrichten.' : 'Keine aktiven Nachrichten.'}</div>
              )}
            </div>
          </>
        )}

        {/* Vouchers View */}
        {activeView === 'vouchers' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">Gutschein-Bestellungen</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVoucherFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      voucherFilter === 'active'
                        ? 'bg-[#6b8e6f] text-white'
                        : 'bg-[#e8e4df] text-[#666666] hover:bg-[#d8d4cf]'
                    }`}
                  >
                    Aktiv
                  </button>
                  <button
                    onClick={() => setVoucherFilter('archived')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      voucherFilter === 'archived'
                        ? 'bg-[#6b8e6f] text-white'
                        : 'bg-[#e8e4df] text-[#666666] hover:bg-[#d8d4cf]'
                    }`}
                  >
                    Archiv {vouchers.filter(v => v.status === 'archived').length > 0 && <span>({vouchers.filter(v => v.status === 'archived').length})</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* Vouchers table */}
            <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#faf9f7]">
                  <tr>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Datum</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Käufer</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Typ</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Wert</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Zustellung</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Status</th>
                    <th className="text-right p-4 font-medium text-[#2d2d2d]">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(107,142,111,0.1)]">
                  {vouchers.filter(v => v.status === voucherFilter).map(v => (
                    <tr key={v.id} className="hover:bg-[#faf9f7]">
                      <td className="p-4 text-[#666666] text-sm">{formatDate(v.createdAt)}</td>
                      <td className="p-4">
                        <div className="font-medium text-[#2d2d2d]">{v.buyerName}</div>
                        <div className="text-sm text-[#666666]">{v.buyerEmail}</div>
                      </td>
                      <td className="p-4 text-[#666666]">{v.voucherType === 'amount' ? 'Wertgutschein' : 'Veranstaltung'}</td>
                      <td className="p-4 text-[#2d2d2d] font-medium">{v.voucherType === 'amount' ? `${v.amount} €` : v.eventName}</td>
                      <td className="p-4 text-[#666666]">{v.delivery === 'email' ? 'E-Mail' : v.delivery === 'post' ? 'Post' : 'Abholung'}</td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          v.status === 'archived' ? 'bg-[#e8e4df] text-[#666666]' : 'bg-green-100 text-green-800'
                        }`}>
                          {v.status === 'archived' ? 'Archiviert' : 'Aktiv'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <a href={`mailto:${v.buyerEmail}?subject=Ihre Gutschein-Bestellung`} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Antworten"><Mail className="w-4 h-4" /></a>
                          {v.status === 'archived' ? (
                            <button onClick={() => handleVoucherRestore(v.id)} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Wiederherstellen"><RotateCcw className="w-4 h-4" /></button>
                          ) : (
                            <button onClick={() => handleVoucherArchive(v.id)} className="p-2 text-[#666666] hover:bg-[#666666]/10 rounded-lg" title="Archivieren"><Archive className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => handleDeleteVoucher(v.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Löschen"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vouchers.filter(v => v.status === voucherFilter).length === 0 && (
                <div className="p-8 text-center text-[#666666]">{voucherFilter === 'archived' ? 'Keine archivierten Gutschein-Bestellungen.' : 'Keine aktiven Gutschein-Bestellungen.'}</div>
              )}
            </div>
          </>
        )}

        {/* Memberships View */}
        {activeView === 'memberships' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">Mitgliedsanträge</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMembershipFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      membershipFilter === 'active'
                        ? 'bg-[#6b8e6f] text-white'
                        : 'bg-[#e8e4df] text-[#666666] hover:bg-[#d8d4cf]'
                    }`}
                  >
                    Aktiv
                  </button>
                  <button
                    onClick={() => setMembershipFilter('archived')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      membershipFilter === 'archived'
                        ? 'bg-[#6b8e6f] text-white'
                        : 'bg-[#e8e4df] text-[#666666] hover:bg-[#d8d4cf]'
                    }`}
                  >
                    Archiv {memberships.filter(m => m.status === 'archived').length > 0 && <span>({memberships.filter(m => m.status === 'archived').length})</span>}
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  const filtered = memberships.filter(m => m.status === membershipFilter);
                  const headers = ['Datum', 'Name', 'E-Mail', 'Telefon', 'Geburtsdatum', 'Adresse', 'PLZ', 'Ort', 'Mitgliedschaft', 'Mitglied seit', 'IBAN', 'Status', 'Nachricht'];
                  const csvRows = [headers.join(';')];
                  filtered.forEach(m => {
                    const typeLabel = m.membershipType === 'foerdermitglied' ? 'Fördermitglied' : m.membershipType === 'mitglied' ? 'Mitgliedschaft' : m.membershipType;
                    const row = [
                      m.createdAt ? new Date(m.createdAt).toLocaleDateString('de-DE') : '',
                      m.name, m.email, m.phone || '', m.birthdate || '',
                      m.address, m.postalCode, m.city,
                      typeLabel, m.memberSince || '', m.iban || '',
                      m.status === 'archived' ? 'Archiviert' : 'Aktiv',
                      (m.message || '').replace(/[\n\r;]/g, ' ')
                    ].map(v => `"${v}"`);
                    csvRows.push(row.join(';'));
                  });
                  const bom = '\uFEFF';
                  const blob = new Blob([bom + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `mitglieder-${membershipFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#e8e4df] text-[#666666] hover:bg-[#d8d4cf] transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>

            {/* Memberships table */}
            <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#faf9f7]">
                  <tr>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Datum</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Name</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Adresse</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Mitgliedschaft</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Geburtsdatum</th>
                    <th className="text-left p-4 font-medium text-[#2d2d2d]">Status</th>
                    <th className="text-right p-4 font-medium text-[#2d2d2d]">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(107,142,111,0.1)]">
                  {memberships.filter(m => m.status === membershipFilter).map(m => (
                    <tr key={m.id} className="hover:bg-[#faf9f7]">
                      <td className="p-4 text-[#666666] text-sm">{formatDate(m.createdAt)}</td>
                      <td className="p-4">
                        <div className="font-medium text-[#2d2d2d]">{m.name}</div>
                        <div className="text-sm text-[#666666]">{m.email}</div>
                      </td>
                      <td className="p-4 text-[#666666] text-sm">
                        {m.address}<br />{m.postalCode} {m.city}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[#2d2d2d]">{m.membershipType === 'foerdermitglied' ? 'Fördermitglied' : m.membershipType === 'mitglied' ? 'Mitgliedschaft' : m.membershipType}</div>
                        {m.memberSince && <div className="text-sm text-[#666666]">seit {m.memberSince}</div>}
                        {(m.ibanLast4 || m.iban) && <div className="text-sm text-[#666666]">IBAN: ****{m.ibanLast4 || m.iban.replace(/\s/g, '').slice(-4)}</div>}
                      </td>
                      <td className="p-4 text-[#666666] text-sm">{m.birthdate}</td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          m.status === 'archived' ? 'bg-[#e8e4df] text-[#666666]' : 'bg-green-100 text-green-800'
                        }`}>
                          {m.status === 'archived' ? 'Archiviert' : 'Aktiv'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <a href={`mailto:${m.email}?subject=Ihr Mitgliedsantrag`} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Antworten"><Mail className="w-4 h-4" /></a>
                          {m.status === 'archived' ? (
                            <button onClick={() => handleMembershipRestore(m.id)} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Wiederherstellen"><RotateCcw className="w-4 h-4" /></button>
                          ) : (
                            <button onClick={() => handleMembershipArchive(m.id)} className="p-2 text-[#666666] hover:bg-[#666666]/10 rounded-lg" title="Archivieren"><Archive className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => handleDeleteMembership(m.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Löschen"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {memberships.filter(m => m.status === membershipFilter).length === 0 && (
                <div className="p-8 text-center text-[#666666]">{membershipFilter === 'archived' ? 'Keine archivierten Mitgliedsanträge.' : 'Keine aktiven Mitgliedsanträge.'}</div>
              )}
            </div>
          </>
        )}

        {/* Settings View */}
        {activeView === 'settings' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">Einstellungen</h2>
              {!editingSettings && (
                <button onClick={() => setEditingSettings(true)} className="flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors">
                  <Edit2 className="w-5 h-5" /> Bearbeiten
                </button>
              )}
            </div>

            {siteSettings && (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Logo */}
                <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
                  <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-4">Logo</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Haupttext</label>
                      <input type="text" name="logo_mainText" defaultValue={siteSettings.logo.mainText} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Untertitel</label>
                      <input type="text" name="logo_subtitle" defaultValue={siteSettings.logo.subtitle} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                  </div>
                </div>

                {/* Site Images */}
                <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
                  <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-4">Bilder</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-2">Logo</label>
                      <div className="w-full h-24 bg-[#faf9f7] rounded-lg overflow-hidden border border-[rgba(107,142,111,0.2)] flex items-center justify-center mb-2">
                        <img
                          src={logoPreview || siteSettings.images?.logo || '/logo.png'}
                          alt="Logo Vorschau"
                          className="max-h-full max-w-full object-contain p-2"
                        />
                      </div>
                      {editingSettings && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                setMessage({ text: 'Bild zu groß. Maximum: 2MB', type: 'error' });
                                return;
                              }
                              setLogoFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => setLogoPreview(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-sm text-[#666666]"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-2">Hero-Bild (Startseite)</label>
                      <div className="w-full h-24 bg-[#faf9f7] rounded-lg overflow-hidden border border-[rgba(107,142,111,0.2)] mb-2">
                        <img
                          src={heroPreview || siteSettings.images?.hero || '/hero-band.jpg'}
                          alt="Hero Vorschau"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {editingSettings && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                setMessage({ text: 'Bild zu groß. Maximum: 2MB', type: 'error' });
                                return;
                              }
                              setHeroFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => setHeroPreview(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-sm text-[#666666]"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
                  <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-4">Adresse</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Straße</label>
                      <input type="text" name="address_street" defaultValue={siteSettings.address.street} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">PLZ</label>
                      <input type="text" name="address_postalCode" defaultValue={siteSettings.address.postalCode} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Stadt</label>
                      <input type="text" name="address_city" defaultValue={siteSettings.address.city} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
                  <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-4">Kontakt</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Telefon</label>
                      <input type="text" name="contact_phone" defaultValue={siteSettings.contact.phone} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">E-Mail (Allgemein)</label>
                      <input type="email" name="contact_emailGeneral" defaultValue={siteSettings.contact.emailGeneral} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">E-Mail (Tickets)</label>
                      <input type="email" name="contact_emailTickets" defaultValue={siteSettings.contact.emailTickets} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">E-Mail (Künstler)</label>
                      <input type="email" name="contact_emailArtists" defaultValue={siteSettings.contact.emailArtists} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">E-Mail (Förderer)</label>
                      <input type="email" name="contact_emailSponsors" defaultValue={siteSettings.contact.emailSponsors} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
                  <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-4">Social Media</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Instagram</label>
                      <input type="url" name="social_instagram" defaultValue={siteSettings.social.instagram} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Facebook</label>
                      <input type="url" name="social_facebook" defaultValue={siteSettings.social.facebook} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                  </div>
                </div>

                {/* Organization */}
                <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
                  <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-4">Organisation</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Name</label>
                      <input type="text" name="org_name" defaultValue={siteSettings.organization.name} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Registernummer</label>
                      <input type="text" name="org_registrationNumber" defaultValue={siteSettings.organization.registrationNumber} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Amtsgericht</label>
                      <input type="text" name="org_court" defaultValue={siteSettings.organization.court} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Steuernummer</label>
                      <input type="text" name="org_taxNumber" defaultValue={siteSettings.organization.taxNumber} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Beschreibung</label>
                      <textarea name="org_description" defaultValue={siteSettings.organization.description} disabled={!editingSettings} rows={3} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
                  <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-4">Öffnungszeiten</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Tage</label>
                      <input type="text" name="hours_days" defaultValue={siteSettings.officeHours.days} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Uhrzeiten</label>
                      <input type="text" name="hours_hours" defaultValue={siteSettings.officeHours.hours} disabled={!editingSettings} className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] disabled:bg-[#faf9f7]" />
                    </div>
                  </div>
                </div>

                {editingSettings && (
                  <div className="flex gap-4">
                    <button type="submit" className="bg-[#6b8e6f] text-white px-6 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors">Speichern</button>
                    <button type="button" onClick={() => setEditingSettings(false)} className="bg-[#e8e4df] text-[#2d2d2d] px-6 py-2 rounded-lg hover:bg-[#d8d4cf] transition-colors">Abbrechen</button>
                  </div>
                )}
              </form>
            )}

            {!siteSettings && (
              <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)] text-center text-[#666666]">
                Einstellungen werden geladen...
              </div>
            )}
          </>
        )}

        {/* Gallery View */}
        {activeView === 'gallery' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">Galerie verwalten</h2>
            </div>
            <p className="text-[#666666] mb-6">Verwalten Sie die Bilder der Instagram-Galerie auf der Startseite. Klicken Sie auf ein Bild, um es zu ändern.</p>

            {editingGallerySlot !== null ? (
              <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)] mb-6">
                <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-4">
                  Bild bearbeiten: {galleryImages.find(g => g.position === editingGallerySlot)?.label}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#2d2d2d] mb-2">Aktuelles Bild</label>
                    <div className="w-full h-48 bg-[#faf9f7] rounded-lg overflow-hidden border border-[rgba(107,142,111,0.2)]">
                      <img
                        src={galleryImagePreview || galleryImages.find(g => g.position === editingGallerySlot)?.image}
                        alt="Vorschau"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Neues Bild hochladen (max. 2MB)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGalleryImageChange}
                        className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Alt-Text</label>
                      <input
                        type="text"
                        value={galleryAlt}
                        onChange={(e) => setGalleryAlt(e.target.value)}
                        className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                        placeholder="Bildbeschreibung"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveGallerySlot}
                        disabled={savingGallery}
                        className="bg-[#6b8e6f] text-white px-6 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 inline mr-2" />
                        {savingGallery ? 'Speichern...' : 'Speichern'}
                      </button>
                      <button
                        onClick={() => { setEditingGallerySlot(null); setGalleryImagePreview(null); setGalleryImageFile(null); setGalleryAlt(''); }}
                        className="bg-[#e8e4df] text-[#2d2d2d] px-6 py-2 rounded-lg hover:bg-[#d8d4cf] transition-colors"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages
                .sort((a, b) => a.position - b.position)
                .map((img) => (
                <div
                  key={img.id}
                  onClick={() => { setEditingGallerySlot(img.position); setGalleryAlt(img.alt); setGalleryImagePreview(null); setGalleryImageFile(null); }}
                  className="cursor-pointer group relative bg-white rounded-xl overflow-hidden border border-[rgba(107,142,111,0.2)] hover:border-[#6b8e6f] transition-all hover:shadow-lg"
                >
                  <div className={`overflow-hidden ${img.position === 0 ? 'aspect-square' : img.position === 1 || img.position === 4 ? 'aspect-[1/2]' : 'aspect-square'}`}>
                    <img src={img.image} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-[#2d2d2d]">{img.label}</p>
                    <p className="text-xs text-[#666666] truncate">{img.alt}</p>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Edit2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Sponsors View */}
        {activeView === 'sponsors' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">Sponsoren verwalten</h2>
              <button
                onClick={() => { setIsCreatingSponsor(true); setEditingSponsor({ id: 0, name: '', logo: null, url: null, category: 'foerderer', position: 0 }); }}
                className="flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Sponsor hinzufügen
              </button>
            </div>

            {/* Sponsor Edit Form */}
            {(editingSponsor || isCreatingSponsor) && (
              <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)] mb-6">
                <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-4">
                  {isCreatingSponsor ? 'Neuer Sponsor' : 'Sponsor bearbeiten'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Name *</label>
                    <input
                      type="text"
                      value={editingSponsor?.name || ''}
                      onChange={(e) => setEditingSponsor(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                      placeholder="Name des Sponsors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Kategorie *</label>
                    <select
                      value={editingSponsor?.category || 'foerderer'}
                      onChange={(e) => setEditingSponsor(prev => prev ? { ...prev, category: e.target.value as Sponsor['category'] } : null)}
                      className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                    >
                      <option value="hauptfoerderer">Hauptförderer</option>
                      <option value="foerderer">Förderer</option>
                      <option value="kooperationspartner">Kooperationspartner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Website URL</label>
                    <input
                      type="url"
                      value={editingSponsor?.url || ''}
                      onChange={(e) => setEditingSponsor(prev => prev ? { ...prev, url: e.target.value || null } : null)}
                      className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={editingSponsor?.logo || ''}
                      onChange={(e) => setEditingSponsor(prev => prev ? { ...prev, logo: e.target.value || null } : null)}
                      className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                      placeholder="https://... oder leer lassen"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => editingSponsor && handleSaveSponsor(editingSponsor)}
                    disabled={!editingSponsor?.name}
                    className="bg-[#6b8e6f] text-white px-6 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Speichern
                  </button>
                  <button
                    onClick={() => { setEditingSponsor(null); setIsCreatingSponsor(false); }}
                    className="bg-[#e8e4df] text-[#2d2d2d] px-6 py-2 rounded-lg hover:bg-[#d8d4cf] transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {/* Sponsor List by Category */}
            {(['hauptfoerderer', 'foerderer', 'kooperationspartner'] as const).map(cat => {
              const categoryNames = { hauptfoerderer: 'Hauptförderer', foerderer: 'Förderer', kooperationspartner: 'Kooperationspartner' };
              const catSponsors = sponsors.filter(s => s.category === cat).sort((a, b) => a.position - b.position);
              if (catSponsors.length === 0) return null;
              return (
                <div key={cat} className="mb-8">
                  <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-4">{categoryNames[cat]}</h3>
                  <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#faf9f7] border-b border-[rgba(107,142,111,0.1)]">
                          <th className="text-left px-4 py-3 text-sm font-medium text-[#666666]">Name</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-[#666666]">Website</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-[#666666]">Logo</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-[#666666]">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(107,142,111,0.1)]">
                        {catSponsors.map(sponsor => (
                          <tr key={sponsor.id} className="hover:bg-[#faf9f7] transition-colors">
                            <td className="px-4 py-3 text-[#2d2d2d]">{sponsor.name}</td>
                            <td className="px-4 py-3 text-[#666666] text-sm">
                              {sponsor.url ? (
                                <a href={sponsor.url} target="_blank" rel="noopener noreferrer" className="text-[#6b8e6f] hover:underline flex items-center gap-1">
                                  Link <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-[#666666] text-sm">
                              {sponsor.logo ? (
                                <img src={sponsor.logo} alt={sponsor.name} className="h-8 max-w-[120px] object-contain" />
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => { setEditingSponsor(sponsor); setIsCreatingSponsor(false); }}
                                className="text-[#6b8e6f] hover:text-[#5a7a5e] p-1"
                                title="Bearbeiten"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSponsor(sponsor.id)}
                                className="text-[#8b4454] hover:text-[#7a3343] p-1 ml-2"
                                title="Löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {sponsors.length === 0 && (
              <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] p-12 text-center">
                <Handshake className="w-16 h-16 text-[#e8e4df] mx-auto mb-4" />
                <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-2">Keine Sponsoren</h3>
                <p className="text-[#666666]">Fügen Sie den ersten Sponsor hinzu.</p>
              </div>
            )}
          </>
        )}

        {/* Newsletter View */}
        {activeView === 'newsletter' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">Newsletter-Abonnenten</h2>
              {newsletterSubscribers.length > 0 && (
                <button
                  onClick={() => {
                    const active = newsletterSubscribers.filter(s => s.status === 'active');
                    const csv = ['Name,E-Mail,Quelle,Angemeldet am', ...active.map(s => `"${s.name}","${s.email}","${s.source}","${new Date(s.subscribedAt).toLocaleDateString('de-DE')}"`  )].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `newsletter-abonnenten-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors"
                >
                  <Download className="w-5 h-5" />
                  CSV exportieren
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-[rgba(107,142,111,0.2)]">
                <p className="text-sm text-[#666666]">Aktive Abonnenten</p>
                <p className="text-2xl font-bold text-[#6b8e6f]">{newsletterSubscribers.filter(s => s.status === 'active').length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[rgba(107,142,111,0.2)]">
                <p className="text-sm text-[#666666]">Abgemeldet</p>
                <p className="text-2xl font-bold text-[#8b4454]">{newsletterSubscribers.filter(s => s.status === 'unsubscribed').length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[rgba(107,142,111,0.2)]">
                <p className="text-sm text-[#666666]">Gesamt</p>
                <p className="text-2xl font-bold text-[#2d2d2d]">{newsletterSubscribers.length}</p>
              </div>
            </div>

            {/* Subscriber Table */}
            {newsletterSubscribers.length > 0 ? (
              <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#faf9f7] border-b border-[rgba(107,142,111,0.1)]">
                      <th className="text-left px-4 py-3 text-sm font-medium text-[#666666]">Name</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-[#666666]">E-Mail</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-[#666666]">Quelle</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-[#666666]">Datum</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-[#666666]">Status</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-[#666666]">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(107,142,111,0.1)]">
                    {newsletterSubscribers.map(sub => (
                      <tr key={sub.id} className="hover:bg-[#faf9f7] transition-colors">
                        <td className="px-4 py-3 text-[#2d2d2d]">{sub.name || '—'}</td>
                        <td className="px-4 py-3 text-[#666666] text-sm">{sub.email}</td>
                        <td className="px-4 py-3 text-[#666666] text-sm">
                          {{
                            'contact-form': 'Kontaktformular',
                            'contact-general': 'Kontakt (Allgemein)',
                            'contact-artist': 'Kontakt (Künstler)',
                            'contact-sponsor': 'Kontakt (Förderer)',
                            'ticket-reservation': 'Ticketreservierung',
                            'membership': 'Mitgliedschaft',
                            'voucher': 'Gutschein',
                            'website': 'Website'
                          }[sub.source] || sub.source}
                        </td>
                        <td className="px-4 py-3 text-[#666666] text-sm">
                          {new Date(sub.subscribedAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                            sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {sub.status === 'active' ? 'Aktiv' : 'Abgemeldet'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggleSubscription(sub)}
                            className={`text-sm px-2 py-1 rounded ${
                              sub.status === 'active' ? 'text-[#8b4454] hover:bg-red-50' : 'text-[#6b8e6f] hover:bg-green-50'
                            }`}
                            title={sub.status === 'active' ? 'Deaktivieren' : 'Reaktivieren'}
                          >
                            {sub.status === 'active' ? 'Abmelden' : 'Aktivieren'}
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id)}
                            className="text-[#8b4454] hover:text-[#7a3343] p-1 ml-2"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] p-12 text-center">
                <Newspaper className="w-16 h-16 text-[#e8e4df] mx-auto mb-4" />
                <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-2">Keine Abonnenten</h3>
                <p className="text-[#666666]">Newsletter-Anmeldungen erscheinen hier, sobald Besucher sich anmelden.</p>
              </div>
            )}
          </>
        )}

        {/* CMS View */}
        {activeView === 'cms' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">
                {selectedPage ? `Seite: ${selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)}` : 'Seiten bearbeiten'}
              </h2>
              {selectedPage && editingPageContent && (
                <button
                  onClick={handleSavePageContent}
                  disabled={savingPage}
                  className="flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {savingPage ? 'Speichern...' : 'Speichern'}
                </button>
              )}
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Page List Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] overflow-hidden">
                  <div className="p-4 bg-[#faf9f7] border-b border-[rgba(107,142,111,0.1)]">
                    <h3 className="font-medium text-[#2d2d2d]">Seiten</h3>
                  </div>
                  <div className="divide-y divide-[rgba(107,142,111,0.1)]">
                    {cmsPages.map(page => (
                      <button
                        key={page}
                        onClick={() => { loadPageContent(page); setEditingPageContent(false); }}
                        className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-[#faf9f7] transition-colors ${selectedPage === page ? 'bg-[#6b8e6f]/10 text-[#6b8e6f]' : 'text-[#2d2d2d]'}`}
                      >
                        <span className="capitalize">{page}</span>
                        <ChevronRight className="w-4 h-4 text-[#999999]" />
                      </button>
                    ))}
                    {cmsPages.length === 0 && (
                      <div className="p-4 text-center text-[#666666] text-sm">Keine Seiten gefunden</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Page Content Editor */}
              <div className="lg:col-span-3">
                {selectedPage && pageContent ? (
                  <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] overflow-hidden">
                    <div className="p-4 bg-[#faf9f7] border-b border-[rgba(107,142,111,0.1)] flex justify-between items-center">
                      <h3 className="font-medium text-[#2d2d2d]">Inhalt bearbeiten</h3>
                      {!editingPageContent ? (
                        <button
                          onClick={() => setEditingPageContent(true)}
                          className="flex items-center gap-2 text-[#6b8e6f] hover:text-[#5a7a5e] text-sm"
                        >
                          <Edit2 className="w-4 h-4" /> Bearbeiten
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingPageContent(false)}
                          className="text-[#666666] hover:text-[#2d2d2d] text-sm"
                        >
                          Abbrechen
                        </button>
                      )}
                    </div>
                    <div className="p-6">
                      {editingPageContent ? (
                        <div className="space-y-6">
                          {Object.entries(pageContent).map(([sectionKey, sectionValue]) => (
                            <div key={sectionKey} className="border border-[rgba(107,142,111,0.2)] rounded-lg p-4">
                              <h4 className="font-medium text-[#2d2d2d] mb-4 capitalize">{sectionKey.replace(/([A-Z])/g, ' $1').trim()}</h4>
                              {renderEditableSection(sectionKey, sectionValue, (newValue) => {
                                setPageContent({ ...pageContent, [sectionKey]: newValue });
                              })}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {Object.entries(pageContent).map(([sectionKey, sectionValue]) => (
                            <div key={sectionKey} className="border-b border-[rgba(107,142,111,0.1)] pb-4 last:border-0">
                              <h4 className="font-medium text-[#6b8e6f] mb-2 capitalize">{sectionKey.replace(/([A-Z])/g, ' $1').trim()}</h4>
                              <pre className="text-sm text-[#666666] whitespace-pre-wrap bg-[#faf9f7] p-3 rounded-lg overflow-x-auto">
                                {JSON.stringify(sectionValue, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] p-12 text-center">
                    <FileText className="w-16 h-16 text-[#e8e4df] mx-auto mb-4" />
                    <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-2">Seite auswählen</h3>
                    <p className="text-[#666666]">Wählen Sie eine Seite aus der Liste, um den Inhalt zu bearbeiten.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );

  // Helper function to render editable sections
  function renderEditableSection(key: string, value: any, onChange: (newValue: any) => void): React.ReactNode {
    if (typeof value === 'string') {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] text-sm"
        />
      );
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
      return (
        <div className="space-y-3">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <label className="block text-sm text-[#666666] mb-1 capitalize">{subKey.replace(/([A-Z])/g, ' $1').trim()}</label>
              {typeof subValue === 'string' ? (
                <input
                  type="text"
                  value={subValue}
                  onChange={(e) => onChange({ ...value, [subKey]: e.target.value })}
                  className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] text-sm"
                />
              ) : (
                <textarea
                  value={JSON.stringify(subValue, null, 2)}
                  onChange={(e) => {
                    try {
                      onChange({ ...value, [subKey]: JSON.parse(e.target.value) });
                    } catch {}
                  }}
                  rows={4}
                  className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] text-sm font-mono"
                />
              )}
            </div>
          ))}
        </div>
      );
    }
    if (Array.isArray(value)) {
      return (
        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {}
          }}
          rows={Math.min(15, value.length * 4 + 2)}
          className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f] text-sm font-mono"
        />
      );
    }
    return <span className="text-[#666666]">{String(value)}</span>;
  }
}
