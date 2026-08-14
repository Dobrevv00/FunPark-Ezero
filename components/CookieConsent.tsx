"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  ACCEPT_ALL_CONSENT,
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT,
  OPEN_COOKIE_SETTINGS_EVENT,
  REJECT_ALL_CONSENT,
  readConsent,
  writeConsent,
  clearConsent,
  openCookieSettings as emitOpenCookieSettings,
  type ConsentPreferences,
  type StoredConsent,
} from "@/lib/cookieConsent";

/* ------------------------------------------------------------------ context */

type CookieConsentValue = {
  /** Текущият избор. Докато няма съгласие, връща стойностите по подразбиране. */
  consent: ConsentPreferences;
  /** Дали посетителят вече е направил избор. */
  consentGiven: boolean;
  /** `true` след като localStorage е прочетен (на сървъра и при първи render е `false`). */
  ready: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: ConsentPreferences) => void;
  openCookieSettings: () => void;
  /** Изтрива съгласието — banner-ът се показва отново. */
  resetConsent: () => void;
};

const CookieConsentContext = createContext<CookieConsentValue>({
  consent: DEFAULT_CONSENT,
  consentGiven: false,
  ready: false,
  acceptAll: () => {},
  rejectAll: () => {},
  savePreferences: () => {},
  openCookieSettings: () => {},
  resetConsent: () => {},
});

/**
 * Достъп до съгласието от всеки клиентски компонент.
 *
 * По-късно ще се ползва така:
 *   const { consent } = useCookieConsent();
 *   if (consent.marketing) { …зареждане на Meta Pixel… }
 */
export const useCookieConsent = () => useContext(CookieConsentContext);

/* -------------------------------------------------------------------- стил */

const btnBase =
  "flex w-full items-center justify-center rounded-[10px] px-[20px] py-[10px] font-golos text-[14.5px] font-semibold leading-[20px] transition-colors cursor-pointer sm:w-auto";
const btnPrimary = `${btnBase} bg-sun text-black/80 hover:bg-[#e0b32f]`;
const btnNeutral = `${btnBase} bg-[rgba(161,161,170,0.18)] text-ink hover:bg-[rgba(161,161,170,0.3)]`;
const btnGhost = `${btnBase} border border-forest/25 text-forest hover:bg-forest/5`;

/* ------------------------------------------------------------------ toggle */

function Toggle({
  checked,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange?: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-[24px] w-[44px] shrink-0 rounded-full transition-colors ${
        checked ? "bg-forest" : "bg-[#d4d4d8]"
      } ${disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-[3px] size-[18px] rounded-full bg-white transition-[left] duration-200 ${
          checked ? "left-[23px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------- една секция */

function CategoryRow({
  title,
  description,
  checked,
  disabled = false,
  hint,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  hint?: string;
  onChange?: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-[14px] rounded-[9px] bg-[rgba(161,161,170,0.12)] px-[14px] py-[12px]">
      <div className="min-w-0">
        <p className="font-golos text-[14.5px] font-semibold leading-[19px] text-ink">
          {title}
        </p>
        <p className="mt-[4px] font-golos text-[13px] leading-[1.5] text-[#545454]">
          {description}
        </p>
        {hint && (
          <p className="mt-[6px] font-golos text-[12.5px] font-medium leading-[1.4] text-forest">
            {hint}
          </p>
        )}
      </div>
      <Toggle checked={checked} disabled={disabled} label={title} onChange={onChange} />
    </div>
  );
}

/* ------------------------------------------------------------------- banner */

function CookieBanner({
  onAcceptAll,
  onRejectAll,
  onOpenSettings,
}: {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onOpenSettings: () => void;
}) {
  return (
    // fixed, но без затъмняване — сайтът остава напълно използваем без избор
    <div
      role="region"
      aria-label="Съгласие за бисквитки"
      className="fixed inset-x-0 bottom-0 z-[90] p-[12px] sm:p-[16px]"
    >
      <div className="mx-auto flex max-w-[1100px] flex-col gap-[16px] rounded-[11px] bg-offwhite px-[18px] py-[18px] shadow-[0_10px_40px_rgba(19,54,47,0.22)] sm:px-[24px] lg:flex-row lg:items-center lg:gap-[28px]">
        <div className="min-w-0 lg:flex-1">
          <p className="font-golos text-[15.5px] font-bold leading-[21px] text-ink">
            Този сайт използва бисквитки
          </p>
          <p className="mt-[6px] font-golos text-[13.5px] leading-[1.55] text-[#545454]">
            Необходимите бисквитки правят сайта работещ. Аналитичните и
            маркетинговите се зареждат само с ваше съгласие. Можете да промените
            избора си по всяко време.{" "}
            <a
              href="/cookie-policy"
              className="text-forest underline decoration-forest/35 underline-offset-[3px] transition-colors hover:decoration-forest"
            >
              Политика за бисквитките
            </a>
          </p>
        </div>

        <div className="flex w-full flex-col gap-[10px] sm:flex-row sm:flex-wrap sm:justify-end lg:w-auto lg:flex-nowrap">
          <button type="button" onClick={onOpenSettings} className={btnGhost}>
            Настройки
          </button>
          <button type="button" onClick={onRejectAll} className={btnNeutral}>
            Отказвам всички
          </button>
          <button type="button" onClick={onAcceptAll} className={btnPrimary}>
            Приемам всички
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- modal */

function CookieSettingsModal({
  initial,
  onSave,
  onClose,
}: {
  initial: ConsentPreferences;
  onSave: (prefs: ConsentPreferences) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<ConsentPreferences>(initial);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/30 p-[16px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Настройки на бисквитките"
        className="flex max-h-[calc(100vh-32px)] w-[540px] max-w-full flex-col overflow-y-auto rounded-[11px] bg-offwhite px-[20px] py-[24px] sm:px-[30px] sm:py-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-[12px]">
          <p className="font-golos text-[19px] font-bold leading-[25px] text-ink">
            Настройки на бисквитките
          </p>
          <button
            type="button"
            aria-label="Затвори"
            onClick={onClose}
            className="cursor-pointer font-golos text-[18px] leading-none text-[#a1a1aa] transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        <p className="mt-[8px] font-golos text-[13.5px] leading-[1.55] text-[#545454]">
          Изберете кои бисквитки да разрешите. Необходимите не могат да бъдат
          изключени, защото без тях сайтът не работи правилно.
        </p>

        <div className="mt-[18px] flex flex-col gap-[10px]">
          <CategoryRow
            title="Необходими бисквитки"
            description="Осигуряват основните функции на сайта — навигация, формите за запитване и запазване на вашия избор за бисквитки."
            hint="Винаги активни"
            checked
            disabled
          />
          <CategoryRow
            title="Аналитични бисквитки"
            description="Помагат ни да разберем как се използва сайтът, за да го подобряваме. Не се зареждат без ваше съгласие."
            checked={draft.analytics}
            onChange={(next) => setDraft((d) => ({ ...d, analytics: next }))}
          />
          <CategoryRow
            title="Маркетингови бисквитки"
            description="Позволяват показване на подходящи за вас реклами и измерване на резултата от тях."
            checked={draft.marketing}
            onChange={(next) => setDraft((d) => ({ ...d, marketing: next }))}
          />
        </div>

        <button
          type="button"
          onClick={() => onSave(draft)}
          className={`${btnPrimary} mt-[20px] sm:w-full`}
        >
          Запази настройките
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- provider */

/**
 * Обгръща публичния сайт. Стои само в `app/(frontend)/layout.tsx`, затова
 * Payload админът (`app/(payload)/layout.tsx`) никога не вижда banner-а.
 */
export default function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredConsent | null>(null);
  // localStorage се чете само в браузъра — иначе SSR и клиентът се разминават
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setStored(readConsent());
    setReady(true);
  }, []);

  // отваряне от външен код: openCookieSettings() (например бъдещ бутон във футъра)
  useEffect(() => {
    const onOpen = () => setSettingsOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
  }, []);

  // избор, направен в друг таб на сайта
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY) setStored(readConsent());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const savePreferences = useCallback((prefs: ConsentPreferences) => {
    setStored(writeConsent(prefs));
    setSettingsOpen(false);
  }, []);

  const acceptAll = useCallback(
    () => savePreferences(ACCEPT_ALL_CONSENT),
    [savePreferences],
  );
  const rejectAll = useCallback(
    () => savePreferences(REJECT_ALL_CONSENT),
    [savePreferences],
  );

  const resetConsent = useCallback(() => {
    clearConsent();
    setStored(null);
  }, []);

  const consent: ConsentPreferences = useMemo(
    () =>
      stored
        ? { necessary: true, analytics: stored.analytics, marketing: stored.marketing }
        : DEFAULT_CONSENT,
    [stored],
  );

  const value = useMemo<CookieConsentValue>(
    () => ({
      consent,
      consentGiven: stored?.consentGiven === true,
      ready,
      acceptAll,
      rejectAll,
      savePreferences,
      openCookieSettings: emitOpenCookieSettings,
      resetConsent,
    }),
    [consent, stored, ready, acceptAll, rejectAll, savePreferences, resetConsent],
  );

  // административният панел не е публична страница — там banner не се показва
  const isAdminSurface = pathname?.startsWith("/Funparkadminpanel") ?? false;
  const showBanner = ready && !value.consentGiven && !settingsOpen && !isAdminSurface;

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {showBanner && (
        <CookieBanner
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}
      {settingsOpen && (
        <CookieSettingsModal
          initial={consent}
          onSave={savePreferences}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </CookieConsentContext.Provider>
  );
}
