import type { ReactNode } from "react";
import Badge from "@/components/Badge";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getFooter, getHeader, getSiteSettings } from "@/lib/cms.server";

/**
 * Обща рамка за правните страници (Политика за поверителност, Политика за
 * бисквитките). Ползва същия Header/Footer, същите цветове и типография като
 * останалите страници — само с по-тясна колона за четимост на дълъг текст.
 */

/** Заглавие на секция + котва за съдържанието. */
export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-[36px] scroll-mt-[100px] lg:mt-[48px]">
      <h2 className="font-golos text-[19px] font-bold leading-[1.3] text-ink lg:text-[22px]">
        {title}
      </h2>
      <div className="mt-[12px] flex flex-col gap-[12px]">{children}</div>
    </section>
  );
}

/** Подзаглавие в рамките на секция. */
export function SubTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-[8px] font-golos text-[15.5px] font-semibold leading-[1.4] text-ink lg:text-[16.5px]">
      {children}
    </h3>
  );
}

/** Абзац с размерите за дълъг текст. */
export function P({ children }: { children: ReactNode }) {
  return (
    <p className="font-golos text-[14.5px] leading-[1.7] text-[#3f3f46] lg:text-[15.5px] lg:leading-[1.75]">
      {children}
    </p>
  );
}

/** Списък с точки. */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-[8px]">
      {items.map((item, i) => (
        <li
          key={i}
          className="relative pl-[18px] font-golos text-[14.5px] leading-[1.7] text-[#3f3f46] lg:text-[15.5px] lg:leading-[1.75]"
        >
          <span className="absolute left-[2px] top-[9px] size-[6px] rounded-full bg-leaf" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Имейл или телефон за връзка. */
export function Contact({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="fx-ink font-semibold text-forest underline decoration-forest/35 underline-offset-[3px] hover:decoration-forest"
    >
      {children}
    </a>
  );
}

/** Каре за уточнение или нещо, което подлежи на проверка. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[9px] border-l-[3px] border-leaf bg-[rgba(106,142,78,0.1)] px-[14px] py-[12px]">
      <p className="font-golos text-[13.5px] leading-[1.65] text-[#3f3f46] lg:text-[14.5px]">
        {children}
      </p>
    </div>
  );
}

type LegalShellProps = {
  badge: string;
  title: string;
  titleAccent: string;
  intro: string;
  /** Дата на последна актуализация, изписана на български. */
  updated: string;
  toc: { id: string; label: string }[];
  children: ReactNode;
};

export default async function LegalShell({
  badge,
  title,
  titleAccent,
  intro,
  updated,
  toc,
  children,
}: LegalShellProps) {
  const [header, footer, settings] = await Promise.all([
    getHeader(),
    getFooter(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Header
        nav={header?.navItems}
        searchPlaceholder={header?.searchPlaceholder}
        socialLinks={settings?.socials}
      />

      <main className="overflow-x-clip">
        {/* Заглавна част — същият шаблон като на другите вътрешни страници */}
        <section className="relative mx-[16px] mt-[14px] rounded-[10px] bg-cream px-[16px] pb-[40px] pt-[48px] lg:mx-[32px] lg:px-[24px] lg:pb-[56px] lg:pt-[72px]">
          <div className="flex flex-col items-center text-center">
            <Badge>{badge}</Badge>
            <h1 className="mt-[28px] font-golos text-[30px] font-black leading-[1.1] text-ink lg:mt-[40px] lg:text-[50px]">
              {title}{" "}
              <span className="bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-transparent">
                {titleAccent}
              </span>
            </h1>
            <p className="mx-auto mt-[18px] max-w-[620px] font-golos text-[14px] leading-[1.6] text-[#545454] lg:mt-[24px] lg:text-[16px] lg:text-[#3f3f46]">
              {intro}
            </p>
            <p className="mt-[16px] font-golos text-[13px] font-medium leading-[1.5] text-[#71717a]">
              Последна актуализация: {updated}
            </p>
          </div>
        </section>

        {/* Текст — тясна колона за четимост */}
        <div className="mx-auto max-w-[820px] px-[16px] pb-[64px] pt-[8px] lg:px-[24px] lg:pb-[88px]">
          {/* Съдържание */}
          <nav
            aria-label="Съдържание"
            className="mt-[28px] rounded-[10px] bg-cream px-[18px] py-[18px] lg:mt-[40px] lg:px-[24px] lg:py-[22px]"
          >
            <p className="font-golos text-[14px] font-bold uppercase tracking-[0.04em] text-forest">
              Съдържание
            </p>
            <ol className="mt-[12px] flex flex-col gap-[8px]">
              {toc.map((item, i) => (
                <li key={item.id} className="flex gap-[8px]">
                  <span className="font-golos text-[13.5px] font-semibold leading-[1.55] text-leaf">
                    {i + 1}.
                  </span>
                  <a
                    href={`#${item.id}`}
                    className="fx-ink font-golos text-[13.5px] leading-[1.55] text-[#3f3f46] underline decoration-[#3f3f46]/25 underline-offset-[3px] hover:text-forest hover:decoration-forest lg:text-[14.5px]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {children}
        </div>
      </main>

      <Footer content={footer} socialLinks={settings?.socials} />
    </>
  );
}
