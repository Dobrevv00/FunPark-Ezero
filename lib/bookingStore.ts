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
  places: number; // брой резервирани места за този час
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
const CAPACITY_KEY = "fpe-capacity";
const BLOCKED_KEY = "fpe-blocked";

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

/**
 * Персонализиран капацитет.
 * Ключ за цял ден: "2026-08-15" → места на час за всеки час този ден.
 * Ключ за конкретен час: "2026-08-15|14:00" → места само за този час (има предимство).
 */
export function getCapacityOverrides(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(CAPACITY_KEY) ?? "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

export const capacityKey = (dateKey: string, time?: string | null) =>
  time ? `${dateKey}|${time}` : dateKey;

/** Капацитет за конкретни дата и час — часов override › дневен override › по подразбиране */
export function getCapacityFor(dateKey: string, time?: string | null): number {
  const o = getCapacityOverrides();
  if (time && o[`${dateKey}|${time}`] != null) return o[`${dateKey}|${time}`];
  if (o[dateKey] != null) return o[dateKey];
  return SLOT_CAPACITY;
}

export function setCapacityFor(
  dateKey: string,
  time: string | null,
  capacity: number
) {
  const overrides = getCapacityOverrides();
  overrides[capacityKey(dateKey, time)] = capacity;
  localStorage.setItem(CAPACITY_KEY, JSON.stringify(overrides));
  emitChange();
}

export function removeCapacityOverride(key: string) {
  const overrides = getCapacityOverrides();
  delete overrides[key];
  localStorage.setItem(CAPACITY_KEY, JSON.stringify(overrides));
  emitChange();
}

/**
 * Блокирани дати/часове (неактивни в резервацията).
 * Ключ за цял ден: "2026-08-15". Ключ за конкретен час: "2026-08-15|14:00".
 */
export function getBlocked(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(BLOCKED_KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

/** Множество от блокирани цели дни (без часовите ключове) */
export function getBlockedDaySet(): Set<string> {
  return new Set(getBlocked().filter((k) => !k.includes("|")));
}

export function isDayBlocked(dateKey: string): boolean {
  return getBlocked().includes(dateKey);
}

/** Часът е блокиран, ако е блокиран изрично или ако целият ден е блокиран */
export function isSlotBlocked(dateKey: string, time: string): boolean {
  const b = getBlocked();
  return b.includes(dateKey) || b.includes(`${dateKey}|${time}`);
}

export function addBlock(key: string) {
  const b = getBlocked();
  if (!b.includes(key)) {
    localStorage.setItem(BLOCKED_KEY, JSON.stringify([...b, key]));
    emitChange();
  }
}

export function removeBlock(key: string) {
  localStorage.setItem(
    BLOCKED_KEY,
    JSON.stringify(getBlocked().filter((k) => k !== key))
  );
  emitChange();
}

/** Сумата от заетите места за дата+час (стари записи без places броят по 1) */
export function countBookings(
  bookings: BookingRecord[],
  dateKey: string,
  time: string
) {
  return bookings
    .filter((b) => b.dateKey === dateKey && b.time === time)
    .reduce((sum, b) => sum + (b.places ?? 1), 0);
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
