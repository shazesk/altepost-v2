import React from "react";
import { Mail, MapPin, Phone, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#2d2d2d] text-[#e8e4df]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="lg:col-span-2">
            <h3 className="font-['Playfair_Display',serif] text-xl text-white mb-4">
              KleinKunstKneipe Alte Post Brensbach e.V.
            </h3>
            <p className="text-[#d9cfc1] leading-relaxed mb-6 font-['Inter',sans-serif]">
              Seit 1994 ein Ort für lebendige Kleinkunst im Herzen des Odenwalds. 
              Wir sind ein gemeinnütziger Verein und fördern kulturelle Vielfalt durch 
              hochwertige Veranstaltungen in intimer Atmosphäre.
            </p>
            <div className="text-sm text-[#999999] font-['Inter',sans-serif]">
              Vereinsregister: VR 1234 | Amtsgericht Darmstadt<br />
              Steuernummer: 12/345/67890
            </div>
            
            {/* Social Media */}
            <div className="mt-6 flex gap-4">
              <a
                href="https://www.instagram.com/altepostbrensbach"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#444444] text-[#d9cfc1] hover:bg-[#6b8e6f] hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/altepostbrensbach"
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
                  <p className="text-[#d9cfc1]">Hauptstraße 42</p>
                  <p className="text-[#d9cfc1]">64395 Brensbach</p>
                </div>
              </div>
              <a
                href="mailto:info@alte-post-brensbach.de"
                className="flex items-center text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
              >
                <Mail className="h-5 w-5 text-[#6b8e6f] mr-3 flex-shrink-0" />
                info@alte-post-brensbach.de
              </a>
              <a
                href="tel:+496161123456"
                className="flex items-center text-[#d9cfc1] hover:text-white transition-colors font-['Inter',sans-serif]"
              >
                <Phone className="h-5 w-5 text-[#6b8e6f] mr-3 flex-shrink-0" />
                +49 (0) 6161 12 34 56
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
              © {new Date().getFullYear()} KleinKunstKneipe Alte Post Brensbach e.V. Alle Rechte vorbehalten.
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