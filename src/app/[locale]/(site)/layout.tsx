import { FloatingContact } from "@/components/FloatingContact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { sanityFetch } from "@/sanity/lib/fetch";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/types";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await sanityFetch<SiteSettings | null>({
    query: siteSettingsQuery,
    tags: ["siteSettings"],
  }).catch(() => null);

  return (
    <div className="flex min-h-screen flex-col">
      <Header siteName={settings?.siteName} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <FloatingContact />
    </div>
  );
}
