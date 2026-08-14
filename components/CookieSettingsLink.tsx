"use client";

import { openCookieSettings } from "@/lib/cookieConsent";

/**
 * Линк „Настройки на бисквитките“ за футъра.
 *
 * Отделен клиентски компонент, за да остане Footer сървърен. Ползва само
 * `openCookieSettings()` от съществуващата consent система — тя минава през
 * window събитие, затова тук не е нужен нито context, нито нов modal.
 *
 * `className` идва отвън, за да съвпада точно със съседните legal линкове
 * (десктоп и мобилно имат различни размери).
 */
export default function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={`cursor-pointer ${className}`}>
      Настройки на бисквитките
    </button>
  );
}
