import { getPayload } from "payload";
import config from "@payload-config";

import { ADULT_AGE, AGE_LIMITS } from "@/lib/competitionsShared";
import { isValidBgPhone, isValidEmail } from "@/lib/validation";

/**
 * Сървърна логика за записванията за квалификация.
 * Този модул НЕ се внася от клиентски компоненти — те викат обвивката
 * в `lib/actions/competitions.ts`.
 */

export type RegistrationResult = {
  ok: boolean;
  /** full = местата за квалификацията са запълнени */
  error?: "invalid" | "full" | "server";
};

export type RegistrationInput = {
  competitionId?: number | string;
  name?: string;
  age?: number | string;
  phone?: string;
  email?: string;
  guardianName?: string;
  note?: string;
  consent?: boolean;
  pageUrl?: string;
  /** Скрито поле — ако е попълнено, изпращачът е бот. */
  honeypot?: string;
};

const LIMITS = {
  name: 100,
  phone: 40,
  email: 100,
  guardianName: 100,
  note: 1000,
  pageUrl: 300,
} as const;

const clean = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/**
 * Проверява и записва записване за квалификация. Връща `ok: true` и когато е
 * уловен бот — за да не му става ясно, че е спрян.
 */
export async function createCompetitionRegistration(
  input: RegistrationInput,
): Promise<RegistrationResult> {
  if (clean(input.honeypot) !== "") return { ok: true };

  const name = clean(input.name);
  const phone = clean(input.phone);
  const email = clean(input.email);
  const guardianName = clean(input.guardianName);
  const note = clean(input.note);
  const pageUrl = clean(input.pageUrl);
  const age = Number(input.age);
  const competitionId = Number(input.competitionId);

  // същите правила като в клиентската валидация
  if (!Number.isInteger(competitionId) || competitionId <= 0) {
    return { ok: false, error: "invalid" };
  }
  if (name === "" || !isValidBgPhone(phone) || !isValidEmail(email)) {
    return { ok: false, error: "invalid" };
  }
  if (!Number.isInteger(age) || age < AGE_LIMITS.min || age > AGE_LIMITS.max) {
    return { ok: false, error: "invalid" };
  }
  // за непълнолетни е нужен родител или настойник
  if (age < ADULT_AGE && guardianName === "") {
    return { ok: false, error: "invalid" };
  }
  if (input.consent !== true) return { ok: false, error: "invalid" };

  if (
    name.length > LIMITS.name ||
    phone.length > LIMITS.phone ||
    email.length > LIMITS.email ||
    guardianName.length > LIMITS.guardianName ||
    note.length > LIMITS.note ||
    pageUrl.length > LIMITS.pageUrl
  ) {
    return { ok: false, error: "invalid" };
  }

  try {
    const payload = await getPayload({ config });

    // записване се приема само за съществуващо и активно състезание
    const competition = await payload
      .findByID({
        collection: "competitions",
        id: competitionId,
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => null);
    if (!competition || competition.active === false) {
      return { ok: false, error: "invalid" };
    }

    // лимит „до колко човека“ — отказаните записвания не заемат място
    if (competition.maxParticipants) {
      const { totalDocs } = await payload.count({
        collection: "competition-registrations",
        where: {
          and: [
            { competition: { equals: competition.id } },
            { status: { not_equals: "rejected" } },
          ],
        },
        overrideAccess: true,
      });
      if (totalDocs >= competition.maxParticipants) {
        return { ok: false, error: "full" };
      }
    }

    await payload.create({
      collection: "competition-registrations",
      overrideAccess: true,
      data: {
        competition: competition.id,
        competitionTitle: competition.title,
        status: "new",
        name,
        age,
        phone,
        email,
        // за пълнолетни полето не се пази, дори да е изпратено
        guardianName: age < ADULT_AGE ? guardianName : undefined,
        note: note || undefined,
        consent: true,
        pageUrl: pageUrl || undefined,
      },
    });
    return { ok: true };
  } catch (err) {
    console.error(
      "[competitions] записването не можа да бъде запазено:",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: "server" };
  }
}
