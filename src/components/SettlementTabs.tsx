"use client";

import { useEffect, useRef, useState } from "react";

export type SettlementPanel = {
  label: string;
  /** Local /public path of the panel image; placeholder shown when omitted. */
  src?: string;
};

export function SettlementTabs({
  panels,
  imageNeeded,
}: {
  panels: SettlementPanel[];
  imageNeeded: string;
}) {
  const [active, setActive] = useState(0);

  // Sliding accent bar that travels to the active tab. We measure the active
  // button's box (offsets relative to the list) so it works regardless of how
  // the labels wrap or which locale is active.
  const listRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [bar, setBar] = useState({ top: 0, height: 0, ready: false });

  useEffect(() => {
    const measure = () => {
      const btn = btnRefs.current[active];
      if (!btn) return;
      setBar({ top: btn.offsetTop, height: btn.offsetHeight, ready: true });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, panels.length]);

  return (
    <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-[210px_1fr]">
      <div ref={listRef} className="relative flex flex-col gap-7 pl-5 pt-6 md:pt-12">
        {/* Indicator bar: slides vertically to the active tab. */}
        <span
          aria-hidden
          className={`absolute left-0 w-[3px] rounded-full bg-foreground transition-all duration-300 ease-out ${
            bar.ready ? "opacity-100" : "opacity-0"
          }`}
          style={{ top: bar.top, height: bar.height }}
        />
        {panels.map((p, i) => (
          <button
            key={p.label}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`text-left text-2xl font-bold leading-[1.2] tracking-[-0.28px] transition-all duration-300 md:text-[28px] ${
              i === active
                ? "translate-x-1 text-foreground"
                : "text-disabled hover:text-secondary"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="relative h-[500px] w-full overflow-hidden rounded-[20px] bg-white ring-1 ring-[#1b2a5b]/[0.06] shadow-[0_20px_60px_-24px_rgba(27,42,91,0.28)] md:h-[620px]">
        {panels.map((p, i) =>
          p.src ? (
            <div
              key={p.label}
              aria-hidden={i !== active}
              className={`absolute inset-6 bg-contain bg-top bg-no-repeat transition-opacity duration-300 ease-out md:inset-10 ${
                i === active
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
              style={{ backgroundImage: `url(${p.src})` }}
            />
          ) : (
            <div
              key={p.label}
              aria-hidden={i !== active}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-300 ${
                i === active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <span className="text-lg font-semibold tracking-[-0.18px] text-secondary md:text-[20px]">
                {p.label}
              </span>
              <span className="text-sm font-semibold text-[#f23838]">
                {imageNeeded}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
