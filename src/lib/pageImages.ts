import { sanityFetch } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import { pageImagesQuery } from "@/sanity/lib/queries";
import type { ImageSlot, PageImages, SanityImage } from "@/sanity/types";

export async function getPageImages(docType: string): Promise<PageImages> {
  const data = await sanityFetch<PageImages | null>({
    query: pageImagesQuery,
    params: { docType },
    tags: [docType],
  }).catch(() => null);

  return {
    hero: data?.hero ?? null,
    images: data?.images ?? [],
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
  let builder = urlFor(image).width(width).auto("format");
  if (height) builder = builder.height(height).fit("crop");
  return builder.url();
}
