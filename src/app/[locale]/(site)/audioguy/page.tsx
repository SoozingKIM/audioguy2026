import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactCta } from "@/components/ContactCta";
import { SectionReveal } from "@/components/SectionReveal";
import { SlotImage } from "@/components/SlotImage";
import { HoverVideoEmbed } from "@/components/HoverVideoEmbed";
import { type ServiceItem } from "@/components/ServiceAccordion";
import { TeamGrid, type TeamMember } from "@/components/TeamGrid";
// 임시 숨김: discography "더보기" 버튼 주석 처리로 Link 미사용 (복구 시 주석 해제)
// import { Link } from "@/i18n/navigation";
import { contentResolver, getPageContent } from "@/lib/pageContent";
import { findSlot, getPageImages, imageUrl } from "@/lib/pageImages";
import { sanityFetch } from "@/sanity/lib/fetch";
import { brandRecentDiscographyQuery } from "@/sanity/lib/queries";
import type { DiscographyEntry } from "@/sanity/types";

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

  // Discography preview: the 5 most recently added audioguy-brand entries.
  // Managed in Sanity Studio (Discography Entry docs, brand="audioguy").
  const discography = await sanityFetch<DiscographyEntry[]>({
    query: brandRecentDiscographyQuery,
    params: { brand: "audioguy", limit: 5 },
    tags: ["discographyEntry", "brand:audioguy"],
  }).catch(() => []);

  // Location Recording 협업/녹음 기관 로고 (4열 × 2행). 파일: /public/audioguy/location-logos/.
  // 각 원본은 흰 배경 여백을 트림해 콘텐츠로 맞춤.
  const LOCATION_LOGOS = [
    { file: "incheon-phil.png", alt: "인천시립교향악단" },
    { file: "cheonan-phil.png", alt: "천안시립교향악단" },
    { file: "goyang-choir.png", alt: "고양시립합창단" },
    { file: "arte.png", alt: "한경 arte" },
    { file: "national-symphony.svg", alt: "국립심포니오케스트라" },
    { file: "incheon-chorale.png", alt: "인천시립합창단" },
    { file: "kno.png", alt: "국립오페라단" },
    { file: "gwangju-symphony.png", alt: "광주시립교향악단" },
    { file: "suwon-phil.png", alt: "수원시립교향악단" },
  ] as const;

  // Location Recording은 아코디언에서 분리해 아래 단독 섹션으로 렌더한다.
  const services: ServiceItem[] = [
    {
      id: "studioRec",
      title: cx("studioRecording"),
      label: cx("studioRecLabel"),
      titleEn: cx("studioRecTitleEn"),
      subKr: cx("studioRecSubKr"),
      images: [
        { slotKey: "studioRec-1", alt: `${cx("studioRecording")} 1` },
      ],
    },
    {
      id: "mixing",
      title: cx("mixingMaster"),
      label: cx("mixingLabel"),
      titleEn: cx("mixingTitleEn"),
      subKr: cx("mixingSubKr"),
      images: [
        { slotKey: "mixing-2", alt: `${cx("mixingMaster")} 2` },
      ],
    },
    // 임시 숨김: Demo Tape 아코디언 항목 (복구하려면 주석 해제)
    // {
    //   id: "demo",
    //   title: cx("demoTape"),
    //   label: tCommon("memoNeeded"),
    //   images: [
    //     { slotKey: "demo-1", alt: `${cx("demoTape")} 1` },
    //     { slotKey: "demo-2", alt: `${cx("demoTape")} 2` },
    //   ],
    // },
  ];

  const team: TeamMember[] = [
    {
      name: cx("team1Name"),
      role: cx("team1Role"),
      slotKey: "team-1",
      fallbackSrc: "/audioguy/team-1.jpg",
      bio: [cx("team1Bullet1"), cx("team1Bullet2"), cx("team1Bullet3")],
    },
    {
      name: cx("team2Name"),
      role: cx("team2Role"),
      slotKey: "team-2",
      fallbackSrc: "/audioguy/team-2.jpg",
      bio: [
        cx("team2Bullet1"),
        cx("team2Bullet2"),
        cx("team2Bullet3"),
        cx("team2Bullet4"),
      ],
    },
    {
      name: "오정석",
      role: "어시스턴트",
      slotKey: "team-3",
      fallbackSrc: "/audioguy/team-3-ojs2.jpg",
      bio: [
        "고양시 음악창작소 스튜디오 음향감독",
        "The Loud 스튜디오 음향감독",
        "SynkOn Production 음향감독",
        "재즈클럽 야누스 음향감독",
        "다수 연극 플레이백 엔지니어",
        "다수 인디밴드 레코딩/믹싱 엔지니어",
      ],
    },
    {
      name: "황수찬",
      role: "어시스턴트",
      slotKey: "team-4",
      fallbackSrc: "/audioguy/team-4-hsc.jpg",
      bio: ["2024년 ~ 하우스콘서트 녹음 감독"],
    },
  ];

  return (
    <>
      {/* Hero — brand video + 반투명 레이어 + 타이틀 오버레이 */}
      <section className="w-full overflow-hidden bg-black">
        <div className="relative mx-auto max-w-[1600px]">
          <HoverVideoEmbed id="Mf-rfCF3Neo" title={cx("heroAlt")} />
          {/* 하단 그라데이션 디졸브 (Sound360 · Seoro 톤). pointer-events-none 로 호버 버튼/클릭 유지 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/75 via-black/25 to-transparent"
          />
          {/* 타이틀 — Seoro · Sound360 히어로의 h1 위치(상단 패딩 + 라벨 아래)를 그대로 재현 */}
          <div className="pointer-events-none absolute inset-0">
            <div className="mx-auto w-full max-w-7xl px-6 pt-8 sm:px-8 sm:pt-16 lg:px-14 md:pt-36">
              <p className="text-sm font-semibold tracking-[0.06em] text-white drop-shadow sm:text-lg md:text-[26px]">
                AG STUDIO
              </p>
              <h1 className="mt-1.5 text-[30px] font-semibold leading-[1.05] tracking-[-0.02em] text-white drop-shadow-lg sm:mt-3 sm:text-[44px] md:mt-4 md:text-[72px] lg:text-[96px]">
                Audioguy Studio
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* DISCOGRAPHY — brand "audioguy" entries from Sanity (managed in Studio
          → Discography Entry, filtered to brand=audioguy, 5 most recent). */}
      <section
        className="py-28 md:py-40"
        style={{
          background:
            "linear-gradient(135deg, #e7e3fb 0%, #dbe4fc 52%, #e4eefb 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl px-8 lg:px-14">
        <h2 data-reveal className="text-[34px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[52px]">
          {cx("discography")}
        </h2>
        <div className="mt-10 flex items-center justify-between">
          <p className="text-[15px] font-medium tracking-[-0.18px] text-foreground md:text-[18px]">
            {cx("selectedAlbums")}
          </p>
          {/* 임시 숨김: discography "더보기" 버튼 (복구하려면 주석 해제 + 상단 Link import 복구)
          <Link
            href="/discography?brand=audioguy"
            className="text-[15px] font-medium tracking-[-0.15px] text-tertiary underline-offset-4 hover:text-foreground hover:underline"
          >
            {tCommon("viewMore")}
          </Link>
          */}
        </div>
        <div data-reveal className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
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
        </div>
      </section>

      {/* Location Recording — 아코디언에서 분리한 단독 섹션 */}
      <section className="mx-auto max-w-7xl px-8 pt-28 md:pt-48 lg:px-14">
        <p className="text-xs uppercase leading-normal tracking-[-0.12px] text-secondary">
          {cx("introduction")}
        </p>
        <div data-reveal className="mt-8 border-t border-foreground/10 pt-9 md:pt-12">
          {/* 헤더: 제목 + 메타 (본문 제거) */}
          <div className="mt-6 grid gap-x-5 gap-y-3 md:mt-10 md:grid-cols-2">
            <h2 className="text-[34px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[52px]">
              {cx("locationRecording")}
            </h2>
            <div>
              <p className="text-[15px] leading-normal tracking-[-0.15px] text-tertiary">
                {cx("locationLabel")}
              </p>
              <p className="mt-3 text-lg font-semibold leading-[1.4] tracking-[-0.23px] text-foreground md:text-[23px]">
                {cx("locationTitleEn")}
              </p>
              <p className="mt-1 text-[15px] font-medium leading-[1.4] tracking-[-0.18px] text-secondary md:text-[18px]">
                {cx("locationSubKr")}
              </p>
            </div>
          </div>

          {/* 왼쪽: 현장 사진 / 오른쪽: 협업·녹음 기관 로고 그리드 */}
          <div className="mt-16 grid items-stretch gap-10 md:mt-20 md:grid-cols-2 md:gap-12">
            {/* 사진 (왼쪽) — 높이를 오른쪽 로고 그리드(3행)에 맞춤 */}
            <div className="relative aspect-[4/3] overflow-hidden bg-foreground/3 md:aspect-auto md:h-full">
              <SlotImage
                slots={images}
                slotKey="location-photo"
                fallbackSrc="/audioguy/location-logos/IMG_2045.jpg"
                alt={cx("locationRecording")}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            {/* 로고: 오른쪽 절반, 4열 × 2행. 흰 슬롯에 가운데 정렬 */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {LOCATION_LOGOS.map((logo) => (
                <div
                  key={logo.file}
                  className="flex aspect-[16/10] items-center justify-center rounded-lg border border-foreground/10 bg-white p-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/audioguy/location-logos/${logo.file}`}
                    alt={logo.alt}
                    className="max-h-[85%] max-w-[90%] object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Studio Recording · Mixing & Mastering — 각 서비스를 풀폭 한 줄로:
            텍스트 + 큰 사진 1장을 좌우로 배치, 두 서비스는 좌우를 번갈아 놓는다. */}
        <div className="mt-32 flex flex-col gap-16 md:mt-40 md:gap-20">
          {services.map((item, idx) => {
            const flip = idx % 2 === 1; // 두 번째 서비스는 사진을 왼쪽으로
            const img = item.images?.[0];
            const hasImage =
              !!img &&
              (!!imageUrl(findSlot(images, img.slotKey)?.image) ||
                !!img.fallbackSrc);
            return (
              <div
                key={item.id}
                data-reveal
                className="border-t border-foreground/10 pt-9 md:pt-12"
              >
                <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                  {/* 텍스트 — flip(오른쪽 배치)일 때 우측 끝으로 밀어 양 끝 느낌 */}
                  <div className={flip ? "md:order-2 md:text-right" : ""}>
                    <h2 className="text-[34px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[52px]">
                      {item.title}
                    </h2>
                    {item.label ? (
                      <p className="mt-6 text-[15px] leading-normal tracking-[-0.15px] text-tertiary">
                        {item.label}
                      </p>
                    ) : null}
                    {item.titleEn ? (
                      <p className="mt-3 text-lg font-semibold leading-[1.4] tracking-[-0.23px] text-foreground md:text-[23px]">
                        {item.titleEn}
                      </p>
                    ) : null}
                    {item.subKr ? (
                      <p className="mt-1 text-[15px] font-medium leading-[1.4] tracking-[-0.18px] text-secondary md:text-[18px]">
                        {item.subKr}
                      </p>
                    ) : null}
                  </div>
                  {/* 사진 1장 */}
                  {img ? (
                    <div
                      className={`relative aspect-4/3 w-full overflow-hidden bg-foreground/3 md:max-w-sm ${
                        flip ? "md:order-1 md:mr-auto" : "md:ml-auto"
                      }`}
                    >
                      {hasImage ? (
                        <SlotImage
                          slots={images}
                          slotKey={img.slotKey}
                          fallbackSrc={img.fallbackSrc}
                          alt={img.alt}
                          fill
                          sizes="(min-width: 768px) 384px, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-sm font-semibold text-red-500">
                            {tCommon("imageNeeded")}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STUDIO — 위 '작업 내용' 그룹과 분리되도록 풀폭 화이트 밴드 */}
      <section className="mt-28 bg-background-white py-28 md:mt-48 md:py-40">
        <div className="mx-auto max-w-7xl px-8 lg:px-14">
          <div data-reveal className="grid grid-cols-1 items-start gap-x-5 gap-y-6 md:grid-cols-2">
          <h2 className="text-[34px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[52px]">
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
          <div data-reveal className="relative mt-10 aspect-video w-full overflow-hidden">
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
        </div>
      </section>

      {/* OUR TEAM (Figma Frame 206) */}
      <section className="mx-auto max-w-7xl px-8 pt-24 md:pt-44 lg:px-14">
        <h2 data-reveal className="text-[34px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[52px]">
          {cx("ourTeam")}
        </h2>
        <div data-reveal>
          <TeamGrid
            members={team}
            slots={images}
            bioFallback={tCommon("comingSoon")}
            columns={4}
            portrait
          />
        </div>
      </section>

      <ContactCta />
      <SectionReveal />
    </>
  );
}
