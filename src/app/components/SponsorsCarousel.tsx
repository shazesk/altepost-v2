import React from "react";
export function SponsorsCarousel() {
  const sponsors = [
    { name: 'Sparkasse Odenwald', logo: 'Sparkasse' },
    { name: 'Volksbank Odenwald', logo: 'Volksbank' },
    { name: 'Hessisches Ministerium für Kultur', logo: 'Hessen Kultur' },
    { name: 'Gemeinde Brensbach', logo: 'Brensbach' },
    { name: 'Odenwälder Echo', logo: 'Echo' },
    { name: 'Kultur Region Frankfurt', logo: 'KRF' },
    { name: 'Stiftung Kulturförderung', logo: 'Stiftung' },
    { name: 'Brauerei Grohe', logo: 'Grohe' },
  ];

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

          {/* Scrolling Animation */}
          <div className="flex animate-scroll hover:pause-animation">
            {duplicatedSponsors.map((sponsor, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-8 flex items-center justify-center"
                style={{ width: '180px', height: '80px' }}
              >
                <div className="w-full h-full flex items-center justify-center bg-[#faf9f7] rounded-lg border border-[rgba(107,142,111,0.15)] px-6 py-4 transition-all hover:border-[#6b8e6f] hover:shadow-md">
                  <div className="text-center">
                    <div className="text-2xl text-[#6b8e6f] mb-1 font-['Playfair_Display',serif]">
                      {sponsor.logo}
                    </div>
                    <div className="text-xs text-[#999999] font-['Inter',sans-serif] leading-tight">
                      {sponsor.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
