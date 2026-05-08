import Image from "next/image";

import { imageUrl } from "@/lib/pageImages";
import type { SanityImage } from "@/sanity/types";

export function HeroImage({
  image,
  alt,
  className,
  priority,
}: {
  image: SanityImage | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const url = imageUrl(image, 2000, 1100);
  if (!url) {
    return (
      <div
        className={
          className ??
          "relative aspect-[16/9] w-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900"
        }
        aria-hidden
      />
    );
  }
  return (
    <div
      className={
        className ?? "relative aspect-[16/9] w-full overflow-hidden bg-black/5"
      }
    >
      <Image
        src={url}
        alt={image?.alt ?? alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
