"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates the numeric portion of a stat value (e.g. "25년", "500+",
 * "1,000+", "38,000") counting up from 0 to its target when scrolled into
 * view. Any non-numeric prefix/suffix ("년", "+", …) is preserved, and the
 * original thousands-separator formatting is reproduced during the count.
 */
export function CountUpStat({
  value,
  className,
  duration = 1600,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = value.match(/^(\D*)([\d,]+)(.*)$/);
    const node = ref.current;
    if (!node || !match) {
      setDisplay(value);
      return;
    }

    const [, prefix, numberPart, suffix] = match;
    const target = Number(numberPart.replace(/,/g, ""));
    const useGrouping = numberPart.includes(",");
    const format = (n: number) =>
      `${prefix}${useGrouping ? n.toLocaleString("en-US") : String(n)}${suffix}`;

    // Respect reduced-motion: show the final value without animating.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(format(target));
      return;
    }

    setDisplay(format(0));
    let raf = 0;
    let start = 0;
    let done = false;

    const run = () => {
      const step = (now: number) => {
        if (!start) start = now;
        const t = Math.min((now - start) / duration, 1);
        // easeOutCubic for a natural deceleration
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(format(Math.round(eased * target)));
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !done) {
          done = true;
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <p ref={ref} className={className}>
      {display}
    </p>
  );
}
