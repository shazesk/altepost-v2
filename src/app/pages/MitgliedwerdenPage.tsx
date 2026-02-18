import React from "react";
import { useState } from 'react';
import { Users, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export function MitgliedwerdenPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const membershipType = searchParams.get('type') || 'Mitgliedschaft';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    address: '',
    city: '',
    postalCode: '',
    memberSince: '',
    iban: '',
    message: '',
    newsletterOptIn: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, membershipType }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      setSubmitted(true);
    } catch (err: any) {
      setError(`Fehler: ${err.message || 'Unbekannter Fehler'}. Bitte versuchen Sie es später erneut.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#faf9f7] py-20">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 lg:p-12 text-center">
            <CheckCircle className="h-16 w-16 text-[#6b8e6f] mx-auto mb-4" />
            <h1 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl text-[#2d2d2d] mb-4">
              Vielen Dank für Ihr Interesse!
            </h1>
            <p className="text-[#666666] leading-relaxed font-['Inter',sans-serif] mb-8 max-w-xl mx-auto">
              Ihr Mitgliedsantrag wurde erfolgreich übermittelt. Sie erhalten in Kürze eine
              Bestätigungs-E-Mail. Wir melden uns schnellstmöglich bei Ihnen mit weiteren Informationen.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSubmitted(false)}
                className="text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors underline font-['Inter',sans-serif]"
              >
                Angaben ändern
              </button>
              <Link
                to="/membership"
                className="text-[#666666] hover:text-[#2d2d2d] transition-colors underline font-['Inter',sans-serif]"
              >
                Zurück zur Mitgliedschaft
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/membership"
          className="inline-flex items-center gap-2 text-[#666666] hover:text-[#2d2d2d] transition-colors mb-8 font-['Inter',sans-serif]"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Mitgliedschaft
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-10 w-10 text-[#6b8e6f]" />
            <h1 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d]">
              Mitglied werden
            </h1>
          </div>
          <div className="bg-[#6b8e6f]/10 rounded-lg p-4 border-l-4 border-[#6b8e6f]">
            <p className="text-[#2d2d2d] font-['Inter',sans-serif]">
              <strong>Gewählte Mitgliedschaft:</strong> {membershipType}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 lg:p-12 space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-xl text-[#2d2d2d] mb-4 font-['Playfair_Display',serif]">
              Persönliche Daten
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                  Vollständiger Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Maria Schmidt"
                  className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                />
              </div>

              <div>
                <label htmlFor="birthdate" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                  Geburtsdatum *
                </label>
                <input
                  type="date"
                  id="birthdate"
                  required
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ihre.email@beispiel.de"
                    className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                    Telefonnummer
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+49 123 4567890"
                    className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="border-t border-[rgba(107,142,111,0.2)] pt-6">
            <h3 className="text-xl text-[#2d2d2d] mb-4 font-['Playfair_Display',serif]">
              Adresse
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                  Straße und Hausnummer *
                </label>
                <input
                  type="text"
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="z.B. Hauptstraße 42"
                  className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="postalCode" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                    Postleitzahl *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="64395"
                    className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                    Ort *
                  </label>
                  <input
                    type="text"
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Brensbach"
                    className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Membership Info */}
          <div className="border-t border-[rgba(107,142,111,0.2)] pt-6">
            <h3 className="text-xl text-[#2d2d2d] mb-4 font-['Playfair_Display',serif]">
              Mitgliedschaft
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="memberSince" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                  Mitglied seit (optional)
                </label>
                <input
                  type="date"
                  id="memberSince"
                  value={formData.memberSince}
                  onChange={(e) => setFormData({ ...formData, memberSince: e.target.value })}
                  className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="border-t border-[rgba(107,142,111,0.2)] pt-6">
            <h3 className="text-xl text-[#2d2d2d] mb-4 font-['Playfair_Display',serif]">
              Bankverbindung
            </h3>
            <div>
              <label htmlFor="iban" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                IBAN (optional)
              </label>
              <input
                type="text"
                id="iban"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                placeholder="DE89 3704 0044 0532 0130 00"
                className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
              />
            </div>
          </div>

          {/* Additional Message */}
          <div className="border-t border-[rgba(107,142,111,0.2)] pt-6">
            <label htmlFor="message" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
              Nachricht an uns (optional)
            </label>
            <textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
              placeholder="Haben Sie Fragen oder möchten Sie uns etwas mitteilen?"
            />
          </div>

          {/* Newsletter Opt-in */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="newsletterOptIn"
              name="newsletterOptIn"
              checked={formData.newsletterOptIn}
              onChange={(e) => setFormData({ ...formData, newsletterOptIn: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-[rgba(107,142,111,0.3)] text-[#6b8e6f] focus:ring-[#6b8e6f]"
            />
            <label htmlFor="newsletterOptIn" className="text-sm text-[#666666] font-['Inter',sans-serif]">
              Ich möchte den Newsletter der Alten Post erhalten und über kommende Veranstaltungen und Neuigkeiten informiert werden.
            </label>
          </div>

          {/* Info Box */}
          <div className="bg-[#faf9f7] rounded-lg p-6 border border-[rgba(107,142,111,0.2)]">
            <h4 className="text-[#2d2d2d] mb-2 font-['Inter',sans-serif]">
              Nächste Schritte:
            </h4>
            <ul className="text-sm text-[#666666] space-y-2 font-['Inter',sans-serif]">
              <li>• Nach dem Absenden erhalten Sie eine Bestätigungs-E-Mail</li>
              <li>• Wir senden Ihnen die Beitragsordnung und weitere Informationen zu</li>
              <li>• Nach Bestätigung erhalten Sie Ihre Mitgliedsurkunde</li>
              <li>• Der Mitgliedsbeitrag wird jährlich fällig</li>
              <li>• Sie erhalten eine steuerlich absetzbare Spendenbescheinigung</li>
            </ul>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center font-['Inter',sans-serif]">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/membership')}
              className="flex-1 rounded-md border border-[rgba(107,142,111,0.3)] px-6 py-3 text-[#2d2d2d] hover:bg-[#faf9f7] transition-colors font-['Inter',sans-serif]"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 rounded-md px-6 py-3 transition-colors font-['Inter',sans-serif] ${
                isLoading
                  ? 'bg-[#e8e4df] text-[#999999] cursor-not-allowed'
                  : 'bg-[#6b8e6f] text-white hover:bg-[#5a7a5e]'
              }`}
            >
              {isLoading ? 'Wird gesendet...' : 'Mitgliedsantrag absenden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
