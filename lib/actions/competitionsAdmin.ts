"use server";

import { revalidatePath } from "next/cache";

import { isAdminRequest } from "@/lib/adminSession";
import {
  createCompetition,
  deleteCompetition,
  listCompetitionsForAdmin,
  setCompetitionActive,
  setQualifiers,
  updateCompetition,
  type AdminResult,
  type CompetitionInput,
} from "@/lib/competitionsAdmin";

/**
 * Действия за секция „Състезания“ в `/Funparkadminpanel`.
 *
 * Всяко първо проверява бисквитката за вход на сървъра — без нея нищо не се
 * чете и не се променя. След промяна страниците „Състезания“ и „Събития“ се
 * обновяват веднага, без да чакат кеша.
 */

const DENIED = { ok: false, error: "auth" } as const;

const guarded = async <T>(
  run: () => Promise<AdminResult<T>>,
  refresh = true,
): Promise<AdminResult<T>> => {
  if (!(await isAdminRequest())) return DENIED;
  const res = await run();
  if (res.ok && refresh) {
    revalidatePath("/competitions");
    revalidatePath("/events");
  }
  return res;
};

export async function listCompetitionsAdmin() {
  return guarded(listCompetitionsForAdmin, false);
}

export async function createCompetitionAdmin(input: CompetitionInput) {
  return guarded(() => createCompetition(input));
}

export async function updateCompetitionAdmin(id: number, input: CompetitionInput) {
  return guarded(() => updateCompetition(id, input));
}

export async function setCompetitionActiveAdmin(id: number, active: boolean) {
  return guarded(() => setCompetitionActive(id, active));
}

export async function deleteCompetitionAdmin(id: number) {
  return guarded(() => deleteCompetition(id));
}

export async function setQualifiersAdmin(
  id: number,
  semifinalists: number[],
  finalists: number[],
) {
  return guarded(() => setQualifiers(id, semifinalists, finalists));
}
