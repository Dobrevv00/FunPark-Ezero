"use server";

import { cookies } from "next/headers";
import { PREVIEW_COOKIE, PREVIEW_MAX_AGE } from "@/lib/preview";

/**
 * Проверка на паролата за достъп до сайта, докато е включен режим
 * „Очаквайте скоро“.
 *
 * Изпълнява се САМО на сървъра — паролата не влиза в браузърния bundle и не се
 * връща в отговора. По подразбиране е стойността по-долу; ако е зададена
 * променлива на средата COMING_SOON_PASSWORD, тя е водеща (може да се сменя от
 * Vercel без промяна в кода).
 */
const password = () =>
  process.env.COMING_SOON_PASSWORD?.trim() || "Funpark123";

/** Проста защита срещу подбор на парола — забавя всеки опит. */
const delay = () => new Promise((r) => setTimeout(r, 400));

export async function unlockPreview(
  input: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await delay();

  if (typeof input !== "string" || input.trim() === "") {
    return { ok: false, error: "Въведете парола." };
  }

  if (input !== password()) {
    return { ok: false, error: "Грешна парола." };
  }

  const jar = await cookies();
  jar.set(PREVIEW_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PREVIEW_MAX_AGE,
  });

  return { ok: true };
}
