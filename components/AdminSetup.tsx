"use client";

/**
 * Настройки на резервациите в админ панела:
 *  · Категории места — създаване, преименуване, брой места, цена, изтриване
 *  · Сесии — часове, които важат всеки ден от определен период („до 30.08.26“)
 *  · Блокирани места — колко места от категория са заети от лична резервация
 *
 * Часовете са напълно свободни (без предварително зададени интервали).
 */

import { useEffect, useState } from "react";
import {
  CURRENCY,
  addCategory,
  addSchedule,
  getDeliveryFees,
  setDeliveryFees,
  type DeliveryFees,
  clearSeatBlocks,
  countBookingsWithCategory,
  getCategories,
  getSchedules,
  getSeatBlockMap,
  getSeatBlocks,
  getSlotsForDay,
  isValidSlot,
  removeCategory,
  removeSchedule,
  seatLabel,
  setSeatBlock,
  subscribeToStore,
  updateCategory,
  type SeatCategory,
  type SessionPlan,
} from "@/lib/bookingStore";

const inputCls =
  "h-[34px] rounded-[8px] bg-[rgba(161,161,170,0.15)] px-[10px] text-[13px] text-ink outline-none focus:ring-2 focus:ring-forest/40";
const btnPrimary =
  "h-[34px] cursor-pointer rounded-[10px] bg-sun px-[20px] text-[14px] font-semibold text-black/80 transition-colors hover:bg-[#e0b32f] disabled:cursor-not-allowed disabled:opacity-60";
const btnGhost =
  "h-[30px] cursor-pointer rounded-[8px] border border-[#dddad2] px-[12px] text-[12px] font-semibold text-[#3f3f46] transition-colors hover:border-forest hover:text-forest";
const sectionCls =
  "mb-[24px] rounded-[10px] bg-offwhite p-[24px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]";

const dateLabel = (key: string) => {
  const [y, m, d] = key.split("-");
  return `${Number(d)}.${m}.${y?.slice(2)}`;
};

/* ------------------------------------------------------- категории места */

export function CategoriesSection() {
  const [cats, setCats] = useState<SeatCategory[]>([]);
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    cat: SeatCategory;
    used: number;
  } | null>(null);

  useEffect(() => {
    const refresh = () => setCats(getCategories());
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim() === "") {
      setError("Въведете име на категорията.");
      return;
    }
    if (cats.some((c) => c.label.trim().toLowerCase() === label.trim().toLowerCase())) {
      setError("Вече има категория с това име.");
      return;
    }
    // местата не се задават тук — идват с часа
    addCategory(label, 0, Number(price.replace(",", ".")) || 0);
    setLabel("");
    setPrice("");
    setError("");
  };

  const askRemove = (cat: SeatCategory) =>
    setPendingDelete({ cat, used: countBookingsWithCategory(cat.id) });


  return (
    <section className={sectionCls}>
      <h2 className="font-golos text-[20px] font-bold text-ink">Категории места</h2>
      <p className="mt-[4px] text-[13px] text-[#545454]">
        Категориите определят какво избира клиентът при резервация — име и цена
        на едно място. Броят места се задава при добавяне на час, в секция
        „Сесии“ или за конкретен ден/час.
      </p>

      <form onSubmit={add} className="mt-[16px] flex flex-wrap items-end gap-[10px]">
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Име
          <input
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              setError("");
            }}
            placeholder="напр. Деца до 12 г."
            className={`${inputCls} w-[200px]`}
          />
        </label>
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Цена ({CURRENCY})
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className={`${inputCls} w-[90px]`}
          />
        </label>
        <button type="submit" className={btnPrimary}>
          Добави категория
        </button>
        {error && (
          <p className="w-full text-[13px] font-semibold text-red-600">{error}</p>
        )}
      </form>

      {cats.length === 0 ? (
        <p className="mt-[16px] rounded-[8px] bg-[rgba(244,198,63,0.18)] px-[12px] py-[10px] text-[13px] font-medium text-ink">
          Няма нито една категория — клиентите не могат да резервират, докато не
          създадете поне една.
        </p>
      ) : (
        <div className="mt-[18px] flex flex-col gap-[8px]">
          {cats.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-end gap-[10px] rounded-[8px] bg-white px-[12px] py-[10px]"
            >
              <label className="flex flex-col gap-[3px] text-[11px] font-medium text-[#545454]">
                Име
                <input
                  value={c.label}
                  onChange={(e) => updateCategory(c.id, { label: e.target.value })}
                  className={`${inputCls} w-[190px]`}
                />
              </label>
              <label className="flex flex-col gap-[3px] text-[11px] font-medium text-[#545454]">
                Цена ({CURRENCY})
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={c.price}
                  onChange={(e) =>
                    updateCategory(c.id, {
                      price: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className={`${inputCls} w-[96px]`}
                />
              </label>
              <button
                type="button"
                onClick={() => askRemove(c)}
                className={`${btnGhost} hover:border-red-400 hover:text-red-600`}
              >
                Изтрий
              </button>
            </div>
          ))}
          <p className="text-[12px] text-[#545454]">
            Местата за всяка категория се задават при часа — в календара с
            „Задай места“, или за цял период чрез „до дата“.
          </p>
        </div>
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-[16px]"
          onClick={() => setPendingDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-[420px] max-w-full rounded-[11px] bg-offwhite p-[24px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-golos text-[18px] font-bold text-ink">
              Да изтрия ли „{pendingDelete.cat.label}“?
            </h3>
            <p className="mt-[8px] text-[13px] leading-[1.6] text-[#545454]">
              {pendingDelete.used > 0
                ? `Има ${pendingDelete.used} резервации с тази категория. Те се запазват, но категорията ще изчезне от резервационната форма.`
                : "Категорията ще изчезне от резервационната форма."}
            </p>
            <div className="mt-[20px] flex justify-end gap-[10px]">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className={btnGhost}
              >
                Отказ
              </button>
              <button
                type="button"
                onClick={() => {
                  removeCategory(pendingDelete.cat.id);
                  setPendingDelete(null);
                }}
                className="h-[30px] cursor-pointer rounded-[8px] bg-red-600 px-[14px] text-[12px] font-semibold text-white transition-colors hover:bg-red-700"
              >
                Изтрий
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* --------------------------------------------------- сесии с валидност */

export function SessionsSection() {
  const [plans, setPlans] = useState<SessionPlan[]>([]);
  const [cats, setCats] = useState<SeatCategory[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState("");
  const [caps, setCaps] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    const refresh = () => {
      setPlans(getSchedules());
      setCats(getCategories());
    };
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const capsTotal = cats.reduce((s, c) => s + (Number(caps[c.id]) || 0), 0);

  const addTime = () => {
    if (!isValidSlot(newTime)) {
      setError("Въведете валиден час.");
      return;
    }
    if (times.includes(newTime)) {
      setError("Този час вече е в списъка.");
      return;
    }
    setTimes([...times, newTime].sort());
    setNewTime("");
    setError("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      setError("Изберете период от – до.");
      return;
    }
    if (to < from) {
      setError("Крайната дата е преди началната.");
      return;
    }
    if (times.length === 0) {
      setError("Добавете поне един час.");
      return;
    }
    if (cats.length > 0 && capsTotal === 0) {
      setError("Задайте брой места поне за една категория.");
      return;
    }
    const plan = addSchedule({
      from,
      to,
      times,
      caps: Object.fromEntries(
        cats.map((c) => [c.id, Math.max(0, Number(caps[c.id]) || 0)]),
      ),
      note,
    });
    if (!plan) {
      setError("Сесията не можа да се запише.");
      return;
    }
    setSaved(
      `Часовете важат от ${dateLabel(from)} до ${dateLabel(to)} с ${capsTotal} места.`,
    );
    setTimes([]);
    setCaps({});
    setNote("");
    setError("");
    window.setTimeout(() => setSaved(""), 4000);
  };

  return (
    <section className={sectionCls}>
      <h2 className="font-golos text-[20px] font-bold text-ink">Сесии (часове по период)</h2>
      <p className="mt-[4px] text-[13px] text-[#545454]">
        Задавате часовете за деня и до коя дата важат. Часовете се прехвърлят
        автоматично на всеки ден от периода. Когато след определена дата има
        промяна, добавете нова сесия с по-късно начало — тя измества старата за
        своя период.
      </p>

      <form onSubmit={submit} className="mt-[16px] flex flex-col gap-[12px]">
        <div className="flex flex-wrap items-end gap-[10px]">
          <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
            От дата
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setError("");
              }}
              className={`${inputCls} w-[160px]`}
            />
          </label>
          <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
            До дата (включително)
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setError("");
              }}
              className={`${inputCls} w-[160px]`}
            />
          </label>
          <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
            Бележка (по избор)
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="напр. летен график"
              className={`${inputCls} w-[200px]`}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-[10px]">
          <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
            Час{" "}
            <span className="text-[11px] font-normal text-[#a1a1aa]">
              (свободен, без ограничение)
            </span>
            <input
              type="time"
              value={newTime}
              onChange={(e) => {
                setNewTime(e.target.value);
                setError("");
              }}
              className={`${inputCls} w-[130px]`}
            />
          </label>
          <button type="button" onClick={addTime} className={btnPrimary}>
            Добави час
          </button>
          {times.length > 0 && (
            <div className="flex flex-wrap items-center gap-[6px]">
              {times.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-[6px] rounded-full bg-white px-[10px] py-[5px] text-[12px] font-semibold text-ink"
                >
                  {t}
                  <button
                    type="button"
                    aria-label={`Премахни ${t}`}
                    onClick={() => setTimes(times.filter((x) => x !== t))}
                    className="cursor-pointer text-[12px] text-[#a1a1aa] transition-colors hover:text-red-600"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Места за тези часове — задават се заедно с часа */}
        <div className="flex flex-wrap items-end gap-[10px] rounded-[8px] bg-white px-[12px] py-[10px]">
          <span className="w-full text-[12px] font-semibold text-ink">
            Места за тези часове
          </span>
          {cats.length === 0 ? (
            <span className="text-[12px] text-[#545454]">
              Първо създайте категории в секция „Категории места“.
            </span>
          ) : (
            <>
              {cats.map((c) => (
                <label
                  key={c.id}
                  className="flex flex-col gap-[3px] text-[11px] font-medium text-[#545454]"
                >
                  {c.label}
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={caps[c.id] ?? ""}
                    onChange={(e) => {
                      setCaps((v) => ({ ...v, [c.id]: e.target.value }));
                      setError("");
                    }}
                    placeholder="0"
                    className={`${inputCls} w-[92px]`}
                  />
                </label>
              ))}
              <span className="text-[12px] font-semibold text-forest">
                Общо: {capsTotal}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-[12px]">
          <button type="submit" className={btnPrimary}>
            Запази сесията
          </button>
          {error && (
            <p className="text-[13px] font-semibold text-red-600">{error}</p>
          )}
          {saved && <p className="text-[13px] font-semibold text-forest">{saved}</p>}
        </div>
      </form>

      <div className="mt-[18px] flex flex-col gap-[8px]">
        {plans.length === 0 ? (
          <p className="text-[13px] text-[#545454]">
            Още няма сесии. Докато няма, важат стандартните часове (ако са
            зададени) или часовете за конкретния ден.
          </p>
        ) : (
          [...plans]
            .sort((a, b) => a.from.localeCompare(b.from))
            .map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-[10px] rounded-[8px] bg-white px-[12px] py-[10px] text-[13px]"
              >
                <span className="font-semibold text-ink">
                  {dateLabel(p.from)} – {dateLabel(p.to)}
                </span>
                <span className="text-forest">
                  {p.times.length} {p.times.length === 1 ? "час" : "часа"}:{" "}
                  {p.times.join(", ")}
                </span>
                {p.caps && (
                  <span className="text-[12px] text-[#545454]">
                    {Object.values(p.caps).reduce((s, n) => s + (n || 0), 0)} места (
                    {Object.entries(p.caps)
                      .filter(([, n]) => (n ?? 0) > 0)
                      .map(([id, n]) => `${seatLabel(id)}: ${n}`)
                      .join(" · ")}
                    )
                  </span>
                )}
                {p.note && (
                  <span className="text-[12px] text-[#a1a1aa]">{p.note}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeSchedule(p.id)}
                  className={`${btnGhost} ml-auto hover:border-red-400 hover:text-red-600`}
                >
                  Изтрий
                </button>
              </div>
            ))
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------- блокирани места */

export function SeatBlocksSection() {
  const [cats, setCats] = useState<SeatCategory[]>([]);
  const [map, setMap] = useState<Record<string, Record<string, { count: number; reason?: string }>>>(
    {},
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState(""); // "" = целият ден
  const [catId, setCatId] = useState("");
  const [count, setCount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => {
      setCats(getCategories());
      setMap(getSeatBlockMap());
    };
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const daySlots = date ? getSlotsForDay(date) : [];
  const activeCat = catId || cats[0]?.id || "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("Изберете дата.");
      return;
    }
    if (!activeCat) {
      setError("Първо създайте категория места.");
      return;
    }
    const n = Math.max(0, Number(count) || 0);
    setSeatBlock(date, time || null, activeCat, n, reason);
    setCount("");
    setReason("");
    setError("");
  };

  const entries = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));

  return (
    <section className={sectionCls}>
      <h2 className="font-golos text-[20px] font-bold text-ink">Блокирани места</h2>
      <p className="mt-[4px] text-[13px] text-[#545454]">
        Когато имате лична резервация, запазете местата тук — те изчезват от
        наличността на сайта, но остават видими за вас заедно с причината.
        Блокирането за конкретен час важи само за него; без избран час важи за
        целия ден.
      </p>

      <form onSubmit={submit} className="mt-[16px] flex flex-wrap items-end gap-[10px]">
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Дата
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setTime("");
              setError("");
            }}
            className={`${inputCls} w-[160px]`}
          />
        </label>
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Час
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`${inputCls} w-[140px]`}
          >
            <option value="">Целият ден</option>
            {daySlots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Категория
          <select
            value={activeCat}
            onChange={(e) => setCatId(e.target.value)}
            className={`${inputCls} w-[190px]`}
          >
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Блокирани места
          <input
            type="number"
            min={0}
            max={500}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="0"
            className={`${inputCls} w-[110px]`}
          />
        </label>
        <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
          Причина (по избор)
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="напр. лична резервация"
            className={`${inputCls} w-[200px]`}
          />
        </label>
        <button type="submit" className={btnPrimary}>
          Запази
        </button>
        {error && (
          <p className="w-full text-[13px] font-semibold text-red-600">{error}</p>
        )}
        <p className="w-full text-[12px] text-[#a1a1aa]">
          0 места премахва блокировката.
        </p>
      </form>

      <div className="mt-[18px] flex flex-col gap-[8px]">
        {entries.length === 0 ? (
          <p className="text-[13px] text-[#545454]">Няма блокирани места.</p>
        ) : (
          entries.map(([key, blocks]) => {
            const [dateKey, slot] = key.split("|");
            return (
              <div
                key={key}
                className="flex flex-wrap items-center gap-[10px] rounded-[8px] bg-white px-[12px] py-[10px] text-[13px]"
              >
                <span className="font-semibold text-ink">{dateLabel(dateKey)}</span>
                <span className="text-ink">{slot ? `${slot} ч` : "целият ден"}</span>
                <span className="text-forest">
                  {Object.entries(blocks)
                    .map(
                      ([id, b]) =>
                        `${seatLabel(id)}: ${b.count}${b.reason ? ` (${b.reason})` : ""}`,
                    )
                    .join(" · ")}
                </span>
                <button
                  type="button"
                  onClick={() => clearSeatBlocks(dateKey, slot ?? null)}
                  className={`${btnGhost} ml-auto hover:border-red-400 hover:text-red-600`}
                >
                  Изчисти
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------- вид на билета */

/** Приема „1,99“ и „1.99“; връща null при невалидна стойност */
const parseFee = (v: string) => {
  const raw = v.trim().replace(",", ".");
  if (raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 10000) return null;
  return Math.round(n * 100) / 100;
};

const feeLabel = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");

export function TicketDeliverySection() {
  const [fees, setFees] = useState<DeliveryFees>({ digitalFee: 0, printedFee: 0 });
  const [draft, setDraft] = useState({ digitalFee: "", printedFee: "" });
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const f = getDeliveryFees();
      setFees(f);
      setDirty((isDirty) => {
        if (!isDirty) {
          setDraft({
            digitalFee: feeLabel(f.digitalFee),
            printedFee: feeLabel(f.printedFee),
          });
        }
        return isDirty;
      });
    };
    refresh();
    return subscribeToStore(refresh);
  }, []);

  const parsedDigital = parseFee(draft.digitalFee);
  const parsedPrinted = parseFee(draft.printedFee);
  const canSave = dirty && parsedDigital !== null && parsedPrinted !== null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setDeliveryFees({
      digitalFee: parsedDigital as number,
      printedFee: parsedPrinted as number,
    });
    setDirty(false);
    setSaved(true);
  };

  const field = (
    key: "digitalFee" | "printedFee",
    label: string,
    hint: string,
  ) => {
    const invalid = parseFee(draft[key]) === null;
    return (
      <label className="flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]">
        {label} ({CURRENCY})
        <span className="text-[11px] font-normal text-[#a1a1aa]">{hint}</span>
        <input
          type="text"
          inputMode="decimal"
          value={draft[key]}
          onChange={(e) => {
            setDraft((d) => ({ ...d, [key]: e.target.value }));
            setDirty(true);
            setSaved(false);
          }}
          className={`${inputCls} w-[150px] font-semibold ${
            invalid ? "text-red-600 ring-2 ring-red-400" : "text-ink"
          }`}
        />
      </label>
    );
  };

  return (
    <section className={sectionCls}>
      <h2 className="font-golos text-[20px] font-bold text-ink">Вид на билета</h2>
      <p className="mt-[4px] text-[13px] text-[#545454]">
        На последната стъпка клиентът избира дали билетът да е дигитален или
        печатен. Таксата тук се начислява{" "}
        <strong className="font-semibold text-ink">
          еднократно за цялата резервация
        </strong>{" "}
        — билетът е един, независимо колко места съдържа. Например 5 места с
        печатен билет = цената на местата + една такса от {feeLabel(fees.printedFee)}{" "}
        {CURRENCY}. Стойност 0 означава без такса.
      </p>

      <form onSubmit={save} className="mt-[16px] flex flex-wrap items-end gap-[12px]">
        {field("digitalFee", "Дигитален билет", "изпраща се по имейл")}
        {field("printedFee", "Печатен билет", "разпечатва се на касата")}
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
        {!canSave && dirty && (
          <p className="w-full text-[13px] font-semibold text-red-600">
            Проверете стойностите — приемат се числа с до две стотинки.
          </p>
        )}
        {saved && (
          <p className="w-full text-[13px] font-semibold text-forest">
            Таксите са запазени.
          </p>
        )}
      </form>

      <div className="mt-[16px] flex flex-wrap items-center gap-[8px]">
        <span className="rounded-full bg-white px-[12px] py-[6px] text-[13px] text-[#3f3f46]">
          Дигитален:{" "}
          <span className="font-semibold text-forest">
            {fees.digitalFee === 0 ? "без такса" : `+${feeLabel(fees.digitalFee)} ${CURRENCY}`}
          </span>
        </span>
        <span className="rounded-full bg-white px-[12px] py-[6px] text-[13px] text-[#3f3f46]">
          Печатен:{" "}
          <span className="font-semibold text-forest">
            {fees.printedFee === 0 ? "без такса" : `+${feeLabel(fees.printedFee)} ${CURRENCY}`}
          </span>
        </span>
      </div>
    </section>
  );
}

/** Показва колко места са блокирани за дата+час — ползва се и в календара */
export const blockedSummary = (dateKey: string, time?: string | null) => {
  const blocks = getSeatBlocks(dateKey, time ?? null);
  const entries = Object.entries(blocks);
  if (entries.length === 0) return "";
  return entries
    .map(([id, b]) => `${seatLabel(id)}: ${b.count}`)
    .join(" · ");
};
