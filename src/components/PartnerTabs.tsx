"use client";

import Image from "next/image";
import { useState } from "react";

import { findSlot, imageUrl } from "@/lib/pageImages";
import type { ImageSlot } from "@/sanity/types";

export type Partner = { name: string; logoKey: string };
export type PartnerTab = { label: string; partners: Partner[] };

export function PartnerTabs({
  tabs,
  slots,
}: {
  tabs: PartnerTab[];
  slots: ImageSlot[];
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="mt-10">
      {/* Plain text tabs, left-aligned (Figma Frame 207): 전체 / 프로덕션 / 유통 / 미디어 */}
      <div className="flex gap-5 text-[15px] md:text-[18px]">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`font-medium transition-colors ${
              i === active
                ? "font-semibold text-foreground"
                : "text-tertiary hover:text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {tabs[active]?.partners.map((p) => {
          const logo = imageUrl(findSlot(slots, p.logoKey)?.image, 240);
          return (
            <div
              key={p.name}
              className="flex h-[200px] flex-col items-center justify-center gap-5 bg-[#edeff2] px-4 md:h-[260px]"
            >
              {/* Partner logo slot (Sanity key: p.logoKey). Dark circle
                  placeholder shows until a logo is uploaded (matches Figma). */}
              <div
                className={`relative flex size-[88px] items-center justify-center overflow-hidden rounded-full md:size-28 ${
                  logo ? "bg-white" : "bg-foreground"
                }`}
              >
                {logo ? (
                  <Image
                    src={logo}
                    alt={p.name}
                    fill
                    sizes="112px"
                    className="object-contain p-2.5"
                  />
                ) : null}
              </div>
              <p className="text-lg font-semibold tracking-[-0.23px] text-foreground md:text-[23px]">
                {p.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
