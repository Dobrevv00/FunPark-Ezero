"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getMonthWeeks,
  monthNames,
  monthNamesLower,
  weekdayNames,
  weekdays,
} from "./calendarData";
import {
  SEAT_TYPES,
  countBookings,
  countSeat,
  emptySeats,
  getBlockedDaySet,
  getBookings,
  getCapacityFor,
  getSlots,
  isSlotBlocked,
  seatCap,
  seatLabel,
  seatsTotal,
  tryBook,
  type BookingRecord,
  type SeatCounts,
  type SeatKey,
} from "@/lib/bookingStore";
import { isValidBgPhone, isValidEmail } from "@/lib/validation";

export type SelectedDate = { y: number; m: number; d: number };

const BookingModalContext = createContext<{
  open: (date?: SelectedDate) => void;
}>({
  open: () => {},
});

export const useBookingModal = () => useContext(BookingModalContext);

const dateLegend = [
  { icon: "/icons/legend-selected.svg", label: "Избран" },
  { icon: "/icons/legend-today.svg", label: "Днес" },
  { icon: "/icons/legend-busy.svg", label: "Зает" },
];

const timeLegend = [
  { icon: "/icons/legend-selected.svg", label: "Избран" },
  { icon: "/icons/legend-today.svg", label: "Свободен" },
  { icon: "/icons/legend-busy.svg", label: "Зает" },
];

const ticketTypes = [
  { key: "adult", name: "Възрастен", desc: "18+ години · 28 лв", price: 28 },
  { key: "child", name: "Дете", desc: "5 – 17 години · 16 лв", price: 16 },
  { key: "small", name: "Дете под 5", desc: "Безплатно с възрастен", price: 0 },
] as const;

type TicketKey = (typeof ticketTypes)[number]["key"];

/** Ширини от дизайна (139/280/419/511px спрямо лента от 556px) — в проценти, за да са верни и на тесен екран */
const progressWidths = ["25%", "50.4%", "75.4%", "91.9%"];

function Legend({ items }: { items: { icon: string; label: string }[] }) {
  return (
    <div className="flex gap-[22px]">
      {items.map((l) => (
        <div key={l.label} className="flex items-center gap-[8px]">
          <img src={l.icon} alt="" className="size-[13px]" />
          <span className="font-golos text-[14.388px] text-[#3f3f46]">
            {l.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Modal({
  onClose,
  initialDate,
}: {
  onClose: () => void;
  initialDate: SelectedDate | null;
}) {
  const [step, setStep] = useState(1);
  const now = useMemo(() => new Date(), []);
  const [view, setView] = useState(
    initialDate
      ? { y: initialDate.y, m: initialDate.m }
      : { y: now.getFullYear(), m: now.getMonth() }
  );
  const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(
    initialDate
  );
  const [slots] = useState<string[]>(() => getSlots());
  const [bookings, setBookings] = useState<BookingRecord[]>(() => getBookings());
  const [selectedSlot, setSelectedSlot] = useState(() => {
    const s = getSlots();
    return s.includes("10:30") ? "10:30" : (s[0] ?? "");
  });
  const [seatQty, setSeatQty] = useState<SeatCounts>(emptySeats);
  const [availabilityError, setAvailabilityError] = useState("");

  const slotRows = useMemo(() => {
    const rows: string[][] = [];
    for (let i = 0; i < slots.length; i += 4) rows.push(slots.slice(i, i + 4));
    return rows;
  }, [slots]);

  const dateKey = selectedDate
    ? `${selectedDate.y}-${String(selectedDate.m + 1).padStart(2, "0")}-${String(selectedDate.d).padStart(2, "0")}`
    : "";

  const countFor = (time: string) => countBookings(bookings, dateKey, time);
  const capacityForTime = (time: string) =>
    dateKey ? getCapacityFor(dateKey, time) : 20;

  const selectedCapacity = capacityForTime(selectedSlot);
  const totalSelected = seatsTotal(seatQty);

  // вече заети места от други за даден вид седалка
  const seatTaken = (seat: SeatKey) =>
    countSeat(bookings, dateKey, selectedSlot, seat);
  // свободни за вид (капацитет на вида минус заетите)
  const seatFree = (seat: SeatKey) => Math.max(0, seatCap(seat) - seatTaken(seat));
  // общо оставащи места за часа (спрямо капацитета) минус вече избраните в тази резервация
  const totalRemaining =
    selectedCapacity - countFor(selectedSlot) - totalSelected;

  // колко още може да се добави от даден вид (лимит на вида И общ капацитет)
  const canAdd = (seat: SeatKey) =>
    seatQty[seat] < seatFree(seat) && totalRemaining > 0;

  const changeSeat = (seat: SeatKey, delta: number) => {
    setAvailabilityError("");
    setSeatQty((q) => {
      if (delta > 0 && !(q[seat] < seatFree(seat) &&
          selectedCapacity - countFor(selectedSlot) - seatsTotal(q) > 0))
        return q;
      return { ...q, [seat]: Math.max(0, q[seat] + delta) };
    });
  };

  // при смяна на час нулираме избора (наличността е различна за всеки час)
  const pickSlot = (time: string) => {
    setSelectedSlot(time);
    setAvailabilityError("");
    setSeatQty(emptySeats());
  };

  const goForward = () => {
    if (step === 4 && selectedDate) {
      const record: BookingRecord = {
        id: reservationNo,
        dateKey,
        dateLabel: `${selectedDate.d} ${monthNamesLower[selectedDate.m]} ${selectedDate.y}`,
        time: selectedSlot,
        seats: seatQty,
        places: totalSelected,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        adult: tickets.adult,
        child: tickets.child,
        small: tickets.small,
        total: totalPrice,
        createdAt: new Date().toISOString(),
      };
      // Финална проверка на наличността в момента на записа (мярка срещу
      // едновременни резервации на последните места).
      const result = tryBook(record);
      setBookings(getBookings());
      if (!result.ok) {
        setAvailabilityError(
          result.reason === "blocked"
            ? `Часът ${selectedSlot} вече не е достъпен. Моля, изберете друг.`
            : result.seat
              ? `Съжаляваме, за ${selectedSlot} · „${seatLabel(result.seat)}“ останаха само ${result.free} ${
                  result.free === 1 ? "свободно място" : "свободни места"
                }. Моля, коригирайте броя.`
              : `Съжаляваме, за ${selectedSlot} няма достатъчно свободни места. Моля, коригирайте броя или изберете друг час.`
        );
        setSeatQty(emptySeats());
        setStep(2);
        return;
      }
      setAvailabilityError("");
    }
    if (step < 5) setStep(step + 1);
  };
  const [tickets, setTickets] = useState<Record<TicketKey, number>>({
    adult: 2,
    child: 1,
    small: 0,
  });
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [consent, setConsent] = useState(true);

  const blockedDays = useMemo(() => getBlockedDaySet(), []);
  const weeksGrid = useMemo(
    () => getMonthWeeks(view.y, view.m, now, blockedDays),
    [view, now, blockedDays]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const prevMonth = () =>
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const nextMonth = () =>
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const changeTicket = (key: TicketKey, delta: number) =>
    setTickets((t) => ({ ...t, [key]: Math.max(0, t[key] + delta) }));

  const totalCount = ticketTypes.reduce((s, t) => s + tickets[t.key], 0);
  const totalPrice = ticketTypes.reduce(
    (s, t) => s + tickets[t.key] * t.price,
    0
  );

  const canProceed =
    step === 1
      ? selectedDate !== null
      : step === 2
        ? selectedSlot !== "" &&
          !isSlotBlocked(dateKey, selectedSlot) &&
          totalSelected >= 1 &&
          SEAT_TYPES.every((s) => seatQty[s.key] <= seatFree(s.key)) &&
          totalSelected <= selectedCapacity - countFor(selectedSlot)
        : step === 3
          ? totalCount > 0
          : form.name.trim() !== "" &&
            isValidBgPhone(form.phone) &&
            isValidEmail(form.email) &&
            consent;

  const reservationNo = useMemo(
    () => `FPE-${Math.floor(1000 + Math.random() * 9000)}`,
    []
  );

  const ticketsSummary = [
    tickets.adult > 0 &&
      `${tickets.adult} ${tickets.adult === 1 ? "възрастен" : "възрастни"}`,
    tickets.child > 0 && `${tickets.child} ${tickets.child === 1 ? "дете" : "деца"}`,
    tickets.small > 0 &&
      `${tickets.small} ${tickets.small === 1 ? "дете под 5" : "деца под 5"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const titles = [
    "Изберете дата",
    "Изберете час",
    "Изберете билети",
    "Вашите данни",
  ];

  const shortDateLabel = selectedDate
    ? `${weekdayNames[new Date(selectedDate.y, selectedDate.m, selectedDate.d).getDay()]} · ${selectedDate.d} ${monthNamesLower[selectedDate.m]} ${selectedDate.y}`
    : "";

  const dateLabel = selectedDate ? `${shortDateLabel} · Въжено съоръжение` : "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-[16px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Резервация"
        className="flex max-h-[calc(100vh-32px)] min-h-0 w-[665.5px] max-w-full flex-col overflow-y-auto rounded-[11.092px] bg-offwhite sm:h-[738.74px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заглавен ред */}
        <div className="flex items-start justify-between px-[24px] pt-[44px] lg:px-[55px]">
          <p className="font-golos text-[20px] font-medium text-ink">
            Резервация
          </p>
          <button
            type="button"
            aria-label="Затвори"
            className="cursor-pointer font-golos text-[18px] leading-none text-[#a1a1aa] transition-colors hover:text-ink"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Прогрес */}
        {step < 5 && (
          <div className="mx-auto mt-[23px] flex w-[556px] max-w-[calc(100%-48px)] flex-col gap-[8px]">
            <p className="font-golos text-[11px] font-semibold tracking-[1.2px] text-[#a1a1aa]">
              СТЪПКА {step} ОТ 5
            </p>
            <div className="h-[6px] w-full overflow-hidden rounded-[3px] bg-[#eceae4]">
              <div
                className="h-full rounded-[3px] bg-forest transition-all duration-300"
                style={{ width: progressWidths[step - 1] }}
              />
            </div>
          </div>
        )}

        {step < 5 && (
          <p className="mt-[35px] text-center font-golos text-[22px] font-bold text-ink">
            {titles[step - 1]}
          </p>
        )}

        {step === 1 && (
          /* Стъпка 1 — календар */
          <div className="mx-auto mt-[40px] w-[466px] max-w-[calc(100%-32px)]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Предишен месец"
                className="flex size-[40px] cursor-pointer items-center justify-center rounded-full border-[1.107px] border-[#e4e1d8] transition-colors hover:bg-black/5"
                onClick={prevMonth}
              >
                <img src="/icons/arrow-back.svg" alt="" className="h-[11px] w-[7px]" />
              </button>
              <p className="font-golos text-[17.708px] font-medium text-ink">
                {monthNames[view.m]} {view.y}
              </p>
              <button
                type="button"
                aria-label="Следващ месец"
                className="flex size-[40px] cursor-pointer items-center justify-center rounded-full border-[1.107px] border-[#e4e1d8] transition-colors hover:bg-black/5"
                onClick={nextMonth}
              >
                <img
                  src="/icons/arrow-back.svg"
                  alt=""
                  className="h-[11px] w-[7px] rotate-180"
                />
              </button>
            </div>

            <div className="mt-[17px] flex justify-between">
              {weekdays.map((wd) => (
                <span
                  key={wd}
                  className="flex h-[26.562px] w-[42px] items-center justify-center font-golos text-[13.281px] font-semibold text-[#a1a1aa] sm:w-[57.551px]"
                >
                  {wd}
                </span>
              ))}
            </div>

            <div className="mt-[18px] flex flex-col gap-[4.427px]">
              {weeksGrid.map((week, wi) => (
                <div key={wi} className="flex items-start justify-between">
                  {week.map((cell, ci) => {
                    if (!cell) {
                      return (
                        <span
                          key={ci}
                          className="h-[42px] w-[42px] sm:h-[48.697px] sm:w-[57.551px]"
                        />
                      );
                    }
                    const isSelected =
                      selectedDate !== null &&
                      selectedDate.y === view.y &&
                      selectedDate.m === view.m &&
                      selectedDate.d === cell.day;
                    const selectable =
                      cell.state === "open" || cell.state === "today";
                    const base =
                      "flex items-center justify-center rounded-full font-golos text-[16.601px]";
                    let cls =
                      "h-[42px] w-[42px] sm:h-[48.697px] sm:w-[57.551px] font-medium";
                    if (isSelected) {
                      cls =
                        "size-[42px] sm:size-[57.551px] bg-forest font-bold text-offwhite";
                    } else if (cell.state === "today") {
                      cls =
                        "size-[42px] sm:size-[57.551px] border-[1.66px] border-forest font-medium text-ink";
                    } else if (cell.state === "past") {
                      cls += " text-[#c9c6bd]";
                    } else if (cell.state === "closed") {
                      cls += " text-[#a1a1aa] line-through";
                    } else {
                      cls += " text-ink";
                    }
                    return selectable ? (
                      <button
                        key={ci}
                        type="button"
                        className={`${base} ${cls} cursor-pointer transition-colors ${
                          isSelected ? "" : "hover:bg-black/5"
                        }`}
                        onClick={() =>
                          setSelectedDate({ y: view.y, m: view.m, d: cell.day })
                        }
                      >
                        {cell.day}
                      </button>
                    ) : (
                      <span key={ci} className={`${base} ${cls}`}>
                        {cell.day}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-[27px]">
              <Legend items={dateLegend} />
            </div>
          </div>
        )}

        {step === 2 && (
          /* Стъпка 2 — час */
          <div className="mx-auto mt-[16px] w-[523.5px] max-w-[calc(100%-32px)]">
            {shortDateLabel && (
              <p className="mb-[6px] text-center font-golos text-[14px] font-semibold text-forest">
                {shortDateLabel}
              </p>
            )}
            {availabilityError && (
              <p className="mb-[12px] rounded-[9px] bg-red-50 px-[14px] py-[8px] text-center font-golos text-[13px] font-medium text-red-600">
                {availabilityError}
              </p>
            )}
            <p className="mb-[18px] min-h-[18px] text-center font-golos text-[12.5px] leading-[1.45] text-[#3f3f46]">
              {selectedSlot
                ? `Свободни места за ${selectedSlot}: ${selectedCapacity - countFor(selectedSlot)} от ${selectedCapacity}`
                : ""}
            </p>
            <div className="flex flex-col gap-[12.583px]">
              {slotRows.map((row, ri) => (
                <div key={ri} className="flex gap-[12.583px]">
                  {row.map((time) => {
                    const isSelected = selectedSlot === time;
                    const blocked = isSlotBlocked(dateKey, time);
                    const isFull = countFor(time) >= capacityForTime(time);
                    if (blocked || isFull) {
                      return (
                        <span
                          key={time}
                          title={blocked ? "Блокиран час" : "Няма свободни места"}
                          className="flex flex-1 items-center justify-center rounded-[15.099px] bg-[#f0eee8] py-[15.099px] font-golos text-[17.616px] font-semibold text-[#c9c6bd] line-through"
                        >
                          {time}
                        </span>
                      );
                    }
                    return (
                      <button
                        key={time}
                        type="button"
                        className={`flex flex-1 cursor-pointer items-center justify-center rounded-[15.099px] py-[15.099px] font-golos text-[17.616px] font-semibold transition-colors ${
                          isSelected
                            ? "bg-forest text-offwhite"
                            : "border-[1.258px] border-[#dddad2] text-[#3f3f46] hover:border-forest"
                        }`}
                        onClick={() => pickSlot(time)}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Видове седалки — брой за всеки поотделно */}
            <div className="mt-[20px] flex flex-col gap-[10px]">
              <div className="flex items-center justify-between">
                <span className="font-golos text-[15px] font-semibold text-ink">
                  Вид седалка
                </span>
                <span className="font-golos text-[13px] font-medium text-[#a1a1aa]">
                  Общо избрани: {totalSelected}
                </span>
              </div>
              {SEAT_TYPES.map((s) => {
                const free = seatFree(s.key);
                const qty = seatQty[s.key];
                const soldOut = free === 0;
                const canMinus = qty > 0;
                const canPlus = canAdd(s.key);
                return (
                  <div
                    key={s.key}
                    className={`flex items-center justify-between rounded-[12px] border px-[16px] py-[12px] ${
                      qty > 0 ? "border-forest bg-[rgba(23,87,59,0.06)]" : "border-[#dddad2]"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span
                        className={`font-golos text-[15px] font-semibold ${
                          soldOut ? "text-[#c9c6bd]" : "text-ink"
                        }`}
                      >
                        {s.label}
                      </span>
                      <span className="font-golos text-[12.5px] font-medium">
                        {soldOut ? (
                          <span className="text-[#c9c6bd]">Заето</span>
                        ) : (
                          <span className="text-forest">{free} свободни</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-[14px]">
                      <button
                        type="button"
                        aria-label={`По-малко · ${s.label}`}
                        disabled={!canMinus}
                        className={`flex size-[36px] items-center justify-center rounded-full border-[1.947px] border-[#dddad2] font-golos text-[19px] font-semibold transition-colors ${
                          canMinus
                            ? "cursor-pointer text-[#3f3f46] hover:bg-black/5"
                            : "cursor-not-allowed text-[#c9c6bd]"
                        }`}
                        onClick={() => changeSeat(s.key, -1)}
                      >
                        −
                      </button>
                      <span className="w-[20px] text-center font-golos text-[18px] font-bold text-ink">
                        {qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Повече · ${s.label}`}
                        disabled={!canPlus}
                        className={`flex size-[36px] items-center justify-center rounded-full font-golos text-[19px] font-semibold text-offwhite transition-colors ${
                          canPlus
                            ? "cursor-pointer bg-forest hover:bg-pine"
                            : "cursor-not-allowed bg-[#dddad2]"
                        }`}
                        onClick={() => changeSeat(s.key, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-[18px]">
              <Legend items={timeLegend} />
            </div>
          </div>
        )}

        {step === 3 && (
          /* Стъпка 3 — билети */
          <div className="mx-auto mt-[38px] w-[539.5px] max-w-[calc(100%-32px)]">
            <div className="flex flex-col gap-[20.8px]">
              {ticketTypes.map((t) => {
                const count = tickets[t.key];
                return (
                  <div
                    key={t.key}
                    className="flex h-[59.697px] items-center justify-between py-[5.191px]"
                  >
                    <div className="flex flex-col gap-[3.893px]">
                      <p className="font-golos text-[20.764px] font-semibold text-ink">
                        {t.name}
                      </p>
                      <p className="font-golos text-[16.871px] text-[#a1a1aa]">
                        {t.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-[18.169px]">
                      <button
                        type="button"
                        aria-label={`По-малко ${t.name}`}
                        disabled={count === 0}
                        className={`flex size-[44.124px] items-center justify-center rounded-full border-[1.947px] border-[#dddad2] font-golos text-[20.764px] font-semibold transition-colors ${
                          count === 0
                            ? "cursor-not-allowed text-[#a1a1aa]"
                            : "cursor-pointer text-[#3f3f46] hover:bg-black/5"
                        }`}
                        onClick={() => changeTicket(t.key, -1)}
                      >
                        −
                      </button>
                      <p className="w-[16px] text-center font-golos text-[22.062px] font-bold text-ink">
                        {count}
                      </p>
                      <button
                        type="button"
                        aria-label={`Повече ${t.name}`}
                        className={`flex size-[44.124px] cursor-pointer items-center justify-center rounded-full font-golos text-[20.764px] font-semibold text-offwhite transition-colors ${
                          count === 0
                            ? "bg-[#dddad2] hover:bg-forest"
                            : "bg-forest hover:bg-pine"
                        }`}
                        onClick={() => changeTicket(t.key, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-[20.8px] h-[1.298px] w-full bg-[#eceae4]" />

            <div className="mt-[22px] flex items-center justify-between">
              <p className="font-golos text-[19.467px] font-medium text-[#3f3f46]">
                {totalCount} {totalCount === 1 ? "билет" : "билета"}
              </p>
              <div className="flex flex-col items-end gap-[2.596px]">
                <p className="font-golos text-[33.742px] font-semibold leading-none text-forest">
                  {totalPrice} лв
                </p>
                <p className="font-golos text-[15.573px] text-[#a1a1aa]">
                  с включен ДДС
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          /* Стъпка 4 — данни */
          <div className="mx-auto mt-[47px] w-[501px] max-w-[calc(100%-32px)]">
            <div className="flex flex-col gap-[15px]">
              {(
                [
                  { key: "name", label: "Име и фамилия *", placeholder: "Вашето име", type: "text" },
                  { key: "phone", label: "Телефон *", placeholder: "+359 875 2365", type: "tel" },
                  { key: "email", label: "Имейл *", placeholder: "your@email.com", type: "email" },
                ] as const
              ).map((f) => {
                const val = form[f.key];
                let error = "";
                if (val.trim() !== "") {
                  if (f.key === "phone" && !isValidBgPhone(val))
                    error = "Невалиден телефон (напр. +359 88 123 4567).";
                  if (f.key === "email" && !isValidEmail(val))
                    error = "Невалиден имейл адрес.";
                }
                return (
                  <div key={f.key} className="flex flex-col gap-[10px]">
                    <label className="font-golos text-[14.135px] font-medium text-ink">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={val}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                      }
                      className={`h-[41px] w-full rounded-[9.104px] bg-[rgba(161,161,170,0.15)] pl-[6px] pr-[12px] text-[16.386px] tracking-[0.164px] text-ink outline-none placeholder:text-black/30 ${
                        error ? "ring-2 ring-red-400" : ""
                      }`}
                    />
                    {error && (
                      <p className="-mt-[4px] text-[12.5px] text-red-600">
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              role="checkbox"
              aria-checked={consent}
              className="mt-[47px] flex w-full max-w-[452px] cursor-pointer items-start gap-[10.873px] text-left"
              onClick={() => setConsent((c) => !c)}
            >
              {consent ? (
                <img
                  src="/icons/checkbox.svg"
                  alt=""
                  className="size-[21.745px] shrink-0"
                />
              ) : (
                <span className="size-[21.745px] shrink-0 rounded-[6px] border-[2px] border-[#dddad2]" />
              )}
              <span className="font-golos text-[14.135px] leading-[1.45] text-[#3f3f46]">
                Съгласен/на съм с общите условия и политиката за поверителност
                на Fun Park Ezero.
              </span>
            </button>
          </div>
        )}

        {step === 5 && (
          /* Стъпка 5 — потвърждение */
          <div className="flex flex-col items-center px-[24px]">
            <img
              src="/icons/check-circle.svg"
              alt=""
              className="mt-[17px] size-[89px]"
            />
            <p className="mt-[19px] text-center font-golos text-[20px] font-bold text-ink">
              Всичко е готово
            </p>
            <p className="mt-[14px] w-[464px] max-w-full text-center font-golos text-[15px] leading-[1.55] text-[#3f3f46]">
              Резервацията ви за{" "}
              {selectedDate
                ? `${selectedDate.d} ${monthNamesLower[selectedDate.m]}`
                : ""}
              , {selectedSlot} ч. е потвърдена. Изпратихме потвърждение с
              всички детайли на вашия имейл.
            </p>
            <div className="mt-[25px] flex w-[499px] max-w-full flex-col gap-[10px] rounded-[10px] bg-[rgba(161,161,170,0.2)] p-[10px]">
              <div className="flex h-[55px] items-center rounded-[10px] bg-white px-[17px] font-golos text-[16px] tracking-[-0.15px] text-black">
                {selectedDate
                  ? `${selectedDate.d} ${monthNamesLower[selectedDate.m]} ${selectedDate.y}`
                  : ""}
              </div>
              <div className="flex h-[55px] items-center rounded-[10px] bg-white px-[17px] font-golos text-[16px] tracking-[-0.15px] text-black">
                {selectedSlot} ч · {totalSelected}{" "}
                {totalSelected === 1 ? "място" : "места"}
              </div>
              <div className="flex min-h-[55px] items-center rounded-[10px] bg-white px-[17px] py-[10px] font-golos text-[15px] tracking-[-0.15px] text-black">
                {SEAT_TYPES.filter((s) => seatQty[s.key] > 0)
                  .map((s) => `${s.label} × ${seatQty[s.key]}`)
                  .join(" · ")}
              </div>
              <div className="flex h-[55px] items-center rounded-[10px] bg-white px-[17px] font-golos text-[16px] tracking-[-0.15px] text-black">
                {ticketsSummary}
              </div>
              <div className="flex h-[55px] items-center rounded-[10px] bg-white px-[14px] font-golos text-[16px] tracking-[-0.15px] text-black">
                Резервация № -&nbsp;
                <span className="font-medium text-forest">{reservationNo}</span>
              </div>
              <div className="flex h-[55px] items-center rounded-[10px] bg-white px-[14px] font-golos text-[16px] tracking-[-0.15px] text-black">
                Общо-&nbsp;
                <span className="font-medium text-forest">{totalPrice} лв</span>
              </div>
            </div>
          </div>
        )}

        {/* Долни бутони */}
        <div className="mt-auto flex items-center justify-between gap-[16px] px-[24px] pb-[30px] pt-[24px] sm:px-[51px]">
          {step === 5 ? (
            <button
              type="button"
              className="mx-auto flex w-[259px] max-w-full cursor-pointer items-center justify-center rounded-[10px] bg-sun px-[24px] py-[10px] text-[15px] font-semibold leading-[20px] text-black/80 transition-colors hover:bg-[#e0b32f]"
              onClick={onClose}
            >
              Обратно към Начало
            </button>
          ) : (
            <>
              {step > 1 ? (
                <button
                  type="button"
                  className="flex w-[259px] max-w-[40%] cursor-pointer items-center justify-center rounded-[10px] px-[24px] py-[10px] font-golos text-[15px] text-black transition-colors hover:bg-black/5"
                  onClick={() => setStep(step - 1)}
                >
                  Назад
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                disabled={!canProceed}
                className={`flex w-[259px] max-w-[55%] items-center justify-center rounded-[10px] bg-sun px-[24px] py-[10px] text-[15px] font-semibold leading-[20px] text-black/80 transition-colors ${
                  canProceed
                    ? "cursor-pointer hover:bg-[#e0b32f]"
                    : "cursor-not-allowed opacity-50"
                }`}
                onClick={goForward}
              >
                Напред
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<SelectedDate | null>(null);

  const open = (date?: SelectedDate) => {
    setInitialDate(date ?? null);
    setIsOpen(true);
  };

  return (
    <BookingModalContext.Provider value={{ open }}>
      {children}
      {isOpen && (
        <Modal onClose={() => setIsOpen(false)} initialDate={initialDate} />
      )}
    </BookingModalContext.Provider>
  );
}
