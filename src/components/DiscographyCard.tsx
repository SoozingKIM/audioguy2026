import Image from "next/image";
import Link from "next/link";

import { BrandBadge } from "@/components/BrandBadge";
import { formatReleaseDate } from "@/lib/format";
import { imageUrl } from "@/lib/pageImages";
import type { DiscographyEntry } from "@/sanity/types";

export function DiscographyCard({
  entry,
  showBrand = true,
}: {
  entry: DiscographyEntry;
  showBrand?: boolean;
}) {
  const cover = imageUrl(entry.cover, 600, 600);
  const scopes = entry.scopes?.map((s) => s.title).join(", ");
  const inner = (
    <>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
        {cover ? (
          <Image
            src={cover}
            alt={entry.cover?.alt ?? entry.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : null}
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <div className="text-xs text-foreground/50">
          {formatReleaseDate(entry.releaseDate)}
        </div>
        <div className="text-sm font-medium leading-tight">{entry.title}</div>
        <div className="text-xs text-foreground/70">{entry.artist}</div>
        {scopes ? (
          <div className="text-xs text-foreground/50">{scopes}</div>
        ) : null}
        {showBrand ? (
          <div className="mt-1">
            <BrandBadge brand={entry.brand} size="xs" />
          </div>
        ) : null}
      </div>
    </>
  );

  if (entry.externalUrl) {
    return (
      <a
        href={entry.externalUrl}
        target="_blank"
        rel="noreferrer"
        className="group block"
      >
        {inner}
      </a>
    );
  }
  return <div className="group">{inner}</div>;
}

export function DiscographyCardLink({
  entry,
  showBrand,
}: {
  entry: DiscographyEntry;
  showBrand?: boolean;
}) {
  // Reserved for future internal entry detail page
  return (
    <Link
      href={`/discography?brand=${entry.brand}`}
      className="group block"
      aria-label={entry.title}
    >
      <DiscographyCard entry={entry} showBrand={showBrand} />
    </Link>
  );
}
