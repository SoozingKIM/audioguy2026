"use client";

import { useState } from "react";

import { SlotImage } from "@/components/SlotImage";
import { findSlot, imageUrl } from "@/lib/pageImages";
import type { ImageSlot } from "@/sanity/types";

export type ServiceImage = {
  slotKey: string;
  /** Local /public fallback used when no Sanity image is set. */
  fallbackSrc?: string;
  alt: string;
};

export type ServiceItem = {
  id: string;
  title: string;
  label?: string;
  titleEn?: string;
  subKr?: string;
  body?: string[];
  images?: ServiceImage[];
};

export function ServiceAccordion({
  items,
  slots,
  imageNeeded,
}: {
  items: ServiceItem[];
  slots: ImageSlot[];
  imageNeeded: string;
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="mt-8 border-t border-foreground/10">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          slots={slots}
          imageNeeded={imageNeeded}
          isOpen={openId === item.id}
          onToggle={() =>
            setOpenId((cur) => (cur === item.id ? null : item.id))
          }
        />
      ))}
    </div>
  );
}

/** A single introduction row — always rendered in the "Location Recording"
 *  format: a text column (label / title / subtitle / body) beside a 2-up
 *  image column, revealed when the bar is clicked. */
function AccordionItem({
  item,
  slots,
  imageNeeded,
  isOpen,
  onToggle,
}: {
  item: ServiceItem;
  slots: ImageSlot[];
  imageNeeded: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-foreground/10">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between gap-5 py-7 text-left md:py-9"
        >
          <span className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
            {item.title}
          </span>
          <span
            aria-hidden
            className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-foreground/15 text-foreground transition-transform duration-300 md:size-11 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
      </h3>

      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid gap-x-5 gap-y-6 pb-9 md:grid-cols-2">
            <div>
              {item.label ? (
                <p className="text-[15px] leading-normal tracking-[-0.15px] text-tertiary">
                  {item.label}
                </p>
              ) : null}
              {item.titleEn ? (
                <p className="mt-3 text-lg font-semibold leading-[1.4] tracking-[-0.23px] text-foreground md:text-[23px]">
                  {item.titleEn}
                </p>
              ) : null}
              {item.subKr ? (
                <p className="mt-1 text-[15px] font-medium leading-[1.4] tracking-[-0.18px] text-secondary md:text-[18px]">
                  {item.subKr}
                </p>
              ) : null}
              {item.body ? (
                <div className="mt-5 space-y-4 text-[15px] leading-[1.5] tracking-[-0.18px] text-secondary md:text-[18px]">
                  {item.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : null}
            </div>

            {item.images ? (
              <div className="grid grid-cols-2 gap-3">
                {item.images.map((img) => (
                  <AccordionImage
                    key={img.slotKey}
                    image={img}
                    slots={slots}
                    imageNeeded={imageNeeded}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function AccordionImage({
  image,
  slots,
  imageNeeded,
}: {
  image: ServiceImage;
  slots: ImageSlot[];
  imageNeeded: string;
}) {
  const hasImage =
    !!imageUrl(findSlot(slots, image.slotKey)?.image) || !!image.fallbackSrc;

  return (
    <div className="relative aspect-4/3 overflow-hidden bg-foreground/3">
      {hasImage ? (
        <SlotImage
          slots={slots}
          slotKey={image.slotKey}
          fallbackSrc={image.fallbackSrc}
          alt={image.alt}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-sm font-semibold text-red-500">
            {imageNeeded}
          </span>
        </div>
      )}
    </div>
  );
}
