import { cache } from "react";

/**
 * Най-новите Reels от Instagram профила на парка — за секцията
 * „Последвайте ни“ на началната страница.
 *
 * Ползва официалния Instagram API (Instagram Login, graph.instagram.com).
 * Изисква дълготраен токен в променливата INSTAGRAM_ACCESS_TOKEN (Vercel →
 * Settings → Environment Variables). Без токен или при грешка връща [] и
 * секцията показва статичните карти — сайтът никога не се чупи заради
 * Instagram.
 *
 * Токенът е дълготраен (~60 дни) и се подновява от Meta приложението
 * (developers.facebook.com → приложението → Instagram → API setup →
 * Generate token) — новата стойност се слага във Vercel и се прави redeploy.
 */

export type InstagramReel = {
  id: string;
  /** Линк към публикацията в Instagram */
  permalink: string;
  /** MP4 от CDN-а на Instagram — адресът е подписан, затова не се кешира дълго */
  videoUrl: string;
  /** Кадър за корица на картата */
  thumbnailUrl: string;
  caption: string;
};

type ApiMedia = {
  id?: string;
  media_type?: string;
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  caption?: string;
};

export const getInstagramReels = cache(
  async (limit = 4): Promise<InstagramReel[]> => {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
    if (!token) return [];
    try {
      const fields =
        "id,media_type,media_product_type,media_url,thumbnail_url,permalink,caption";
      const res = await fetch(
        `https://graph.instagram.com/v23.0/me/media?fields=${fields}&limit=25&access_token=${encodeURIComponent(token)}`,
        // подписаните CDN адреси изтичат — половинчасовият кеш ги държи свежи,
        // без всяко зареждане на началната да удря Instagram
        { next: { revalidate: 1800 } },
      );
      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`,
        );
      }
      const body = (await res.json()) as { data?: ApiMedia[] };
      return (body.data ?? [])
        .filter(
          (
            m,
          ): m is ApiMedia & {
            id: string;
            media_url: string;
            permalink: string;
          } =>
            Boolean(
              m.id &&
                m.media_url &&
                m.permalink &&
                m.media_type === "VIDEO" &&
                // по-старите публикации нямат media_product_type — приемат се
                (!m.media_product_type || m.media_product_type === "REELS"),
            ),
        )
        .slice(0, limit)
        .map((m) => ({
          id: m.id,
          permalink: m.permalink,
          videoUrl: m.media_url,
          thumbnailUrl: m.thumbnail_url ?? "",
          caption: m.caption ?? "",
        }));
    } catch (err) {
      console.warn(
        "[instagram] рийловете не можаха да бъдат прочетени — секцията ползва статичните карти.",
        err instanceof Error ? err.message : err,
      );
      return [];
    }
  },
);
