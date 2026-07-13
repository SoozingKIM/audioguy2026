import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ContactCta } from '@/components/ContactCta';
import { HeroVideo } from '@/components/HeroVideo';
import { SectionReveal } from '@/components/SectionReveal';
import { StudioCarousel, type StudioSlide } from '@/components/StudioCarousel';
import { TeamGrid, type TeamMember } from '@/components/TeamGrid';
import { YouTubeEmbed } from '@/components/YouTubeEmbed';
// 임시 숨김: discography "더보기" 버튼 주석 처리로 Link 미사용 (복구 시 주석 해제)
// import { Link } from "@/i18n/navigation";
import { contentResolver, getPageContent } from '@/lib/pageContent';
import { getPageImages, imageUrl } from '@/lib/pageImages';
import { sanityFetch } from '@/sanity/lib/fetch';
import { brandRecentDiscographyQuery } from '@/sanity/lib/queries';
import type { DiscographyEntry } from '@/sanity/types';

// 작업 내용 및 범위 — 4개 서비스 카드. 모두 검은 박스 + 가운데 축소 아이콘으로 통일.
// service1은 단색 아이콘이라 살짝 작게(62%), 나머지 글로우 그래픽은 78%.
const SERVICES = [
  { key: 'service1', img: 'icon-fg-1.png', maxH: 62 },
  { key: 'service2', img: 'work/spatial.jpg', maxH: 78 },
  { key: 'service3', img: 'work/post.jpg', maxH: 78 },
  { key: 'service4', img: 'work/live.jpg', maxH: 78 },
] as const;

// DISCOGRAPHY 하단 XR 카테고리 (VR/XR 콘서트 실적). 이미지는 /public/sound360/xr.
// Album 카드와 동일하게 title(곡/작품명) + artist 로 분리해 표기.
const XR_WORKS = [
  { title: '별별별 (See that)', artist: 'NMIXX', src: '/sound360/xr/nmixx.jpg' },
  { title: "World Tour ‘dominATE JAPAN’ VR", artist: 'Stray Kids', src: '/sound360/xr/straykids.jpg' },
  { title: 'LYNKPOP VR CONCERT', artist: 'aespa', src: '/sound360/xr/aespa.jpg' },
  { title: 'Hit the floor', artist: 'tripleS', src: '/sound360/xr/triples.jpg' },
] as const;

// Studio carousel slides are built at request time from
// `sound360Page.studioImages[]` in Sanity (admin can add/remove freely; the
// carousel + indicator bar auto-adapt to the count). The local /public
// fallback list below is used only when Sanity has no entries yet.
const STUDIO_FALLBACK: StudioSlide[] = [
  { slotKey: 'studio-a', fallbackSrc: '/sound360/studio/a-room.jpg' },
  { slotKey: 'studio-b', fallbackSrc: '/sound360/studio/b-room.jpg' },
  { slotKey: 'studio-c', fallbackSrc: '/sound360/studio/c-room.jpg' },
  { slotKey: 'studio-hall', fallbackSrc: '/sound360/studio/hall.jpg' },
  { slotKey: 'studio-entrance', fallbackSrc: '/sound360/studio/entrance.jpg' },
];

// SOUND360 스튜디오 주소 + 지도 링크 (네이버 지도 검색).
const SOUND360_ADDRESS = '서울시 서초구 효령로52길 57 지하 1층';
const SOUND360_MAP_HREF = `https://map.naver.com/p/search/${encodeURIComponent(
  '서초구 효령로52길 57',
)}`;
// 구글 지도 임베드 — 상호명(SOUND360) + 주소로 검색해 정확한 업체에 핀이 찍히도록 한다(키 불필요).
const SOUND360_GMAP_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(
  `SOUND360 ${SOUND360_ADDRESS}`,
)}&z=16&hl=ko&output=embed`;

export default async function Sound360Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Sound360');
  const tCommon = await getTranslations('Common');
  const c = await getPageContent('sound360Page');
  const cx = contentResolver(c, locale, t);
  const { images, heroVideo, heroVideoSound } =
    await getPageImages('sound360Page');

  // Studio carousel: pull the ordered list of slot keys from Sanity. Admin can
  // add/remove entries in `sound360Page → Studio · 캐러셀`; each entry is one
  // slide. Falls back to the local files when Sanity has nothing yet.
  const studioCarouselKeys = await sanityFetch<{ key: string }[]>({
    query: `*[_type=="sound360Page"][0].studioImages[]{key}`,
    tags: ['sound360Page'],
  }).catch(() => [] as { key: string }[]);
  const studioSlides: StudioSlide[] =
    studioCarouselKeys.length > 0
      ? studioCarouselKeys
          .filter((e) => !!e?.key)
          .map((e) => ({ slotKey: e.key }))
      : STUDIO_FALLBACK;

  // Discography preview: the 5 most recently added sound360 entries
  // (brandRecentDiscographyQuery orders by _createdAt desc).
  const discography = await sanityFetch<DiscographyEntry[]>({
    query: brandRecentDiscographyQuery,
    params: { brand: 'sound360', limit: 5 },
    tags: ['discographyEntry', 'brand:sound360'],
  }).catch(() => []);

  const team: TeamMember[] = [
    {
      name: cx('team1Name'),
      role: cx('team1Role'),
      slotKey: 'team-1',
      fallbackSrc: '/sound360/team-1.jpg',
      bio: [cx('team1Bullet1'), cx('team1Bullet2')],
    },
    {
      name: cx('team2Name'),
      role: cx('team2Role'),
      slotKey: 'team-2',
      fallbackSrc: '/sound360/team-2.jpg',
      bio: [
        cx('team2Bullet1'),
        cx('team2Bullet2'),
        cx('team2Bullet3'),
        cx('team2Bullet4'),
        cx('team2Bullet5'),
        cx('team2Bullet6'),
        cx('team2Bullet7'),
        cx('team2Bullet8'),
      ],
    },
  ];

  return (
    <>
      {/* ① Hero — 헤드라인 + 소개문 (eyebrow 제거). dark 그라데이션 배경 */}
      <section
        className="relative isolate overflow-hidden pb-28 pt-16 text-white md:pb-36 md:pt-20"
        style={{
          background:
            'linear-gradient(118deg, #2a1648 0%, #1a1f4d 46%, #34548a 100%)',
        }}
      >
        {heroVideo ? (
          <>
            {/* Sanity hero video (sound360Page → "Hero 배경 동영상") */}
            <HeroVideo src={heroVideo} sound={heroVideoSound} />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-black/45"
            />
          </>
        ) : (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-70 mix-blend-screen"
            style={{ backgroundImage: 'url(/sound360/hero-glow.png)' }}
          />
        )}
        {/* 네비바 가독성을 위한 상단 디졸브 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black to-transparent md:h-48"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-8 lg:px-14">
          <Image
            src="/sound360/logo-360.png"
            alt="SOUND360"
            width={35}
            height={40}
            className="mt-8 h-9 w-auto md:mt-10"
          />
          <div className="mt-10">
            <h1 className="text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] lg:whitespace-nowrap md:text-[72px] lg:text-[96px]">
              {cx('title')}
            </h1>
            <p className="mt-6 max-w-2xl whitespace-pre-line text-[14px] leading-[1.6] tracking-[-0.18px] text-white/70 md:text-[16px]">
              {cx('description')}
            </p>
          </div>
        </div>
      </section>

      {/* ② DISCOGRAPHY (+ XR 카테고리) — 히어로 바로 아래 */}
      <section
        data-reveal
        className="mx-auto max-w-7xl px-8 pt-28 md:pt-52 lg:px-14"
      >
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
          {cx('discography')}
        </h2>
        <div className="mt-10 flex items-center justify-between">
          <p className="text-[15px] font-medium tracking-[-0.18px] text-foreground md:text-[18px]">
            {cx('selectedAlbums')}
          </p>
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

        {/* XR 카테고리 */}
        <p className="mt-14 text-[15px] font-medium tracking-[-0.18px] text-foreground md:text-[18px]">
          XR
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {XR_WORKS.map((w) => (
            <div key={w.title} className="flex flex-col gap-3">
              <div className="relative aspect-square overflow-hidden bg-background-white">
                <Image
                  src={w.src}
                  alt={`${w.artist} - ${w.title}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[15px] font-medium leading-[1.5] tracking-[-0.18px] text-foreground md:text-[18px]">
                  {w.title}
                </div>
                <div className="text-[13px] tracking-[-0.13px] text-tertiary">
                  {w.artist}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ③ 작업 내용 및 범위 — service icon cards */}
      <section
        data-reveal
        className="mx-auto max-w-7xl px-8 pt-28 md:pt-52 lg:px-14"
      >
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
          {cx('workScope')}
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {SERVICES.map((s) => (
            <div key={s.key} className="flex flex-col gap-3">
              <div className="relative flex aspect-[82/65] items-center justify-center overflow-hidden bg-black">
                {/* 검은 박스에 아이콘/그래픽을 가운데 축소 배치 (4칸 통일) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/sound360/${s.img}`}
                  alt=""
                  style={{ maxHeight: `${s.maxH}%` }}
                  className="max-w-[85%] object-contain"
                />
              </div>
              <div className="flex flex-col gap-0.5 text-center">
                <p className="text-[16px] font-semibold tracking-[-0.18px] text-foreground md:text-[18px]">
                  {cx(s.key)}
                </p>
                <p className="text-[13px] font-medium leading-[1.4] tracking-[-0.13px] text-foreground/45">
                  {cx(`${s.key}Desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ④ STUDIO (dark) */}
      <section
        data-reveal
        className="mt-28 md:mt-52 bg-[#121318] py-20 text-white md:py-24"
      >
        <div className="mx-auto max-w-7xl px-8 lg:px-14">
          <div className="grid grid-cols-1 items-start gap-x-5 gap-y-6 md:grid-cols-2">
            <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
              {cx('studio')}
            </h2>
            <div>
              <p className="text-lg font-semibold leading-[1.4] tracking-[-0.23px] md:text-[23px]">
                {cx('studioTitle')}
              </p>
              <p className="mt-3 max-w-md text-[15px] font-medium leading-[1.4] tracking-[-0.18px] text-white/80 md:text-[18px]">
                {cx('studioBody')}
              </p>
            </div>
          </div>

          <StudioCarousel
            slides={studioSlides}
            slots={images}
            alt={cx('studioTitle')}
            imageNeeded={tCommon('imageNeeded')}
            prevLabel={tCommon('previous')}
            nextLabel={tCommon('next')}
          />
        </div>
      </section>

      {/* ⑤ OUR TEAM */}
      <section
        data-reveal
        className="mx-auto max-w-7xl px-8 pt-28 md:pt-52 lg:px-14"
      >
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
          {cx('ourTeam')}
        </h2>
        <TeamGrid
          members={team}
          slots={images}
          bioFallback={tCommon('comingSoon')}
          portrait
          columns={4}
          gapClass="gap-6 md:gap-12"
        />
      </section>

      {/* ⑥ 소개 영상 + 위치 — 2분할: 왼쪽 브랜드 영상, 오른쪽 네이버 지도 */}
      <section
        data-reveal
        className="mt-28 md:mt-52 w-full overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-8 lg:px-14">
          {/* 영상은 좌측 끝선, 지도는 우측 끝선에 붙이고 가운데를 띄운다 */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between">
            {/* 왼쪽: 영상 — 16:9, 가로형 지도와 같은 높이를 채움 */}
            <div className="flex items-center bg-black lg:w-[56%]">
              <YouTubeEmbed id="FE-XGEdusDw" title={cx('title')} />
            </div>
            {/* 오른쪽: 지도 — 우측 그리드 끝선에 고정, 가로로 긴 4:3 비율로 고정.
                폭 40% × 3/4 = 높이 30% → 영상 16:9 높이(30%)와 정확히 일치 */}
            <div className="relative aspect-[4/3] w-full lg:w-[42%]">
              <iframe
                src={SOUND360_GMAP_EMBED}
                title={SOUND360_ADDRESS}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ⑦ CONTACT — 주소 + 지도 링크 추가 */}
      <ContactCta address={SOUND360_ADDRESS} mapHref={SOUND360_MAP_HREF} />
      <SectionReveal />
    </>
  );
}
