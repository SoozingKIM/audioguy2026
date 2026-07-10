"use client";

import { useState } from "react";

import { SlotImage } from "@/components/SlotImage";
import { findSlot, imageUrl } from "@/lib/pageImages";
import type { ImageSlot } from "@/sanity/types";

export type StudioSlide = {
  slotKey: string;
  /** Local /public fallback used when no Sanity image is set. */
  fallbackSrc?: string;
};

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

export function StudioCarousel({
  slides,
  slots,
  alt,
  imageNeeded,
  prevLabel,
  nextLabel,
}: {
  slides: StudioSlide[];
  slots: ImageSlot[];
  alt: string;
  imageNeeded: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const go = (delta: number) => setIndex((p) => (p + delta + count) % count);

  return (
    <div className="mt-10">
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-background-white">
        {slides.map((slide, i) => {
          const hasImage =
            !!imageUrl(findSlot(slots, slide.slotKey)?.image) ||
            !!slide.fallbackSrc;
          return (
            <div
              key={slide.slotKey}
              className={`absolute inset-0 transition-opacity duration-500 ${
                i === index ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              {hasImage ? (
                <SlotImage
                  slots={slots}
                  slotKey={slide.slotKey}
                  fallbackSrc={slide.fallbackSrc}
                  alt={`${alt} ${i + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-[15px] font-semibold text-[#f23838] md:text-[18px]">
                    {imageNeeded}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-5 text-white">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={prevLabel}
            className="opacity-50 transition hover:opacity-100"
          >
            <Chevron dir="left" />
          </button>
          <span className="relative h-1 w-[60px] overflow-hidden rounded-full bg-white/20">
            <span
              className="absolute top-0 h-full rounded-full bg-white transition-all duration-300"
              style={{ width: `${100 / count}%`, left: `${(100 / count) * index}%` }}
            />
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={nextLabel}
            className="opacity-50 transition hover:opacity-100"
          >
            <Chevron dir="right" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
