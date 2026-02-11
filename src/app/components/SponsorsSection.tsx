import React from "react";
import { useState, useEffect } from 'react';
import { Heart, Building2, Users, Handshake } from 'lucide-react';
import { ContactForm } from './ContactForm';

interface Sponsor {
  id: string;
  name: string;
  logo?: string | null;
  url?: string | null;
  category: 'hauptfoerderer' | 'foerderer' | 'kooperationspartner';
  position: number;
}

const categoryConfig: { key: Sponsor['category']; title: string; description: string; icon: typeof Building2 }[] = [
  {
    key: 'hauptfoerderer',
    title: 'Hauptförderer',
    description: 'Unsere verlässlichen Partner, die unser Kulturprogramm ermöglichen',
    icon: Building2,
  },
  {
    key: 'foerderer',
    title: 'Förderer',
    description: 'Unternehmen und Institutionen, die uns unterstützen',
    icon: Handshake,
  },
  {
    key: 'kooperationspartner',
    title: 'Kooperationspartner',
    description: 'Kulturelle Partner in der Region',
    icon: Users,
  },
];

export function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        const response = await fetch('/api/admin/data?type=sponsors-public');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setSponsors(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sponsors');
      } finally {
        setLoading(false);
      }
    }
    fetchSponsors();
  }, []);

  const grouped = categoryConfig.map((cat) => ({
    ...cat,
    sponsors: sponsors
      .filter((s) => s.category === cat.key)
      .sort((a, b) => a.position - b.position),
  }));

  return (
    <section id="sponsors" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
            Unterstützer & Förderer
          </h2>
          <p className="text-lg text-[#666666] max-w-3xl mx-auto leading-relaxed">
            Als gemeinnütziger Verein sind wir dankbar für die Unterstützung, die es uns ermöglicht,
            hochwertige Kultur im Odenwald anzubieten. Wir danken allen Förderern und Partnern für
            ihr Vertrauen und ihre langjährige Treue.
          </p>
        </div>

        {/* Gratitude section */}
        <div className="bg-[#faf9f7] rounded-lg p-8 lg:p-12 border border-[rgba(107,142,111,0.2)] mb-16">
          <div className="flex items-start gap-4 mb-6">
            <Heart className="h-12 w-12 text-[#8b4454] flex-shrink-0" />
            <div>
              <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
                Danke für Ihre Unterstützung
              </h3>
              <div className="space-y-4 text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                <p>
                  Seit über 30 Jahren schaffen wir gemeinsam einen besonderen Ort für Kultur im Odenwald.
                  Dies wäre ohne die Unterstützung unserer Förderer und Partner nicht möglich.
                </p>
                <p>
                  Ihre Unterstützung ermöglicht es uns, Künstlern eine Bühne zu bieten, faire Gagen zu zahlen
                  und gleichzeitig die Eintrittspreise für alle erschwinglich zu halten. Sie tragen dazu bei,
                  dass kulturelle Vielfalt in unserer Region erlebbar bleibt.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsor categories */}
        <div className="space-y-12 mb-16">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-8 border border-[rgba(107,142,111,0.2)] animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 bg-[#e8e4df] rounded"></div>
                  <div className="h-7 bg-[#e8e4df] rounded w-48"></div>
                </div>
                <div className="h-5 bg-[#e8e4df] rounded w-72 mb-6"></div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-16 bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.15)]"></div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            grouped
              .filter((cat) => cat.sponsors.length > 0)
              .map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.key} className="bg-white rounded-lg p-8 border border-[rgba(107,142,111,0.2)]">
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="h-8 w-8 text-[#6b8e6f]" />
                      <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d]">
                        {category.title}
                      </h3>
                    </div>
                    <p className="text-[#666666] mb-6 font-['Inter',sans-serif]">
                      {category.description}
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {category.sponsors.map((sponsor) => {
                        const content = sponsor.logo ? (
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="max-h-12 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[#2d2d2d] text-center font-['Inter',sans-serif]">
                            {sponsor.name}
                          </span>
                        );

                        return (
                          <div
                            key={sponsor.id}
                            className="flex items-center justify-center p-4 bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.15)]"
                          >
                            {sponsor.url ? (
                              <a
                                href={sponsor.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center hover:opacity-80 transition-opacity"
                              >
                                {content}
                              </a>
                            ) : (
                              content
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Call to become sponsor */}
        <div className="bg-[#6b8e6f] rounded-lg p-8 lg:p-12 text-white text-center mb-16">
          <h3 className="font-['Playfair_Display',serif] text-3xl mb-4">
            Sie möchten uns unterstützen?
          </h3>
          <p className="text-lg mb-2 max-w-2xl mx-auto leading-relaxed opacity-95">
            Als Sponsor oder Förderer tragen Sie aktiv zur Kulturförderung bei und werden sichtbar
            als Partner einer angesehenen Kultureinrichtung im Odenwald.
          </p>
          <p className="text-sm opacity-90 mb-6">
            Nutzen Sie das Formular unten für eine unverbindliche Anfrage
          </p>
        </div>

        {/* Contact Form Section */}
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h3 className="font-['Playfair_Display',serif] text-3xl text-[#2d2d2d] mb-4">
              Werden Sie Förderer
            </h3>
            <p className="text-[#666666] font-['Inter',sans-serif]">
              Wir freuen uns auf Ihre Anfrage und besprechen gerne individuelle Fördermöglichkeiten mit Ihnen.
            </p>
          </div>
          <ContactForm formType="sponsor" emailTo="foerderung@alte-post-brensbach.de" />
        </div>
      </div>
    </section>
  );
}
