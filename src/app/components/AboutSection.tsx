import React from "react";
import { Heart, Users, Music, House, Award, Calendar, MapPin, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCmsPage } from '../hooks/useCmsPage';

interface AboutContent {
  header: { title: string; description: string };
  history: { title: string; paragraphs: string[] };
  timeline: Array<{ year: string; title: string; description: string }>;
  stats: Array<{ value: string; label: string }>;
  values: Array<{ icon: string; title: string; description: string }>;
}

const defaultContent: AboutContent = {
  header: { title: 'Über die Alte Post', description: 'Die KleinKunstKneipe Alte Post Brensbach e.V.' },
  history: { title: 'Unsere Geschichte', paragraphs: [] },
  timeline: [],
  stats: [
    { value: '30+', label: 'Jahre Kulturarbeit' },
    { value: '3.000+', label: 'Veranstaltungen' },
    { value: '80', label: 'Plätze für Intimität' },
  ],
  values: [],
};

const iconMap: Record<string, any> = { heart: Heart, users: Users, music: Music, home: House };

export function AboutSection() {
  const { content } = useCmsPage<AboutContent>('about', defaultContent);

  const values = content.values.length > 0 ? content.values.map(v => ({
    icon: iconMap[v.icon] || Heart,
    title: v.title,
    description: v.description,
  })) : [
    { icon: Heart, title: 'Leidenschaft für Kultur', description: 'Seit über 30 Jahren fördern wir Kleinkunst.' },
    { icon: Users, title: 'Gemeinschaft', description: 'Getragen von Mitgliedern und ehrenamtlichem Engagement.' },
    { icon: Music, title: 'Vielfältiges Programm', description: 'Von Jazz über Kabarett bis Theater.' },
    { icon: House, title: 'Intimität & Atmosphäre', description: 'Kunst hautnah erleben.' },
  ];

  const milestones = content.timeline.length > 0 ? content.timeline : [
    { year: '1994', title: 'Gründung des Vereins', description: 'Engagierte Kulturliebhaber gründeten die KleinKunstKneipe.' },
    { year: '2024', title: '30 Jahre Alte Post', description: 'Über 3.000 Veranstaltungen.' },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-[#faf9f7]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
            {content.header.title}
          </h2>
          <p className="text-lg text-[#666666] max-w-3xl mx-auto leading-relaxed">
            {content.header.description}
          </p>
        </div>

        {/* Values grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6b8e6f] text-white mb-4">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d] mb-2">
                  {value.title}
                </h3>
                <p className="text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* History section */}
        <div className="bg-white rounded-lg p-8 lg:p-12 border border-[rgba(107,142,111,0.2)] mb-12">
          <h3 className="font-['Playfair_Display',serif] text-3xl text-[#2d2d2d] mb-6">
            {content.history.title}
          </h3>
          <div className="space-y-4 text-[#666666] leading-relaxed font-['Inter',sans-serif]">
            {content.history.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg p-8 lg:p-12 border border-[rgba(107,142,111,0.2)]">
          <h3 className="font-['Playfair_Display',serif] text-3xl text-[#2d2d2d] mb-8">
            Meilensteine unserer Geschichte
          </h3>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#6b8e6f] text-white">
                    <span className="font-['Playfair_Display',serif] font-bold">
                      {milestone.year.slice(2)}
                    </span>
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="ml-8 mt-2 h-16 w-0.5 bg-[rgba(107,142,111,0.3)]" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Landmark className="h-5 w-5 text-[#6b8e6f]" />
                    <h4 className="font-['Playfair_Display',serif] text-xl text-[#2d2d2d]">
                      {milestone.year} - {milestone.title}
                    </h4>
                  </div>
                  <p className="text-[#666666] leading-relaxed font-['Inter',sans-serif]">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facts & Figures */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {content.stats.map((stat, index) => (
            <div key={index} className={`${index === 1 ? 'bg-[#8b4558]' : 'bg-[#6b8e6f]'} rounded-lg p-6 text-white text-center`}>
              {index === 0 && <Calendar className="h-12 w-12 mx-auto mb-3 opacity-90" />}
              {index === 1 && <Award className="h-12 w-12 mx-auto mb-3 opacity-90" />}
              {index === 2 && <MapPin className="h-12 w-12 mx-auto mb-3 opacity-90" />}
              <div className="font-['Playfair_Display',serif] text-4xl mb-1">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Sponsors acknowledgment */}
        <div className="mt-12 bg-white rounded-lg p-8 border border-[rgba(107,142,111,0.2)] text-center">
          <h3 className="font-['Playfair_Display',serif] text-2xl text-[#2d2d2d] mb-4">
            Dank an unsere Unterstützer
          </h3>
          <p className="text-[#666666] leading-relaxed max-w-2xl mx-auto mb-6 font-['Inter',sans-serif]">
            Unser Dank gilt allen Förderern, Sponsoren und Partnern, die unsere Kulturarbeit 
            seit über 30 Jahren möglich machen. Ihre Unterstützung ermöglicht es uns, hochwertige 
            Kleinkunst im Odenwald anzubieten.
          </p>
          <Link
            to="/sponsors"
            className="inline-flex items-center text-[#6b8e6f] hover:text-[#5a7a5e] transition-colors font-['Inter',sans-serif]"
          >
            Zu unseren Unterstützern & Förderern
            <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}