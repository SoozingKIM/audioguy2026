import Link from "next/link";

import { NAV_ITEMS } from "@/lib/nav";

export function Header({ siteName }: { siteName?: string }) {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {siteName ?? "Audioguy"}
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {NAV_ITEMS.filter((i) => i.href !== "/").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground/70 transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
