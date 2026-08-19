"use client";

import Link from "next/link";
import { useBookingModal } from "./BookingModal";

export default function YellowButton({
  children,
  className = "",
  booking = false,
  href = "#",
  external = false,
}: {
  children: string;
  className?: string;
  booking?: boolean;
  /** По подразбиране е „#“, за да останат старите бутони точно както са. */
  href?: string;
  /** Външен адрес — отваря се в нов таб */
  external?: boolean;
}) {
  const { open } = useBookingModal();
  const classes = `flex items-center justify-center rounded-[10px] bg-sun px-[24px] py-[10px] transition-colors hover:bg-[#e0b32f] ${className}`;
  const label = (
    <span className="whitespace-nowrap text-center text-[15px] font-semibold leading-[20px] text-black/80">
      {children}
    </span>
  );

  if (booking) {
    return (
      <button
        type="button"
        className={`cursor-pointer ${classes}`}
        onClick={() => open()}
      >
        {label}
      </button>
    );
  }

  // вътрешните адреси минават през Link, за да няма презареждане на страницата
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={classes}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {label}
    </a>
  );
}
