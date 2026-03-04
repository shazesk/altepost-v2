import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";

const IMPRESSUM_URL =
  "https://app.cockpit.legal/api/cockpit/resources/legaldocumentshare/e1e3be93bef9018e3137976798abeff9/document/render/html?language=de";

export function ImpressumPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(IMPRESSUM_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.text();
      })
      .then((text) => setHtml(DOMPurify.sanitize(text)))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f7] py-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h1 className="font-['Playfair_Display',serif] text-4xl lg:text-5xl text-[#2d2d2d] mb-8">
          Impressum
        </h1>

        <div className="bg-white rounded-lg p-8 lg:p-12 font-['Inter',sans-serif]">
          {error && (
            <p className="text-[#666666]">
              Das Impressum konnte nicht geladen werden. Bitte versuchen Sie es
              später erneut.
            </p>
          )}
          {!error && !html && (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-[#e8e4df] rounded w-1/3"></div>
              <div className="h-4 bg-[#e8e4df] rounded w-2/3"></div>
              <div className="h-4 bg-[#e8e4df] rounded w-1/2"></div>
            </div>
          )}
          {html && (
            <div
              className="prose prose-stone max-w-none [&_h1]:font-['Playfair_Display',serif] [&_h2]:font-['Playfair_Display',serif] [&_h1]:text-[#2d2d2d] [&_h2]:text-[#2d2d2d] [&_p]:text-[#666666] [&_a]:text-[#6b8e6f] [&_a:hover]:text-[#5a7a5e]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
