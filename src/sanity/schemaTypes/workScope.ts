import { defineField, defineType } from "sanity";

export const workScopeType = defineType({
  name: "workScope",
  title: "Work Scope",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "예: Mixing, Mastering, Recording, Sound Design",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "URL 필터에 사용 (자동 생성)",
      options: { source: "title", maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
  ],
});
