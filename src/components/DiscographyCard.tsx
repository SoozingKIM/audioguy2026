import Image from "next/image";
import { Link } from "@/i18n/navigation";

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
      <div className="relative aspect-square overflow-hidden bg-black/5">
        {cover ? (
          <Image
            src={cover}
            alt={entry.cover?.alt ?? entry.title}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : null}
      </div>
      <div className="mt-4 flex flex-col gap-1.5">
        <div className="text-xs uppercase tracking-widest text-foreground/50">
          {formatReleaseDate(entry.releaseDate)}
        </div>
        <div className="text-base font-semibold leading-tight tracking-tight md:text-lg">
          {entry.title}
        </div>
        <div className="text-sm text-foreground/70">{entry.artist}</div>
        {scopes ? (
          <div className="text-xs text-foreground/50">{scopes}</div>
        ) : null}
        {showBrand ? (
          <div className="mt-2">
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
