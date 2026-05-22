import { Link } from "@/i18n/navigation";

import { DiscographyCard } from "@/components/DiscographyCard";
import type { BrandValue } from "@/lib/brands";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  brandRecentDiscographyQuery,
  brandScopeRecentDiscographyQuery,
} from "@/sanity/lib/queries";
import type { DiscographyEntry } from "@/sanity/types";

export async function BrandDiscographyPreview({
  brand,
  scopeSlug,
  limit = 5,
  title = "Discography",
  moreHref,
  entries: providedEntries,
}: {
  brand: BrandValue;
  scopeSlug?: string;
  limit?: number;
  title?: string;
  moreHref?: string;
  entries?: DiscographyEntry[] | null;
}) {
  const useProvided = providedEntries && providedEntries.length > 0;

  const entries = useProvided
    ? providedEntries.slice(0, limit)
    : await sanityFetch<DiscographyEntry[]>({
        query: scopeSlug
          ? brandScopeRecentDiscographyQuery
          : brandRecentDiscographyQuery,
        params: scopeSlug ? { brand, scopeSlug, limit } : { brand, limit },
        tags: scopeSlug
          ? ["discographyEntry", `brand:${brand}`, `scope:${scopeSlug}`]
          : ["discographyEntry", `brand:${brand}`],
      }).catch(() => []);

  const href =
    moreHref ??
    (scopeSlug
      ? `/discography?brand=${brand}&scope=${scopeSlug}`
      : `/discography?brand=${brand}`);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 md:py-20 lg:px-12">
      <header className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h2>
        <Link
          href={href}
          className="text-sm text-foreground/60 underline-offset-4 hover:text-foreground hover:underline"
        >
          더보기 →
        </Link>
      </header>

      {entries.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-black/15 p-6 text-sm text-foreground/50 dark:border-white/15">
          아직 등록된 작업이 없습니다.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8">
          {entries.map((entry) => (
            <li key={entry._id}>
              <DiscographyCard entry={entry} showBrand={false} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
