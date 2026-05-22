import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { getPageContent, localized } from "@/lib/pageContent";

type BrandKey = "audioguy" | "agstudio" | "sound360" | "seoro";

type BrandCard = {
  href: string;
  key: BrandKey;
  /** Full Figma frame exported as one flat background image. */
  image: string;
};

const C = "/home/cards";
const BRAND_CARDS: BrandCard[] = [
  { href: "/audioguy", key: "audioguy", image: `${C}/audioguy-card.png` },
  { href: "/agstudio", key: "agstudio", image: `${C}/agstudio-card.png` },
  { href: "/sound360", key: "sound360", image: `${C}/sound360-card.png` },
  { href: "/seoro", key: "seoro", image: `${C}/seoro-card.png` },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const tCta = await getTranslations("Cta");

  // Sanity-managed content (falls back to the i18n message defaults).
  const c = await getPageContent("homePage");
  const cx = (field: string, fallbackKey: string) =>
    localized(c?.[field], locale, t(fallbackKey));

  return (
    <>
      {/* Hero — text in right column, top-aligned (Figma) */}
      <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-y-6 px-10 pt-5 pb-10 md:grid-cols-2">
        <div className="md:col-start-2">
          <h1 className="text-[32px] font-bold leading-[1.2] tracking-[-1px] text-foreground md:text-[46px] md:tracking-[-1.5px]">
            {cx("heroTitle1", "hero.title1")}
            <br />
            {cx("heroTitle2", "hero.title2")}
          </h1>
          <p className="mt-2.5 text-[15px] leading-[1.5] tracking-[-0.18px] text-secondary md:text-[18px]">
            {cx("heroDesc1", "hero.desc1")}
            <br />
            {cx("heroDesc2", "hero.desc2")}
          </p>
        </div>
      </section>

      {/* 2x2 Brand Cards — reproduced from Figma frames 177 / 186 */}
      <section className="mx-auto max-w-[1440px] px-10 py-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {BRAND_CARDS.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              aria-label={cx(`${card.key}Label`, `cards.${card.key}.label`)}
              className="group relative block aspect-[67/40] overflow-hidden"
            >
              {/* Figma frame image (glow + wordmark) */}
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              {/* Scrim hides the image's baked label/description so the live
                  (Sanity-editable) text below replaces it cleanly. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
                style={{
                  background:
                    "linear-gradient(to top, #0a0a0c 0%, rgba(10,10,12,0.9) 60%, rgba(10,10,12,0) 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <h2 className="text-2xl font-semibold leading-[1.4] tracking-[-0.32px] md:text-[32px]">
                  {cx(`${card.key}Label`, `cards.${card.key}.label`)}
                </h2>
                <p className="mt-1.5 max-w-md text-sm leading-[1.4] tracking-[-0.18px] text-white/60 md:text-[18px]">
                  {cx(`${card.key}Desc`, `cards.${card.key}.description`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Overview */}
      <section className="mx-auto max-w-[920px] px-10 py-20 text-center">
        <p className="text-[16px] font-medium tracking-[-0.16px] text-tertiary">
          {cx("overviewLabel", "overview.label")}
        </p>
        <h2 className="mt-3.5 text-2xl font-semibold leading-[1.4] tracking-[-0.32px] text-foreground md:text-[32px]">
          {cx("overviewTitle", "overview.title")}
        </h2>
        <div className="mt-3.5 space-y-6 text-[16px] font-medium leading-[1.4] tracking-[-0.2px] text-secondary md:text-[20px]">
          <p>{cx("overviewP1", "overview.p1")}</p>
          <p>{cx("overviewP2", "overview.p2")}</p>
          <p>{cx("overviewP3", "overview.p3")}</p>
          <p>{cx("overviewP4", "overview.p4")}</p>
        </div>
      </section>

      {/* Contact CTA — Figma Frame 243 (Group 11 glow over #f7f9fa) */}
      <section className="mx-auto max-w-[1440px] px-10 pb-20">
        <div className="relative flex flex-col items-center justify-center gap-8 overflow-hidden bg-background px-10 py-16 text-center md:h-[580px] md:flex-row md:justify-between md:px-20 md:py-0 md:text-left">
          {/* Group 11 glow (Ellipse 1–4), exported from Figma at its native 1622×995 box */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[995px] w-[1622px] -translate-x-1/2 -translate-y-1/2 bg-[length:100%_100%] bg-no-repeat md:left-[calc(50%+282px)] md:top-[calc(50%-27.5px)]"
            style={{ backgroundImage: "url(/home/cta-glow.svg)" }}
          />
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-[50px] gap-y-3 text-[18px] font-medium tracking-[-0.18px]">
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span className="text-tertiary">{tCta("email")}</span>
              <span className="text-black">contact@audioguyrecords.com</span>
            </div>
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span className="text-tertiary">{tCta("call")}</span>
              <span className="text-black">02-734-3348</span>
            </div>
          </div>
          <Link
            href="/contact"
            className="group relative z-10 inline-flex items-center gap-5 whitespace-nowrap text-[24px] font-semibold tracking-[-0.24px] text-black"
          >
            {tCta("contactUs")}
            <span className="flex size-[66px] items-center justify-center rounded-full bg-white text-black shadow-sm transition group-hover:translate-x-1">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
