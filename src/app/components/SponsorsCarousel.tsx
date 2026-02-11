import React from "react";
import { useState, useEffect } from 'react';

interface Sponsor {
  id: string;
  name: string;
  logo?: string | null;
  url?: string | null;
  category: string;
  position: number;
}

export function SponsorsCarousel() {
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

  // Duplicate sponsors for seamless loop
  const duplicatedSponsors = [...sponsors, ...sponsors];

  return (
    <section className="py-12 lg:py-16 bg-white border-y border-[rgba(107,142,111,0.2)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm text-[#666666] mb-2 font-['Inter',sans-serif] tracking-wider uppercase">
            Gemeinsam für Kultur
          </p>
          <h2 className="font-['Playfair_Display',serif] text-2xl lg:text-3xl text-[#2d2d2d]">
            Unsere Partner & Förderer
          </h2>
        </div>

        {/* Scrolling Logos Container */}
        <div className="relative overflow-hidden">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

          {loading ? (
            <div className="flex">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 mx-8 flex items-center justify-center"
                  style={{ width: '180px', height: '80px' }}
                >
                  <div className="w-full h-full bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.15)] animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : sponsors.length > 0 ? (
            /* Scrolling Animation */
            <div className="flex animate-scroll hover:pause-animation">
              {duplicatedSponsors.map((sponsor, index) => {
                const inner = (
                  <div className="w-full h-full flex items-center justify-center bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.15)] px-6 py-4 transition-all hover:border-[#6b8e6f] hover:shadow-md">
                    {sponsor.logo ? (
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl text-[#6b8e6f] mb-1 font-['Playfair_Display',serif]">
                          {sponsor.name}
                        </div>
                      </div>
                    )}
                  </div>
                );

                return (
                  <div
                    key={index}
                    className="flex-shrink-0 mx-8 flex items-center justify-center"
                    style={{ width: '180px', height: '80px' }}
                  >
                    {sponsor.url ? (
                      <a
                        href={sponsor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-full"
                      >
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <a
            href="/sponsors"
            className="inline-flex items-center text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors font-['Inter',sans-serif] text-sm"
          >
            Werden Sie Förderer
            <span className="ml-2" aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }

        .pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
