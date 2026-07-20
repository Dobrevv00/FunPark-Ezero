/**
 * Локално хранилище за резервации и часови слотове (localStorage).
 * Временно решение до свързването с Payload CMS — тогава тези функции
 * ще бъдат заменени с API извиквания, без промяна по компонентите.
 */

export type BookingRecord = {
  id: string;
  dateKey: string; // "2026-08-20"
  dateLabel: string; // "20 август 2026"
  time: string;
  name: string;
  phone: string;
  email: string;
  adult: number;
  child: number;
  small: number;
  total: number;
  createdAt: string;
};

const BOOKINGS_KEY = "fpe-bookings";
const SLOTS_KEY = "fpe-slots";

/** Максимален брой резервации за един времеви слот */
export const SLOT_CAPACITY = 20;

/** Цени на билетите в лв */
export const TICKET_PRICES = { adult: 28, child: 16, small: 0 };

export const defaultSlots = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
];

const emitChange = () => window.dispatchEvent(new Event("fpe-store-change"));

export function getBookings(): BookingRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function saveBooking(record: BookingRecord) {
  localStorage.setItem(
    BOOKINGS_KEY,
    JSON.stringify([...getBookings(), record])
  );
  emitChange();
}

export function updateBooking(record: BookingRecord) {
  localStorage.setItem(
    BOOKINGS_KEY,
    JSON.stringify(getBookings().map((b) => (b.id === record.id ? record : b)))
  );
  emitChange();
}

export function deleteBooking(id: string) {
  localStorage.setItem(
    BOOKINGS_KEY,
    JSON.stringify(getBookings().filter((b) => b.id !== id))
  );
  emitChange();
}

export function getSlots(): string[] {
  if (typeof window === "undefined") return defaultSlots;
  try {
    const raw = JSON.parse(localStorage.getItem(SLOTS_KEY) ?? "null");
    return Array.isArray(raw) ? raw : defaultSlots;
  } catch {
    return defaultSlots;
  }
}

export function setSlots(slots: string[]) {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  emitChange();
}

export function countBookings(
  bookings: BookingRecord[],
  dateKey: string,
  time: string
) {
  return bookings.filter((b) => b.dateKey === dateKey && b.time === time)
    .length;
}

/** Абонамент за промени (вкл. от други табове) */
export function subscribeToStore(fn: () => void) {
  window.addEventListener("fpe-store-change", fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener("fpe-store-change", fn);
    window.removeEventListener("storage", fn);
  };
}
