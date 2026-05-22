import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactCta } from "@/components/ContactCta";
import { SlotImage } from "@/components/SlotImage";
import {
  ServiceAccordion,
  type ServiceItem,
} from "@/components/ServiceAccordion";
import { TeamGrid, type TeamMember } from "@/components/TeamGrid";
import { Link } from "@/i18n/navigation";
import { contentResolver, getPageContent } from "@/lib/pageContent";
import { getPageImages } from "@/lib/pageImages";

const DISCOGRAPHY_PLACEHOLDERS = Array.from({ length: 5 });

export default async function AudioguyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Audioguy");
  const tCommon = await getTranslations("Common");
  const c = await getPageContent("audioguyPage");
  const cx = contentResolver(c, locale, t);
  const { images } = await getPageImages("audioguyPage");

  const services: ServiceItem[] = [
    {
      id: "location",
      title: cx("locationRecording"),
      label: cx("locationLabel"),
      titleEn: cx("locationTitleEn"),
      subKr: cx("locationSubKr"),
      body: [cx("locationBody1"), cx("locationBody2")],
      images: [
        {
          slotKey: "orchestra-1",
          fallbackSrc: "/audioguy/orchestra-1.jpg",
          alt: `${cx("locationRecording")} 1`,
        },
        {
          slotKey: "orchestra-2",
          fallbackSrc: "/audioguy/orchestra-2.jpg",
          alt: `${cx("locationRecording")} 2`,
        },
      ],
    },
    {
      id: "studioRec",
      title: cx("studioRecording"),
      label: cx("studioRecLabel"),
      titleEn: cx("studioRecTitleEn"),
      subKr: cx("studioRecSubKr"),
      images: [
        { slotKey: "studioRec-1", alt: `${cx("studioRecording")} 1` },
        { slotKey: "studioRec-2", alt: `${cx("studioRecording")} 2` },
      ],
    },
    {
      id: "mixing",
      title: cx("mixingMaster"),
      label: cx("mixingLabel"),
      titleEn: cx("mixingTitleEn"),
      subKr: cx("mixingSubKr"),
      images: [
        { slotKey: "mixing-1", alt: `${cx("mixingMaster")} 1` },
        { slotKey: "mixing-2", alt: `${cx("mixingMaster")} 2` },
      ],
    },
    {
      id: "demo",
      title: cx("demoTape"),
      label: tCommon("memoNeeded"),
      images: [
        { slotKey: "demo-1", alt: `${cx("demoTape")} 1` },
        { slotKey: "demo-2", alt: `${cx("demoTape")} 2` },
      ],
    },
  ];

  const team: TeamMember[] = [
    {
      name: cx("team1Name"),
      role: cx("team1Role"),
      slotKey: "team-1",
      fallbackSrc: "/audioguy/team-1.jpg",
      bio: [],
    },
    {
      name: cx("team2Name"),
      role: cx("team2Role"),
      slotKey: "team-2",
      bio: [cx("team2Bullet1"), cx("team2Bullet2"), cx("team2Bullet3")],
    },
  ];

  return (
    <>
      {/* Hero — background video slot. A "VIDEO" placeholder poster shows until
          a video file is provided at /agstudio/hero.mp4. */}
      <section className="relative h-[70vh] max-h-[760px] min-h-125 w-full overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={cx("heroAlt")}
          poster="/agstudio/hero-poster.svg"
        >
          <source src="/agstudio/hero.mp4" type="video/mp4" />
          <source src="/agstudio/hero.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60" />
      </section>

      {/* Introduction — services as a click-to-expand accordion */}
      <section className="mx-auto max-w-7xl px-8 pt-20 lg:px-14">
        <p className="text-xs uppercase leading-normal tracking-[-0.12px] text-secondary">
          {cx("introduction")}
        </p>
        <ServiceAccordion
          items={services}
          slots={images}
          imageNeeded={tCommon("imageNeeded")}
        />
      </section>

      {/* STUDIO */}
      <section className="mx-auto max-w-7xl px-8 pt-24 lg:px-14">
        <div className="grid grid-cols-1 items-start gap-x-5 gap-y-6 md:grid-cols-2">
          <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
            {cx("studio")}
          </h2>
          <div>
            <p className="text-[15px] leading-normal tracking-[-0.15px] text-tertiary">{cx("studioSubKr")}</p>
            <p className="mt-3 text-lg font-semibold leading-[1.4] tracking-[-0.23px] text-foreground md:text-[23px]">
              {cx("studioName")}
            </p>
            <p className="mt-3 max-w-xl text-[15px] leading-[1.4] tracking-[-0.18px] text-secondary md:text-[18px]">
              {cx("studioBody")}
            </p>
          </div>
        </div>
        <div className="relative mt-10 aspect-video w-full overflow-hidden">
          <SlotImage
            slots={images}
            slotKey="piano"
            fallbackSrc="/audioguy/piano.jpg"
            alt={cx("studioName")}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* DISCOGRAPHY — 최근 실황 작업 / 선별한 발매 앨범 as separate rows */}
      <section className="mx-auto max-w-7xl px-8 pt-24 lg:px-14">
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
          {cx("discography")}
        </h2>
        {[cx("recentWork"), cx("selectedAlbums")].map((rowLabel) => (
          <div key={rowLabel} className="mt-10">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium tracking-[-0.18px] text-foreground md:text-[18px]">
                {rowLabel}
              </span>
              <Link
                href="/discography?brand=audioguy"
                className="text-[15px] font-medium tracking-[-0.15px] text-tertiary underline-offset-4 hover:text-foreground hover:underline"
              >
                {tCommon("viewMore")}
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
              {DISCOGRAPHY_PLACEHOLDERS.map((_, i) => (
                <div key={i}>
                  <div className="flex aspect-square items-center justify-center bg-foreground/3">
                    <span className="text-sm font-semibold text-red-500">
                      {tCommon("imageNeeded")}
                    </span>
                  </div>
                  <div className="mt-3 text-sm font-semibold text-red-500">
                    {tCommon("contentNeeded")}
                  </div>
                  <div className="text-xs text-red-500/80">
                    {tCommon("contentNeeded")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* OUR TEAM (Figma Frame 206) */}
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
