import React from "react";
import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContactFormProps {
  formType: 'general' | 'artist' | 'sponsor';
  emailTo: string;
}

export function ContactForm({ formType, emailTo }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacyAccepted: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formTitles = {
    general: 'Kontaktformular',
    artist: 'Anfrage für Künstler',
    sponsor: 'Anfrage für Förderer',
  };

  const subjectOptions = {
    general: [
      'Allgemeine Anfrage',
      'Frage zu Veranstaltungen',
      'Technische Fragen',
      'Sonstiges',
    ],
    artist: [
      'Auftrittanfrage',
      'Technische Informationen',
      'Terminanfrage',
      'Sonstiges',
    ],
    sponsor: [
      'Interesse an Förderung',
      'Sponsoring-Möglichkeiten',
      'Kooperationsanfrage',
      'Sonstiges',
    ],
  };

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
    setIsLoading(true);
    setError('');
    try {
      const payload = { ...formData, formType };
      console.log('[ContactForm] Sending payload:', JSON.stringify(payload));
      const res = await fetch('/api/send/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('[ContactForm] Response:', res.status, JSON.stringify(data));
      if (!res.ok || !data.success) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[ContactForm] Error:', err);
      setError(`Fehler: ${err.message || 'Unbekannter Fehler'}. Bitte versuchen Sie es später erneut.`);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = 
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.subject !== '' &&
    formData.message.trim() !== '' &&
    formData.privacyAccepted;

  if (isSubmitted) {
    return (
      <div className="bg-[#6b8e6f] rounded-lg p-8 lg:p-12 text-center text-white">
        <CheckCircle className="h-16 w-16 mx-auto mb-4" />
        <h3 className="font-['Playfair_Display',serif] text-2xl mb-3">
          Vielen Dank für Ihre Nachricht!
        </h3>
        <p className="text-white/90 font-['Inter',sans-serif]">
          Wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8 lg:p-10 border border-[rgba(107,142,111,0.2)]">
      <h3 className="font-['Playfair_Display',serif] text-2xl lg:text-3xl text-[#2d2d2d] mb-6">
        {formTitles[formType]}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
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
            Telefon (optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
            placeholder="+49 123 456789"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
            Betreff <span className="text-[#8b4454]">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif]"
          >
            <option value="">Bitte wählen</option>
            {subjectOptions[formType].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm text-[#666666] mb-2 font-['Inter',sans-serif]">
            Nachricht <span className="text-[#8b4454]">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full rounded-md border border-[rgba(107,142,111,0.3)] bg-white px-4 py-3 text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#6b8e6f] font-['Inter',sans-serif] resize-y"
            placeholder={
              formType === 'artist'
                ? 'Bitte beschreiben Sie kurz Ihr künstlerisches Programm, Ihre Besetzung und mögliche Termine...'
                : formType === 'sponsor'
                ? 'Bitte beschreiben Sie Ihr Interesse an einer Zusammenarbeit...'
                : 'Ihre Nachricht an uns...'
            }
          />
        </div>

        {/* Privacy Policy */}
        <div className="flex items-start gap-3">
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
            zur Kenntnis genommen. Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und für 
            Rückfragen dauerhaft gespeichert werden. <span className="text-[#8b4454]">*</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-6 py-4 transition-colors font-['Inter',sans-serif] ${
              isFormValid && !isLoading
                ? 'bg-[#6b8e6f] text-white hover:bg-[#5a7a5e]'
                : 'bg-[#e8e4df] text-[#999999] cursor-not-allowed'
            }`}
          >
            <Send className="h-5 w-5" />
            {isLoading ? 'Wird gesendet...' : 'Nachricht senden'}
          </button>
          {error && (
            <p className="text-sm text-red-600 text-center mt-3 font-['Inter',sans-serif]">{error}</p>
          )}
          <p className="text-xs text-[#999999] text-center mt-3 font-['Inter',sans-serif]">
            * Pflichtfelder
          </p>
        </div>
      </form>
    </div>
  );
}
