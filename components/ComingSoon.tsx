import { cookies } from "next/headers";
import ComingSoonUnlock from "@/components/ComingSoonUnlock";
import { t } from "@/lib/cms";
import { PREVIEW_COOKIE } from "@/lib/preview";
import type { SiteSetting } from "@/payload-types";

/**
 * Екран „Очаквайте скоро“. Показва се вместо съдържанието на публичните
 * страници, докато COMING_SOON_MODE по-долу е true. Правните страници и
 * админ панелът не минават през него.
 *
 * Нарочно ТВЪРД ключ в кода, а не CMS поле: няма нови колони в базата,
 * така че деплоят не зависи от достъп до Vercel/Neon и не пипа схемата.
 *
 * Никакви бисквитки, форми или заявки — само марка, текст и контакти.
 * Контактите и социалните мрежи идват от Payload (съществуващи полета);
 * ако базата е недостъпна, редът с контакти просто се скрива.
 */

/**
 * Ключът на режима. Изключване: смени на false, commit и push към main —
 * Vercel деплойва сам (~минута) и сайтът се показва нормално.
 */
export const COMING_SOON_MODE = false;

/**
 * Дали екранът да се покаже. Едно място за всички страници.
 *
 * Посетител, който е въвел правилната парола, носи httpOnly бисквитка и вижда
 * сайта нормално. Бисквитката се чете само докато режимът е включен — щом
 * COMING_SOON_MODE стане false, проверката спира преди `cookies()` и страниците
 * се връщат към статично генериране.
 */
export const comingSoonEnabled = async (): Promise<boolean> => {
  if (!COMING_SOON_MODE) return false;
  const jar = await cookies();
  return jar.get(PREVIEW_COOKIE)?.value !== "1";
};

/* Иконите са същите, които тъмният футър ползва върху зелено. */
const socialsFallback = [
  {
    network: "facebook",
    src: "/icons/facebook-light.svg",
    href: "https://www.facebook.com/p/Fun-Park-Ezero-61577261426366/",
    label: "Facebook",
  },
  {
    network: "instagram",
    src: "/icons/instagram-light.svg",
    href: "https://www.instagram.com/fun_park_ezero/",
    label: "Instagram",
  },
];

export default function ComingSoon({ settings }: { settings?: SiteSetting | null }) {
  const title = "Очаквайте скоро!";
  const message =
    "Подготвяме нещо страхотно — забавление, природа и незабравими моменти " +
    "за цялото семейство, всичко на едно място. Новият сайт на Fun Park Ezero " +
    "отваря врати съвсем скоро!";
  const copyright = t(
    settings?.legal?.copyright,
    `© ${new Date().getFullYear()} Fun Park Ezero. Всички права запазени.`,
  );

  const phone = settings?.contact?.phone?.trim() || null;
  const email = settings?.contact?.email?.trim() || null;

  const socials = socialsFallback.map((s) => ({
    ...s,
    href:
      settings?.socials?.find((l) => l.network === s.network)?.url?.trim() || s.href,
  }));

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-forest px-[16px] py-[48px] text-center">
      {/* Меки светлинни петна в цветовете на марката */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[90px] lg:size-[980px]"
        style={{
          background:
            "radial-gradient(circle, rgba(23,87,59,0.9) 0%, rgba(23,87,59,0.25) 55%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="cs-float pointer-events-none absolute -left-[90px] top-[12%] size-[240px] rounded-full bg-leaf opacity-[0.14] blur-[70px]"
      />
      <div
        aria-hidden
        className="cs-float-slow pointer-events-none absolute -right-[70px] bottom-[14%] size-[220px] rounded-full bg-sun opacity-[0.10] blur-[80px]"
      />

      {/* Декоративни пръстени като тези във футъра */}
      <img
        src="/icons/footer-ring-outer.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-[130px] -top-[130px] size-[320px] opacity-25 lg:size-[420px]"
      />
      <img
        src="/icons/footer-ring-outer.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-[150px] -left-[150px] size-[360px] opacity-20 lg:size-[460px]"
      />

      <div className="relative flex w-full max-w-[640px] flex-col items-center">
        {/* Лого с пръстени — същата композиция като голямото лого във футъра */}
        <div className="relative size-[150px] lg:size-[200px]">
          <img src="/icons/footer-ring-outer.svg" alt="" className="absolute inset-0 size-full" />
          <img
            src="/icons/footer-ring-inner.svg"
            alt=""
            className="absolute left-1/2 top-1/2 size-[86%] -translate-x-1/2 -translate-y-1/2"
          />
          <div className="absolute left-1/2 top-[calc(50%+2px)] h-[38%] w-[56%] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
            <span className="absolute inset-[2.67%_0_0_0]">
              <img
                src="/icons/logo-mark-footer.svg"
                alt="Fun Park Ezero"
                className="size-full"
              />
            </span>
            <span className="absolute inset-[0_37%_78.73%_34.4%]">
              <img src="/icons/logo-leaf-footer.svg" alt="" className="size-full" />
            </span>
          </div>
        </div>

        <p className="mt-[36px] font-golos text-[12px] font-bold uppercase tracking-[0.22em] text-sun lg:text-[13px]">
          Сайтът е в подготовка
        </p>

        <h1 className="mt-[14px] font-golos text-[38px] font-black leading-[1.04] text-offwhite lg:text-[55px]">
          {title}
        </h1>

        <p className="mt-[18px] max-w-[560px] font-golos text-[14px] font-semibold leading-[1.5] text-[rgba(255,254,254,0.92)] lg:text-[17px]">
          {message}
        </p>

        {(phone || email) && (
          <div className="mt-[34px] flex flex-col items-center gap-[12px] sm:flex-row sm:gap-[16px]">
            {phone && (
              <a
                href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-[10px] rounded-full border border-white/15 bg-white/5 px-[22px] py-[12px] font-mulish text-[14px] font-semibold text-offwhite transition-colors duration-300 hover:border-sun/60 hover:bg-white/10"
              >
                <img src="/icons/call.svg" alt="" width={13} height={13} />
                {phone}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-[10px] rounded-full border border-white/15 bg-white/5 px-[22px] py-[12px] font-mulish text-[14px] font-semibold text-offwhite transition-colors duration-300 hover:border-sun/60 hover:bg-white/10"
              >
                <img src="/icons/mail.svg" alt="" width={15} height={12} />
                {email}
              </a>
            )}
          </div>
        )}

        {/* Вход с парола за екипа, докато сайтът е в подготовка */}
        <ComingSoonUnlock />

        <div className="mt-[30px] flex items-center gap-[14px]">
          {socials.map((s) => (
            <a
              key={s.network}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex size-[44px] items-center justify-center rounded-full border border-white/15 bg-white/5 transition-all duration-300 hover:scale-110 hover:border-sun/60 hover:bg-white/10"
            >
              <img src={s.src} alt="" className="size-[18px]" />
            </a>
          ))}
        </div>
      </div>

      <p className="absolute bottom-[20px] left-0 right-0 font-mulish text-[12px] text-white/45">
        {copyright}
      </p>

      {/* Лека анимация на светлинните петна; спира при reduced motion */}
      <style>{`
        @keyframes cs-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-22px); }
        }
        .cs-float { animation: cs-float 9s ease-in-out infinite; }
        .cs-float-slow { animation: cs-float 13s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cs-float, .cs-float-slow { animation: none; }
        }
      `}</style>
    </main>
  );
}
