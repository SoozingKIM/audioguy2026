import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function ContactCta() {
  const t = await getTranslations("Cta");

  return (
    <section className="pb-20 pt-24">
      {/* Figma Frame 243 — Group 11 glow over #f7f9fa */}
      <div className="relative flex items-center overflow-hidden bg-background py-10 md:h-96 md:py-0">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[995px] w-[1622px] -translate-x-1/2 -translate-y-1/2 bg-[length:100%_100%] bg-no-repeat md:left-[calc(50%+282px)] md:top-[calc(50%-27.5px)]"
          style={{ backgroundImage: "url(/home/cta-glow.svg)" }}
        />
        {/* 배경은 풀폭, 콘텐츠는 max-w로 안쪽에 경계를 두고 정렬 */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center gap-8 px-10 text-center md:flex-row md:justify-between md:px-20 md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-x-[50px] gap-y-3 text-[18px] font-medium tracking-[-0.18px]">
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span className="text-tertiary">{t("email")}</span>
              <span className="text-black">contact@audioguyrecords.com</span>
            </div>
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span className="text-tertiary">{t("call")}</span>
              <span className="text-black">02-734-3348</span>
            </div>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-5 whitespace-nowrap text-[24px] font-semibold tracking-[-0.24px] text-black"
          >
            {t("contactUs")}
            <span className="flex size-[66px] items-center justify-center rounded-full bg-white text-black shadow-sm transition group-hover:translate-x-1">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
