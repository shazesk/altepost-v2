import React from "react";
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Archive, RotateCcw, LogOut, LayoutDashboard, Calendar, ArchiveIcon, Ticket, Check, X, Clock, Eye, Mail, Phone, User } from 'lucide-react';

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
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
  createdAt: string;
}

interface Stats {
  upcoming: number;
  archived: number;
  total: number;
  reservations?: {
    pending: number;
    confirmed: number;
    total: number;
    totalTickets: number;
  };
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
  const [activeView, setActiveView] = useState<'dashboard' | 'events' | 'archive' | 'reservations'>('dashboard');
  const [reservationFilter, setReservationFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [selectedEventFilter, setSelectedEventFilter] = useState<number | null>(null);
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null);

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
    }
  }, [isAuthenticated, sessionId, showArchived]);

  async function checkAuth(session: string) {
    try {
      const res = await fetch(`${API_BASE}/check`, {
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
      const res = await fetch(`${API_BASE}/login`, {
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
      await fetch(`${API_BASE}/logout`, {
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
      const res = await fetch(`${API_BASE}/stats`, {
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
      if (reservationFilter !== 'all') params.append('status', reservationFilter);
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

  async function handleSaveEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const url = editingEvent
        ? `${API_BASE}/events/${editingEvent.id}`
        : `${API_BASE}/events`;

      const res = await fetch(url, {
        method: editingEvent ? 'PUT' : 'POST',
        headers: { 'x-session-id': sessionId! },
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: editingEvent ? 'Event aktualisiert' : 'Event erstellt', type: 'success' });
        setEditingEvent(null);
        setIsCreating(false);
        loadEvents();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Speichern fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Wirklich löschen?')) return;

    try {
      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId! }
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: 'Event gelöscht', type: 'success' });
        loadEvents();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Löschen fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleToggleArchive(id: number) {
    try {
      const res = await fetch(`${API_BASE}/events/${id}/toggle-archive`, {
        method: 'POST',
        headers: { 'x-session-id': sessionId! }
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

  async function handleReservationStatus(id: number, status: 'pending' | 'confirmed' | 'cancelled') {
    try {
      const res = await fetch(`${API_BASE}/reservations/${id}/status`, {
        method: 'POST',
        headers: { 'x-session-id': sessionId!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: `Status auf "${status === 'confirmed' ? 'Bestätigt' : status === 'cancelled' ? 'Storniert' : 'Ausstehend'}" geändert`, type: 'success' });
        loadReservations();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Statusänderung fehlgeschlagen', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler', type: 'error' });
    }
  }

  async function handleDeleteReservation(id: number) {
    if (!confirm('Reservierung wirklich löschen?')) return;

    try {
      const res = await fetch(`${API_BASE}/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId! }
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: 'Reservierung gelöscht', type: 'success' });
        loadReservations();
        loadStats();
      } else {
        setMessage({ text: data.error || 'Löschen fehlgeschlagen', type: 'error' });
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
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  r.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {r.status === 'confirmed' ? 'Bestätigt' : r.status === 'pending' ? 'Ausstehend' : 'Storniert'}
                </span>
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
              {r.status !== 'confirmed' && (
                <button
                  onClick={() => { handleReservationStatus(r.id, 'confirmed'); setViewingReservation(null); }}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <Check className="w-4 h-4" /> Bestätigen
                </button>
              )}
              {r.status !== 'cancelled' && (
                <button
                  onClick={() => { handleReservationStatus(r.id, 'cancelled'); setViewingReservation(null); }}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  <X className="w-4 h-4" /> Stornieren
                </button>
              )}
              <button
                onClick={() => { setEditingReservation(r); setViewingReservation(null); }}
                className="flex items-center gap-2 bg-[#e8e4df] text-[#2d2d2d] px-4 py-2 rounded-lg hover:bg-[#d8d4cf]"
              >
                <Edit2 className="w-4 h-4" /> Bearbeiten
              </button>
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
                    <option value="pending">Ausstehend</option>
                    <option value="confirmed">Bestätigt</option>
                    <option value="cancelled">Storniert</option>
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
              onClick={() => { setEditingEvent(null); setIsCreating(false); }}
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
              <div>
                <label className="block text-sm font-medium text-[#2d2d2d] mb-1">Bild</label>
                <input type="file" name="image" accept="image/*" className="w-full px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]" />
                {event?.image && <input type="hidden" name="existing_image" value={event.image} />}
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
              <button type="button" onClick={() => { setEditingEvent(null); setIsCreating(false); }} className="bg-[#e8e4df] text-[#2d2d2d] px-6 py-2 rounded-lg hover:bg-[#d8d4cf] transition-colors">Abbrechen</button>
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
            onClick={() => { setActiveView('dashboard'); setShowArchived(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'dashboard' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
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
            {stats?.reservations?.pending ? (
              <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.reservations.pending}</span>
            ) : null}
          </button>
          <button
            onClick={() => { setActiveView('archive'); setShowArchived(true); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeView === 'archive' ? 'bg-[#6b8e6f] text-white' : 'text-white/80 hover:bg-white/10'}`}
          >
            <ArchiveIcon className="w-5 h-5" />
            Archiv
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
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {message && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {activeView === 'dashboard' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">Dashboard</h2>
              <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors">
                <Plus className="w-5 h-5" /> Neue Veranstaltung
              </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
                <div className="font-['Playfair_Display',serif] text-4xl text-[#6b8e6f] mb-1">{stats?.upcoming || 0}</div>
                <div className="text-[#666666]">Kommende Events</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
                <div className="font-['Playfair_Display',serif] text-4xl text-[#6b8e6f] mb-1">{stats?.reservations?.totalTickets || 0}</div>
                <div className="text-[#666666]">Reservierte Tickets</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
                <div className="font-['Playfair_Display',serif] text-4xl text-yellow-600 mb-1">{stats?.reservations?.pending || 0}</div>
                <div className="text-[#666666]">Offene Reservierungen</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-[rgba(107,142,111,0.2)]">
                <div className="font-['Playfair_Display',serif] text-4xl text-green-600 mb-1">{stats?.reservations?.confirmed || 0}</div>
                <div className="text-[#666666]">Bestätigte Reservierungen</div>
              </div>
            </div>

            {/* Recent reservations */}
            <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)] mb-8">
              <div className="p-6 border-b border-[rgba(107,142,111,0.1)] flex justify-between items-center">
                <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d]">Neueste Reservierungen</h3>
                <button onClick={() => setActiveView('reservations')} className="text-[#6b8e6f] hover:underline text-sm">Alle anzeigen</button>
              </div>
              <div className="divide-y divide-[rgba(107,142,111,0.1)]">
                {reservations.slice(0, 5).map(r => (
                  <div key={r.id} className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-[#2d2d2d]">{r.name} - {r.tickets} Tickets</div>
                      <div className="text-sm text-[#666666]">{r.eventTitle}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${r.status === 'confirmed' ? 'bg-green-100 text-green-800' : r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {r.status === 'confirmed' ? 'Bestätigt' : r.status === 'pending' ? 'Offen' : 'Storniert'}
                      </span>
                      {r.status === 'pending' && (
                        <button onClick={() => handleReservationStatus(r.id, 'confirmed')} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>
                ))}
                {reservations.length === 0 && <div className="p-4 text-center text-[#666666]">Keine Reservierungen</div>}
              </div>
            </div>

            {/* Recent events preview */}
            <div className="bg-white rounded-xl border border-[rgba(107,142,111,0.2)]">
              <div className="p-6 border-b border-[rgba(107,142,111,0.1)]">
                <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d]">Kommende Veranstaltungen</h3>
              </div>
              <div className="divide-y divide-[rgba(107,142,111,0.1)]">
                {events.slice(0, 5).map(event => (
                  <div key={event.id} className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-[#2d2d2d]">{event.title}</div>
                      <div className="text-sm text-[#666666]">{event.artist} • {event.date}</div>
                    </div>
                    <button onClick={() => setEditingEvent(event)} className="text-[#6b8e6f] hover:text-[#5a7a5e]"><Edit2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeView === 'reservations' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">Reservierungen</h2>
              <button onClick={() => setIsCreatingReservation(true)} className="flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors">
                <Plus className="w-5 h-5" /> Neue Reservierung
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <label className="block text-sm text-[#666666] mb-1">Status</label>
                <select
                  value={reservationFilter}
                  onChange={(e) => setReservationFilter(e.target.value as typeof reservationFilter)}
                  className="px-4 py-2 border border-[rgba(107,142,111,0.3)] rounded-lg focus:outline-none focus:border-[#6b8e6f]"
                >
                  <option value="all">Alle</option>
                  <option value="pending">Ausstehend</option>
                  <option value="confirmed">Bestätigt</option>
                  <option value="cancelled">Storniert</option>
                </select>
              </div>
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
                  {reservations.map(r => (
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
                          r.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {r.status === 'confirmed' ? 'Bestätigt' : r.status === 'pending' ? 'Ausstehend' : 'Storniert'}
                        </span>
                      </td>
                      <td className="p-4 text-[#666666] text-sm">{formatDate(r.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setViewingReservation(r)} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Details"><Eye className="w-4 h-4" /></button>
                          {r.status === 'pending' && (
                            <button onClick={() => handleReservationStatus(r.id, 'confirmed')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Bestätigen"><Check className="w-4 h-4" /></button>
                          )}
                          {r.status !== 'cancelled' && (
                            <button onClick={() => handleReservationStatus(r.id, 'cancelled')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Stornieren"><X className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => setEditingReservation(r)} className="p-2 text-[#666666] hover:bg-[#666666]/10 rounded-lg" title="Bearbeiten"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteReservation(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Löschen"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reservations.length === 0 && (
                <div className="p-8 text-center text-[#666666]">Keine Reservierungen gefunden.</div>
              )}
            </div>
          </>
        )}

        {(activeView === 'events' || activeView === 'archive') && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">{showArchived ? 'Archiv' : 'Veranstaltungen'}</h2>
              <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-lg hover:bg-[#5a7a5e] transition-colors">
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
                          <button onClick={() => setEditingEvent(event)} className="p-2 text-[#6b8e6f] hover:bg-[#6b8e6f]/10 rounded-lg" title="Bearbeiten"><Edit2 className="w-4 h-4" /></button>
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
          </>
        )}
      </main>
    </div>
  );
}
