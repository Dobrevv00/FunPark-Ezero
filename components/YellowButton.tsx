"use client";

import { useBookingModal } from "./BookingModal";

export default function YellowButton({
  children,
  className = "",
  booking = false,
}: {
  children: string;
  className?: string;
  booking?: boolean;
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

  return (
    <a href="#" className={classes}>
      {label}
    </a>
  );
}
