import React from "react";
import { useState, useEffect, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  format,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { Search, List, Calendar, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Types ---

interface UpcomingEvent {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  price: string;
  genre: string;
  month: string;
  availability: string;
  description: string;
  image: string | null;
}

interface ArchiveEvent {
  id: string;
  title: string;
  artist: string;
  date: string;
  genre: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  artist: string;
  date: string;
  time?: string;
  genre: string;
  parsedDate: Date;
  isArchived: boolean;
}

type ViewMode = 'list' | 'month' | 'day';

// --- German date parser ---

const GERMAN_MONTHS: Record<string, number> = {
  'januar': 0, 'februar': 1, 'märz': 2, 'april': 3,
  'mai': 4, 'juni': 5, 'juli': 6, 'august': 7,
  'september': 8, 'oktober': 9, 'november': 10, 'dezember': 11,
};

function parseGermanDate(dateStr: string): Date | null {
  // Format: "15. Januar 2026" or "15. Februar 2026"
  const match = dateStr.match(/^(\d{1,2})\.\s*([A-Za-zÄäÖöÜüß]+)\s+(\d{4})$/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const monthIndex = GERMAN_MONTHS[match[2].toLowerCase()];
  const year = parseInt(match[3], 10);
  if (monthIndex === undefined || isNaN(day) || isNaN(year)) return null;
  return new Date(year, monthIndex, day);
}

// --- Sub-components ---

function ListView({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16 bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.2)]">
        <Calendar className="h-12 w-12 text-[#6b8e6f] mx-auto mb-4" />
        <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-2">
          Keine Veranstaltungen
        </h3>
        <p className="text-[#666666]">
          Derzeit sind keine bevorstehenden Veranstaltungen geplant.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[rgba(107,142,111,0.15)]">
      {events.map((event) => (
        <div key={event.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span className="text-sm text-[#6b8e6f] font-medium whitespace-nowrap min-w-[140px]">
            {event.date}
          </span>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-[#2d2d2d]">{event.title}</span>
            {event.artist && (
              <span className="text-[#666666]"> — {event.artist}</span>
            )}
          </div>
          {event.time && (
            <span className="text-sm text-[#666666] whitespace-nowrap">{event.time}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function MonthView({
  events,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: {
  events: CalendarEvent[];
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  // Week starts on Monday (weekStartsOn: 1)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const key = format(event.parsedDate, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    });
    return map;
  }, [events]);

  const today = new Date();

  return (
    <div>
      {/* Month header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-[#faf9f7] transition-colors text-[#2d2d2d]"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </h3>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-[#faf9f7] transition-colors text-[#2d2d2d]"
          aria-label="Nächster Monat"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop: Calendar grid */}
      <div className="hidden md:block">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {dayNames.map((name) => (
            <div key={name} className="text-center text-sm font-medium text-[#666666] py-2">
              {name}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-[rgba(107,142,111,0.1)] rounded-lg overflow-hidden">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay.get(key) || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);

            return (
              <button
                key={key}
                onClick={() => onSelectDate(day)}
                className={`min-h-[90px] p-2 text-left transition-colors ${
                  isCurrentMonth ? 'bg-white hover:bg-[#faf9f7]' : 'bg-[#faf9f7]/50'
                } ${dayEvents.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  className={`text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full ${
                    isToday
                      ? 'bg-[#6b8e6f] text-white'
                      : isCurrentMonth
                      ? 'text-[#2d2d2d]'
                      : 'text-[#999999]'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-xs truncate px-1.5 py-0.5 rounded bg-[#6b8e6f]/10 text-[#6b8e6f] font-medium"
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-[#6b8e6f] px-1.5">
                        +{dayEvents.length - 2} mehr
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: Grouped-by-day list */}
      <div className="md:hidden">
        {(() => {
          const daysWithEvents = days
            .filter((day) => {
              const key = format(day, 'yyyy-MM-dd');
              return (eventsByDay.get(key) || []).length > 0 && isSameMonth(day, currentMonth);
            });

          if (daysWithEvents.length === 0) {
            return (
              <div className="text-center py-12 text-[#666666]">
                Keine Veranstaltungen in diesem Monat.
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {daysWithEvents.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDay.get(key) || [];
                return (
                  <button
                    key={key}
                    onClick={() => onSelectDate(day)}
                    className="w-full text-left bg-white rounded-lg p-4 border border-[rgba(107,142,111,0.2)] hover:border-[#6b8e6f] transition-colors"
                  >
                    <div className="text-sm font-medium text-[#6b8e6f] mb-2">
                      {format(day, 'EEEE, d. MMMM', { locale: de })}
                    </div>
                    {dayEvents.map((ev) => (
                      <div key={ev.id} className="text-[#2d2d2d]">
                        {ev.title}
                        {ev.artist && <span className="text-[#666666]"> — {ev.artist}</span>}
                      </div>
                    ))}
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function DayView({
  events,
  selectedDate,
  onPrevDay,
  onNextDay,
  onBackToMonth,
}: {
  events: CalendarEvent[];
  selectedDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onBackToMonth: () => void;
}) {
  const dayEvents = events.filter((ev) => isSameDay(ev.parsedDate, selectedDate));

  return (
    <div>
      {/* Back link */}
      <button
        onClick={onBackToMonth}
        className="text-sm text-[#6b8e6f] hover:underline mb-4 inline-flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Zurück zur Monatsansicht
      </button>

      {/* Day header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrevDay}
          className="p-2 rounded-lg hover:bg-[#faf9f7] transition-colors text-[#2d2d2d]"
          aria-label="Vorheriger Tag"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">
          {format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
        </h3>
        <button
          onClick={onNextDay}
          className="p-2 rounded-lg hover:bg-[#faf9f7] transition-colors text-[#2d2d2d]"
          aria-label="Nächster Tag"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {dayEvents.length === 0 ? (
        <div className="text-center py-16 bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.2)]">
          <CalendarDays className="h-12 w-12 text-[#6b8e6f] mx-auto mb-4" />
          <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-2">
            Keine Veranstaltungen
          </h3>
          <p className="text-[#666666]">Keine Veranstaltungen an diesem Tag.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dayEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg p-6 border border-[rgba(107,142,111,0.2)]"
            >
              <h4 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-1">
                {event.title}
              </h4>
              {event.artist && (
                <p className="text-[#666666] mb-2">{event.artist}</p>
              )}
              <div className="flex flex-wrap gap-3 text-sm">
                {event.time && (
                  <span className="text-[#6b8e6f] font-medium">{event.time}</span>
                )}
                <span className="px-2 py-0.5 bg-[#e8e4df] rounded-full text-[#666666] text-xs">
                  {event.genre}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main Component ---

export function BelegungsplanSection() {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [archivedEvents, setArchivedEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    async function fetchData() {
      try {
        const [upcomingRes, archivedRes] = await Promise.all([
          fetch('/api/pages?type=events'),
          fetch('/api/pages?type=events&archived=1'),
        ]);

        if (upcomingRes.ok) {
          const data = await upcomingRes.json();
          if (data.success && Array.isArray(data.data)) {
            const parsed: CalendarEvent[] = data.data
              .map((ev: UpcomingEvent) => {
                const parsedDate = parseGermanDate(ev.date);
                if (!parsedDate) return null;
                return {
                  id: ev.id,
                  title: ev.title,
                  artist: ev.artist,
                  date: ev.date,
                  time: ev.time,
                  genre: ev.genre,
                  parsedDate,
                  isArchived: false,
                };
              })
              .filter(Boolean) as CalendarEvent[];
            setUpcomingEvents(parsed);
          }
        }

        if (archivedRes.ok) {
          const data = await archivedRes.json();
          if (data.success && typeof data.data === 'object') {
            const allArchived: CalendarEvent[] = [];
            for (const [, events] of Object.entries(data.data as Record<string, ArchiveEvent[]>)) {
              for (const ev of events) {
                const parsedDate = parseGermanDate(ev.date);
                if (!parsedDate) continue;
                allArchived.push({
                  id: ev.id,
                  title: ev.title,
                  artist: ev.artist,
                  date: ev.date,
                  genre: ev.genre,
                  parsedDate,
                  isArchived: true,
                });
              }
            }
            // Sort most recent first
            allArchived.sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());
            setArchivedEvents(allArchived);
          }
        }
      } catch (error) {
        console.error('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter by search
  const filteredUpcoming = useMemo(() => {
    if (!searchTerm) return upcomingEvents;
    const term = searchTerm.toLowerCase();
    return upcomingEvents.filter(
      (ev) =>
        ev.title.toLowerCase().includes(term) ||
        ev.artist.toLowerCase().includes(term)
    );
  }, [upcomingEvents, searchTerm]);

  const filteredArchived = useMemo(() => {
    if (!searchTerm) return archivedEvents;
    const term = searchTerm.toLowerCase();
    return archivedEvents.filter(
      (ev) =>
        ev.title.toLowerCase().includes(term) ||
        ev.artist.toLowerCase().includes(term)
    );
  }, [archivedEvents, searchTerm]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  const viewButtons: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'list', label: 'Liste', icon: <List className="h-4 w-4" /> },
    { mode: 'month', label: 'Monat', icon: <Calendar className="h-4 w-4" /> },
    { mode: 'day', label: 'Tag', icon: <CalendarDays className="h-4 w-4" /> },
  ];

  return (
    <>
      {/* Section 1: Upcoming events */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-12 text-center">
            <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
              Belegungsplan
            </h2>
            <p className="text-lg text-[#666666] max-w-2xl mx-auto">
              Alle Veranstaltungen der Alten Post auf einen Blick
            </p>
          </div>

          {/* Search + View toggle */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#666666]" />
              <input
                type="text"
                placeholder="Suche nach Titel oder Künstler..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-[rgba(107,142,111,0.3)] bg-[#faf9f7] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] focus:bg-white font-['Inter',sans-serif]"
              />
            </div>
            <div className="flex rounded-lg border border-[rgba(107,142,111,0.3)] overflow-hidden shrink-0">
              {viewButtons.map((btn) => (
                <button
                  key={btn.mode}
                  onClick={() => setViewMode(btn.mode)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                    viewMode === btn.mode
                      ? 'bg-[#6b8e6f] text-white'
                      : 'bg-white text-[#666666] hover:bg-[#faf9f7]'
                  }`}
                >
                  {btn.icon}
                  <span className="hidden sm:inline">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#faf9f7] rounded-lg p-6 animate-pulse">
                  <div className="h-5 bg-[#e8e4df] rounded w-48 mb-3"></div>
                  <div className="h-4 bg-[#e8e4df] rounded w-32"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {viewMode === 'list' && <ListView events={filteredUpcoming} />}
              {viewMode === 'month' && (
                <MonthView
                  events={filteredUpcoming}
                  currentMonth={currentMonth}
                  onPrevMonth={() => setCurrentMonth((m) => subMonths(m, 1))}
                  onNextMonth={() => setCurrentMonth((m) => addMonths(m, 1))}
                  onSelectDate={handleSelectDate}
                />
              )}
              {viewMode === 'day' && (
                <DayView
                  events={filteredUpcoming}
                  selectedDate={selectedDate}
                  onPrevDay={() => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))}
                  onNextDay={() => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))}
                  onBackToMonth={() => {
                    setCurrentMonth(startOfMonth(selectedDate));
                    setViewMode('month');
                  }}
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* Section 2: Past events */}
      <section className="py-20 lg:py-28 bg-[#faf9f7]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="font-['Playfair_Display',serif] text-3xl text-[#2d2d2d] mb-2">
              Vergangene Veranstaltungen
            </h3>
            <p className="text-[#666666]">
              {filteredArchived.length} {filteredArchived.length === 1 ? 'Veranstaltung' : 'Veranstaltungen'}
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-[#e8e4df] rounded w-40"></div>
                </div>
              ))}
            </div>
          ) : filteredArchived.length === 0 ? (
            <div className="text-center py-12 text-[#666666]">
              Keine vergangenen Veranstaltungen gefunden.
            </div>
          ) : (
            <div className="divide-y divide-[rgba(107,142,111,0.15)]">
              {filteredArchived.map((event) => (
                <div key={event.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="text-sm text-[#999999] whitespace-nowrap min-w-[140px]">
                    {event.date}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-[#2d2d2d]">{event.title}</span>
                    {event.artist && (
                      <span className="text-[#666666]"> — {event.artist}</span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 bg-[#e8e4df] rounded-full text-[#666666] text-xs whitespace-nowrap self-start sm:self-auto">
                    {event.genre}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
