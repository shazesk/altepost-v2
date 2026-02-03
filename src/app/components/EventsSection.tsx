import React from "react";
import { useState, useEffect } from 'react';
import { Calendar, Clock, Euro, Ticket, Grid, List, Download, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  price: string;
  genre: string;
  month: string;
  availability: 'available' | 'few-left' | 'sold-out';
  description: string;
  image?: string | null;
}

export function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGenre, setSelectedGenre] = useState<string>('Alle');
  const [selectedMonth, setSelectedMonth] = useState<string>('Alle');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/pages?type=events');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setEvents(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const genres = ['Alle', ...Array.from(new Set(events.map(e => e.genre)))];
  const months = ['Alle', ...Array.from(new Set(events.map(e => e.month)))];

  const filteredEvents = events.filter(event => {
    const genreMatch = selectedGenre === 'Alle' || event.genre === selectedGenre;
    const monthMatch = selectedMonth === 'Alle' || event.month === selectedMonth;
    return genreMatch && monthMatch;
  });

  return (
    <section id="events" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
            Aktuelles Programm
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto mb-6">
            Entdecken Sie unsere kommenden Veranstaltungen – von Jazz über Kabarett bis Theater
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/tickets" className="inline-flex items-center text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors">
              <Download className="h-4 w-4 mr-1.5" />
              Programm als PDF herunterladen
            </Link>
            <Link to="/tickets" className="inline-flex items-center text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors">
              <Gift className="h-4 w-4 mr-1.5" />
              Gutschein verschenken
            </Link>
          </div>
        </div>

        {events.length > 0 && (
          <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-6 bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.2)]">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div>
                <label htmlFor="genre-filter" className="block text-sm text-[#666666] mb-2">Genre</label>
                <select
                  id="genre-filter"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f]"
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="month-filter" className="block text-sm text-[#666666] mb-2">Monat</label>
                <select
                  id="month-filter"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f]"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#6b8e6f] text-white' : 'bg-white text-[#666666] hover:bg-[#e8e4df]'}`}
                aria-label="Grid-Ansicht"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#6b8e6f] text-white' : 'bg-white text-[#666666] hover:bg-[#e8e4df]'}`}
                aria-label="Listen-Ansicht"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#faf9f7] rounded-lg p-6 lg:p-8 animate-pulse">
                <div className="h-6 bg-[#e8e4df] rounded w-24 mb-4"></div>
                <div className="h-8 bg-[#e8e4df] rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-[#e8e4df] rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-[#e8e4df] rounded mb-6"></div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.2)]">
            <Calendar className="h-12 w-12 text-[#6b8e6f] mx-auto mb-4" />
            <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-2">Keine Veranstaltungen</h3>
            <p className="text-[#666666]">Aktuell sind keine Veranstaltungen geplant. Schauen Sie bald wieder vorbei!</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <EventListItem key={event.id} event={event} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link to="/archiv" className="inline-flex items-center text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors">
            Alle Veranstaltungen im Archiv ansehen
            <span className="ml-2">→</span>
          </Link>
        </div>

        <div className="mt-12 bg-[#faf9f7] rounded-lg p-6 border border-[rgba(107,142,111,0.2)]">
          <p className="text-sm text-[#666666] text-center">
            <strong className="text-[#2d2d2d]">Hinweis:</strong> Bei beliebten Veranstaltungen empfehlen wir eine frühzeitige Reservierung.
            Die Platzanzahl ist auf ca. 80 Sitzplätze begrenzt.
          </p>
        </div>
      </div>
    </section>
  );
}

function EventCard({ event }: { event: Event }) {
  const availabilityConfig = {
    'available': { text: 'Tickets verfügbar', color: 'text-[#6b8e6f]' },
    'few-left': { text: 'Nur noch wenige Tickets', color: 'text-[#8b4454]' },
    'sold-out': { text: 'Ausverkauft', color: 'text-[#666666]' },
  };

  const config = availabilityConfig[event.availability];

  return (
    <article className="group relative bg-[#faf9f7] rounded-lg overflow-hidden border border-[rgba(107,142,111,0.2)] hover:border-[#6b8e6f] transition-all hover:shadow-lg">
      <div className="p-6 lg:p-8">
        <div className="mb-4">
          <span className="inline-block rounded-full bg-[#e8e4df] px-3 py-1 text-sm text-[#666666]">{event.genre}</span>
        </div>
        <h3 className="font-['Playfair_Display',serif] text-2xl lg:text-3xl text-[#2d2d2d] mb-2">{event.title}</h3>
        <p className="text-lg text-[#666666] mb-4">{event.artist}</p>
        <p className="text-[#666666] mb-6 leading-relaxed line-clamp-2">{event.description}</p>
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-[#666666]">
            <Calendar className="h-4 w-4 mr-2 text-[#6b8e6f]" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-[#666666]">
            <Clock className="h-4 w-4 mr-2 text-[#6b8e6f]" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-[#666666]">
            <Euro className="h-4 w-4 mr-2 text-[#6b8e6f]" />
            <span>{event.price}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${config.color}`}>{config.text}</span>
          <Link
            to="/tickets"
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 transition-colors ${
              event.availability === 'sold-out'
                ? 'bg-[#e8e4df] text-[#666666] cursor-not-allowed'
                : 'bg-[#6b8e6f] text-white hover:bg-[#5a7a5e]'
            }`}
          >
            <Ticket className="h-4 w-4" />
            {event.availability === 'sold-out' ? 'Ausverkauft' : 'Tickets'}
          </Link>
        </div>
      </div>
    </article>
  );
}

function EventListItem({ event }: { event: Event }) {
  const availabilityConfig = {
    'available': { text: 'Tickets verfügbar', color: 'text-[#6b8e6f]' },
    'few-left': { text: 'Nur noch wenige Tickets', color: 'text-[#8b4454]' },
    'sold-out': { text: 'Ausverkauft', color: 'text-[#666666]' },
  };

  const config = availabilityConfig[event.availability];

  return (
    <article className="group bg-[#faf9f7] rounded-lg p-6 border border-[rgba(107,142,111,0.2)] hover:border-[#6b8e6f] transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block rounded-full bg-[#e8e4df] px-3 py-1 text-xs text-[#666666]">{event.genre}</span>
            <span className={`text-sm ${config.color}`}>{config.text}</span>
          </div>
          <h3 className="font-['Playfair_Display',serif] text-xl lg:text-2xl text-[#2d2d2d] mb-1">{event.title}</h3>
          <p className="text-[#666666] mb-2">{event.artist}</p>
          <div className="flex flex-wrap gap-4 text-sm text-[#666666]">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-[#6b8e6f]" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5 text-[#6b8e6f]" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center">
              <Euro className="h-4 w-4 mr-1.5 text-[#6b8e6f]" />
              <span>{event.price}</span>
            </div>
          </div>
        </div>
        <div className="lg:flex-shrink-0">
          <Link
            to="/tickets"
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 transition-colors ${
              event.availability === 'sold-out'
                ? 'bg-[#e8e4df] text-[#666666] cursor-not-allowed'
                : 'bg-[#6b8e6f] text-white hover:bg-[#5a7a5e]'
            }`}
          >
            <Ticket className="h-4 w-4" />
            {event.availability === 'sold-out' ? 'Ausverkauft' : 'Tickets'}
          </Link>
        </div>
      </div>
    </article>
  );
}
