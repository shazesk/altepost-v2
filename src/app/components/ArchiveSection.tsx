import React from "react";
import { useState, useEffect } from 'react';
import { Search, Calendar, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollToTopButton } from './ScrollToTopButton';

interface ArchiveEvent {
  id: string;
  title: string;
  artist: string;
  date: string;
  genre: string;
  photos?: string[];
}

export function ArchiveSection() {
  const [archiveData, setArchiveData] = useState<Record<string, ArchiveEvent[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchArchive() {
      try {
        const response = await fetch('/api/pages?type=events&archived=1');
        if (response.ok) {
          const data = await response.json();
          if (data.success && typeof data.data === 'object') {
            setArchiveData(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch archive');
      } finally {
        setLoading(false);
      }
    }
    fetchArchive();
  }, []);

  const filteredData = Object.entries(archiveData).reduce((acc, [year, events]) => {
    if (!searchTerm) {
      acc[year] = events;
    } else {
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[year] = filtered;
      }
    }
    return acc;
  }, {} as Record<string, ArchiveEvent[]>);

  const sortedYears = Object.keys(filteredData).sort((a, b) => {
    const yearA = parseInt(a.split('-')[0]) || 0;
    const yearB = parseInt(b.split('-')[0]) || 0;
    return yearB - yearA;
  });

  const totalEvents = Object.values(filteredData).reduce((sum, events) => sum + events.length, 0);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
            Veranstaltungsarchiv
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto">
            Über 30 Jahre Kleinkunst in Brensbach – entdecken Sie unsere vergangenen Veranstaltungen
          </p>
        </div>

        <div className="mb-10">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#666666]" />
            <input
              type="text"
              placeholder="Suche nach Titel, Künstler oder Genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-[rgba(107,142,111,0.3)] bg-[#faf9f7] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] focus:bg-white"
            />
          </div>
          {!loading && (
            <p className="mt-3 text-sm text-[#666666] text-center">
              {totalEvents} {totalEvents === 1 ? 'Veranstaltung' : 'Veranstaltungen'} gefunden
            </p>
          )}
        </div>

        {!loading && sortedYears.length > 1 && (
          <div className="mb-10 sticky top-0 z-10 -mx-6 px-6 py-3 bg-white/90 backdrop-blur-sm border-b border-[rgba(107,142,111,0.15)]">
            <div className="flex flex-wrap justify-center gap-2">
              {sortedYears.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    const el = document.getElementById(`archiv-${year}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-3 py-1.5 text-sm font-medium rounded-full border border-[rgba(107,142,111,0.3)] text-[#2d2d2d] hover:bg-[#6b8e6f] hover:text-white hover:border-[#6b8e6f] transition-colors"
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#faf9f7] rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-[#e8e4df]" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-[#e8e4df] rounded w-3/4" />
                  <div className="h-4 bg-[#e8e4df] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedYears.length === 0 ? (
          <div className="text-center py-16 bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.2)]">
            <Calendar className="h-12 w-12 text-[#6b8e6f] mx-auto mb-4" />
            <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-2">Keine archivierten Veranstaltungen</h3>
            <p className="text-[#666666]">
              {searchTerm ? 'Keine Ergebnisse für Ihre Suche.' : 'Das Archiv ist noch leer.'}
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {sortedYears.map((year) => (
              <div key={year} id={`archiv-${year}`} className="scroll-mt-16">
                <div className="flex items-baseline gap-4 mb-6">
                  <h3 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl text-[#2d2d2d]">
                    {year}
                  </h3>
                  <span className="text-sm text-[#666666]">
                    {filteredData[year].length} {filteredData[year].length === 1 ? 'Veranstaltung' : 'Veranstaltungen'}
                  </span>
                  <div className="flex-1 border-b border-[rgba(107,142,111,0.2)]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredData[year].map((event) => (
                    <Link
                      key={event.id}
                      to={`/veranstaltung/${event.id}`}
                      className="group bg-[#faf9f7] rounded-xl overflow-hidden border border-[rgba(107,142,111,0.15)] hover:border-[#6b8e6f]/40 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="relative h-48 bg-[#e8e4df] overflow-hidden">
                        {event.photos && event.photos.length > 0 ? (
                          <>
                            <img
                              src={event.photos[0]}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {event.photos.length > 1 && (
                              <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                {event.photos.length}
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-[#6b8e6f]/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-[#2d2d2d] group-hover:text-[#6b8e6f] transition-colors line-clamp-1">
                          {event.title}
                        </h4>
                        <p className="text-sm text-[#666666] mt-1 line-clamp-1">{event.artist}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-[#666666]">{event.date}</span>
                          <span className="px-2 py-0.5 bg-[#e8e4df] rounded-full text-[#666666] text-xs">
                            {event.genre}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-[#faf9f7] rounded-lg p-6 border border-[rgba(107,142,111,0.2)]">
          <p className="text-sm text-[#666666] text-center">
            <strong className="text-[#2d2d2d]">Seit 1994</strong> bereichert die Alte Post das kulturelle Leben in Brensbach
            mit über 800 Veranstaltungen – von Jazz bis Kabarett, von Theater bis Literatur.
          </p>
        </div>
      </div>
      <ScrollToTopButton />
    </section>
  );
}
