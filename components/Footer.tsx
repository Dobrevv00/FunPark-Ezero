import Link from "next/link";
import CookieSettingsLink from "@/components/CookieSettingsLink";
import { t } from "@/lib/cms";
import type { Footer as FooterGlobalType } from "@/payload-types";

/** CMS колони + позициите/стила от кода (десктоп колоните имат фиксиран left). */
type CodeColumn = { title: string; left?: number; items: { label: string; href: string }[] };
type CmsColumn = { title?: string | null; links?: { label?: string | null; href?: string | null }[] | null };

type LinkItem = { label: string; href: string };

/**
 * CMS-ът е водещ за текстовете. Два случая, в които кодът допълва:
 *  · „#“ в CMS означава „адресът още не е зададен“ — тогава важи адресът от кода
 *    (така правните страници работят без редакция в CMS);
 *  · линкове, добавени в кода след тези, които CMS познава, също се показват.
 */
const mergeLinks = (
  cms: NonNullable<CmsColumn["links"]>,
  code: LinkItem[],
): LinkItem[] => {
  const rows = Array.from({ length: Math.max(cms.length, code.length) }, (_, j) => {
    const l = cms[j];
    const fallback = code[j];
    if (!l) return fallback;
    const href = t(l.href, fallback?.href ?? "#");
    return {
      label: t(l.label, fallback?.label ?? ""),
      href: href === "#" ? (fallback?.href ?? "#") : href,
    };
  });
  return rows.filter((row): row is LinkItem => Boolean(row?.label));
};

const mergeColumns = (
  cms: CmsColumn[] | null | undefined,
  code: CodeColumn[],
): CodeColumn[] => {
  if (!cms || cms.length === 0) return code;
  return code.map((col, i) => {
    const c = cms[i];
    if (!c) return col;
    const links = c.links && c.links.length > 0 ? c.links : null;
    return {
      ...col,
      title: t(c.title, col.title),
      items: links ? mergeLinks(links, col.items) : col.items,
    };
  });
};

/** Иконите остават в кода и се съчетават с текста по ред. */
type CodeContact = { icon: string; w: number; h: number; text: string };

const mergeContacts = (
  cms: { text?: string | null }[] | null | undefined,
  code: CodeContact[],
): CodeContact[] => {
  if (!cms || cms.length === 0) return code;
  return code.map((c, i) => ({ ...c, text: t(cms[i]?.text, c.text) }));
};

const menuItems = [
  { label: "Начало", href: "/" },
  { label: "Събития", href: "/events" },
  { label: "Контакти", href: "/contacts" },
];

const infoItems = [
  { label: "Резервации", href: "#" },
  { label: "Политика за поверителност", href: "/privacy-policy" },
  { label: "Общи условия", href: "#" },
  { label: "Политика за бисквитките", href: "/cookie-policy" },
];

const columns = [
  { title: "Меню", left: 522, items: menuItems },
  { title: "Информация", left: 771, items: infoItems },
];

const mobileColumns = [
  { title: "Меню", items: menuItems },
  {
    title: "Информация",
    // първите две са и в CMS; правните страници идват от кода, за да са
    // достъпни и на телефон
    items: [infoItems[0], infoItems[2], infoItems[1], infoItems[3]],
  },
];

// Потвърдени публични контакти на обекта. Това са резервните стойности в кода —
// ако в CMS („Footer“ → contactLines) има текст, той е водещ.
const contacts = [
  { icon: "/icons/location.svg", w: 12, h: 15, text: "ул. „Димитър Димов“, 8000 Бургас" },
  { icon: "/icons/call.svg", w: 12, h: 12, text: "+359 88 123 4567" },
  { icon: "/icons/mail.svg", w: 14, h: 11, text: "inquiries@kavatsi.com" },
];

/** Социални мрежи — светли икони за тъмния фон на футъра */
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

function Socials({ className = "", items = socials }: { className?: string; items?: typeof socials }) {
  return (
    <div className={`flex items-center gap-[24px] ${className}`}>
      {items.map((s) => (
        <a
          key={s.alt}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.alt}
          className="transition-opacity hover:opacity-60"
        >
          <img src={s.src} alt="" className={s.className} />
        </a>
      ))}
    </div>
  );
}

const mobileContacts = [
  { icon: "/icons/location.svg", w: 12, h: 15, text: "ул. „Димитър Димов“, Бургас" },
  { icon: "/icons/call.svg", w: 12, h: 12, text: "+359 88 123 4567" },
  { icon: "/icons/mail.svg", w: 14, h: 11, text: "inquiries@kavatsi.com" },
];

function FooterLogo({
  ring,
  inner,
  logoW,
  logoH,
}: {
  ring: number;
  inner: number;
  logoW: number;
  logoH: number;
}) {
  return (
    // логото води към началото на главната страница
    <Link
      href="/"
      aria-label="Към началото на страницата"
      title="Към началото на страницата"
      className="group relative block transition-transform duration-300 ease-out hover:scale-[1.07] active:scale-95 active:duration-100"
      style={{ width: ring, height: ring }}
    >
      <img
        src="/icons/footer-ring-outer.svg"
        alt=""
        className="absolute inset-0 size-full transition-opacity duration-300 group-hover:opacity-70"
      />
      <img
        src="/icons/footer-ring-inner.svg"
        alt=""
        className="absolute"
        style={{ width: inner, height: inner, left: (ring - inner) / 2, top: (ring - inner) / 2 }}
      />
      <div
        className="absolute overflow-hidden"
        style={{
          width: logoW,
          height: logoH,
          left: (ring - logoW) / 2,
          top: (ring - logoH) / 2 + 3,
        }}
      >
        <span className="absolute inset-[2.67%_0_0_0]">
          <img src="/icons/logo-mark-footer.svg" alt="Fun Park Ezero" className="size-full" />
        </span>
        <span className="absolute inset-[0_37%_78.73%_34.4%]">
          <img src="/icons/logo-leaf-footer.svg" alt="" className="size-full" />
        </span>
      </div>
    </Link>
  );
}

type FooterProps = {
  content?: FooterGlobalType | null;
  socialLinks?: { network?: string | null; url?: string | null }[] | null;
};

export default function Footer({ content, socialLinks }: FooterProps = {}) {
  const tagline = t(
    content?.tagline,
    "Незабравими преживявания сред природата за цялото семейство.",
  );
  // десктоп и мобилно днес показват различни колони и адреси — пазят се отделно
  const deskColumns = mergeColumns(content?.desktop?.columns, columns);
  const mobColumns = mergeColumns(content?.mobile?.columns, mobileColumns);
  const deskContacts = mergeContacts(content?.desktop?.contactLines, contacts);
  const mobContacts = mergeContacts(content?.mobile?.contactLines, mobileContacts);
  const links = socials.map((s) => ({
    ...s,
    href:
      socialLinks?.find((l) => l.network === s.alt.toLowerCase())?.url ?? s.href,
  }));

  return (
    <footer className="bg-forest">
      {/* Мобилен вариант */}
      <div className="flex min-h-[550px] flex-col items-center pb-[44px] pt-[30px] lg:hidden">
        <FooterLogo ring={70} inner={64} logoW={49.6} logoH={33.7} />
        <p className="mt-[12px] w-[219px] text-center font-golos text-[12.7px] leading-[13px] text-white/45">
          {tagline}
        </p>

        {mobColumns.map((col, i) => (
          <div key={col.title} className="mt-[26px] flex flex-col items-center">
            <p className="text-[15px] font-medium leading-[19.5px] text-sun">
              {col.title}
            </p>
            <ul className="mt-[8px] flex flex-col items-center gap-[10px]">
              {col.items.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="whitespace-nowrap text-[12.7px] leading-[15.278px] text-white/50 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              {/* към legal линковете в колона „Информация“ */}
              {i === 1 && (
                <li className="mt-[6px]">
                  <CookieSettingsLink className="whitespace-nowrap text-[12.7px] leading-[15.278px] text-white/50 transition-colors hover:text-white" />
                </li>
              )}
            </ul>
          </div>
        ))}

        <div className="mt-[26px] flex flex-col items-center">
          <p className="text-[15px] font-medium leading-[19.5px] text-sun">
            Контакти
          </p>
          <ul className="mt-[8px] flex flex-col gap-[10px]">
            {mobContacts.map((c) => (
              <li key={c.text} className="flex items-center justify-center gap-[9px]">
                <span className="flex w-[15px] shrink-0 justify-center">
                  <img src={c.icon} alt="" width={c.w} height={c.h} />
                </span>
                <span className="whitespace-nowrap text-[12.7px] leading-[15.278px] text-white/50">
                  {c.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Социални мрежи */}
        <Socials className="mt-[26px] justify-center" items={links} />
      </div>

      {/* Десктоп вариант */}
      {/* височината е увеличена от 316px, за да остане въздух под последния
          линк в колона „Информация“ („Настройки на бисквитките“) */}
      <div className="relative mx-auto hidden h-[364px] max-w-[1512px] lg:block">
        <div className="absolute left-[155px] top-[54px]">
          <FooterLogo ring={114} inner={104} logoW={81} logoH={55} />
        </div>
        <p className="absolute left-[103px] top-[188px] w-[219px] text-center font-golos text-[13px] leading-[21.125px] text-white/55">
          {tagline}
        </p>

        {/* Социални мрежи — под текста, центрирани спрямо логото */}
        <Socials className="absolute left-[103px] top-[258px] w-[219px] justify-center" items={links} />

        {/* Колони с линкове */}
        {deskColumns.map((col, i) => (
          <div key={col.title} className="absolute top-[119px]" style={{ left: col.left }}>
            <p className="text-[15px] font-medium leading-[19.5px] text-sun">
              {col.title}
            </p>
            <ul className="mt-[12px] flex flex-col gap-[12px]">
              {col.items.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="whitespace-nowrap text-[13px] leading-[19.5px] text-white/55 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              {/* към legal линковете в колона „Информация“ */}
              {i === 1 && (
                <li className="mt-[6px]">
                  <CookieSettingsLink className="whitespace-nowrap text-[13px] leading-[19.5px] text-white/55 transition-colors hover:text-white" />
                </li>
              )}
            </ul>
          </div>
        ))}

        {/* Контакти */}
        <div className="absolute left-[1136px] top-[119px]">
          <p className="text-[15px] font-medium leading-[19.5px] text-sun">
            Контакти
          </p>
          <ul className="mt-[12px] flex flex-col gap-[12px]">
            {deskContacts.map((c) => (
              <li key={c.text} className="flex items-center gap-[9px]">
                <span className="flex w-[15px] shrink-0 justify-center">
                  <img src={c.icon} alt="" width={c.w} height={c.h} />
                </span>
                <span className="whitespace-nowrap text-[13px] leading-[19.5px] text-white/55">
                  {c.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
