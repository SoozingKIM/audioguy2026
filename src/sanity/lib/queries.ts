import { groq } from "next-sanity";

export const siteSettingsQuery = groq`*[_id == "siteSettings"][0]{
  siteName,
  logo,
  tagline,
  contactEmail,
  contactPhone,
  address,
  socials
}`;

export const pageImagesQuery = groq`*[_type == $docType][0]{
  "hero": heroImage,
  "images": coalesce(images, [])
}`;

const DISCOGRAPHY_FIELDS = `
  _id,
  title,
  artist,
  releaseDate,
  brand,
  cover,
  description,
  externalUrl,
  scopes[]->{ _id, title, "slug": slug.current }
`;

// Newest-added first: most recently created Sanity docs appear at the front of
// page 1 (used by the discography list page and the per-brand previews).
const DISCOGRAPHY_ORDER = `_createdAt desc`;

export const discographyListQuery = groq`*[_type == "discographyEntry"
  && (!defined($brand) || brand == $brand)
  && (!defined($scopeSlug) || $scopeSlug in scopes[]->slug.current)
] | order(${DISCOGRAPHY_ORDER}) [$start...$end] {
  ${DISCOGRAPHY_FIELDS}
}`;

export const discographyCountQuery = groq`count(*[_type == "discographyEntry"
  && (!defined($brand) || brand == $brand)
  && (!defined($scopeSlug) || $scopeSlug in scopes[]->slug.current)
])`;

export const brandRecentDiscographyQuery = groq`*[_type == "discographyEntry" && brand == $brand]
  | order(${DISCOGRAPHY_ORDER}) [0...$limit] {
    ${DISCOGRAPHY_FIELDS}
  }`;

export const brandScopeRecentDiscographyQuery = groq`*[
  _type == "discographyEntry"
  && brand == $brand
  && $scopeSlug in scopes[]->slug.current
] | order(${DISCOGRAPHY_ORDER}) [0...$limit] {
  ${DISCOGRAPHY_FIELDS}
}`;

export const pageFeaturedDiscographyQuery = groq`*[_id == $pageId][0]{
  "featuredDiscography": featuredDiscography[]->{
    ${DISCOGRAPHY_FIELDS}
  },
  "featuredLocationRecording": featuredLocationRecording[]->{
    ${DISCOGRAPHY_FIELDS}
  }
}`;

export const scopesUsedByBrandQuery = groq`*[_type == "workScope" &&
  _id in *[_type == "discographyEntry" && brand == $brand].scopes[]._ref
] | order(title asc) {
  _id,
  title,
  "slug": slug.current
}`;
