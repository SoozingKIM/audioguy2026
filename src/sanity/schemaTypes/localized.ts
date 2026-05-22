import { defineField, defineType } from "sanity";

/** A single string localized to the three site locales (ko / en / jp). */
export const localeStringType = defineType({
  name: "localeString",
  title: "다국어 텍스트",
  type: "object",
  options: { columns: 3 },
  fields: [
    defineField({ name: "ko", title: "한국어", type: "string" }),
    defineField({ name: "en", title: "English", type: "string" }),
    defineField({ name: "jp", title: "日本語", type: "string" }),
  ],
});

/** A multi-line string localized to the three site locales. */
export const localeTextType = defineType({
  name: "localeText",
  title: "다국어 텍스트 (여러 줄)",
  type: "object",
  fields: [
    defineField({ name: "ko", title: "한국어", type: "text", rows: 3 }),
    defineField({ name: "en", title: "English", type: "text", rows: 3 }),
    defineField({ name: "jp", title: "日本語", type: "text", rows: 3 }),
  ],
});
