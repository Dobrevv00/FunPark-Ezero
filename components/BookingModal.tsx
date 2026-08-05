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
  CURRENCY,
  SEAT_TYPES,
  priceForSeats,
  printedFee,
  seatPrice,
  countBookings,
  countSeat,
  emptySeats,
  getBlockedDaySet,
  getBookings,
  getCapacityFor,
  getSlots,
  getSlotsForDay,
  isSlotBlocked,
  seatCapFor,
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


/** Ширини от дизайна (139/280/419/511px спрямо лента от 556px) — в проценти, за да са верни и на тесен екран */
const progressWidths = ["20%", "40%", "60%", "80%", "96%"];

/** Цена в евро — цели числа без излишни нули, иначе с две (напр. „45,99“) */
const fmtPrice = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");

/** Вид на билета (както двете версии в референтния дизайн) */
const deliveryOptions = [
  {
    key: "digital",
    title: "ДИГИТАЛЕН БИЛЕТ",
    hint: "Изпраща се веднага по имейл",
  },
  {
    key: "printed",
    title: "ПЕЧАТЕН БИЛЕТ",
    hint: "Разпечатваме го на касата при пристигане",
  },
] as const;

type DeliveryKey = (typeof deliveryOptions)[number]["key"];

/** Галерия за екрана на плащане — снимки от сайта */
const galleryMain = "/images/why-park.jpg";
const galleryThumbs = [
  { src: "/images/hero.jpg", video: false },
  { src: "/images/tiktok-1.jpg", video: true },
  { src: "/images/event-park.jpg", video: false },
  { src: "/images/restaurant-2.jpg", video: false },
];

/** Всички снимки в реда, в който се показват в голям формат */
const galleryAll = [
  { src: galleryMain, alt: "Въжено съоръжение Fun Park Ezero" },
  ...galleryThumbs.map((t) => ({ src: t.src, alt: "Fun Park Ezero" })),
];

/** Приети начини на плащане (текстови значки — без външни лога) */
const payBrands = ["Apple Pay", "Google Pay", "Visa", "Mastercard", "Amex"];

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
  const [bookings, setBookings] = useState<BookingRecord[]>(() => getBookings());
  const [selectedSlot, setSelectedSlot] = useState(() => {
    const s = getSlots();
    return s.includes("10:30") ? "10:30" : (s[0] ?? "");
  });
  const [seatQty, setSeatQty] = useState<SeatCounts>(emptySeats);
  const [availabilityError, setAvailabilityError] = useState("");

  const dateKey = selectedDate
    ? `${selectedDate.y}-${String(selectedDate.m + 1).padStart(2, "0")}-${String(selectedDate.d).padStart(2, "0")}`
    : "";

  // всеки ден може да има собствени часове — затова зависят от избраната дата
  const slots = useMemo(
    () => (dateKey ? getSlotsForDay(dateKey) : getSlots()),
    // bookings се обновява при всяка промяна в хранилището, вкл. на часовете
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dateKey, bookings]
  );

  const slotRows = useMemo(() => {
    const rows: string[][] = [];
    for (let i = 0; i < slots.length; i += 4) rows.push(slots.slice(i, i + 4));
    return rows;
  }, [slots]);

  // ако избраният час не съществува за новата дата — избираме първия наличен
  useEffect(() => {
    if (slots.length === 0) return;
    if (!slots.includes(selectedSlot)) {
      setSelectedSlot(slots.includes("10:30") ? "10:30" : slots[0]);
    }
  }, [slots, selectedSlot]);

  const countFor = (time: string) => countBookings(bookings, dateKey, time);
  const capacityForTime = (time: string) =>
    dateKey ? getCapacityFor(dateKey, time) : 20;

  // час, чието начало вече е минало (само за днешна дата) → неактивен
  const isSlotPast = (time: string) => {
    if (!selectedDate) return false;
    const [hh, mm] = time.split(":").map(Number);
    const slotStart = new Date(
      selectedDate.y,
      selectedDate.m,
      selectedDate.d,
      hh,
      mm
    );
    return slotStart.getTime() <= now.getTime();
  };

  const selectedCapacity = capacityForTime(selectedSlot);
  const totalSelected = seatsTotal(seatQty);

  // вече заети места от други за даден вид седалка
  const seatTaken = (seat: SeatKey) =>
    countSeat(bookings, dateKey, selectedSlot, seat);
  // свободни за вид (капацитет на вида за деня/часа минус заетите)
  const seatFree = (seat: SeatKey) =>
    Math.max(0, seatCapFor(dateKey, selectedSlot, seat) - seatTaken(seat));
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
    // Записът се прави на стъпка „Плащане“ — след потвърждаване на плащането.
    if (step === 5 && selectedDate) {
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
        total: totalDue,
        createdAt: new Date().toISOString(),
        // персонализацията от екрана на плащане — пазим я само ако е попълнена
        ...(giftFor.trim() ? { giftFor: giftFor.trim() } : {}),
        ...(giftMessage.trim() ? { giftMessage: giftMessage.trim() } : {}),
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
    if (step < 6) setStep(step + 1);
  };
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [consent, setConsent] = useState(true);
  const [delivery, setDelivery] = useState<DeliveryKey>("digital");
  const [giftFor, setGiftFor] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  /** индекс на снимката, отворена в голям формат (null = затворена галерия) */
  const [lightbox, setLightbox] = useState<number | null>(null);

  const blockedDays = useMemo(() => getBlockedDaySet(), []);
  const weeksGrid = useMemo(
    () => getMonthWeeks(view.y, view.m, now, blockedDays),
    [view, now, blockedDays]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // при отворена галерия Escape затваря само нея, стрелките сменят снимката
      if (lightbox !== null) {
        if (e.key === "Escape") setLightbox(null);
        if (e.key === "ArrowRight")
          setLightbox((i) => ((i ?? 0) + 1) % galleryAll.length);
        if (e.key === "ArrowLeft")
          setLightbox(
            (i) => ((i ?? 0) - 1 + galleryAll.length) % galleryAll.length
          );
        return;
      }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, lightbox]);

  const prevMonth = () =>
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const nextMonth = () =>
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  // сумата се формира от избраните седалки (цена според вида)
  const totalPrice = priceForSeats(seatQty);

  // печатният билет добавя такса към сумата за плащане (цените се задават в админ панела)
  const printedTicketFee = printedFee();
  const deliveryFee = delivery === "printed" ? printedTicketFee : 0;
  const totalDue = totalPrice + deliveryFee;

  const canProceed =
    step === 1
      ? selectedDate !== null
      : step === 2
        ? selectedSlot !== "" &&
          !isSlotBlocked(dateKey, selectedSlot) &&
          !isSlotPast(selectedSlot) &&
          totalSelected >= 1 &&
          SEAT_TYPES.every((s) => seatQty[s.key] <= seatFree(s.key)) &&
          totalSelected <= selectedCapacity - countFor(selectedSlot)
        : step === 3
          ? totalSelected > 0
          : step === 4
            ? form.name.trim() !== "" &&
              isValidBgPhone(form.phone) &&
              isValidEmail(form.email) &&
              consent
            : delivery !== undefined; // стъпка 5 — версията на билета е винаги избрана

  const reservationNo = useMemo(
    () => `FPE-${Math.floor(1000 + Math.random() * 9000)}`,
    []
  );

  /** Обобщение на избраните седалки, напр. „1 × До 30 кг · 2 × От 30 до 60 кг“ */
  const ticketsSummary = SEAT_TYPES.filter((s) => seatQty[s.key] > 0)
    .map((s) => `${seatQty[s.key]} × ${s.label}`)
    .join(" · ");

  const titles = [
    "Изберете дата",
    "Изберете час",
    "Билети и цена",
    "Вашите данни",
    "Плащане",
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
        className={`flex max-h-[calc(100vh-32px)] min-h-0 max-w-full flex-col overflow-y-auto rounded-[11.092px] bg-offwhite ${
          // екранът на плащане е по-широк и по-разреден
          step === 5 ? "w-[920px]" : "w-[665.5px] sm:h-[738.74px]"
        }`}
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
        {step < 6 && (
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

        {step < 6 && (
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
                    const past = isSlotPast(time);
                    const isFull = countFor(time) >= capacityForTime(time);
                    if (blocked || past || isFull) {
                      return (
                        <span
                          key={time}
                          title={
                            past
                              ? "Часът вече е минал"
                              : blocked
                                ? "Блокиран час"
                                : "Няма свободни места"
                          }
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
                        <span className="text-[#a1a1aa]">
                          {" · "}
                          {seatPrice(s.key) === 0
                            ? "безплатно"
                            : `${fmtPrice(seatPrice(s.key))} ${CURRENCY}`}
                        </span>
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
          /* Стъпка 3 — избрани седалки и цена */
          <div className="mx-auto mt-[30px] w-[539.5px] max-w-[calc(100%-32px)]">
            {shortDateLabel && (
              <p className="mb-[16px] text-center font-golos text-[14px] font-semibold text-forest">
                {shortDateLabel} · {selectedSlot} ч
              </p>
            )}

            <div className="flex flex-col gap-[14px]">
              {SEAT_TYPES.filter((s) => seatQty[s.key] > 0).map((s) => {
                const qty = seatQty[s.key];
                const unit = seatPrice(s.key);
                return (
                  <div
                    key={s.key}
                    className="flex items-center justify-between rounded-[12px] border border-[#dddad2] px-[18px] py-[14px]"
                  >
                    <div className="flex flex-col gap-[3px]">
                      <p className="font-golos text-[18px] font-semibold text-ink">
                        {s.label}
                      </p>
                      <p className="font-golos text-[14px] text-[#a1a1aa]">
                        {qty} {qty === 1 ? "място" : "места"} ×{" "}
                        {unit === 0 ? "безплатно" : `${fmtPrice(unit)} ${CURRENCY}`}
                      </p>
                    </div>
                    <p className="font-golos text-[20px] font-bold text-forest">
                      {fmtPrice(Math.round(qty * unit * 100) / 100)} {CURRENCY}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-[20px] h-[1.298px] w-full bg-[#eceae4]" />

            <div className="mt-[20px] flex items-center justify-between">
              <p className="font-golos text-[19.467px] font-medium text-[#3f3f46]">
                {totalSelected} {totalSelected === 1 ? "място" : "места"}
              </p>
              <div className="flex flex-col items-end gap-[2.596px]">
                <p className="font-golos text-[33.742px] font-semibold leading-none text-forest">
                  {fmtPrice(totalPrice)} {CURRENCY}
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
          /* Стъпка 5 — плащане (по структурата на референтния дизайн) */
          <div className="mx-auto mt-[22px] w-[840px] max-w-[calc(100%-40px)]">
            {availabilityError && (
              <p className="mb-[14px] rounded-[9px] bg-red-50 px-[16px] py-[10px] text-center font-golos text-[14px] font-medium text-red-600">
                {availabilityError}
              </p>
            )}

            {/* Път (breadcrumb) */}
            <p className="font-golos text-[13px] text-[#a1a1aa]">
              Fun Park Ezero <span className="mx-[6px]">/</span> Атракции
              <span className="mx-[6px]">/</span> Дейности на открито
              <span className="mx-[6px]">/</span>
              <span className="text-[#3f3f46]">Въжено съоръжение</span>
            </p>

            <div className="mt-[16px] grid gap-[26px] sm:grid-cols-[minmax(0,364px)_minmax(0,1fr)]">
              {/* Ляво: галерия */}
              <div>
                <button
                  type="button"
                  onClick={() => setLightbox(0)}
                  aria-label="Отвори снимката в голям формат"
                  className="group block h-[272px] w-full cursor-zoom-in overflow-hidden rounded-[12px]"
                >
                  <img
                    src={galleryMain}
                    alt="Въжено съоръжение Fun Park Ezero"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </button>
                <div className="mt-[10px] grid grid-cols-5 gap-[8px]">
                  {galleryThumbs.map((t, i) => (
                    <button
                      key={t.src}
                      type="button"
                      onClick={() => setLightbox(i + 1)}
                      aria-label="Отвори снимката в голям формат"
                      className="relative h-[62px] cursor-zoom-in overflow-hidden rounded-[8px] ring-forest transition-all hover:ring-[2px]"
                    >
                      <img src={t.src} alt="" className="h-full w-full object-cover" />
                      {t.video && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <span className="flex size-[24px] items-center justify-center rounded-full bg-white/85">
                            <img
                              src="/icons/play-arrow.svg"
                              alt=""
                              className="ml-[2px] h-[11px] w-[9px]"
                            />
                          </span>
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLightbox(0)}
                    className="flex h-[62px] cursor-pointer items-center justify-center rounded-[8px] border border-[#dddad2] px-[4px] text-center font-golos text-[10px] font-semibold leading-[1.2] text-[#545454] transition-colors hover:border-forest hover:text-forest"
                  >
                    Всички снимки
                  </button>
                </div>
              </div>

              {/* Дясно: детайли и опции */}
              <div className="min-w-0">
                <h3 className="font-golos text-[24px] font-extrabold uppercase leading-[1.15] text-ink">
                  Въжено съоръжение
                </h3>
                <p className="mt-[8px] font-golos text-[14px] leading-[1.5] text-[#545454]">
                  Гарантирани вълнения сред природата! Маршрути с различни нива
                  на трудност за цялото семейство.{" "}
                  <span className="font-semibold text-forest underline">
                    прочетете повече
                  </span>
                </p>

                {/* Групирана карта: хора · количество · персонализация */}
                <div className="mt-[16px] overflow-hidden rounded-[14px] border border-[#dddad2]">
                  <div className="flex items-center justify-between px-[18px] py-[14px]">
                    <div className="flex flex-col gap-[3px]">
                      <span className="font-golos text-[11px] font-semibold uppercase tracking-[1.4px] text-[#a1a1aa]">
                        Брой хора
                      </span>
                      <span className="font-golos text-[17px] font-medium text-ink">
                        {totalSelected} {totalSelected === 1 ? "човек" : "души"}
                      </span>
                    </div>
                    <img
                      src="/icons/arrow-back.svg"
                      alt=""
                      className="h-[14px] w-[9px] rotate-180 opacity-60"
                    />
                  </div>

                  <div className="border-t border-[#eceae4] px-[18px] py-[14px]">
                    <span className="font-golos text-[11px] font-semibold uppercase tracking-[1.4px] text-[#a1a1aa]">
                      Количество
                    </span>
                    <div className="mt-[9px] flex items-center justify-between gap-[12px]">
                      <div className="flex items-center gap-[10px] rounded-[9px] border border-[#dddad2] px-[14px] py-[8px]">
                        <span className="font-golos text-[17px] font-bold text-ink">
                          {totalSelected}
                        </span>
                        <span className="font-golos text-[14px] text-[#545454]">
                          {totalSelected === 1 ? "билет" : "билета"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="cursor-pointer font-golos text-[13.5px] font-semibold text-forest underline"
                      >
                        Промени местата
                      </button>
                    </div>
                    <p className="mt-[9px] font-golos text-[13px] text-[#a1a1aa]">
                      {ticketsSummary}
                    </p>
                  </div>

                  <div className="border-t border-[#eceae4] px-[18px] py-[14px]">
                    <span className="font-golos text-[11px] font-semibold uppercase tracking-[1.4px] text-[#a1a1aa]">
                      Персонализация
                    </span>
                    <div className="mt-[9px] flex flex-wrap items-center gap-[12px]">
                      <label className="flex items-center gap-[7px] font-golos text-[13.5px] text-[#545454]">
                        За:
                        <input
                          type="text"
                          value={giftFor}
                          onChange={(e) => setGiftFor(e.target.value)}
                          className="h-[34px] w-[130px] rounded-[8px] bg-[rgba(161,161,170,0.15)] px-[10px] text-[13.5px] text-ink outline-none focus:ring-[2px] focus:ring-forest/40"
                        />
                      </label>
                      <span className="font-golos text-[13.5px] text-[#545454]">
                        От: <span className="text-ink">{form.name || "—"}</span>
                      </span>
                      <label className="flex w-full items-center gap-[7px] font-golos text-[13.5px] text-[#545454]">
                        Съобщение:
                        <input
                          type="text"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          className="h-[34px] min-w-0 flex-1 rounded-[8px] bg-[rgba(161,161,170,0.15)] px-[10px] text-[13.5px] text-ink outline-none focus:ring-[2px] focus:ring-forest/40"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Две версии на билета */}
                <div className="mt-[16px] grid grid-cols-2 gap-[14px]">
                  {deliveryOptions.map((d) => {
                    const active = delivery === d.key;
                    // цената на печатния билет идва от настройките в админ панела
                    const optionPrice =
                      d.key === "printed" && printedTicketFee > 0
                        ? `+${fmtPrice(printedTicketFee)} ${CURRENCY}`
                        : "БЕЗПЛАТНО";
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setDelivery(d.key)}
                        className={`flex cursor-pointer flex-col gap-[7px] rounded-[12px] border p-[14px] text-left transition-colors ${
                          active
                            ? "border-forest bg-[rgba(23,87,59,0.06)]"
                            : "border-[#dddad2] hover:border-forest"
                        }`}
                      >
                        <span className="flex items-start gap-[9px]">
                          <span
                            className={`mt-[1px] flex size-[17px] shrink-0 items-center justify-center rounded-full border-[2px] ${
                              active ? "border-forest" : "border-[#c9c6bd]"
                            }`}
                          >
                            {active && (
                              <span className="size-[8px] rounded-full bg-forest" />
                            )}
                          </span>
                          <span className="font-golos text-[12.5px] font-bold uppercase leading-[1.25] tracking-[0.4px] text-ink">
                            {d.title}
                          </span>
                        </span>
                        <span className="font-golos text-[12px] font-bold uppercase tracking-[0.5px] text-forest">
                          {optionPrice}
                        </span>
                        <span className="font-golos text-[12px] leading-[1.4] text-[#a1a1aa]">
                          {d.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Голям бутон за плащане */}
                <button
                  type="button"
                  disabled={!canProceed}
                  onClick={goForward}
                  className={`mt-[16px] flex w-full items-center justify-center rounded-[12px] bg-sun py-[16px] font-golos text-[18px] font-bold text-black/80 transition-colors ${
                    canProceed
                      ? "cursor-pointer hover:bg-[#e0b32f]"
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  {fmtPrice(totalDue)} {CURRENCY} — Купи сега
                </button>
                {deliveryFee > 0 && (
                  <p className="mt-[8px] text-center font-golos text-[12px] text-[#a1a1aa]">
                    Билети {fmtPrice(totalPrice)} {CURRENCY} + такса печатен
                    билет {fmtPrice(deliveryFee)} {CURRENCY}
                  </p>
                )}
              </div>
            </div>

            {/* Сигурно плащане + приети карти */}
            <div className="mt-[18px] flex flex-wrap items-center gap-[10px]">
              <span className="flex items-center gap-[6px] rounded-[9px] bg-[rgba(106,142,78,0.12)] px-[12px] py-[7px] font-golos text-[12.5px] font-semibold text-forest">
                🔒 Сигурно плащане
              </span>
              {payBrands.map((b) => (
                <span
                  key={b}
                  className="rounded-[7px] border border-[#dddad2] bg-white px-[10px] py-[6px] font-golos text-[11.5px] font-semibold text-[#3f3f46]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          /* Стъпка 6 — потвърждение */
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
                {delivery === "printed"
                  ? `Печатен билет — на касата при пристигане${
                      printedTicketFee > 0
                        ? ` (+${fmtPrice(printedTicketFee)} ${CURRENCY})`
                        : ""
                    }`
                  : "Дигитален билет — изпратен по имейл"}
              </div>
              {/* Персонализация от екрана на плащане */}
              {giftFor.trim() && (
                <div className="flex min-h-[55px] items-center rounded-[10px] bg-white px-[17px] py-[10px] font-golos text-[16px] tracking-[-0.15px] text-black">
                  За:&nbsp;
                  <span className="font-medium text-forest">
                    {giftFor.trim()}
                  </span>
                </div>
              )}
              {giftMessage.trim() && (
                <div className="flex min-h-[55px] flex-col justify-center gap-[3px] rounded-[10px] bg-white px-[17px] py-[10px]">
                  <span className="font-golos text-[11px] font-semibold uppercase tracking-[1.2px] text-[#a1a1aa]">
                    Съобщение
                  </span>
                  <span className="font-golos text-[15px] italic leading-[1.45] tracking-[-0.15px] text-black">
                    „{giftMessage.trim()}“
                  </span>
                </div>
              )}
              <div className="flex h-[55px] items-center rounded-[10px] bg-white px-[14px] font-golos text-[16px] tracking-[-0.15px] text-black">
                Резервация № -&nbsp;
                <span className="font-medium text-forest">{reservationNo}</span>
              </div>
              <div className="flex h-[55px] items-center rounded-[10px] bg-white px-[14px] font-golos text-[16px] tracking-[-0.15px] text-black">
                Общо-&nbsp;
                <span className="font-medium text-forest">
                  {fmtPrice(totalDue)} {CURRENCY}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Долни бутони */}
        <div className="mt-auto flex items-center justify-between gap-[16px] px-[24px] pb-[30px] pt-[24px] sm:px-[51px]">
          {step === 6 ? (
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
              {/* на стъпка 5 основният бутон е големият „Купи сега“ в съдържанието */}
              {step === 5 ? (
                <span />
              ) : (
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
              )}
            </>
          )}
        </div>
      </div>

      {/* Галерия в голям формат */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/85 p-[16px]"
          onClick={(e) => {
            e.stopPropagation();
            setLightbox(null);
          }}
        >
          <button
            type="button"
            aria-label="Затвори галерията"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            className="absolute right-[18px] top-[18px] cursor-pointer rounded-full bg-white/15 px-[14px] py-[6px] font-golos text-[20px] leading-none text-white transition-colors hover:bg-white/30"
          >
            ✕
          </button>

          <button
            type="button"
            aria-label="Предишна снимка"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(
                (i) => ((i ?? 0) - 1 + galleryAll.length) % galleryAll.length
              );
            }}
            className="absolute left-[10px] top-1/2 flex size-[44px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/30 sm:left-[26px]"
          >
            <img
              src="/icons/arrow-back.svg"
              alt=""
              className="h-[18px] w-[11px] brightness-0 invert"
            />
          </button>
          <button
            type="button"
            aria-label="Следваща снимка"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((i) => ((i ?? 0) + 1) % galleryAll.length);
            }}
            className="absolute right-[10px] top-1/2 flex size-[44px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/30 sm:right-[26px]"
          >
            <img
              src="/icons/arrow-back.svg"
              alt=""
              className="h-[18px] w-[11px] rotate-180 brightness-0 invert"
            />
          </button>

          <img
            src={galleryAll[lightbox].src}
            alt={galleryAll[lightbox].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[70vh] max-w-[calc(100%-16px)] rounded-[12px] object-contain sm:max-h-[78vh] sm:max-w-[min(1100px,calc(100%-140px))]"
          />

          {/* Миниатюри за навигация */}
          <div
            className="mt-[14px] flex flex-wrap items-center justify-center gap-[8px]"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryAll.map((g, i) => (
              <button
                key={g.src}
                type="button"
                aria-label={`Снимка ${i + 1}`}
                onClick={() => setLightbox(i)}
                className={`h-[52px] w-[74px] cursor-pointer overflow-hidden rounded-[7px] transition-opacity ${
                  i === lightbox
                    ? "ring-[2px] ring-sun"
                    : "opacity-55 hover:opacity-100"
                }`}
              >
                <img src={g.src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <p className="mt-[10px] font-golos text-[13px] text-white/70">
            {lightbox + 1} / {galleryAll.length}
          </p>
        </div>
      )}
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
