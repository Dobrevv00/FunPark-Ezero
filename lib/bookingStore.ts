/**
 * Локално хранилище за резервации, сесии (часове), категории места и блокировки
 * (localStorage). Временно решение до свързването с Payload CMS — тогава тези
 * функции ще бъдат заменени с API извиквания, без промяна по компонентите.
 *
 * Няма зашити в кода часове и категории: всичко се създава от админ панела.
 *  · Категории места → „fpe-categories“ (име, брой места, цена)
 *  · Сесии с валидност „от – до“ → „fpe-schedules“
 *  · Часове само за един ден → „fpe-day-slots“ (има предимство пред сесиите)
 *  · Блокирани отделни места → „fpe-seat-blocks“
 */

/** Брой места по категория в една резервация: { "<id на категория>": брой } */
export type SeatCounts = Record<string, number>;

/** Идентификатор на категория място */
export type SeatKey = string;

export type BookingRecord = {
  id: string;
  dateKey: string; // "2026-08-20"
  dateLabel: string; // "20 август 2026"
  time: string;
  seats: SeatCounts; // брой места по категория
  places: number; // общо места (сумата от seats)
  name: string;
  phone: string;
  email: string;
  total: number; // обща сума в евро
  createdAt: string;
  confirmed?: boolean; // потвърдена от администратор — заключена за промяна/изтриване
  giftFor?: string; // „За:“ от персонализацията на стъпка „Плащане“
  giftMessage?: string; // персонализирано съобщение от стъпка „Плащане“
  internal?: boolean; // лична/вътрешна резервация, направена от панела
};

/**
 * Категория места — редактира се от админ панела. Има име и цена; броят места
 * се задава при добавяне на час (сесия, ден или конкретен час).
 */
export type SeatCategory = {
  id: string;
  label: string;
  /** Резервен брой места, ако за часа не е зададено нищо (по подразбиране 0) */
  places: number;
  /** Цена на място в евро */
  price: number;
};

/** Сесии (часове), валидни в период от дати. */
export type SessionPlan = {
  id: string;
  /** Първи ден, в който важат тези часове ("2026-08-18") */
  from: string;
  /** Последен ден включително ("2026-08-30") */
  to: string;
  /** Часовете за всеки ден от периода ("HH:MM") */
  times: string[];
  /** Места по категории за тези часове — задават се заедно с часа */
  caps?: SeatCounts;
  createdAt: string;
  note?: string;
};

/** Блокирани места по категория за дата/час */
export type SeatBlocks = Record<string, { count: number; reason?: string }>;

const BOOKINGS_KEY = "fpe-bookings";
const SLOTS_KEY = "fpe-slots";
const DAY_SLOTS_KEY = "fpe-day-slots";
const CAPACITY_KEY = "fpe-capacity";
const BLOCKED_KEY = "fpe-blocked";
const PRICES_KEY = "fpe-prices";
const CATEGORIES_KEY = "fpe-categories";
const SCHEDULES_KEY = "fpe-schedules";
const SEAT_BLOCKS_KEY = "fpe-seat-blocks";

export const CURRENCY = "€";

/**
 * Такси според вида на билета. Начисляват се ЕДНОКРАТНО на резервация —
 * билетът е един, независимо колко места са избрани.
 * Категориите, часовете и местата остават без предварително зададени стойности.
 */
export const DEFAULT_PRINTED_FEE = 1.99;
export const DEFAULT_DIGITAL_FEE = 0;

/**
 * Няма предварително зададени категории — всички се създават от админ панела
 * („Категории места“): име, брой места и цена. Докато няма нито една, клиентите
 * не могат да избират места.
 */
const INITIAL_CATEGORIES: SeatCategory[] = [];

const emitChange = () => window.dispatchEvent(new Event("fpe-store-change"));

const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
  emitChange();
};

/* ------------------------------------------------------- категории места */

const isCategory = (v: unknown): v is SeatCategory =>
  !!v &&
  typeof v === "object" &&
  typeof (v as SeatCategory).id === "string" &&
  typeof (v as SeatCategory).label === "string";

/**
 * Категориите места. Ако още не са пипани, важат началните; изрично записан
 * празен списък се уважава (тогава няма категории и резервация не може да се
 * направи, докато не се създаде поне една).
 */
export function getCategories(): SeatCategory[] {
  const raw = readJson<unknown>(CATEGORIES_KEY, null);
  if (!Array.isArray(raw)) return INITIAL_CATEGORIES.map((c) => ({ ...c }));
  return raw.filter(isCategory).map((c) => ({
    id: c.id,
    label: c.label,
    places: Math.max(0, Math.round(Number(c.places) || 0)),
    price: Math.max(0, Math.round((Number(c.price) || 0) * 100) / 100),
  }));
}

export function setCategories(list: SeatCategory[]) {
  writeJson(CATEGORIES_KEY, list);
}

/** Дали категориите вече са пипани от панела */
export const hasCustomCategories = () =>
  typeof window !== "undefined" && localStorage.getItem(CATEGORIES_KEY) !== null;

/**
 * Идентификаторът се пази само от латиница, цифри и тирета — така остава
 * годен и за ключ в база данни, независимо какво е името на категорията.
 */
const slugId = (label: string) => {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "cat"}-${Math.random().toString(36).slice(2, 7)}`;
};

/** Добавя нова категория. Връща я, или null при празно име. */
export function addCategory(
  label: string,
  places: number,
  price: number,
): SeatCategory | null {
  if (label.trim() === "") return null;
  const cat: SeatCategory = {
    id: slugId(label),
    label: label.trim(),
    places: Math.max(0, Math.round(places) || 0),
    price: Math.max(0, Math.round((price || 0) * 100) / 100),
  };
  setCategories([...getCategories(), cat]);
  return cat;
}

export function updateCategory(id: string, patch: Partial<Omit<SeatCategory, "id">>) {
  setCategories(
    getCategories().map((c) =>
      c.id === id
        ? {
            ...c,
            ...patch,
            label: (patch.label ?? c.label).trim() || c.label,
            places: Math.max(0, Math.round(patch.places ?? c.places) || 0),
            price: Math.max(0, Math.round((patch.price ?? c.price) * 100) / 100),
          }
        : c,
    ),
  );
}

/**
 * Изтрива категория. Вече направените резервации се запазват — местата им
 * остават в записа и се показват с идентификатора си.
 */
export function removeCategory(id: string) {
  setCategories(getCategories().filter((c) => c.id !== id));

  // изчистваме зададените места и блокировки за тази категория
  const caps = getCapacityOverrides();
  for (const key of Object.keys(caps)) delete caps[key][id];
  localStorage.setItem(CAPACITY_KEY, JSON.stringify(caps));

  const blocks = getSeatBlockMap();
  for (const key of Object.keys(blocks)) delete blocks[key][id];
  localStorage.setItem(SEAT_BLOCKS_KEY, JSON.stringify(blocks));

  emitChange();
}

/** Брой резервации, които ползват дадена категория — за предупреждение при изтриване */
export function countBookingsWithCategory(id: string): number {
  return getBookings().filter((b) => (b.seats?.[id] ?? 0) > 0).length;
}

/**
 * Ключ за места, зададени без категория. Ползва се, когато администраторът
 * задава общ брой места, преди да е създал категории — по-късно този брой се
 * разпределя между тях.
 */
export const GENERAL_SEAT = "__general";

export const categoryLabel = (id: string) =>
  id === GENERAL_SEAT
    ? "Общо (без категория)"
    : (getCategories().find((c) => c.id === id)?.label ?? id);

/** Съвместимост със стария код: етикет на категория */
export const seatLabel = categoryLabel;

export const emptySeats = (): SeatCounts =>
  Object.fromEntries(getCategories().map((c) => [c.id, 0]));

export const seatsTotal = (s: SeatCounts) =>
  Object.values(s ?? {}).reduce((sum, n) => sum + (Number(n) || 0), 0);

/* --------------------------------------------------------------- цени */

export type PriceSettings = Record<string, number> & {
  printedFee: number;
  digitalFee: number;
};

/** Такси според вида на билета — по едно плащане на резервация. */
export type DeliveryFees = { digitalFee: number; printedFee: number };

const readFee = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : fallback;
};

/** Цените идват от категориите; таксите за вида билет се пазят отделно. */
export function getPrices(): PriceSettings {
  const stored = readJson<Record<string, unknown>>(PRICES_KEY, {});
  const out: PriceSettings = {
    printedFee: readFee(stored?.printedFee, DEFAULT_PRINTED_FEE),
    digitalFee: readFee(stored?.digitalFee, DEFAULT_DIGITAL_FEE),
  };
  // стари цени по категории, които вече не съществуват — за старите резервации
  for (const [k, v] of Object.entries(stored ?? {})) {
    const n = Number(v);
    if (k !== "printedFee" && k !== "digitalFee" && Number.isFinite(n) && n >= 0) {
      out[k] = n;
    }
  }
  for (const c of getCategories()) out[c.id] = c.price;
  return out;
}

/** Таксите за дигитален и печатен билет (еднократно на резервация) */
export function getDeliveryFees(): DeliveryFees {
  const p = getPrices();
  return { digitalFee: p.digitalFee, printedFee: p.printedFee };
}

/** Записва само таксите за вида билет, без да пипа цените по категории */
export function setDeliveryFees(fees: DeliveryFees) {
  writeJson(PRICES_KEY, {
    digitalFee: readFee(fees.digitalFee, DEFAULT_DIGITAL_FEE),
    printedFee: readFee(fees.printedFee, DEFAULT_PRINTED_FEE),
  });
}

/** Записва цените по категории; таксите остават както са. */
export function setPrices(prices: PriceSettings) {
  const cats = getCategories();
  setCategories(
    cats.map((c) =>
      Number.isFinite(prices[c.id])
        ? { ...c, price: Math.max(0, Math.round(prices[c.id] * 100) / 100) }
        : c,
    ),
  );
  const current = getDeliveryFees();
  setDeliveryFees({
    digitalFee: Number.isFinite(prices.digitalFee)
      ? prices.digitalFee
      : current.digitalFee,
    printedFee: Number.isFinite(prices.printedFee)
      ? prices.printedFee
      : current.printedFee,
  });
}

/** Връща таксата за печатен билет по подразбиране */
export function resetPrices() {
  localStorage.removeItem(PRICES_KEY);
  emitChange();
}

export const hasCustomPrices = () =>
  typeof window !== "undefined" && localStorage.getItem(PRICES_KEY) !== null;

export const seatPrice = (key: SeatKey) => getPrices()[key] ?? 0;

/** Такса за печатен билет — еднократно за цялата резервация */
export const printedFee = () => getPrices().printedFee;

/** Такса за дигитален билет — еднократно за цялата резервация */
export const digitalFee = () => getPrices().digitalFee;

/** Обща сума в евро за избраните места */
export const priceForSeats = (s: SeatCounts) => {
  const p = getPrices();
  const sum = Object.entries(s ?? {}).reduce(
    (acc, [key, n]) => acc + (Number(n) || 0) * (p[key] ?? 0),
    0,
  );
  return Math.round(sum * 100) / 100;
};

/* --------------------------------------------------------- резервации */

export function getBookings(): BookingRecord[] {
  const raw = readJson<unknown>(BOOKINGS_KEY, []);
  return Array.isArray(raw) ? (raw as BookingRecord[]) : [];
}

export function saveBooking(record: BookingRecord) {
  writeJson(BOOKINGS_KEY, [...getBookings(), record]);
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
  record: BookingRecord,
):
  | { ok: true }
  | { ok: false; reason: "full" | "blocked"; seat?: string; free: number } {
  const fresh = getBookings();
  if (isSlotBlocked(record.dateKey, record.time)) {
    return { ok: false, reason: "blocked", free: 0 };
  }
  // проверка на всяка избрана категория поотделно (блокираните места вече са извадени)
  for (const [key, want] of Object.entries(record.seats ?? {})) {
    if (!want || want <= 0) continue;
    const free =
      seatCapFor(record.dateKey, record.time, key) -
      countSeat(fresh, record.dateKey, record.time, key);
    if (want > free) {
      return { ok: false, reason: "full", seat: key, free: Math.max(0, free) };
    }
  }
  // общ капацитет за часа
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
  writeJson(
    BOOKINGS_KEY,
    // потвърдените резервации не се променят
    getBookings().map((b) => (b.id === record.id && !b.confirmed ? record : b)),
  );
}

export function deleteBooking(id: string) {
  // потвърдените резервации не се изтриват
  writeJson(
    BOOKINGS_KEY,
    getBookings().filter((b) => b.id !== id || b.confirmed),
  );
}

/** Потвърждаване на резервация — след това е заключена за промяна/изтриване */
export function confirmBooking(id: string) {
  writeJson(
    BOOKINGS_KEY,
    getBookings().map((b) => (b.id === id ? { ...b, confirmed: true } : b)),
  );
}

/* ------------------------------------------------- часове (сесии) */

/** Валиден ли е часът във формат "HH:MM" (00:00 – 23:59). Без ограничение в диапазон. */
export const isValidSlot = (time: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

const sortTimes = (times: string[]) =>
  [...new Set(times.filter(isValidSlot))].sort();

/**
 * Резервни („стандартни“) часове — важат за дни, които не попадат в никоя
 * сесия. По подразбиране е празно: няма предварително зададени часове.
 */
export function getSlots(): string[] {
  const raw = readJson<unknown>(SLOTS_KEY, []);
  return Array.isArray(raw) ? sortTimes(raw as string[]) : [];
}

export function setSlots(slots: string[]) {
  writeJson(SLOTS_KEY, sortTimes(slots));
}

/** Добавя стандартен час. Връща false при невалиден или съществуващ. */
export function addSlot(time: string): boolean {
  if (!isValidSlot(time)) return false;
  const slots = getSlots();
  if (slots.includes(time)) return false;
  setSlots([...slots, time]);
  return true;
}

/**
 * Премахва стандартен час. Резервациите за него се запазват — остават видими
 * в регистъра, но часът вече не може да се избира. Отпадат и блокировките и
 * зададените места само за него.
 */
export function removeSlot(time: string) {
  setSlots(getSlots().filter((t) => t !== time));
  dropSlotSettings(`|${time}`);
}

/** Изчиства блокировки/места/блокирани места за ключове, завършващи на даден час */
function dropSlotSettings(suffix: string) {
  localStorage.setItem(
    BLOCKED_KEY,
    JSON.stringify(getBlocked().filter((k) => !k.endsWith(suffix))),
  );

  const caps = getCapacityOverrides();
  for (const key of Object.keys(caps)) if (key.endsWith(suffix)) delete caps[key];
  localStorage.setItem(CAPACITY_KEY, JSON.stringify(caps));

  const blocks = getSeatBlockMap();
  for (const key of Object.keys(blocks)) if (key.endsWith(suffix)) delete blocks[key];
  localStorage.setItem(SEAT_BLOCKS_KEY, JSON.stringify(blocks));

  emitChange();
}

/** Брой резервации за даден час във всички дни — за предупреждение при изтриване */
export function countBookingsAtTime(time: string): number {
  return getBookings().filter((b) => b.time === time).length;
}

/* ------------------------------------------- сесии с валидност „от – до“ */

const isPlan = (v: unknown): v is SessionPlan =>
  !!v &&
  typeof v === "object" &&
  typeof (v as SessionPlan).id === "string" &&
  typeof (v as SessionPlan).from === "string" &&
  typeof (v as SessionPlan).to === "string" &&
  Array.isArray((v as SessionPlan).times);

export function getSchedules(): SessionPlan[] {
  const raw = readJson<unknown>(SCHEDULES_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isPlan).map((p) => ({
    ...p,
    times: sortTimes(p.times),
    createdAt: p.createdAt ?? "",
  }));
}

export function setSchedules(list: SessionPlan[]) {
  writeJson(SCHEDULES_KEY, list);
}

const isDateKey = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

/**
 * Създава сесия: часове, които важат всеки ден от „from“ до „to“ включително.
 * Връща null при невалидни дати или без нито един валиден час.
 */
export function addSchedule(input: {
  from: string;
  to: string;
  times: string[];
  caps?: SeatCounts;
  note?: string;
}): SessionPlan | null {
  const times = sortTimes(input.times);
  if (!isDateKey(input.from) || !isDateKey(input.to)) return null;
  if (input.to < input.from) return null;
  if (times.length === 0) return null;

  const plan: SessionPlan = {
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    from: input.from,
    to: input.to,
    times,
    caps: input.caps,
    note: input.note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  setSchedules([...getSchedules(), plan]);
  return plan;
}

export function updateSchedule(
  id: string,
  patch: Partial<Pick<SessionPlan, "from" | "to" | "times" | "caps" | "note">>,
) {
  setSchedules(
    getSchedules().map((p) =>
      p.id === id
        ? {
            ...p,
            ...patch,
            times: patch.times ? sortTimes(patch.times) : p.times,
          }
        : p,
    ),
  );
}

export function removeSchedule(id: string) {
  setSchedules(getSchedules().filter((p) => p.id !== id));
}

/** Всички сесии, които покриват дадения ден (най-новото правило е първо) */
export function schedulesForDay(dateKey: string): SessionPlan[] {
  return getSchedules()
    .filter((p) => dateKey >= p.from && dateKey <= p.to)
    .sort((a, b) =>
      a.from === b.from
        ? (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
        : b.from.localeCompare(a.from),
    );
}

/**
 * Часове за конкретен ден. Ред на предимство:
 *  1. часове, зададени само за този ден;
 *  2. сесията, която покрива деня (при няколко важи тази с по-късно начало —
 *     така промяна след определена дата измества старото разписание);
 *  3. стандартните часове.
 */
export function getSlotsForDay(dateKey: string): string[] {
  const own = getDaySlotOverrides()[dateKey];
  // изрично зададен списък важи, дори когато е празен (ден без часове)
  if (own) return sortTimes(own);
  const plan = schedulesForDay(dateKey)[0];
  if (plan) return plan.times;
  return getSlots();
}

/** Кое правило дава часовете на този ден — за показване в панела */
export function slotsSourceForDay(
  dateKey: string,
): { source: "day"; plan?: undefined } | { source: "plan"; plan: SessionPlan } | { source: "standard" } {
  if (getDaySlotOverrides()[dateKey]) return { source: "day" };
  const plan = schedulesForDay(dateKey)[0];
  return plan ? { source: "plan", plan } : { source: "standard" };
}

/* --------------------------------------------- часове само за един ден */

export function getDaySlotOverrides(): Record<string, string[]> {
  const raw = readJson<Record<string, unknown>>(DAY_SLOTS_KEY, {});
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    if (Array.isArray(v) && v.every((t) => typeof t === "string")) {
      out[k] = v as string[];
    }
  }
  return out;
}

/** Има ли денят собствен списък с часове */
export function hasDaySlots(dateKey: string): boolean {
  return dateKey in getDaySlotOverrides();
}

function saveDaySlots(dateKey: string, slots: string[]) {
  const o = getDaySlotOverrides();
  o[dateKey] = sortTimes(slots);
  writeJson(DAY_SLOTS_KEY, o);
}

/** Добавя час само за този ден */
export function addSlotForDay(dateKey: string, time: string): boolean {
  if (!isValidSlot(time)) return false;
  const current = getSlotsForDay(dateKey);
  if (current.includes(time)) return false;
  saveDaySlots(dateKey, [...current, time]);
  return true;
}

/** Премахва час само за този ден (заедно с блокировките и местата за него) */
export function removeSlotForDay(dateKey: string, time: string) {
  saveDaySlots(
    dateKey,
    getSlotsForDay(dateKey).filter((t) => t !== time),
  );

  const slotKey = `${dateKey}|${time}`;

  localStorage.setItem(
    BLOCKED_KEY,
    JSON.stringify(getBlocked().filter((k) => k !== slotKey)),
  );

  const caps = getCapacityOverrides();
  delete caps[slotKey];
  localStorage.setItem(CAPACITY_KEY, JSON.stringify(caps));

  const blocks = getSeatBlockMap();
  delete blocks[slotKey];
  localStorage.setItem(SEAT_BLOCKS_KEY, JSON.stringify(blocks));

  emitChange();
}

/** Връща деня към часовете от сесията/стандартните */
export function resetDaySlots(dateKey: string) {
  const o = getDaySlotOverrides();
  delete o[dateKey];
  writeJson(DAY_SLOTS_KEY, o);
}

/** Брой резервации за конкретен ден и час */
export function countBookingsAtDayTime(dateKey: string, time: string): number {
  return getBookings().filter((b) => b.dateKey === dateKey && b.time === time)
    .length;
}

/* ------------------------------------------------------- места (капацитет) */

/**
 * Зададени места по категории.
 * Ключ за цял ден: "2026-08-15" → важи за всеки час този ден.
 * Ключ за конкретен час: "2026-08-15|14:00" → само за него (има предимство).
 * Без зададена стойност важат местата от самата категория.
 */
export function getCapacityOverrides(): Record<string, SeatCounts> {
  const raw = readJson<Record<string, unknown>>(CAPACITY_KEY, {});
  const out: Record<string, SeatCounts> = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const counts: SeatCounts = {};
      for (const [key, n] of Object.entries(v as Record<string, unknown>)) {
        const num = Number(n);
        if (Number.isFinite(num)) counts[key] = Math.max(0, Math.round(num));
      }
      out[k] = counts;
    }
  }
  return out;
}

export const capacityKey = (dateKey: string, time?: string | null) =>
  time ? `${dateKey}|${time}` : dateKey;

/** Местата по подразбиране — от категориите */
export const defaultSeatCaps = (): SeatCounts =>
  Object.fromEntries(getCategories().map((c) => [c.id, c.places]));

/**
 * Места по категории за дата+час, БЕЗ да се вадят блокираните.
 * Ред: зададени за часа › зададени за деня › местата от сесията, която покрива
 * деня (задават се заедно с часовете) › местата от категориите.
 */
export function getSeatCapsFor(
  dateKey: string,
  time?: string | null,
): SeatCounts {
  const o = getCapacityOverrides();
  const base = defaultSeatCaps();
  const planCaps = schedulesForDay(dateKey)[0]?.caps;
  const override =
    (time ? o[`${dateKey}|${time}`] : undefined) ?? o[dateKey] ?? planCaps ?? null;
  if (!override) return base;
  // зададените стойности допълват категориите (нова категория взима своята стойност)
  return { ...base, ...override };
}

/** Места по категории за дата+час, след като се извадят блокираните */
export function getEffectiveSeatCaps(
  dateKey: string,
  time?: string | null,
): SeatCounts {
  const caps = getSeatCapsFor(dateKey, time);
  const blocks = getSeatBlocks(dateKey, time ?? null);
  const out: SeatCounts = {};
  for (const [key, n] of Object.entries(caps)) {
    out[key] = Math.max(0, n - (blocks[key]?.count ?? 0));
  }
  return out;
}

/** Свободни места за категория (без блокираните) — това ползва резервацията */
export function seatCapFor(
  dateKey: string,
  time: string | null,
  key: SeatKey,
): number {
  return getEffectiveSeatCaps(dateKey, time)[key] ?? 0;
}

/** Общо места за дата+час (без блокираните) */
export function getCapacityFor(dateKey: string, time?: string | null): number {
  return seatsTotal(getEffectiveSeatCaps(dateKey, time));
}

export function setCapacityFor(
  dateKey: string,
  time: string | null,
  seats: SeatCounts,
) {
  const overrides = getCapacityOverrides();
  overrides[capacityKey(dateKey, time)] = seats;
  writeJson(CAPACITY_KEY, overrides);
}

export function removeCapacityOverride(key: string) {
  const overrides = getCapacityOverrides();
  delete overrides[key];
  writeJson(CAPACITY_KEY, overrides);
}

/* ------------------------------------------------- блокирани отделни места */

export function getSeatBlockMap(): Record<string, SeatBlocks> {
  const raw = readJson<Record<string, unknown>>(SEAT_BLOCKS_KEY, {});
  const out: Record<string, SeatBlocks> = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    if (!v || typeof v !== "object" || Array.isArray(v)) continue;
    const entry: SeatBlocks = {};
    for (const [key, val] of Object.entries(v as Record<string, unknown>)) {
      const count = Math.max(0, Math.round(Number((val as { count?: unknown })?.count) || 0));
      if (count > 0) {
        const reason = (val as { reason?: unknown })?.reason;
        entry[key] = {
          count,
          reason: typeof reason === "string" && reason.trim() ? reason : undefined,
        };
      }
    }
    if (Object.keys(entry).length > 0) out[k] = entry;
  }
  return out;
}

/**
 * Блокирани места за дата+час. Часовият запис има предимство пред дневния;
 * ако за часа няма нищо, важи блокировката за целия ден.
 */
export function getSeatBlocks(dateKey: string, time?: string | null): SeatBlocks {
  const map = getSeatBlockMap();
  if (time && map[`${dateKey}|${time}`]) return map[`${dateKey}|${time}`];
  return map[dateKey] ?? {};
}

/** Общо блокирани места за дата+час */
export const blockedSeatsTotal = (dateKey: string, time?: string | null) =>
  Object.values(getSeatBlocks(dateKey, time)).reduce((s, b) => s + b.count, 0);

/**
 * Блокира (или отблокира при count = 0) места от една категория.
 * Блокираните места изчезват от наличността на сайта, но остават видими в
 * панела заедно с причината — например лична резервация.
 */
export function setSeatBlock(
  dateKey: string,
  time: string | null,
  key: SeatKey,
  count: number,
  reason?: string,
) {
  const map = getSeatBlockMap();
  const mapKey = capacityKey(dateKey, time);
  const entry = { ...(map[mapKey] ?? {}) };
  const n = Math.max(0, Math.round(count) || 0);
  if (n === 0) delete entry[key];
  else entry[key] = { count: n, reason: reason?.trim() || undefined };
  if (Object.keys(entry).length === 0) delete map[mapKey];
  else map[mapKey] = entry;
  writeJson(SEAT_BLOCKS_KEY, map);
}

/** Изчиства всички блокирани места за дата (и час, ако е подаден) */
export function clearSeatBlocks(dateKey: string, time?: string | null) {
  const map = getSeatBlockMap();
  delete map[capacityKey(dateKey, time ?? null)];
  writeJson(SEAT_BLOCKS_KEY, map);
}

/* ------------------------------------------ блокирани дати и цели часове */

/**
 * Блокирани дати/часове (неактивни в резервацията).
 * Ключ за цял ден: "2026-08-15". Ключ за конкретен час: "2026-08-15|14:00".
 */
export function getBlocked(): string[] {
  const raw = readJson<unknown>(BLOCKED_KEY, []);
  return Array.isArray(raw) ? (raw as string[]) : [];
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
  if (!b.includes(key)) writeJson(BLOCKED_KEY, [...b, key]);
}

export function removeBlock(key: string) {
  writeJson(
    BLOCKED_KEY,
    getBlocked().filter((k) => k !== key),
  );
}

/* ----------------------------------------------------------- броене */

/** Сумата от заетите места за дата+час (стари записи без places броят по 1) */
export function countBookings(
  bookings: BookingRecord[],
  dateKey: string,
  time: string,
) {
  return bookings
    .filter((b) => b.dateKey === dateKey && b.time === time)
    .reduce((sum, b) => sum + (b.places ?? 1), 0);
}

/** Заетите места за конкретна категория за дата+час */
export function countSeat(
  bookings: BookingRecord[],
  dateKey: string,
  time: string,
  seatType: string,
) {
  return bookings
    .filter((b) => b.dateKey === dateKey && b.time === time)
    .reduce((sum, b) => sum + (b.seats?.[seatType] ?? 0), 0);
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
