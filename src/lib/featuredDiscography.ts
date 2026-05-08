import { sanityFetch } from "@/sanity/lib/fetch";
import { pageFeaturedDiscographyQuery } from "@/sanity/lib/queries";
import type { PageFeaturedDiscography } from "@/sanity/types";

export async function getPageFeaturedDiscography(
  pageId: string,
): Promise<PageFeaturedDiscography> {
  const data = await sanityFetch<PageFeaturedDiscography | null>({
    query: pageFeaturedDiscographyQuery,
    params: { pageId },
    tags: [pageId, "discographyEntry"],
  }).catch(() => null);

  return {
    featuredDiscography: data?.featuredDiscography ?? null,
    featuredLocationRecording: data?.featuredLocationRecording ?? null,
  };
}
