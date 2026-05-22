import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactCta } from "@/components/ContactCta";
import { DiscographyCard } from "@/components/DiscographyCard";
import { DiscographyFilters } from "@/components/DiscographyFilters";
import { Pagination } from "@/components/Pagination";
import { isBrandValue } from "@/lib/brands";
import { contentResolver, getPageContent } from "@/lib/pageContent";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  discographyCountQuery,
  discographyListQuery,
  scopesUsedByBrandQuery,
} from "@/sanity/lib/queries";
import type { DiscographyEntry, WorkScopeRef } from "@/sanity/types";

const PAGE_SIZE = 10;

type SearchParams = {
  brand?: string;
  scope?: string;
  page?: string;
};

export default async function DiscographyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

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

  const t = await getTranslations("Discography");
  const c = await getPageContent("discographyPage");
  const cx = contentResolver(c, locale, t);

  const [entries, total, scopeOptions] = await Promise.all([
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
    <>
      <section className="mx-auto max-w-7xl px-8 pt-16 md:pt-20 lg:px-14">
        <div className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-[280px_1fr]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-foreground/45">
              {cx("label")}
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-[26px]">
              {cx("title")}
            </h1>
          </div>
          <p className="self-end text-xs leading-relaxed text-foreground/55">
            {cx("description")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 pt-10 lg:px-14">
        <DiscographyFilters
          activeBrand={brand}
          activeScope={scopeSlug}
          scopeOptions={scopeOptions}
        />
      </section>

      <section className="mx-auto max-w-7xl px-8 pt-10 pb-4 lg:px-14">
        {entries.length === 0 ? (
          <p className="bg-foreground/3 px-6 py-10 text-center text-sm text-foreground/55">
            {cx("empty")}
          </p>
        ) : (
          <>
            <div className="mb-6 flex items-baseline justify-between">
              <span className="text-xs text-foreground/45">
                {cx("totalLabel")}{" "}
                <span className="font-semibold text-foreground">{total}</span>
                {cx("totalUnit")}
              </span>
              <span className="text-xs text-foreground/45">
                {t("pageOf", { current: pageNum, total: totalPages })}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6">
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

      <ContactCta />
    </>
  );
}
