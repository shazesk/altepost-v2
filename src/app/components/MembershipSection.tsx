import React from "react";
import { Users, Heart, Star, Ticket, Calendar, Newspaper, Vote, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuoteCard } from './QuoteCard';
import { motion } from 'motion/react';

const benefits = [
  {
    icon: Ticket,
    title: 'Ermäßigte Tickets',
    description: 'Genießen Sie bevorzugte Eintrittspreise bei allen Veranstaltungen.'
  },
  {
    icon: Calendar,
    title: 'Vorverkaufsrecht',
    description: 'Sichern Sie sich als Mitglied frühzeitig die besten Plätze.'
  },
  {
    icon: Newspaper,
    title: 'Programmheft',
    description: 'Erhalten Sie unser gedrucktes Programmheft direkt nach Hause.'
  },
  {
    icon: Vote,
    title: 'Mitbestimmung',
    description: 'Gestalten Sie mit Ihrem Stimmrecht die Zukunft unseres Vereins.'
  }
];

export function MembershipSection() {
  return (
    <section id="mitgliedschaft" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
            Mitglied werden
          </h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto">
            Unterstützen Sie lebendige Kleinkunst im Odenwald und werden Sie Teil unserer Kulturgemeinschaft
          </p>
        </div>

        {/* Emotional Framing */}
        <div className="mb-12 bg-white rounded-lg p-8 lg:p-12 border-2 border-[#8b4454]">
          <div className="flex items-start gap-4 mb-6">
            <Heart className="h-12 w-12 text-[#8b4454] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
                Warum Ihre Mitgliedschaft wichtig ist
              </h3>
              <div className="space-y-4 text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                <p className="text-lg text-[#2d2d2d]">
                  <strong>Ohne unsere Mitglieder gäbe es die Alte Post nicht.</strong>
                </p>
                <p>
                  Ihre Mitgliedschaft ist mehr als ein finanzieller Beitrag – sie ist ein Bekenntnis zu Kultur, 
                  Gemeinschaft und der Überzeugung, dass Kunst einen Raum braucht, in dem sie atmen kann. 
                  Einen Raum fernab von Kommerz, wo Künstler und Publikum sich auf Augenhöhe begegnen.
                </p>
                <p>
                  Mit Ihrer Unterstützung ermöglichen Sie es uns, faire Gagen zu zahlen, Eintrittspreise 
                  erschwinglich zu halten und ein Programm zu gestalten, das Qualität und Vielfalt vereint. 
                  Sie tragen dazu bei, dass es auch in Zukunft einen Ort gibt, an dem Kultur lebt.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Member Testimonial */}
        <div className="mb-12">
          <QuoteCard
            text="Die Alte Post ist für mich weit mehr als ein Veranstaltungsort. Es ist ein Stück Heimat, ein Ort der Begegnung, an dem ich Menschen treffe, die ähnlich denken und fühlen. Mitglied zu sein bedeutet, Teil von etwas Größerem zu werden."
            author="Elisabeth K."
            role="Vereinsmitglied seit 2005"
          />
        </div>

        {/* Benefits grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8b4454] text-white mb-4">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Membership cards */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] py-16 px-6 lg:px-12 mb-12">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 -left-20 w-96 h-96 bg-[#6b8e6f]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[#8b4454]/10 rounded-full blur-3xl"></div>
          </div>

          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 lg:mb-20 relative z-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#6b8e6f] px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm text-white font-['Inter',sans-serif] tracking-wider uppercase">
                Wählen Sie Ihre Mitgliedschaft
              </span>
            </div>
            <h3 className="font-['Playfair_Display',serif] text-3xl lg:text-4xl text-white mb-3">
              Investieren Sie in Kultur
            </h3>
            <p className="text-lg text-[#d9cfc1] font-['Inter',sans-serif] max-w-2xl mx-auto">
              Jede Mitgliedschaft macht einen Unterschied – wählen Sie die Option, die zu Ihnen passt
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto relative z-10">
            {/* Mitgliedschaft */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-[#2d2d2d] rounded-2xl p-8 border border-[#444444] hover:border-[#6b8e6f] transition-all"
            >
              <h3 className="font-['Playfair_Display',serif] text-2xl text-white mb-6">
                Mitgliedschaft
              </h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-[#d9cfc1] font-['Inter',sans-serif]">
                  <span className="text-[#6b8e6f] mr-2 text-xl">✓</span>
                  <span>Familiäres Vereinsleben</span>
                </li>
                <li className="flex items-start text-[#d9cfc1] font-['Inter',sans-serif]">
                  <span className="text-[#6b8e6f] mr-2 text-xl">✓</span>
                  <span>Jeder ist Willkommen</span>
                </li>
              </ul>
              <Link
                to="/mitglied-werden?type=Mitgliedschaft"
                className="block w-full text-center rounded-lg bg-[#444444] px-4 py-3 text-white hover:bg-[#6b8e6f] transition-all font-['Inter',sans-serif]"
              >
                Mitglied werden
              </Link>
            </motion.div>

            {/* Fördermitglied */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="bg-[#2d2d2d] rounded-2xl p-8 border border-[#444444] hover:border-[#d4a574] transition-all"
            >
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-5 w-5 text-[#d4a574]" />
                <h3 className="font-['Playfair_Display',serif] text-2xl text-white">
                  Fördermitglied
                </h3>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-[#d9cfc1] font-['Inter',sans-serif]">
                  <span className="text-[#d4a574] mr-2 text-xl">✓</span>
                  <span>Nennung auf der Webseite</span>
                </li>
                <li className="flex items-start text-[#d9cfc1] font-['Inter',sans-serif]">
                  <span className="text-[#d4a574] mr-2 text-xl">✓</span>
                  <span>Ehrung im Jahresprogramm</span>
                </li>
              </ul>
              <Link
                to="/mitglied-werden?type=Fördermitglied"
                className="block w-full text-center rounded-lg bg-[#444444] px-4 py-3 text-white hover:bg-[#d4a574] transition-all font-['Inter',sans-serif]"
              >
                Mitglied werden
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Additional info */}
        <div className="bg-white rounded-lg p-8 lg:p-12 border border-[rgba(107,142,111,0.2)] text-center">
          <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
            Warum Ihre Unterstützung wichtig ist
          </h3>
          <p className="text-[#666666] leading-relaxed max-w-3xl mx-auto mb-6 font-['Inter',sans-serif]">
            Als gemeinnütziger Verein sind wir auf die Unterstützung unserer Mitglieder angewiesen. 
            Jeder Beitrag hilft uns dabei, qualitativ hochwertige Kleinkunst im Odenwald zu fördern 
            und Künstlern eine Bühne zu bieten. Mit Ihrer Mitgliedschaft investieren Sie nicht nur 
            in Kultur, sondern auch in die Gemeinschaft und die kulturelle Vielfalt unserer Region.
          </p>
          <p className="text-sm text-[#666666] font-['Inter',sans-serif]">
            Ihre Mitgliedschaft ist steuerlich absetzbar. Wir stellen gerne eine Spendenbescheinigung aus.
          </p>
        </div>
      </div>
    </section>
  );
}