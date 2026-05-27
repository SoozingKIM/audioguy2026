"use client";

import { useEffect } from "react";

/**
 * Reveals elements marked `data-reveal` (fade + rise from below) as they scroll
 * into view. Mount it once on a page; it observes that page's `[data-reveal]`
 * nodes. Self-contained inline styles — reduced-motion / no-JS leaves content
 * fully visible, and elements already on screen at load show without animating.
 */
export function SectionReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "none";
            obs.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    const vh = window.innerHeight;
    for (const el of els) {
      el.style.transition =
        "opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1), transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)";
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.88 && rect.bottom > 0) {
        // On screen at load → show immediately (no flash, no animation).
        continue;
      }
      el.style.opacity = "0";
      el.style.transform = "translateY(48px)";
      io.observe(el);
    }

    return () => io.disconnect();
  }, []);

  return null;
}
