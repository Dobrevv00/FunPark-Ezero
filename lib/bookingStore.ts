/**
 * Локално хранилище за резервации и часови слотове (localStorage).
 * Временно решение до свързването с Payload CMS — тогава тези функции
 * ще бъдат заменени с API извиквания, без промяна по компонентите.
 */

/** Брой места по вид седалка в една резервация */
export type SeatCounts = { light: number; mid: number; heavy: number };

export type BookingRecord = {
  id: string;
  dateKey: string; // "2026-08-20"
  dateLabel: string; // "20 август 2026"
  time: string;
  seats: SeatCounts; // брой места по вид седалка
  places: number; // общо места (сумата от seats)
  name: string;
  phone: string;
  email: string;
  total: number; // обща сума в евро
  createdAt: string;
  confirmed?: boolean; // потвърдена от администратор — заключена за промяна/изтриване
  giftFor?: string; // „За:“ от персонализацията на стъпка „Плащане“
  giftMessage?: string; // персонализирано съобщение от стъпка „Плащане“
};

/**
 * Видове седалки и наличност на сесия (общо 20 места на час).
 * Всеки вид се следи отделно — заета седалка от даден вид не е достъпна за
 * други за същия час.
 */
export const SEAT_TYPES = [
  { key: "light", label: "До 30 кг", cap: 1 },
  { key: "mid", label: "От 30 до 60 кг", cap: 14 },
  { key: "heavy", label: "От 60 до 140 кг", cap: 5 },
] as const;

export type SeatKey = (typeof SEAT_TYPES)[number]["key"];

/** Капацитети по подразбиране за всеки вид седалка */
const DEFAULT_SEAT_CAPS: Record<SeatKey, number> = {
  light: 1,
  mid: 14,
  heavy: 5,
};

export const emptySeats = (): SeatCounts => ({ light: 0, mid: 0, heavy: 0 });

export const seatsTotal = (s: SeatCounts) => s.light + s.mid + s.heavy;

export const seatLabel = (key: string) =>
  SEAT_TYPES.find((s) => s.key === key)?.label ?? key;

const BOOKINGS_KEY = "fpe-bookings";
const SLOTS_KEY = "fpe-slots";
const DAY_SLOTS_KEY = "fpe-day-slots";
const CAPACITY_KEY = "fpe-capacity";
const BLOCKED_KEY = "fpe-blocked";
const PRICES_KEY = "fpe-prices";

/** Максимален брой резервации за един времеви слот */
export const SLOT_CAPACITY = 20;

/** Цени по подразбиране в евро според вида седалка */
export const DEFAULT_SEAT_PRICES: Record<SeatKey, number> = {
  light: 0, // До 30 кг — безплатно
  mid: 16, // От 30 до 60 кг
  heavy: 28, // От 60 до 140 кг
};

/** Такса за печатен билет по подразбиране (евро) */
export const DEFAULT_PRINTED_FEE = 1.99;

export const CURRENCY = "€";

export type PriceSettings = Record<SeatKey, number> & { printedFee: number };

const DEFAULT_PRICES: PriceSettings = {
  ...DEFAULT_SEAT_PRICES,
  printedFee: DEFAULT_PRINTED_FEE,
};

/**
 * Цените се променят от админ панела и се пазят в localStorage.
 * При липса на записани цени важат тези по подразбиране.
 */
export function getPrices(): PriceSettings {
  if (typeof window === "undefined") return { ...DEFAULT_PRICES };
  try {
    const raw = JSON.parse(localStorage.getItem(PRICES_KEY) ?? "null");
    if (!raw || typeof raw !== "object") return { ...DEFAULT_PRICES };
    const out = { ...DEFAULT_PRICES };
    for (const key of Object.keys(DEFAULT_PRICES) as (keyof PriceSettings)[]) {
      const v = Number(raw[key]);
      if (Number.isFinite(v) && v >= 0) out[key] = Math.round(v * 100) / 100;
    }
    return out;
  } catch {
    return { ...DEFAULT_PRICES };
  }
}

export function setPrices(prices: PriceSettings) {
  localStorage.setItem(PRICES_KEY, JSON.stringify(prices));
  emitChange();
}

/** Връща цените към стойностите по подразбиране */
export function resetPrices() {
  localStorage.removeItem(PRICES_KEY);
  emitChange();
}

/** Има ли записани (променени от админ) цени */
export const hasCustomPrices = () =>
  typeof window !== "undefined" && localStorage.getItem(PRICES_KEY) !== null;

/** Цена на един билет според вида седалка (по текущите настройки) */
export const seatPrice = (key: SeatKey) => getPrices()[key];

/** Такса за печатен билет (по текущите настройки) */
export const printedFee = () => getPrices().printedFee;

/** Обща сума в евро за избраните места по видове седалки */
export const priceForSeats = (s: SeatCounts) => {
  const p = getPrices();
  const sum = s.light * p.light + s.mid * p.mid + s.heavy * p.heavy;
  return Math.round(sum * 100) / 100;
};

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

/**
 * Атомарно записване с финална проверка на наличността.
 * Чете най-актуалните данни в момента на записа (не остаряло състояние),
 * така че при едновременни опити само първият успява — вторият вижда, че
 * вече няма достатъчно места. Синхронният read→check→write минимизира
 * прозореца за конфликт при споделен localStorage между табове.
 * Заменя се с транзакция/условен запис при свързване с Payload CMS.
 */
export function tryBook(
  record: BookingRecord
):
  | { ok: true }
  | { ok: false; reason: "full" | "blocked"; seat?: string; free: number } {
  const fresh = getBookings();
  if (isSlotBlocked(record.dateKey, record.time)) {
    return { ok: false, reason: "blocked", free: 0 };
  }
  // проверка на всеки избран вид седалка поотделно
  for (const st of SEAT_TYPES) {
    const want = record.seats[st.key] ?? 0;
    if (want <= 0) continue;
    const free =
      seatCapFor(record.dateKey, record.time, st.key) -
      countSeat(fresh, record.dateKey, record.time, st.key);
    if (want > free) {
      return { ok: false, reason: "full", seat: st.key, free: Math.max(0, free) };
    }
  }
  // общ капацитет за часа (може да е ограничен от админа)
  const totalFree =
    getCapacityFor(record.dateKey, record.time) -
    countBookings(fresh, record.dateKey, record.time);
  if (record.places > totalFree) {
    return { ok: false, reason: "full", free: Math.max(0, totalFree) };
  }
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify([...fresh, record]));
  emitChange();
  return { ok: true };
}

export function updateBooking(record: BookingRecord) {
  localStorage.setItem(
    BOOKINGS_KEY,
    JSON.stringify(
      // потвърдените резервации не се променят
      getBookings().map((b) =>
        b.id === record.id && !b.confirmed ? record : b
      )
    )
  );
  emitChange();
}

export function deleteBooking(id: string) {
  localStorage.setItem(
    BOOKINGS_KEY,
    // потвърдените резервации не се изтриват (запазват се, ако id съвпада, но е потвърдена)
    JSON.stringify(getBookings().filter((b) => b.id !== id || b.confirmed))
  );
  emitChange();
}

/** Потвърждаване на резервация — след това е заключена за промяна/изтриване */
export function confirmBooking(id: string) {
  localStorage.setItem(
    BOOKINGS_KEY,
    JSON.stringify(
      getBookings().map((b) => (b.id === id ? { ...b, confirmed: true } : b))
    )
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

/** Допустим диапазон за нови часове (работно време) */
export const SLOT_RANGE = { min: "09:00", max: "17:30" } as const;

/** Валиден ли е часът във формат "HH:MM" (00:00 – 23:59) */
export const isValidSlot = (time: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

/** В работния диапазон ли е часът (09:00 – 17:30) */
export const isSlotInRange = (time: string) =>
  isValidSlot(time) && time >= SLOT_RANGE.min && time <= SLOT_RANGE.max;

/** Добавя нов час; часовете се пазят сортирани. Връща false при невалиден/съществуващ. */
export function addSlot(time: string): boolean {
  if (!isSlotInRange(time)) return false;
  const slots = getSlots();
  if (slots.includes(time)) return false;
  setSlots([...slots, time].sort());
  return true;
}

/**
 * Премахва час от списъка. Резервациите за този час се запазват — те остават
 * видими в регистъра и в деня си, но часът вече не може да се избира.
 * Заедно с часа отпадат и блокировките/капацитетите, зададени само за него.
 */
export function removeSlot(time: string) {
  setSlots(getSlots().filter((t) => t !== time));

  const blocked = getBlocked().filter((k) => !k.endsWith(`|${time}`));
  localStorage.setItem(BLOCKED_KEY, JSON.stringify(blocked));

  const overrides = getCapacityOverrides();
  for (const key of Object.keys(overrides)) {
    if (key.endsWith(`|${time}`)) delete overrides[key];
  }
  localStorage.setItem(CAPACITY_KEY, JSON.stringify(overrides));

  emitChange();
}

/** Брой резервации за даден час във всички дни — за предупреждение при изтриване */
export function countBookingsAtTime(time: string): number {
  return getBookings().filter((b) => b.time === time).length;
}

/**
 * Часове за конкретен ден.
 * Ако за деня са зададени индивидуални часове, важат само те; иначе се
 * използват стандартните (общите) часове. Промяна на часовете за един ден
 * не влияе на останалите дни.
 */
export function getDaySlotOverrides(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(DAY_SLOTS_KEY) ?? "{}");
    if (!raw || typeof raw !== "object") return {};
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (Array.isArray(v) && v.every((t) => typeof t === "string")) {
        out[k] = v as string[];
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** Има ли денят собствен списък с часове */
export function hasDaySlots(dateKey: string): boolean {
  return dateKey in getDaySlotOverrides();
}

/** Часовете, валидни за конкретен ден */
export function getSlotsForDay(dateKey: string): string[] {
  const o = getDaySlotOverrides();
  return o[dateKey] ? [...o[dateKey]].sort() : getSlots();
}

function saveDaySlots(dateKey: string, slots: string[]) {
  const o = getDaySlotOverrides();
  o[dateKey] = [...slots].sort();
  localStorage.setItem(DAY_SLOTS_KEY, JSON.stringify(o));
  emitChange();
}

/** Добавя час само за този ден */
export function addSlotForDay(dateKey: string, time: string): boolean {
  if (!isSlotInRange(time)) return false;
  const current = getSlotsForDay(dateKey);
  if (current.includes(time)) return false;
  saveDaySlots(dateKey, [...current, time]);
  return true;
}

/** Премахва час само за този ден (заедно с блокировката и местата за него) */
export function removeSlotForDay(dateKey: string, time: string) {
  const current = getSlotsForDay(dateKey);
  saveDaySlots(
    dateKey,
    current.filter((t) => t !== time)
  );

  const slotKey = `${dateKey}|${time}`;

  const blocked = getBlocked().filter((k) => k !== slotKey);
  localStorage.setItem(BLOCKED_KEY, JSON.stringify(blocked));

  const overrides = getCapacityOverrides();
  delete overrides[slotKey];
  localStorage.setItem(CAPACITY_KEY, JSON.stringify(overrides));

  emitChange();
}

/** Връща деня към стандартните часове */
export function resetDaySlots(dateKey: string) {
  const o = getDaySlotOverrides();
  delete o[dateKey];
  localStorage.setItem(DAY_SLOTS_KEY, JSON.stringify(o));
  emitChange();
}

/** Брой резервации за конкретен ден и час */
export function countBookingsAtDayTime(dateKey: string, time: string): number {
  return getBookings().filter((b) => b.dateKey === dateKey && b.time === time)
    .length;
}

/**
 * Персонализиран капацитет по видове седалки.
 * Ключ за цял ден: "2026-08-15" → брой места по вид за всеки час този ден.
 * Ключ за конкретен час: "2026-08-15|14:00" → само за този час (има предимство).
 * Общият капацитет на часа е сборът от трите вида.
 */
const isSeatCounts = (v: unknown): v is SeatCounts =>
  !!v &&
  typeof v === "object" &&
  Number.isFinite((v as SeatCounts).light) &&
  Number.isFinite((v as SeatCounts).mid) &&
  Number.isFinite((v as SeatCounts).heavy);

export function getCapacityOverrides(): Record<string, SeatCounts> {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(CAPACITY_KEY) ?? "{}");
    if (!raw || typeof raw !== "object") return {};
    // пропускаме стари/невалидни записи (напр. от предишен формат с число)
    const out: Record<string, SeatCounts> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (isSeatCounts(v)) out[k] = v as SeatCounts;
    }
    return out;
  } catch {
    return {};
  }
}

export const capacityKey = (dateKey: string, time?: string | null) =>
  time ? `${dateKey}|${time}` : dateKey;

/** Места по видове седалки за дата+час — часов override › дневен override › по подразбиране */
export function getSeatCapsFor(
  dateKey: string,
  time?: string | null
): SeatCounts {
  const o = getCapacityOverrides();
  if (time && o[`${dateKey}|${time}`]) return o[`${dateKey}|${time}`];
  if (o[dateKey]) return o[dateKey];
  return { ...DEFAULT_SEAT_CAPS };
}

/** Капацитет на конкретен вид седалка за дата+час */
export function seatCapFor(
  dateKey: string,
  time: string | null,
  key: SeatKey
): number {
  return getSeatCapsFor(dateKey, time)[key] ?? 0;
}

/** Общ капацитет за дата+час = сборът от трите вида места */
export function getCapacityFor(dateKey: string, time?: string | null): number {
  return seatsTotal(getSeatCapsFor(dateKey, time));
}

export function setCapacityFor(
  dateKey: string,
  time: string | null,
  seats: SeatCounts
) {
  const overrides = getCapacityOverrides();
  overrides[capacityKey(dateKey, time)] = seats;
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

/** Заетите места за конкретен вид седалка за дата+час */
export function countSeat(
  bookings: BookingRecord[],
  dateKey: string,
  time: string,
  seatType: string
) {
  return bookings
    .filter((b) => b.dateKey === dateKey && b.time === time)
    .reduce((sum, b) => sum + (b.seats?.[seatType as SeatKey] ?? 0), 0);
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
