import React, { useState } from "react";
import { Mail, Users, Volume2, MapPin, Phone, X, Heart, Snowflake, Sun, TreePalm } from 'lucide-react';
import { QuoteCard } from './QuoteCard';
import { ContactForm } from './ContactForm';

export function ArtistsSection() {
  return (
    <>
      {/* Section 1: Header + Intro (white bg) */}
      <section id="artists" className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-16 text-center">
            <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
              Informationen für Künstler
            </h2>
            <p className="text-lg text-[#666666] max-w-2xl mx-auto">
              Sie sind Künstler*in und möchten bei uns auftreten? Wir freuen uns auf Ihre Anfrage!
            </p>
          </div>

          {/* Emotional Framing - matches Membership page style */}
          <div className="mb-12 bg-white rounded-lg p-8 lg:p-12 border-2 border-[#8b4454]">
            <div className="flex items-start gap-4 mb-6">
              <Heart className="h-12 w-12 text-[#8b4454] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
                  Warum die Alte Post?
                </h3>
                <div className="space-y-4 text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                  <p>
                    Die Alte Post Brensbach ist ein besonderer Ort für besondere Auftritte.
                    Bei uns spielen Sie nicht vor anonymem Publikum, sondern vor kulturinteressierten
                    Menschen, die bewusst in unser Haus kommen.
                  </p>
                  <p>
                    Unsere kleine, intime Bühne schafft eine einzigartige Nähe zwischen Künstler und
                    Publikum. Diese Atmosphäre macht jeden Abend zu einem besonderen Erlebnis – für
                    Sie und für unsere Gäste.
                  </p>
                  <p>
                    Wir sind ein gemeinnütziger Verein und arbeiten auf Basis gegenseitigen Respekts
                    und fairer Konditionen. Unser Team unterstützt Sie vor, während und nach der
                    Veranstaltung mit viel Engagement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Artist Testimonial */}
          <div className="mb-12">
            <QuoteCard
              text="Die Alte Post ist eine Bühne, auf der man als Künstler wirklich gehört wird. Das Publikum ist aufmerksam, das Team professionell und herzlich. Hier spielt man nicht einfach – hier teilt man Momente."
              author="Anna L."
              role="Singer-Songwriterin"
            />
          </div>

          {/* What we're looking for - icon circle grid matching About/Membership */}
          <div className="grid gap-8 md:grid-cols-3 mb-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6b8e6f] text-white mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-2">
                Solo bis Quartett
              </h3>
              <p className="text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                Unsere Bühne eignet sich für kleinere Besetzungen
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6b8e6f] text-white mb-4">
                <Volume2 className="h-8 w-8" />
              </div>
              <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-2">
                Akustisch orientiert
              </h3>
              <p className="text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                Jazz, Folk, Singer-Songwriter, Kabarett, Theater
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6b8e6f] text-white mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-2">
                Regionale & überregionale Acts
              </h3>
              <p className="text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                Etablierte Künstler und vielversprechende Newcomer
              </p>
            </div>
          </div>

          {/* Technical details card */}
          <div className="bg-[#faf9f7] rounded-lg p-8 lg:p-12 border border-[rgba(107,142,111,0.2)]">
            <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-6">
              Technische Informationen
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Kapazität', value: 'ca. 80 Sitzplätze' },
                { label: 'Bühne', value: 'Klein & intim (ca. 4m × 3m)' },
                { label: 'Technik', value: 'PA-Anlage, Beleuchtung vorhanden' },
                { label: 'Atmosphäre', value: 'Historisches Ambiente, persönliche Nähe' },
              ].map((detail) => (
                <div key={detail.label} className="bg-white rounded-lg p-4 border border-[rgba(107,142,111,0.15)]">
                  <dt className="text-sm text-[#666666] mb-1 font-['Inter',sans-serif]">
                    {detail.label}
                  </dt>
                  <dd className="text-[#2d2d2d] font-['Inter',sans-serif] font-medium">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Venue Stages (alternating bg) */}
      <section className="py-20 lg:py-28 bg-[#faf9f7]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <VenueInfoSection />
        </div>
      </section>

      {/* Section 3: Green CTA Banner (matches Sponsors page) */}
      <section className="bg-[#6b8e6f] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-white text-center">
          <h3 className="font-['Playfair_Display',serif] text-3xl mb-4">
            Interesse an einem Auftritt?
          </h3>
          <p className="text-lg mb-2 max-w-2xl mx-auto leading-relaxed opacity-95">
            Wir freuen uns auf Ihre Anfrage! Stellen Sie uns Ihr Programm vor und
            werden Sie Teil unserer einzigartigen Kleinkunstbühne.
          </p>
          <p className="text-sm opacity-90">
            Nutzen Sie das Formular unten oder kontaktieren Sie direkt unser Programmteam
          </p>
        </div>
      </section>

      {/* Section 4: Contact Form (white bg) */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h3 className="font-['Playfair_Display',serif] text-3xl text-[#2d2d2d] mb-4">
                Ihre Anfrage
              </h3>
              <p className="text-[#666666] font-['Inter',sans-serif]">
                Stellen Sie uns Ihr Programm vor. Wir freuen uns darauf, von Ihnen zu hören!
              </p>
            </div>
            <ContactForm formType="artist" emailTo="programm@alte-post-brensbach.de" />
          </div>
        </div>
      </section>
    </>
  );
}

function VenueImageGallery({ images }: { images: { src: string; alt: string }[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
        {images.map((img) => (
          <button
            key={img.src}
            onClick={() => setLightbox(img.src)}
            className="overflow-hidden rounded-lg aspect-[4/3] cursor-pointer group"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function VenueInfoSection() {
  const venues = [
    {
      icon: Snowflake,
      title: '„Kneipe" (im Winter)',
      description:
        'Die Kneipe der Alte Post in Brensbach hat keine Bühne, keinen Vorhang und nur eine kleine Scheinwerferanlage! Unsere Kleinkunstbühne ist eine intime Kneipen-Atmosphäre vor ca. 40 begeisterungsfähigen Gästen! Diese Situation ist von besonderem Reiz für unsere Künstler, aber auch für unsere Gäste! Den Künstlern steht eine max. 4 qm große Fläche neben dem Tresen als „Aktionsraum" zur Verfügung. Darüberhinaus gibt es einen Barhocker und einen Stehtisch, sowie einen 220V-Stromanschluß.',
      images: [
        { src: '/artists/kneipe.jpg', alt: 'Auftritt in der Kneipe' },
      ],
    },
    {
      icon: Sun,
      title: 'Hofsaal (April–Oktober)',
      description:
        'Der sog. „Wintergarten" der Alten Post ist ein saal-ähnlicher Raum, durch eine Glasfaltwand zum Innenhof abgeschlossen und beheizbar, in dem bis zu 80 Gästen Platz finden. Eine variable Bühne von 4–10 qm wird von einer stationären Lichtanlage beleuchtet.',
      images: [
        { src: '/artists/hofsaal-1.jpg', alt: 'Im Hofsaal' },
        { src: '/artists/hofsaal-2.jpg', alt: 'Auftritt im Hofsaal' },
      ],
    },
    {
      icon: TreePalm,
      title: 'Innenhof (Sommermonate)',
      description:
        'Der Innenhof und der sog. Wintergarten zusammen bilden eine Fläche von ca. 300 qm für max. 150 Gäste. Der Innenhof kann bei Veranstaltungen mit Zelten gegen Regen geschützt werden, eine Heizung ist jedoch nicht möglich!',
      images: [
        { src: '/artists/grillstation.jpg', alt: 'Grillstation' },
        { src: '/artists/innenhof-1.jpg', alt: 'Bühne im Innenhof' },
        { src: '/artists/innenhof-2.jpg', alt: 'Auftritt im Innenhof' },
      ],
    },
  ];

  return (
    <>
      {/* Section header */}
      <div className="mb-16 text-center">
        <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
          Auftrittsmöglichkeiten
        </h2>
        <p className="text-lg text-[#666666] max-w-3xl mx-auto leading-relaxed">
          Die „KleinKunstKneipe Alte Post in Brensbach" bietet je nach Jahreszeit verschiedene Auftrittsmöglichkeiten:
        </p>
      </div>

      {/* Artist Contact Box - matches Sponsors gratitude section */}
      <div className="bg-white rounded-lg p-8 lg:p-12 border border-[rgba(107,142,111,0.2)] mb-16">
        <div className="flex items-start gap-4">
          <Mail className="h-12 w-12 text-[#6b8e6f] flex-shrink-0" />
          <div>
            <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
              Kontaktadresse für Künstler
            </h3>
            <p className="text-[#666666] font-['Inter',sans-serif] mb-4 leading-relaxed">
              Wenn Sie als Künstler Interesse an einem Auftritt haben oder weitere Informationen benötigen, wenden Sie sich bitte an unser Programmteam:
            </p>
            <div className="space-y-2 font-['Inter',sans-serif]">
              <p className="text-[#2d2d2d] font-medium">
                KleinKunstKneipe „Alte Post" – Programmteam –
              </p>
              <p className="text-[#2d2d2d]">Marcus Schmidt</p>
              <a
                href="tel:+4961628098110"
                className="flex items-center text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                06162 8098110
              </a>
              <a
                href="mailto:kuenstlerkontakt@kleinkunstkneipe.de"
                className="flex items-center text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                kuenstlerkontakt@kleinkunstkneipe.de
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Venue Cards */}
      <div className="space-y-8">
        {venues.map((venue) => {
          const Icon = venue.icon;
          return (
            <div
              key={venue.title}
              className="bg-white rounded-lg p-8 lg:p-12 border border-[rgba(107,142,111,0.2)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon className="h-8 w-8 text-[#6b8e6f]" />
                <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">
                  {venue.title}
                </h3>
              </div>
              <p className="text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                {venue.description}
              </p>
              <VenueImageGallery images={venue.images} />
            </div>
          );
        })}
      </div>
    </>
  );
}
