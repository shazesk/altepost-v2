import React from "react";
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

interface ArchiveEvent {
  id: string;
  title: string;
  artist: string;
  date: string;
  genre: string;
}

// Fallback archive data
const fallbackArchiveData: Record<string, ArchiveEvent[]> = {
  '2025': [
    { id: '1', title: 'Silvesterkonzert', artist: 'Die Odenwälder', date: '31. Dezember 2025', genre: 'Folk' },
    { id: '2', title: 'Weihnachtskabarett', artist: 'Peter Schmidt', date: '20. Dezember 2025', genre: 'Kabarett' },
    { id: '3', title: 'Adventskonzert', artist: 'Chor Brensbach', date: '6. Dezember 2025', genre: 'Klassik' },
    { id: '4', title: 'Herbsttheater', artist: 'Ensemble Darmstadt', date: '15. November 2025', genre: 'Theater' },
    { id: '5', title: 'Jazz Night', artist: 'Sarah Klein Trio', date: '28. Oktober 2025', genre: 'Jazz' },
  ],
  '2024': [
    { id: '6', title: 'Sommerkonzert', artist: 'Acoustic Garden', date: '15. August 2024', genre: 'Folk' },
    { id: '7', title: 'Frühlingserwachen', artist: 'Anna Weber', date: '22. März 2024', genre: 'Liedermacher' },
    { id: '8', title: 'Winterzauber', artist: 'Maria Schneider Quartett', date: '18. Januar 2024', genre: 'Jazz' },
    { id: '9', title: 'Kabarett-Spezial', artist: 'Thomas Freitag', date: '10. Mai 2024', genre: 'Kabarett' },
    { id: '10', title: 'Blues & Boogie', artist: 'Marc Breitfelder', date: '7. September 2024', genre: 'Blues' },
  ],
  '2023': [
    { id: '11', title: 'Jubiläumskonzert', artist: 'Verschiedene Künstler', date: '10. September 2023', genre: 'Mixed' },
    { id: '12', title: 'Sommertheater', artist: 'Theatergruppe Odenwald', date: '5. Juli 2023', genre: 'Theater' },
    { id: '13', title: 'Frühjahrskabarett', artist: 'Thomas Müller', date: '14. April 2023', genre: 'Kabarett' },
    { id: '14', title: 'Irish Folk Night', artist: 'The Kellys', date: '17. März 2023', genre: 'Folk' },
    { id: '15', title: 'Singer-Songwriter Abend', artist: 'Lisa Morgenstern', date: '3. November 2023', genre: 'Liedermacher' },
  ],
  '2022': [
    { id: '16', title: 'Silvesterball', artist: 'Big Band Odenwald', date: '31. Dezember 2022', genre: 'Jazz' },
    { id: '17', title: 'Poetry Slam', artist: 'Verschiedene Poeten', date: '18. Oktober 2022', genre: 'Literatur' },
    { id: '18', title: 'Chanson-Abend', artist: 'Marie Dubois', date: '5. Juni 2022', genre: 'Chanson' },
    { id: '19', title: 'Klassik im Keller', artist: 'Streichquartett Frankfurt', date: '12. Februar 2022', genre: 'Klassik' },
  ],
  '2021': [
    { id: '20', title: 'Open-Air Sommer', artist: 'Local Heroes', date: '20. August 2021', genre: 'Rock' },
    { id: '21', title: 'Corona-Comeback', artist: 'Die Post-Hausband', date: '15. Juni 2021', genre: 'Mixed' },
    { id: '22', title: 'Livestream-Festival', artist: 'Verschiedene Künstler', date: '10. April 2021', genre: 'Online' },
  ],
  '2020': [
    { id: '23', title: 'Neujahrskonzert', artist: 'Kammerorchester Südhessen', date: '11. Januar 2020', genre: 'Klassik' },
    { id: '24', title: 'Kabarett-Marathon', artist: 'Comedy-Ensemble', date: '28. Februar 2020', genre: 'Kabarett' },
  ],
  '2019': [
    { id: '25', title: '25 Jahre Alte Post Gala', artist: 'Jubiläums-Ensemble', date: '15. September 2019', genre: 'Gala' },
    { id: '26', title: 'Weltmusik-Festival', artist: 'Internationale Künstler', date: '22. Juni 2019', genre: 'Weltmusik' },
    { id: '27', title: 'Jazz & Wine', artist: 'Modern Jazz Quartet', date: '8. November 2019', genre: 'Jazz' },
  ],
  '2018': [
    { id: '28', title: 'Akustik-Nacht', artist: 'Unplugged Collective', date: '14. Juli 2018', genre: 'Acoustic' },
    { id: '29', title: 'Literatur & Lyrik', artist: 'Autorenlesung', date: '3. März 2018', genre: 'Literatur' },
  ],
  '2017': [
    { id: '30', title: 'Swing Night', artist: 'The Swingers', date: '29. Dezember 2017', genre: 'Swing' },
    { id: '31', title: 'Folk & Fiddle', artist: 'Celtic Winds', date: '15. April 2017', genre: 'Folk' },
  ],
  '2016': [
    { id: '32', title: 'Blues Brothers Tribute', artist: 'Soul Brothers', date: '6. Oktober 2016', genre: 'Blues' },
    { id: '33', title: 'Kabarett-Sommer', artist: 'Politisches Kabarett', date: '20. August 2016', genre: 'Kabarett' },
  ],
  '2015': [
    { id: '34', title: 'Klassik trifft Jazz', artist: 'Fusion Ensemble', date: '12. Mai 2015', genre: 'Fusion' },
    { id: '35', title: 'Mundart-Abend', artist: 'Odenwälder Mundart', date: '17. November 2015', genre: 'Mundart' },
  ],
  '2014': [
    { id: '36', title: '20 Jahre Jubiläum', artist: 'Festakt & Konzert', date: '20. September 2014', genre: 'Jubiläum' },
    { id: '37', title: 'Singer-Songwriter Festival', artist: 'Verschiedene Künstler', date: '5. Juli 2014', genre: 'Liedermacher' },
  ],
  '2013': [
    { id: '38', title: 'Jazz-Marathon', artist: 'Jazz-Kollektiv', date: '23. März 2013', genre: 'Jazz' },
    { id: '39', title: 'Theatersommer', artist: 'Sommerbühne', date: '15. August 2013', genre: 'Theater' },
  ],
  '2010-2012': [
    { id: '40', title: 'Highlights 2010-2012', artist: 'Über 150 Veranstaltungen', date: 'Verschiedene Termine', genre: 'Mixed' },
  ],
  '2005-2009': [
    { id: '41', title: 'Highlights 2005-2009', artist: 'Über 250 Veranstaltungen', date: 'Verschiedene Termine', genre: 'Mixed' },
  ],
  '2000-2004': [
    { id: '42', title: 'Highlights 2000-2004', artist: 'Etablierungsphase mit 200+ Events', date: 'Verschiedene Termine', genre: 'Mixed' },
  ],
  '1995-1999': [
    { id: '43', title: 'Die Anfangsjahre', artist: 'Pionierzeit mit 150+ Events', date: 'Verschiedene Termine', genre: 'Mixed' },
    { id: '44', title: 'Millennium-Konzert', artist: 'Neujahrsfeier 2000', date: '31. Dezember 1999', genre: 'Gala' },
  ],
  '1994': [
    { id: '45', title: 'Eröffnungskonzert', artist: 'Die Gründungsmitglieder', date: '15. Oktober 1994', genre: 'Historisch' },
    { id: '46', title: 'Erstes Kabarett', artist: 'Odenwälder Kabarett', date: '20. November 1994', genre: 'Kabarett' },
  ],
};

// API base URL
const API_BASE_URL = '/api/endpoints';

export function ArchiveSection() {
  const [archiveData, setArchiveData] = useState<Record<string, ArchiveEvent[]>>(fallbackArchiveData);
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set(['2025']));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchArchive() {
      try {
        const response = await fetch(`${API_BASE_URL}/events.php?archived=1`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && typeof data.data === 'object') {
            // Merge API data with fallback for older years
            const apiYears = Object.keys(data.data);
            const mergedData = { ...fallbackArchiveData };

            // Override with API data for years that have it
            apiYears.forEach(year => {
              if (data.data[year] && data.data[year].length > 0) {
                mergedData[year] = data.data[year];
              }
            });

            setArchiveData(mergedData);
            // Expand the most recent year from API
            if (apiYears.length > 0) {
              setExpandedYears(new Set([apiYears[0]]));
            }
          }
        }
      } catch (error) {
        console.log('Using fallback archive data');
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

  // Filter events based on search
  const filteredData = Object.entries(archiveData).reduce((acc, [year, events]) => {
    const filteredEvents = events.filter(
      event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.genre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredEvents.length > 0) {
      acc[year] = filteredEvents;
    }
    return acc;
  }, {} as Record<string, ArchiveEvent[]>);

  // Calculate total events
  const totalEvents = Object.values(archiveData).reduce((sum, events) => sum + events.length, 0);

  return (
    <section id="archive" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
            Archiv
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto mb-4">
            30 Jahre Kulturgeschichte – über 3.000 Veranstaltungen seit 1994
          </p>
          <div className="inline-flex items-center gap-2 bg-[#6b8e6f] text-white px-4 py-2 rounded-full text-sm">
            <span>Von 1994 bis heute</span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#666666]" />
            <input
              type="text"
              placeholder="Suche nach Veranstaltungen, Künstlern oder Genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-[rgba(107,142,111,0.3)] focus:border-[#6b8e6f] focus:outline-none font-['Inter',sans-serif]"
            />
          </div>
        </div>

        {/* Archive content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-[rgba(107,142,111,0.2)] rounded-lg overflow-hidden animate-pulse">
                <div className="p-6 bg-[#faf9f7]">
                  <div className="h-8 bg-[#e8e4df] rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(filteredData).map(([year, events]) => (
              <div key={year} className="border border-[rgba(107,142,111,0.2)] rounded-lg overflow-hidden">
                {/* Year header - clickable */}
                <button
                  onClick={() => toggleYear(year)}
                  className="w-full flex items-center justify-between p-6 bg-[#faf9f7] hover:bg-[#e8e4df] transition-colors"
                >
                  <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">
                    {year}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#666666] font-['Inter',sans-serif]">
                      {events.length} Veranstaltung{events.length !== 1 ? 'en' : ''}
                    </span>
                    {expandedYears.has(year) ? (
                      <ChevronDown className="h-5 w-5 text-[#6b8e6f]" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-[#6b8e6f]" />
                    )}
                  </div>
                </button>

                {/* Events list - expandable */}
                {expandedYears.has(year) && (
                  <div className="bg-white divide-y divide-[rgba(107,142,111,0.1)]">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="p-6 hover:bg-[#faf9f7] transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-1">
                              {event.title}
                            </h4>
                            <p className="text-[#666666] font-['Inter',sans-serif]">
                              {event.artist}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 sm:text-right">
                            <span className="inline-block rounded-full bg-[#e8e4df] px-3 py-1 text-sm text-[#666666] font-['Inter',sans-serif]">
                              {event.genre}
                            </span>
                            <span className="text-[#666666] text-sm font-['Inter',sans-serif] min-w-[140px]">
                              {event.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Archive note */}
        <div className="mt-12 bg-[#faf9f7] rounded-lg p-8 border border-[rgba(107,142,111,0.2)]">
          <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-3">
            Unser kulturelles Erbe
          </h3>
          <p className="text-[#666666] font-['Inter',sans-serif] mb-4 leading-relaxed">
            Seit der Gründung im Jahr 1994 haben über 3.000 Veranstaltungen in der Alten Post
            stattgefunden. Von intimen Acoustic-Konzerten über großes Kabarett bis hin zu
            experimentellem Theater – die Alte Post war und ist ein Ort der kulturellen Vielfalt
            und künstlerischen Innovation im Odenwald.
          </p>
          <p className="text-[#666666] font-['Inter',sans-serif] leading-relaxed">
            Unser vollständiges Archiv mit detaillierten Informationen zu allen Veranstaltungen
            seit 1994 wird kontinuierlich digitalisiert. Für spezifische Anfragen zu historischen
            Veranstaltungen oder Künstlern kontaktieren Sie uns bitte direkt.
          </p>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="bg-[#6b8e6f] rounded-lg p-6 text-white">
            <div className="text-3xl font-['Playfair_Display',serif] mb-1">3.000+</div>
            <div className="text-sm opacity-90">Veranstaltungen seit 1994</div>
          </div>
          <div className="bg-[#8b4558] rounded-lg p-6 text-white">
            <div className="text-3xl font-['Playfair_Display',serif] mb-1">30+</div>
            <div className="text-sm opacity-90">Jahre Kulturgeschichte</div>
          </div>
        </div>
      </div>
    </section>
  );
}
