import Image from "next/image";

import { findSlot, imageUrl } from "@/lib/pageImages";
import type { ImageSlot } from "@/sanity/types";

export function SlotImage({
  slots,
  slotKey,
  alt,
  width = 1600,
  height,
  className,
  fill,
  sizes,
  fallbackSrc,
}: {
  slots: ImageSlot[];
  slotKey: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  /** Local /public path used when no Sanity image is set for this slot. */
  fallbackSrc?: string;
}) {
  const slot = findSlot(slots, slotKey);
  const url = imageUrl(slot?.image, width, height) ?? fallbackSrc ?? null;

  if (!url) {
    return (
      <div
        className={
          className ??
          "flex aspect-square w-full items-center justify-center bg-zinc-100 text-xs text-zinc-400"
        }
      >
        slot: {slotKey}
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={url}
        alt={slot?.alt ?? alt}
        fill
        sizes={sizes}
        className={className ?? "object-cover"}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={slot?.alt ?? alt}
      width={width}
      height={height ?? width}
      sizes={sizes}
      className={className}
    />
  );
}
