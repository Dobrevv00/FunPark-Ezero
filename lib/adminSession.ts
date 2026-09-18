import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Вход в `/Funparkadminpanel`, проверяван на сървъра.
 *
 * Името и паролата НЕ са в браузърния код. По подразбиране са досегашните;
 * ако са зададени ADMIN_PANEL_USER / ADMIN_PANEL_PASSWORD в средата, те са
 * водещи. След успешен вход сървърът слага httpOnly бисквитка, подписана с
 * PAYLOAD_SECRET — без нея действията, които променят данни, се отказват.
 *
 * САМО за сървъра — не се внася от клиентски компоненти.
 */

export const ADMIN_COOKIE = "fpe-admin";

/** Колко дълго важи входът (12 часа) */
const SESSION_SECONDS = 60 * 60 * 12;

const secret = () => process.env.PAYLOAD_SECRET || "";

const sign = (value: string) =>
  createHmac("sha256", secret()).update(value).digest("hex");

const safeEqual = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
};

/** Проверка на име и парола, без да издава коя част е грешна */
export function checkAdminCredentials(user: string, pass: string): boolean {
  const expectedUser = process.env.ADMIN_PANEL_USER?.trim() || "Ezeroadmin";
  const expectedPass = process.env.ADMIN_PANEL_PASSWORD?.trim() || "Funpark123";
  // и двете сравнения се правят винаги — еднакво време при грешно име или парола
  const okUser = safeEqual(user, expectedUser);
  const okPass = safeEqual(pass, expectedPass);
  return okUser && okPass;
}

/** Слага бисквитката за вход */
export async function startAdminSession() {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

/** Дали текущата заявка е от влязъл администратор */
export async function isAdminRequest(): Promise<boolean> {
  if (!secret()) return false;
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value ?? "";
  const [exp, sig] = raw.split(".");
  if (!exp || !sig) return false;
  if (!/^\d+$/.test(exp) || Number(exp) * 1000 < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}
