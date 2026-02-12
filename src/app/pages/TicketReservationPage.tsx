import React from "react";
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Ticket, User, Mail, Phone, Users, CheckCircle, ArrowLeft } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  price: string;
  genre: string;
}

export function TicketReservationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event as Event | undefined;

  const [formData, setFormData] = useState({
    ticketCount: '2',
    name: '',
    email: '',
    phone: '',
    message: '',
    newsletterOptIn: false,
    privacyAccepted: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // If no event data, redirect to tickets page
  if (!event && !isSubmitted) {
    navigate('/tickets');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setIsLoading(true);
    setError('');

    const computedTotalPrice = (parseFloat(event.price.replace(',', '.')) * parseInt(formData.ticketCount)).toFixed(2).replace('.', ',');

    try {
      const res = await fetch('/api/send/reserve-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          eventId: event.id,
          eventTitle: event.title,
          eventArtist: event.artist,
          eventDate: event.date,
          eventTime: event.time,
          eventPrice: event.price,
          totalPrice: computedTotalPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      // Newsletter subscription
      if (formData.newsletterOptIn) {
        try {
          await fetch('/api/admin/data?type=newsletter-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, name: formData.name, source: 'ticket-reservation' }),
          });
        } catch {} // don't block form on newsletter error
      }
      setIsSubmitted(true);
    } catch (err: any) {
      setError(`Fehler: ${err.message || 'Unbekannter Fehler'}. Bitte versuchen Sie es später erneut.`);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = 
    formData.ticketCount !== '' &&
    parseInt(formData.ticketCount) > 0 &&
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.privacyAccepted;

  const totalPrice = event && formData.ticketCount 
    ? (parseFloat(event.price.replace(',', '.')) * parseInt(formData.ticketCount)).toFixed(2).replace('.', ',')
    : '0,00';

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#faf9f7] py-20">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 lg:p-12 text-center shadow-lg">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-[#6b8e6f] p-4">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl text-[#2d2d2d] mb-4">
              Vielen Dank!
            </h1>
            <p className="text-lg text-[#666666] mb-2 font-['Inter',sans-serif]">
              Ihre Reservierung wurde erfolgreich übermittelt.
            </p>
            <p className="text-[#666666] font-['Inter',sans-serif] mb-8">
              Sie erhalten in Kürze eine Bestätigungs-E-Mail. Wir bestätigen Ihre
              Reservierung innerhalb von 24 Stunden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/tickets"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#6b8e6f] px-6 py-3 text-white hover:bg-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
              >
                Zurück zu Tickets
              </Link>
              <Link
                to="/tickets"
                className="inline-flex items-center justify-center rounded-md border border-[rgba(107,142,111,0.3)] px-6 py-3 text-[#2d2d2d] hover:bg-[#faf9f7] transition-colors font-['Inter',sans-serif]"
              >
                Alle Veranstaltungen
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-[#faf9f7] py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/tickets"
          className="inline-flex items-center gap-2 text-[#666666] hover:text-[#2d2d2d] transition-colors mb-8 font-['Inter',sans-serif]"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zu Tickets
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="h-10 w-10 text-[#6b8e6f]" />
            <h1 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d]">
              Tickets reservieren
            </h1>
          </div>
          <p className="text-lg text-[#666666] font-['Inter',sans-serif]">
            {event.title}
          </p>
        </div>

        {/* Event Details Summary */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-[rgba(107,142,111,0.2)]">
          <h2 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
            Veranstaltungsdetails
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm font-['Inter',sans-serif]">
            <div>
              <span className="text-[#666666]">Künstler:</span>
              <p className="text-[#2d2d2d]">{event.artist}</p>
            </div>
            <div>
              <span className="text-[#666666]">Genre:</span>
              <p className="text-[#2d2d2d]">{event.genre}</p>
            </div>
            <div>
              <span className="text-[#666666]">Datum & Zeit:</span>
              <p className="text-[#2d2d2d]">{event.date}, {event.time}</p>
            </div>
            <div>
              <span className="text-[#666666]">Preis pro Ticket:</span>
              <p className="text-[#2d2d2d]">{event.price} EUR</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 lg:p-12 shadow-lg">
          <div className="space-y-6">
            {/* Ticket Count */}
            <div>
              <label htmlFor="ticketCount" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                <Users className="inline h-4 w-4 mr-2" />
                Anzahl Tickets <span className="text-[#8b4454]">*</span>
              </label>
              <select
                id="ticketCount"
                name="ticketCount"
                value={formData.ticketCount}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Ticket' : 'Tickets'}</option>
                ))}
              </select>
              <p className="mt-2 text-sm text-[#666666] font-['Inter',sans-serif]">
                Gesamtpreis: <span className="font-medium text-[#2d2d2d]">{totalPrice} EUR</span>
              </p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                <User className="inline h-4 w-4 mr-2" />
                Name <span className="text-[#8b4454]">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                placeholder="Ihr vollständiger Name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                <Mail className="inline h-4 w-4 mr-2" />
                E-Mail <span className="text-[#8b4454]">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                placeholder="ihre@email.de"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                <Phone className="inline h-4 w-4 mr-2" />
                Telefon <span className="text-[#8b4454]">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                placeholder="+49 123 456789"
              />
            </div>

            {/* Message (optional) */}
            <div>
              <label htmlFor="message" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                Nachricht (optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif] resize-y"
                placeholder="Besondere Wünsche oder Anmerkungen..."
              />
            </div>

            {/* Newsletter Opt-in */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="newsletterOptIn"
                name="newsletterOptIn"
                checked={formData.newsletterOptIn}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-[rgba(107,142,111,0.3)] text-[#6b8e6f] focus:ring-[#6b8e6f]"
              />
              <label htmlFor="newsletterOptIn" className="text-sm text-[#666666] font-['Inter',sans-serif]">
                Ich möchte den Newsletter der Alten Post erhalten und über kommende Veranstaltungen und Neuigkeiten informiert werden.
              </label>
            </div>

            {/* Privacy Policy */}
            <div className="flex items-start gap-3 bg-[#faf9f7] p-4 rounded-lg">
              <input
                type="checkbox"
                id="privacyAccepted"
                name="privacyAccepted"
                checked={formData.privacyAccepted}
                onChange={handleChange}
                required
                className="mt-1 h-4 w-4 rounded border-[rgba(107,142,111,0.3)] text-[#6b8e6f] focus:ring-[#6b8e6f]"
              />
              <label htmlFor="privacyAccepted" className="text-sm text-[#666666] font-['Inter',sans-serif]">
                Ich habe die{' '}
                <Link to="/datenschutz" target="_blank" rel="noopener noreferrer" className="text-[#6b8e6f] hover:text-[#5a7a5e] underline">
                  Datenschutzerklärung
                </Link>{' '}
                zur Kenntnis genommen und stimme zu, dass meine Angaben zur Bearbeitung der 
                Ticketreservierung gespeichert werden. <span className="text-[#8b4454]">*</span>
              </label>
            </div>

            {/* Important Info */}
            <div className="bg-[#fff9e6] border border-[#f4d06f] rounded-lg p-4">
              <p className="text-sm text-[#666666] font-['Inter',sans-serif]">
                <strong className="text-[#2d2d2d]">Hinweis:</strong> Ihre Reservierung ist erst nach 
                unserer Bestätigung verbindlich. Die Tickets werden an der Abendkasse hinterlegt. 
                Zahlung erfolgt bar oder per EC-Karte vor Ort.
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md px-6 py-4 transition-colors font-['Inter',sans-serif] ${
                isFormValid && !isLoading
                  ? 'bg-[#6b8e6f] text-white hover:bg-[#5a7a5e]'
                  : 'bg-[#e8e4df] text-[#999999] cursor-not-allowed'
              }`}
            >
              <Ticket className="h-5 w-5" />
              {isLoading ? 'Wird gesendet...' : 'Jetzt reservieren'}
            </button>
            <Link
              to="/tickets"
              className="sm:w-auto px-6 py-4 rounded-md border border-[rgba(107,142,111,0.3)] text-[#2d2d2d] hover:bg-[#faf9f7] transition-colors font-['Inter',sans-serif] text-center"
            >
              Abbrechen
            </Link>
          </div>
          {error && (
            <p className="text-sm text-red-600 text-center mt-3 font-['Inter',sans-serif]">{error}</p>
          )}
          <p className="text-xs text-[#999999] text-center mt-3 font-['Inter',sans-serif]">
            * Pflichtfelder
          </p>
        </form>
      </div>
    </div>
  );
}
