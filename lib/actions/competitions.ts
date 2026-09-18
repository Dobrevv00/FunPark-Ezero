"use server";

import { revalidatePath } from "next/cache";
import {
  createCompetitionRegistration,
  type RegistrationResult,
} from "@/lib/competitions";

/** Записване за квалификацията на състезание — от „Състезания“ и „Събития“. */
export async function submitCompetitionRegistration(input: {
  competitionId: number;
  name: string;
  age: number | string;
  phone: string;
  email: string;
  guardianName?: string;
  note?: string;
  consent: boolean;
  pageUrl?: string;
  honeypot?: string;
}): Promise<RegistrationResult> {
  const res = await createCompetitionRegistration(input);
  // броят свободни места на сайта се обновява веднага
  if (res.ok) {
    revalidatePath("/competitions");
    revalidatePath("/events");
  }
  return res;
}
