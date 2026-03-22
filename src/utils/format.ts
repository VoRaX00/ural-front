export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAddress(a: {
  country?: string;
  region?: string;
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
  postalCode?: string;
}): string {
  const parts = [
    a.postalCode,
    a.country,
    a.region,
    a.city,
    a.street,
    a.building && `д. ${a.building}`,
    a.apartment && `кв. ${a.apartment}`,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export function formatDecimal(n: number | undefined | null): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  return String(n);
}
