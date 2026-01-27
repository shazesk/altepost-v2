import React from "react";
import { Heart, Users, Music, House, Award, Calendar, MapPin, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutSection() {
  const values = [
    {
      icon: Heart,
      title: 'Leidenschaft für Kultur',
      description: 'Seit über 30 Jahren fördern wir Kleinkunst und schaffen Raum für künstlerische Begegnungen.',
    },
    {
      icon: Users,
      title: 'Gemeinschaft',
      description: 'Wir sind ein gemeinnütziger Verein, getragen von Mitgliedern und ehrenamtlichem Engagement.',
    },
    {
      icon: Music,
      title: 'Vielfältiges Programm',
      description: 'Von Jazz über Kabarett bis Theater – wir bieten ein abwechslungsreiches Kulturprogramm.',
    },
    {
      icon: House,
      title: 'Intimität & Atmosphäre',
      description: 'In historischem Ambiente erleben Sie Kunst hautnah – persönlich und authentisch.',
    },
  ];

  const milestones = [
    {
      year: '1994',
      title: 'Gründung des Vereins',
      description: 'Engagierte Kulturliebhaber aus Brensbach und Umgebung gründeten die KleinKunstKneipe Alte Post e.V. und erweckten das historische Postgebäude zu neuem Leben.',
    },
    {
      year: '1995',
      title: 'Erste Veranstaltungsreihe',
      description: 'Mit einem vielfältigen Programm aus Kabarett, Musik und Theater etablierte sich die Alte Post als wichtiger Kulturort im Odenwald.',
    },
    {
      year: '2000',
      title: 'Ausbau und Modernisierung',
      description: 'Umfassende Renovierungsarbeiten erhielten den historischen Charme, verbesserten aber die technischen Möglichkeiten für zeitgemäße Veranstaltungen.',
    },
    {
      year: '2004',
      title: '10-jähriges Jubiläum',
      description: 'Mit über 100 Veranstaltungen pro Jahr hatte sich die Alte Post als feste Größe der regionalen Kulturszene etabliert.',
    },
    {
      year: '2014',
      title: '20 Jahre Kulturarbeit',
      description: 'Das Jubiläumsjahr wurde mit einer besonderen Veranstaltungsreihe und der Ehrung langjähriger Mitglieder und Unterstützer gefeiert.',
    },
    {
      year: '2024',
      title: '30 Jahre Alte Post',
      description: 'Über 3.000 Veranstaltungen später ist die Alte Post ein unverzichtbarer Teil des kulturellen Erbes des Odenwalds geworden.',
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-[#faf9f7]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-4">
            Über die Alte Post
          </h2>
          <p className="text-lg text-[#666666] max-w-3xl mx-auto leading-relaxed">
            Die KleinKunstKneipe Alte Post Brensbach e.V. wurde 1994 gegründet und ist seither 
            ein wichtiger Kulturort im Odenwald. In unserem historischen Gebäude schaffen wir 
            einen intimen Raum für hochwertige Kleinkunst – ein Ort, wo Künstler und Publikum 
            sich auf Augenhöhe begegnen.
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
            Unsere Geschichte
          </h3>
          <div className="space-y-4 text-[#666666] leading-relaxed font-['Inter',sans-serif]">
            <p>
              Die Alte Post in Brensbach blickt auf eine lange Geschichte zurück. Das historische 
              Gebäude, das einst als königlich-bayerische Poststation diente, wurde im Jahr 1994 
              von einer Gruppe engagierter Kulturliebhaber zu neuem Leben erweckt. Sie gründeten 
              den gemeinnützigen Verein KleinKunstKneipe Alte Post Brensbach e.V. mit dem Ziel, 
              im Odenwald einen Ort für hochwertige Kleinkunst zu schaffen.
            </p>
            <p>
              Seit über 30 Jahren ist die Alte Post ein fester Bestandteil des kulturellen Lebens 
              in der Region. Mit etwa 80 Sitzplätzen bieten wir eine intime Atmosphäre, die den 
              besonderen Charakter unserer Veranstaltungen ausmacht. Die geringe Distanz zwischen 
              Bühne und Publikum schafft eine einzigartige Nähe, die sowohl Künstler als auch 
              Besucher gleichermaßen zu schätzen wissen. Hier erlebt das Publikum Kunst nicht als 
              anonymer Konsument, sondern als Teil einer lebendigen Gemeinschaft.
            </p>
            <p>
              Im Laufe der Jahre haben über 3.000 Veranstaltungen in der Alten Post stattgefunden – 
              von renommierten Kabarettisten über Singer-Songwriter bis hin zu experimentellen 
              Theaterproduktionen. Nationale und internationale Künstler schätzen die besondere 
              Atmosphäre unseres Hauses und die Wertschätzung eines kulturaffinen Publikums.
            </p>
            <p>
              Als gemeinnütziger Verein leben wir von der Unterstützung unserer derzeit über 150 
              Mitglieder und der ehrenamtlichen Arbeit vieler helfender Hände. Von der technischen 
              Betreuung über die Gastronomie bis hin zur Programmgestaltung – alles wird von 
              engagierten Menschen getragen, die ihre Zeit und Energie in den Erhalt dieses 
              besonderen Kulturortes investieren. Unser Ziel ist es, hochwertige Kultur für alle 
              zugänglich zu machen und Künstlern eine Bühne zu bieten, auf der sie ihr Können 
              in authentischem Ambiente präsentieren können.
            </p>
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
          <div className="bg-[#6b8e6f] rounded-lg p-6 text-white text-center">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-90" />
            <div className="font-['Playfair_Display',serif] text-4xl mb-1">30+</div>
            <div className="text-sm opacity-90">Jahre Kulturarbeit</div>
          </div>
          <div className="bg-[#8b4558] rounded-lg p-6 text-white text-center">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-90" />
            <div className="font-['Playfair_Display',serif] text-4xl mb-1">3.000+</div>
            <div className="text-sm opacity-90">Veranstaltungen</div>
          </div>
          <div className="bg-[#6b8e6f] rounded-lg p-6 text-white text-center">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-90" />
            <div className="font-['Playfair_Display',serif] text-4xl mb-1">80</div>
            <div className="text-sm opacity-90">Sitzplätze für Nähe</div>
          </div>
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