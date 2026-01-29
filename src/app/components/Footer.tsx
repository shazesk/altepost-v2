import React from "react";
import { Mail, MapPin, Phone, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

export function Footer() {
  const settings = useSettings();

  return (
    <footer className="bg-[#2d2d2d] text-[#e8e4df]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="lg:col-span-2">
            <h3 className="font-['Playfair_Display',serif] text-xl text-white mb-4">
              {settings.organization.name}
            </h3>
            <p className="text-[#d9cfc1] leading-relaxed mb-6 font-['Inter',sans-serif]">
              {settings.organization.description}
              {' '}Wir sind ein gemeinnütziger Verein und fördern kulturelle Vielfalt durch
              hochwertige Veranstaltungen in intimer Atmosphäre.
            </p>
            <div className="text-sm text-[#999999] font-['Inter',sans-serif]">
              Vereinsregister: {settings.organization.registrationNumber} | {settings.organization.court}<br />
              Steuernummer: {settings.organization.taxNumber}
            </div>

            {/* Social Media */}
            <div className="mt-6 flex gap-4">
              <a
                href={settings.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#444444] text-[#d9cfc1] hover:bg-[#6b8e6f] hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={settings.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#444444] text-[#d9cfc1] hover:bg-[#6b8e6f] hover:text-white transition-all"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-['Playfair_Display',serif] text-xl text-white mb-4">
              Kontakt
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-[#6b8e6f] mr-3 mt-0.5 flex-shrink-0" />
                <div className="font-['Inter',sans-serif]">
                  <p className="text-[#d9cfc1]">{settings.address.street}</p>
                  <p className="text-[#d9cfc1]">{settings.address.postalCode} {settings.address.city}</p>
                </div>
              </div>
              <a
                href={`mailto:${settings.contact.emailGeneral}`}
                className="flex items-center text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
              >
                <Mail className="h-5 w-5 text-[#6b8e6f] mr-3 flex-shrink-0" />
                {settings.contact.emailGeneral}
              </a>
              <a
                href={`tel:${settings.contact.phone.replace(/\s|\(|\)/g, '')}`}
                className="flex items-center text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
              >
                <Phone className="h-5 w-5 text-[#6b8e6f] mr-3 flex-shrink-0" />
                {settings.contact.phone}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-['Playfair_Display',serif] text-xl text-white mb-4">
              Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/programm"
                  className="text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
                >
                  Programm
                </Link>
              </li>
              <li>
                <Link
                  to="/tickets"
                  className="text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
                >
                  Tickets
                </Link>
              </li>
              <li>
                <Link
                  to="/gutschein"
                  className="text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
                >
                  Gutscheine
                </Link>
              </li>
              <li>
                <Link
                  to="/kontakt"
                  className="text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
                >
                  Kontakt
                </Link>
              </li>
              <li>
                <Link
                  to="/membership"
                  className="text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
                >
                  Mitglied werden
                </Link>
              </li>
              <li>
                <Link
                  to="/artists"
                  className="text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
                >
                  Für Künstler
                </Link>
              </li>
              <li>
                <Link
                  to="/sponsors"
                  className="text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
                >
                  Unterstützer
                </Link>
              </li>
              <li>
                <Link
                  to="/archiv"
                  className="text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
                >
                  Archiv
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#444444]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#999999] font-['Inter',sans-serif]">
              © {new Date().getFullYear()} {settings.organization.name}. Alle Rechte vorbehalten.
            </p>
            <div className="flex gap-6">
              <Link
                to="/impressum"
                className="text-sm text-[#999999] hover:text-white transition-colors font-['Inter',sans-serif]"
              >
                Impressum
              </Link>
              <Link
                to="/datenschutz"
                className="text-sm text-[#999999] hover:text-white transition-colors font-['Inter',sans-serif]"
              >
                Datenschutz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}