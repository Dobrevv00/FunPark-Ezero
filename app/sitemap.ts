import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * /sitemap.xml — генерира се динамично от Next.js (App Router).
 *
 * Само индексируеми страници. Извън списъка нарочно остават:
 *  · админ панелите — затворени и за robots.txt, и с `noindex`;
 *  · трите юридически страници (privacy-policy/terms/cookie-policy) — те
 *    самите носят `noindex` (виж съответните им `metadata`), затова не бива
 *    да са в sitemap-а.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/events", changeFrequency: "daily", priority: 0.9 },
    { path: "/competitions", changeFrequency: "daily", priority: 0.9 },
    { path: "/birthdays", changeFrequency: "weekly", priority: 0.8 },
    { path: "/contacts", changeFrequency: "monthly", priority: 0.6 },
  ];

  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
