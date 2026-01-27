import React from "react";
import { useState } from 'react';
import { Gift, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function GutscheinPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    voucherType: 'amount', // 'amount' or 'event'
    amount: '50',
    customAmount: '',
    eventName: '',
    recipientName: '',
    recipientEmail: '',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    message: '',
    delivery: 'email', // 'email' or 'pickup'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine voucher details
    let voucherDetails = '';
    if (formData.voucherType === 'amount') {
      const finalAmount = formData.amount === 'custom' ? formData.customAmount : formData.amount;
      voucherDetails = `Wertgutschein über ${finalAmount}€`;
    } else {
      voucherDetails = `Gutschein für Veranstaltung: ${formData.eventName}`;
    }

    // Create mailto link with form data
    const subject = `Gutschein-Bestellung - ${voucherDetails}`;
    const body = `
Gutschein-Bestellung

${voucherDetails}

Käufer-Informationen:
Name: ${formData.buyerName}
E-Mail: ${formData.buyerEmail}
Telefon: ${formData.buyerPhone}

${formData.recipientName || formData.recipientEmail ? `Empfänger-Informationen:
${formData.recipientName ? `Name: ${formData.recipientName}` : ''}
${formData.recipientEmail ? `E-Mail: ${formData.recipientEmail}` : ''}
` : ''}
${formData.message ? `Persönliche Nachricht:
${formData.message}
` : ''}
Zustellung: ${formData.delivery === 'email' ? 'Per E-Mail (PDF)' : 'Abholung vor Ort'}
    `.trim();

    window.location.href = `mailto:gutscheine@alte-post-brensbach.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#faf9f7] py-20">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 lg:p-12 text-center">
            <CheckCircle className="h-16 w-16 text-[#6b8e6f] mx-auto mb-4" />
            <h1 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl text-[#2d2d2d] mb-4">
              Vielen Dank für Ihre Bestellung!
            </h1>
            <p className="text-[#666666] leading-relaxed font-['Inter',sans-serif] mb-8 max-w-xl mx-auto">
              Ihr E-Mail-Programm sollte sich geöffnet haben. Bitte senden Sie die E-Mail ab, 
              um Ihre Gutschein-Bestellung zu vervollständigen. Wir melden uns schnellstmöglich 
              bei Ihnen mit den Zahlungsinformationen.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSubmitted(false)}
                className="text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors underline font-['Inter',sans-serif]"
              >
                Angaben ändern
              </button>
              <Link
                to="/tickets"
                className="text-[#666666] hover:text-[#2d2d2d] transition-colors underline font-['Inter',sans-serif]"
              >
                Zurück zu Tickets
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
          to="/tickets"
          className="inline-flex items-center gap-2 text-[#666666] hover:text-[#2d2d2d] transition-colors mb-8 font-['Inter',sans-serif]"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zu Tickets
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="h-10 w-10 text-[#6b8e6f]" />
            <h1 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d]">
              Geschenkgutschein bestellen
            </h1>
          </div>
          <p className="text-lg text-[#666666] font-['Inter',sans-serif]">
            Verschenken Sie kulturelle Erlebnisse
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 lg:p-12 space-y-8">
          {/* Voucher Type Selection */}
          <div>
            <label className="block text-sm text-[#666666] mb-3 font-['Inter',sans-serif]">
              Art des Gutscheins *
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={`relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                formData.voucherType === 'amount' 
                  ? 'border-[#6b8e6f] bg-[#6b8e6f]/5' 
                  : 'border-[rgba(107,142,111,0.3)] hover:border-[#6b8e6f]/50'
              }`}>
                <input
                  type="radio"
                  name="voucherType"
                  value="amount"
                  checked={formData.voucherType === 'amount'}
                  onChange={(e) => setFormData({ ...formData, voucherType: e.target.value })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="text-[#2d2d2d] font-['Inter',sans-serif]">Wertgutschein</div>
                  <div className="text-sm text-[#666666] font-['Inter',sans-serif]">Beliebiger Betrag</div>
                </div>
              </label>

              <label className={`relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                formData.voucherType === 'event' 
                  ? 'border-[#6b8e6f] bg-[#6b8e6f]/5' 
                  : 'border-[rgba(107,142,111,0.3)] hover:border-[#6b8e6f]/50'
              }`}>
                <input
                  type="radio"
                  name="voucherType"
                  value="event"
                  checked={formData.voucherType === 'event'}
                  onChange={(e) => setFormData({ ...formData, voucherType: e.target.value })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="text-[#2d2d2d] font-['Inter',sans-serif]">Veranstaltungsgutschein</div>
                  <div className="text-sm text-[#666666] font-['Inter',sans-serif]">Für spezifische Events</div>
                </div>
              </label>
            </div>
          </div>

          {/* Amount Selection */}
          {formData.voucherType === 'amount' && (
            <div>
              <label className="block text-sm text-[#666666] mb-3 font-['Inter',sans-serif]">
                Betrag *
              </label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {['25', '50', '100'].map((amount) => (
                  <label
                    key={amount}
                    className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.amount === amount && formData.amount !== 'custom'
                        ? 'border-[#6b8e6f] bg-[#6b8e6f]/5' 
                        : 'border-[rgba(107,142,111,0.3)] hover:border-[#6b8e6f]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="amount"
                      value={amount}
                      checked={formData.amount === amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="sr-only"
                    />
                    <span className="text-[#2d2d2d] font-['Inter',sans-serif]">{amount}€</span>
                  </label>
                ))}
              </div>
              <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                formData.amount === 'custom'
                  ? 'border-[#6b8e6f] bg-[#6b8e6f]/5' 
                  : 'border-[rgba(107,142,111,0.3)] hover:border-[#6b8e6f]/50'
              }`}>
                <input
                  type="radio"
                  name="amount"
                  value="custom"
                  checked={formData.amount === 'custom'}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
                <span className="text-[#2d2d2d] font-['Inter',sans-serif]">Anderer Betrag:</span>
                <input
                  type="number"
                  min="10"
                  step="5"
                  placeholder="z.B. 75"
                  value={formData.customAmount}
                  onChange={(e) => setFormData({ ...formData, customAmount: e.target.value, amount: 'custom' })}
                  onClick={() => setFormData({ ...formData, amount: 'custom' })}
                  className="flex-1 rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-3 py-1 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                  required={formData.amount === 'custom'}
                />
                <span className="text-[#2d2d2d] font-['Inter',sans-serif]">€</span>
              </label>
            </div>
          )}

          {/* Event Name */}
          {formData.voucherType === 'event' && (
            <div>
              <label htmlFor="eventName" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                Veranstaltung *
              </label>
              <input
                type="text"
                id="eventName"
                required
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                placeholder="z.B. Jazz-Abend mit dem Trio Esperanza"
                className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
              />
            </div>
          )}

          {/* Recipient Information */}
          <div className="border-t border-[rgba(107,142,111,0.2)] pt-6">
            <h4 className="text-lg text-[#2d2d2d] mb-4 font-['Inter',sans-serif]">
              Empfänger (optional)
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="recipientName" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                  Name des Beschenkten
                </label>
                <input
                  type="text"
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="z.B. Maria Schmidt"
                  className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                />
              </div>
              <div>
                <label htmlFor="recipientEmail" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                  E-Mail des Beschenkten
                </label>
                <input
                  type="email"
                  id="recipientEmail"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                  placeholder="Für direkte Zusendung"
                  className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                />
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="border-t border-[rgba(107,142,111,0.2)] pt-6">
            <h4 className="text-lg text-[#2d2d2d] mb-4 font-['Inter',sans-serif]">
              Ihre Kontaktdaten
            </h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="buyerName" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                  Ihr Name *
                </label>
                <input
                  type="text"
                  id="buyerName"
                  required
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="buyerEmail" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                    Ihre E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    id="buyerEmail"
                    required
                    value={formData.buyerEmail}
                    onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                    className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                  />
                </div>
                <div>
                  <label htmlFor="buyerPhone" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                    Ihre Telefonnummer
                  </label>
                  <input
                    type="tel"
                    id="buyerPhone"
                    value={formData.buyerPhone}
                    onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                    className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <label htmlFor="message" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
              Persönliche Grußbotschaft (optional)
            </label>
            <textarea
              id="message"
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-2 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
              placeholder="Ihre Nachricht erscheint auf dem Gutschein"
            />
          </div>

          {/* Delivery Method */}
          <div>
            <label className="block text-sm text-[#666666] mb-3 font-['Inter',sans-serif]">
              Zustellung *
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                formData.delivery === 'email' 
                  ? 'border-[#6b8e6f] bg-[#6b8e6f]/5' 
                  : 'border-[rgba(107,142,111,0.3)] hover:border-[#6b8e6f]/50'
              }`}>
                <input
                  type="radio"
                  name="delivery"
                  value="email"
                  checked={formData.delivery === 'email'}
                  onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="text-[#2d2d2d] font-['Inter',sans-serif]">Per E-Mail (PDF)</div>
                  <div className="text-sm text-[#666666] font-['Inter',sans-serif]">Sofort verfügbar</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                formData.delivery === 'pickup' 
                  ? 'border-[#6b8e6f] bg-[#6b8e6f]/5' 
                  : 'border-[rgba(107,142,111,0.3)] hover:border-[#6b8e6f]/50'
              }`}>
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={formData.delivery === 'pickup'}
                  onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="text-[#2d2d2d] font-['Inter',sans-serif]">Abholung vor Ort</div>
                  <div className="text-sm text-[#666666] font-['Inter',sans-serif]">Gedruckter Gutschein</div>
                </div>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#faf9f7] rounded-lg p-4 border border-[rgba(107,142,111,0.2)]">
            <p className="text-sm text-[#666666] font-['Inter',sans-serif]">
              * Pflichtfelder. Nach dem Absenden öffnet sich Ihr E-Mail-Programm. Wir senden Ihnen 
              die Zahlungsinformationen zu. Der Gutschein wird nach Zahlungseingang versendet bzw. 
              zur Abholung bereitgestellt.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="flex-1 rounded-md border border-[rgba(107,142,111,0.3)] px-6 py-3 text-[#2d2d2d] hover:bg-[#faf9f7] transition-colors font-['Inter',sans-serif]"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-[#6b8e6f] px-6 py-3 text-white hover:bg-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
            >
              Gutschein bestellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
