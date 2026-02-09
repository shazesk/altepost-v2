import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteSettings {
  logo: { mainText: string; subtitle: string };
  address: { street: string; postalCode: string; city: string };
  contact: {
    phone: string;
    emailGeneral: string;
    emailTickets: string;
    emailArtists: string;
    emailSponsors: string;
  };
  social: { instagram: string; facebook: string };
  organization: {
    name: string;
    registrationNumber: string;
    court: string;
    taxNumber: string;
    description: string;
  };
  officeHours: { days: string; hours: string };
  images?: { logo: string; hero: string };
}

const defaultSettings: SiteSettings = {
  logo: { mainText: 'Alte Post', subtitle: 'BRENSBACH' },
  address: { street: 'Hauptstraße 15', postalCode: '64395', city: 'Brensbach' },
  contact: {
    phone: '+49 (0) 6161 12 34 56',
    emailGeneral: 'info@alte-post-brensbach.de',
    emailTickets: 'tickets@alte-post-brensbach.de',
    emailArtists: 'programm@alte-post-brensbach.de',
    emailSponsors: 'foerderung@alte-post-brensbach.de',
  },
  social: {
    instagram: 'https://www.instagram.com/altepostbrensbach',
    facebook: 'https://www.facebook.com/altepostbrensbach',
  },
  organization: {
    name: 'KleinKunstKneipe Alte Post Brensbach e.V.',
    registrationNumber: 'VR 1234',
    court: 'Amtsgericht Darmstadt',
    taxNumber: '12/345/67890',
    description: 'Seit 1994 ein Ort für lebendige Kleinkunst im Herzen des Odenwalds.',
  },
  officeHours: { days: 'Montag bis Freitag', hours: '10:00 - 18:00 Uhr' },
};

const SettingsContext = createContext<SiteSettings>(defaultSettings);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    fetch('/api/pages?type=settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
      });
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

export type { SiteSettings };
