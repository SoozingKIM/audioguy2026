"use client";

import Image from "next/image";
import { useState } from "react";

import { findSlot, imageUrl } from "@/lib/pageImages";
import type { ImageSlot } from "@/sanity/types";

export type DspBrand = { name: string; logoKey: string };
export type DspTab = { label: string; brands: DspBrand[] };

export function DspTabs({
  tabs,
  slots,
}: {
  tabs: DspTab[];
  slots: ImageSlot[];
}) {
  const [active, setActive] = useState(0);

  return (
    <>
      <div className="mt-10 flex justify-center">
        <div className="flex gap-1 rounded-2xl bg-[#222328] p-1 text-[15px] md:text-[18px]">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={`rounded-xl px-5 py-2.5 font-medium transition-colors ${
                i === active
                  ? "bg-background-white text-foreground"
                  : "text-secondary hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {tabs[active]?.brands.map((brand) => {
          const logo = imageUrl(findSlot(slots, brand.logoKey)?.image, 240);
          return (
            <div
              key={brand.name}
              className="flex h-[180px] flex-col items-center justify-center gap-5 bg-[#222328] md:h-[260px]"
            >
              {/* Brand logo slot (Sanity key: brand.logoKey). White circle
                  placeholder shows until a logo is uploaded. */}
              <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-white md:size-28">
                {logo ? (
                  <Image
                    src={logo}
                    alt={brand.name}
                    fill
                    sizes="112px"
                    className="object-contain p-2.5"
                  />
                ) : null}
              </div>
              <p className="text-lg font-semibold tracking-[-0.23px] text-white md:text-[23px]">
                {brand.name}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
