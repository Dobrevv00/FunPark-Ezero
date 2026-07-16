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

const BookingModalContext = createContext<{ open: () => void }>({
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

const timeSlots = [
  { time: "09:00", busy: true },
  { time: "09:30", busy: true },
  { time: "10:00", busy: false },
  { time: "10:30", busy: false },
  { time: "11:00", busy: false },
  { time: "11:30", busy: true },
  { time: "13:00", busy: true },
  { time: "13:30", busy: false },
  { time: "14:00", busy: false },
  { time: "14:30", busy: false },
  { time: "15:00", busy: false },
  { time: "15:30", busy: false },
  { time: "16:00", busy: false },
  { time: "16:30", busy: false },
  { time: "17:00", busy: false },
  { time: "17:30", busy: false },
];

const slotRows = [0, 4, 8, 12].map((i) => timeSlots.slice(i, i + 4));

type SelectedDate = { y: number; m: number; d: number };

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

function Modal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const now = useMemo(() => new Date(), []);
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("10:30");

  const weeksGrid = useMemo(
    () => getMonthWeeks(view.y, view.m, now),
    [view, now]
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

  const canProceed = step === 1 ? selectedDate !== null : selectedSlot !== "";

  const dateLabel = selectedDate
    ? `${weekdayNames[new Date(selectedDate.y, selectedDate.m, selectedDate.d).getDay()]} · ${selectedDate.d} ${monthNamesLower[selectedDate.m]} ${selectedDate.y} · Въжено съоръжение`
    : "";

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
        <div className="mx-auto mt-[23px] flex w-[556px] max-w-[calc(100%-48px)] flex-col gap-[8px]">
          <p className="font-golos text-[11px] font-semibold tracking-[1.2px] text-[#a1a1aa]">
            СТЪПКА {step} ОТ 5
          </p>
          <div className="h-[6px] w-full overflow-hidden rounded-[3px] bg-[#eceae4]">
            <div
              className="h-full rounded-[3px] bg-forest transition-all duration-300"
              style={{ width: step === 1 ? 139 : 280 }}
            />
          </div>
        </div>

        <p className="mt-[35px] text-center font-golos text-[22px] font-bold text-ink">
          {step === 1 ? "Изберете дата" : "Изберете час"}
        </p>

        {step === 1 ? (
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
        ) : (
          /* Стъпка 2 — час */
          <div className="mx-auto mt-[38px] w-[523.5px] max-w-[calc(100%-32px)]">
            <div className="flex h-[44px] w-fit max-w-full items-center rounded-full bg-cream px-[18px]">
              <p className="truncate font-golos text-[14.4px] font-medium text-forest">
                {dateLabel}
              </p>
            </div>

            <div className="mt-[22px] flex flex-col gap-[12.583px]">
              {slotRows.map((row, ri) => (
                <div key={ri} className="flex gap-[12.583px]">
                  {row.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    if (slot.busy) {
                      return (
                        <span
                          key={slot.time}
                          className="flex flex-1 items-center justify-center rounded-[15.099px] bg-[#f0eee8] py-[15.099px] font-golos text-[17.616px] font-semibold text-[#c9c6bd] line-through"
                        >
                          {slot.time}
                        </span>
                      );
                    }
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        className={`flex flex-1 cursor-pointer items-center justify-center rounded-[15.099px] py-[15.099px] font-golos text-[17.616px] font-semibold transition-colors ${
                          isSelected
                            ? "bg-forest text-offwhite"
                            : "border-[1.258px] border-[#dddad2] text-[#3f3f46] hover:border-forest"
                        }`}
                        onClick={() => setSelectedSlot(slot.time)}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-[18px]">
              <Legend items={timeLegend} />
            </div>
          </div>
        )}

        {/* Долни бутони */}
        <div className="mt-auto flex items-center justify-between gap-[16px] px-[24px] pb-[30px] pt-[24px] sm:px-[51px]">
          {step === 2 ? (
            <button
              type="button"
              className="flex w-[259px] max-w-[40%] cursor-pointer items-center justify-center rounded-[10px] px-[24px] py-[10px] font-golos text-[15px] text-black transition-colors hover:bg-black/5"
              onClick={() => setStep(1)}
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
            onClick={() => step === 1 && setStep(2)}
          >
            Напред
          </button>
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

  return (
    <BookingModalContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      {isOpen && <Modal onClose={() => setIsOpen(false)} />}
    </BookingModalContext.Provider>
  );
}
