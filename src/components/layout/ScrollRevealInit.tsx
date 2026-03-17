'use client';

import { useEffect } from 'react';

/**
 * Runs a global IntersectionObserver once on mount.
 * Any element with [data-reveal] will animate in (blur → clear, fade up)
 * when it enters the viewport.
 */
export function ScrollRevealInit() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target); // animate once only
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    // Observe all [data-reveal] elements present + future (re-run on route change)
    const observe = () => {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        observer.observe(el);
      });
    };

    observe();

    // Re-observe after soft navigation (Next.js App Router)
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
