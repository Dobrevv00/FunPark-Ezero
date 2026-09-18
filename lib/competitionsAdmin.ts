import { getPayload } from "payload";
import config from "@payload-config";

import type { AdminCompetition } from "@/lib/competitionsShared";

/**
 * Сървърна логика за управление на състезанията от `/Funparkadminpanel`.
 *
 * Тук НЯМА проверка за вход — този модул се вика само от обвивките в
 * `lib/actions/competitionsAdmin.ts`, които първо проверяват бисквитката.
 * Не се внася от клиентски компоненти.
 */

export type AdminResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: "auth" | "invalid" | "server"; message?: string };

export type CompetitionInput = {
  title: string;
  description?: string;
  /** ISO дати; празно = „Датата предстои“ */
  qualificationDate: string;
  semifinalDate: string;
  finalDate: string;
  /** краят на кръга, ако е в няколко дни (събота и неделя) */
  qualificationDateTo?: string;
  semifinalDateTo?: string;
  finalDateTo?: string;
  /** часовете още не са обявени — на сайта се показват само датите */
  timeUnknown?: boolean;
  /** празно = без ограничение */
  maxParticipants: string | number;
  /** празно = без такса */
  feeEur?: string | number;
  location?: string;
  feeNote?: string;
  registrationNote?: string;
  prizeInfo?: string;
  /** правилата по раздели; точките идват като редове в текстово поле */
  rules?: { title?: string; intro?: string; items?: string[] }[];
  penalties?: { penalty?: string; reason?: string }[];
  rulesNote?: string;
};

const invalid = (message: string) => ({ ok: false, error: "invalid", message }) as const;

const toId = (v: unknown): number | null => {
  if (v && typeof v === "object" && "id" in v) return Number((v as { id: unknown }).id);
  if (typeof v === "number") return v;
  return null;
};

const ids = (list: unknown): number[] =>
  Array.isArray(list)
    ? list.map(toId).filter((v): v is number => v !== null && Number.isInteger(v))
    : [];

const validId = (id: unknown): id is number => Number.isInteger(id) && (id as number) > 0;

const logError = (what: string, err: unknown) =>
  console.error(`[competitions-admin] ${what}:`, err instanceof Error ? err.message : err);

/** Текст с ограничена дължина */
const text = (raw: unknown, limit: number) =>
  typeof raw === "string" ? raw.trim().slice(0, limit) : "";

/** Проверява полетата от формата и ги връща готови за запис */
function parseInput(input: CompetitionInput, isNew: boolean) {
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const description =
    typeof input?.description === "string" ? input.description.trim() : "";
  if (title === "") return invalid("Въведете име на състезанието.");
  if (title.length > 150) return invalid("Името е твърде дълго (до 150 знака).");
  if (description.length > 500) return invalid("Описанието е твърде дълго (до 500 знака).");

  const date = (raw: unknown) => {
    if (typeof raw !== "string" || raw.trim() === "") return null;
    const t = Date.parse(raw);
    return Number.isNaN(t) ? undefined : new Date(t).toISOString();
  };
  const qualificationDate = date(input.qualificationDate);
  const semifinalDate = date(input.semifinalDate);
  const finalDate = date(input.finalDate);
  const qualificationDateTo = date(input.qualificationDateTo);
  const semifinalDateTo = date(input.semifinalDateTo);
  const finalDateTo = date(input.finalDateTo);
  if (qualificationDate === undefined || semifinalDate === undefined || finalDate === undefined) {
    return invalid("Невалидна дата.");
  }
  if (
    qualificationDateTo === undefined ||
    semifinalDateTo === undefined ||
    finalDateTo === undefined
  ) {
    return invalid("Невалидна крайна дата.");
  }
  if (!qualificationDate) return invalid("Изберете дата и час на квалификацията.");

  // краят на кръга не може да е преди началото му
  const ranges: [string, string | null, string | null][] = [
    ["квалификацията", qualificationDate, qualificationDateTo],
    ["полуфинала", semifinalDate, semifinalDateTo],
    ["финала", finalDate, finalDateTo],
  ];
  for (const [label, from, to] of ranges) {
    if (to && !from) return invalid(`Първо задайте начална дата на ${label}.`);
    if (to && from && Date.parse(to) < Date.parse(from)) {
      return invalid(`Крайната дата на ${label} е преди началната.`);
    }
  }

  // нови състезания не могат да започват в миналото
  if (isNew && Date.parse(qualificationDate) < Date.now() - 5 * 60 * 1000) {
    return invalid("Квалификацията не може да е в минал ден или час.");
  }
  if (semifinalDate && Date.parse(semifinalDate) < Date.parse(qualificationDate)) {
    return invalid("Полуфиналът трябва да е след квалификацията.");
  }
  if (finalDate && Date.parse(finalDate) < Date.parse(semifinalDate ?? qualificationDate)) {
    return invalid(
      semifinalDate
        ? "Финалът трябва да е след полуфинала."
        : "Финалът трябва да е след квалификацията.",
    );
  }

  const rawMax = String(input.maxParticipants ?? "").trim();
  let maxParticipants: number | null = null;
  if (rawMax !== "") {
    const n = Number(rawMax);
    if (!Number.isInteger(n) || n < 1 || n > 10000) {
      return invalid("Броят участници трябва да е цяло число от 1 до 10000.");
    }
    maxParticipants = n;
  }

  const rawFee = String(input.feeEur ?? "").trim().replace(",", ".");
  let feeEur: number | null = null;
  if (rawFee !== "") {
    const n = Number(rawFee);
    if (!Number.isFinite(n) || n < 0 || n > 10000) {
      return invalid("Таксата трябва да е число между 0 и 10000.");
    }
    feeEur = Math.round(n * 100) / 100;
  }

  // правилата: раздел без заглавие и без точки просто се пропуска
  const rules = (Array.isArray(input.rules) ? input.rules : [])
    .map((r) => ({
      title: text(r?.title, 150),
      intro: text(r?.intro, 1000),
      items: (Array.isArray(r?.items) ? r.items : [])
        .map((i) => text(i, 500))
        .filter((i) => i !== "")
        .map((t) => ({ text: t })),
    }))
    .filter((r) => r.title !== "" || r.intro !== "" || r.items.length > 0)
    .slice(0, 30);

  const penalties = (Array.isArray(input.penalties) ? input.penalties : [])
    .map((p) => ({ penalty: text(p?.penalty, 60), reason: text(p?.reason, 400) }))
    .filter((p) => p.penalty !== "" || p.reason !== "")
    .slice(0, 30);

  return {
    ok: true as const,
    data: {
      title,
      description: description || null,
      qualificationDate,
      semifinalDate,
      finalDate,
      qualificationDateTo,
      semifinalDateTo,
      finalDateTo,
      timeUnknown: input.timeUnknown === true,
      maxParticipants,
      feeEur,
      location: text(input.location, 150) || null,
      feeNote: text(input.feeNote, 200) || null,
      registrationNote: text(input.registrationNote, 600) || null,
      prizeInfo: text(input.prizeInfo, 600) || null,
      rules,
      penalties,
      rulesNote: text(input.rulesNote, 600) || null,
    },
  };
}

/** Всички състезания (и скритите) със записаните за всяко */
export async function listCompetitionsForAdmin(): Promise<AdminResult<AdminCompetition[]>> {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "competitions",
      sort: "qualificationDate",
      pagination: false,
      depth: 0,
      joins: false,
      overrideAccess: true,
    });
    const competitionIds = res.docs.map((c) => c.id);
    const regs =
      competitionIds.length === 0
        ? []
        : (
            await payload.find({
              collection: "competition-registrations",
              where: { competition: { in: competitionIds } },
              sort: "createdAt",
              pagination: false,
              depth: 0,
              overrideAccess: true,
            })
          ).docs;

    const data: AdminCompetition[] = res.docs.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description ?? "",
      qualificationDate: c.qualificationDate ?? null,
      semifinalDate: c.semifinalDate ?? null,
      finalDate: c.finalDate ?? null,
      qualificationDateTo: c.qualificationDateTo ?? null,
      semifinalDateTo: c.semifinalDateTo ?? null,
      finalDateTo: c.finalDateTo ?? null,
      timeUnknown: c.timeUnknown === true,
      maxParticipants: c.maxParticipants ?? null,
      feeEur: typeof c.feeEur === "number" ? c.feeEur : null,
      location: c.location ?? "",
      feeNote: c.feeNote ?? "",
      registrationNote: c.registrationNote ?? "",
      prizeInfo: c.prizeInfo ?? "",
      rules: (c.rules ?? []).map((r) => ({
        title: r.title ?? "",
        intro: r.intro ?? "",
        items: (r.items ?? []).map((i) => i.text ?? "").filter((t) => t.trim() !== ""),
      })),
      penalties: (c.penalties ?? []).map((p) => ({
        penalty: p.penalty ?? "",
        reason: p.reason ?? "",
      })),
      rulesNote: c.rulesNote ?? "",
      active: c.active !== false,
      registrations: regs
        .filter((r) => toId(r.competition) === c.id)
        .map((r) => ({
          id: r.id,
          name: r.name,
          age: r.age,
          phone: r.phone,
          email: r.email,
          guardianName: r.guardianName ?? "",
          note: r.note ?? "",
          status: r.status ?? "new",
          createdAt: r.createdAt,
        })),
      semifinalists: ids(c.semifinalists),
      finalists: ids(c.finalists),
    }));
    return { ok: true, data };
  } catch (err) {
    logError("списъкът не можа да бъде прочетен", err);
    return { ok: false, error: "server" };
  }
}

export async function createCompetition(
  input: CompetitionInput,
): Promise<AdminResult<{ id: number }>> {
  const parsed = parseInput(input, true);
  if (!parsed.ok) return parsed;
  try {
    const payload = await getPayload({ config });
    const doc = await payload.create({
      collection: "competitions",
      overrideAccess: true,
      data: { ...parsed.data, active: true },
    });
    return { ok: true, data: { id: doc.id } };
  } catch (err) {
    logError("състезанието не можа да бъде създадено", err);
    return { ok: false, error: "server" };
  }
}

export async function updateCompetition(
  id: number,
  input: CompetitionInput,
): Promise<AdminResult> {
  if (!validId(id)) return invalid("Няма такова състезание.");
  const parsed = parseInput(input, false);
  if (!parsed.ok) return parsed;
  try {
    const payload = await getPayload({ config });
    await payload.update({
      collection: "competitions",
      id,
      overrideAccess: true,
      data: parsed.data,
    });
    return { ok: true, data: undefined };
  } catch (err) {
    logError("състезанието не можа да бъде променено", err);
    return { ok: false, error: "server" };
  }
}

/** Показва или скрива състезанието от сайта, без да пипа другите полета */
export async function setCompetitionActive(
  id: number,
  active: boolean,
): Promise<AdminResult> {
  if (!validId(id) || typeof active !== "boolean") return invalid("Невалидна заявка.");
  try {
    const payload = await getPayload({ config });
    await payload.update({
      collection: "competitions",
      id,
      overrideAccess: true,
      data: { active },
    });
    return { ok: true, data: undefined };
  } catch (err) {
    logError("видимостта не можа да бъде сменена", err);
    return { ok: false, error: "server" };
  }
}

/**
 * Изтрива състезанието. Записванията остават в Payload Admin
 * („Записвания за квалификация“) с името на състезанието като текст.
 */
export async function deleteCompetition(id: number): Promise<AdminResult> {
  if (!validId(id)) return invalid("Няма такова състезание.");
  try {
    const payload = await getPayload({ config });
    await payload.delete({ collection: "competitions", id, overrideAccess: true });
    return { ok: true, data: undefined };
  } catch (err) {
    logError("състезанието не можа да бъде изтрито", err);
    return { ok: false, error: "server" };
  }
}

/**
 * Записва кой продължава на полуфинал и финал.
 * Участниците трябва да са записани за същото състезание, а финалистите —
 * да са сред полуфиналистите.
 */
export async function setQualifiers(
  id: number,
  semifinalists: number[],
  finalists: number[],
): Promise<AdminResult> {
  if (!validId(id)) return invalid("Няма такова състезание.");
  const semi = [...new Set(ids(semifinalists))];
  const fin = [...new Set(ids(finalists))];
  if (fin.some((f) => !semi.includes(f))) {
    return invalid("Финалистите трябва да са избрани и за полуфинал.");
  }
  try {
    const payload = await getPayload({ config });
    if (semi.length > 0) {
      const found = await payload.find({
        collection: "competition-registrations",
        where: { and: [{ id: { in: semi } }, { competition: { equals: id } }] },
        pagination: false,
        depth: 0,
        select: { competition: true },
        overrideAccess: true,
      });
      if (found.docs.length !== semi.length) {
        return invalid("Някой от избраните не е записан за това състезание.");
      }
    }
    await payload.update({
      collection: "competitions",
      id,
      overrideAccess: true,
      data: { semifinalists: semi, finalists: fin },
    });
    return { ok: true, data: undefined };
  } catch (err) {
    logError("класираните не можаха да бъдат записани", err);
    return { ok: false, error: "server" };
  }
}
