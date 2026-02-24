import React from "react";
import { Link } from "react-router-dom";
import { Home, Ticket, Calendar, Phone } from "lucide-react";

const quickLinks = [
  { to: "/tickets", label: "Programm", icon: Ticket },
  { to: "/belegungsplan", label: "Kalender", icon: Calendar },
  { to: "/kontakt", label: "Kontakt", icon: Phone },
];

export function NotFoundPage() {
  return (
    <div className="bg-[#faf9f7] min-h-[60vh] flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-lg mx-auto">
        <p className="font-['Playfair_Display'] text-[10rem] leading-none font-bold text-[#6b8e6f]/20 select-none">
          404
        </p>
        <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#2d3e2f] mt-2 mb-4">
          Seite nicht gefunden
        </h1>
        <p className="text-[#5a6b5c] mb-10 text-lg">
          Die gesuchte Seite existiert leider nicht. Vielleicht finden Sie hier, was Sie suchen:
        </p>

        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          {quickLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 px-5 py-3 border border-[#6b8e6f]/30 rounded-lg text-[#2d3e2f] hover:border-[#6b8e6f] hover:bg-[#6b8e6f]/5 transition-colors"
            >
              <Icon className="w-4 h-4 text-[#6b8e6f]" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#6b8e6f] text-white px-6 py-3 rounded-lg hover:bg-[#5a7d5e] transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
