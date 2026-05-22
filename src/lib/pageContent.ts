import { groq } from "next-sanity";

import { sanityFetch } from "@/sanity/lib/fetch";

/** A localized field's values as stored in Sanity (ko / en / jp). */
export type LocaleValues = {
  ko?: string | null;
  en?: string | null;
  jp?: string | null;
};

/** A localized field (may be absent on the document). */
export type LocaleField = LocaleValues | null;

/** Page content document — a loose map of localized fields keyed by field name. */
export type PageContent = Record<string, LocaleField> | null;

const pageContentQuery = groq`*[_type == $docType][0]`;

/** Fetches a page singleton's editable content (localized text fields). */
export async function getPageContent(docType: string): Promise<PageContent> {
  return sanityFetch<PageContent>({
    query: pageContentQuery,
    params: { docType },
    tags: [docType],
  }).catch(() => null);
}

/**
 * Resolves a localized Sanity field to the active locale, falling back to the
 * Korean value and finally to `fallback` (typically the i18n message default).
 */
export function localized(
  field: LocaleField | undefined,
  locale: string,
  fallback = "",
): string {
  if (!field) return fallback;
  const value = field[locale as keyof LocaleValues] || field.ko;
  return (value ?? "").trim() || fallback;
}

/**
 * Turns an i18n message path into a Sanity field name: dotted paths become
 * camelCase (e.g. `scale.stat1Label` → `scaleStat1Label`); flat keys are
 * unchanged. The seed script uses the same transform, so the two stay in sync.
 */
export function toFieldName(path: string): string {
  return path.replace(/\.(\w)/g, (_, c: string) => c.toUpperCase());
}

/**
 * Builds a `cx(path)` resolver bound to a page's Sanity content, the active
 * locale, and the page's i18n translator. `cx("hero.title")` returns the
 * Sanity-managed value (by field name `heroTitle`), falling back to the message
 * default. Drop-in replacement for `t(...)` on editable content strings.
 */
export function contentResolver(
  content: PageContent,
  locale: string,
  t: (key: string) => string,
): (path: string) => string {
  return (path: string) => localized(content?.[toFieldName(path)], locale, t(path));
}
