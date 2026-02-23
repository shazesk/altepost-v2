import React from "react";
import { CreditCard, Mail, Phone, MapPin, Info, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { VoucherPurchaseModal } from './VoucherPurchaseModal';

export function TicketsSection() {
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  return (
    <section id="tickets" className="py-20 lg:py-28 bg-[#faf9f7]">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
            Tickets & Gutscheine
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto">
            Sichern Sie sich Ihre Tickets für unsere Veranstaltungen
          </p>
        </div>

        {/* Helpful reminder */}
        <div className="mb-8 bg-white rounded-lg p-6 border-l-4 border-[#6b8e6f]">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#6b8e6f] mt-0.5 flex-shrink-0" />
            <p className="text-[#666666] font-['Inter',sans-serif]">
              <strong className="text-[#2d2d2d]">Frühzeitige Reservierung empfohlen:</strong> Bei beliebten 
              Veranstaltungen sind die ca. 30 Plätze schnell vergeben. Sichern Sie sich rechtzeitig Ihre Tickets.
            </p>
          </div>
        </div>

        {/* Ticket options */}
        <div className="space-y-8">
          {/* Online reservation */}
          <div className="bg-white rounded-lg p-8 border border-[rgba(107,142,111,0.2)]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6b8e6f] flex items-center justify-center text-white">
                <Mail className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-2">
                  Online reservieren
                </h3>
                <p className="text-[#666666] mb-4 leading-relaxed font-['Inter',sans-serif]">
                  Reservieren Sie Ihre Tickets bequem per E-Mail. Geben Sie die gewünschte 
                  Veranstaltung, Anzahl der Tickets und Ihre Kontaktdaten an. Wir bestätigen 
                  Ihre Reservierung innerhalb von 24 Stunden.
                </p>
                <a
                  href="mailto:tickets@alte-post-brensbach.de"
                  className="inline-flex items-center gap-2 text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
                >
                  tickets@alte-post-brensbach.de
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Phone reservation */}
          <div className="bg-white rounded-lg p-8 border border-[rgba(107,142,111,0.2)]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6b8e6f] flex items-center justify-center text-white">
                <Phone className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-2">
                  Telefonische Reservierung
                </h3>
                <p className="text-[#666666] mb-4 leading-relaxed font-['Inter',sans-serif]">
                  Rufen Sie uns an und reservieren Sie Ihre Tickets persönlich. 
                  Erreichbar Montag bis Freitag, 10:00 bis 18:00 Uhr.
                </p>
                <a
                  href="tel:+496161123456"
                  className="inline-flex items-center gap-2 text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
                >
                  +49 (0) 6161 12 34 56
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Box office */}
          <div className="bg-white rounded-lg p-8 border border-[rgba(107,142,111,0.2)]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6b8e6f] flex items-center justify-center text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-2">
                  Abendkasse
                </h3>
                <p className="text-[#666666] mb-4 leading-relaxed font-['Inter',sans-serif]">
                  Tickets sind auch an der Abendkasse erhältlich, sofern die Veranstaltung 
                  nicht ausverkauft ist. Wir empfehlen jedoch eine Reservierung im Voraus.
                </p>
                <p className="text-[#666666] font-['Inter',sans-serif]">
                  <strong className="text-[#2d2d2d]">Abendkasse öffnet:</strong> 1 Stunde vor Veranstaltungsbeginn
                </p>
              </div>
            </div>
          </div>

          {/* Gift vouchers */}
          <div className="bg-[#6b8e6f] text-white rounded-lg p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6b8e6f]">
                  <Gift className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-['Playfair_Display',serif] text-2xl mb-2">
                    Geschenkgutscheine
                  </h3>
                  <p className="text-white/90 mb-4 leading-relaxed font-['Inter',sans-serif]">
                    Verschenken Sie Kultur! Unsere Geschenkgutscheine sind das perfekte Präsent 
                    für kulturbegeisterte Menschen. Erhältlich in beliebiger Höhe oder für 
                    bestimmte Veranstaltungen.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setIsVoucherModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-md bg-white text-[#6b8e6f] px-6 py-3 hover:bg-[#f5f5f5] transition-colors font-['Inter',sans-serif]"
                    >
                      <Gift className="h-4 w-4" />
                      Jetzt Gutschein bestellen
                    </button>
                    <Link
                      to="/gutschein"
                      className="inline-flex items-center gap-2 text-white hover:text-[#d9cfc1] transition-colors font-['Inter',sans-serif] px-6 py-3"
                    >
                      Mehr erfahren
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important info */}
        <div className="mt-12 bg-[#e8e4df] rounded-lg p-6">
          <h4 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-3">
            Wichtige Informationen
          </h4>
          <ul className="space-y-2 text-[#666666] text-sm font-['Inter',sans-serif]">
            <li>• Reservierte Tickets bitte bis 15 Minuten vor Veranstaltungsbeginn abholen</li>
            <li>• Mitglieder erhalten ermäßigte Eintrittspreise</li>
            <li>• Zahlung bar oder per EC-Karte an der Abendkasse möglich</li>
            <li>• Freie Platzwahl, Einlass nach Reihenfolge des Eintreffens</li>
          </ul>
        </div>
      </div>

      {/* Voucher Purchase Modal */}
      <VoucherPurchaseModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />
    </section>
  );
}