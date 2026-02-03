import React from "react";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const settings = useSettings();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Tickets', href: '/tickets' },
    { name: 'Über Uns', href: '/about' },
    { name: 'Für Künstler', href: '/artists' },
    { name: 'Mitglied werden', href: '/membership' },
    { name: 'Kontakt', href: '/kontakt' },
    { name: 'Archiv', href: '/archiv' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#faf9f7]/95 backdrop-blur-sm border-b border-[rgba(107,142,111,0.2)]">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Global">
        <div className="flex items-center justify-between py-4 lg:py-6">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">{settings.logo.mainText} {settings.logo.subtitle}</span>
              <div className="flex flex-col items-center">
                <span className="font-['Playfair_Display',serif] text-2xl lg:text-3xl text-[#2d2d2d] leading-tight">{settings.logo.mainText}</span>
                <span className="text-xs lg:text-sm text-[#6b8e6f] font-['Inter',sans-serif] tracking-wider">{settings.logo.subtitle}</span>
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[#2d2d2d]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Menü öffnen</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-[15px] leading-6 text-[#2d2d2d] hover:text-[#6b8e6f] transition-colors font-['Inter',sans-serif]"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link
              to="/tickets"
              className="rounded-md bg-[#6b8e6f] px-5 py-2.5 text-[15px] text-white hover:bg-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
            >
              Tickets
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[rgba(107,142,111,0.2)] py-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block rounded-lg px-3 py-2 text-[15px] leading-7 text-[#2d2d2d] hover:bg-[#e8e4df] font-['Inter',sans-serif]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/tickets"
                className="block rounded-lg bg-[#6b8e6f] px-3 py-2 text-[15px] leading-7 text-white hover:bg-[#5a7a5e] font-['Inter',sans-serif]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tickets
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}