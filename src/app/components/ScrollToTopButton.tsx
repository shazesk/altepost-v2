import React from "react";
import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#6b8e6f] text-white shadow-lg hover:bg-[#5a7a5e] transition-all hover:scale-105"
      aria-label="Nach oben scrollen"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
