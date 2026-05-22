export const CONTACT_BRANDS = ["audioguy", "sound360", "seoro"] as const;
export type ContactBrand = (typeof CONTACT_BRANDS)[number];

export const CONTACT_BRAND_LABELS: Record<ContactBrand, string> = {
  audioguy: "Audioguy",
  sound360: "Sound360",
  seoro: "Seoro",
};

export function isContactBrand(value: unknown): value is ContactBrand {
  return (
    typeof value === "string" &&
    (CONTACT_BRANDS as readonly string[]).includes(value)
  );
}

export function getRecipientFor(brand: ContactBrand): string {
  const overrides: Record<ContactBrand, string | undefined> = {
    audioguy: process.env.CONTACT_EMAIL_AUDIOGUY,
    sound360: process.env.CONTACT_EMAIL_SOUND360,
    seoro: process.env.CONTACT_EMAIL_SEORO,
  };
  const fallback: Record<ContactBrand, string> = {
    audioguy: "audioguy@audioguyrecords.com",
    sound360: "sound360@audioguyrecords.com",
    seoro: "seoro@audioguyrecords.com",
  };
  return overrides[brand] ?? fallback[brand];
}
