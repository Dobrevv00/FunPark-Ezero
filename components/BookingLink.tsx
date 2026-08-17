"use client";

import type { ReactNode } from "react";
import { useBookingModal } from "./BookingModal";

/**
 * Линк във футъра, който отваря календара за резервации.
 *
 * Отделен клиентски компонент, за да остане Footer сървърен. Ползва
 * съществуващия `useBookingModal()` — нищо в резервационната система не се
 * променя. Текстът идва отвън, за да може да се редактира от CMS.
 */
export default function BookingLink({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { open } = useBookingModal();
  return (
    <button
      type="button"
      onClick={() => open()}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
