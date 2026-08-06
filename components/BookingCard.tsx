"use client";

import { useMemo } from "react";
import YellowButton from "./YellowButton";
import Badge from "./Badge";
import { useBookingModal } from "./BookingModal";
import { getBlockedDaySet } from "@/lib/bookingStore";
import {
  getMonthWeeks,
  monthNames,
  weekdays,
  type DayState,
} from "./calendarData";

const steps = [
  { n: 1, label: "Избери дата", circleLeft: 684.31, labelLeft: 664 },
  { n: 2, label: "Избери час", circleLeft: 818.75, labelLeft: 801.34 },
  { n: 3, label: "Информация", circleLeft: 945.47, labelLeft: 923.21 },
  { n: 4, label: "Потвърждение", circleLeft: 1072.19, labelLeft: 1044.12 },
];

const dayColors: Record<DayState, string> = {
  past: "text-[#c9c6bd]",
  closed: "text-[#a1a1aa] line-through",
  today: "border-forest text-ink",
  selected: "bg-forest font-bold text-offwhite",
  open: "text-ink",
};

function Calendar({ mobile }: { mobile: boolean }) {
  const { open } = useBookingModal();
  const now = useMemo(() => new Date(), []);
  const y = now.getFullYear();
  const m = now.getMonth();
  const weeksGrid = useMemo(
    () => getMonthWeeks(y, m, now, getBlockedDaySet()),
    [y, m, now]
  );
  const cell = mobile ? "h-[31.26px] w-[34px]" : "h-[40.483px] w-[47.843px]";
  const round = mobile
    ? "size-[34px] border-[1.066px]"
    : "size-[47.843px] border-[1.38px]";
  const dayText = mobile ? "text-[11.319px]" : "text-[13.801px]";
  const slot = mobile ? "flex flex-1 justify-center" : "flex";
  return (
    <>
      <p
        className={`absolute font-golos font-medium text-ink ${
          mobile
            ? "left-1/2 top-[47px] -translate-x-1/2 text-[12.127px]"
            : "left-[25px] top-[25px] text-[14.721px]"
        }`}
      >
        {monthNames[m]} {y}
      </p>
      <div
        className={`absolute flex justify-between ${
          mobile ? "left-[12px] right-[12px] top-[93.5px]" : "left-[25px] right-[27px] top-[68.7px]"
        }`}
      >
        {weekdays.map((wd) => (
          <span
            key={wd}
            className={`flex h-[22px] items-center justify-center font-golos font-semibold text-[#a1a1aa] ${
              mobile ? "flex-1 text-[12.127px]" : "w-[47.843px] text-[11.041px]"
            }`}
          >
            {wd}
          </span>
        ))}
      </div>
      <div
        className={`absolute flex flex-col ${
          mobile
            ? "left-[12px] right-[12px] top-[122px] gap-[2.842px]"
            : "left-[25px] right-[27px] top-[105.5px] gap-[3.68px]"
        }`}
      >
        {weeksGrid.map((week, wi) => (
          <div key={wi} className="flex items-start justify-between">
            {week.map((cellDay, ci) => {
              if (!cellDay)
                return (
                  <span key={ci} className={slot}>
                    <span className={cell} />
                  </span>
                );
              const shape = `flex items-center justify-center rounded-full font-golos font-medium ${dayText} ${
                cellDay.state === "today" ? round : cell
              } ${dayColors[cellDay.state]}`;
              const selectable =
                cellDay.state === "open" || cellDay.state === "today";
              return (
                <span key={ci} className={slot}>
                  {selectable ? (
                    <button
                      type="button"
                      className={`${shape} cursor-pointer transition-colors hover:bg-black/5`}
                      onClick={() => open({ y, m, d: cellDay.day })}
                    >
                      {cellDay.day}
                    </button>
                  ) : (
                    <span className={shape}>{cellDay.day}</span>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

export default function BookingCard() {
  return (
    <>
      {/* Мобилна карта */}
      <div className="mx-auto w-[370px] max-w-[calc(100%-32px)] rounded-[10px] bg-offwhite px-[20px] pb-[40px] pt-[44px] drop-shadow-[0px_11.389px_17.084px_rgba(0,0,0,0.08)] lg:hidden">
        <h2 className="text-center font-golos text-[25px] font-bold leading-[1.15] tracking-[0.25px]">
          <span className="text-ink">Резервирай своето</span>{" "}
          <span className="text-leaf">приключение</span>
        </h2>
        <p className="mt-[16px] text-center text-[14px] leading-[1.3] tracking-[0.14px] text-[#545454]">
          Провери наличните дати и избери кога искаш да посетиш парка. Само с
          няколко последователни стъпки ще резервираш своето място и ще бъдеш
          готов за едно незабравимо преживяване сред природата.
        </p>

        {/* Вертикални стъпки */}
        <div className="mt-[36px] flex flex-col">
          {steps.map((s, i) => (
            <div key={s.n}>
              <div className="flex items-center gap-[12px]">
                <span className="flex size-[48.676px] shrink-0 items-center justify-center">
                  {s.n === 1 ? (
                    <span className="flex size-full items-center justify-center rounded-full bg-[rgba(161,161,170,0.35)]">
                      <span className="flex size-[37px] items-center justify-center rounded-full bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] font-golos text-[13.871px] font-medium text-offwhite">
                        1
                      </span>
                    </span>
                  ) : (
                    <span className="flex size-[33.714px] items-center justify-center rounded-full bg-[rgba(161,161,170,0.35)] font-golos text-[13.871px] font-medium text-offwhite">
                      {s.n}
                    </span>
                  )}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span
                    className={`font-golos text-[10px] font-medium ${
                      s.n === 1
                        ? "text-[rgba(63,63,70,0.5)]"
                        : "text-[rgba(63,63,70,0.35)]"
                    }`}
                  >
                    Стъпка {s.n}
                  </span>
                  <span
                    className={`font-golos text-[15px] font-medium ${
                      s.n === 1 ? "text-[#3f3f46]" : "text-[#a1a1aa]"
                    }`}
                  >
                    {s.label}
                  </span>
                </span>
              </div>
              {i < steps.length - 1 && (
                <span className="ml-[24px] block h-[28px] border-l border-dashed border-[#a1a1aa]/50" />
              )}
            </div>
          ))}
        </div>

        {/* Календар */}
        <div className="relative mt-[36px] h-[361px] rounded-[9.109px] bg-white shadow-[0px_10.374px_31.122px_0px_rgba(0,0,0,0.05),0px_5.187px_10.374px_0px_rgba(0,0,0,0.03)]">
          <Calendar mobile />
        </div>

        <YellowButton booking className="mt-[30px] h-[40px] w-full">
          Започни резервация
        </YellowButton>
      </div>

      {/* Десктоп карта */}
      <div className="relative mx-auto hidden h-[590px] w-[1227px] rounded-[10px] bg-offwhite drop-shadow-[0px_11.389px_17.084px_rgba(0,0,0,0.08)] lg:block">
        {/* Лява колона */}
        <div className="absolute left-[90px] top-[118px]">
          <Badge>Резервация</Badge>
        </div>
        <h2 className="absolute left-[90px] top-[183px] w-[363px] font-golos text-[35px] font-bold leading-[1.15] tracking-[0.35px]">
          <span className="text-forest">Резервирай своето</span>{" "}
          <span className="text-leaf">приключение</span>
        </h2>
        <p className="absolute left-[90px] top-[277px] w-[363px] text-[16px] leading-[1.3] tracking-[0.16px] text-[#545454]">
          Провери наличните дати и избери кога искаш да посетиш парка. Само с
          няколко последователни стъпки ще резервираш своето място и ще бъдеш
          готов за едно незабравимо преживяване сред природата.
        </p>
        <YellowButton booking className="absolute left-[90px] top-[413px] w-[259px]">
          Започни резервация
        </YellowButton>

        {/* Стъпки */}
        <div className="absolute left-[719px] top-[67px] h-[0.5px] w-[386px] bg-[#dddad2]" />
        <div className="absolute left-[676.57px] top-[42px] size-[50.295px] rounded-full bg-[#dddad2]" />
        {steps.map((step) => (
          <div key={step.n}>
            <div
              className={`absolute top-[49.74px] flex size-[34.835px] items-center justify-center rounded-full font-golos text-[14.332px] font-medium text-offwhite ${
                step.n === 1 ? "bg-forest" : "bg-[#dddad2]"
              }`}
              style={{ left: step.circleLeft }}
            >
              {step.n}
            </div>
            <p
              className="absolute top-[99px] whitespace-nowrap font-golos text-[12.341px] font-medium text-[rgba(63,63,70,0.8)]"
              style={{ left: step.labelLeft }}
            >
              {step.label}
            </p>
          </div>
        ))}

        {/* Календар */}
        <div className="absolute left-[664px] top-[149px] h-[373px] w-[472px] rounded-[9.387px] bg-white shadow-[0px_10.691px_32.074px_0px_rgba(0,0,0,0.08),0px_5.346px_10.691px_0px_rgba(0,0,0,0.04)]">
          <Calendar mobile={false} />
        </div>
      </div>
    </>
  );
}
