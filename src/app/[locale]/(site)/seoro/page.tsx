import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ContactCta } from '@/components/ContactCta';
import { RevealCards } from '@/components/RevealCards';
import { SettlementTabs } from '@/components/SettlementTabs';
// 임시 숨김: discography "더보기" 버튼 주석 처리로 Link 미사용 (복구 시 주석 해제)
// import { Link } from "@/i18n/navigation";
import Image from 'next/image';
import { contentResolver, getPageContent } from '@/lib/pageContent';
import { imageUrl } from '@/lib/pageImages';
import { sanityFetch } from '@/sanity/lib/fetch';
import { brandRecentDiscographyQuery } from '@/sanity/lib/queries';
import type { DiscographyEntry } from '@/sanity/types';

// DSP 네트워크 로고 그리드 (Figma "SEORO Web", node 1:45): 다크 그라데이션 위
// 흰색 로고 5열 × 5행. 각 파일은 /public/seoro/dsp/<key>.(svg|png).
// tidal·pandora만 png(합성·캡처), 나머지는 svg.
// 각 로고의 디자인 실측 높이(px, Figma node 1:45). 균일 높이로 늘리면 일부 로고가
// 비대해 보여서, 로고별 고유 높이로 비율을 유지한다 (정사각 아이콘은 34로 캡).
const DSP_LOGOS = [
  { name: 'melon', h: 22 },
  { name: 'genie', h: 31 },
  { name: 'bugs', h: 27 },
  { name: 'vibe', h: 27 },
  { name: 'flo', h: 27 },
  { name: 'spotify', h: 28 },
  { name: 'amazon-music', h: 32 },
  { name: 'tidal', h: 16 },
  { name: 'yt-music', h: 31 },
  { name: 'apple-music', h: 24 },
  { name: 'deezer', h: 31 },
  { name: 'meta', h: 21 },
  { name: 'soundcloud', h: 14 },
  { name: 'tiktok', h: 28 },
  { name: 'line-music', h: 18 },
  { name: 'mora', h: 25 },
  { name: 'awa', h: 20 },
  { name: 'tencent', h: 15 },
  { name: 'qobuz', h: 34 },
  { name: 'kkbox', h: 23 },
  { name: 'pandora', h: 23 },
  { name: 'hoopla', h: 30 },
  { name: 'prestomusic', h: 18 },
  { name: 'audiomack', h: 18 },
  { name: 'anghami', h: 34 },
] as const;
const dspLogoSrc = (name: string) => `/seoro/dsp/${name}.svg`;

// 파트너사 로고 그리드 (Figma "Partners 2"): 5열 × 4행. 흰 배경 위 브랜드 로고.
// 파일: /public/seoro/partners/<key>.<ext>. 16개는 Figma 원본(partners-src)의
//   임베드 PNG를 추출·트림한 것(ext:"png"), 소스에 없는 4개(hankyung·thc·
//   sound360·audioguy)는 기존 벡터(ext:"svg") 유지.
// 색: 각 브랜드 원래 컬러 그대로. h: 형태별 3단계 정규화 — 가로 워드마크 26 /
//   2줄·준정사각 30 / 정사각 엠블럼 34.
const PARTNER_LOGOS = [
  { key: 'dolby-atmos', alt: 'Dolby Atmos', ext: 'png', h: 30 },
  { key: 'dreamus', alt: 'Dreamus', ext: 'png', h: 26 },
  { key: 'kakao', alt: 'Kakao Entertainment', ext: 'png', h: 30 },
  { key: 'naver', alt: 'NAVER', ext: 'png', h: 26 },
  { key: 'nhn-bugs', alt: 'NHN Bugs', ext: 'png', h: 26 },
  { key: 'studio-realive', alt: 'Studio Realive', ext: 'png', h: 26 },
  { key: 'yg-plus', alt: 'YG PLUS', ext: 'png', h: 26 },
  { key: 'meta', alt: 'Meta', ext: 'png', h: 26 },
  { key: 'apple-music', alt: 'Apple Music', ext: 'png', h: 26 },
  { key: 'youtube', alt: 'YouTube', ext: 'png', h: 26 },
  { key: 'sony-music', alt: 'Sony Music', ext: 'png', h: 34 },
  { key: 'naxos', alt: 'NAXOS', ext: 'png', h: 34 },
  { key: 'korg', alt: 'KORG', ext: 'png', h: 26 },
  { key: 'hibino', alt: 'HIBINO', ext: 'png', h: 26 },
  { key: 'm-plus', alt: 'M Plus', ext: 'png', h: 34 },
  { key: 'kyobo', alt: '교보문고', ext: 'png', h: 34 },
  { key: 'hankyung', alt: 'Hankyung arte Philharmonic', ext: 'svg', h: 30 },
  { key: 'thc', alt: 'THC', ext: 'svg', h: 34 },
  { key: 'sound360', alt: 'SOUND 360', ext: 'svg', h: 26 },
  { key: 'audioguy', alt: 'AUDIOGUY', ext: 'svg', h: 26 },
] as const;

// 유통 프로세스: 8단계 그라데이션 카드 (Figma "SEORO Web"). 좌상단 블루 →
// 우하단 마젠타로 이어지는 색 흐름을 카드별 그라데이션으로 재현 (4열 × 2행).
const PROCESS_STEPS = [
  {
    no: '01',
    titleKey: 'step1Title',
    descKey: 'step1Desc',
    grad: 'linear-gradient(135deg, #3f6ea3, #3a5d92)',
  },
  {
    no: '02',
    titleKey: 'step2Title',
    descKey: 'step2Desc',
    grad: 'linear-gradient(135deg, #4a649d, #4d5a96)',
  },
  {
    no: '03',
    titleKey: 'step3Title',
    descKey: 'step3Desc',
    grad: 'linear-gradient(135deg, #585c9c, #5d549a)',
  },
  {
    no: '04',
    titleKey: 'step4Title',
    descKey: 'step4Desc',
    grad: 'linear-gradient(135deg, #6b4f9d, #71499a)',
  },
  {
    no: '05',
    titleKey: 'step5Title',
    descKey: 'step5Desc',
    grad: 'linear-gradient(135deg, #7d4a9a, #884797)',
  },
  {
    no: '06',
    titleKey: 'step6Title',
    descKey: 'step6Desc',
    grad: 'linear-gradient(135deg, #944596, #a14290)',
  },
  {
    no: '07',
    titleKey: 'step7Title',
    descKey: 'step7Desc',
    grad: 'linear-gradient(135deg, #aa418c, #ba4282)',
  },
  {
    no: '08',
    titleKey: 'step8Title',
    descKey: 'step8Desc',
    grad: 'linear-gradient(135deg, #c3447c, #d04a72)',
  },
];

// 정산 리포팅 탭: 발매별 / DSP별 — 각 탭은 자체 이미지를 보여준다.
// 이미지: /public/seoro/settlement/<file>.
const SETTLE_TABS = [
  { key: 'settleTab1', src: '/seoro/settlement/release-reporting.svg' },
  { key: 'settleTab2', src: '/seoro/settlement/dsp-reporting.svg' },
] as const;

function SectionHeader({
  title,
  caption,
  description,
  captionClassName,
  descriptionClassName,
  wideCaption = false,
}: {
  title: string;
  caption?: string;
  description?: string;
  /** 캡션 <p>에 덧붙일 클래스 (예: 긴 캡션을 한 줄로 두기 위한 크기 override). */
  captionClassName?: string;
  /** 설명 <p>에 덧붙일 클래스 (예: 크기 축소·폭 제한으로 줄 수 조절). */
  descriptionClassName?: string;
  /** 제목 컬럼을 좁히고 캡션 컬럼을 넓혀(캡션이 왼쪽으로 확장) 긴 캡션을 한 줄로 둔다. */
  wideCaption?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-1 items-start gap-x-5 gap-y-3 ${
        wideCaption ? 'md:grid-cols-[0.5fr_1.5fr]' : 'md:grid-cols-2'
      }`}
    >
      <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
        {title}
      </h2>
      <div className="md:py-2">
        {caption ? (
          <p
            className={`text-lg font-semibold leading-[1.4] tracking-[-0.23px] text-foreground md:text-[23px] ${
              captionClassName ?? ''
            }`}
          >
            {caption}
          </p>
        ) : null}
        {description ? (
          <p
            className={`mt-3 text-[15px] font-medium leading-[1.4] tracking-[-0.18px] text-secondary md:text-[18px] ${
              descriptionClassName ?? ''
            }`}
          >
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

  const t = await getTranslations('Seoro');
  const tCommon = await getTranslations('Common');
  const c = await getPageContent('seoroPage');
  const cx = contentResolver(c, locale, t);

  // Discography preview: the 5 most recently added seoro-brand entries.
  // Managed in Sanity Studio (Discography Entry docs, brand="seoro").
  const discography = await sanityFetch<DiscographyEntry[]>({
    query: brandRecentDiscographyQuery,
    params: { brand: 'seoro', limit: 5 },
    tags: ['discographyEntry', 'brand:seoro'],
  }).catch(() => []);

  return (
    <>
      {/* Hero — 가장 뒤: 앨범 플립 그리드(iframe), 그 위에 Banner Gradient(알파 PNG)를
          올려서 그라데이션의 투명한 부분으로 그리드가 비치게 한다. */}
      <section className="relative min-h-[520px] overflow-hidden pb-24 pt-24 md:min-h-[760px] md:pb-32 md:pt-36">
        {/* 앨범 플립 그리드 (sound360music.github.io/figma-flip-grid) — 최하단 레이어 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <iframe
            src="https://sound360music.github.io/figma-flip-grid/"
            title="SEORO album wall"
            tabIndex={-1}
            scrolling="no"
            loading="lazy"
            className="absolute -right-16 top-1/2 h-[898px] w-[898px] border-0"
            style={{
              transform: 'translateY(-50%) rotate(-5deg) scale(1)',
              transformOrigin: 'center right',
            }}
          />
        </div>
        {/* Banner Gradient — iframe 위에 덮어 그리드보다 앞에 둔다 (알파로 그리드 비침) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/seoro/hero-bg.png)',
            backgroundSize: '100% 100%',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-8 text-white lg:px-14">
          <p className="text-xl font-semibold tracking-[0.06em] md:text-[26px]">
            {cx('label')}
          </p>
          <h1 className="mt-3 text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] md:mt-4 md:text-[72px] lg:text-[96px]">
            {cx('title')}
          </h1>
          <p className="mt-6 max-w-xl text-[14px] leading-[1.5] tracking-[-0.18px] text-white/70 md:text-[16px]">
            {cx('desc1')}
            <br />
            {cx('desc2')}
          </p>
        </div>
      </section>

      {/* 👇 히어로(+네비바) 외 나머지 섹션 임시 비활성화 — false 를 true 로 바꾸면 전체 복구 */}
      {true && (
        <>
          {/* 사업 소개 */}
          <section className="mx-auto max-w-7xl px-8 pt-24 md:pt-36 lg:px-14">
            <SectionHeader
              title={cx('business')}
              caption={cx('businessCaption')}
              description={cx('businessDesc')}
              // 제목-본문 여백은 유통프로세스 규격(1:1). 1fr 컬럼에 한 줄로 들어가도록
              // 21px로 살짝 낮추고 break-keep로 한글 단어 중간 잘림 방지
              captionClassName="text-balance break-keep md:!text-[18px] lg:!text-[21px]"
              // 설명 크기는 DSP 네트워크 본문과 동일하게 18px
              descriptionClassName="md:!text-[18px]"
            />
            <div className="mt-24 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="aspect-[55/71] overflow-hidden bg-foreground bg-cover bg-center"
                  style={{ backgroundImage: `url(/seoro/card-${n}.png)` }}
                />
              ))}
            </div>
          </section>

          {/* 파트너사 — 헤더와 로고가 같은 컬럼(그리드 라인)에 정렬되도록 max-w 축소 */}
          <section className="mx-auto max-w-7xl px-8 mt-16 md:pt-52 md:pb-40   lg:px-14 _bg-amber-600">
            <SectionHeader
              title={cx('partners')}
              caption={cx('partnersCaption')}
              description={cx('partnersDesc')}
              // 제목-본문 여백은 유통프로세스 규격(1:1). 1fr 컬럼에 한 줄로 들어가도록
              // 21px로 살짝 낮추고 break-keep로 한글 단어 중간 잘림 방지
              captionClassName="text-balance break-keep md:!text-[18px] lg:!text-[21px]"
              // 설명 크기는 DSP 네트워크 본문과 동일하게 18px
              descriptionClassName="md:!text-[18px]"
            />
            {/* 로고 그리드: 5열 × 4행(20칸). 흰 배경 위 검정 로고 SVG, 각 칸 가운데 정렬. */}
            <div className="mt-24 grid grid-cols-3 gap-x-6 gap-y-10 md:grid-cols-5 ">
              {PARTNER_LOGOS.map((logo) => (
                <div
                  key={logo.key}
                  className="flex h-12 items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/seoro/partners/${logo.key}.${logo.ext}`}
                    alt={logo.alt}
                    style={{ maxHeight: `${logo.h}px` }}
                    className="w-auto max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* DSP 네트워크 (Figma node 1:39): 다크 그라데이션 위 흰 로고 5열 그리드 */}
          <section
            className="mt-16 md:pt-52 md:pb-40 py-20 text-white md:py-28"
            style={{
              background:
                'linear-gradient(118deg, #3a4350 0%, #565f6d 52%, #847f85 100%)',
            }}
          >
            <div className="mx-auto max-w-7xl px-8 lg:px-14">
              <div className="grid grid-cols-1 items-start gap-x-5 gap-y-3 md:grid-cols-2">
                <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
                  {cx('dspNetwork')}
                </h2>
                <div className="md:py-2">
                  <p className="text-lg font-semibold leading-[1.4] tracking-[-0.23px] md:text-[23px]">
                    {cx('dspSubtitle')}
                  </p>
                  <p className="mt-3 text-[15px] font-medium leading-[1.4] tracking-[-0.18px] text-white/70 md:text-[18px]">
                    {cx('dspDesc')}
                  </p>
                </div>
              </div>

              {/* 로고 그리드: 5열 × 5행. 다크 그라데이션 위 흰 로고 SVG, 각 칸 가운데 정렬. */}
              <div className="mt-24 grid grid-cols-3 gap-x-6 gap-y-10 md:grid-cols-5">
                {DSP_LOGOS.map(({ name, h }) => (
                  <div
                    key={name}
                    className="flex h-12 items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dspLogoSrc(name)}
                      alt={name}
                      style={{ maxHeight: `${h}px` }}
                      className="w-auto max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 유통 프로세스 */}
          <section className="mx-auto max-w-7xl px-8 pt-24 md:pt-44 lg:px-14">
            <SectionHeader
              title={cx('process')}
              caption={cx('processCaption')}
              description={cx('processDesc')}
            />
            <RevealCards className="mt-24 grid grid-cols-2 gap-5 md:grid-cols-4">
              {PROCESS_STEPS.map((step) => (
                <div
                  key={step.no}
                  data-card
                  className="relative flex h-[190px] flex-col justify-between overflow-hidden p-5 text-white md:h-[210px]"
                  style={{ backgroundImage: step.grad }}
                >
                  <span className="text-[15px] font-semibold tracking-[-0.18px] text-white/80">
                    {step.no}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold leading-[1.3] tracking-[-0.2px] md:text-[17px]">
                      {cx(step.titleKey)}
                    </h3>
                    <p className="mt-1.5 text-[11px] leading-[1.45] tracking-[-0.1px] text-white/75 md:text-[12px]">
                      {cx(step.descKey)}
                    </p>
                  </div>
                </div>
              ))}
            </RevealCards>
          </section>

          {/* 정산 시스템 소개 */}
          <section className="mx-auto max-w-7xl px-8 pt-24 md:pt-44 lg:px-14">
            {/* 헤드라인(SOVO360 정산 시스템) → 카피 → 본문 */}
            <div>
              <h2 className="text-[28px] font-bold uppercase leading-[1.2] tracking-[-1.2px] text-foreground md:text-[40px]">
                {cx('settlementSystem')}
              </h2>
              <p className="mt-10 text-lg font-semibold leading-[1.4] tracking-[-0.23px] text-foreground md:text-[22px]">
                {cx('settlementCaption')}
              </p>
              <p className="mt-3 mb-20 text-[15px] font-medium leading-[1.7] tracking-[-0.18px] text-secondary md:text-[17px] lg:whitespace-nowrap">
                {cx('settlementDesc')}
              </p>
            </div>

            <SettlementTabs
              panels={SETTLE_TABS.map((tab) => ({
                label: cx(tab.key),
                src: tab.src,
              }))}
              imageNeeded={tCommon('imageNeeded')}
            />
          </section>

          {/* DISCOGRAPHY — 임시 숨김 (복구하려면 false → true).
          brand "seoro" entries from Sanity (Studio → Discography Entry, brand=seoro, 5 most recent). */}
          {false && (
            <section className="mx-auto max-w-7xl px-8 pt-24 md:pt-44 lg:px-14">
              <h2 className="text-[28px] font-bold leading-[1.2] tracking-[-1.5px] md:text-[40px]">
                {cx('discography')}
              </h2>
              <div className="mt-10 flex items-center justify-between">
                <p className="text-[15px] font-medium tracking-[-0.18px] text-foreground md:text-[18px]">
                  {cx('selectedAlbums')}
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
          )}

          <ContactCta />
        </>
      )}
    </>
  );
}
