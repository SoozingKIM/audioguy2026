import { Link } from "@/i18n/navigation";

/**
 * AUDIOGUY wordmark logo, drawn with a CSS mask so the wordmark shape is
 * filled by the element's background color. Pass the fill via `className`
 * (e.g. `bg-foreground` on light surfaces, `bg-white` on the dark footer)
 * so the same PNG adapts to any background.
 */
export function BrandLogo({
  label,
  className = "block h-5 w-32 bg-foreground",
}: {
  label: string;
  className?: string;
}) {
  return (
    <Link href="/" aria-label={label}>
      <span
        aria-hidden="true"
        className={className}
        style={{
          maskImage: "url(/logo.png)",
          WebkitMaskImage: "url(/logo.png)",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskPosition: "left center",
          WebkitMaskPosition: "left center",
        }}
      />
    </Link>
  );
}
