import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { SettingsProvider } from './contexts/SettingsContext';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { MembershipPage } from './pages/MembershipPage';
import { TicketsPage } from './pages/TicketsPage';
import { TicketReservationPage } from './pages/TicketReservationPage';
import { ArchivePage } from './pages/ArchivePage';
import { SponsorsPage } from './pages/SponsorsPage';
import { ImpressumPage } from './pages/ImpressumPage';
import { DatenschutzPage } from './pages/DatenschutzPage';
import { GutscheinPage } from './pages/GutscheinPage';
import { MitgliedwerdenPage } from './pages/MitgliedwerdenPage';
import { KontaktPage } from './pages/KontaktPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <SettingsProvider>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Admin route (outside Layout) */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
                    <Route path="about" element={<AboutPage />} />
          <Route path="artists" element={<ArtistsPage />} />
          <Route path="membership" element={<MembershipPage />} />
          <Route path="mitglied-werden" element={<MitgliedwerdenPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="ticket-reservation" element={<TicketReservationPage />} />
          <Route path="gutschein" element={<GutscheinPage />} />
          <Route path="archiv" element={<ArchivePage />} />
          <Route path="sponsors" element={<SponsorsPage />} />
          <Route path="kontakt" element={<KontaktPage />} />
          <Route path="impressum" element={<ImpressumPage />} />
          <Route path="datenschutz" element={<DatenschutzPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </SettingsProvider>
  );
}