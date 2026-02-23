import React from "react";
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Calendar, Camera, X } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArchive() {
      try {
        const response = await fetch('/api/pages?type=events&archived=1');
        if (response.ok) {
          const data = await response.json();
          if (data.success && typeof data.data === 'object') {
            setArchiveData(data.data);
            const years = Object.keys(data.data);
            if (years.length > 0) {
              setExpandedYears(new Set([years[0]]));
            }
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

  const toggleYear = (year: string) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

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
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
            Veranstaltungsarchiv
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto">
            Über 30 Jahre Kleinkunst in Brensbach – entdecken Sie unsere vergangenen Veranstaltungen
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
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
            <p className="mt-3 text-sm text-[#666666]">
              {totalEvents} {totalEvents === 1 ? 'Veranstaltung' : 'Veranstaltungen'} gefunden
            </p>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#faf9f7] rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-[#e8e4df] rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : sortedYears.length === 0 ? (
          <div className="text-center py-16 bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.2)]">
            <Calendar className="h-12 w-12 text-[#6b8e6f] mx-auto mb-4" />
            <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-2">Keine archivierten Veranstaltungen</h3>
            <p className="text-[#666666]">Das Archiv ist noch leer.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedYears.map((year) => (
              <div key={year} className="border border-[rgba(107,142,111,0.2)] rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleYear(year)}
                  className="w-full flex items-center justify-between p-4 bg-[#faf9f7] hover:bg-[#e8e4df] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d]">{year}</span>
                    <span className="text-sm text-[#666666]">
                      ({filteredData[year].length} {filteredData[year].length === 1 ? 'Veranstaltung' : 'Veranstaltungen'})
                    </span>
                  </div>
                  {expandedYears.has(year) ? (
                    <ChevronDown className="h-5 w-5 text-[#6b8e6f]" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-[#6b8e6f]" />
                  )}
                </button>
                {expandedYears.has(year) && (
                  <div className="divide-y divide-[rgba(107,142,111,0.1)]">
                    {filteredData[year].map((event) => (
                      <div key={event.id} className="p-4 hover:bg-[#faf9f7] transition-colors relative">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <Link to={`/veranstaltung/${event.id}`} className="hover:text-[#6b8e6f] transition-colors">
                              <h4 className="font-medium text-[#2d2d2d]">{event.title}</h4>
                            </Link>
                            <p className="text-sm text-[#666666]">{event.artist}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            {event.photos && event.photos.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[#6b8e6f]">
                                <Camera className="h-3.5 w-3.5" />
                                <span className="text-xs">{event.photos.length}</span>
                              </span>
                            )}
                            <span className="text-[#666666]">{event.date}</span>
                            <span className="px-2 py-0.5 bg-[#e8e4df] rounded-full text-[#666666] text-xs">
                              {event.genre}
                            </span>
                          </div>
                        </div>
                        {/* Photo Gallery */}
                        {event.photos && event.photos.length > 0 && (
                          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {event.photos.map((photo, idx) => (
                              <button
                                key={idx}
                                onClick={() => setLightboxPhoto(photo)}
                                className="flex-shrink-0 rounded-lg overflow-hidden border border-[rgba(107,142,111,0.2)] hover:border-[#6b8e6f] transition-colors"
                              >
                                <img
                                  src={photo}
                                  alt={`${event.title} Foto ${idx + 1}`}
                                  className="h-20 w-28 object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-[#faf9f7] rounded-lg p-6 border border-[rgba(107,142,111,0.2)]">
          <p className="text-sm text-[#666666] text-center">
            <strong className="text-[#2d2d2d]">Seit 1994</strong> bereichert die Alte Post das kulturelle Leben in Brensbach
            mit über 800 Veranstaltungen – von Jazz bis Kabarett, von Theater bis Literatur.
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxPhoto}
            alt="Veranstaltungsfoto"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
