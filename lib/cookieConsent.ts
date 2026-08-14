/**
 * Основа на GDPR / Cookie Consent системата.
 *
 * Тук е само логиката (типове, четене и запис в localStorage, събития) — без
 * React, за да може да се ползва и от бъдещ tracking код извън компонентите.
 *
 * Засега НЕ зарежда никакви скриптове. Meta Pixel, Google Analytics и подобни
 * ще се закачат по-късно, като проверяват `consent.marketing` / `consent.analytics`.
 */

/** Категориите съгласие. „necessary“ е винаги включена. */
export type ConsentCategory = "necessary" | "analytics" | "marketing";

/** Изборът на посетителя. `necessary` е литерално `true` — не може да се изключи. */
export type ConsentPreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

/** Това, което реално стои в localStorage. */
export type StoredConsent = ConsentPreferences & {
  consentGiven: boolean;
  version: string;
  updatedAt: string;
};

export const CONSENT_STORAGE_KEY = "funpark_cookie_consent_v1";

/**
 * Версия на съгласието. При смяна (например при добавяне на нова категория или
 * нов tracking доставчик) старите записи спират да са валидни и banner-ът
 * се показва отново — така съгласието остава информирано.
 */
export const CONSENT_VERSION = "1.0";

/** По подразбиране: само необходимите бисквитки. */
export const DEFAULT_CONSENT: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export const ACCEPT_ALL_CONSENT: ConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
};

export const REJECT_ALL_CONSENT: ConsentPreferences = DEFAULT_CONSENT;

/** Събитие за отваряне на настройките (виж `openCookieSettings`). */
export const OPEN_COOKIE_SETTINGS_EVENT = "funpark:open-cookie-settings";

/** Събитие при промяна на съгласието — за код извън React. */
export const COOKIE_CONSENT_CHANGE_EVENT = "funpark:cookie-consent-change";

const isBrowser = () => typeof window !== "undefined";

/** Превръща непознат JSON в валиден запис или `null`, ако е негоден. */
const parseConsent = (raw: string): StoredConsent | null => {
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const d = data as Record<string, unknown>;
    // запис от друга версия се игнорира — посетителят се пита отново
    if (d.version !== CONSENT_VERSION) return null;
    if (d.consentGiven !== true) return null;
    return {
      necessary: true,
      analytics: d.analytics === true,
      marketing: d.marketing === true,
      consentGiven: true,
      version: CONSENT_VERSION,
      updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

/**
 * Прочита запазеното съгласие. Връща `null`, ако няма избор, записът е повреден
 * или е от стара версия. Безопасно е и при изключен localStorage (private mode).
 */
export const readConsent = (): StoredConsent | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? parseConsent(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Записва избора и уведомява останалия код чрез
 * `COOKIE_CONSENT_CHANGE_EVENT`. Ако localStorage не е достъпен, изборът важи
 * само за текущата сесия — сайтът продължава да работи.
 */
export const writeConsent = (prefs: ConsentPreferences): StoredConsent => {
  const record: StoredConsent = {
    necessary: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    consentGiven: true,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // частен режим или пълно хранилище — не е причина да блокираме сайта
    }
    window.dispatchEvent(
      new CustomEvent<StoredConsent>(COOKIE_CONSENT_CHANGE_EVENT, { detail: record }),
    );
  }

  return record;
};

/** Изтрива съгласието — banner-ът се показва отново. За тестване и „Оттегли съгласие“. */
export const clearConsent = (): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // няма какво да се чисти
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: null }));
};

/**
 * Отваря панела с настройките отвсякъде — например от бъдещ бутон
 * „Настройки на бисквитките“ във футъра. Работи и без React context,
 * защото минава през window събитие, което provider-ът слуша.
 */
export const openCookieSettings = (): void => {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
};

/**
 * Абонамент за промени в съгласието за код извън React (например бъдещото
 * зареждане на Meta Pixel). Връща функция за отписване.
 */
export const onConsentChange = (
  handler: (consent: StoredConsent | null) => void,
): (() => void) => {
  if (!isBrowser()) return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<StoredConsent | null>).detail);
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, listener);
  return () => window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, listener);
};
