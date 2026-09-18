import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * /robots.txt — генерира се динамично от Next.js (App Router).
 *
 * Затворени за индексиране: собственият ни админ панел и вградения Payload
 * админ. И двата вече имат и `noindex` мета таг (виж съответните layout-и) —
 * това е допълнителна защита, самото robots.txt не гарантира неиндексиране
 * на адрес, до който вече има линк отнякъде другаде.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/Funparkadminpanel", "/admin", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
