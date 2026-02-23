import React from "react";
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Euro, Ticket, ArrowLeft } from 'lucide-react';
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
  is_archived?: boolean;
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

  const availabilityConfig = {
    'available': { text: 'Tickets verfügbar', color: 'text-[#6b8e6f]' },
    'few-left': { text: 'Nur noch wenige Tickets', color: 'text-[#8b4454]' },
    'sold-out': { text: 'Ausverkauft', color: 'text-[#666666]' },
  };

  const config = event.availability ? availabilityConfig[event.availability] : null;

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
          <div className="rounded-lg overflow-hidden mb-8">
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-64 md:h-96 object-cover"
            />
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
          </div>
        )}
      </div>
    </section>
  );
}
