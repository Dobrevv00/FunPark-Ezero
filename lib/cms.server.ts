import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

import {
  formatCompetitionPeriod,
  publicName,
  type CompetitionPenalty,
  type CompetitionRule,
  type PublicCompetition,
} from "@/lib/competitionsShared";
import type { Config, Event, Package } from "@/payload-types";

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
export const getBirthdaysPage = cache(() => readGlobal("birthdays-page"));

/**
 * Пакетите за рожден ден — само активните, подредени по полето „Подредба“.
 * Изключените (`active: false`) остават в CMS, но не се показват на сайта.
 */
export const getPackages = cache(async (): Promise<Package[]> => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "packages",
      where: { active: { not_equals: false } },
      sort: "order",
      limit: 100,
      depth: 0,
      overrideAccess: true,
    });
    return res.docs;
  } catch (err) {
    console.warn(
      "[cms] пакетите не можаха да бъдат прочетени.",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
});

const relId = (v: unknown): number | null => {
  if (v && typeof v === "object" && "id" in v) return Number((v as { id: unknown }).id);
  return typeof v === "number" ? v : null;
};

/**
 * Активните състезания за страниците „Състезания“ и „Събития“ — подредени по
 * дата на квалификацията. Връща лек обект, годен за клиентски компонент:
 * без телефони, имейли и пълни имена — класираните излизат като „Иван П.“.
 */
export const getCompetitions = cache(async (): Promise<PublicCompetition[]> => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "competitions",
      where: { active: { not_equals: false } },
      sort: "qualificationDate",
      limit: 50,
      depth: 0,
      joins: false,
      overrideAccess: true,
    });
    if (res.docs.length === 0) return [];

    // само името и статусът — за броя записани и за имената на класираните
    const regs = await payload.find({
      collection: "competition-registrations",
      where: { competition: { in: res.docs.map((c) => c.id) } },
      pagination: false,
      depth: 0,
      select: { competition: true, name: true, status: true },
      overrideAccess: true,
    });
    const nameById = new Map(regs.docs.map((r) => [r.id, publicName(r.name)]));
    const names = (list: unknown) =>
      (Array.isArray(list) ? list : [])
        .map((v) => nameById.get(relId(v) ?? -1))
        .filter((n): n is string => Boolean(n));

    return res.docs.map((c) => {
      const registeredCount = regs.docs.filter(
        (r) => relId(r.competition) === c.id && r.status !== "rejected",
      ).length;
      const max = c.maxParticipants ?? null;
      const noTime = c.timeUnknown === true;
      const rules: CompetitionRule[] = (c.rules ?? []).map((r) => ({
        title: r.title ?? "",
        intro: r.intro ?? "",
        items: (r.items ?? [])
          .map((i) => i.text ?? "")
          .filter((t) => t.trim() !== ""),
      }));
      const penalties: CompetitionPenalty[] = (c.penalties ?? []).map((p) => ({
        penalty: p.penalty ?? "",
        reason: p.reason ?? "",
      }));
      return {
        id: c.id,
        title: c.title,
        description: c.description ?? "",
        qualificationDate: c.qualificationDate ?? null,
        qualificationDateLabel: formatCompetitionPeriod(
          c.qualificationDate ?? null,
          c.qualificationDateTo ?? null,
          noTime,
        ),
        semifinalDateLabel: formatCompetitionPeriod(
          c.semifinalDate ?? null,
          c.semifinalDateTo ?? null,
          noTime,
        ),
        finalDateLabel: formatCompetitionPeriod(
          c.finalDate ?? null,
          c.finalDateTo ?? null,
          noTime,
        ),
        location: c.location ?? "",
        feeEur: typeof c.feeEur === "number" ? c.feeEur : null,
        feeNote: c.feeNote ?? "",
        registrationNote: c.registrationNote ?? "",
        prizeInfo: c.prizeInfo ?? "",
        rules,
        penalties,
        rulesNote: c.rulesNote ?? "",
        maxParticipants: max,
        registeredCount,
        spotsLeft: max === null ? null : Math.max(0, max - registeredCount),
        semifinalists: names(c.semifinalists),
        finalists: names(c.finalists),
      };
    });
  } catch (err) {
    console.warn(
      "[cms] състезанията не можаха да бъдат прочетени.",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
});

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
