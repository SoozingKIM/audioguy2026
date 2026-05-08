import { BrandDiscographyPreview } from "@/components/BrandDiscographyPreview";
import { HeroImage } from "@/components/HeroImage";
import { SlotImage } from "@/components/SlotImage";
import { getPageFeaturedDiscography } from "@/lib/featuredDiscography";
import { getPageImages } from "@/lib/pageImages";

export default async function AudioguyPage() {
  const [{ hero, images }, featured] = await Promise.all([
    getPageImages("audioguyPage"),
    getPageFeaturedDiscography("audioguyPage"),
  ]);

  return (
    <div>
      <HeroImage image={hero} alt="Audioguy" priority />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Audioguy
        </h1>
        <p className="mt-6 text-lg text-foreground/70">
          오디오가이 본관 — 음악 작업과 믹싱/마스터링을 위한 메인 스튜디오.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-3">
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <SlotImage
            slots={images}
            slotKey="control-room"
            alt="컨트롤룸"
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        </div>
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <SlotImage
            slots={images}
            slotKey="live-room"
            alt="라이브룸"
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        </div>
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <SlotImage
            slots={images}
            slotKey="lounge"
            alt="라운지"
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        </div>
      </section>

      <BrandDiscographyPreview
        brand="audioguy"
        entries={featured.featuredDiscography}
      />
      <BrandDiscographyPreview
        brand="audioguy"
        scopeSlug="location-recording"
        title="Location Recording"
        entries={featured.featuredLocationRecording}
      />
    </div>
  );
}
