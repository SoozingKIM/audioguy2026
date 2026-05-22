import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactForm } from "@/components/ContactForm";
import { contentResolver, getPageContent } from "@/lib/pageContent";
import { sanityFetch } from "@/sanity/lib/fetch";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/types";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Contact");
  const tCta = await getTranslations("Cta");
  const c = await getPageContent("contactPage");
  const cx = contentResolver(c, locale, t);
  const formLabels = {
    brand: cx("brand"),
    company: cx("company"),
    companyPh: cx("companyPh"),
    name: cx("name"),
    namePh: cx("namePh"),
    position: cx("position"),
    positionPh: cx("positionPh"),
    phone: cx("phone"),
    phonePh: cx("phonePh"),
    email: cx("email"),
    emailPh: cx("emailPh"),
    memo: cx("memo"),
    memoPh: cx("memoPh"),
    submit: cx("submit"),
    submitting: cx("submitting"),
    success: cx("success"),
    error: cx("error"),
  };

  const settings = await sanityFetch<SiteSettings | null>({
    query: siteSettingsQuery,
    tags: ["siteSettings"],
  }).catch(() => null);

  const email = settings?.contactEmail ?? "contact@audioguyrecords.com";
  const phone = settings?.contactPhone ?? "02-734-3348";

  return (
    <section className="mx-auto max-w-[1440px] px-10 py-10">
      <div className="grid grid-cols-1 items-stretch gap-10 md:grid-cols-2">
        {/* Exact Figma left card (glow + email/call) as an image; the email/call
            are baked in, so invisible overlay links keep them clickable. */}
        <div
          className="relative min-h-[480px] overflow-hidden rounded-[20px] bg-cover bg-center md:min-h-[580px]"
          style={{ backgroundImage: "url(/contact/card-left.png)" }}
        >
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="flex flex-wrap items-center justify-center gap-x-[50px] gap-y-3 text-[18px] tracking-[-0.18px] text-transparent">
              <a
                href={`mailto:${email}`}
                aria-label={`${tCta("email")} ${email}`}
                className="flex items-center gap-3 whitespace-nowrap"
              >
                <span>{tCta("email")}</span>
                <span>{email}</span>
              </a>
              <a
                href={`tel:${phone.replace(/\D/g, "")}`}
                aria-label={`${tCta("call")} ${phone}`}
                className="flex items-center gap-3 whitespace-nowrap"
              >
                <span>{tCta("call")}</span>
                <span>{phone}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] bg-background-white p-6">
          <h1 className="text-[28px] font-bold tracking-[-1.5px] text-foreground">
            {cx("title")}
          </h1>
          <ContactForm labels={formLabels} />
        </div>
      </div>
    </section>
  );
}
