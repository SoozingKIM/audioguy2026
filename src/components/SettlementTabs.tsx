"use client";

import { useState } from "react";

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

  return (
    <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-[210px_1fr]">
      <div className="flex flex-col gap-7">
        {panels.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`text-left text-2xl font-bold leading-[1.2] tracking-[-0.28px] transition-colors md:text-[28px] ${
              i === active
                ? "text-foreground"
                : "text-disabled hover:text-secondary"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="relative h-[380px] w-full overflow-hidden bg-[#edeff2]">
        {panels.map((p, i) =>
          p.src ? (
            <div
              key={p.label}
              aria-hidden={i !== active}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${
                i === active ? "opacity-100" : "pointer-events-none opacity-0"
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
