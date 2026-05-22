import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactCta } from "@/components/ContactCta";
import {
  StudioCarousel,
  type StudioSlide,
} from "@/components/StudioCarousel";
import { TeamGrid, type TeamMember } from "@/components/TeamGrid";
import { Link } from "@/i18n/navigation";
import { contentResolver, getPageContent } from "@/lib/pageContent";
import { getPageImages } from "@/lib/pageImages";

// Point cards & service icons reproduced from Figma as exported images.
const POINT_CARDS = [1, 2, 3] as const;
// Soft glow background (icon-N.png) + crisp high-res icon overlaid on top.
const SERVICES = [
  { key: "service1", fg: "icon-fg-1.png", fgSize: 33.5, fgOpacity: 1 },
  { key: "service2", fg: "icon-fg-2.png", fgSize: 29.9, fgOpacity: 0.9 },
  { key: "service3", fg: "icon-fg-3.png", fgSize: 29.9, fgOpacity: 1 },
  { key: "service4", fg: null, fgSize: 0, fgOpacity: 1 },
] as const;
const DISCOGRAPHY_PLACEHOLDERS = Array.from({ length: 5 });

// Studio image carousel — each slide shows the local fallback by default and can
// be overridden per-slot in Sanity (sound360Page → "Studio · 캐러셀").
const STUDIO_SLIDES: StudioSlide[] = [
  { slotKey: "studio", fallbackSrc: "/sound360/studio.jpg" },
  { slotKey: "studio-2", fallbackSrc: "/sound360/studio-2.jpg" },
  { slotKey: "studio-3", fallbackSrc: "/sound360/studio-3.jpg" },
  { slotKey: "studio-4", fallbackSrc: "/sound360/studio-4.jpg" },
];

export default async function Sound360Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Sound360");
  const tCommon = await getTranslations("Common");
  const c = await getPageContent("sound360Page");
  const cx = contentResolver(c, locale, t);
  const { images } = await getPageImages("sound360Page");

  const team: TeamMember[] = [
    {
      name: cx("team1Name"),
      role: cx("team1Role"),
      slotKey: "team-1",
      bio: [],
    },
    {
      name: cx("team2Name"),
      role: cx("team2Role"),
      slotKey: "team-2",
      bio: [],
    },
  ];

  return (
    <>
      {/* Hero — dark with glow + 360 logo (Figma Frame 211) */}
      <section
        className="relative isolate overflow-hidden px-8 pb-28 pt-16 text-white md:pb-40 md:pt-20 lg:px-14"
        style={{
          background:
            "linear-gradient(118deg, #2a1648 0%, #1a1f4d 46%, #34548a 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-70 mix-blend-screen"
          style={{ backgroundImage: "url(/sound360/hero-glow.png)" }}
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <Image
            src="/sound360/logo-360.png"
            alt="SOUND360"
            width={35}
            height={40}
            className="h-10 w-auto"
          />
          <div className="mt-16 max-w-3xl md:mt-24">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/70">
              {cx("label")}
            </p>
            <h1 className="mt-3 text-[28px] font-semibold leading-[1.3] tracking-tight md:text-[40px]">
              {cx("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.6] tracking-[-0.18px] text-white/55 md:text-base">
              {cx("description")}
            </p>
          </div>
        </div>
      </section>

      {/* 3 Point cards — rising panel, exact Figma card visuals (Figma Frame 217) */}
      <section className="relative z-10 -mt-16 rounded-t-[32px] bg-background px-8 pt-10 md:-mt-24 md:rounded-t-[40px] lg:px-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {POINT_CARDS.map((n) => (
            <div
              key={n}
              className="aspect-[55/71] overflow-hidden bg-[#0c0a20] bg-cover bg-center"
              style={{ backgroundImage: `url(/sound360/point-${n}.png)` }}
            />
          ))}
        </div>
      </section>

      {/* Work scope — service icon cards (Figma Frame 203) */}
      <section className="mx-auto max-w-7xl px-8 pt-24 lg:px-14">
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
          {cx("workScope")}
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {SERVICES.map((s, i) => (
            <div key={s.key} className="flex flex-col gap-3">
              <div
                className="relative aspect-[82/65] overflow-hidden bg-[#0a0b14] bg-cover bg-center"
                style={{ backgroundImage: `url(/sound360/icon-${i + 1}.png)` }}
              >
                {s.fg ? (
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 bg-contain bg-center bg-no-repeat"
                    style={{
                      width: `${s.fgSize}%`,
                      opacity: s.fgOpacity,
                      backgroundImage: `url(/sound360/${s.fg})`,
                    }}
                  />
                ) : null}
              </div>
              <div className="flex flex-col gap-0.5 text-center">
                <p className="text-lg font-bold tracking-[-0.22px] text-foreground md:text-[22px]">
                  {cx(s.key)}
                </p>
                <p className="text-[13px] font-medium tracking-[-0.13px] text-foreground/45">
                  {tCommon("contentNeeded")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STUDIO (dark) */}
      <section className="mt-24 bg-[#121318] py-20 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-8 lg:px-14">
          <div className="grid grid-cols-1 items-start gap-x-5 gap-y-6 md:grid-cols-2">
            <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
              {cx("studio")}
            </h2>
            <div>
              <p className="text-[15px] leading-normal tracking-[-0.15px] text-disabled">
                {cx("studioSubKr")}
              </p>
              <p className="mt-3 text-lg font-semibold leading-[1.4] tracking-[-0.23px] md:text-[23px]">
                {cx("studioTitle")}
              </p>
              <p className="mt-1 max-w-md text-[15px] font-medium leading-[1.4] tracking-[-0.18px] text-white/80 md:text-[18px]">
                {cx("studioBody")}
              </p>
            </div>
          </div>

          <StudioCarousel
            slides={STUDIO_SLIDES}
            slots={images}
            alt={cx("studioTitle")}
            imageNeeded={tCommon("imageNeeded")}
            prevLabel={tCommon("previous")}
            nextLabel={tCommon("next")}
          />
        </div>
      </section>

      {/* DISCOGRAPHY */}
      <section className="mx-auto max-w-7xl px-8 pt-24 lg:px-14">
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
          {cx("discography")}
        </h2>
        <div className="mt-10 flex items-center justify-between">
          <p className="text-[15px] font-medium tracking-[-0.18px] text-foreground md:text-[18px]">
            {cx("selectedAlbums")}
          </p>
          <Link
            href="/discography?brand=sound360"
            className="text-[15px] font-medium tracking-[-0.15px] text-tertiary underline-offset-4 hover:text-foreground hover:underline"
          >
            {tCommon("viewMore")}
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {DISCOGRAPHY_PLACEHOLDERS.map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex h-[200px] items-center justify-center bg-background-white md:h-[260px]">
                <span className="text-[15px] font-semibold text-[#f23838] md:text-[18px]">
                  {tCommon("imageNeeded")}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-lg font-medium tracking-[-0.22px] text-[#f23838] md:text-[22px]">
                  {tCommon("contentNeeded")}
                </div>
                <div className="text-[13px] tracking-[-0.13px] text-[#f23838]/80">
                  {tCommon("contentNeeded")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OUR TEAM */}
      <section className="mx-auto max-w-7xl px-8 pt-24 lg:px-14">
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
          {cx("ourTeam")}
        </h2>
        <TeamGrid
          members={team}
          slots={images}
          bioFallback={tCommon("comingSoon")}
        />
      </section>

      <ContactCta />
    </>
  );
}
