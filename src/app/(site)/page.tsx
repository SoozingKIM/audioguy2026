import Link from "next/link";

import { HeroImage } from "@/components/HeroImage";
import { NAV_ITEMS } from "@/lib/nav";
import { getPageImages } from "@/lib/pageImages";

export default async function HomePage() {
  const { hero } = await getPageImages("homePage");
  const links = NAV_ITEMS.filter((i) => i.href !== "/");

  return (
    <div>
      <section className="relative">
        <HeroImage image={hero} alt="Audioguy" priority />
        <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/60 to-transparent">
          <div className="mx-auto w-full max-w-6xl px-6 pb-16 text-white">
            <p className="text-sm uppercase tracking-widest opacity-80">
              Sound · Music · Production
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-6xl">
              Audioguy
            </h1>
            <p className="mt-4 max-w-2xl text-lg opacity-90">
              사운드 디자인과 음향 프로덕션을 위한 공간.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-black/10 p-8 transition hover:border-foreground dark:border-white/10"
            >
              <div className="text-2xl font-semibold tracking-tight">
                {item.label}
              </div>
              <div className="mt-2 text-sm text-foreground/50 transition group-hover:text-foreground/80">
                {item.href}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
