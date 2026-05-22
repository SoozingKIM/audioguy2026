"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
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
  );
}

export function FloatingContact() {
  const t = useTranslations("Cta");
  const pathname = usePathname();

  // Already on the contact page — no need to float the CTA.
  if (pathname === "/contact") return null;

  const label = t("contactUs");
  // Symmetric pattern (label + " • " + label + " • ") stretched to exactly fill
  // the circle, so the two labels sit 180° apart with a dot centered between each.
  const ring = `${label} • ${label} • `;

  return (
    <div className="group fixed bottom-6 right-6 z-40 hidden size-22 md:block">
      {/* Collapsed: circular badge with curved, slowly-rotating text + center arrow */}
      <Link
        href="/contact"
        aria-label={label}
        className="absolute inset-0 flex items-center justify-center rounded-full bg-secondary/90 shadow-lg backdrop-blur-[10px] transition-opacity duration-300 group-hover:pointer-events-none group-hover:opacity-0"
      >
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full animate-[spin_20s_linear_infinite]"
        >
          <defs>
            <path
              id="fc-ring"
              d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
            />
          </defs>
          <text className="fill-white text-[10px] font-semibold uppercase">
            <textPath
              href="#fc-ring"
              startOffset="0"
              textLength="232"
              lengthAdjust="spacing"
            >
              {ring}
            </textPath>
          </text>
        </svg>
        <span className="flex size-10 items-center justify-center rounded-full bg-white text-secondary">
          <ArrowIcon />
        </span>
      </Link>

      {/* Hover: expands into a horizontal pill anchored to the same right edge */}
      <Link
        href="/contact"
        aria-label={label}
        className="pointer-events-none absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-3 whitespace-nowrap rounded-full bg-secondary py-2 pl-6 pr-2 text-white opacity-0 shadow-lg backdrop-blur-[10px] transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100"
      >
        <span className="text-base font-semibold tracking-[-0.16px]">
          {label}
        </span>
        <span className="flex size-10 items-center justify-center rounded-full bg-white text-secondary">
          <ArrowIcon />
        </span>
      </Link>
    </div>
  );
}
