import React from "react";
import { useState } from 'react';
import { X, Gift, CheckCircle, User, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VoucherPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoucherPurchaseModal({ isOpen, onClose }: VoucherPurchaseModalProps) {
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
    privacyAccepted: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'radio') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine voucher details
    let voucherDetails = '';
    let voucherValue = '';
    if (formData.voucherType === 'amount') {
      const finalAmount = formData.amount === 'custom' ? formData.customAmount : formData.amount;
      voucherDetails = `Wertgutschein über ${finalAmount}€`;
      voucherValue = `${finalAmount} EUR`;
    } else {
      voucherDetails = `Gutschein für Veranstaltung: ${formData.eventName}`;
      voucherValue = 'Nach Veranstaltung';
    }

    // Create mailto link with form data
    const subject = encodeURIComponent(`Gutschein-Bestellung: ${voucherDetails}`);
    const body = encodeURIComponent(
      `GUTSCHEIN-BESTELLUNG\n\n` +
      `${voucherDetails}\n` +
      `Wert: ${voucherValue}\n` +
      `Zustellung: ${formData.delivery === 'email' ? 'Per E-Mail (PDF)' : 'Abholung vor Ort'}\n\n` +
      `---\n\n` +
      `KÄUFER-INFORMATIONEN\n\n` +
      `Name: ${formData.buyerName}\n` +
      `E-Mail: ${formData.buyerEmail}\n` +
      `Telefon: ${formData.buyerPhone}\n\n` +
      `${formData.recipientName || formData.recipientEmail ? `EMPFÄNGER-INFORMATIONEN\n\n` : ''}` +
      `${formData.recipientName ? `Name: ${formData.recipientName}\n` : ''}` +
      `${formData.recipientEmail ? `E-Mail: ${formData.recipientEmail}\n` : ''}` +
      `${formData.recipientName || formData.recipientEmail ? '\n' : ''}` +
      `${formData.message ? `PERSÖNLICHE GRUSSBOTSCRAFT\n\n${formData.message}\n\n` : ''}` +
      `---\n\n` +
      `Ich bitte um Zusendung der Zahlungsinformationen.\n\n` +
      `Mit freundlichen Grüßen\n` +
      `${formData.buyerName}`
    );
    
    window.location.href = `mailto:gutscheine@alte-post-brensbach.de?subject=${subject}&body=${body}`;
    
    // Show success message
    setIsSubmitted(true);
    
    // Reset after 3 seconds and close modal
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        voucherType: 'amount',
        amount: '50',
        customAmount: '',
        eventName: '',
        recipientName: '',
        recipientEmail: '',
        buyerName: '',
        buyerEmail: '',
        buyerPhone: '',
        message: '',
        delivery: 'email',
        privacyAccepted: false,
      });
      onClose();
    }, 3000);
  };

  const isFormValid = 
    (formData.voucherType === 'amount' 
      ? (formData.amount !== 'custom' || (formData.customAmount && parseFloat(formData.customAmount) >= 10))
      : formData.eventName.trim() !== '') &&
    formData.buyerName.trim() !== '' &&
    formData.buyerEmail.trim() !== '' &&
    formData.buyerPhone.trim() !== '' &&
    formData.privacyAccepted;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="sticky top-4 right-4 float-right z-10 text-[#666666] hover:text-[#2d2d2d] transition-colors bg-white rounded-full p-1"
          >
            <X className="h-6 w-6" />
          </button>

          {isSubmitted ? (
            // Success State
            <div className="p-8 lg:p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-[#6b8e6f] p-4">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="font-['Playfair_Display',serif] text-3xl text-[#2d2d2d] mb-4">
                Vielen Dank für Ihre Bestellung!
              </h3>
              <p className="text-lg text-[#666666] mb-2 font-['Inter',sans-serif]">
                Ihr E-Mail-Programm sollte sich öffnen.
              </p>
              <p className="text-[#666666] font-['Inter',sans-serif] max-w-xl mx-auto">
                Bitte senden Sie die vorbereitete Gutschein-Bestellung ab. Wir melden uns 
                schnellstmöglich mit den Zahlungsinformationen. Der Gutschein wird nach 
                Zahlungseingang versendet.
              </p>
            </div>
          ) : (
            // Form State
            <>
              {/* Header */}
              <div className="border-b border-[rgba(107,142,111,0.2)] p-6 lg:p-8 clear-right">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-full bg-[#6b8e6f] p-3">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-['Playfair_Display',serif] text-2xl lg:text-3xl text-[#2d2d2d] mb-2">
                      Geschenkgutschein bestellen
                    </h2>
                    <p className="text-[#666666] font-['Inter',sans-serif]">
                      Verschenken Sie kulturelle Erlebnisse
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 lg:p-8">
                <div className="space-y-6">
                  {/* Voucher Type Selection */}
                  <div>
                    <label className="block text-sm text-[#666666] mb-3 font-['Inter',sans-serif]">
                      Art des Gutscheins <span className="text-[#8b4454]">*</span>
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
                          onChange={handleChange}
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
                          onChange={handleChange}
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
                        Betrag <span className="text-[#8b4454]">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {['25', '50', '100'].map((amount) => (
                          <label
                            key={amount}
                            className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              formData.amount === amount
                                ? 'border-[#6b8e6f] bg-[#6b8e6f]/5' 
                                : 'border-[rgba(107,142,111,0.3)] hover:border-[#6b8e6f]/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="amount"
                              value={amount}
                              checked={formData.amount === amount}
                              onChange={handleChange}
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
                          onChange={handleChange}
                        />
                        <span className="text-[#2d2d2d] font-['Inter',sans-serif]">Anderer Betrag:</span>
                        <input
                          type="number"
                          name="customAmount"
                          min="10"
                          step="5"
                          placeholder="z.B. 75"
                          value={formData.customAmount}
                          onChange={(e) => {
                            handleChange(e);
                            setFormData(prev => ({ ...prev, amount: 'custom' }));
                          }}
                          onClick={() => setFormData(prev => ({ ...prev, amount: 'custom' }))}
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
                        Veranstaltung <span className="text-[#8b4454]">*</span>
                      </label>
                      <input
                        type="text"
                        id="eventName"
                        name="eventName"
                        required={formData.voucherType === 'event'}
                        value={formData.eventName}
                        onChange={handleChange}
                        placeholder="z.B. Winterkonzert mit Maria Schneider Quartett"
                        className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                      />
                    </div>
                  )}

                  {/* Buyer Information */}
                  <div className="border-t border-[rgba(107,142,111,0.2)] pt-6">
                    <h4 className="text-sm text-[#666666] mb-4 font-['Inter',sans-serif] uppercase tracking-wide">
                      Ihre Kontaktdaten
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="buyerName" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                          <User className="inline h-4 w-4 mr-2" />
                          Name <span className="text-[#8b4454]">*</span>
                        </label>
                        <input
                          type="text"
                          id="buyerName"
                          name="buyerName"
                          required
                          value={formData.buyerName}
                          onChange={handleChange}
                          placeholder="Ihr vollständiger Name"
                          className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="buyerEmail" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                            <Mail className="inline h-4 w-4 mr-2" />
                            E-Mail <span className="text-[#8b4454]">*</span>
                          </label>
                          <input
                            type="email"
                            id="buyerEmail"
                            name="buyerEmail"
                            required
                            value={formData.buyerEmail}
                            onChange={handleChange}
                            placeholder="ihre@email.de"
                            className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                          />
                        </div>
                        <div>
                          <label htmlFor="buyerPhone" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                            <Phone className="inline h-4 w-4 mr-2" />
                            Telefon <span className="text-[#8b4454]">*</span>
                          </label>
                          <input
                            type="tel"
                            id="buyerPhone"
                            name="buyerPhone"
                            required
                            value={formData.buyerPhone}
                            onChange={handleChange}
                            placeholder="+49 123 456789"
                            className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recipient Information (Optional) */}
                  <div className="border-t border-[rgba(107,142,111,0.2)] pt-6">
                    <h4 className="text-sm text-[#666666] mb-4 font-['Inter',sans-serif] uppercase tracking-wide">
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
                          name="recipientName"
                          value={formData.recipientName}
                          onChange={handleChange}
                          placeholder="z.B. Maria Schmidt"
                          className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                        />
                      </div>
                      <div>
                        <label htmlFor="recipientEmail" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
                          E-Mail des Beschenkten
                        </label>
                        <input
                          type="email"
                          id="recipientEmail"
                          name="recipientEmail"
                          value={formData.recipientEmail}
                          onChange={handleChange}
                          placeholder="Für direkte Zusendung"
                          className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
                        />
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
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif] resize-y"
                      placeholder="Ihre Nachricht erscheint auf dem Gutschein..."
                    />
                  </div>

                  {/* Delivery Method */}
                  <div>
                    <label className="block text-sm text-[#666666] mb-3 font-['Inter',sans-serif]">
                      Zustellung <span className="text-[#8b4454]">*</span>
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
                          onChange={handleChange}
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
                          onChange={handleChange}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="text-[#2d2d2d] font-['Inter',sans-serif]">Abholung vor Ort</div>
                          <div className="text-sm text-[#666666] font-['Inter',sans-serif]">Gedruckter Gutschein</div>
                        </div>
                      </label>
                    </div>
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
                      <Link to="/datenschutz" className="text-[#6b8e6f] hover:text-[#5a7a5e] underline">
                        Datenschutzerklärung
                      </Link>{' '}
                      zur Kenntnis genommen und stimme zu, dass meine Angaben zur Bearbeitung der 
                      Gutschein-Bestellung gespeichert werden. <span className="text-[#8b4454]">*</span>
                    </label>
                  </div>

                  {/* Important Info */}
                  <div className="bg-[#fff9e6] border border-[#f4d06f] rounded-lg p-4">
                    <p className="text-sm text-[#666666] font-['Inter',sans-serif]">
                      <strong className="text-[#2d2d2d]">Hinweis:</strong> Nach dem Absenden öffnet sich Ihr 
                      E-Mail-Programm. Wir senden Ihnen die Zahlungsinformationen zu. Der Gutschein wird nach 
                      Zahlungseingang versendet bzw. zur Abholung bereitgestellt.
                    </p>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md px-6 py-4 transition-colors font-['Inter',sans-serif] ${
                      isFormValid
                        ? 'bg-[#6b8e6f] text-white hover:bg-[#5a7a5e]'
                        : 'bg-[#e8e4df] text-[#999999] cursor-not-allowed'
                    }`}
                  >
                    <Gift className="h-5 w-5" />
                    Gutschein bestellen
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="sm:w-auto px-6 py-4 rounded-md border border-[rgba(107,142,111,0.3)] text-[#2d2d2d] hover:bg-[#faf9f7] transition-colors font-['Inter',sans-serif]"
                  >
                    Abbrechen
                  </button>
                </div>
                <p className="text-xs text-[#999999] text-center mt-3 font-['Inter',sans-serif]">
                  * Pflichtfelder
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
