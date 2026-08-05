"use client";

/**
 * Календарен изглед за админ панела.
 * Показва месец с натовареността по дни и позволява всичко, което може и
 * списъчният изглед — блокиране на ден/час, промяна на капацитета и
 * управление на резервациите — но привързано към конкретна дата.
 */

import { useEffect, useMemo, useState } from "react";
import {
  SEAT_TYPES,
  CURRENCY,
  SEAT_PRICES,
  emptySeats,
  priceForSeats,
  addBlock,
  addSlotForDay,
  capacityKey,
  confirmBooking,
  countBookings,
  countBookingsAtDayTime,
  deleteBooking,
  getBlocked,
  getBookings,
  getCapacityOverrides,
  getDaySlotOverrides,
  getSeatCapsFor,
  getSlots,
  getSlotsForDay,
  SLOT_RANGE,
  isSlotInRange,
  isValidSlot,
  removeBlock,
  removeCapacityOverride,
  removeSlotForDay,
  resetDaySlots,
  seatsTotal,
  setCapacityFor,
  subscribeToStore,
  updateBooking,
  type BookingRecord,
  type SeatCounts,
  type SeatKey,
} from "@/lib/bookingStore";
import { dayKey, monthNames, monthNamesLower, weekdays } from "./calendarData";

const inputCls =
  "h-[34px] w-full rounded-[8px] bg-[rgba(161,161,170,0.15)] px-[8px] text-[13px] text-ink outline-none focus:ring-2 focus:ring-forest/40";

function dateLabelFromKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return key;
  return `${d} ${monthNamesLower[m - 1]} ${y}`;
}

function buildMonthGrid(year: number, month: number): (number | null)[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Малък редактор за места по видове седалки (за ден или за час) */
/** Основният вид седалки — през него се разпределя промяната на общия брой */
const MAIN_SEAT: SeatKey = "mid";

function SeatEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: SeatCounts;
  onSave: (seats: SeatCounts) => void;
  onCancel: () => void;
}) {
  const [seats, setSeats] = useState<SeatCounts>(initial);
  const total = seatsTotal(seats);

  /** Промяна на общия брой — коригира местата от основния вид */
  const setTotal = (value: number) => {
    const others = total - seats[MAIN_SEAT];
    setSeats((c) => ({ ...c, [MAIN_SEAT]: Math.max(0, value - others) }));
  };

  const mainLabel =
    SEAT_TYPES.find((s) => s.key === MAIN_SEAT)?.label ?? MAIN_SEAT;

  return (
    <div className="mt-[10px] rounded-[8px] bg-white p-[12px]">
      <div className="flex flex-wrap items-end gap-[10px]">
        {SEAT_TYPES.map((s) => (
          <label
            key={s.key}
            className="flex flex-col gap-[4px] text-[11px] font-medium text-[#545454]"
          >
            {s.label}
            <input
              type="number"
              min={0}
              max={200}
              value={seats[s.key]}
              onChange={(e) =>
                setSeats((c) => ({
                  ...c,
                  [s.key]: Math.max(0, Number(e.target.value) || 0),
                }))
              }
              className={`${inputCls} w-[76px]`}
            />
          </label>
        ))}
        <label className="flex flex-col gap-[4px] text-[11px] font-semibold text-forest">
          Общо
          <input
            type="number"
            min={0}
            max={600}
            value={total}
            onChange={(e) => setTotal(Math.max(0, Number(e.target.value) || 0))}
            className={`${inputCls} w-[80px] bg-[rgba(106,142,78,0.12)] font-bold text-forest`}
          />
        </label>
        <button
          type="button"
          onClick={() => onSave(seats)}
          className="h-[34px] cursor-pointer rounded-[8px] bg-forest px-[16px] text-[13px] font-semibold text-white transition-colors hover:bg-pine"
        >
          Запази
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-[34px] cursor-pointer rounded-[8px] border border-[#dddad2] px-[14px] text-[13px] font-semibold text-[#3f3f46] transition-colors hover:bg-black/5"
        >
          Отказ
        </button>
      </div>
      <p className="mt-[8px] text-[11px] text-[#a1a1aa]">
        Общият брой е сборът от трите вида. Промяната му коригира местата от
        вид „{mainLabel}“.
      </p>
    </div>
  );
}

type Draft = {
  dateKey: string;
  time: string;
  places: number;
  name: string;
  phone: string;
  email: string;
  seats: SeatCounts;
};

/** Модал за редакция на резервация — същите полета като в списъчния изглед */
function EditBookingModal({
  booking,
  slots,
  onClose,
}: {
  booking: BookingRecord;
  slots: string[];
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    dateKey: booking.dateKey,
    time: booking.time,
    places: booking.places ?? 1,
    name: booking.name,
    phone: booking.phone,
    email: booking.email,
    seats: booking.seats ? { ...booking.seats } : emptySeats(),
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const total = priceForSeats(draft.seats);

  const canSave =
    /^\d{4}-\d{2}-\d{2}$/.test(draft.dateKey) &&
    /^\d{2}:\d{2}$/.test(draft.time) &&
    draft.name.trim() !== "";

  const save = () => {
    if (!canSave) return;
    updateBooking({
      ...booking,
      ...draft,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      dateLabel: dateLabelFromKey(draft.dateKey),
      total,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-[16px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-[520px] max-w-full overflow-y-auto rounded-[10px] bg-offwhite p-[24px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-golos text-[18px] font-bold text-ink">
          Редакция на {booking.id}
        </h3>

        <div className="mt-[16px] grid grid-cols-2 gap-[12px]">
          <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
            Дата
            <input
              type="date"
              value={draft.dateKey}
              onChange={(e) => set("dateKey", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
            Час
            <select
              value={draft.time}
              onChange={(e) => set("time", e.target.value)}
              className={inputCls}
            >
              {!slots.includes(draft.time) && (
                <option value={draft.time}>{draft.time}</option>
              )}
              {slots.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
            Име
            <input
              type="text"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
            Телефон
            <input
              type="tel"
              value={draft.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="col-span-2 flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
            Имейл
            <input
              type="email"
              value={draft.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
            Места
            <input
              type="number"
              min={1}
              max={200}
              value={draft.places}
              onChange={(e) =>
                set("places", Math.max(1, Number(e.target.value) || 1))
              }
              className={inputCls}
            />
          </label>
          <div />
          {SEAT_TYPES.map((s) => (
            <label
              key={s.key}
              className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]"
            >
              {s.label}{" "}
              <span className="text-[11px] font-normal text-[#a1a1aa]">
                {SEAT_PRICES[s.key] === 0
                  ? "безплатно"
                  : `${SEAT_PRICES[s.key]} ${CURRENCY}`}
              </span>
              <input
                type="number"
                min={0}
                max={200}
                value={draft.seats[s.key]}
                onChange={(e) => {
                  const v = Math.max(0, Number(e.target.value) || 0);
                  setDraft((d) => ({
                    ...d,
                    seats: { ...d.seats, [s.key]: v },
                  }));
                }}
                className={inputCls}
              />
            </label>
          ))}
        </div>

        <p className="mt-[16px] font-golos text-[15px] font-bold text-ink">
          Сума: {total} {CURRENCY}
        </p>

        <div className="mt-[20px] flex justify-end gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-[10px] border border-[#dddad2] px-[20px] py-[9px] text-[14px] font-semibold text-[#3f3f46] transition-colors hover:bg-black/5"
          >
            Откажи
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={save}
            className={`rounded-[10px] px-[20px] py-[9px] text-[14px] font-semibold text-white transition-colors ${
              canSave
                ? "cursor-pointer bg-forest hover:bg-pine"
                : "cursor-not-allowed bg-[#c3c3c3]"
            }`}
          >
            Запази
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCalendar() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string>(
    dayKey(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, SeatCounts>>({});
  const [baseSlots, setBaseSlots] = useState<string[]>([]);
  const [daySlots, setDaySlots] = useState<Record<string, string[]>>({});

  const [editing, setEditing] = useState<BookingRecord | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [capEditor, setCapEditor] = useState<string | null>(null); // "day" | час
  const [newSlot, setNewSlot] = useState("");
  const [slotError, setSlotError] = useState("");
  const [pendingSlotDelete, setPendingSlotDelete] = useState<{
    time: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    const refresh = () => {
      setBookings(getBookings());
      setBlocked(getBlocked());
      setOverrides(getCapacityOverrides());
      setBaseSlots(getSlots());
      setDaySlots(getDaySlotOverrides());
    };
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const weeks = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const todayKey = dayKey(today.getFullYear(), today.getMonth(), today.getDate());

  const dayInfo = (key: string) => {
    const list = bookings.filter((b) => b.dateKey === key);
    const places = list.reduce((s, b) => s + (b.places ?? 1), 0);
    const pending = list.filter((b) => !b.confirmed).length;
    return {
      count: list.length,
      places,
      pending,
      dayBlocked: blocked.includes(key),
      slotBlocks: blocked.filter((k) => k.startsWith(`${key}|`)).length,
      hasCap:
        !!overrides[key] ||
        Object.keys(overrides).some((k) => k.startsWith(`${key}|`)),
    };
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const selInfo = dayInfo(selected);
  const dayBookings = bookings
    .filter((b) => b.dateKey === selected)
    .sort((a, b) => a.time.localeCompare(b.time));

  // часовете за избрания ден — индивидуални, ако са зададени такива
  const hasOwnSlots = selected in daySlots;
  const slots = hasOwnSlots ? [...daySlots[selected]].sort() : baseSlots;

  return (
    <section className="mb-[24px] rounded-[10px] bg-offwhite p-[24px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
      <h2 className="font-golos text-[20px] font-bold text-ink">
        Календар
        <span className="ml-[10px] font-golos text-[14px] font-medium text-[#a1a1aa]">
          управление по дни
        </span>
      </h2>
      <p className="mt-[4px] text-[13px] text-[#545454]">
        Изберете ден, за да видите часовете и резервациите за него. Оттук
        можете да блокирате ден или час, да промените местата и да управлявате
        резервациите.
      </p>

      <div className="mt-[20px] grid gap-[24px] lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Месечна решетка */}
        <div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Предишен месец"
              onClick={() => shiftMonth(-1)}
              className="flex size-[32px] cursor-pointer items-center justify-center rounded-full border border-[#dddad2] text-[16px] text-[#3f3f46] transition-colors hover:border-forest hover:text-forest"
            >
              ‹
            </button>
            <p className="font-golos text-[16px] font-bold text-ink">
              {monthNames[month]} {year}
            </p>
            <button
              type="button"
              aria-label="Следващ месец"
              onClick={() => shiftMonth(1)}
              className="flex size-[32px] cursor-pointer items-center justify-center rounded-full border border-[#dddad2] text-[16px] text-[#3f3f46] transition-colors hover:border-forest hover:text-forest"
            >
              ›
            </button>
          </div>

          <div className="mt-[12px] grid grid-cols-7 gap-[4px] text-center text-[11px] font-semibold uppercase text-[#a1a1aa]">
            {weekdays.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="mt-[6px] grid grid-cols-7 gap-[4px]">
            {weeks.flat().map((d, i) => {
              if (d === null) return <span key={`e${i}`} />;
              const key = dayKey(year, month, d);
              const info = dayInfo(key);
              const isSel = key === selected;
              const isToday = key === todayKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelected(key);
                    setCapEditor(null);
                  }}
                  className={`relative flex h-[54px] cursor-pointer flex-col items-center justify-center rounded-[8px] border text-[14px] transition-colors ${
                    isSel
                      ? "border-forest bg-forest text-white"
                      : info.dayBlocked
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-[#e6e4de] bg-white text-ink hover:border-forest"
                  }`}
                >
                  <span
                    className={`font-golos font-semibold ${
                      isToday && !isSel ? "text-forest underline" : ""
                    }`}
                  >
                    {d}
                  </span>
                  {info.count > 0 && (
                    <span
                      className={`text-[10px] leading-none ${
                        isSel ? "text-white/90" : "text-[#545454]"
                      }`}
                    >
                      {info.places} м.
                    </span>
                  )}
                  <span className="absolute right-[4px] top-[4px] flex gap-[2px]">
                    {info.pending > 0 && (
                      <span
                        title={`${info.pending} чакащи`}
                        className="size-[6px] rounded-full bg-sun"
                      />
                    )}
                    {info.hasCap && (
                      <span
                        title="Променен капацитет"
                        className="size-[6px] rounded-full bg-[#7aa2d6]"
                      />
                    )}
                    {info.slotBlocks > 0 && !info.dayBlocked && (
                      <span
                        title={`${info.slotBlocks} блокирани часа`}
                        className="size-[6px] rounded-full bg-red-400"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-[12px] flex flex-wrap gap-[12px] text-[11px] text-[#545454]">
            <span className="flex items-center gap-[5px]">
              <span className="size-[8px] rounded-full bg-sun" /> чакащи
            </span>
            <span className="flex items-center gap-[5px]">
              <span className="size-[8px] rounded-full bg-[#7aa2d6]" /> променен
              капацитет
            </span>
            <span className="flex items-center gap-[5px]">
              <span className="size-[8px] rounded-full bg-red-400" /> блокиран
              час
            </span>
            <span className="flex items-center gap-[5px]">
              <span className="size-[8px] rounded-[2px] bg-red-100 ring-1 ring-red-300" />{" "}
              блокиран ден
            </span>
          </div>
        </div>

        {/* Панел за избрания ден */}
        <div className="rounded-[10px] bg-[#faf9f6] p-[18px]">
          <div className="flex flex-wrap items-center justify-between gap-[10px]">
            <div>
              <p className="font-golos text-[17px] font-bold text-ink">
                {dateLabelFromKey(selected)}
              </p>
              <p className="text-[12px] text-[#545454]">
                {selInfo.count} резервации · {selInfo.places} места
                {selInfo.pending > 0 && ` · ${selInfo.pending} чакащи`}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                selInfo.dayBlocked ? removeBlock(selected) : addBlock(selected)
              }
              className={`h-[34px] cursor-pointer rounded-[10px] px-[16px] text-[13px] font-semibold transition-colors ${
                selInfo.dayBlocked
                  ? "bg-forest text-white hover:bg-pine"
                  : "border border-red-200 text-red-600 hover:bg-red-50"
              }`}
            >
              {selInfo.dayBlocked ? "Отблокирай деня" : "Блокирай целия ден"}
            </button>
          </div>

          {/* Часове */}
          <div className="mt-[18px] flex flex-wrap items-center justify-between gap-[10px]">
            <h3 className="font-golos text-[14px] font-bold text-ink">
              Часове
              <span className="ml-[6px] font-normal text-[11px] text-[#a1a1aa]">
                {hasOwnSlots ? "индивидуални за този ден" : "стандартни часове"}
              </span>
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isValidSlot(newSlot)) {
                  setSlotError("Невалиден час.");
                  return;
                }
                if (!isSlotInRange(newSlot)) {
                  setSlotError(
                    `Часът трябва да е между ${SLOT_RANGE.min} и ${SLOT_RANGE.max}.`
                  );
                  return;
                }
                if (slots.includes(newSlot)) {
                  setSlotError("Този час вече съществува за деня.");
                  return;
                }
                addSlotForDay(selected, newSlot);
                setNewSlot("");
                setSlotError("");
              }}
              noValidate
              className="flex items-end gap-[6px]"
            >
              <label className="flex flex-col gap-[2px]">
                <span className="pl-[4px] text-[9px] font-semibold uppercase tracking-[1.5px] text-[#a1a1aa]">
                  {SLOT_RANGE.min} – {SLOT_RANGE.max}
                </span>
                <input
                  type="time"
                  value={newSlot}
                  min={SLOT_RANGE.min}
                  max={SLOT_RANGE.max}
                  onChange={(e) => {
                    setNewSlot(e.target.value);
                    setSlotError("");
                  }}
                  aria-label="Нов час (часове и минути)"
                  title={`Допустим диапазон: ${SLOT_RANGE.min} – ${SLOT_RANGE.max}`}
                  className="h-[30px] w-[112px] rounded-[8px] bg-white px-[8px] text-[12px] text-ink outline-none ring-1 ring-[#dddad2] focus:ring-2 focus:ring-forest/40"
                />
              </label>
              <button
                type="submit"
                className="h-[30px] cursor-pointer rounded-[8px] bg-sun px-[12px] text-[12px] font-semibold text-black/80 transition-colors hover:bg-[#e0b32f]"
              >
                + Добави час
              </button>
            </form>
          </div>
          {slotError && (
            <p className="mt-[6px] text-[12px] text-red-600">{slotError}</p>
          )}
          {hasOwnSlots && (
            <p className="mt-[6px] flex flex-wrap items-center gap-[8px] text-[11px] text-[#7aa2d6]">
              Този ден има собствени часове — промените тук не влияят на
              останалите дни.
              <button
                type="button"
                onClick={() => resetDaySlots(selected)}
                className="cursor-pointer font-semibold text-[#a1a1aa] underline transition-colors hover:text-forest"
              >
                Върни стандартните часове
              </button>
            </p>
          )}
          {slots.length === 0 && (
            <p className="mt-[8px] text-[12px] text-red-600">
              Няма часове за този ден — посетителите не могат да резервират.
            </p>
          )}
          <div className="mt-[10px] flex flex-col gap-[10px]">
            {slots.map((slot) => {
              const slotKey = `${selected}|${slot}`;
              const caps = getSeatCapsFor(selected, slot);
              const cap = seatsTotal(caps);
              const taken = countBookings(bookings, selected, slot);
              const isBlocked =
                selInfo.dayBlocked || blocked.includes(slotKey);
              const pct = cap > 0 ? Math.min(100, (taken / cap) * 100) : 0;
              const hasOverride = !!overrides[capacityKey(selected, slot)];
              return (
                <div
                  key={slot}
                  className={`rounded-[10px] border p-[14px] ${
                    isBlocked
                      ? "border-red-200 bg-red-50"
                      : "border-[#e6e4de] bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-[14px]">
                    <span className="w-[54px] shrink-0 font-golos text-[16px] font-semibold text-ink">
                      {slot}
                    </span>
                    <span className="w-[86px] shrink-0 text-[13px] text-[#545454]">
                      {taken}/{cap} места
                    </span>
                    <span className="h-[7px] min-w-[70px] flex-1 overflow-hidden rounded-full bg-[#eceae4]">
                      <span
                        className={`block h-full rounded-full ${
                          pct >= 100 ? "bg-red-400" : "bg-forest"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    {hasOverride && (
                      <span className="text-[12px] text-[#7aa2d6]">
                        променен
                      </span>
                    )}
                    <button
                      type="button"
                      title={`Промени местата за ${slot} на ${dateLabelFromKey(selected)}`}
                      onClick={() =>
                        setCapEditor(capEditor === slot ? null : slot)
                      }
                      className={`cursor-pointer rounded-[8px] border px-[14px] py-[7px] text-[12.5px] font-semibold transition-colors ${
                        capEditor === slot
                          ? "border-forest bg-[rgba(106,142,78,0.1)] text-forest"
                          : "border-[#dddad2] text-[#3f3f46] hover:border-forest hover:text-forest"
                      }`}
                    >
                      Промени местата
                    </button>
                    <button
                      type="button"
                      disabled={selInfo.dayBlocked}
                      onClick={() =>
                        blocked.includes(slotKey)
                          ? removeBlock(slotKey)
                          : addBlock(slotKey)
                      }
                      className={`rounded-[8px] border px-[14px] py-[7px] text-[12.5px] font-semibold transition-colors ${
                        selInfo.dayBlocked
                          ? "cursor-not-allowed border-[#e6e4de] text-[#c3c3c3]"
                          : blocked.includes(slotKey)
                            ? "cursor-pointer border-forest text-forest hover:bg-[rgba(106,142,78,0.08)]"
                            : "cursor-pointer border-red-200 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      {blocked.includes(slotKey) ? "Отблокирай" : "Блокирай"}
                    </button>
                    <button
                      type="button"
                      aria-label={`Изтрий час ${slot}`}
                      title={`Премахни ${slot} само за ${dateLabelFromKey(selected)}`}
                      onClick={() => {
                        const count = countBookingsAtDayTime(selected, slot);
                        if (count > 0) {
                          setPendingSlotDelete({ time: slot, count });
                        } else {
                          removeSlotForDay(selected, slot);
                        }
                      }}
                      className="cursor-pointer px-[6px] text-[15px] leading-none text-[#a1a1aa] transition-colors hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                  {capEditor === slot && (
                    <>
                      <SeatEditor
                        initial={caps}
                        onSave={(seats) => {
                          setCapacityFor(selected, slot, seats);
                          setCapEditor(null);
                        }}
                        onCancel={() => setCapEditor(null)}
                      />
                      {hasOverride && (
                        <button
                          type="button"
                          onClick={() => {
                            removeCapacityOverride(
                              capacityKey(selected, slot)
                            );
                            setCapEditor(null);
                          }}
                          className="mt-[8px] cursor-pointer text-[11px] font-semibold text-[#a1a1aa] underline transition-colors hover:text-red-600"
                        >
                          Върни по подразбиране за този час
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Резервации за деня */}
          <h3 className="mt-[26px] font-golos text-[16px] font-bold text-ink">
            Резервации за деня
          </h3>
          {dayBookings.length === 0 ? (
            <p className="mt-[10px] text-[13.5px] text-[#545454]">
              Няма резервации за тази дата.
            </p>
          ) : (
            <div className="mt-[12px] flex flex-col gap-[12px]">
              {dayBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-[10px] border border-[#e6e4de] bg-white p-[16px]"
                >
                  <div className="flex flex-wrap items-center gap-[12px]">
                    <span className="font-golos text-[14px] font-semibold text-forest">
                      {b.id}
                    </span>
                    <span className="font-golos text-[15px] font-semibold text-ink">
                      {b.time}
                    </span>
                    <span className="text-[14px] text-ink">{b.name}</span>
                    <span className="text-[13px] text-[#545454]">
                      {b.places ?? 1} м. · {b.total.toLocaleString("bg-BG")}{" "}
                      {CURRENCY}
                    </span>
                    {b.confirmed ? (
                      <span className="rounded-full bg-[rgba(106,142,78,0.15)] px-[10px] py-[3px] text-[12px] font-semibold text-forest">
                        ✓ Потвърдена
                      </span>
                    ) : (
                      <span className="rounded-full bg-[rgba(244,198,63,0.2)] px-[10px] py-[3px] text-[12px] font-semibold text-[#8a6d1a]">
                        Чакаща
                      </span>
                    )}
                  </div>
                  <p className="mt-[8px] text-[13px] leading-[1.5] text-[#545454]">
                    {b.phone} · {b.email}
                    {b.seats &&
                      ` · ${
                        SEAT_TYPES.filter((s) => b.seats[s.key] > 0)
                          .map((s) => `${s.label} ×${b.seats[s.key]}`)
                          .join(", ") || "—"
                      }`}
                  </p>
                  {/* Персонализация от стъпка „Плащане“ */}
                  {(b.giftFor || b.giftMessage) && (
                    <div className="mt-[10px] rounded-[8px] bg-[rgba(244,198,63,0.12)] px-[12px] py-[10px]">
                      <p className="font-golos text-[11px] font-semibold uppercase tracking-[1.2px] text-[#8a6d1a]">
                        🎁 Персонализация
                      </p>
                      {b.giftFor && (
                        <p className="mt-[5px] text-[13px] text-[#3f3f46]">
                          За: <span className="font-semibold">{b.giftFor}</span>
                        </p>
                      )}
                      {b.giftMessage && (
                        <p className="mt-[3px] text-[13px] italic leading-[1.5] text-[#3f3f46]">
                          „{b.giftMessage}“
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-[12px] flex flex-wrap gap-[8px]">
                    {b.confirmed ? (
                      <span className="text-[13px] text-[#a1a1aa]">
                        🔒 Заключена
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setConfirmId(b.id)}
                          className="cursor-pointer rounded-[8px] bg-forest px-[16px] py-[8px] text-[13px] font-semibold text-white transition-colors hover:bg-pine"
                        >
                          Потвърди
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(b)}
                          className="cursor-pointer rounded-[8px] border border-[#dddad2] px-[16px] py-[8px] text-[13px] font-semibold text-[#3f3f46] transition-colors hover:border-forest hover:text-forest"
                        >
                          Редактирай
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBooking(b.id)}
                          className="cursor-pointer rounded-[8px] border border-red-200 px-[16px] py-[8px] text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          Изтрий
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <EditBookingModal
          booking={editing}
          slots={slots}
          onClose={() => setEditing(null)}
        />
      )}

      {pendingSlotDelete && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-[16px]"
          onClick={() => setPendingSlotDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-[400px] max-w-full rounded-[10px] bg-offwhite p-[28px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-golos text-[18px] font-bold text-ink">
              Изтриване на час {pendingSlotDelete.time}
            </h3>
            <p className="mt-[8px] text-[14px] leading-[1.4] text-[#545454]">
              За {dateLabelFromKey(selected)} в този час има{" "}
              <span className="font-semibold text-ink">
                {pendingSlotDelete.count}
              </span>{" "}
              резервации. Те се запазват в регистъра, но часът няма да може да
              се избира за този ден. Останалите дни не се променят.
            </p>
            <div className="mt-[24px] flex justify-end gap-[10px]">
              <button
                type="button"
                onClick={() => setPendingSlotDelete(null)}
                className="cursor-pointer rounded-[10px] border border-[#dddad2] px-[20px] py-[9px] text-[14px] font-semibold text-[#3f3f46] transition-colors hover:bg-black/5"
              >
                Откажи
              </button>
              <button
                type="button"
                onClick={() => {
                  removeSlotForDay(selected, pendingSlotDelete.time);
                  setPendingSlotDelete(null);
                }}
                className="cursor-pointer rounded-[10px] bg-red-600 px-[20px] py-[9px] text-[14px] font-semibold text-white transition-colors hover:bg-red-700"
              >
                Да, изтрий
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmId && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-[16px]"
          onClick={() => setConfirmId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-[400px] max-w-full rounded-[10px] bg-offwhite p-[28px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-golos text-[18px] font-bold text-ink">
              Потвърждаване на резервация
            </h3>
            <p className="mt-[8px] text-[14px] leading-[1.4] text-[#545454]">
              Сигурни ли сте, че искате да потвърдите резервация{" "}
              <span className="font-semibold text-forest">{confirmId}</span>?
              След потвърждаване тя не може да бъде променяна или изтривана.
            </p>
            <div className="mt-[24px] flex justify-end gap-[10px]">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="cursor-pointer rounded-[10px] border border-[#dddad2] px-[20px] py-[9px] text-[14px] font-semibold text-[#3f3f46] transition-colors hover:bg-black/5"
              >
                Откажи
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmBooking(confirmId);
                  setConfirmId(null);
                }}
                className="cursor-pointer rounded-[10px] bg-forest px-[20px] py-[9px] text-[14px] font-semibold text-white transition-colors hover:bg-pine"
              >
                Да, потвърди
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
