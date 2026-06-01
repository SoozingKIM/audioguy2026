import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuroraBackground } from "@/components/AuroraBackground";
import { CommunityPreview } from "@/components/CommunityPreview";
import { ContactCta } from "@/components/ContactCta";
import { ParticleGalaxy } from "@/components/ParticleGalaxy";
import { RevealCards } from "@/components/RevealCards";
import { SectionReveal } from "@/components/SectionReveal";
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

  // Sanity-managed content (falls back to the i18n message defaults).
  const c = await getPageContent("homePage");
  const cx = (field: string, fallbackKey: string) =>
    localized(c?.[field], locale, t(fallbackKey));

  return (
    <>
      {/* Hero — Aurora background (Aceternity) + text in right column */}
      <section className="relative isolate flex min-h-[68vh] items-center overflow-hidden">
        <AuroraBackground />
        {/* Particle galaxy in the empty space left of the hero text
            (CodePen VoXelo/NPbGqrx, reproduced natively). Desktop only;
            click it to morph between galaxy / DNA / heart. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-1/2 items-center justify-center md:flex"
        >
          <div className="pointer-events-auto relative aspect-square w-[min(78%,520px)] translate-x-[200px] scale-[1.3]">
            <ParticleGalaxy className="absolute inset-0" />
          </div>
        </div>
        {/* pointer-events-none so the empty left column doesn't intercept the
            galaxy's pointer tracking; the text block re-enables events. */}
        <div className="pointer-events-none relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-y-6 px-10 py-24 md:grid-cols-2">
          <div className="pointer-events-auto md:col-start-2">
            <h1 className="text-[40px] font-bold leading-[1.2] tracking-[-1.3px] text-foreground md:text-[56px] md:tracking-[-1.8px]">
              {cx("heroTitle1", "hero.title1")}
              <br />
              {cx("heroTitle2", "hero.title2")}
            </h1>
            <p className="mt-2.5 text-[16px] leading-[1.5] tracking-[-0.16px] text-secondary md:text-[22px] md:tracking-[-0.22px]">
              {cx("heroDesc1", "hero.desc1")}
              <br />
              {cx("heroDesc2", "hero.desc2")}
            </p>
          </div>
        </div>
      </section>

      {/* 2x2 Brand Cards — reproduced from Figma frames 177 / 186 */}
      <section className="mx-auto max-w-[1440px] px-10 py-5">
        <RevealCards className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {BRAND_CARDS.map((card) => (
            <Link
              key={card.key}
              data-card
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
              {/* Light scrim keeps the live (Sanity-editable) label/description
                  legible over the card glow. Card images are exported text-free
                  from Figma, so this no longer has to fully hide baked text. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,10,12,0.82) 0%, rgba(10,10,12,0.4) 48%, rgba(10,10,12,0) 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <h2 className="text-[22px] font-semibold leading-[1.4] tracking-[-0.32px] md:text-[28px]">
                  {cx(`${card.key}Label`, `cards.${card.key}.label`)}
                </h2>
                <p className="mt-1.5 max-w-md text-[13px] leading-[1.4] tracking-[-0.18px] text-white/60 md:text-[16px]">
                  {cx(`${card.key}Desc`, `cards.${card.key}.description`)}
                </p>
              </div>
            </Link>
          ))}
        </RevealCards>
      </section>

      {/* Brand Overview */}
      <section
        data-reveal
        className="mx-auto max-w-[1440px] px-10 py-20 text-center"
      >
        <p className="text-[16px] font-medium tracking-[-0.16px] text-tertiary">
          {cx("overviewLabel", "overview.label")}
        </p>
        <h2 className="mt-3.5 text-balance text-2xl font-semibold leading-[1.4] tracking-[-0.32px] text-foreground md:text-[32px]">
          {cx("overviewTitle", "overview.title")}
        </h2>
        <div className="mt-3.5 space-y-7 text-balance text-[16px] font-medium leading-[1.4] tracking-[-0.2px] text-secondary md:text-[20px]">
          <p>{cx("overviewP1", "overview.p1")}</p>
          <p>{cx("overviewP2", "overview.p2")}</p>
          <p>{cx("overviewP3", "overview.p3")}</p>
          <p>{cx("overviewP4", "overview.p4")}</p>
        </div>
      </section>

      {/* Contact CTA — full-bleed background, content aligned inside (other
          pages use this same component). */}
      <CommunityPreview />
      <ContactCta />
      <SectionReveal />
    </>
  );
}
