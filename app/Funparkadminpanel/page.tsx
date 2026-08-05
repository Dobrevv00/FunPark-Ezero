"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SLOT_CAPACITY,
  CURRENCY,
  DEFAULT_PRINTED_FEE,
  DEFAULT_SEAT_PRICES,
  emptySeats,
  getPrices,
  hasCustomPrices,
  priceForSeats,
  resetPrices,
  setPrices,
  type PriceSettings,
  addBlock,
  addSlot,
  addSlotForDay,
  countBookingsAtDayTime,
  countBookingsAtTime,
  deleteBooking,
  getBlocked,
  getBookings,
  getCapacityOverrides,
  getDaySlotOverrides,
  getSlots,
  SLOT_RANGE,
  isSlotInRange,
  isValidSlot,
  resetDaySlots,
  SEAT_TYPES,
  confirmBooking,
  removeBlock,
  removeCapacityOverride,
  removeSlot,
  removeSlotForDay,
  seatsTotal,
  setCapacityFor,
  subscribeToStore,
  updateBooking,
  type BookingRecord,
  type SeatCounts,
  type SeatKey,
} from "@/lib/bookingStore";
import { ADMIN_PASS, ADMIN_USER, AUTH_KEY, isAdminAuthed } from "@/lib/adminAuth";
import { Logo } from "@/components/Logo";
import AdminCalendar from "@/components/AdminCalendar";
import { monthNamesLower } from "@/components/calendarData";

/** Обобщение на билетите по видове седалки, напр. „1 × До 30 кг · 2 × От 30 до 60 кг“ */
function ticketsLabel(b: BookingRecord) {
  if (!b.seats) return "—";
  return (
    SEAT_TYPES.filter((s) => (b.seats[s.key] ?? 0) > 0)
      .map((s) => `${b.seats[s.key]} × ${s.label}`)
      .join(" · ") || "—"
  );
}

function dateLabelFromKey(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return dateKey;
  return `${d} ${monthNamesLower[m - 1]} ${y}`;
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

const inputCls =
  "h-[34px] w-full rounded-[8px] bg-[rgba(161,161,170,0.15)] px-[8px] text-[13px] text-ink outline-none focus:ring-2 focus:ring-forest/40";

/** Форматиране на цена: „16“, „1,99“, „0“ */
const priceLabel = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");

/** Приема „1,99“ и „1.99“; връща null при невалидна стойност */
const parsePrice = (v: string) => {
  const raw = v.trim().replace(",", ".");
  if (raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 10000) return null;
  return Math.round(n * 100) / 100;
};

function PricesSection() {
  const fields = [
    ...SEAT_TYPES.map((s) => ({ key: s.key as keyof PriceSettings, label: s.label })),
    { key: "printedFee" as keyof PriceSettings, label: "Такса печатен билет" },
  ];

  const [current, setCurrent] = useState<PriceSettings>({
    ...DEFAULT_SEAT_PRICES,
    printedFee: DEFAULT_PRINTED_FEE,
  });
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [custom, setCustom] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const p = getPrices();
      setCurrent(p);
      setCustom(hasCustomPrices());
      // не презаписваме полетата, докато администраторът пише в тях
      setDirty((isDirty) => {
        if (!isDirty) {
          setDraft({
            light: priceLabel(p.light),
            mid: priceLabel(p.mid),
            heavy: priceLabel(p.heavy),
            printedFee: priceLabel(p.printedFee),
          });
        }
        return isDirty;
      });
    };
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const parsed = fields.map((f) => parsePrice(draft[f.key] ?? ""));
  const allValid = parsed.every((v) => v !== null);
  const canSave = dirty && allValid;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    const next = {} as PriceSettings;
    fields.forEach((f, i) => {
      next[f.key] = parsed[i] as number;
    });
    setPrices(next);
    setDirty(false);
    setSaved(true);
  };

  return (
    <section className="mb-[24px] rounded-[10px] bg-offwhite p-[24px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
      <h2 className="font-golos text-[20px] font-bold text-ink">
        Цени на билетите
        {custom && (
          <span className="ml-[10px] rounded-full bg-[rgba(122,162,214,0.18)] px-[10px] py-[3px] text-[12px] font-semibold text-[#4b7cb5]">
            променени
          </span>
        )}
      </h2>
      <p className="mt-[4px] text-[13px] text-[#545454]">
        Цената на билета се определя от вида седалка. Тук можете да я промените —
        новите цени важат веднага за всички нови резервации. Стойност 0 означава
        безплатен билет. Приемат се и стотинки (напр. 1,99).
      </p>

      <form onSubmit={save} className="mt-[16px] flex flex-wrap items-end gap-[12px]">
        {fields.map((f, i) => {
          const invalid = parsed[i] === null;
          return (
            <label
              key={f.key}
              className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]"
            >
              {f.label} ({CURRENCY})
              <input
                type="text"
                inputMode="decimal"
                value={draft[f.key] ?? ""}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, [f.key]: e.target.value }));
                  setDirty(true);
                  setSaved(false);
                }}
                className={`${inputCls} w-[150px] font-semibold ${
                  invalid ? "text-red-600 ring-2 ring-red-400" : "text-ink"
                }`}
              />
            </label>
          );
        })}
        <button
          type="submit"
          disabled={!canSave}
          className={`h-[34px] rounded-[10px] px-[24px] text-[14px] font-semibold transition-colors ${
            canSave
              ? "cursor-pointer bg-sun text-black/80 hover:bg-[#e0b32f]"
              : "cursor-not-allowed bg-[#e6e4de] text-[#a1a1aa]"
          }`}
        >
          Запази
        </button>
        {!allValid && (
          <p className="w-full text-[13px] text-red-600">
            Цената трябва да е число, по-голямо или равно на 0.
          </p>
        )}
        {saved && (
          <p className="w-full text-[13px] font-semibold text-forest">
            Цените са запазени.
          </p>
        )}
      </form>

      <div className="mt-[16px] flex flex-wrap items-center gap-[8px]">
        {SEAT_TYPES.map((s) => (
          <span
            key={s.key}
            className="rounded-full bg-white px-[12px] py-[6px] text-[13px] text-[#3f3f46]"
          >
            {s.label}:{" "}
            <span className="font-semibold text-forest">
              {current[s.key] === 0
                ? "безплатно"
                : `${priceLabel(current[s.key])} ${CURRENCY}`}
            </span>
          </span>
        ))}
        <span className="rounded-full bg-white px-[12px] py-[6px] text-[13px] text-[#3f3f46]">
          Печатен билет:{" "}
          <span className="font-semibold text-forest">
            {current.printedFee === 0
              ? "безплатно"
              : `+${priceLabel(current.printedFee)} ${CURRENCY}`}
          </span>
        </span>
      </div>

      <p className="mt-[12px] text-[12px] text-[#a1a1aa]">
        Вече направените резервации запазват сумата, с която са платени. Ако
        редактирате стара резервация, сумата ще се преизчисли по новите цени.
      </p>

      {custom && (
        <button
          type="button"
          onClick={() => {
            resetPrices();
            setDirty(false);
            setSaved(false);
          }}
          className="mt-[10px] cursor-pointer text-[12px] font-semibold text-[#a1a1aa] underline transition-colors hover:text-red-600"
        >
          Върни цените по подразбиране ({SEAT_TYPES.map((s) => priceLabel(DEFAULT_SEAT_PRICES[s.key])).join(" / ")}{" "}
          {CURRENCY}, такса {priceLabel(DEFAULT_PRINTED_FEE)} {CURRENCY})
        </button>
      )}
    </section>
  );
}

function CapacitySection() {
  const [overrides, setOverrides] = useState<Record<string, SeatCounts>>({});
  const [slots, setSlotsState] = useState<string[]>([]);
  const [capDate, setCapDate] = useState("");
  const [capTime, setCapTime] = useState(""); // "" = целият ден
  const [capSeats, setCapSeats] = useState<SeatCounts>({
    light: 1,
    mid: 14,
    heavy: 5,
  });
  const [capTotal, setCapTotal] = useState(20); // целеви общ брой
  const [capError, setCapError] = useState("");

  useEffect(() => {
    const refresh = () => {
      setOverrides(getCapacityOverrides());
      setSlotsState(getSlots());
    };
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const seatsSum = seatsTotal(capSeats);
  const sumMatches = seatsSum === capTotal;
  const canSaveCap = capTotal > 0 && sumMatches;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(capDate)) {
      setCapError("Изберете дата.");
      return;
    }
    if (!canSaveCap) return;
    setCapacityFor(capDate, capTime || null, capSeats);
    setCapDate("");
    setCapTime("");
    setCapSeats({ light: 1, mid: 14, heavy: 5 });
    setCapTotal(20);
    setCapError("");
  };

  const entries = Object.entries(overrides).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <section className="mb-[24px] rounded-[10px] bg-offwhite p-[24px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
      <h2 className="font-golos text-[20px] font-bold text-ink">
        Капацитет по дни
      </h2>
      <p className="mt-[4px] text-[13px] text-[#545454]">
        По подразбиране всеки ден има {SLOT_CAPACITY} места на час (
        {SEAT_TYPES.map((s) => `${s.label} — ${s.cap}`).join(", ")}). Тук можете
        да зададете различен брой места по видове седалки за цял ден или само за
        определен час. Общият капацитет е сборът от видовете.
      </p>

      <form onSubmit={submit} className="mt-[16px] flex flex-wrap items-end gap-[12px]">
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Дата
          <input
            type="date"
            value={capDate}
            onChange={(e) => {
              setCapDate(e.target.value);
              setCapError("");
            }}
            className={`${inputCls} w-[160px]`}
          />
        </label>
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Час
          <select
            value={capTime}
            onChange={(e) => setCapTime(e.target.value)}
            className={`${inputCls} w-[130px]`}
          >
            <option value="">Целият ден</option>
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        {SEAT_TYPES.map((s) => (
          <label
            key={s.key}
            className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]"
          >
            {s.label}
            <input
              type="number"
              min={0}
              max={200}
              value={capSeats[s.key]}
              onChange={(e) => {
                const v = Math.max(0, Number(e.target.value) || 0);
                setCapSeats((c) => ({ ...c, [s.key]: v }));
                setCapError("");
              }}
              className={`${inputCls} w-[86px]`}
            />
          </label>
        ))}
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Общо
          <input
            type="number"
            min={0}
            max={600}
            value={capTotal}
            onChange={(e) => {
              setCapTotal(Math.max(0, Number(e.target.value) || 0));
              setCapError("");
            }}
            className={`${inputCls} w-[80px] font-bold ${
              sumMatches ? "text-forest" : "text-red-600 ring-2 ring-red-400"
            }`}
          />
        </label>
        <button
          type="submit"
          disabled={!canSaveCap}
          className={`h-[34px] rounded-[10px] px-[24px] text-[14px] font-semibold transition-colors ${
            canSaveCap
              ? "cursor-pointer bg-sun text-black/80 hover:bg-[#e0b32f]"
              : "cursor-not-allowed bg-[#e6e4de] text-[#a1a1aa]"
          }`}
        >
          Запази
        </button>
        {capError && <p className="w-full text-[13px] text-red-600">{capError}</p>}
        {!sumMatches && (
          <p className="w-full text-[13px] text-red-600">
            Сборът по видове ({seatsSum}) трябва да е равен на общия брой (
            {capTotal}).
          </p>
        )}
        <p className="w-full text-[12px] font-semibold text-forest">
          {/^\d{4}-\d{2}-\d{2}$/.test(capDate) ? (
            <>
              Ще важи за{" "}
              <span className="rounded-full bg-[rgba(106,142,78,0.12)] px-[10px] py-[3px]">
                {dateLabelFromKey(capDate)}
                {capTime ? `, ${capTime} ч` : " — целия ден"}
              </span>
            </>
          ) : (
            <span className="font-normal text-[#a1a1aa]">
              Изберете дата, за да видите за кой ден ще важи промяната.
            </span>
          )}
        </p>
      </form>

      {entries.length > 0 && (
        <div className="mt-[20px] flex flex-wrap gap-[10px]">
          {entries.map(([key, seats]) => {
            const [dateKey, time] = key.split("|");
            const total = seatsTotal(seats);
            return (
              <span
                key={key}
                className="flex items-center gap-[10px] rounded-full border-[1.258px] border-[#dddad2] bg-white px-[14px] py-[7px] font-golos text-[14px] text-[#3f3f46]"
              >
                <span className="font-semibold">
                  {dateLabelFromKey(dateKey)}
                </span>
                {time && <span className="text-ink">{time} ч</span>}
                <span className="text-forest">
                  {total} места ({SEAT_TYPES.map((s) => seats[s.key]).join("/")})
                </span>
                <button
                  type="button"
                  aria-label={`Премахни ${key}`}
                  className="cursor-pointer leading-none text-[#a1a1aa] transition-colors hover:text-red-600"
                  onClick={() => removeCapacityOverride(key)}
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SlotsSection() {
  const [slots, setSlotsState] = useState<string[]>([]);
  const [customDays, setCustomDays] = useState<Record<string, string[]>>({});
  const [selectedDay, setSelectedDay] = useState(""); // "" = стандартни за всички дни
  const [newSlot, setNewSlot] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    time: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    const refresh = () => {
      setSlotsState(getSlots());
      setCustomDays(getDaySlotOverrides());
    };
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const customEntries = Object.entries(customDays).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  /** Избран ли е конкретен ден, или се редактират стандартните часове */
  const dayMode = /^\d{4}-\d{2}-\d{2}$/.test(selectedDay);
  /** Денят вече има собствени часове (различни от стандартните) */
  const dayHasOwn = dayMode && selectedDay in customDays;
  /** Часовете, които се показват и редактират в момента */
  const visibleSlots = dayHasOwn
    ? [...customDays[selectedDay]].sort()
    : slots;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidSlot(newSlot)) {
      setError("Въведете валиден час.");
      return;
    }
    if (!isSlotInRange(newSlot)) {
      setError(
        `Часът трябва да е между ${SLOT_RANGE.min} и ${SLOT_RANGE.max}.`
      );
      return;
    }
    if (visibleSlots.includes(newSlot)) {
      setError("Този час вече съществува.");
      return;
    }
    if (dayMode) addSlotForDay(selectedDay, newSlot);
    else addSlot(newSlot);
    setNewSlot("");
    setError("");
  };

  const tryRemove = (time: string) => {
    const count = dayMode
      ? countBookingsAtDayTime(selectedDay, time)
      : countBookingsAtTime(time);
    if (count > 0) {
      setPendingDelete({ time, count });
      return;
    }
    if (dayMode) removeSlotForDay(selectedDay, time);
    else removeSlot(time);
  };

  return (
    <section className="mb-[24px] rounded-[10px] bg-offwhite p-[24px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
      <h2 className="font-golos text-[20px] font-bold text-ink">Часове</h2>
      <p className="mt-[4px] text-[13px] text-[#545454]">
        Без избран ден се редактират стандартните часове, които важат за всеки
        ден. Изберете конкретен ден, за да зададете часове само за него — те не
        влияят на останалите дни.
      </p>

      <form
        onSubmit={submit}
        noValidate
        className="mt-[16px] flex flex-wrap items-end gap-[12px]"
      >
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          <span>
            Ден{" "}
            <span className="text-[11px] font-normal text-[#a1a1aa]">
              (празно = всички дни)
            </span>
          </span>
          <input
            type="date"
            value={selectedDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              setError("");
            }}
            className={`${inputCls} w-[160px]`}
          />
        </label>
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          <span>
            Нов час{" "}
            <span className="text-[11px] font-normal text-[#a1a1aa]">
              ({SLOT_RANGE.min} – {SLOT_RANGE.max})
            </span>
          </span>
          <input
            type="time"
            value={newSlot}
            min={SLOT_RANGE.min}
            max={SLOT_RANGE.max}
            onChange={(e) => {
              setNewSlot(e.target.value);
              setError("");
            }}
            title={`Допустим диапазон: ${SLOT_RANGE.min} – ${SLOT_RANGE.max}`}
            className={`${inputCls} w-[130px]`}
          />
        </label>
        <button
          type="submit"
          className="h-[34px] cursor-pointer rounded-[10px] bg-sun px-[24px] text-[14px] font-semibold text-black/80 transition-colors hover:bg-[#e0b32f]"
        >
          Добави час
        </button>
        {selectedDay && (
          <button
            type="button"
            onClick={() => {
              setSelectedDay("");
              setError("");
            }}
            className="h-[34px] cursor-pointer rounded-[10px] border border-[#dddad2] px-[16px] text-[13px] font-semibold text-[#3f3f46] transition-colors hover:border-forest hover:text-forest"
          >
            Всички дни
          </button>
        )}
        {error && <p className="text-[13px] text-red-600">{error}</p>}
      </form>

      <p className="mt-[20px] flex flex-wrap items-center gap-[8px] text-[12px] font-semibold text-forest">
        {dayMode && (
          <span className="rounded-full bg-[rgba(106,142,78,0.12)] px-[10px] py-[3px]">
            Часове за {dateLabelFromKey(selectedDay)}
          </span>
        )}
        {dayMode && !dayHasOwn && (
          <span className="font-normal text-[#a1a1aa]">
            в момента ползва стандартните — промяна тук ще ги направи
            индивидуални само за този ден
          </span>
        )}
        {dayMode && dayHasOwn && (
          <button
            type="button"
            onClick={() => resetDaySlots(selectedDay)}
            className="cursor-pointer font-semibold text-[#a1a1aa] underline transition-colors hover:text-forest"
          >
            Върни стандартните часове за деня
          </button>
        )}
        {!dayMode && customEntries.length > 0 && (
          <span className="font-normal text-[#a1a1aa]">
            освен {customEntries.length}{" "}
            {customEntries.length === 1 ? "ден" : "дни"} със собствени часове
            (виж по-долу)
          </span>
        )}
      </p>

      <div className="mt-[10px] flex flex-wrap gap-[10px]">
        {visibleSlots.length === 0 && (
          <p className="text-[13px] text-red-600">
            Няма зададени часове — посетителите не могат да резервират.
          </p>
        )}
        {visibleSlots.map((time) => (
          <span
            key={time}
            className="flex items-center gap-[10px] rounded-full border-[1.258px] border-[#dddad2] bg-white px-[14px] py-[7px] font-golos text-[14px] font-semibold text-[#3f3f46]"
          >
            {time}
            <button
              type="button"
              aria-label={`Изтрий час ${time}`}
              className="cursor-pointer leading-none text-[#a1a1aa] transition-colors hover:text-red-600"
              onClick={() => tryRemove(time)}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {customEntries.length > 0 && (
        <div className="mt-[20px] border-t border-[#eceae4] pt-[16px]">
          <p className="text-[13px] font-semibold text-ink">
            Дни със собствени часове
          </p>
          <div className="mt-[10px] flex flex-wrap gap-[10px]">
            {customEntries.map(([key, list]) => (
              <span
                key={key}
                className={`flex items-center gap-[10px] rounded-full border-[1.258px] bg-white px-[14px] py-[7px] font-golos text-[13px] text-[#3f3f46] ${
                  selectedDay === key ? "border-forest" : "border-[#7aa2d6]"
                }`}
              >
                <button
                  type="button"
                  title="Редактирай часовете за този ден"
                  onClick={() => {
                    setSelectedDay(key);
                    setError("");
                  }}
                  className="cursor-pointer font-semibold underline-offset-2 transition-colors hover:text-forest hover:underline"
                >
                  {dateLabelFromKey(key)}
                </button>
                <span className="text-[#7aa2d6]">
                  {list.length === 0
                    ? "без часове"
                    : `${list.length} часа: ${list.join(", ")}`}
                </span>
                <button
                  type="button"
                  aria-label={`Върни стандартните часове за ${key}`}
                  title="Върни стандартните часове"
                  className="cursor-pointer leading-none text-[#a1a1aa] transition-colors hover:text-forest"
                  onClick={() => resetDaySlots(key)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-[16px]"
          onClick={() => setPendingDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-[400px] max-w-full rounded-[10px] bg-offwhite p-[28px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-golos text-[18px] font-bold text-ink">
              Изтриване на час {pendingDelete.time}
            </h3>
            <p className="mt-[8px] text-[14px] leading-[1.4] text-[#545454]">
              {dayMode ? (
                <>
                  За {dateLabelFromKey(selectedDay)} в този час има{" "}
                  <span className="font-semibold text-ink">
                    {pendingDelete.count}
                  </span>{" "}
                  резервации. Те се запазват в регистъра, но часът няма да може
                  да се избира за този ден. Останалите дни не се променят.
                </>
              ) : (
                <>
                  За този час има{" "}
                  <span className="font-semibold text-ink">
                    {pendingDelete.count}
                  </span>{" "}
                  резервации. Те се запазват в регистъра, но часът вече няма да
                  може да се избира от посетителите — за всички дни.
                </>
              )}
            </p>
            <div className="mt-[24px] flex justify-end gap-[10px]">
              <button
                type="button"
                className="cursor-pointer rounded-[10px] border border-[#dddad2] px-[20px] py-[9px] text-[14px] font-semibold text-[#3f3f46] transition-colors hover:bg-black/5"
                onClick={() => setPendingDelete(null)}
              >
                Откажи
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-[10px] bg-red-600 px-[20px] py-[9px] text-[14px] font-semibold text-white transition-colors hover:bg-red-700"
                onClick={() => {
                  if (dayMode) removeSlotForDay(selectedDay, pendingDelete.time);
                  else removeSlot(pendingDelete.time);
                  setPendingDelete(null);
                }}
              >
                Да, изтрий
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BlockSection() {
  const [blocked, setBlocked] = useState<string[]>([]);
  const [slots, setSlotsState] = useState<string[]>([]);
  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState(""); // "" = целият ден
  const [blockError, setBlockError] = useState("");

  useEffect(() => {
    const refresh = () => {
      setBlocked(getBlocked());
      setSlotsState(getSlots());
    };
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(blockDate)) {
      setBlockError("Изберете дата.");
      return;
    }
    addBlock(blockTime ? `${blockDate}|${blockTime}` : blockDate);
    setBlockDate("");
    setBlockTime("");
    setBlockError("");
  };

  const entries = [...blocked].sort((a, b) => a.localeCompare(b));

  return (
    <section className="mb-[24px] rounded-[10px] bg-offwhite p-[24px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
      <h2 className="font-golos text-[20px] font-bold text-ink">
        Блокиране на дати и часове
      </h2>
      <p className="mt-[4px] text-[13px] text-[#545454]">
        Блокираните дати и часове стават неактивни в резервацията и не могат да
        бъдат избрани от посетителите.
      </p>

      <form onSubmit={submit} className="mt-[16px] flex flex-wrap items-end gap-[12px]">
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Дата
          <input
            type="date"
            value={blockDate}
            onChange={(e) => {
              setBlockDate(e.target.value);
              setBlockError("");
            }}
            className={`${inputCls} w-[160px]`}
          />
        </label>
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Час
          <select
            value={blockTime}
            onChange={(e) => setBlockTime(e.target.value)}
            className={`${inputCls} w-[130px]`}
          >
            <option value="">Целият ден</option>
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="h-[34px] cursor-pointer rounded-[10px] bg-forest px-[24px] text-[14px] font-semibold text-white transition-colors hover:bg-pine"
        >
          Блокирай
        </button>
        {blockError && <p className="text-[13px] text-red-600">{blockError}</p>}
      </form>

      {entries.length > 0 && (
        <div className="mt-[20px] flex flex-wrap gap-[10px]">
          {entries.map((key) => {
            const [dateKey, time] = key.split("|");
            return (
              <span
                key={key}
                className="flex items-center gap-[10px] rounded-full border border-red-200 bg-red-50 px-[14px] py-[7px] font-golos text-[14px] text-[#3f3f46]"
              >
                <span className="font-semibold">
                  {dateLabelFromKey(dateKey)}
                </span>
                <span className="text-red-600">
                  {time ? `${time} ч · блокиран` : "цял ден · блокиран"}
                </span>
                <button
                  type="button"
                  aria-label={`Отблокирай ${key}`}
                  className="cursor-pointer leading-none text-[#a1a1aa] transition-colors hover:text-forest"
                  onClick={() => removeBlock(key)}
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    const refresh = () => setBookings(getBookings());
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const startEdit = (b: BookingRecord) => {
    setEditingId(b.id);
    setDraft({
      dateKey: b.dateKey,
      time: b.time,
      places: b.places ?? 1,
      name: b.name,
      phone: b.phone,
      email: b.email,
      seats: b.seats ? { ...b.seats } : emptySeats(),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const draftTotal = draft ? priceForSeats(draft.seats) : 0;

  const canSave =
    !!draft &&
    /^\d{4}-\d{2}-\d{2}$/.test(draft.dateKey) &&
    /^\d{2}:\d{2}$/.test(draft.time) &&
    draft.name.trim() !== "";

  const saveEdit = () => {
    if (!draft || !editingId || !canSave) return;
    const original = bookings.find((b) => b.id === editingId);
    if (!original) return;
    updateBooking({
      ...original,
      ...draft,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      dateLabel: dateLabelFromKey(draft.dateKey),
      places: seatsTotal(draft.seats),
      total: draftTotal,
    });
    cancelEdit();
  };

  /** Брой места за конкретен вид седалка при редакция */
  const seatInput = (key: SeatKey, label: string) => (
    <label className="flex items-center gap-[8px] text-[12px] text-[#545454]">
      <span className="w-[92px] shrink-0">{label}</span>
      <input
        type="number"
        min={0}
        max={200}
        value={draft ? draft.seats[key] : 0}
        onChange={(e) => {
          const v = Math.max(0, Number(e.target.value) || 0);
          setDraft((d) => (d ? { ...d, seats: { ...d.seats, [key]: v } } : d));
        }}
        className="h-[34px] w-[76px] shrink-0 rounded-[8px] bg-[rgba(161,161,170,0.15)] px-[8px] text-[13px] text-ink outline-none focus:ring-2 focus:ring-forest/40"
      />
    </label>
  );

  const sortedBookings = [...bookings].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-[60px]">
      {/* Горна лента */}
      <header className="bg-forest">
        <div className="mx-auto flex h-[64px] max-w-[1100px] items-center justify-between px-[16px]">
          <p className="font-golos text-[18px] font-semibold text-white">
            Fun Park Ezero · Админ панел
          </p>
          <button
            type="button"
            className="cursor-pointer rounded-full border border-white/40 px-[18px] py-[6px] font-golos text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
            onClick={onLogout}
          >
            Изход
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-[16px] pt-[24px]">
        {/* Превключвател между календарен и списъчен изглед */}
        <div className="mb-[20px] inline-flex rounded-[10px] bg-offwhite p-[4px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
          {(
            [
              ["calendar", "📅 Календар"],
              ["list", "📋 Списък"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`cursor-pointer rounded-[8px] px-[20px] py-[8px] font-golos text-[14px] font-semibold transition-colors ${
                view === id
                  ? "bg-forest text-white"
                  : "text-[#545454] hover:text-forest"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {view === "calendar" && (
          <>
            <AdminCalendar />
            {/* цените са достъпни и от двата изгледа */}
            <PricesSection />
          </>
        )}

        {view === "list" && (
          <>
            <SlotsSection />
            <CapacitySection />
            <PricesSection />
            <BlockSection />

        {/* Регистър */}
        <section className="rounded-[10px] bg-offwhite p-[24px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
          <h2 className="font-golos text-[20px] font-bold text-ink">
            Регистър
            <span className="ml-[10px] font-golos text-[14px] font-medium text-[#a1a1aa]">
              {bookings.length} общо
            </span>
          </h2>

          {sortedBookings.length === 0 ? (
            <p className="mt-[16px] text-[14px] text-[#545454]">
              Още няма направени резервации.
            </p>
          ) : (
            <div className="mt-[16px] overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-[#eceae4] font-golos text-[12px] uppercase tracking-[0.6px] text-[#a1a1aa]">
                    <th className="py-[10px] pr-[12px]">№</th>
                    <th className="py-[10px] pr-[12px]">Дата</th>
                    <th className="py-[10px] pr-[12px]">Час</th>
                    <th className="py-[10px] pr-[12px]">Места</th>
                    <th className="py-[10px] pr-[12px]">Седалка</th>
                    <th className="py-[10px] pr-[12px]">Име</th>
                    <th className="py-[10px] pr-[12px]">Телефон</th>
                    <th className="py-[10px] pr-[12px]">Имейл</th>
                    <th className="py-[10px] pr-[12px]">Билети</th>
                    <th className="py-[10px] pr-[12px]">Сума</th>
                    <th className="py-[10px] pr-[12px]">Направена на</th>
                    <th className="py-[10px] pr-[12px]">Статус</th>
                    <th className="py-[10px]" />
                  </tr>
                </thead>
                <tbody>
                  {sortedBookings.map((b) => {
                    const isEditing = editingId === b.id && draft !== null;
                    return (
                      <tr
                        key={b.id}
                        className={`border-b border-[#eceae4] align-middle text-ink ${
                          isEditing ? "bg-[rgba(244,198,63,0.08)]" : ""
                        }`}
                      >
                        <td className="py-[12px] pr-[12px] font-golos font-medium text-forest">
                          {b.id}
                        </td>
                        <td className="py-[12px] pr-[12px]">
                          {isEditing ? (
                            <input
                              type="date"
                              value={draft.dateKey}
                              onChange={(e) => setField("dateKey", e.target.value)}
                              className={`${inputCls} w-[140px]`}
                            />
                          ) : (
                            b.dateLabel
                          )}
                        </td>
                        <td className="py-[12px] pr-[12px]">
                          {isEditing ? (
                            <input
                              type="time"
                              value={draft.time}
                              onChange={(e) => setField("time", e.target.value)}
                              className={`${inputCls} w-[96px]`}
                            />
                          ) : (
                            b.time
                          )}
                        </td>
                        <td className="py-[12px] pr-[12px]">
                          {isEditing ? (
                            <input
                              type="number"
                              min={1}
                              max={200}
                              value={draft.places}
                              onChange={(e) =>
                                setField(
                                  "places",
                                  Math.max(1, Number(e.target.value) || 1)
                                )
                              }
                              className={`${inputCls} w-[64px]`}
                            />
                          ) : (
                            (b.places ?? 1)
                          )}
                        </td>
                        <td className="py-[12px] pr-[12px] whitespace-nowrap">
                          {b.seats
                            ? SEAT_TYPES.filter((s) => b.seats[s.key] > 0)
                                .map((s) => `${s.label} ×${b.seats[s.key]}`)
                                .join(", ") || "—"
                            : "—"}
                        </td>
                        <td className="py-[12px] pr-[12px]">
                          {isEditing ? (
                            <input
                              type="text"
                              value={draft.name}
                              onChange={(e) => setField("name", e.target.value)}
                              className={`${inputCls} min-w-[120px]`}
                            />
                          ) : (
                            <>
                              {b.name}
                              {/* персонализация от стъпка „Плащане“ */}
                              {(b.giftFor || b.giftMessage) && (
                                <span className="mt-[4px] block max-w-[190px] text-[11.5px] leading-[1.4] text-[#8a6d1a]">
                                  {b.giftFor && <>🎁 За: {b.giftFor}</>}
                                  {b.giftMessage && (
                                    <span className="block italic">
                                      „{b.giftMessage}“
                                    </span>
                                  )}
                                </span>
                              )}
                            </>
                          )}
                        </td>
                        <td className="py-[12px] pr-[12px]">
                          {isEditing ? (
                            <input
                              type="tel"
                              value={draft.phone}
                              onChange={(e) => setField("phone", e.target.value)}
                              className={`${inputCls} min-w-[110px]`}
                            />
                          ) : (
                            b.phone
                          )}
                        </td>
                        <td className="py-[12px] pr-[12px]">
                          {isEditing ? (
                            <input
                              type="email"
                              value={draft.email}
                              onChange={(e) => setField("email", e.target.value)}
                              className={`${inputCls} min-w-[150px]`}
                            />
                          ) : (
                            b.email
                          )}
                        </td>
                        <td className="py-[12px] pr-[12px]">
                          {isEditing ? (
                            <div className="flex flex-col gap-[6px]">
                              {SEAT_TYPES.map((s) => (
                                <div key={s.key}>{seatInput(s.key, s.label)}</div>
                              ))}
                            </div>
                          ) : (
                            ticketsLabel(b)
                          )}
                        </td>
                        <td className="py-[12px] pr-[12px] font-semibold">
                          {isEditing
                            ? `${draftTotal.toLocaleString("bg-BG")} ${CURRENCY}`
                            : `${b.total.toLocaleString("bg-BG")} ${CURRENCY}`}
                        </td>
                        <td className="py-[12px] pr-[12px] text-[#545454]">
                          {new Date(b.createdAt).toLocaleString("bg-BG", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="py-[12px] pr-[12px] whitespace-nowrap">
                          {b.confirmed ? (
                            <span className="inline-flex items-center gap-[5px] rounded-full bg-[rgba(106,142,78,0.15)] px-[10px] py-[4px] text-[12px] font-semibold text-forest">
                              ✓ Потвърдена
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-[rgba(244,198,63,0.2)] px-[10px] py-[4px] text-[12px] font-semibold text-[#8a6d1a]">
                              Чакаща
                            </span>
                          )}
                        </td>
                        <td className="py-[12px]">
                          {b.confirmed ? (
                            <span className="text-[12px] text-[#a1a1aa]">
                              🔒 Заключена
                            </span>
                          ) : isEditing ? (
                            <div className="flex flex-col gap-[6px]">
                              <button
                                type="button"
                                disabled={!canSave}
                                className={`rounded-[8px] bg-forest px-[12px] py-[5px] text-[12px] font-semibold text-white transition-colors ${
                                  canSave
                                    ? "cursor-pointer hover:bg-pine"
                                    : "cursor-not-allowed opacity-50"
                                }`}
                                onClick={saveEdit}
                              >
                                Запази
                              </button>
                              <button
                                type="button"
                                className="cursor-pointer rounded-[8px] border border-[#dddad2] px-[12px] py-[5px] text-[12px] font-semibold text-[#3f3f46] transition-colors hover:bg-black/5"
                                onClick={cancelEdit}
                              >
                                Отказ
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-[6px]">
                              <button
                                type="button"
                                className="cursor-pointer rounded-[8px] bg-forest px-[12px] py-[5px] text-[12px] font-semibold text-white transition-colors hover:bg-pine"
                                onClick={() => setConfirmId(b.id)}
                              >
                                Потвърди
                              </button>
                              <button
                                type="button"
                                className="cursor-pointer rounded-[8px] border border-[#dddad2] px-[12px] py-[5px] text-[12px] font-semibold text-[#3f3f46] transition-colors hover:border-forest hover:text-forest"
                                onClick={() => startEdit(b)}
                              >
                                Редактирай
                              </button>
                              <button
                                type="button"
                                className="cursor-pointer rounded-[8px] border border-red-200 px-[12px] py-[5px] text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                                onClick={() => deleteBooking(b.id)}
                              >
                                Изтрий
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
          </>
        )}
      </main>

      {/* Попъп за потвърждение */}
      {confirmId && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-[16px]"
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
                className="cursor-pointer rounded-[10px] border border-[#dddad2] px-[20px] py-[9px] text-[14px] font-semibold text-[#3f3f46] transition-colors hover:bg-black/5"
                onClick={() => setConfirmId(null)}
              >
                Откажи
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-[10px] bg-forest px-[20px] py-[9px] text-[14px] font-semibold text-white transition-colors hover:bg-pine"
                onClick={() => {
                  confirmBooking(confirmId);
                  setConfirmId(null);
                }}
              >
                Да, потвърди
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Екран за вход — панелът се достъпва само през директния линк */
function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-[16px]">
      <form
        onSubmit={submit}
        className="flex w-[400px] max-w-full flex-col items-center rounded-[10px] bg-offwhite px-[32px] py-[40px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]"
      >
        <Logo className="h-[49px] w-[71px]" />
        <h1 className="mt-[20px] font-golos text-[25px] font-bold text-ink">
          Админ панел
        </h1>
        <p className="mt-[6px] text-[14px] text-[#545454]">
          Влезте, за да управлявате резервациите
        </p>

        <label className="mt-[28px] w-full font-golos text-[14px] font-medium text-ink">
          Име
        </label>
        <input
          type="text"
          value={user}
          onChange={(e) => {
            setUser(e.target.value);
            setError(false);
          }}
          autoFocus
          className="mt-[8px] h-[41px] w-full rounded-[9px] bg-[rgba(161,161,170,0.15)] px-[12px] text-[16px] text-ink outline-none focus:ring-2 focus:ring-forest/40"
        />

        <label className="mt-[16px] w-full font-golos text-[14px] font-medium text-ink">
          Парола
        </label>
        <input
          type="password"
          value={pass}
          onChange={(e) => {
            setPass(e.target.value);
            setError(false);
          }}
          className="mt-[8px] h-[41px] w-full rounded-[9px] bg-[rgba(161,161,170,0.15)] px-[12px] text-[16px] text-ink outline-none focus:ring-2 focus:ring-forest/40"
        />

        {error && (
          <p className="mt-[12px] w-full text-[13px] text-red-600">
            Грешно име или парола. Опитайте отново.
          </p>
        )}

        <button
          type="submit"
          className="mt-[24px] w-full cursor-pointer rounded-[10px] bg-sun py-[10px] text-[15px] font-semibold leading-[20px] text-black/80 transition-colors hover:bg-[#e0b32f]"
        >
          Вход
        </button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setAuthed(isAdminAuthed());
    setReady(true);
  }, []);

  if (!ready) return null;

  return authed ? (
    <AdminPanel
      onLogout={() => {
        sessionStorage.removeItem(AUTH_KEY);
        router.replace("/");
      }}
    />
  ) : (
    <LoginScreen onSuccess={() => setAuthed(true)} />
  );
}
