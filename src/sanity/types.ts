import type { Image } from "sanity";

import type { BrandValue } from "@/lib/brands";

export type SanityImage = Image & { alt?: string };

export type ImageSlot = {
  key: string;
  image: SanityImage;
  alt?: string;
  caption?: string;
};

export type PageImages = {
  hero: SanityImage | null;
  images: ImageSlot[];
};

export type SiteSettings = {
  siteName?: string;
  logo?: SanityImage;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socials?: { label?: string; url?: string }[];
};

export type WorkScopeRef = {
  _id: string;
  title: string;
  slug: string;
};

export type PageFeaturedDiscography = {
  featuredDiscography: DiscographyEntry[] | null;
  featuredLocationRecording?: DiscographyEntry[] | null;
};

export type DiscographyEntry = {
  _id: string;
  title: string;
  artist: string;
  releaseDate: string;
  brand: BrandValue;
  cover: SanityImage;
  description?: string;
  externalUrl?: string;
  scopes?: WorkScopeRef[];
};
