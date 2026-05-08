export function formatReleaseDate(iso: string | undefined): string {
  if (!iso) return "";
  const [y, m] = iso.split("-");
  if (!y) return iso;
  if (!m) return y;
  return `${y}.${m}`;
}
