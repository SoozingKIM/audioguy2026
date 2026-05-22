"use client";

import { useEffect, useRef, useState } from "react";

import { SlotImage } from "@/components/SlotImage";
import type { ImageSlot } from "@/sanity/types";

export type PeopleMember = {
  slotKey: string;
  fallbackSrc: string;
  name: string;
  role: string;
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

export function PeopleCarousel({
  members,
  slots,
  prevLabel,
  nextLabel,
}: {
  members: PeopleMember[];
  slots: ImageSlot[];
  prevLabel: string;
  nextLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [fill, setFill] = useState({ width: 100, left: 0 });

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
    const viewRatio = Math.min(1, el.clientWidth / el.scrollWidth);
    const progress = max > 0 ? el.scrollLeft / max : 0;
    setFill({ width: viewRatio * 100, left: progress * (100 - viewRatio * 100) });
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scrollByView = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const hasOverflow = !(atStart && atEnd);

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={update}
        className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {members.map((m) => (
          <div
            key={m.name}
            className="shrink-0 basis-[70%] snap-start sm:basis-[45%] lg:basis-[28%]"
          >
            <div className="relative aspect-[41/50] overflow-hidden bg-background-white">
              <SlotImage
                slots={slots}
                slotKey={m.slotKey}
                fallbackSrc={m.fallbackSrc}
                alt={m.name}
                fill
                sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 70vw"
                className="object-cover"
              />
            </div>
            <div className="mt-3">
              <p className="text-lg font-medium tracking-[-0.22px] text-foreground md:text-[22px]">
                {m.name}
              </p>
              <p className="text-[13px] tracking-[-0.13px] text-secondary">
                {m.role}
              </p>
            </div>
          </div>
        ))}
      </div>

      {hasOverflow ? (
        <div className="mt-10 flex items-center justify-center gap-5 text-foreground">
          <button
            type="button"
            onClick={() => scrollByView(-1)}
            disabled={atStart}
            aria-label={prevLabel}
            className="transition hover:opacity-100 disabled:opacity-25"
          >
            <Chevron dir="left" />
          </button>
          <span className="relative h-1 w-14 overflow-hidden rounded-full bg-foreground/15">
            <span
              className="absolute top-0 h-full rounded-full bg-foreground transition-all duration-300"
              style={{ width: `${fill.width}%`, left: `${fill.left}%` }}
            />
          </span>
          <button
            type="button"
            onClick={() => scrollByView(1)}
            disabled={atEnd}
            aria-label={nextLabel}
            className="transition hover:opacity-100 disabled:opacity-25"
          >
            <Chevron dir="right" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
