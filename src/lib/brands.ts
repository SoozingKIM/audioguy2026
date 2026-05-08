export const BRANDS = [
  {
    value: "audioguy",
    label: "Audioguy",
    href: "/audioguy",
    color: "bg-emerald-500",
  },
  {
    value: "sound360",
    label: "Sound360",
    href: "/sound360",
    color: "bg-sky-500",
  },
  {
    value: "seoro",
    label: "Seoro",
    href: "/seoro",
    color: "bg-amber-500",
  },
] as const;

export type BrandValue = (typeof BRANDS)[number]["value"];

export const BRAND_VALUES = BRANDS.map((b) => b.value) as BrandValue[];

export function getBrand(value: string | undefined | null) {
  if (!value) return undefined;
  return BRANDS.find((b) => b.value === value);
}

export function isBrandValue(value: string | undefined | null): value is BrandValue {
  return !!value && BRAND_VALUES.includes(value as BrandValue);
}
