import React from "react";
import { ContactForm } from '../components/ContactForm';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export function KontaktPage() {
  const settings = useSettings();

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-16 text-center">
            <h1 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
              Kontakt
            </h1>
            <p className="text-lg text-[#666666] max-w-2xl mx-auto">
              Wir freuen uns auf Ihre Nachricht. Nehmen Sie Kontakt mit uns auf!
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 mb-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-6">
                  Kontaktinformationen
                </h2>
                
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6b8e6f] flex items-center justify-center text-white">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg text-[#2d2d2d] mb-1 font-['Inter',sans-serif]">
                        Adresse
                      </h3>
                      <p className="text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                        {settings.organization.name}<br />
                        {settings.address.street}<br />
                        {settings.address.postalCode} {settings.address.city}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6b8e6f] flex items-center justify-center text-white">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg text-[#2d2d2d] mb-1 font-['Inter',sans-serif]">
                        E-Mail
                      </h3>
                      <div className="space-y-1">
                        <a
                          href={`mailto:${settings.contact.emailGeneral}`}
                          className="block text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
                        >
                          {settings.contact.emailGeneral}
                        </a>
                        <p className="text-sm text-[#999999] font-['Inter',sans-serif]">
                          Allgemeine Anfragen
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6b8e6f] flex items-center justify-center text-white">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg text-[#2d2d2d] mb-1 font-['Inter',sans-serif]">
                        Telefon
                      </h3>
                      <a
                        href={`tel:${settings.contact.phone.replace(/\s|\(|\)/g, '')}`}
                        className="block text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
                      >
                        {settings.contact.phone}
                      </a>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6b8e6f] flex items-center justify-center text-white">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg text-[#2d2d2d] mb-1 font-['Inter',sans-serif]">
                        Erreichbarkeit
                      </h3>
                      <p className="text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                        {settings.officeHours.days}<br />
                        {settings.officeHours.hours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Contact Options */}
              <div className="bg-[#faf9f7] rounded-lg p-6 border border-[rgba(107,142,111,0.2)]">
                <h3 className="font-['Playfair_Display',serif] text-lg text-[#2d2d2d] mb-4">
                  Spezielle Anfragen
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-[#2d2d2d] font-['Inter',sans-serif]">Ticketreservierungen:</span>
                    <a
                      href={`mailto:${settings.contact.emailTickets}`}
                      className="block text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
                    >
                      {settings.contact.emailTickets}
                    </a>
                  </div>
                  <div>
                    <span className="text-[#2d2d2d] font-['Inter',sans-serif]">Künstleranfragen:</span>
                    <a
                      href={`mailto:${settings.contact.emailArtists}`}
                      className="block text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
                    >
                      {settings.contact.emailArtists}
                    </a>
                  </div>
                  <div>
                    <span className="text-[#2d2d2d] font-['Inter',sans-serif]">Förderung & Sponsoring:</span>
                    <a
                      href={`mailto:${settings.contact.emailSponsors}`}
                      className="block text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
                    >
                      {settings.contact.emailSponsors}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <ContactForm formType="general" emailTo={settings.contact.emailGeneral} />
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-[#e8e4df] rounded-lg overflow-hidden border border-[rgba(107,142,111,0.2)]">
            <div className="aspect-[16/9] lg:aspect-[21/9] flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="h-12 w-12 text-[#6b8e6f] mx-auto mb-4" />
                <p className="text-[#666666] font-['Inter',sans-serif]">
                  <strong className="text-[#2d2d2d]">{settings.organization.name}</strong><br />
                  {settings.address.street}, {settings.address.postalCode} {settings.address.city}<br />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.address.street} ${settings.address.postalCode} ${settings.address.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors inline-flex items-center mt-2"
                  >
                    In Google Maps öffnen →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
