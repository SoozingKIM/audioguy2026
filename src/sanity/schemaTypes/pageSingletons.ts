import { defineField, defineType, type SchemaTypeDefinition } from "sanity";

type ExtraField = ReturnType<typeof defineField>;

type ImageSection = { name: string; title: string };

type PageSingletonConfig = {
  name: string;
  title: string;
  /** Localized text content fields (shown under the "콘텐츠" tab). */
  contentFields?: ExtraField[];
  /** Other fields like featured discography (also under "콘텐츠"). */
  extraFields?: ExtraField[];
  /**
   * Per-section image slot arrays (shown under the "이미지" tab). Each is an
   * array of `imageSlot`; the code still looks images up by their `key`, so the
   * sections only organize the Studio UI. Omit to get one flat "Image Slots".
   */
  imageSections?: ImageSection[];
};

/** Localized single-line text field for the content tab. */
const ls = (name: string, title: string): ExtraField =>
  defineField({ name, title, type: "localeString", group: "content" });

/** Localized multi-line text field for the content tab. */
const lt = (name: string, title: string): ExtraField =>
  defineField({ name, title, type: "localeText", group: "content" });

/** Message path → camelCase Sanity field name (mirrors lib/pageContent). */
const toFieldName = (path: string): string =>
  path.replace(/\.(\w)/g, (_, c: string) => c.toUpperCase());

/**
 * Builds content fields from i18n message paths. The field name is the
 * camelCase of the path and the title is the path itself (the Studio shows each
 * field's current value, so the path is enough to locate it). Paths listed in
 * `multi` render as multi-line text areas.
 */
const contentFields = (paths: string[], multi: string[] = []): ExtraField[] => {
  const multiSet = new Set(multi);
  return paths.map((p) =>
    (multiSet.has(p) ? lt : ls)(toFieldName(p), p),
  );
};

// ── Rendered text per page (kept in sync with each page's cx(...) calls) ─────
const aboutContentPaths = [
  "hero.eyebrow", "hero.soul", "hero.title", "hero.subtitle",
  "scale.label", "scale.title", "scale.description",
  "scale.stat1Label", "scale.stat1Value", "scale.stat2Label", "scale.stat2Value",
  "scale.stat3Label", "scale.stat3Value", "scale.stat4Label", "scale.stat4Value",
  "ecosystem.label", "ecosystem.title", "ecosystem.description",
  "ecosystem.brand1Name", "ecosystem.brand1Desc", "ecosystem.brand2Name", "ecosystem.brand2Desc",
  "ecosystem.brand3Name", "ecosystem.brand3Desc", "ecosystem.brand4Name", "ecosystem.brand4Desc",
  "heritage.label", "heritage.title", "heritage.description",
  "heritage.month5", "heritage.month4", "heritage.month3", "heritage.month2", "heritage.month1",
  "heritage.achievement",
  "tech.title", "tech.subtitle", "tech.name", "tech.description", "tech.cardTitle", "tech.cardDesc",
  "people.label", "people.title", "people.description",
  "people.member1Name", "people.member1Role", "people.member2Name", "people.member2Role",
  "people.member3Name", "people.member3Role", "people.member4Name", "people.member4Role",
  "people.member5Name", "people.member5Role",
  "proof.label", "proof.title", "proof.description",
  "presence.label", "presence.title", "presence.description",
  "presence.studio1Name", "presence.studio1DescKr", "presence.studio1DescEn",
  "presence.studio2Name", "presence.studio2DescKr", "presence.studio2DescEn",
];
const aboutContentMulti = [
  "scale.description", "ecosystem.description", "heritage.description",
  "tech.description", "people.description", "proof.description",
  "presence.description", "presence.studio1DescEn", "presence.studio2DescEn",
];

const agstudioContentPaths = [
  "heroAlt", "introduction",
  "locationRecording", "locationLabel", "locationTitleEn", "locationSubKr", "locationBody1", "locationBody2",
  "studioRecording", "studioRecLabel", "studioRecTitleEn", "studioRecSubKr",
  "mixingMaster", "mixingLabel", "mixingTitleEn", "mixingSubKr",
  "demoTape",
  "studio", "studioSubKr", "studioName", "studioBody",
  "discography", "recentWork", "selectedAlbums",
  "ourTeam", "team1Name", "team1Role", "team2Name", "team2Role",
  "team2Bullet1", "team2Bullet2", "team2Bullet3",
  "team3Name", "team3Role", "team4Name", "team4Role",
];
const agstudioContentMulti = ["locationBody1", "locationBody2", "studioBody"];

const sound360ContentPaths = [
  "label", "title", "description", "workScope",
  "service1", "service2", "service3", "service4",
  "studio", "studioSubKr", "studioTitle", "studioBody",
  "discography", "selectedAlbums",
  "ourTeam", "team1Name", "team1Role", "team2Name", "team2Role",
];
const sound360ContentMulti = ["description", "studioBody"];

const seoroContentPaths = [
  "label", "title", "desc1", "desc2",
  "business", "businessCaption", "businessDesc",
  "process", "processCaption", "processDesc",
  "step1Title", "step1Hint", "step2Title", "step3Title", "step4Title", "step5Title", "step6Title", "step7Title", "step8Title",
  "step1Desc", "step2Desc", "step3Desc", "step4Desc", "step5Desc", "step6Desc", "step7Desc", "step8Desc",
  "dspNetwork", "dspSubtitle", "dspDesc", "dspTab1", "dspTab2", "dspTab3", "dspTab4",
  "partners", "partnersCaption", "partnersDesc", "partnerTab1", "partnerTab2", "partnerTab3", "partnerTab4",
  "settlement", "settlementCaption", "settlementSystem", "settlementDesc",
  "settleTab1", "settleTab2", "settleTab3", "settleTab4",
  "discography", "selectedAlbums",
];
const seoroContentMulti = [
  "businessDesc", "processDesc", "step1Hint", "dspDesc", "partnersDesc", "settlementDesc",
];

const discographyContentPaths = [
  "label", "title", "description", "totalLabel", "totalUnit", "empty",
];
const discographyContentMulti = ["description"];

const contactContentPaths = [
  "title", "brand", "company", "name", "position", "phone", "email", "memo",
  "submit", "submitting",
  "companyPh", "namePh", "positionPh", "phonePh", "emailPh", "memoPh",
  "success", "error",
];
const contactContentMulti = ["success", "error"];

const featuredDiscographyField = (brand: string): ExtraField =>
  defineField({
    name: "featuredDiscography",
    title: "Featured Discography (max 5)",
    description:
      "이 페이지의 Discography 미리보기 섹션에 표시할 항목 (순서대로 노출). 비워두면 등록 순서로 자동 표시됩니다.",
    type: "array",
    group: "content",
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
    validation: (Rule) => Rule.max(5),
  });

const featuredLocationRecordingField: ExtraField = defineField({
  name: "featuredLocationRecording",
  title: "Featured Location Recording (max 5)",
  description:
    "Location Recording 미리보기 섹션에 표시할 항목 (순서대로 노출). 비워두면 자동 표시됩니다.",
  type: "array",
  group: "content",
  of: [
    {
      type: "reference",
      to: [{ type: "discographyEntry" }],
      options: {
        filter: 'brand == $brand && $scopeSlug in scopes[]->slug.current',
        filterParams: { brand: "audioguy", scopeSlug: "location-recording" },
      },
    },
  ],
  validation: (Rule) => Rule.max(5),
});

// Hero background video. When set, the page hero plays this instead of its
// default background; leave empty to keep the original hero.
const heroVideoField: ExtraField = defineField({
  name: "heroVideo",
  title: "Hero 배경 동영상",
  description:
    "히어로 배경에 자동 재생(무음·반복)되는 동영상. mp4 권장(webm도 가능). 업로드하면 기존 배경 대신 재생되고, 비워두면 원래 배경이 유지됩니다.",
  type: "file",
  options: { accept: "video/*" },
  group: "media",
});

// Optional sound for the hero video. Browsers block autoplay-with-sound, so
// when on, the hero shows a speaker toggle the visitor taps to enable sound.
const heroVideoSoundField: ExtraField = defineField({
  name: "heroVideoSound",
  title: "배경 동영상 소리 사용",
  description:
    "켜면 히어로에 '소리 켜기' 버튼이 표시됩니다. (브라우저 정책상 동영상은 항상 무음으로 자동재생되고, 방문자가 버튼을 눌러야 소리가 납니다.)",
  type: "boolean",
  initialValue: false,
  group: "media",
});

// ── Per-page localized content fields ──────────────────────────────────────
const homeContent: ExtraField[] = [
  ls("heroTitle1", "히어로 제목 1"),
  ls("heroTitle2", "히어로 제목 2"),
  ls("heroDesc1", "히어로 설명 1"),
  ls("heroDesc2", "히어로 설명 2"),
  ls("overviewLabel", "Brand Overview · 라벨"),
  ls("overviewTitle", "Brand Overview · 제목"),
  lt("overviewP1", "Brand Overview · 문단 1"),
  lt("overviewP2", "Brand Overview · 문단 2"),
  lt("overviewP3", "Brand Overview · 문단 3"),
  lt("overviewP4", "Brand Overview · 문단 4"),
  // 4-quadrant brand cards (label + description shown over each card image)
  ls("audioguyLabel", "카드 · Audioguy 라벨"),
  lt("audioguyDesc", "카드 · Audioguy 설명"),
  ls("agstudioLabel", "카드 · AG Studio 라벨"),
  lt("agstudioDesc", "카드 · AG Studio 설명"),
  ls("sound360Label", "카드 · Sound360 라벨"),
  lt("sound360Desc", "카드 · Sound360 설명"),
  ls("seoroLabel", "카드 · Seoro 라벨"),
  lt("seoroDesc", "카드 · Seoro 설명"),
];

// Titles match the navbar names. NOTE the route↔docType remap:
//   aboutPage doc  = /audioguy page (nav "Audioguy")
//   audioguyPage doc = /agstudio page (nav "AGstudio")
export const PAGE_SINGLETONS: PageSingletonConfig[] = [
  { name: "homePage", title: "Home", contentFields: homeContent },
  {
    name: "aboutPage",
    title: "Audioguy",
    contentFields: contentFields(aboutContentPaths, aboutContentMulti),
    imageSections: [
      { name: "ecosystemImages", title: "Ecosystem · 이미지 (key: ecosystem)" },
      { name: "peopleImages", title: "People · 팀 사진 (key: team-1 ~ team-5)" },
      { name: "presenceImages", title: "Presence · 스튜디오 (key: studio-1, studio-2)" },
    ],
    extraFields: [heroVideoField, heroVideoSoundField],
  },
  {
    name: "audioguyPage",
    title: "AGstudio",
    contentFields: contentFields(agstudioContentPaths, agstudioContentMulti),
    imageSections: [
      {
        name: "serviceImages",
        title: "작업 내용 · 이미지 (key: orchestra-1·2, studioRec-1·2, mixing-1·2, demo-1·2)",
      },
      { name: "studioImages", title: "Studio · 피아노 (key: piano)" },
      { name: "teamImages", title: "Our Team · 팀 사진 (key: team-1 ~ team-4)" },
    ],
    extraFields: [
      featuredDiscographyField("audioguy"),
      featuredLocationRecordingField,
      heroVideoField,
      heroVideoSoundField,
    ],
  },
  {
    name: "sound360Page",
    title: "Sound360",
    contentFields: contentFields(sound360ContentPaths, sound360ContentMulti),
    imageSections: [
      { name: "studioImages", title: "Studio · 캐러셀 (자유 추가/삭제 — 입력 순서대로 슬라이드, key는 고유 값)" },
      { name: "teamImages", title: "Our Team · 팀 사진 (key: team-1, team-2)" },
    ],
    extraFields: [
      featuredDiscographyField("sound360"),
      heroVideoField,
      heroVideoSoundField,
    ],
  },
  {
    name: "seoroPage",
    title: "Seoro",
    contentFields: contentFields(seoroContentPaths, seoroContentMulti),
    imageSections: [
      {
        name: "dspLogos",
        title:
          "DSP 로고 (흰 원 안에 들어가는 로고. key: dsp-spotify, dsp-melon, dsp-apple-music …)",
      },
      {
        name: "partnerLogos",
        title:
          "파트너사 로고 (어두운 원 안에 들어가는 로고. key: partner-<슬러그>, 예: partner-audioguy)",
      },
    ],
    extraFields: [featuredDiscographyField("seoro")],
  },
  {
    name: "discographyPage",
    title: "Discography",
    contentFields: contentFields(discographyContentPaths, discographyContentMulti),
  },
  {
    name: "contactPage",
    title: "Contact",
    contentFields: contentFields(contactContentPaths, contactContentMulti),
  },
];

export const PAGE_SINGLETON_NAMES = PAGE_SINGLETONS.map((p) => p.name);

function definePageSingleton({
  name,
  title,
  contentFields = [],
  extraFields = [],
  imageSections,
}: PageSingletonConfig): SchemaTypeDefinition {
  const imageFields: ExtraField[] = imageSections
    ? imageSections.map((s) =>
        defineField({
          name: s.name,
          title: s.title,
          type: "array",
          group: "media",
          of: [{ type: "imageSlot" }],
        }),
      )
    : [
        defineField({
          name: "images",
          title: "Image Slots",
          description:
            "코드에서 키로 호출하는 이미지들. 새 이미지가 필요하면 키와 함께 추가하세요.",
          type: "array",
          group: "media",
          of: [{ type: "imageSlot" }],
        }),
      ];

  return defineType({
    name,
    title: `Page · ${title}`,
    type: "document",
    groups: [
      { name: "content", title: "콘텐츠", default: contentFields.length > 0 },
      { name: "media", title: "이미지", default: contentFields.length === 0 },
    ],
    fields: [
      ...contentFields,
      defineField({
        name: "heroImage",
        title: "Hero Image",
        type: "image",
        group: "media",
        options: { hotspot: true },
        fields: [{ name: "alt", title: "Alt", type: "string" }],
      }),
      ...imageFields,
      ...extraFields,
    ],
  });
}

export const pageSingletonTypes: SchemaTypeDefinition[] =
  PAGE_SINGLETONS.map(definePageSingleton);
