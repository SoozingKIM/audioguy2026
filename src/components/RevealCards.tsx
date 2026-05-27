"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

/**
 * Scoped scroll reveal for the home brand cards: each `[data-card]` child lifts
 * + fades in as it enters the viewport, with a small stagger. Self-contained
 * (inline styles, no global CSS); cards already on screen at load stay shown
 * with no flash, and reduced-motion / no-JS leaves everything visible.
 */
export function RevealCards({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>("[data-card]"),
    );
    if (cards.length === 0) return;

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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    const vh = window.innerHeight;
    cards.forEach((card, i) => {
      card.style.transition = `opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s, transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`;
      const rect = card.getBoundingClientRect();
      if (rect.top < vh * 0.85 && rect.bottom > 0) {
        // On screen at load → show immediately (no flash).
        card.style.opacity = "1";
        card.style.transform = "none";
      } else {
        card.style.opacity = "0";
        card.style.transform = "translateY(32px)";
        io.observe(card);
      }
    });

    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
