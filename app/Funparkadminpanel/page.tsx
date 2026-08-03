"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SLOT_CAPACITY,
  TICKET_PRICES,
  addBlock,
  deleteBooking,
  getBlocked,
  getBookings,
  getCapacityOverrides,
  getSlots,
  SEAT_TYPES,
  confirmBooking,
  removeBlock,
  removeCapacityOverride,
  seatsTotal,
  setCapacityFor,
  subscribeToStore,
  updateBooking,
  type BookingRecord,
  type SeatCounts,
  type SeatKey,
} from "@/lib/bookingStore";
import { AUTH_KEY, isAdminAuthed } from "@/lib/adminAuth";
import { monthNamesLower } from "@/components/calendarData";

function ticketsLabel(b: BookingRecord) {
  return [
    b.adult > 0 && `${b.adult} възр.`,
    b.child > 0 && `${b.child} деца`,
    b.small > 0 && `${b.small} под 5`,
  ]
    .filter(Boolean)
    .join(" · ");
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
  adult: number;
  child: number;
  small: number;
};

const inputCls =
  "h-[34px] w-full rounded-[8px] bg-[rgba(161,161,170,0.15)] px-[8px] text-[13px] text-ink outline-none focus:ring-2 focus:ring-forest/40";

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
      adult: b.adult,
      child: b.child,
      small: b.small,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const draftTotal = draft
    ? draft.adult * TICKET_PRICES.adult +
      draft.child * TICKET_PRICES.child +
      draft.small * TICKET_PRICES.small
    : 0;

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
      total: draftTotal,
    });
    cancelEdit();
  };

  const numberInput = (key: "adult" | "child" | "small", label: string) => (
    <label className="flex items-center gap-[8px] text-[12px] text-[#545454]">
      <span className="w-[42px] shrink-0">{label}</span>
      <input
        type="number"
        min={0}
        max={20}
        value={draft ? draft[key] : 0}
        onChange={(e) =>
          setField(key, Math.max(0, Math.min(20, Number(e.target.value) || 0)))
        }
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
        <CapacitySection />
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
                            b.name
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
                              {numberInput("adult", "възр.")}
                              {numberInput("child", "деца")}
                              {numberInput("small", "под 5")}
                            </div>
                          ) : (
                            ticketsLabel(b)
                          )}
                        </td>
                        <td className="py-[12px] pr-[12px] font-semibold">
                          {isEditing ? `${draftTotal} лв` : `${b.total} лв`}
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

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAdminAuthed()) {
      setAuthed(true);
    } else {
      // без вход панелът не се показва — обратно към сайта
      router.replace("/");
    }
  }, [router]);

  if (!authed) return null;

  return (
    <AdminPanel
      onLogout={() => {
        sessionStorage.removeItem(AUTH_KEY);
        router.replace("/");
      }}
    />
  );
}
