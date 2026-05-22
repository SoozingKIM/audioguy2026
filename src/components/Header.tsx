import { getTranslations } from "next-intl/server";

import { LangSwitcher } from "@/components/LangSwitcher";
import { Link } from "@/i18n/navigation";

const NAV_KEYS = [
  { href: "/", key: "home" },
  { href: "/audioguy", key: "about" },
  { href: "/agstudio", key: "audioguy" },
  { href: "/sound360", key: "sound360" },
  { href: "/seoro", key: "seoro" },
  { href: "/discography", key: "discography" },
  { href: "/contact", key: "contact" },
] as const;

export async function Header({ siteName }: { siteName?: string }) {
  const t = await getTranslations("Nav");

  return (
    <header>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-8 py-7 lg:px-14">
        <Link href="/" className="text-base font-bold italic tracking-tight">
          {(siteName ?? "AUDIOGUY").toUpperCase()}
        </Link>

        <div className="flex items-center gap-10">
          <nav className="hidden gap-8 text-sm md:flex">
            {NAV_KEYS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground/60 transition hover:text-foreground"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <LangSwitcher />

          <button
            type="button"
            aria-label="메뉴 열기"
            className="flex h-5 w-6 flex-col justify-between"
          >
            <span className="h-px w-full bg-foreground" />
            <span className="h-px w-full bg-foreground" />
            <span className="h-px w-full bg-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
