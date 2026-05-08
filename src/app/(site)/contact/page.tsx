import { HeroImage } from "@/components/HeroImage";
import { getPageImages } from "@/lib/pageImages";
import { sanityFetch } from "@/sanity/lib/fetch";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/types";

export default async function ContactPage() {
  const [{ hero }, settings] = await Promise.all([
    getPageImages("contactPage"),
    sanityFetch<SiteSettings | null>({
      query: siteSettingsQuery,
      tags: ["siteSettings"],
    }).catch(() => null),
  ]);

  return (
    <div>
      <HeroImage image={hero} alt="Contact" priority />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Contact
        </h1>
        <p className="mt-6 text-lg text-foreground/70">
          작업 의뢰와 문의는 아래 연락처로 부탁드립니다.
        </p>

        <dl className="mt-12 grid grid-cols-1 gap-6 rounded-xl border border-black/10 p-8 text-sm dark:border-white/10 sm:grid-cols-2">
          {settings?.contactEmail ? (
            <div>
              <dt className="text-foreground/50">Email</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hover:underline"
                >
                  {settings.contactEmail}
                </a>
              </dd>
            </div>
          ) : null}
          {settings?.contactPhone ? (
            <div>
              <dt className="text-foreground/50">Phone</dt>
              <dd className="mt-1">{settings.contactPhone}</dd>
            </div>
          ) : null}
          {settings?.address ? (
            <div className="sm:col-span-2">
              <dt className="text-foreground/50">Address</dt>
              <dd className="mt-1 whitespace-pre-line">{settings.address}</dd>
            </div>
          ) : null}
          {!settings?.contactEmail &&
          !settings?.contactPhone &&
          !settings?.address ? (
            <div className="sm:col-span-2 text-foreground/50">
              연락처는 <code>/studio</code>의 사이트 설정에서 입력할 수 있습니다.
            </div>
          ) : null}
        </dl>
      </section>
    </div>
  );
}
