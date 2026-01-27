import React from "react";
import { Mail, Users, Volume2, MapPin } from 'lucide-react';
import { QuoteCard } from './QuoteCard';
import { ContactForm } from './ContactForm';

export function ArtistsSection() {
  const technicalDetails = [
    { label: 'Kapazität', value: 'ca. 80 Sitzplätze' },
    { label: 'Bühne', value: 'Klein & intim (ca. 4m × 3m)' },
    { label: 'Technik', value: 'PA-Anlage, Beleuchtung vorhanden' },
    { label: 'Atmosphäre', value: 'Historisches Ambiente, persönliche Nähe' },
  ];

  return (
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

        {/* Artist Testimonial */}
        <div className="mb-12">
          <QuoteCard
            text="Die Alte Post ist eine Bühne, auf der man als Künstler wirklich gehört wird. Das Publikum ist aufmerksam, das Team professionell und herzlich. Hier spielt man nicht einfach – hier teilt man Momente."
            author="Anna L."
            role="Singer-Songwriterin"
          />
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 mb-16">
          {/* Left column - About the venue */}
          <div>
            <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-6">
              Warum die Alte Post?
            </h3>
            <div className="space-y-4 text-[#666666] leading-relaxed font-['Inter',sans-serif] mb-8">
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

            {/* Quick Contact */}
            <div className="bg-[#faf9f7] rounded-lg p-6 border border-[rgba(107,142,111,0.2)]">
              <h4 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-4">
                Schnellkontakt
              </h4>
              <div className="space-y-3">
                <a
                  href="mailto:programm@alte-post-brensbach.de"
                  className="flex items-center text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
                >
                  <Mail className="h-5 w-5 mr-3" />
                  programm@alte-post-brensbach.de
                </a>
                <p className="text-[#666666] text-sm font-['Inter',sans-serif] ml-8">
                  Oder nutzen Sie das Formular unten für eine ausführliche Anfrage
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Technical details */}
          <div>
            <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-6">
              Technische Informationen
            </h3>
            
            <div className="bg-[#faf9f7] rounded-lg p-6 border border-[rgba(107,142,111,0.2)] mb-8">
              <dl className="space-y-4">
                {technicalDetails.map((detail) => (
                  <div key={detail.label} className="border-b border-[rgba(107,142,111,0.15)] last:border-0 pb-4 last:pb-0">
                    <dt className="text-sm text-[#666666] mb-1 font-['Inter',sans-serif]">
                      {detail.label}
                    </dt>
                    <dd className="text-[#2d2d2d] font-['Inter',sans-serif]">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* What we're looking for */}
            <div className="space-y-6">
              <h4 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d]">
                Das suchen wir
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-[#6b8e6f] mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="text-[#2d2d2d] mb-1 font-['Inter',sans-serif]">Solo bis Quartett</h5>
                    <p className="text-sm text-[#666666] font-['Inter',sans-serif]">
                      Unsere Bühne eignet sich für kleinere Besetzungen
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Volume2 className="h-5 w-5 text-[#6b8e6f] mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="text-[#2d2d2d] mb-1 font-['Inter',sans-serif]">Akustisch orientiert</h5>
                    <p className="text-sm text-[#666666] font-['Inter',sans-serif]">
                      Jazz, Folk, Singer-Songwriter, Kabarett, Theater
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-[#6b8e6f] mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="text-[#2d2d2d] mb-1 font-['Inter',sans-serif]">Regionale & überregionale Acts</h5>
                    <p className="text-sm text-[#666666] font-['Inter',sans-serif]">
                      Etablierte Künstler und vielversprechende Newcomer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
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
  );
}