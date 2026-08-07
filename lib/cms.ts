/**
 * Малки помощни функции за съдържанието от CMS.
 *
 * ВАЖНО: този файл не внася нищо от `payload`, защото се ползва и от
 * клиентски компоненти. Четенето от базата е в `lib/cms.server.ts`.
 */

/** Текст от CMS или резервният текст от кода, ако полето е празно. */
export const t = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim() !== "" ? value : fallback;

/** Адрес на качен файл от Media или резервният път от public/. */
export const mediaUrl = (value: unknown, fallback: string): string => {
  if (value && typeof value === "object" && "url" in value) {
    const url = (value as { url?: string | null }).url;
    if (typeof url === "string" && url !== "") return url;
  }
  return fallback;
};
