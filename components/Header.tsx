"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Начало", href: "/" },
  { label: "Събития", href: "/events" },
  { label: "Контакти", href: "/contacts" },
];

const socials = [
  { src: "/icons/facebook.svg", alt: "Facebook", className: "h-[20px] w-[10px]" },
  { src: "/icons/twitter.svg", alt: "Twitter", className: "h-[18px] w-[22px]" },
  { src: "/icons/instagram.svg", alt: "Instagram", className: "h-[22px] w-[22px]" },
];

export function Logo({ className }: { className: string }) {
  return (
    <Link href="/" className={`relative block overflow-hidden ${className}`}>
      <span className="absolute inset-[2.67%_0_0_0]">
        <img src="/icons/logo-mark.svg" alt="Fun Park Ezero" className="size-full" />
      </span>
      <span className="absolute inset-[0_37%_78.73%_34.4%]">
        <img src="/icons/logo-leaf.svg" alt="" className="size-full" />
      </span>
    </Link>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

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
              className="h-[40px] w-full rounded-[61px] border border-black/18 bg-[rgba(217,217,217,0.44)] px-[18px] text-[14px] text-ink outline-none placeholder:text-[#545454]"
            />
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
              href="#"
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
          <button
            type="button"
            className="flex h-[33px] w-[171px] cursor-pointer items-center gap-[10px] rounded-[61px] border border-black/18 bg-[rgba(217,217,217,0.44)] px-[14px] transition-colors hover:bg-[rgba(217,217,217,0.75)]"
          >
            <span className="relative size-[14px] shrink-0">
              <img src="/icons/search.svg" alt="" className="absolute inset-0 size-full" />
              <img
                src="/icons/search-handle.svg"
                alt=""
                className="absolute -bottom-[1px] -right-[2px] size-[5px]"
              />
            </span>
            <span className="text-[13.178px] leading-[1.3] tracking-[0.1318px] text-[#545454]">
              Потърси
            </span>
          </button>

          <div className="ml-[45px] flex items-center gap-[24px]">
            {socials.map((s) => (
              <a
                key={s.alt}
                href="#"
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
