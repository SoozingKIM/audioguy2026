import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactCta } from "@/components/ContactCta";
import { CountUpStat } from "@/components/CountUpStat";
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

// The Proof — partner / IP logos, one per square cell.
const PROOF_LOGOS: { src: string; alt: string }[] = [
  { src: "/about/proof/naxos.jpeg", alt: "NAXOS" },
  { src: "/about/proof/teichiku.jpg", alt: "TEICHIKU" },
  { src: "/about/proof/korg.webp", alt: "KORG" },
  { src: "/about/proof/dolby-atmos.svg", alt: "Dolby Atmos" },
  { src: "/about/proof/genelec.webp", alt: "Genelec" },
  { src: "/about/proof/grammy.webp", alt: "Grammy Voting Member" },
];

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

// The Heritage — company milestones grouped by year, newest first (Figma
// "Timeline"). `highlight` marks the major achievements (filled marker + bold);
// `sub` holds nested detail lines (e.g. 2023's sub-projects).
type HeritageItem = { text: string; highlight?: boolean };
const HERITAGE: { year: string; items: HeritageItem[] }[] = [
  {
    year: "2026",
    items: [
      { text: "예술경영지원센터 성장도약 프로그램 선정", highlight: true },
      {
        text: "한국콘텐츠진흥원 인공지능콘텐츠 제작지원사업 선정 (협력형)",
        highlight: true,
      },
    ],
  },
  {
    year: "2025",
    items: [
      { text: "K-Culture R&D 사업 선정" },
      { text: "자체 AI 공간음향 제작엔진 AI-SPHR 1단계 개발 완료", highlight: true },
      { text: "CES 2026 피칭 완료 (HAVAS, LIB MGMT 등 다수 기업 후속 진행)" },
      {
        text: "일본 4대 메이저 테이크엔터 100곡 초도 계약 완료 (500만 엔)",
        highlight: true,
      },
      { text: "T-Square 16트랙 수급·제작 착수, 3월 릴리스 계약 완료", highlight: true },
      { text: "Dolby Japan 시연 진행, 500만 엔 딜 소싱" },
      { text: "한국콘텐츠진흥원 신기술융합콘텐츠 데모데이 장려상 수상", highlight: true },
    ],
  },
  {
    year: "2024",
    items: [
      { text: "TIPS 선정" },
      {
        text: "메이브, 플레이브, 리센느, tripleS, Naevis, (G)I-DLE 등 K-POP 아티스트 공간음향 작업",
      },
      { text: "예술경영지원센터 창업도약 지원사업 선정, 우수 판정", highlight: true },
      { text: "한국콘텐츠진흥원 뮤직테크 지원사업" },
      { text: "투자유치 SEED 7억 원 (킹슬리벤처스, CNT TECH)" },
      { text: "광주 음악창작소 뮤지션 제작지원 / 인큐베이팅 사업 운영 (3년 연속)" },
      { text: "한국콘텐츠진흥원 KNOCK 최우수상 수상" },
      {
        text: "Apple Vision Pro용 공간음향 라디오 스트리밍 애플리케이션 AUDIOSPHR lite 버전 출시",
        highlight: true,
      },
    ],
  },
  {
    year: "2023",
    items: [
      { text: "한국콘텐츠진흥원 신기술 콘텐츠랩 운영" },
      { text: "한국콘텐츠진흥원 신기술 융합 온·오프라인 공연사업 수행" },
      { text: "전라북도 레드로드 음악창작소 음원·음반 제작 및 유통지원 운영용역 수행" },
      { text: "서울시향 공간음향 라이브 스트리밍 (예술의전당 콘서트홀)" },
    ],
  },
];

function SectionHeader({
  label,
  title,
  description,
  wideDescription = false,
}: {
  label: string;
  title: string;
  description?: string;
  /** 제목 컬럼을 좁히고 설명 컬럼을 넓혀 긴 설명을 한 줄로 둔다. 기본은 2등분. */
  wideDescription?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase leading-normal tracking-[-0.12px] text-secondary">
        {label}
      </p>
      <div
        className={`mt-3 grid grid-cols-1 items-end gap-x-5 gap-y-3 ${
          wideDescription ? "md:grid-cols-[0.6fr_1.4fr]" : "md:grid-cols-2"
        }`}
      >
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] text-foreground md:text-[40px] md:leading-[1.2]">
          {title}
        </h2>
        {description ? (
          <p
            className={`text-[15px] leading-normal tracking-[-0.18px] text-secondary md:text-[18px] ${
              wideDescription ? "md:text-right" : ""
            }`}
          >
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

          {/* Text (모바일) — 좁은 스테이지에 겹치지 않도록 일반 세로 중앙 정렬 */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white md:hidden">
            <p className="text-[11px] font-medium uppercase leading-[1.5] tracking-[-0.12px] text-white/60">
              {cx("hero.eyebrow")}
            </p>
            <p className="text-[26px] font-bold leading-[1.3] tracking-[-1px]">
              {cx("hero.soul")}
            </p>
            <h1 className="mt-2 text-[23px] font-bold leading-[1.35] tracking-[-0.4px]">
              {cx("hero.title")}
            </h1>
            <p className="text-[15px] font-bold leading-[1.4] tracking-[-0.2px] text-white/60">
              {cx("hero.subtitle")}
            </p>
          </div>

          {/* Text (md+) — Figma Frame 20 배치: 32:11 스테이지에 %로 절대 배치 */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden aspect-32/11 w-full -translate-x-1/2 -translate-y-1/2 text-white md:block">
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
      <section data-reveal className="relative overflow-hidden pb-12 pt-24 md:pt-36">
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
                <CountUpStat
                  value={cx(`scale.stat${i}Value`)}
                  className="w-full text-right text-[36px] font-bold leading-[1.2] tracking-[-1.04px] text-foreground md:text-[52px]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Ecosystem */}
      <section className="mx-auto max-w-[1440px] px-6 pt-28 md:pt-44 lg:px-10">
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
                data-reveal
                className="grid grid-cols-1 gap-1 border-b border-foreground/10 py-6 md:grid-cols-[1fr_auto] md:items-center md:gap-6"
              >
                <h3 className="text-3xl font-bold leading-[1.2] tracking-[-0.46px] text-foreground md:text-[46px]">
                  {cx(`ecosystem.brand${i}Name`)}
                </h3>
                <p className="text-[13px] leading-normal tracking-[-0.15px] text-secondary md:text-right md:text-[15px]">
                  {cx(`ecosystem.brand${i}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Heritage — centred zig-zag timeline of company milestones */}
      <section className="mx-auto max-w-[1440px] px-6 pb-20 pt-32 md:pb-32 md:pt-64 lg:px-10">
        <SectionHeader
          label={cx("heritage.label")}
          title={cx("heritage.title")}
          description={cx("heritage.description")}
        />
        {/* Centred timeline: a rail down the middle (left edge on mobile), a
            node per year, achievements alternating left/right of the rail and
            hugging the centre. Years fade subtly toward the past. */}
        <div className="relative mx-auto mt-16 max-w-[1080px] md:mt-24">
          {/* Rail */}
          <div
            aria-hidden
            className="absolute bottom-1 top-1 w-px bg-foreground/15 left-[5px] md:left-1/2 md:-translate-x-1/2"
          />
          <div className="flex flex-col gap-16 md:gap-24">
            {HERITAGE.map((group, idx) => {
              const left = idx % 2 === 1; // alternate sides on desktop
              return (
                // data-reveal: each year fades + rises in as it scrolls into
                // view (handled by <SectionReveal />). `group` enables the
                // node's hover response below.
                <div key={group.year} data-reveal className="group relative">
                  {/* Year node on the rail — grows when the row is hovered */}
                  <span
                    aria-hidden
                    className="absolute top-[7px] z-10 h-[11px] w-[11px] rounded-full bg-foreground ring-4 ring-background transition-transform duration-300 ease-out group-hover:scale-[1.6] left-0 md:left-1/2 md:top-3 md:-translate-x-1/2"
                  />
                  {/* Content — full width past the left rail on mobile; one half,
                      alternating, on desktop. */}
                  <div
                    className={`pl-7 md:w-1/2 md:pl-0 ${
                      left ? "md:pr-14 md:text-right" : "md:ml-auto md:pl-14"
                    }`}
                  >
                    <div
                      className="text-[30px] font-bold leading-none tracking-[-0.46px] text-foreground md:text-[44px]"
                      style={{ opacity: 1 - idx * 0.16 }}
                    >
                      {group.year}
                    </div>
                    <ul
                      className={`mt-7 flex flex-col gap-5 md:gap-6 ${
                        left ? "md:items-end" : ""
                      }`}
                    >
                      {group.items.map((item, i) => (
                        <li
                          key={i}
                          className={`flex flex-col gap-1.5 ${
                            left ? "md:items-end" : ""
                          }`}
                        >
                          <span className="max-w-lg cursor-default text-pretty break-keep text-[16px] font-medium leading-relaxed tracking-[-0.2px] text-secondary transition-colors duration-300 hover:text-foreground md:text-[18px]">
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech — 검증된 기술력 (Dark) */}
      <section className="relative isolate mt-28 overflow-hidden bg-[#121318] py-40 text-white md:mt-44 md:py-80">
        {/* 위·아래 페이드: 다크 밴드를 위/아래 흰 배경과 자연스럽게 연결 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 md:h-80"
          style={{
            background:
              "linear-gradient(to bottom, #f7f9fa 0%, rgba(247,249,250,0.88) 16%, rgba(247,249,250,0.62) 34%, rgba(247,249,250,0.35) 52%, rgba(247,249,250,0.16) 70%, rgba(247,249,250,0.06) 85%, rgba(247,249,250,0) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 md:h-80"
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

      {/* The People — 헤더·캐러셀 각각 reveal(콘텐츠가 보일 때 올라옴) */}
      <section className="mx-auto max-w-[1440px] px-6 pt-28 md:pt-44 lg:px-10">
        <div data-reveal>
          <SectionHeader
            label={cx("people.label")}
            title={cx("people.title")}
            description={cx("people.description")}
          />
        </div>
        <div data-reveal className="mt-10">
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
      {/* 섹션 단위 reveal: Presence와 트리거 지점(각 섹션 top)이 벌어져 각각 따로 올라온다 */}
      <section data-reveal className="relative overflow-hidden pt-28 md:pt-44">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <SectionHeader
            label={cx("proof.label")}
            title={cx("proof.title")}
            description={cx("proof.description")}
            wideDescription
          />
        </div>
        <div className="mx-auto mt-12 grid max-w-[1440px] grid-cols-2 gap-4 px-6 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6 lg:px-10">
          {PROOF_LOGOS.map((logo) => (
            <div
              key={logo.src}
              className="relative aspect-square border border-[#d2d3d5]/40 bg-[#f3f5f8]/70 backdrop-blur-[25px]"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 45vw"
                className="object-contain p-8"
              />
            </div>
          ))}
        </div>
      </section>

      {/* The Presence — Studios (Figma "Studio": two centered cards) */}
      <section data-reveal className="mx-auto max-w-[1440px] px-6 pt-28 md:pt-44 lg:px-10">
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
