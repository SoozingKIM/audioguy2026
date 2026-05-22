import { groq } from "next-sanity";

import { sanityFetch } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import type { ImageSlot, PageImages, SanityImage } from "@/sanity/types";

const pageDocQuery = groq`*[_type == $docType][0]`;

/**
 * Returns a page's hero image plus a flattened list of all image slots. Image
 * slots may live in one `images` array or in several per-section arrays — every
 * array of `imageSlot` on the document is merged, so callers still look up by key.
 */
export async function getPageImages(docType: string): Promise<PageImages> {
  const doc = await sanityFetch<Record<string, unknown> | null>({
    query: pageDocQuery,
    params: { docType },
    tags: [docType],
  }).catch(() => null);

  if (!doc) return { hero: null, images: [] };

  const images = Object.values(doc)
    .flatMap((v) => (Array.isArray(v) ? v : []))
    .filter(
      (x): x is ImageSlot =>
        !!x && typeof x === "object" && (x as { _type?: string })._type === "imageSlot",
    );

  return { hero: (doc.heroImage as SanityImage) ?? null, images };
}

export function findSlot(
  slots: ImageSlot[],
  key: string,
): ImageSlot | undefined {
  return slots.find((s) => s.key === key);
}

export function imageUrl(
  image: SanityImage | null | undefined,
  width = 1600,
  height?: number,
): string | null {
  if (!image) return null;
  let builder = urlFor(image).width(width).auto("format");
  if (height) builder = builder.height(height).fit("crop");
  return builder.url();
}
