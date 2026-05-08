import { getBrand, type BrandValue } from "@/lib/brands";

export function BrandBadge({
  brand,
  size = "sm",
}: {
  brand: BrandValue;
  size?: "sm" | "xs";
}) {
  const b = getBrand(brand);
  if (!b) return null;
  const text = size === "xs" ? "text-[10px]" : "text-xs";
  const dot = size === "xs" ? "h-1.5 w-1.5" : "h-2 w-2";
  return (
    <span className={`inline-flex items-center gap-1.5 ${text} text-foreground/70`}>
      <span className={`inline-block rounded-full ${dot} ${b.color}`} />
      {b.label}
    </span>
  );
}
