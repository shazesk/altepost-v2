import React from "react";
import { TicketsSection } from '../components/TicketsSection';
import { Calendar, Clock, Euro, Ticket, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  price: string;
  genre: string;
  availability: 'available' | 'few-left' | 'sold-out';
  description: string;
}

const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Winterkonzert',
    artist: 'Maria Schneider Quartett',
    date: '15. Januar 2026',
    time: '20:00 Uhr',
    price: '18,00',
    genre: 'Jazz',
    availability: 'available',
    description: 'Ein intimer Jazzabend mit der preisgekrönten Pianistin Maria Schneider und ihrem Quartett.',
  },
  {
    id: '2',
    title: 'Kabarett am Freitag',
    artist: 'Thomas Müller',
    date: '22. Januar 2026',
    time: '19:30 Uhr',
    price: '22,00',
    genre: 'Kabarett',
    availability: 'few-left',
    description: 'Politisches Kabarett mit scharfem Witz und klugen Beobachtungen zum Zeitgeschehen.',
  },
  {
    id: '3',
    title: 'Liedermacherkonzert',
    artist: 'Anna Weber',
    date: '29. Januar 2026',
    time: '20:00 Uhr',
    price: '16,00',
    genre: 'Liedermacher',
    availability: 'available',
    description: 'Poetische Texte und gefühlvolle Melodien – Anna Weber verzaubert mit ihrer einzigartigen Stimme.',
  },
  {
    id: '4',
    title: 'Theaterstück: "Der Besuch"',
    artist: 'Theatergruppe Odenwald',
    date: '5. Februar 2026',
    time: '19:00 Uhr',
    price: '20,00',
    genre: 'Theater',
    availability: 'available',
    description: 'Eine moderne Interpretation eines klassischen Dramas – intensiv und berührend.',
  },
  {
    id: '5',
    title: 'Blues & Soul Night',
    artist: 'Sarah Johnson Band',
    date: '12. Februar 2026',
    time: '20:30 Uhr',
    price: '19,00',
    genre: 'Jazz',
    availability: 'available',
    description: 'Kraftvolle Stimmen und gefühlvolle Gitarrenklänge – ein Abend voller Soul.',
  },
  {
    id: '6',
    title: 'Poetry Slam',
    artist: 'Diverse Künstler',
    date: '19. Februar 2026',
    time: '19:00 Uhr',
    price: '12,00',
    genre: 'Literatur',
    availability: 'available',
    description: 'Moderne Poesie trifft auf Performance – junges, frisches Format in historischem Ambiente.',
  },
];

export function TicketsPage() {
  const availabilityText = {
    'available': 'Tickets verfügbar',
    'few-left': 'Nur noch wenige Tickets',
    'sold-out': 'Ausverkauft',
  };

  const availabilityColor = {
    'available': 'text-[#6b8e6f]',
    'few-left': 'text-[#8b4454]',
    'sold-out': 'text-[#666666]',
  };

  const navigate = useNavigate();

  const handleReserve = (event: Event) => {
    navigate('/ticket-reservation', { state: { event } });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Upcoming Events Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
              Tickets für kommende Veranstaltungen
            </h2>
            <p className="text-lg text-[#666666] max-w-2xl mx-auto">
              Wählen Sie Ihre Veranstaltung und reservieren Sie Ihre Tickets
            </p>
          </div>

          {/* Events Grid */}
          <div className="grid gap-6 lg:gap-8 mb-16">
            {upcomingEvents.map((event) => (
              <article 
                key={event.id} 
                className="bg-[#faf9f7] rounded-lg p-6 lg:p-8 border border-[rgba(107,142,111,0.2)] hover:border-[#6b8e6f] transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-block rounded-full bg-[#e8e4df] px-3 py-1 text-sm text-[#666666] font-['Inter',sans-serif]">
                        {event.genre}
                      </span>
                      <span className={`text-sm font-['Inter',sans-serif] ${availabilityColor[event.availability]}`}>
                        {availabilityText[event.availability]}
                      </span>
                    </div>
                    
                    <h3 className="font-['Playfair_Display',serif] text-2xl lg:text-3xl text-[#2d2d2d] mb-2">
                      {event.title}
                    </h3>
                    <p className="text-lg text-[#666666] mb-3 font-['Inter',sans-serif]">
                      {event.artist}
                    </p>
                    <p className="text-[#666666] mb-4 leading-relaxed font-['Inter',sans-serif]">
                      {event.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-[#666666] font-['Inter',sans-serif]">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-[#6b8e6f]" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-[#6b8e6f]" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <Euro className="h-4 w-4 mr-2 text-[#6b8e6f]" />
                        <span>{event.price} EUR</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:flex-shrink-0 flex flex-col gap-3">
                    {event.availability !== 'sold-out' ? (
                      <>
                        <button
                          onClick={() => handleReserve(event)}
                          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#6b8e6f] px-6 py-3 text-white hover:bg-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
                        >
                          <Ticket className="h-4 w-4" />
                          Tickets reservieren
                        </button>
                        <a
                          href="tel:+496161123456"
                          className="inline-flex items-center justify-center gap-2 rounded-md border border-[rgba(107,142,111,0.3)] px-6 py-3 text-[#2d2d2d] hover:bg-[#faf9f7] transition-colors font-['Inter',sans-serif]"
                        >
                          <Phone className="h-4 w-4" />
                          Telefonisch
                        </a>
                      </>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-2 rounded-md bg-[#e8e4df] px-6 py-3 text-[#666666] font-['Inter',sans-serif]">
                        <Ticket className="h-4 w-4" />
                        Ausverkauft
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Link to full program */}
          <div className="text-center">
            <Link
              to="/programm"
              className="inline-flex items-center text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
            >
              Zum vollständigen Programm
              <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Original Tickets Section */}
      <TicketsSection />
    </div>
  );
}