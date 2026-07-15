import YellowButton from "./YellowButton";
import Badge from "./Badge";

const steps = [
  { n: 1, label: "Избери дата", circleLeft: 684.31, labelLeft: 664 },
  { n: 2, label: "Избери час", circleLeft: 818.75, labelLeft: 801.34 },
  { n: 3, label: "Информация", circleLeft: 945.47, labelLeft: 923.21 },
  { n: 4, label: "Потвърждение", circleLeft: 1072.19, labelLeft: 1044.12 },
];

const mobileSteps = [
  { n: 2, top: 333, label: "Избери час" },
  { n: 3, top: 405, label: "Информация" },
  { n: 4, top: 477, label: "Потвърждение" },
];

type DayState = "past" | "closed" | "today" | "selected" | "open";
type Day = { day: number; state: DayState } | null;

const weekdays = ["пн", "вт", "ср", "чт", "пт", "сб", "нд"];

const d = (day: number, state: DayState = "open"): Day => ({ day, state });

const weeks: Day[][] = [
  [null, null, d(1, "past"), d(2, "past"), d(3, "past"), d(4, "past"), d(5, "closed")],
  [d(6, "past"), d(7, "past"), d(8, "today"), d(9), d(10), d(11), d(12, "selected")],
  [d(13), d(14), d(15), d(16), d(17), d(18), d(19, "closed")],
  [d(20), d(21), d(22), d(23), d(24), d(25), d(26, "closed")],
  [d(27), d(28), d(29), d(30), d(31), null, null],
];

const dayColors: Record<DayState, string> = {
  past: "text-[#c9c6bd]",
  closed: "text-[#a1a1aa] line-through",
  today: "border-forest text-ink",
  selected: "bg-forest font-bold text-offwhite",
  open: "text-ink",
};

function Calendar({ mobile }: { mobile: boolean }) {
  const cell = mobile ? "h-[31.26px] w-[36.944px]" : "h-[40.483px] w-[47.843px]";
  const round = mobile
    ? "size-[36.944px] border-[1.066px]"
    : "size-[47.843px] border-[1.38px]";
  const dayText = mobile ? "text-[11.319px]" : "text-[13.801px]";
  return (
    <>
      <p
        className={`absolute font-golos font-medium text-ink ${
          mobile
            ? "left-1/2 top-[47px] -translate-x-1/2 text-[12.127px]"
            : "left-[25px] top-[25px] text-[14.721px]"
        }`}
      >
        Юли 2026
      </p>
      <div
        className={`absolute flex justify-between ${
          mobile ? "left-[15px] right-[14px] top-[93.5px]" : "left-[25px] right-[27px] top-[68.7px]"
        }`}
      >
        {weekdays.map((wd) => (
          <span
            key={wd}
            className={`flex h-[22px] items-center justify-center font-golos font-semibold text-[#a1a1aa] ${
              mobile ? "w-[36.944px] text-[12.127px]" : "w-[47.843px] text-[11.041px]"
            }`}
          >
            {wd}
          </span>
        ))}
      </div>
      <div
        className={`absolute flex flex-col ${
          mobile
            ? "left-[15px] right-[14px] top-[122px] gap-[2.842px]"
            : "left-[25px] right-[27px] top-[105.5px] gap-[3.68px]"
        }`}
      >
        {weeks.map((week, wi) => (
          <div key={wi} className="flex items-start justify-between">
            {week.map((cellDay, ci) =>
              cellDay ? (
                <span
                  key={ci}
                  className={`flex items-center justify-center rounded-full font-golos font-medium ${dayText} ${
                    cellDay.state === "today" || cellDay.state === "selected"
                      ? round
                      : cell
                  } ${dayColors[cellDay.state]}`}
                >
                  {cellDay.day}
                </span>
              ) : (
                <span key={ci} className={cell} />
              )
            )}
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
      <div className="relative mx-auto h-[1017px] w-[370px] max-w-[calc(100%-32px)] rounded-[10px] bg-offwhite drop-shadow-[0px_11.389px_17.084px_rgba(0,0,0,0.08)] lg:hidden">
        <h2 className="absolute left-[41px] top-[44px] w-[282px] font-golos text-[25px] font-bold leading-[1.15] tracking-[0.25px]">
          <span className="text-ink">Резервирай своето</span>{" "}
          <span className="text-leaf">приключение</span>
        </h2>
        <p className="absolute left-[41px] top-[118px] w-[309px] text-[14px] leading-[1.3] tracking-[0.14px] text-[#545454]">
          Провери наличните дати и избери кога искаш да посетиш парка. Само с
          няколко последователни стъпки ще резервираш своето място и ще бъдеш
          готов за едно незабравимо преживяване сред природата.
        </p>

        {/* Вертикални стъпки */}
        <div className="absolute left-[41px] top-[246px] size-[48.676px] rounded-full bg-[rgba(161,161,170,0.35)]" />
        <div className="absolute left-[47px] top-[252px] flex size-[37px] items-center justify-center rounded-full bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] font-golos text-[13.871px] font-medium text-offwhite">
          1
        </div>
        <p className="absolute left-[104px] top-[260px] font-golos text-[10px] font-medium text-[rgba(63,63,70,0.5)]">
          Стъпка 1
        </p>
        <p className="absolute left-[104px] top-[272px] font-golos text-[15px] font-medium text-[#3f3f46]">
          Избери дата
        </p>
        {mobileSteps.map((s) => (
          <div key={s.n}>
            <div
              className="absolute left-[48px] flex size-[33.714px] items-center justify-center rounded-full bg-[rgba(161,161,170,0.35)] font-golos text-[13.871px] font-medium text-offwhite"
              style={{ top: s.top }}
            >
              {s.n}
            </div>
            <p
              className="absolute left-[104px] font-golos text-[10px] font-medium text-[rgba(63,63,70,0.35)]"
              style={{ top: s.top - 5 }}
            >
              Стъпка {s.n}
            </p>
            <p
              className="absolute left-[104px] font-golos text-[15px] font-medium text-[#a1a1aa]"
              style={{ top: s.top + 7 }}
            >
              {s.label}
            </p>
          </div>
        ))}
        {[300, 372, 444].map((t) => (
          <div
            key={t}
            className="absolute left-[65px] h-[28px] border-l border-dashed border-[#a1a1aa]/50"
            style={{ top: t }}
          />
        ))}

        {/* Календар */}
        <div className="absolute left-1/2 top-[542px] h-[361px] w-[329px] -translate-x-1/2 rounded-[9.109px] bg-white shadow-[0px_10.374px_31.122px_0px_rgba(0,0,0,0.05),0px_5.187px_10.374px_0px_rgba(0,0,0,0.03)]">
          <Calendar mobile />
        </div>

        <YellowButton className="absolute left-1/2 top-[933px] w-[327px] -translate-x-1/2">
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
        <YellowButton className="absolute left-[90px] top-[413px] w-[259px]">
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
