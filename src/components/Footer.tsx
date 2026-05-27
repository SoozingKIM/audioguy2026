import { getTranslations } from "next-intl/server";

import { BrandLogo } from "@/components/BrandLogo";
import { Link } from "@/i18n/navigation";
import type { SiteSettings } from "@/sanity/types";

// 네비바(Header)의 NAV_KEYS와 동일하게 유지
const FOOTER_NAV_KEYS = [
  // { href: "/", key: "home" },
  { href: "/audioguy", key: "about" },
  { href: "/agstudio", key: "audioguy" },
  { href: "/sound360", key: "sound360" },
  { href: "/seoro", key: "seoro" },
  // 임시 숨김: 네비바와 맞춰 discography 제거 (복구하려면 주석 해제)
  // { href: "/discography", key: "discography" },
  { href: "/contact", key: "contact" },
] as const;

export async function Footer({
  settings,
}: {
  settings?: SiteSettings | null;
}) {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("FooterNav");

  const siteName = settings?.siteName ?? "AUDIOGUY";
  const email = settings?.contactEmail ?? "contact@audioguyrecords.com";
  const phone = settings?.contactPhone ?? "02-734-3348";
  const address = settings?.address ?? t("address");

  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-8 lg:px-14">
        <div className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
          <div>
            <BrandLogo
              label={siteName.toUpperCase()}
              className="block h-5 w-32 bg-white"
            />
            <div className="mt-5 space-y-1.5 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-white/40">{t("email")}</span>
                <a
                  href={`mailto:${email}`}
                  className="font-medium hover:underline"
                >
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/40">{t("call")}</span>
                <a
                  href={`tel:${phone.replace(/\D/g, "")}`}
                  className="font-medium hover:underline"
                >
                  {phone}
                </a>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-6 text-xs">
            {FOOTER_NAV_KEYS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/70 transition hover:text-white"
              >
                {tNav(item.key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/15 py-6 text-[11px] text-white/45 md:flex md:items-center md:justify-between">
          <div>
            © {siteName.toUpperCase()} {t("rights")}
          </div>
          <div className="mt-2 md:mt-0">{address}</div>
        </div>
      </div>
    </footer>
  );
}
