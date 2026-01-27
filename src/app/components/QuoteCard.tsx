import React from "react";
import { Quote } from 'lucide-react';

interface QuoteCardProps {
  text: string;
  author: string;
  role?: string;
}

export function QuoteCard({ text, author, role }: QuoteCardProps) {
  return (
    <div className="bg-[#faf9f7] rounded-lg p-6 lg:p-8 border border-[rgba(107,142,111,0.2)] relative">
      <Quote className="h-8 w-8 text-[#6b8e6f] opacity-30 mb-4" />
      <blockquote className="text-[#2d2d2d] leading-relaxed mb-4 font-['Inter',sans-serif] italic">
        "{text}"
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#6b8e6f] flex items-center justify-center text-white font-['Playfair_Display',serif]">
          {author.charAt(0)}
        </div>
        <div>
          <div className="text-[#2d2d2d] font-['Inter',sans-serif]">{author}</div>
          {role && (
            <div className="text-sm text-[#666666] font-['Inter',sans-serif]">{role}</div>
          )}
        </div>
      </div>
    </div>
  );
}
