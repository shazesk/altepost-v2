import React, { useState, useEffect } from "react";
import { Hero } from '../components/Hero';
import { SponsorsCarousel } from '../components/SponsorsCarousel';
import { ParkingSection } from '../components/ParkingSection';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Euro,
  ArrowRight,
  MapPin,
  Heart,
  Sparkles,
  Gift,
  Ticket,
  Users,
  Music,
  History,
  Award,
  Instagram,
  Facebook
} from 'lucide-react';
import { QuoteCard } from '../components/QuoteCard';
import { useCmsPage } from '../hooks/useCmsPage';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface HomePageContent {
  intro: {
    title: string;
    subtitle: string;
  };
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  cta: {
    title: string;
    description: string;
  };
  instagram: {
    handle: string;
    url: string;
  };
}

const defaultContent: HomePageContent = {
  intro: {
    title: 'Willkommen in der Alten Post',
    subtitle: 'Was unsere Kleinkunstkneipe seit 1994 zu einem besonderen Ort macht',
  },
  features: [
    { icon: 'heart', title: 'Intime Atmosphäre', description: 'Mit nur 30 Plätzen erleben Sie Kultur hautnah.' },
    { icon: 'history', title: '30 Jahre Tradition', description: 'Seit 1994 bringen wir Kleinkunst in den Odenwald.' },
    { icon: 'star', title: 'Qualität & Vielfalt', description: 'Rund 40 handverlesene Veranstaltungen pro Jahr.' },
  ],
  cta: {
    title: 'Werden Sie Teil unserer Kulturgemeinschaft',
    description: 'Ob als Besucher, Mitglied oder Förderer – gemeinsam erhalten wir lebendige Kleinkunst im Odenwald.',
  },
  instagram: {
    handle: '@altepostbrensbach',
    url: 'https://www.instagram.com/altepostbrensbach',
  },
};

interface GalleryImage {
  id: number;
  position: number;
  image: string;
  alt: string;
  label: string;
}

const defaultGallery: GalleryImage[] = [
  { id: 1, position: 0, image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop', alt: 'Alte Post Brensbach', label: 'Profilbild' },
  { id: 2, position: 1, image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&h=1000&fit=crop', alt: 'Live performance', label: 'Großes Bild links' },
  { id: 3, position: 2, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop', alt: 'Audience', label: 'Klein oben links' },
  { id: 4, position: 3, image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop', alt: 'Jazz concert', label: 'Klein oben rechts' },
  { id: 5, position: 4, image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&h=1000&fit=crop', alt: 'Venue atmosphere', label: 'Großes Bild rechts' },
  { id: 6, position: 5, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', alt: 'Performer', label: 'Klein unten links' },
  { id: 7, position: 6, image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop', alt: 'Stage', label: 'Klein unten rechts' },
];

export function HomePage() {
  const { content } = useCmsPage<HomePageContent>('home', defaultContent);
  const [gallery, setGallery] = useState<GalleryImage[]>(defaultGallery);
  const [latestEvent, setLatestEvent] = useState<{ title: string; artist: string; date: string; time: string; price: string; genre: string; description: string } | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch('/api/pages?type=gallery');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setGallery(data.data);
          }
        }
      } catch {
        // Use defaults on error
      }
    }
    fetchGallery();
  }, []);

  useEffect(() => {
    async function fetchLatestEvent() {
      try {
        const res = await fetch('/api/pages?type=events');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            const events = data.data;
            const last = events[0];
            setLatestEvent({
              title: last.title,
              artist: last.artist || '',
              date: last.date,
              time: last.time,
              price: last.price?.replace(/[^\d,\.]/g, '') || '',
              genre: last.genre,
              description: last.description,
            });
          }
        }
      } catch {
        // Use CMS defaults on error
      }
    }
    fetchLatestEvent();
  }, []);

  function getGalleryImage(position: number): GalleryImage {
    return gallery.find(g => g.position === position) || defaultGallery[position];
  }

  // Use latest event from API
  const nextEvent = latestEvent;

  return (
    <>
      <Hero />
      
      {/* Featured Event Highlight - only shown when events exist */}
      {nextEvent && (
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-[#faf9f7]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#6b8e6f] px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm text-white font-['Inter',sans-serif] tracking-wider uppercase">
                Nächster Höhepunkt
              </span>
            </div>
            <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-3">
              {nextEvent.title}
            </h2>
            <p className="text-xl text-[#666666] font-['Inter',sans-serif]">
              {nextEvent.artist}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-[rgba(107,142,111,0.1)]">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="inline-block rounded-full bg-[#6b8e6f]/10 px-4 py-2 text-sm text-[#6b8e6f] font-['Inter',sans-serif]">
                  {nextEvent.genre}
                </span>
              </div>

              <p className="text-lg text-[#666666] mb-8 leading-relaxed text-center font-['Inter',sans-serif] max-w-2xl mx-auto">
                {nextEvent.description}
              </p>

              <div className="flex flex-wrap justify-center gap-8 mb-10 text-[#666666]">
                <div className="flex flex-col items-center">
                  <Calendar className="h-6 w-6 mb-2 text-[#6b8e6f]" />
                  <span className="text-sm text-[#999999] font-['Inter',sans-serif] mb-1">Datum</span>
                  <span className="font-['Inter',sans-serif]">{nextEvent.date}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="h-6 w-6 mb-2 text-[#6b8e6f]" />
                  <span className="text-sm text-[#999999] font-['Inter',sans-serif] mb-1">Einlass</span>
                  <span className="font-['Inter',sans-serif]">{nextEvent.time}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Euro className="h-6 w-6 mb-2 text-[#6b8e6f]" />
                  <span className="text-sm text-[#999999] font-['Inter',sans-serif] mb-1">Eintritt</span>
                  <span className="font-['Inter',sans-serif]">{nextEvent.price} EUR</span>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="h-6 w-6 mb-2 text-[#6b8e6f]" />
                  <span className="text-sm text-[#999999] font-['Inter',sans-serif] mb-1">Ort</span>
                  <span className="font-['Inter',sans-serif]">Alte Post</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/tickets"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#6b8e6f] px-8 py-4 text-white hover:bg-[#5a7a5e] transition-all shadow-lg hover:shadow-xl font-['Inter',sans-serif]"
                >
                  <Ticket className="h-5 w-5" />
                  Jetzt Tickets reservieren
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/tickets"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#6b8e6f] bg-transparent px-8 py-4 text-[#6b8e6f] hover:bg-[#6b8e6f] hover:text-white transition-all font-['Inter',sans-serif]"
                >
                  <Calendar className="h-5 w-5" />
                  Alle Veranstaltungen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Why Us Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl text-[#2d2d2d] mb-3">
              {content.intro.title}
            </h2>
            <p className="text-lg text-[#666666] font-['Inter',sans-serif] max-w-2xl mx-auto">
              {content.intro.subtitle}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-12">
            {/* Intimate Atmosphere */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#6b8e6f]/10 flex items-center justify-center mx-auto mb-4">
                <Music className="h-8 w-8 text-[#6b8e6f]" />
              </div>
              <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-3">
                Intime Atmosphäre
              </h3>
              <p className="text-[#666666] font-['Inter',sans-serif] leading-relaxed">
                Kleine Räume, große Momente – bei uns erleben Sie Kunst hautnah. 
                Hier wird jeder Abend zu einem persönlichen Erlebnis.
              </p>
            </div>

            {/* Heritage */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#6b8e6f]/10 flex items-center justify-center mx-auto mb-4">
                <History className="h-8 w-8 text-[#6b8e6f]" />
              </div>
              <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-3">
                30 Jahre Tradition
              </h3>
              <p className="text-[#666666] font-['Inter',sans-serif] leading-relaxed">
                Seit 1994 bewahren wir als gemeinnütziger Verein lebendige Kleinkunst 
                im Odenwald – getragen von einer engagierten Gemeinschaft.
              </p>
            </div>

            {/* Quality */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#6b8e6f]/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-[#6b8e6f]" />
              </div>
              <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-3">
                Qualität & Vielfalt
              </h3>
              <p className="text-[#666666] font-['Inter',sans-serif] leading-relaxed">
                Von Jazz bis Kabarett, von etablierten Künstlern bis zu Geheimtipps – 
                rund 40 handverlesene Veranstaltungen pro Jahr.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6b8e6f] px-8 py-4 text-white hover:bg-[#5a7a5e] transition-all shadow-lg hover:shadow-xl font-['Inter',sans-serif]"
            >
              Mehr über uns erfahren
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="py-16 lg:py-20 bg-[#faf9f7]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link 
              to="/tickets" 
              className="group relative overflow-hidden bg-gradient-to-br from-[#6b8e6f] to-[#5a7a5e] rounded-xl p-6 text-white hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <Calendar className="h-10 w-10 mb-4 relative z-10" />
              <h3 className="font-['Playfair_Display',serif] text-xl mb-2 relative z-10">
                Veranstaltungen
              </h3>
              <p className="text-white/90 text-sm font-['Inter',sans-serif] mb-3 relative z-10">
                Alle kommenden Veranstaltungen
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-['Inter',sans-serif] group-hover:gap-3 transition-all relative z-10">
                Entdecken
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>

            <Link 
              to="/tickets" 
              className="group relative overflow-hidden bg-gradient-to-br from-[#8b4454] to-[#6d3642] rounded-xl p-6 text-white hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <Ticket className="h-10 w-10 mb-4 relative z-10" />
              <h3 className="font-['Playfair_Display',serif] text-xl mb-2 relative z-10">
                Tickets
              </h3>
              <p className="text-white/90 text-sm font-['Inter',sans-serif] mb-3 relative z-10">
                Jetzt Plätze sichern
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-['Inter',sans-serif] group-hover:gap-3 transition-all relative z-10">
                Reservieren
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>

            <Link 
              to="/membership" 
              className="group relative overflow-hidden bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] rounded-xl p-6 text-white hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <Users className="h-10 w-10 mb-4 relative z-10" />
              <h3 className="font-['Playfair_Display',serif] text-xl mb-2 relative z-10">
                Mitgliedschaft
              </h3>
              <p className="text-white/90 text-sm font-['Inter',sans-serif] mb-3 relative z-10">
                Teil unserer Gemeinschaft werden
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-['Inter',sans-serif] group-hover:gap-3 transition-all relative z-10">
                Mehr erfahren
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>

            <Link 
              to="/gutschein" 
              className="group relative overflow-hidden bg-gradient-to-br from-[#d4a574] to-[#b8845a] rounded-xl p-6 text-white hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <Gift className="h-10 w-10 mb-4 relative z-10" />
              <h3 className="font-['Playfair_Display',serif] text-xl mb-2 relative z-10">
                Gutscheine
              </h3>
              <p className="text-white/90 text-sm font-['Inter',sans-serif] mb-3 relative z-10">
                Kultur verschenken
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-['Inter',sans-serif] group-hover:gap-3 transition-all relative z-10">
                Bestellen
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials / Quotes Section */}
      <section className="py-16 lg:py-20 bg-[#faf9f7]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl text-[#2d2d2d] mb-3">
              Stimmen aus der Alten Post
            </h2>
            <p className="text-lg text-[#666666] font-['Inter',sans-serif]">
              Was Besucher und Künstler über uns sagen
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <QuoteCard
              text="Die Alte Post ist ein Ort, an dem man Kunst wirklich nah erleben kann. Die Atmosphäre ist einzigartig – man sitzt nicht einfach nur da, man ist Teil des Abends."
              author="Sabine M."
              role="Besucherin seit 2010"
            />
            <QuoteCard
              text="Als Künstler spürt man hier sofort die besondere Energie. Das Publikum ist aufmerksam, warmherzig und offen. Ein Auftritt in der Alten Post bleibt in Erinnerung."
              author="Thomas K."
              role="Liedermacher"
            />
            <QuoteCard
              text="Ohne unsere Mitglieder gäbe es die Alte Post nicht. Diese Gemeinschaft trägt einen wichtigen Teil zur Kulturlandschaft des Odenwalds bei."
              author="Michael R."
              role="Vereinsmitglied seit 1998"
            />
          </div>
        </div>
      </section>

      {/* Sponsors Carousel */}
      <SponsorsCarousel />

      {/* Instagram Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-8">
            {/* Profile Picture */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-[#e8e4df]">
              <ImageWithFallback
                src={getGalleryImage(0).image}
                alt={getGalleryImage(0).alt}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Instagram Handle */}
            <h3 className="font-['Inter',sans-serif] text-lg sm:text-xl text-[#2d2d2d] mb-4">
              {content.instagram.handle}
            </h3>

            {/* Follow Button */}
            <a
              href={content.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2d2d2d] px-6 py-2.5 text-white hover:bg-[#1a1a1a] transition-all font-['Inter',sans-serif] text-sm"
            >
              Follow on Instagram
            </a>
          </div>

          {/* Photo Grid - Mobile: 2 columns, Desktop: 4 columns with spans */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Large left image - On mobile: regular, on desktop: tall */}
            <div className="lg:col-span-1 lg:row-span-2 bg-[#e8e4df] rounded-lg overflow-hidden aspect-square lg:aspect-auto">
              <ImageWithFallback
                src={getGalleryImage(1).image}
                alt={getGalleryImage(1).alt}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Small top-left */}
            <div className="bg-[#e8e4df] rounded-lg aspect-square overflow-hidden">
              <ImageWithFallback
                src={getGalleryImage(2).image}
                alt={getGalleryImage(2).alt}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Small top-right */}
            <div className="bg-[#e8e4df] rounded-lg aspect-square overflow-hidden">
              <ImageWithFallback
                src={getGalleryImage(3).image}
                alt={getGalleryImage(3).alt}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Large right image - On mobile: regular, on desktop: tall */}
            <div className="lg:col-span-1 lg:row-span-2 bg-[#e8e4df] rounded-lg overflow-hidden aspect-square lg:aspect-auto">
              <ImageWithFallback
                src={getGalleryImage(4).image}
                alt={getGalleryImage(4).alt}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Small bottom-left */}
            <div className="bg-[#e8e4df] rounded-lg aspect-square overflow-hidden">
              <ImageWithFallback
                src={getGalleryImage(5).image}
                alt={getGalleryImage(5).alt}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Small bottom-right */}
            <div className="bg-[#e8e4df] rounded-lg aspect-square overflow-hidden">
              <ImageWithFallback
                src={getGalleryImage(6).image}
                alt={getGalleryImage(6).alt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Parking Section */}
      <ParkingSection />

      {/* Final CTA Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl text-[#2d2d2d] mb-4">
            {content.cta.title}
          </h2>
          <p className="text-lg text-[#666666] mb-8 font-['Inter',sans-serif] max-w-2xl mx-auto">
            {content.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/membership"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6b8e6f] px-8 py-4 text-white hover:bg-[#5a7a5e] transition-all shadow-lg font-['Inter',sans-serif]"
            >
              <Heart className="h-5 w-5" />
              Mitglied werden
            </Link>
            <Link
              to="/kontakt"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#6b8e6f] px-8 py-4 text-[#6b8e6f] hover:bg-[#6b8e6f] hover:text-white transition-all font-['Inter',sans-serif]"
            >
              Kontakt aufnehmen
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}