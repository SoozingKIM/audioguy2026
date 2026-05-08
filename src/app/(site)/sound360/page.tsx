import { BrandDiscographyPreview } from "@/components/BrandDiscographyPreview";
import { HeroImage } from "@/components/HeroImage";
import { SlotImage } from "@/components/SlotImage";
import { getPageFeaturedDiscography } from "@/lib/featuredDiscography";
import { getPageImages } from "@/lib/pageImages";

export default async function Sound360Page() {
  const [{ hero, images }, featured] = await Promise.all([
    getPageImages("sound360Page"),
    getPageFeaturedDiscography("sound360Page"),
  ]);

  return (
    <div>
      <HeroImage image={hero} alt="Sound360" priority />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Sound360
        </h1>
        <p className="mt-6 text-lg text-foreground/70">
          이머시브 사운드와 공간 음향을 위한 360도 스튜디오.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <SlotImage
            slots={images}
            slotKey="immersive"
            alt="이머시브 스튜디오"
            fill
            sizes="100vw"
          />
        </div>
      </section>

      <BrandDiscographyPreview
        brand="sound360"
        entries={featured.featuredDiscography}
      />
    </div>
  );
}
