import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

import type { Config, Event } from "@/payload-types";

type GlobalSlug = keyof Config["globals"];

/**
 * Чете глобал от Payload. Ако базата не е достъпна или глобалът още не е
 * попълнен, връща null — компонентите тогава използват текстовете от кода,
 * така че сайтът никога не се чупи заради CMS.
 *
 * Само за сървърни компоненти.
 */
async function readGlobal<S extends GlobalSlug>(
  slug: S,
): Promise<Config["globals"][S] | null> {
  try {
    const payload = await getPayload({ config });
    const doc = await payload.findGlobal({ slug, depth: 1, overrideAccess: true });
    return (doc ?? null) as Config["globals"][S] | null;
  } catch (err) {
    console.warn(
      `[cms] глобалът „${slug}“ не можа да бъде прочетен — сайтът използва текстовете от кода.`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

export const getSiteSettings = cache(() => readGlobal("site-settings"));
export const getHeader = cache(() => readGlobal("header"));
export const getFooter = cache(() => readGlobal("footer"));
export const getHomePage = cache(() => readGlobal("home-page"));
export const getEventsPage = cache(() => readGlobal("events-page"));
export const getContactsPage = cache(() => readGlobal("contacts-page"));

/** Събития за конкретната версия на страницата, в зададената подредба. */
export const getEvents = cache(
  async (variant: "desktop" | "mobile"): Promise<Event[]> => {
    try {
      const payload = await getPayload({ config });
      const res = await payload.find({
        collection: "events",
        where: { showOn: { in: [variant, "both"] } },
        sort: "order",
        limit: 50,
        depth: 1,
        overrideAccess: true,
      });
      return res.docs;
    } catch (err) {
      console.warn(
        "[cms] събитията не можаха да бъдат прочетени — сайтът използва списъка от кода.",
        err instanceof Error ? err.message : err,
      );
      return [];
    }
  },
);
