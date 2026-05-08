import { HeroImage } from "@/components/HeroImage";
import { SlotImage } from "@/components/SlotImage";
import { getPageImages } from "@/lib/pageImages";

export default async function AboutPage() {
  const { hero, images } = await getPageImages("aboutPage");

  return (
    <div>
      <HeroImage image={hero} alt="About Audioguy" priority />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          About
        </h1>
        <p className="mt-6 text-lg text-foreground/70">
          오디오가이는 음향 프로덕션과 공간 사운드 디자인을 위한 스튜디오 그룹입니다.
        </p>
        <div className="mt-12 space-y-6 text-foreground/80">
          <p>
            여기에 회사 소개 본문이 들어갑니다. 텍스트는 코드에서 직접 관리합니다.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-2">
        <div className="relative aspect-4/3 overflow-hidden rounded-xl">
          <SlotImage
            slots={images}
            slotKey="team"
            alt="팀 사진"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-xl">
          <SlotImage
            slots={images}
            slotKey="space"
            alt="공간 사진"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </section>
    </div>
  );
}
