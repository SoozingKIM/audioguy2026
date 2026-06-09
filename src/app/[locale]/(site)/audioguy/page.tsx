import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactCta } from "@/components/ContactCta";
import {
  PeopleCarousel,
  type PeopleMember,
} from "@/components/PeopleCarousel";
import { RevealCards } from "@/components/RevealCards";
import { SectionReveal } from "@/components/SectionReveal";
import { SlotImage } from "@/components/SlotImage";
import { contentResolver, getPageContent } from "@/lib/pageContent";
import { getPageImages } from "@/lib/pageImages";

const STUDIO_IMAGES = ["/about/studio-1.jpg", "/about/studio-2.jpg"];

// About hero glow — Figma Frame 20 (1920×660): a soft base ellipse, two mirrored
// ripple "Union" rings, and three blue/purple glow ellipses. Reproduced from the
// original Figma SVGs, positioned/sized as % of the full 1920×660 frame
// (aspect 32:11) so a full-bleed w-full stage reproduces the design edge-to-edge.
// Heights are % of 660; widths/x are % of 1920. Order is back→front.
const G = "/about/hero";
const HERO_GLOW: {
  src: string;
  w: number;
  h: number;
  x: number;
  y: number;
  flip?: boolean;
}[] = [
  { src: "ellipse3", w: 84.48, h: 132.42, x: 50, y: 50 },
  { src: "union", w: 39.57, h: 112.69, x: 41.58, y: 49.92 },
  { src: "union", w: 39.57, h: 112.69, x: 60.1, y: 49.92, flip: true },
  { src: "ellipse1", w: 32.29, h: 93.94, x: 46.35, y: 50 },
  { src: "ellipse4", w: 32.29, h: 93.94, x: 63.54, y: 52.42 },
  { src: "ellipse2", w: 37.5, h: 109.09, x: 53.23, y: 50 },
];

// Heritage timeline — years fade out going back in time (Figma Frame 138);
// the active year (2026) is fully dark, older years progressively lighter.
const HERITAGE_YEARS = ["2026", "2025", "2024", "2023", "2022", "2021"];
const HERITAGE_YEAR_OPACITY = [1, 0.55, 0.38, 0.22, 0.12, 0.06];
const HERITAGE_MONTHS = ["month5", "month4", "month3", "month2", "month1"];

function SectionHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase leading-normal tracking-[-0.12px] text-secondary">
        {label}
      </p>
      <div className="mt-3 grid grid-cols-1 items-end gap-x-5 gap-y-3 md:grid-cols-2">
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] text-foreground md:text-[40px] md:leading-[1.2]">
          {title}
        </h2>
        {description ? (
          <p className="text-[15px] leading-normal tracking-[-0.18px] text-secondary md:text-[18px]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const tCommon = await getTranslations("Common");
  const c = await getPageContent("aboutPage");
  const cx = contentResolver(c, locale, t);
  const { images } = await getPageImages("aboutPage");

  // 김소이(member3) 제외 — 노출 멤버: 최정훈·이동주·오대규·안범현
  const people: PeopleMember[] = [1, 2, 4, 5].map((i) => ({
    slotKey: `team-${i}`,
    fallbackSrc: `/about/team-${i}.jpg`,
    name: cx(`people.member${i}Name`),
    role: cx(`people.member${i}Role`),
  }));

  return (
    <>
      {/* Hero — The Soul (Figma Frame 20): rounded glow card, white centered text */}
      <section className="pt-2">
        <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[20px] bg-background sm:min-h-[500px] md:min-h-[600px] lg:min-h-[660px]">
          {/* Layered glow + ripple rings, centered on a fixed-aspect stage */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-32/11 w-full -translate-x-1/2 -translate-y-1/2"
          >
            {HERO_GLOW.map((g, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${g.x}%`,
                  top: `${g.y}%`,
                  width: `${g.w}%`,
                  height: `${g.h}%`,
                  transform: `translate(-50%, -50%)${g.flip ? " scaleX(-1)" : ""}`,
                  backgroundImage: `url(${G}/${g.src}.svg)`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            ))}
          </div>

          {/* Text — white, positioned per Figma over the same stage */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-32/11 w-full -translate-x-1/2 -translate-y-1/2 text-white">
            <div className="absolute left-1/2 top-[31.8%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center">
              <p className="text-[11px] font-medium uppercase leading-[1.5] tracking-[-0.12px] text-white/60 md:text-xs">
                {cx("hero.eyebrow")}
              </p>
              <p className="text-[28px] font-bold leading-[1.4] tracking-[-1.5px] md:text-[40px]">
                {cx("hero.soul")}
              </p>
            </div>
            <h1 className="absolute left-1/2 top-[45.2%] w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center text-[30px] font-bold leading-[1.4] tracking-[-0.46px] md:text-[46px]">
              {cx("hero.title")}
            </h1>
            <p className="absolute left-1/2 top-[55%] w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center text-[18px] font-bold leading-[1.4] tracking-[-0.28px] text-white/60 md:text-[28px]">
              {cx("hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* The Scale (Figma "Numbers") — decorative bg curve + frosted stat cards */}
      <section data-reveal className="relative overflow-hidden pb-12 pt-32">
        {/* Background: faint grid + purple/blue curve sweeping to the top-right,
            constrained to the 1440 content width and centered (matches Figma frame) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-[1440px] -translate-x-1/2"
          style={{
            backgroundImage: "url(/about/scale-bg.png)",
            backgroundSize: "cover",
            backgroundPosition: "right top",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-10">
          <SectionHeader
            label={cx("scale.label")}
            title={cx("scale.title")}
            description={cx("scale.description")}
          />
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex h-55 flex-col justify-between overflow-hidden border border-[#d2d3d5]/30 bg-[#f3f5f8]/70 p-8 backdrop-blur-[25px] md:h-[290px] md:p-10"
              >
                <p className="text-lg font-bold leading-[1.5] tracking-[-0.48px] text-foreground md:text-2xl">
                  {cx(`scale.stat${i}Label`)}
                </p>
                <p className="w-full text-right text-[36px] font-bold leading-[1.2] tracking-[-1.04px] text-foreground md:text-[52px]">
                  {cx(`scale.stat${i}Value`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Ecosystem */}
      <section className="mx-auto max-w-[1440px] px-6 pt-40 lg:px-10">
        <SectionHeader
          label={cx("ecosystem.label")}
          title={cx("ecosystem.title")}
          description={cx("ecosystem.description")}
        />
        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-[1fr_1.3fr]">
          <div className="relative aspect-4/3 overflow-hidden md:aspect-auto md:h-full">
            <SlotImage
              slots={images}
              slotKey="ecosystem"
              fallbackSrc="/about/ecosystem.jpg"
              alt="Audioguy ecosystem"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto] items-center gap-6 border-b border-foreground/10 py-6"
              >
                <h3 className="text-3xl font-bold leading-[1.2] tracking-[-0.46px] text-foreground md:text-[46px]">
                  {cx(`ecosystem.brand${i}Name`)}
                </h3>
                <p className="text-right text-[13px] leading-normal tracking-[-0.15px] text-secondary md:text-[15px]">
                  {cx(`ecosystem.brand${i}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Heritage (Figma "Timeline") — fading years + monthly achievements, offset right */}
      <section className="mx-auto max-w-[1440px] px-6 pt-40 lg:px-10">
        <SectionHeader
          label={cx("heritage.label")}
          title={cx("heritage.title")}
          description={cx("heritage.description")}
        />
        <div className="mt-12 flex gap-8 md:ml-[34%] md:gap-12">
          {/* Years — right-aligned, progressively faded toward the past */}
          <div className="flex flex-col">
            {HERITAGE_YEARS.map((year, idx) => (
              <span
                key={year}
                className="flex h-[52px] items-center justify-end text-right text-[32px] font-bold leading-none tracking-[-0.46px] text-foreground md:h-16 md:text-[46px]"
                style={{ opacity: HERITAGE_YEAR_OPACITY[idx] }}
              >
                {year}
              </span>
            ))}
          </div>
          {/* Monthly achievements for the active year */}
          <div className="flex flex-col">
            {HERITAGE_MONTHS.map((mk) => (
              <p
                key={mk}
                className="flex h-[52px] items-center gap-3 md:h-16"
              >
                <span className="w-12 shrink-0 text-lg font-semibold leading-none tracking-[-0.28px] text-foreground md:w-16 md:text-[28px]">
                  {cx(`heritage.${mk}`)}
                </span>
                <span className="text-lg font-medium leading-none tracking-[-0.28px] text-foreground md:text-[28px]">
                  {cx("heritage.achievement")}
                </span>
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Tech — 검증된 기술력 (Dark) */}
      <section className="relative isolate mt-40 overflow-hidden bg-[#121318] py-64 text-white md:py-80">
        {/* 위·아래 페이드: 다크 밴드를 위/아래 흰 배경과 자연스럽게 연결 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 md:h-80"
          style={{
            background:
              "linear-gradient(to bottom, #f7f9fa 0%, rgba(247,249,250,0.88) 16%, rgba(247,249,250,0.62) 34%, rgba(247,249,250,0.35) 52%, rgba(247,249,250,0.16) 70%, rgba(247,249,250,0.06) 85%, rgba(247,249,250,0) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 md:h-80"
          style={{
            background:
              "linear-gradient(to top, #f7f9fa 0%, rgba(247,249,250,0.88) 16%, rgba(247,249,250,0.62) 34%, rgba(247,249,250,0.35) 52%, rgba(247,249,250,0.16) 70%, rgba(247,249,250,0.06) 85%, rgba(247,249,250,0) 100%)",
          }}
        />
        {/* 미세 노이즈(디더링): 8비트 그라데이션 밴딩(줄무늬)을 흩어 안 보이게 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="grid grid-cols-1 items-start gap-x-5 gap-y-6 md:grid-cols-2">
            <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
              {cx("tech.title")}
            </h2>
            <div>
              <p className="text-[15px] leading-normal tracking-[-0.15px] text-tertiary">
                {cx("tech.subtitle")}
              </p>
              <p className="mt-3 text-lg font-semibold leading-[1.4] tracking-[-0.23px] md:text-[23px]">
                {cx("tech.name")}
              </p>
              <p className="mt-3 max-w-md text-[15px] leading-[1.4] tracking-[-0.18px] text-white/66 md:text-[18px]">
                {cx("tech.description")}
              </p>
            </div>
          </div>

          <div
            aria-hidden
            className="mt-10 aspect-[1360/600] w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/about/tech-sphere.png)" }}
          />

          <RevealCards className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} data-card className="bg-[#222328] p-7">
                <p className="text-xl font-semibold tracking-[-0.24px] md:text-2xl">
                  {cx(`tech.card${i}Title`)}
                </p>
                <p className="mt-2 text-[13px] leading-[1.4] tracking-[-0.15px] text-white/66 md:text-[15px]">
                  {cx(`tech.card${i}Desc`)}
                </p>
              </div>
            ))}
          </RevealCards>
        </div>
      </section>

      {/* The People */}
      <section className="mx-auto max-w-[1440px] px-6 pt-40 lg:px-10">
        <SectionHeader
          label={cx("people.label")}
          title={cx("people.title")}
          description={cx("people.description")}
        />
        <div className="mt-10">
          <PeopleCarousel
            members={people}
            slots={images}
            prevLabel={tCommon("previous")}
            nextLabel={tCommon("next")}
          />
        </div>
      </section>

      {/* The Proof — Partners orbit. 배경은 궤도 클러스터 + 그 뒤로 좌우로 퍼지는
          동심원 리플 글로우(Figma Frame 146의 Group 24 + Group 10)를 한 장으로 합성한
          에셋. 리플(폭 1620)이 콘텐츠(1360)보다 넓어 바깥으로 살짝 블리드하므로
          섹션을 풀폭 + overflow-hidden으로 두고, 헤더만 콘텐츠 폭으로 정렬한다. */}
      <section className="relative overflow-hidden pt-40">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <SectionHeader
            label={cx("proof.label")}
            title={cx("proof.title")}
            description={cx("proof.description")}
          />
        </div>
        <div
          role="img"
          aria-label="Partners & IP: NAXOS, TEICHIKU, KORG, Dolby Atmos, Genelec, Grammy Voting Member"
          className="mx-auto mt-12 aspect-[1620/1026] w-full max-w-[1620px] bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/about/partners.png)" }}
        />
      </section>

      {/* The Presence — Studios (Figma "Studio": two centered cards) */}
      <section data-reveal className="mx-auto max-w-[1440px] px-6 pt-40 lg:px-10">
        <SectionHeader
          label={cx("presence.label")}
          title={cx("presence.title")}
          description={cx("presence.description")}
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {STUDIO_IMAGES.map((_img, idx) => {
            const i = idx + 1; // caption position (1, 2)
            const photo = 3 - i; // swapped photo: card 1 shows studio-2's image, card 2 shows studio-1's
            return (
              <div
                key={i}
                className="relative aspect-[57/50] overflow-hidden"
              >
                <SlotImage
                  slots={images}
                  slotKey={`studio-${photo}`}
                  fallbackSrc={STUDIO_IMAGES[photo - 1]}
                  alt={cx(`presence.studio${i}Name`)}
                  fill
                  sizes="(min-width: 640px) 460px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
                  <h3 className="text-xl font-semibold tracking-[-0.24px] md:text-2xl">
                    {cx(`presence.studio${i}Name`)}
                  </h3>
                  <p className="mt-0.5 text-[13px] tracking-[-0.13px] text-white/80 md:text-[15px]">
                    {cx(`presence.studio${i}DescKr`)}
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed tracking-[-0.13px] text-white/65 md:text-[15px]">
                    {cx(`presence.studio${i}DescEn`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ContactCta />
      <SectionReveal />
    </>
  );
}
