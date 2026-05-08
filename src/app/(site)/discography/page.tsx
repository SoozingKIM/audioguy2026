import { DiscographyCard } from "@/components/DiscographyCard";
import { DiscographyFilters } from "@/components/DiscographyFilters";
import { HeroImage } from "@/components/HeroImage";
import { Pagination } from "@/components/Pagination";
import { isBrandValue } from "@/lib/brands";
import { getPageImages } from "@/lib/pageImages";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  discographyCountQuery,
  discographyListQuery,
  scopesUsedByBrandQuery,
} from "@/sanity/lib/queries";
import type { DiscographyEntry, WorkScopeRef } from "@/sanity/types";

const PAGE_SIZE = 12;

type SearchParams = {
  brand?: string;
  scope?: string;
  page?: string;
};

export default async function DiscographyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const brand = isBrandValue(sp.brand) ? sp.brand : undefined;
  const scopeSlug = brand && sp.scope ? sp.scope : undefined;
  const pageNum = Math.max(1, Number(sp.page) || 1);
  const start = (pageNum - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const queryParams = {
    brand: brand ?? null,
    scopeSlug: scopeSlug ?? null,
    start,
    end,
  };

  const [{ hero }, entries, total, scopeOptions] = await Promise.all([
    getPageImages("discographyPage"),
    sanityFetch<DiscographyEntry[]>({
      query: discographyListQuery,
      params: queryParams,
      tags: ["discographyEntry"],
    }).catch(() => []),
    sanityFetch<number>({
      query: discographyCountQuery,
      params: { brand: brand ?? null, scopeSlug: scopeSlug ?? null },
      tags: ["discographyEntry"],
    }).catch(() => 0),
    brand
      ? sanityFetch<WorkScopeRef[]>({
          query: scopesUsedByBrandQuery,
          params: { brand },
          tags: ["discographyEntry", "workScope"],
        }).catch(() => [])
      : Promise.resolve([] as WorkScopeRef[]),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <HeroImage image={hero} alt="Discography" priority />

      <section className="mx-auto max-w-6xl px-6 pb-8 pt-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Discography
        </h1>
        <p className="mt-6 text-lg text-foreground/70">
          오디오가이가 함께한 작업물.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <DiscographyFilters
          activeBrand={brand}
          activeScope={scopeSlug}
          scopeOptions={scopeOptions}
        />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        {entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-black/15 p-6 text-sm text-foreground/50 dark:border-white/15">
            조건에 맞는 작업이 없습니다.
          </p>
        ) : (
          <>
            <div className="mb-6 text-xs text-foreground/50">
              총 {total}개 · {pageNum} / {totalPages} 페이지
            </div>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
              {entries.map((entry) => (
                <li key={entry._id}>
                  <DiscographyCard entry={entry} />
                </li>
              ))}
            </ul>
            <Pagination
              basePath="/discography"
              searchParams={{ brand, scope: scopeSlug }}
              page={pageNum}
              totalPages={totalPages}
            />
          </>
        )}
      </section>
    </div>
  );
}
