import React from "react";
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instant, not smooth: the site sets `scroll-behavior: smooth`, and a smooth
    // scroll from far down the previous page gets cut short when the new page swaps
    // its loading state for content, leaving visitors at the footer.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}
