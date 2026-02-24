import React from "react";
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const settings = useSettings();
  const { pathname } = useLocation();

  const handleNavClick = (href: string) => {
    if (pathname === href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Tickets', href: '/tickets' },
    { name: 'Über Uns', href: '/about' },
    { name: 'Für Künstler', href: '/artists' },
    { name: 'Mitglied werden', href: '/membership' },
    { name: 'Kontakt', href: '/kontakt' },
    { name: 'Kalender', href: '/belegungsplan' },
    { name: 'Archiv', href: '/archiv' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#faf9f7]/95 backdrop-blur-sm border-b border-[rgba(107,142,111,0.2)]">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Global">
        <div className="flex items-center justify-between py-4 lg:py-6">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link to="/" onClick={() => handleNavClick('/')} className="-m-1.5 p-1.5">
              <span className="sr-only">{settings.logo.mainText} {settings.logo.subtitle}</span>
              <img
                src={settings.images?.logo || '/logo.png'}
                alt={`${settings.logo.mainText} ${settings.logo.subtitle}`}
                className="h-10 lg:h-14 w-auto"
              />
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
                onClick={() => handleNavClick(item.href)}
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
              onClick={() => handleNavClick('/tickets')}
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
                  onClick={() => { handleNavClick(item.href); setMobileMenuOpen(false); }}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/tickets"
                className="block rounded-lg bg-[#6b8e6f] px-3 py-2 text-[15px] leading-7 text-white hover:bg-[#5a7a5e] font-['Inter',sans-serif]"
                onClick={() => { handleNavClick('/tickets'); setMobileMenuOpen(false); }}
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