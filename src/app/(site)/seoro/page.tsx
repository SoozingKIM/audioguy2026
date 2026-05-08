import { BrandDiscographyPreview } from "@/components/BrandDiscographyPreview";
import { HeroImage } from "@/components/HeroImage";
import { SlotImage } from "@/components/SlotImage";
import { getPageFeaturedDiscography } from "@/lib/featuredDiscography";
import { getPageImages } from "@/lib/pageImages";

export default async function SeoroPage() {
  const [{ hero, images }, featured] = await Promise.all([
    getPageImages("seoroPage"),
    getPageFeaturedDiscography("seoroPage"),
  ]);

  return (
    <div>
      <HeroImage image={hero} alt="Seoro" priority />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Seoro
        </h1>
        <p className="mt-6 text-lg text-foreground/70">
          서로 — 협업과 만남이 일어나는 공간.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-2">
        <div className="relative aspect-4/3 overflow-hidden rounded-xl">
          <SlotImage
            slots={images}
            slotKey="space-1"
            alt="Seoro 공간 1"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-xl">
          <SlotImage
            slots={images}
            slotKey="space-2"
            alt="Seoro 공간 2"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>

      <BrandDiscographyPreview
        brand="seoro"
        entries={featured.featuredDiscography}
      />
    </div>
  );
}
