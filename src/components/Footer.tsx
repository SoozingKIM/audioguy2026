import type { SiteSettings } from "@/sanity/types";

export function Footer({ settings }: { settings?: SiteSettings | null }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-foreground/60 md:flex-row md:items-center md:justify-between">
        <div>
          © {year} {settings?.siteName ?? "Audioguy"}
        </div>
        <div className="flex flex-wrap gap-4">
          {settings?.contactEmail ? (
            <a href={`mailto:${settings.contactEmail}`} className="hover:text-foreground">
              {settings.contactEmail}
            </a>
          ) : null}
          {settings?.socials?.map((s, i) =>
            s.url ? (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                {s.label ?? s.url}
              </a>
            ) : null,
          )}
        </div>
      </div>
    </footer>
  );
}
