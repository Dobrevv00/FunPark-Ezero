"use server";

import {
  checkAdminCredentials,
  endAdminSession,
  isAdminRequest,
  startAdminSession,
} from "@/lib/adminSession";

/** Забавяне срещу подбор на парола */
const delay = () => new Promise((r) => setTimeout(r, 500));

export async function loginAdmin(user: string, pass: string): Promise<{ ok: boolean }> {
  await delay();
  if (typeof user !== "string" || typeof pass !== "string") return { ok: false };
  if (!checkAdminCredentials(user.trim(), pass)) return { ok: false };
  await startAdminSession();
  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  await endAdminSession();
}

/** Дали браузърът има валиден вход — проверява се при отваряне на панела */
export async function checkAdminSession(): Promise<boolean> {
  return isAdminRequest();
}
