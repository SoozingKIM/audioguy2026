"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const LABELS: Record<Locale, string> = {
  ko: "KR",
  en: "EN",
  jp: "JP",
};

export function LangSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      className={`hidden items-center gap-3 text-sm md:flex ${
        isPending ? "opacity-60" : ""
      }`}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          className={
            l === locale
              ? "font-semibold text-foreground"
              : "text-foreground/40 hover:text-foreground"
          }
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
