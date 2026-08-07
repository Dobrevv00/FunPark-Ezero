import YellowButton from "./YellowButton";
import { mediaUrl, t } from "@/lib/cms";
import type { HomePage } from "@/payload-types";

const videos = [
  "/images/tiktok-1.jpg",
  "/images/tiktok-2.jpg",
  "/images/tiktok-3.jpg",
  "/images/tiktok-4.jpg",
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

function TikTokCard({
  src,
  index,
  mobile,
  handle,
}: {
  src: string;
  index: number;
  mobile: boolean;
  handle: string;
}) {
  return (
    <a
      href="#"
      className={`group relative block shrink-0 overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-[10px] hover:shadow-[0px_20px_40px_0px_rgba(0,0,0,0.35)] active:scale-[0.97] active:duration-100 ${
        mobile ? "h-[485px] w-[272px] rounded-[16.167px]" : "h-[599px] w-[337px] rounded-[20px]"
      }`}
    >
      <img
        src={src}
        alt={`TikTok видео ${index + 1} от Fun Park Ezero`}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-[rgba(0,0,0,0)] to-[60%] transition-opacity duration-300 group-hover:opacity-80" />
      <span
        className={`absolute left-1/2 flex -translate-x-1/2 items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110 ${
          mobile ? "top-[217px] size-[49.3px]" : "top-[269px] size-[61px]"
        }`}
      >
        <img src="/icons/play-circle.svg" alt="" className="absolute inset-0 size-full" />
        <img
          src="/icons/play-arrow.svg"
          alt=""
          className={`relative ${mobile ? "ml-[2px] h-[16px] w-[14px]" : "ml-[3px] h-[20px] w-[17.5px]"}`}
        />
      </span>
      <span
        className={`absolute flex items-center gap-[5px] ${
          mobile ? "bottom-[18px] left-[18px]" : "bottom-[22px] left-[22px]"
        }`}
      >
        <img
          src="/icons/tiktok.svg"
          alt=""
          className={mobile ? "h-[12px] w-[11px]" : "h-[14px] w-[13px]"}
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
}: {
  content?: HomePage["socialFeed"];
  socialLinks?: { network?: string | null; url?: string | null }[] | null;
}) {
  const title = t(content?.title, "Последвайте ни");
  const text = t(
    content?.text,
    "Вижте най-добрите моменти от нашите гости @funparkezero",
  );
  const ctaLabel = t(content?.ctaLabel, "Виж в TikTok");
  const handle = t(content?.handle, "@funparkzero");
  const clips = videos.map((src, i) => mediaUrl(content?.videos?.[i]?.image, src));
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
        <YellowButton className="absolute left-[16px] right-[16px] top-[179px]">
          {ctaLabel}
        </YellowButton>
        <div className="absolute left-0 top-[266px] flex w-full gap-[18px] overflow-x-auto px-[16px] pb-[20px]">
          {clips.map((src, i) => (
            <TikTokCard key={src} src={src} index={i} mobile handle={handle} />
          ))}
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

        <YellowButton className="absolute left-[calc(75%+61px)] top-[145px] w-[259px]">
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
              className="transition-opacity hover:opacity-60"
            >
              <img src={s.src} alt="" className={s.className} />
            </a>
          ))}
        </div>

        <div className="absolute left-[54px] top-[222px] flex gap-[17.5px]">
          {clips.map((src, i) => (
            <TikTokCard key={src} src={src} index={i} mobile={false} handle={handle} />
          ))}
        </div>
      </div>
    </section>
  );
}
