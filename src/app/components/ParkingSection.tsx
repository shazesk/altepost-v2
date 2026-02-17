import React from "react";
import { Car, AlertTriangle } from 'lucide-react';

export function ParkingSection() {
  return (
    <section className="py-16 lg:py-20 bg-[#faf9f7]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#6b8e6f] px-4 py-2 mb-4">
            <Car className="h-4 w-4 text-white" />
            <span className="text-sm text-white font-['Inter',sans-serif] tracking-wider uppercase">
              Anfahrt & Parken
            </span>
          </div>
          <h2 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl text-[#2d2d2d] mb-3">
            Parkplätze
          </h2>
          <p className="text-lg text-[#666666] font-['Inter',sans-serif] max-w-2xl mx-auto">
            Informationen zu Parkmöglichkeiten und Zugang
          </p>
        </div>

        {/* Parking Images */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/parking-1.jpg"
              alt="Parkplatz Alte Post Brensbach"
              className="w-full h-64 lg:h-80 object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/parking-2.jpg"
              alt="Parkbereich Alte Post Brensbach"
              className="w-full h-64 lg:h-80 object-cover"
            />
          </div>
        </div>

        {/* Access Information Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-[rgba(107,142,111,0.1)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#d4a574]/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-[#d4a574]" />
              </div>
              <h3 className="font-['Playfair_Display',serif] text-xl lg:text-2xl text-[#2d2d2d]">
                Wichtige Mitteilung zum Zugang
              </h3>
            </div>

            <div className="text-[#666666] font-['Inter',sans-serif] leading-relaxed space-y-4">
              <p className="text-lg font-medium text-[#2d2d2d]">
                Liebe Gäste,
              </p>
              <p>
                wir möchten euch darauf hinweisen, dass während der <strong className="text-[#2d2d2d]">Wintermonate</strong> der Zugang zur KleinKunstKneipe Alte Post Brensbach e.V. ausschließlich über die Treppe ins Haus möglich ist. Leider sind in dieser Zeit aufgrund der Witterungsbedingungen und der baulichen Gegebenheiten keine alternativen barrierefreien Zugänge verfügbar.
              </p>
              <p>
                In den <strong className="text-[#2d2d2d]">wärmeren Monaten</strong> jedoch steht euch zusätzlich unser schöner Garten als Zugang zur Kneipe zur Verfügung, sodass ihr die Kunst und Atmosphäre auch im Freien genießen könnt.
              </p>
              <p>
                Wir bitten um euer Verständnis für diese saisonale Einschränkung und freuen uns darauf, euch bei uns begrüßen zu dürfen – ob im warmen Innenbereich während des Winters oder im grünen Garten an den sonnigeren Tagen.
              </p>
              <div className="pt-4 border-t border-[#e8e4df]">
                <p className="text-[#2d2d2d] font-medium">
                  Herzliche Grüße und auf einen kreativen Besuch,
                </p>
                <p className="text-[#6b8e6f] font-medium">
                  euer Team der KleinKunstKneipe Alte Post Brensbach e.V.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
