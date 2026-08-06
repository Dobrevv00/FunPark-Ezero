"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBookingModal } from "./BookingModal";
import { Logo } from "./Logo";

export { Logo };

const navLinks = [
  { label: "Начало", href: "/" },
  { label: "Събития", href: "/events" },
  { label: "Контакти", href: "/contacts" },
];

const socials = [
  {
    src: "/icons/facebook.svg",
    alt: "Facebook",
    className: "h-[20px] w-[10px]",
    href: "https://www.facebook.com/p/Fun-Park-Ezero-61577261426366/",
  },
  {
    src: "/icons/instagram.svg",
    alt: "Instagram",
    className: "h-[22px] w-[22px]",
    href: "https://www.instagram.com/fun_park_ezero/",
  },
];

type SearchEntry = {
  title: string;
  desc: string;
  href?: string;
  booking?: boolean;
  keywords: string;
};

const searchIndex: SearchEntry[] = [
  { title: "Начало", desc: "Главната страница на парка", href: "/", keywords: "home парк начална" },
  { title: "Резервация", desc: "Резервирай дата, час и билети", booking: true, keywords: "резервирай резервирай сега календар час билети запази" },
  { title: "Събития", desc: "Предстоящи събития в парка", href: "/events", keywords: "календар програма събитие" },
  { title: "Лятно кино под звездите", desc: "Събитие · 15 юли", href: "/events", keywords: "кино филм вечер събитие" },
  { title: "Приключенски уикенд", desc: "Събитие · 19 юли", href: "/events", keywords: "приключение игри уикенд събитие" },
  { title: "DJ вечер край езерото", desc: "Събитие · 25 юли", href: "/events", keywords: "музика парти коктейли събитие" },
  { title: "Контакти", desc: "Свържете се с нас", href: "/contacts", keywords: "телефон имейл адрес въпрос запитване форма" },
  { title: "Ресторант", desc: "Вкусове от природата", href: "/", keywords: "храна меню езеро" },
  { title: "Въжено съоръжение", desc: "Маршрути с различни нива на трудност", href: "/", keywords: "атракция катерене въжен парк" },
];

function searchFor(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return searchIndex.filter((e) =>
    `${e.title} ${e.desc} ${e.keywords}`.toLowerCase().includes(q)
  );
}

function SearchResults({
  results,
  query,
  onPick,
}: {
  results: SearchEntry[];
  query: string;
  onPick: (entry: SearchEntry) => void;
}) {
  return (
    <div
      className="flex flex-col gap-[2px] rounded-[10px] bg-white p-[6px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.15)]"
      onMouseDown={(e) => e.preventDefault()}
    >
      {results.length === 0 ? (
        <p className="px-[12px] py-[10px] text-[13px] text-[#545454]">
          Няма резултати за „{query.trim()}&ldquo;
        </p>
      ) : (
        results.map((r) => (
          <button
            key={r.title}
            type="button"
            className="cursor-pointer rounded-[8px] px-[12px] py-[8px] text-left transition-colors hover:bg-cream"
            onClick={() => onPick(r)}
          >
            <span className="block text-[13.5px] font-semibold leading-[18px] text-ink">
              {r.title}
            </span>
            <span className="block text-[12px] leading-[16px] text-[#545454]">
              {r.desc}
            </span>
          </button>
        ))
      )}
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { open: openBooking } = useBookingModal();

  const results = searchFor(query);
  const showResults = focused && query.trim() !== "";

  const pick = (entry: SearchEntry) => {
    setQuery("");
    setFocused(false);
    setSearchOpen(false);
    if (entry.booking) openBooking();
    else if (entry.href) router.push(entry.href);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && results.length > 0) pick(results[0]);
    if (e.key === "Escape") {
      setQuery("");
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <header className="bg-offwhite">
      {/* Мобилна навигация */}
      <div className="px-[16px] pb-[12px] pt-[71px] lg:hidden">
        <div className="relative flex h-[49px] items-center justify-between">
          <button
            type="button"
            aria-label="Меню"
            aria-expanded={menuOpen}
            className="cursor-pointer p-[4px]"
            onClick={() => setMenuOpen(true)}
          >
            <img src="/icons/menu.svg" alt="" className="h-[16px] w-[24px]" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Logo className="h-[49px] w-[71px]" />
          </div>
          <button
            type="button"
            aria-label="Търсене"
            aria-expanded={searchOpen}
            className="cursor-pointer p-[4px]"
            onClick={() => setSearchOpen((o) => !o)}
          >
            <img src="/icons/search-dark.svg" alt="" className="h-[18px] w-[20px]" />
          </button>
        </div>
        {searchOpen && (
          <form
            role="search"
            className="pt-[12px]"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="search"
              autoFocus
              placeholder="Потърси"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={onSearchKeyDown}
              className="h-[40px] w-full rounded-[61px] border border-black/18 bg-[rgba(217,217,217,0.44)] px-[18px] text-[14px] text-ink outline-none transition-colors placeholder:text-[#545454] focus:border-forest focus:bg-white"
            />
            {query.trim() !== "" && (
              <div className="pt-[8px]">
                <SearchResults results={results} query={query} onPick={pick} />
              </div>
            )}
          </form>
        )}
      </div>

      {/* Мобилно меню (сандвич) */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-offwhite transition-transform duration-300 ease-out lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-[16px] pb-[12px] pt-[71px]">
          <button
            type="button"
            aria-label="Затвори менюто"
            className="relative size-[24px] cursor-pointer"
            onClick={() => setMenuOpen(false)}
          >
            <span className="absolute left-0 top-1/2 h-[2px] w-[24px] -translate-y-1/2 rotate-45 rounded-full bg-forest" />
            <span className="absolute left-0 top-1/2 h-[2px] w-[24px] -translate-y-1/2 -rotate-45 rounded-full bg-forest" />
          </button>
          <Logo className="h-[49px] w-[71px]" />
          <span className="size-[24px]" />
        </div>

        <nav className="mt-[40px] flex flex-col items-center gap-[28px]">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-[20px] font-semibold leading-[26px] transition-colors hover:text-leaf ${
                pathname === link.href ? "text-forest" : "text-[#444444]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-center gap-[32px] pb-[56px]">
          {socials.map((s) => (
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
      </div>

      {/* Десктоп навигация */}
      <div className="mx-auto hidden h-[75px] w-full max-w-[1512px] items-center pl-[50px] pr-[37px] lg:flex">
        <Logo className="h-[42px] w-[62px]" />

        <nav className="ml-[43px] flex items-center gap-[32px]">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-[16px] font-semibold leading-[20px] transition-colors hover:text-leaf ${
                pathname === link.href ? "text-forest" : "text-[#444444]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center">
          {/* Търсачка */}
          <div className="relative">
            <div
              className={`flex h-[33px] w-[171px] items-center gap-[10px] rounded-[61px] border px-[14px] transition-all duration-200 ${
                focused
                  ? "w-[220px] border-forest bg-white shadow-[0px_4px_14px_0px_rgba(0,0,0,0.1)]"
                  : "border-black/18 bg-[rgba(217,217,217,0.44)] hover:border-black/40 hover:bg-[rgba(217,217,217,0.75)] hover:shadow-[0px_4px_14px_0px_rgba(0,0,0,0.08)]"
              }`}
            >
              <span className="relative size-[14px] shrink-0">
                <img src="/icons/search.svg" alt="" className="absolute inset-0 size-full" />
                <img
                  src="/icons/search-handle.svg"
                  alt=""
                  className="absolute -bottom-[1px] -right-[2px] size-[5px]"
                />
              </span>
              <input
                type="search"
                role="searchbox"
                placeholder="Потърси"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={onSearchKeyDown}
                className="w-full bg-transparent text-[13.178px] tracking-[0.1318px] text-ink outline-none placeholder:text-[#545454]"
              />
            </div>
            {showResults && (
              <div className="absolute right-0 top-[41px] z-50 hidden w-[280px] lg:block">
                <SearchResults results={results} query={query} onPick={pick} />
              </div>
            )}
          </div>

          <div className="ml-[45px] flex items-center gap-[24px]">
            {socials.map((s) => (
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
        </div>
      </div>
    </header>
  );
}
