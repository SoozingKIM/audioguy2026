import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactCta } from "@/components/ContactCta";
import {
  PeopleCarousel,
  type PeopleMember,
} from "@/components/PeopleCarousel";
import { SlotImage } from "@/components/SlotImage";
import { contentResolver, getPageContent } from "@/lib/pageContent";
import { getPageImages } from "@/lib/pageImages";

const STUDIO_IMAGES = ["/about/studio-1.jpg", "/about/studio-2.jpg"];

// About hero glow — Figma Frame 20: a soft base ellipse, two mirrored ripple
// "Union" rings, and three blue/purple glow ellipses. Reproduced from the
// original Figma SVGs, positioned/sized as % of a 1360×660 stage so the whole
// cluster scales together. Order is back→front.
const G = "/about/hero";
const HERO_GLOW: {
  src: string;
  w: number;
  h: number;
  x: number;
  y: number;
  flip?: boolean;
}[] = [
  { src: "ellipse3", w: 119.27, h: 132.42, x: 50, y: 50 },
  { src: "union", w: 55.87, h: 112.69, x: 38.12, y: 49.92 },
  { src: "union", w: 55.87, h: 112.69, x: 64.26, y: 49.92, flip: true },
  { src: "ellipse1", w: 45.59, h: 93.94, x: 44.85, y: 50 },
  { src: "ellipse4", w: 45.59, h: 93.94, x: 69.12, y: 52.42 },
  { src: "ellipse2", w: 52.94, h: 109.09, x: 54.56, y: 50 },
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

  const people: PeopleMember[] = [1, 2, 3, 4].map((i) => ({
    slotKey: `team-${i}`,
    fallbackSrc: `/about/team-${i}.jpg`,
    name: cx(`people.member${i}Name`),
    role: cx(`people.member${i}Role`),
  }));

  return (
    <>
      {/* Hero — The Soul (Figma Frame 20) */}
      <section className="relative flex min-h-[380px] items-center justify-center overflow-hidden bg-background px-10 sm:min-h-[480px] md:min-h-[600px] lg:min-h-[660px]">
        {/* Layered glow + ripple rings, centered on a fixed-aspect stage */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-[68/33] w-[760px] -translate-x-1/2 -translate-y-1/2 sm:w-[1040px] md:w-[1360px]"
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

        {/* Text, positioned per Figma over the same stage */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-[68/33] w-[760px] -translate-x-1/2 -translate-y-1/2 sm:w-[1040px] md:w-[1360px]">
          <div className="absolute left-1/2 top-[31.8%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-foreground/50 md:text-xs">
              {cx("hero.eyebrow")}
            </p>
            <p className="text-[28px] font-bold leading-[1.2] tracking-[-1px] text-foreground md:text-[40px] md:tracking-[-1.5px]">
              {cx("hero.soul")}
            </p>
          </div>
          <h1 className="absolute left-1/2 top-[45.2%] w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center text-[28px] font-bold leading-[1.4] tracking-[-0.46px] text-white md:text-[46px]">
            {cx("hero.title")}
          </h1>
          <p className="absolute left-1/2 top-[55%] w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center text-[16px] font-bold leading-[1.4] tracking-[-0.28px] text-white/70 md:text-[28px]">
            {cx("hero.subtitle")}
          </p>
        </div>
      </section>

      {/* The Scale (Figma "Numbers") — decorative bg curve + frosted stat cards */}
      <section className="relative overflow-hidden pb-12 pt-20">
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
        <div className="relative z-10 mx-auto max-w-7xl px-8 lg:px-14">
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
      <section className="mx-auto max-w-7xl px-8 pt-24 lg:px-14">
        <SectionHeader
          label={cx("ecosystem.label")}
          title={cx("ecosystem.title")}
          description={cx("ecosystem.description")}
        />
        <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-[1fr_1.3fr]">
          <div className="relative aspect-4/3 overflow-hidden">
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
      <section className="mx-auto max-w-7xl px-8 pt-24 lg:px-14">
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
      <section className="mt-24 bg-[#121318] py-20 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-8 lg:px-14">
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

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#222328] p-7">
                <p className="text-xl font-semibold tracking-[-0.24px] md:text-2xl">
                  {cx("tech.cardTitle")}
                </p>
                <p className="mt-2 text-[13px] leading-[1.4] tracking-[-0.15px] text-white/66 md:text-[15px]">
                  {cx("tech.cardDesc")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The People */}
      <section className="mx-auto max-w-7xl px-8 pt-24 lg:px-14">
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

      {/* The Proof — Partners orbit */}
      <section className="mx-auto max-w-7xl px-8 pt-24 lg:px-14">
        <SectionHeader
          label={cx("proof.label")}
          title={cx("proof.title")}
          description={cx("proof.description")}
        />
        <div
          role="img"
          aria-label="Partners & IP: NAXOS, TEICHIKU, KORG, Dolby Atmos, Genelec, Grammy Voting Member"
          className="mx-auto mt-12 aspect-[1622/874] w-full max-w-[1080px] bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/about/partners.png)" }}
        />
      </section>

      {/* The Presence — Studios (Figma "Studio": two centered cards) */}
      <section className="mx-auto max-w-7xl px-8 pt-24 lg:px-14">
        <SectionHeader
          label={cx("presence.label")}
          title={cx("presence.title")}
          description={cx("presence.description")}
        />
        <div className="mx-auto mt-10 grid max-w-[940px] grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
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
    </>
  );
}
