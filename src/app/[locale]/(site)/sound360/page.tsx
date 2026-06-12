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

// Point cards & service icons reproduced from Figma as exported images.
const POINT_CARDS = [1, 2, 3] as const;
// Soft glow background (icon-N.png) + crisp high-res icon overlaid on top.
const SERVICES = [
  { key: 'service1', fg: 'icon-fg-1.png', fgSize: 33.5, fgOpacity: 1 },
  { key: 'service2', fg: 'icon-fg-2.png', fgSize: 29.9, fgOpacity: 0.9 },
  { key: 'service3', fg: 'icon-fg-3.png', fgSize: 29.9, fgOpacity: 1 },
  { key: 'service4', fg: null, fgSize: 0, fgOpacity: 1 },
] as const;

// Studio carousel slides are built at request time from
// `sound360Page.studioImages[]` in Sanity (admin can add/remove freely; the
// carousel + indicator bar auto-adapt to the count). The local /public
// fallback list below is used only when Sanity has no entries yet.
const STUDIO_FALLBACK: StudioSlide[] = [
  { slotKey: 'studio', fallbackSrc: '/sound360/studio.jpg' },
  { slotKey: 'studio-2', fallbackSrc: '/sound360/studio-2.jpg' },
  { slotKey: 'studio-3', fallbackSrc: '/sound360/studio-3.jpg' },
  { slotKey: 'studio-4', fallbackSrc: '/sound360/studio-4.jpg' },
];

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
      bio: [cx('team1Bullet1'), cx('team1Bullet2')],
    },
    {
      name: cx('team2Name'),
      role: cx('team2Role'),
      slotKey: 'team-2',
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
      {/* Branding — dark with glow + 360 logo (Figma Frame 211) */}
      <section
        className="relative isolate overflow-hidden pb-56 pt-16 text-white md:pb-72 md:pt-20"
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
        {/* Top dissolve into the black video section above. The dissolve into
            the light page below is handled by the next section's gradient, so
            the purple can bleed across the boundary. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black to-transparent md:h-48"
        />
        <div className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-10">
          <Image
            src="/sound360/logo-360.png"
            alt="SOUND360"
            width={35}
            height={40}
            className="mt-8 h-9 w-auto md:mt-10"
          />
          <div className="mt-10 max-w-[1360px]">
            <p className="text-base font-semibold uppercase tracking-[0.12em] text-white/70 md:text-xl">
              {cx('label')}
            </p>
            <h1 className="mt-6 whitespace-normal text-5xl font-semibold leading-[1] tracking-[-1.63px] md:mt-16 md:whitespace-nowrap md:text-[64px] lg:text-[96px] xl:text-[112px] 2xl:text-[130px]">
              {cx('title')}
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.5] tracking-[-0.18px] text-white/60 md:text-[18px]">
              {cx('description')}
            </p>
          </div>
        </div>
      </section>

      {/* 3 Point cards — rise up to overlap the hero (negative margin) so the
          hero's gradient bleeds through this section's TRANSPARENT top, then it
          deepens to black toward the bottom to flow into the brand video that
          follows. Result: a seamless hero → cards → video colour transition. */}
      <section
        className="relative z-10 -mt-48 pb-16 pt-24 md:-mt-64 md:pb-20 md:pt-36"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0) 0px, #000000 340px)',
        }}
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-3 px-6 md:grid-cols-3 md:gap-4 lg:px-10">
          {POINT_CARDS.map((n) => (
            <div
              key={n}
              className="aspect-[55/71] overflow-hidden bg-[#0c0a20] bg-cover bg-center"
              style={{ backgroundImage: `url(/sound360/point-${n}.png)` }}
            />
          ))}
        </div>
      </section>

      {/* Hero — brand video (YouTube embed player), full-width like agstudio */}
      <section className="w-full overflow-hidden bg-black">
        <YouTubeEmbed
          id="FE-XGEdusDw"
          title={cx('title')}
          className="mx-auto max-w-[1600px]"
        />
      </section>

      {/* DISCOGRAPHY */}
      <section className="mx-auto max-w-[1440px] px-6 pt-40 lg:px-10">
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
          {cx('discography')}
        </h2>
        <div className="mt-10 flex items-center justify-between">
          <p className="text-[15px] font-medium tracking-[-0.18px] text-foreground md:text-[18px]">
            {cx('selectedAlbums')}
          </p>
          {/* 임시 숨김: discography "더보기" 버튼 (복구하려면 주석 해제 + 상단 Link import 복구)
          <Link
            href="/discography?brand=sound360"
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
                <div className="relative h-[200px] overflow-hidden bg-background-white md:h-[260px]">
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
                  <div className="text-lg font-medium leading-[1.5] tracking-[-0.22px] text-foreground md:text-[22px]">
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

      {/* Work scope — service icon cards (Figma Frame 203) */}
      <section
        data-reveal
        className="mx-auto max-w-[1440px] px-6 pt-40 lg:px-10"
      >
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
          {cx('workScope')}
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
                  {cx(`${s.key}Desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STUDIO (dark) */}
      <section className="mt-40 bg-[#121318] py-20 text-white md:py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="grid grid-cols-1 items-start gap-x-5 gap-y-6 md:grid-cols-2">
            <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
              {cx('studio')}
            </h2>
            <div>
              <p className="text-[15px] leading-normal tracking-[-0.15px] text-disabled">
                {cx('studioSubKr')}
              </p>
              <p className="mt-3 text-lg font-semibold leading-[1.4] tracking-[-0.23px] md:text-[23px]">
                {cx('studioTitle')}
              </p>
              <p className="mt-1 max-w-md text-[15px] font-medium leading-[1.4] tracking-[-0.18px] text-white/80 md:text-[18px]">
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

      {/* OUR TEAM */}
      <section className="mx-auto max-w-[1440px] px-6 pt-40 lg:px-10">
        <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
          {cx('ourTeam')}
        </h2>
        <TeamGrid
          members={team}
          slots={images}
          bioFallback={tCommon('comingSoon')}
        />
      </section>

      <ContactCta />
      <SectionReveal />
    </>
  );
}
