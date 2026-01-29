import React from "react";
import { useSettings } from '../contexts/SettingsContext';

export function ImpressumPage() {
  const settings = useSettings();

  return (
    <div className="min-h-screen bg-[#faf9f7] py-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h1 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-8">
          Impressum
        </h1>

        <div className="bg-white rounded-lg p-8 lg:p-12 space-y-8 font-['Inter',sans-serif]">
          <section>
            <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
              Angaben gemäß § 5 TMG
            </h2>
            <p className="text-[#666666] leading-relaxed">
              {settings.organization.name}<br />
              {settings.address.street}<br />
              {settings.address.postalCode} {settings.address.city}
            </p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
              Vertreten durch
            </h2>
            <p className="text-[#666666] leading-relaxed">
              Vorstand:<br />
              [Name des 1. Vorsitzenden]<br />
              [Name des 2. Vorsitzenden]
            </p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
              Kontakt
            </h2>
            <p className="text-[#666666] leading-relaxed">
              Telefon: {settings.contact.phone}<br />
              E-Mail: {settings.contact.emailGeneral}
            </p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
              Registereintrag
            </h2>
            <p className="text-[#666666] leading-relaxed">
              Eintragung im Vereinsregister<br />
              Registergericht: {settings.organization.court}<br />
              Registernummer: {settings.organization.registrationNumber}
            </p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
              Gemeinnützigkeit
            </h2>
            <p className="text-[#666666] leading-relaxed">
              Der Verein ist als gemeinnützig anerkannt.<br />
              Steuernummer: {settings.organization.taxNumber}<br />
              Finanzamt Darmstadt
            </p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
              Haftungsausschluss
            </h2>
            
            <h3 className="text-lg text-[#2d2d2d] mb-2 mt-4">
              Haftung für Inhalte
            </h3>
            <p className="text-[#666666] leading-relaxed mb-4">
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. 
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
              nach den allgemeinen Gesetzen verantwortlich.
            </p>

            <h3 className="text-lg text-[#2d2d2d] mb-2 mt-4">
              Haftung für Links
            </h3>
            <p className="text-[#666666] leading-relaxed mb-4">
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir 
              keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine 
              Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige 
              Anbieter oder Betreiber der Seiten verantwortlich.
            </p>

            <h3 className="text-lg text-[#2d2d2d] mb-2 mt-4">
              Urheberrecht
            </h3>
            <p className="text-[#666666] leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten 
              unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung 
              und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der 
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          <section>
            <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
              Online-Streitbeilegung
            </h2>
            <p className="text-[#666666] leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br />
              <a 
                href="https://ec.europa.eu/consumers/odr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#6b8e6f] hover:text-[#5a7a5e] underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              <br /><br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
