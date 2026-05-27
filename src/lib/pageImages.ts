import { groq } from "next-sanity";

import { dataset, projectId } from "@/sanity/env";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import type { ImageSlot, PageImages, SanityImage } from "@/sanity/types";

const pageDocQuery = groq`*[_type == $docType][0]`;

/** Build a CDN URL for a Sanity file asset (e.g. an uploaded hero video). */
export function fileUrl(file: unknown): string | null {
  const ref = (file as { asset?: { _ref?: string } } | null | undefined)?.asset
    ?._ref;
  if (!ref) return null;
  // ref form: `file-<assetId>-<ext>`
  const [, assetId, ext] = ref.split("-");
  if (!assetId || !ext) return null;
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId}.${ext}`;
}

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

  if (!doc)
    return { hero: null, heroVideo: null, heroVideoSound: false, images: [] };

  const images = Object.values(doc)
    .flatMap((v) => (Array.isArray(v) ? v : []))
    .filter(
      (x): x is ImageSlot =>
        !!x && typeof x === "object" && (x as { _type?: string })._type === "imageSlot",
    );

  return {
    hero: (doc.heroImage as SanityImage) ?? null,
    heroVideo: fileUrl(doc.heroVideo),
    heroVideoSound: !!doc.heroVideoSound,
    images,
  };
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
  // SVG assets (ref ends in `-svg`): rasterize to PNG via Sanity so next/image
  // serves them without needing `dangerouslyAllowSVG`. Raster stays auto-format.
  const ref =
    (image as { asset?: { _ref?: string } }).asset?._ref ?? "";
  const isSvg = ref.endsWith("-svg");
  let builder = urlFor(image).width(width);
  builder = isSvg ? builder.format("png") : builder.auto("format");
  if (height) builder = builder.height(height).fit("crop");
  return builder.url();
}
