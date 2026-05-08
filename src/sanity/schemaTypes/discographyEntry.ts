import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

import { BRANDS } from "../../lib/brands";

export const discographyEntryType = defineType({
  name: "discographyEntry",
  title: "Discography Entry",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Album Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "artist",
      title: "Artist",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "releaseDate",
      title: "Release Date",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "string",
      options: {
        list: BRANDS.map((b) => ({ title: b.label, value: b.value })),
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "scopes",
      title: "Work Scopes",
      type: "array",
      of: [{ type: "reference", to: [{ type: "workScope" }] }],
      description: "이 작업에 해당하는 작업범위(여러 개 가능)",
    }),
    defineField({
      name: "cover",
      title: "Cover Image (square)",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt", type: "string" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
      description: "스포티파이/멜론/유튜브 등 외부 링크",
    }),
    orderRankField({ type: "discographyEntry" }),
  ],
  orderings: [
    orderRankOrdering,
    {
      title: "Release Date (newest first)",
      name: "releaseDateDesc",
      by: [{ field: "releaseDate", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      artist: "artist",
      brand: "brand",
      media: "cover",
    },
    prepare({ title, artist, brand, media }) {
      return {
        title,
        subtitle: [artist, brand].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
