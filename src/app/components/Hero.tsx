import React from "react";
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Text content */}
          <div>
            <h1 className="font-['Playfair_Display',serif] text-5xl lg:text-6xl text-[#2d2d2d] mb-6 leading-tight">
              Kultur in historischem Ambiente
            </h1>
            <p className="text-lg lg:text-xl text-[#666666] mb-8 leading-relaxed max-w-xl">
              Seit 1994 ist die Alte Post Brensbach ein Ort für lebendige Kleinkunst,
              intime Konzerte und kulturelle Begegnungen im Herzen des Odenwalds.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/tickets"
                className="inline-flex items-center justify-center rounded-md bg-[#6b8e6f] px-6 py-3 text-white hover:bg-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
              >
                Tickets & Programm
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-md border-2 border-[#6b8e6f] bg-transparent px-6 py-3 text-[#6b8e6f] hover:bg-[#6b8e6f] hover:text-white transition-colors font-['Inter',sans-serif]"
              >
                Über uns
              </Link>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden rounded-lg shadow-2xl">
              <img
                src="/hero-band.jpg"
                alt="Live-Auftritt in der Alten Post Brensbach"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#d9cfc1] rounded-lg -z-10 hidden lg:block"></div>
          </div>
        </div>
      </div>
    </section>
  );
}