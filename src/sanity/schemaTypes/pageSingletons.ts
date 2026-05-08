import { defineField, defineType, type SchemaTypeDefinition } from "sanity";

type ExtraField = ReturnType<typeof defineField>;

type PageSingletonConfig = {
  name: string;
  title: string;
  extraFields?: ExtraField[];
};

const featuredDiscographyField = (brand: string): ExtraField =>
  defineField({
    name: "featuredDiscography",
    title: "Featured Discography (max 3)",
    description:
      "이 페이지의 Discography 미리보기 섹션에 표시할 항목 (순서대로 노출). 비워두면 등록 순서로 자동 표시됩니다.",
    type: "array",
    of: [
      {
        type: "reference",
        to: [{ type: "discographyEntry" }],
        options: {
          filter: "brand == $brand",
          filterParams: { brand },
        },
      },
    ],
    validation: (Rule) => Rule.max(3),
  });

const featuredLocationRecordingField: ExtraField = defineField({
  name: "featuredLocationRecording",
  title: "Featured Location Recording (max 3)",
  description:
    "Location Recording 미리보기 섹션에 표시할 항목 (순서대로 노출). 비워두면 자동 표시됩니다.",
  type: "array",
  of: [
    {
      type: "reference",
      to: [{ type: "discographyEntry" }],
      options: {
        filter:
          'brand == $brand && $scopeSlug in scopes[]->slug.current',
        filterParams: { brand: "audioguy", scopeSlug: "location-recording" },
      },
    },
  ],
  validation: (Rule) => Rule.max(3),
});

export const PAGE_SINGLETONS: PageSingletonConfig[] = [
  { name: "homePage", title: "Home" },
  { name: "aboutPage", title: "About" },
  {
    name: "audioguyPage",
    title: "Audioguy",
    extraFields: [
      featuredDiscographyField("audioguy"),
      featuredLocationRecordingField,
    ],
  },
  {
    name: "sound360Page",
    title: "Sound360",
    extraFields: [featuredDiscographyField("sound360")],
  },
  {
    name: "seoroPage",
    title: "Seoro",
    extraFields: [featuredDiscographyField("seoro")],
  },
  { name: "discographyPage", title: "Discography" },
  { name: "contactPage", title: "Contact" },
];

export const PAGE_SINGLETON_NAMES = PAGE_SINGLETONS.map((p) => p.name);

function definePageSingleton({
  name,
  title,
  extraFields = [],
}: PageSingletonConfig): SchemaTypeDefinition {
  return defineType({
    name,
    title: `Page · ${title}`,
    type: "document",
    fields: [
      defineField({
        name: "heroImage",
        title: "Hero Image",
        type: "image",
        options: { hotspot: true },
        fields: [{ name: "alt", title: "Alt", type: "string" }],
      }),
      defineField({
        name: "images",
        title: "Image Slots",
        description:
          "코드에서 키로 호출하는 이미지들. 새 이미지가 필요하면 키와 함께 추가하세요.",
        type: "array",
        of: [{ type: "imageSlot" }],
      }),
      ...extraFields,
    ],
  });
}

export const pageSingletonTypes: SchemaTypeDefinition[] =
  PAGE_SINGLETONS.map(definePageSingleton);
