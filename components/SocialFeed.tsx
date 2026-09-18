import YellowButton from "./YellowButton";
import ReelsRow from "./ReelsRow";
import { mediaUrl, t } from "@/lib/cms";
import { socialUrl } from "@/lib/socials";
import type { InstagramReel } from "@/lib/instagram.server";
import type { HomePage } from "@/payload-types";

/**
 * Най-новите рийлове от @fun_park_ezero — статичен снапшот (18.09.2026).
 * Тъмбнейлите са реалните корици от Instagram (og-вариантите, затова носят
 * вграден play бутон в центъра — бутонът на картата го покрива). Обновяване:
 * нови снимки в public/images + нови линкове тук; снимките могат да се сменят
 * и от CMS (Начална → „Последвайте ни“). Ако някой ден се добави
 * INSTAGRAM_ACCESS_TOKEN, живият фийд замества снапшота автоматично.
 */
const reelsStatic = [
  {
    image: "/images/ig-reel-1.jpg",
    href: "https://www.instagram.com/fun_park_ezero/reel/DbqieBVFv_w/",
  },
  {
    image: "/images/ig-reel-2.jpg",
    href: "https://www.instagram.com/fun_park_ezero/reel/DbVnzA9lSAw/",
  },
  {
    image: "/images/ig-reel-3.jpg",
    href: "https://www.instagram.com/fun_park_ezero/reel/DbHHBGgqfBz/",
  },
  {
    image: "/images/ig-reel-4.jpg",
    href: "https://www.instagram.com/fun_park_ezero/reel/Da7ezo6FKuT/",
  },
];

const socials = [
  {
    src: "/icons/facebook-light.svg",
    alt: "Facebook",
    className: "h-[22px] w-[10px]",
    href: "https://www.facebook.com/p/Fun-Park-Ezero-61577261426366/",
  },
  {
    src: "/icons/instagram-light.svg",
    alt: "Instagram",
    className: "h-[22px] w-[22px]",
    href: "https://www.instagram.com/fun_park_ezero/",
  },
];

function StaticReelCard({
  src,
  index,
  mobile,
  handle,
  href,
}: {
  src: string;
  index: number;
  mobile: boolean;
  handle: string;
  /** Публикацията в Instagram — картата се отваря в нов прозорец */
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block shrink-0 overflow-hidden transition-[translate,rotate,scale,box-shadow] duration-300 ease-out hover:-translate-y-[10px] hover:shadow-[0px_20px_40px_0px_rgba(0,0,0,0.35)] active:scale-[0.97] active:duration-100 ${
        /* съседните карти се килват в различна посока — редът изглежда разчупен */
        index % 2 === 0 ? "hover:rotate-[-1.8deg]" : "hover:rotate-[1.8deg]"
      } ${
        mobile ? "h-[485px] w-[272px] rounded-[16.167px]" : "h-[599px] w-[337px] rounded-[20px]"
      }`}
    >
      <img
        src={src}
        alt={`Reel ${index + 1} от Fun Park Ezero в Instagram`}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-[rgba(0,0,0,0)] to-[60%] transition-opacity duration-300 group-hover:opacity-80" />
      {/* центриран и малко по-голям от вградения в og-кориците, за да го покрие */}
      <span
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110 ${
          mobile ? "size-[55px]" : "size-[68px]"
        }`}
      >
        <img src="/icons/play-circle.svg" alt="" className="absolute inset-0 size-full" />
        <img
          src="/icons/play-arrow.svg"
          alt=""
          className={`relative ${mobile ? "ml-[2px] h-[17px] w-[15px]" : "ml-[3px] h-[21px] w-[18.5px]"}`}
        />
      </span>
      <span
        className={`absolute flex items-center gap-[5px] ${
          mobile ? "bottom-[18px] left-[18px]" : "bottom-[22px] left-[22px]"
        }`}
      >
        <img
          src="/icons/instagram-light.svg"
          alt=""
          className={mobile ? "size-[12px]" : "size-[14px]"}
        />
        <span
          className={`font-semibold text-white ${
            mobile ? "text-[10.661px] leading-[15.992px]" : "text-[13.189px] leading-[19.784px]"
          }`}
        >
          {handle}
        </span>
      </span>
    </a>
  );
}

export default function SocialFeed({
  content,
  socialLinks,
  reels,
}: {
  content?: HomePage["socialFeed"];
  socialLinks?: { network?: string | null; url?: string | null }[] | null;
  /** Живи Reels от Instagram API (с токен); празно = статичният снапшот */
  reels?: InstagramReel[];
}) {
  const title = t(content?.title, "Последвайте ни");
  const text = t(
    content?.text,
    "Вижте най-добрите моменти от нашите гости @fun_park_ezero",
  );
  // секцията е Instagram: профилът и бутонът идват от настройките, а не от
  // CMS полетата за TikTok (те се връщат, ако секцията пак стане TikTok)
  const hasReels = (reels?.length ?? 0) > 0;
  const instagram = socialUrl("instagram", socialLinks);
  const handle = `@${instagram.match(/instagram\.com\/([^/?#]+)/)?.[1] ?? "fun_park_ezero"}`;
  const ctaLabel = "Виж в Instagram";
  // снимките на снапшота могат да се сменят от CMS; линковете са в кода
  const cards = reelsStatic.map((r, i) => ({
    href: r.href,
    image: mediaUrl(content?.videos?.[i]?.image, r.image),
  }));
  // линковете идват от настройките на сайта; иконите остават в кода
  const links = socials.map((s) => ({
    ...s,
    href:
      socialLinks?.find((l) => l.network === s.alt.toLowerCase())?.url ?? s.href,
  }));

  return (
    <section className="mt-[120px] bg-forest lg:mt-[180px]">
      {/* Мобилен вариант */}
      <div className="relative h-[836px] lg:hidden">
        <h2 className="absolute left-[16px] top-[62px] font-golos text-[23px] font-extrabold leading-[35.02px] text-white">
          {title}
        </h2>
        <p className="absolute left-[16px] top-[100px] w-[348px] max-w-[calc(100%-32px)] text-[12.7px] leading-[17.817px] text-[#f5f5f7]">
          {text}
        </p>
        <YellowButton
          href={instagram}
          external
          className="absolute left-[16px] right-[16px] top-[179px] sm:right-auto sm:w-[320px]"
        >
          {ctaLabel}
        </YellowButton>
        <div className="absolute left-0 top-[266px] flex w-full gap-[18px] overflow-x-auto px-[16px] pb-[20px]">
          {hasReels ? (
            <ReelsRow reels={reels!} mobile handle={handle} />
          ) : (
            cards.map((card, i) => (
              <StaticReelCard
                key={card.href}
                src={card.image}
                index={i}
                mobile
                handle={handle}
                href={card.href}
              />
            ))
          )}
        </div>
      </div>

      {/* Десктоп вариант */}
      <div className="relative mx-auto hidden h-[946px] max-w-[1512px] lg:block">
        <h2 className="absolute left-[54px] top-[108px] font-golos text-[45px] font-extrabold leading-[59.272px] text-white">
          {title}
        </h2>
        <p className="absolute left-[54px] top-[166px] text-[20.104px] leading-[30.156px] text-[#f5f5f7]">
          {text}
        </p>

        <YellowButton
          href={instagram}
          external
          className="absolute left-[calc(75%+61px)] top-[145px] w-[259px]"
        >
          {ctaLabel}
        </YellowButton>

        <div className="absolute left-[1356px] top-[342px] flex items-center gap-[25px]">
          {links.map((s) => (
            <a
              key={s.alt}
              href={s.href}
              target={s.href === "#" ? undefined : "_blank"}
              rel={s.href === "#" ? undefined : "noopener noreferrer"}
              aria-label={s.alt}
              className="fx-icon hover:opacity-80"
            >
              <img src={s.src} alt="" className={s.className} />
            </a>
          ))}
        </div>

        <div className="absolute left-[54px] top-[222px] flex gap-[17.5px]">
          {hasReels ? (
            <ReelsRow reels={reels!} mobile={false} handle={handle} />
          ) : (
            cards.map((card, i) => (
              <StaticReelCard
                key={card.href}
                src={card.image}
                index={i}
                mobile={false}
                handle={handle}
                href={card.href}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
