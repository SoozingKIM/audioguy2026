import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactCta } from "@/components/ContactCta";
import { DspTabs } from "@/components/DspTabs";
import { PartnerTabs } from "@/components/PartnerTabs";
import { RevealCards } from "@/components/RevealCards";
import { SettlementTabs } from "@/components/SettlementTabs";
// 임시 숨김: discography "더보기" 버튼 주석 처리로 Link 미사용 (복구 시 주석 해제)
// import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { contentResolver, getPageContent } from "@/lib/pageContent";
import { getPageImages, imageUrl } from "@/lib/pageImages";
import { sanityFetch } from "@/sanity/lib/fetch";
import { brandRecentDiscographyQuery } from "@/sanity/lib/queries";
import type { DiscographyEntry } from "@/sanity/types";

// DSP delivery destinations per region (illustrative). Keyed to the tab labels
// 한국 / 일본 / 글로벌 / 몰입형. Each brand's logo is a Sanity image slot
// (key: dsp-<slug>), shown as a circle on the card.
const DSP_GROUPS = [
  ["Melon", "genie", "FLO", "Bugs", "VIBE", "YouTube Music", "Spotify", "Apple Music"],
  ["LINE MUSIC", "AWA", "mora", "Recochoku", "Spotify", "Apple Music", "YouTube Music", "Amazon Music"],
  // "Pandora" 임시 비활성화 — 복구하려면 "TIDAL" 뒤에 "Pandora", 다시 추가
  ["Spotify", "Apple Music", "YouTube Music", "Amazon Music", "Deezer", "TIDAL", /* "Pandora", */ "SoundCloud"],
  // 몰입형 탭 (임시 비활성화 — 복구하려면 아래 줄과 DSP_TAB_KEYS의 "dspTab4" 주석 해제)
  // ["Dolby Atmos", "Apple Spatial Audio", "Sony 360", "TIDAL"],
];

const slug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const dspLogoKey = (name: string) => "dsp-" + slug(name);
const partnerLogoKey = (name: string) => "partner-" + slug(name);

// Partners listed by category (프로덕션 / 유통 / 미디어), illustrative. The "전체"
// tab (partnerTab1) shows every partner; each card is a circle logo + name.
const PARTNER_GROUPS = [
  { labelKey: "partnerTab2", brands: ["AUDIOGUY", "Sound360", "Dolby"] },
  { labelKey: "partnerTab3", brands: ["Dreamus", "Kakao Ent.", "NHN Bugs"] },
  { labelKey: "partnerTab4", brands: ["YouTube", "Naver", "Apple Music"] },
] as const;

// Figma lays the 6 steps out as a staggered 4-col / 2-row grid: 01·02·03 across
// the top, then 04·05·06 across the bottom shifted one column right.
const PROCESS_STEPS = [
  { no: "01", titleKey: "step1Title", hintKey: "step1Hint", pos: "md:col-start-1 md:row-start-1" },
  { no: "02", titleKey: "step2Title", pos: "md:col-start-2 md:row-start-1" },
  { no: "03", titleKey: "step3Title", pos: "md:col-start-3 md:row-start-1" },
  { no: "04", titleKey: "step4Title", pos: "md:col-start-2 md:row-start-2" },
  { no: "05", titleKey: "step5Title", pos: "md:col-start-3 md:row-start-2" },
  { no: "06", titleKey: "step6Title", pos: "md:col-start-4 md:row-start-2" },
];

// "dspTab4"(몰입형) 임시 비활성화 — 복구하려면 주석 해제 + DSP_GROUPS의 몰입형 그룹도 해제
const DSP_TAB_KEYS = ["dspTab1", "dspTab2", "dspTab3" /* , "dspTab4" */] as const;
const SETTLE_TAB_KEYS = [
  "settleTab1",
  "settleTab2",
  "settleTab3",
  "settleTab4",
] as const;

function SectionHeader({
  title,
  caption,
  description,
}: {
  title: string;
  caption?: string;
  description?: string;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-x-5 gap-y-3 md:grid-cols-2">
      <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
        {title}
      </h2>
      <div className="md:py-2">
        {caption ? (
          <p className="text-lg font-semibold leading-[1.4] tracking-[-0.23px] text-foreground md:text-[23px]">
            {caption}
          </p>
        ) : null}
        {description ? (
          <p className="mt-3 text-[15px] font-medium leading-[1.4] tracking-[-0.18px] text-secondary md:text-[18px]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default async function SeoroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Seoro");
  const tCommon = await getTranslations("Common");
  const c = await getPageContent("seoroPage");
  const cx = contentResolver(c, locale, t);
  const { images } = await getPageImages("seoroPage");

  // Discography preview: the 5 most recently added seoro-brand entries.
  // Managed in Sanity Studio (Discography Entry docs, brand="seoro").
  const discography = await sanityFetch<DiscographyEntry[]>({
    query: brandRecentDiscographyQuery,
    params: { brand: "seoro", limit: 5 },
    tags: ["discographyEntry", "brand:seoro"],
  }).catch(() => []);

  const dspTabs = DSP_TAB_KEYS.map((key, i) => ({
    label: cx(key),
    brands: DSP_GROUPS[i].map((name) => ({ name, logoKey: dspLogoKey(name) })),
  }));

  const toPartner = (name: string) => ({ name, logoKey: partnerLogoKey(name) });
  const partnerTabs = [
    {
      label: cx("partnerTab1"),
      partners: PARTNER_GROUPS.flatMap((g) => g.brands).map(toPartner),
    },
    ...PARTNER_GROUPS.map((g) => ({
      label: cx(g.labelKey),
      partners: g.brands.map(toPartner),
    })),
  ];

  return (
    <>
      {/* Hero */}
      <section className="seoro-hero relative overflow-hidden px-8 pb-24 pt-16 md:pb-32 md:pt-20 lg:px-14">
        <div className="mx-auto max-w-[1360px] text-white">
          <p className="text-2xl font-semibold tracking-tight md:text-[40px]">
            {cx("label")}
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1] tracking-[-1.63px] md:mt-16 md:text-[120px] lg:text-[163px]">
            {cx("title")}
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-[1.5] tracking-[-0.18px] text-white/60 md:text-[18px]">
            {cx("desc1")}
            <br />
            {cx("desc2")}
          </p>
        </div>
      </section>

      {/* 사업 소개 */}
      <section className="mx-auto max-w-7xl px-8 pt-32 lg:px-14">
        <SectionHeader
          title={cx("business")}
          caption={cx("businessCaption")}
          description={cx("businessDesc")}
        />
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="aspect-[55/71] overflow-hidden bg-foreground bg-cover bg-center"
              style={{ backgroundImage: `url(/seoro/card-${n}.png)` }}
            />
          ))}
        </div>
      </section>

      {/* 유통 프로세스 */}
      <section className="mx-auto max-w-7xl px-8 pt-40 lg:px-14">
        <SectionHeader
          title={cx("process")}
          caption={cx("processCaption")}
          description={cx("processDesc")}
        />
        <RevealCards className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2">
          {PROCESS_STEPS.map((step, i) => (
            <div
              key={step.no}
              data-card
              className={`relative h-[200px] overflow-hidden bg-cover bg-center md:h-[260px] ${step.pos}`}
              style={{ backgroundImage: `url(/seoro/process-${i + 1}.png)` }}
            >
              {/* Figma graphic is the background (incl. the baked step number);
                  the title is live text, with a matching light gradient hiding
                  the baked title underneath. */}
              <div
                aria-hidden
                className={`absolute inset-x-0 bottom-0 ${step.hintKey ? "h-3/5" : "h-2/5"}`}
                style={{
                  background:
                    "linear-gradient(to top, #eef2f7 0%, #eef2f7 60%, rgba(238,242,247,0) 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-xl font-semibold leading-[1.4] tracking-[-0.24px] text-foreground md:text-[24px]">
                  {cx(step.titleKey)}
                </h3>
                {step.hintKey ? (
                  <p className="mt-2 text-[13px] leading-[1.4] tracking-[-0.15px] text-secondary">
                    {cx(step.hintKey)}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </RevealCards>
      </section>

      {/* DSP 네트워크 (Dark) */}
      <section className="mt-40 bg-foreground py-20 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-8 lg:px-14">
          <div className="grid grid-cols-1 items-start gap-x-5 gap-y-3 md:grid-cols-2">
            <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
              {cx("dspNetwork")}
            </h2>
            <div className="md:py-2">
              <p className="text-lg font-semibold leading-[1.4] tracking-[-0.23px] md:text-[23px]">
                {cx("dspSubtitle")}
              </p>
              <p className="mt-3 max-w-md text-[15px] font-medium leading-[1.4] tracking-[-0.18px] text-white/66 md:text-[18px]">
                {cx("dspDesc")}
              </p>
            </div>
          </div>

          <DspTabs tabs={dspTabs} slots={images} />
        </div>
      </section>

      {/* 파트너사 */}
      <section className="mx-auto max-w-7xl px-8 pt-40 lg:px-14">
        <SectionHeader
          title={cx("partners")}
          caption={cx("partnersCaption")}
          description={cx("partnersDesc")}
        />
        <PartnerTabs tabs={partnerTabs} slots={images} />
      </section>

      {/* 정산 시스템 소개 */}
      <section className="mx-auto max-w-7xl px-8 pt-40 lg:px-14">
        <SectionHeader
          title={cx("settlement")}
          caption={cx("settlementCaption")}
        />
        <div className="mt-3 grid grid-cols-1 gap-x-5 md:grid-cols-2">
          <div className="hidden md:block" />
          <div className="md:py-2">
            <p className="text-lg font-semibold leading-[1.4] tracking-[-0.23px] text-foreground md:text-[23px]">
              {cx("settlementSystem")}
            </p>
            <p className="mt-3 max-w-md text-[15px] font-medium leading-[1.4] tracking-[-0.18px] text-secondary md:text-[18px]">
              {cx("settlementDesc")}
            </p>
          </div>
        </div>

        <SettlementTabs
          panels={SETTLE_TAB_KEYS.map((key) => ({ label: cx(key) }))}
          imageNeeded={tCommon("imageNeeded")}
        />
      </section>

      {/* DISCOGRAPHY — brand "seoro" entries from Sanity (managed in Studio
          → Discography Entry, filtered to brand=seoro, 5 most recent). */}
      <section className="mx-auto max-w-7xl px-8 pt-40 lg:px-14">
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
          {cx("discography")}
        </h2>
        <div className="mt-10 flex items-center justify-between">
          <p className="text-[15px] font-medium tracking-[-0.18px] text-foreground md:text-[18px]">
            {cx("selectedAlbums")}
          </p>
          {/* 임시 숨김: discography "더보기" 버튼 (복구하려면 주석 해제 + 상단 Link import 복구)
          <Link
            href="/discography?brand=seoro"
            className="text-[15px] font-medium tracking-[-0.15px] text-tertiary underline-offset-4 hover:text-foreground hover:underline"
          >
            {tCommon("viewMore")}
          </Link>
          */}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {discography.map((entry) => {
            const cover = imageUrl(entry.cover, 600, 600);
            return (
              <div key={entry._id} className="flex flex-col gap-3">
                <div className="relative aspect-square overflow-hidden bg-background-white">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={entry.cover?.alt ?? entry.title}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-[15px] font-medium leading-[1.5] tracking-[-0.18px] text-foreground md:text-[18px]">
                    {entry.title}
                  </div>
                  <div className="text-[13px] tracking-[-0.13px] text-tertiary">
                    {entry.artist}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ContactCta />
    </>
  );
}
