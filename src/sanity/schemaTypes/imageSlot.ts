import { defineField, defineType } from "sanity";

export const imageSlotType = defineType({
  name: "imageSlot",
  title: "Image Slot",
  type: "object",
  fields: [
    defineField({
      name: "key",
      title: "Key",
      type: "string",
      description: "코드에서 이 이미지를 호출할 식별자 (예: studio-wide, team-photo)",
      validation: (Rule) =>
        Rule.required().regex(/^[a-z0-9-]+$/, {
          name: "kebab-case",
          invert: false,
        }),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
      description: "스크린리더/SEO용 대체 텍스트",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "key", subtitle: "caption", media: "image" },
  },
});
