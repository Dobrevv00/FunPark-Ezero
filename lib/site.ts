/**
 * Публичният адрес на сайта — един източник, ползван за `metadataBase`,
 * `robots.txt`, `sitemap.xml` и абсолютните адреси в Open Graph/Twitter.
 *
 * Обикновен домейн, не тайна — затова е константа в кода, а не env променлива.
 */
export const SITE_URL = "https://www.funparkezero.bg";

/** Името на сайта/марката — едно място, ползвано в метаданните навсякъде. */
export const SITE_NAME = "Fun Park Ezero";

/**
 * Снимката, ползвана за Open Graph/Twitter превюта, когато страницата няма
 * своя. Next.js НЕ обединява дълбоко `openGraph`/`twitter` между layout и
 * page — ако дадена страница зададе свой `openGraph`, наследеният от
 * layout.tsx напълно се замества (включително снимката), затова всяка
 * страница трябва изрично да включи тази константа в своя `images`.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/images/hero.jpg",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

type SiteSettingsForJsonLd = {
  contact?: {
    phone?: string | null;
    email?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
  } | null;
  openingHours?: { label?: string | null; value?: string | null } | null;
  socials?: { network?: string | null; url?: string | null }[] | null;
} | null;

/** „10:00 – 22:00“ → {opens:"10:00", closes:"22:00"}; при неразпознат формат — null. */
const parseHoursRange = (value: string): { opens: string; closes: string } | null => {
  const parts = value.split(/[–-]/).map((p) => p.trim());
  if (parts.length !== 2) return null;
  const isTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
  if (!isTime(parts[0]) || !isTime(parts[1])) return null;
  return { opens: parts[0], closes: parts[1] };
};

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * Structured data (schema.org `AmusementPark`) за парка — само от реални,
 * вече публични данни (настройките на сайта). При непопълнено или
 * неразпознато поле съответната част просто отсъства, вместо да се измисля.
 * Показва се на всяка публична страница (виж `app/(frontend)/layout.tsx`).
 */
export const buildLocalBusinessJsonLd = (settings: SiteSettingsForJsonLd) => {
  const phone = settings?.contact?.phone?.trim() || undefined;
  const email = settings?.contact?.email?.trim() || undefined;
  // "ул. „Димитър Димов“," → без крайната запетая
  const street = settings?.contact?.addressLine1?.trim().replace(/,\s*$/, "");
  // "8000 Бургас" → пощенски код + град, поотделно
  const line2 = settings?.contact?.addressLine2?.trim() ?? "";
  const line2Match = line2.match(/^(\d{4})\s+(.+)$/);
  const postalCode = line2Match?.[1];
  const locality = line2Match?.[2] ?? (line2 || undefined);

  // само "Всеки ден" се превежда надеждно към списък от дни — друг текст не се гадае
  const hoursLabel = settings?.openingHours?.label?.trim();
  const hoursValue = settings?.openingHours?.value?.trim();
  const parsedHours = hoursValue ? parseHoursRange(hoursValue) : null;
  const openingHoursSpecification =
    parsedHours && hoursLabel === "Всеки ден"
      ? [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ALL_DAYS,
            opens: parsedHours.opens,
            closes: parsedHours.closes,
          },
        ]
      : undefined;

  const sameAs = (settings?.socials ?? [])
    .map((s) => s.url?.trim())
    .filter((u): u is string => Boolean(u));

  return {
    "@context": "https://schema.org",
    "@type": "AmusementPark",
    "@id": `${SITE_URL}/#park`,
    name: SITE_NAME,
    url: SITE_URL,
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    ...(street || locality
      ? {
          address: {
            "@type": "PostalAddress",
            ...(street ? { streetAddress: street } : {}),
            ...(locality ? { addressLocality: locality } : {}),
            ...(postalCode ? { postalCode } : {}),
            addressCountry: "BG",
          },
        }
      : {}),
    ...(openingHoursSpecification ? { openingHoursSpecification } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
};
