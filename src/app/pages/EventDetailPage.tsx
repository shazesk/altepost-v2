import React from "react";
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, CalendarPlus, Clock, Euro, Ticket, ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface EventData {
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
  photos?: string[];
  is_archived?: boolean;
  remainingTickets?: number;
}

const GERMAN_MONTHS: Record<string, string> = {
  'Januar': '01', 'Februar': '02', 'März': '03', 'April': '04',
  'Mai': '05', 'Juni': '06', 'Juli': '07', 'August': '08',
  'September': '09', 'Oktober': '10', 'November': '11', 'Dezember': '12',
};

function buildGoogleCalendarUrl(event: { title: string; artist: string; date: string; time: string; description: string }) {
  // Parse date like "15. März 2026"
  const dateMatch = event.date.match(/(\d{1,2})\.\s*(\w+)\s+(\d{4})/);
  // Parse time like "20:00 Uhr"
  const timeMatch = event.time.match(/(\d{1,2}):(\d{2})/);
  if (!dateMatch || !timeMatch) return null;

  const day = dateMatch[1].padStart(2, '0');
  const month = GERMAN_MONTHS[dateMatch[2]] || '01';
  const year = dateMatch[3];
  const hour = timeMatch[1].padStart(2, '0');
  const minute = timeMatch[2];

  const start = `${year}${month}${day}T${hour}${minute}00`;
  // Default 2 hours duration
  const endHour = String(Number(hour) + 2).padStart(2, '0');
  const end = `${year}${month}${day}T${endHour}${minute}00`;

  const title = event.artist ? `${event.title} – ${event.artist}` : event.title;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: event.description || '',
    location: 'KleinKunstKneipe Alte Post, Brensbach',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<EventData[]>([]);

  const allPhotos = event ? [...(event.image ? [event.image] : []), ...(event.photos || [])] : [];

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(() => {
    setLightboxIndex(i => i !== null ? (i - 1 + allPhotos.length) % allPhotos.length : null);
  }, [allPhotos.length]);
  const nextPhoto = useCallback(() => {
    setLightboxIndex(i => i !== null ? (i + 1) % allPhotos.length : null);
  }, [allPhotos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
    }
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxIndex, closeLightbox, prevPhoto, nextPhoto]);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/pages?type=event&id=${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setEvent(data.data);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch('/api/pages?type=events');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            const others = data.data.filter((e: EventData) => e.id !== id && e.availability !== 'sold-out');
            setRecommendations(others.slice(0, 3));
          }
        }
      } catch { /* ignore */ }
    }
    if (id) fetchRecommendations();
  }, [id]);

  if (loading) {
    return (
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 bg-[#e8e4df] rounded w-32 mb-8"></div>
            <div className="h-64 bg-[#e8e4df] rounded-lg mb-8"></div>
            <div className="h-10 bg-[#e8e4df] rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-[#e8e4df] rounded w-1/2 mb-6"></div>
            <div className="h-20 bg-[#e8e4df] rounded mb-6"></div>
          </div>
        </div>
      </section>
    );
  }

  if (notFound || !event) {
    return (
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <Calendar className="h-16 w-16 text-[#6b8e6f] mx-auto mb-6" />
          <h1 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl text-[#2d2d2d] mb-4">
            Veranstaltung nicht gefunden
          </h1>
          <p className="text-lg text-[#666666] mb-8">
            Die gesuchte Veranstaltung existiert nicht oder wurde entfernt.
          </p>
          <Link
            to="/tickets"
            className="inline-flex items-center gap-2 bg-[#6b8e6f] text-white px-6 py-3 rounded-md hover:bg-[#5a7a5e] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Zum Programm
          </Link>
        </div>
      </section>
    );
  }

  const config = (() => {
    if (event.remainingTickets != null) {
      if (event.remainingTickets <= 0) return { text: 'Ausverkauft', color: 'text-[#666666]' };
      if (event.remainingTickets <= 5) return { text: `Nur noch ${event.remainingTickets} Tickets!`, color: 'text-[#8b4454]' };
      return { text: `${event.remainingTickets} Tickets verfügbar`, color: 'text-[#6b8e6f]' };
    }
    if (!event.availability) return null;
    const fallback = {
      'available': { text: 'Tickets verfügbar', color: 'text-[#6b8e6f]' },
      'few-left': { text: 'Nur noch wenige Tickets', color: 'text-[#8b4454]' },
      'sold-out': { text: 'Ausverkauft', color: 'text-[#666666]' },
    };
    return fallback[event.availability];
  })();

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/tickets"
          className="inline-flex items-center gap-2 text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Programm
        </Link>

        {/* Event image */}
        {event.image && (
          <div className="rounded-lg overflow-hidden mb-8 cursor-pointer" onClick={() => setLightboxIndex(0)}>
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-64 md:h-96 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Photo gallery */}
        {event.photos && event.photos.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {event.photos.map((photo, index) => (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setLightboxIndex((event.image ? 1 : 0) + index)}
                >
                  <ImageWithFallback
                    src={photo}
                    alt={`${event.title} – Foto ${index + 1}`}
                    className="w-full h-40 md:h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Genre badge */}
        <span className="inline-block rounded-full bg-[#e8e4df] px-3 py-1 text-sm text-[#666666] mb-4">
          {event.genre}
        </span>

        {/* Title & artist */}
        <h1 className="font-['Playfair_Display',serif] text-3xl lg:text-5xl text-[#2d2d2d] mb-3">
          {event.title}
        </h1>
        {event.artist && (
          <p className="text-xl text-[#666666] mb-6">{event.artist}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-6 mb-8 p-6 bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.2)]">
          <div className="flex items-center text-[#666666]">
            <Calendar className="h-5 w-5 mr-2 text-[#6b8e6f]" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-[#666666]">
            <Clock className="h-5 w-5 mr-2 text-[#6b8e6f]" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-[#666666]">
            <Euro className="h-5 w-5 mr-2 text-[#6b8e6f]" />
            <span>{event.price}</span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-8">
            <p className="text-[#666666] leading-relaxed text-lg">{event.description}</p>
          </div>
        )}

        {/* Availability + Ticket button */}
        {!event.is_archived && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {config && (
              <span className={`text-sm ${config.color}`}>{config.text}</span>
            )}
            <Link
              to={event.availability === 'sold-out' ? '#' : '/ticket-reservation'}
              state={event.availability === 'sold-out' ? undefined : { event }}
              className={`inline-flex items-center gap-2 rounded-md px-6 py-3 text-lg transition-colors ${
                event.availability === 'sold-out'
                  ? 'bg-[#e8e4df] text-[#666666] cursor-not-allowed'
                  : 'bg-[#6b8e6f] text-white hover:bg-[#5a7a5e]'
              }`}
              onClick={event.availability === 'sold-out' ? (e: React.MouseEvent) => e.preventDefault() : undefined}
            >
              <Ticket className="h-5 w-5" />
              {event.availability === 'sold-out' ? 'Ausverkauft' : 'Tickets reservieren'}
            </Link>
            {(() => {
              const calUrl = buildGoogleCalendarUrl(event);
              return calUrl ? (
                <a
                  href={calUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-lg border border-[#6b8e6f] text-[#6b8e6f] hover:bg-[#6b8e6f] hover:text-white transition-colors"
                >
                  <CalendarPlus className="h-5 w-5" />
                  Zum Kalender hinzufügen
                </a>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mx-auto max-w-4xl px-6 lg:px-8 mt-16">
          <div className="border-t border-[rgba(107,142,111,0.2)] pt-12">
            <h2 className="font-['Playfair_Display',serif] text-2xl lg:text-3xl text-[#2d2d2d] mb-2">
              {event.availability === 'sold-out' ? 'Diese Veranstaltungen haben noch Tickets' : 'Weitere Veranstaltungen'}
            </h2>
            <p className="text-[#666666] mb-8">
              {event.availability === 'sold-out'
                ? 'Diese Veranstaltung ist ausverkauft – aber hier gibt es noch Plätze!'
                : 'Entdecken Sie weitere Highlights in der Alten Post'}
            </p>
            <div className="grid gap-4">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  to={`/veranstaltung/${rec.id}`}
                  className="group flex flex-col sm:flex-row bg-[#faf9f7] rounded-lg overflow-hidden border border-[rgba(107,142,111,0.2)] hover:border-[#6b8e6f] hover:shadow-md transition-all"
                >
                  {rec.image && (
                    <div className="sm:w-48 flex-shrink-0 overflow-hidden">
                      <ImageWithFallback
                        src={rec.image}
                        alt={rec.title}
                        className="w-full h-36 sm:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block rounded-full bg-[#e8e4df] px-2.5 py-0.5 text-xs text-[#666666]">{rec.genre}</span>
                      {rec.availability === 'few-left' && (
                        <span className="text-xs text-[#8b4454] font-medium">Nur noch wenige!</span>
                      )}
                    </div>
                    <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-1 group-hover:text-[#6b8e6f] transition-colors">{rec.title}</h3>
                    <p className="text-sm text-[#666666] mb-3">{rec.artist}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-[#666666]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#6b8e6f]" />
                        {rec.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#6b8e6f]" />
                        {rec.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Euro className="h-3.5 w-3.5 text-[#6b8e6f]" />
                        {rec.price}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && allPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
          >
            <X className="h-7 w-7" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {allPhotos.length}
          </div>

          {/* Previous */}
          {allPhotos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-2 md:left-6 text-white/70 hover:text-white p-2 z-10"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}

          {/* Image */}
          <img
            src={allPhotos[lightboxIndex]}
            alt={`Foto ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {allPhotos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-2 md:right-6 text-white/70 hover:text-white p-2 z-10"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
