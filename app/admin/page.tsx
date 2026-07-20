"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TICKET_PRICES,
  deleteBooking,
  getBookings,
  subscribeToStore,
  updateBooking,
  type BookingRecord,
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
  name: string;
  phone: string;
  email: string;
  adult: number;
  child: number;
  small: number;
};

const inputCls =
  "h-[34px] w-full rounded-[8px] bg-[rgba(161,161,170,0.15)] px-[8px] text-[13px] text-ink outline-none focus:ring-2 focus:ring-forest/40";

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

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
    <label className="flex items-center gap-[6px] text-[12px] text-[#545454]">
      <span className="w-[38px]">{label}</span>
      <input
        type="number"
        min={0}
        max={20}
        value={draft ? draft[key] : 0}
        onChange={(e) =>
          setField(key, Math.max(0, Math.min(20, Number(e.target.value) || 0)))
        }
        className={`${inputCls} w-[58px]`}
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
                    <th className="py-[10px] pr-[12px]">Име</th>
                    <th className="py-[10px] pr-[12px]">Телефон</th>
                    <th className="py-[10px] pr-[12px]">Имейл</th>
                    <th className="py-[10px] pr-[12px]">Билети</th>
                    <th className="py-[10px] pr-[12px]">Сума</th>
                    <th className="py-[10px] pr-[12px]">Направена на</th>
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
                        <td className="py-[12px]">
                          {isEditing ? (
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
