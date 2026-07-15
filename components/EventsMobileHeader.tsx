"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Header";

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

export default function EventsMobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-offwhite lg:hidden">
      <div className="flex h-[64px] items-center justify-between px-[20px]">
        <Logo className="h-[33px] w-[48px]" />
        <div className="flex items-center gap-[14px]">
          <a
            href="#"
            className="rounded-full bg-pine px-[18px] py-[10px] font-golos text-[13px] font-semibold leading-none text-offwhite transition-colors hover:bg-forest"
          >
            Резервирай
          </a>
          <button
            type="button"
            aria-label="Меню"
            aria-expanded={menuOpen}
            className="flex cursor-pointer flex-col gap-[5px] p-[2px]"
            onClick={() => setMenuOpen(true)}
          >
            <span className="h-[2.5px] w-[22px] rounded-[2px] bg-ink" />
            <span className="h-[2.5px] w-[22px] rounded-[2px] bg-ink" />
            <span className="h-[2.5px] w-[22px] rounded-[2px] bg-ink" />
          </button>
        </div>
      </div>

      {/* Мобилно меню (сандвич) */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-offwhite transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[64px] items-center justify-between px-[20px]">
          <button
            type="button"
            aria-label="Затвори менюто"
            className="relative size-[24px] cursor-pointer"
            onClick={() => setMenuOpen(false)}
          >
            <span className="absolute left-0 top-1/2 h-[2px] w-[24px] -translate-y-1/2 rotate-45 rounded-full bg-forest" />
            <span className="absolute left-0 top-1/2 h-[2px] w-[24px] -translate-y-1/2 -rotate-45 rounded-full bg-forest" />
          </button>
          <Logo className="h-[33px] w-[48px]" />
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
    </header>
  );
}
