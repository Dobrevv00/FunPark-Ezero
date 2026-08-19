/**
 * Линкове към социалните мрежи — едно място за целия сайт.
 *
 * Ползват се като резервни стойности; ако в Payload („Настройки на сайта“ →
 * „Социални мрежи“) има зададен адрес за съответната мрежа, той е водещ.
 */
export const FACEBOOK_URL =
  "https://www.facebook.com/p/Fun-Park-Ezero-61577261426366/";
export const INSTAGRAM_URL = "https://www.instagram.com/fun_park_ezero/";
export const TIKTOK_URL = "https://www.tiktok.com/@fun_park_ezero";

/** Адресът за дадена мрежа: от CMS, ако е зададен, иначе от кода. */
export const socialUrl = (
  network: "facebook" | "instagram" | "tiktok",
  links?: { network?: string | null; url?: string | null }[] | null,
): string => {
  const fromCms = links?.find((l) => l.network === network)?.url?.trim();
  if (fromCms) return fromCms;
  return network === "facebook"
    ? FACEBOOK_URL
    : network === "instagram"
      ? INSTAGRAM_URL
      : TIKTOK_URL;
};
