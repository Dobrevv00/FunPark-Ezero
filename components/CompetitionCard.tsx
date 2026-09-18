import Link from "next/link";
import YellowButton from "./YellowButton";
import Badge from "./Badge";
import type { PublicCompetition } from "@/lib/competitionsShared";

/**
 * Картата на състезанието на началната страница. В режим „Състезание“
 * (`COMPETITION_MODE`) заема мястото на календара за резервации —
 * същия слот и същите размери като `BookingCard`, за да не мърда нищо
 * останало по страницата.
 *
 * Заглавието на състезанието, датите на кръговете и таксата идват от
 * Payload (колекция „Състезания“); резервните стойности по-долу повтарят
 * обявените данни, за да е вярна картата и ако базата е недостъпна.
 * Промоционалният текст е в кода — както стъпките в `BookingCard`.
 */

const fallback = {
  title: "Състезание Fun Park Ezero",
  qualificationDateLabel: "26 – 27 септември 2026 г.",
  semifinalDateLabel: "3 – 4 октомври 2026 г.",
  finalDateLabel: "10 – 11 октомври 2026 г.",
  feeEur: 30 as number | null,
  feeNote:
    "Плаща се веднъж, при записването за квалификациите. От таксите се формира наградният фонд.",
  spotsLeft: null as number | null,
};

const promoText =
  "Скоростно преминаване на въжената градина — трасето се минава за време, а победител е най-ниското крайно време. Три състезателни уикенда: квалификации, полуфинал и финал.";

/**
 * Пастелите на кръговете (иконите circle-*.svg са бели — тук картата е бяла,
 * затова кръгчетата са цветни CSS елементи в пастелите на карти „Защо нас“)
 */
const stageColors = ["#deedfa", "#fcf1ce", "#e9f3da"];

/** Цели числа без излишни нули, иначе с две — както цените в билета */
const fmtFee = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");

export default function CompetitionCard({
  competitions,
}: {
  competitions: PublicCompetition[];
}) {
  // първото състезание с отворено записване; иначе първото по дата
  const c = competitions.find((x) => x.spotsLeft !== 0) ?? competitions[0];

  const title = c?.title || fallback.title;
  const feeEur = c ? c.feeEur : fallback.feeEur;
  const feeNote = c ? c.feeNote : fallback.feeNote;
  const spotsLeft = c ? c.spotsLeft : fallback.spotsLeft;
  const full = spotsLeft === 0;

  const stages = [
    {
      name: "Квалификация",
      date: c?.qualificationDateLabel || fallback.qualificationDateLabel,
    },
    {
      name: "Полуфинал",
      date: c?.semifinalDateLabel || fallback.semifinalDateLabel,
    },
    { name: "Финал", date: c?.finalDateLabel || fallback.finalDateLabel },
  ];

  const statusPill = (
    <span
      className={`flex h-[28px] items-center gap-[8px] whitespace-nowrap rounded-full px-[12px] font-golos text-[12.5px] font-semibold ${
        full ? "bg-[rgba(63,63,70,0.08)] text-[#545454]" : "bg-[rgba(106,142,78,0.14)] text-forest"
      }`}
    >
      <span
        className={`size-[7px] rounded-full ${full ? "bg-[#a1a1aa]" : "bg-leaf"}`}
      />
      {full ? "Местата са запълнени" : "Записването е отворено"}
    </span>
  );

  const stageRows = (
    <div className="flex flex-col gap-[14px]">
      {stages.map((s, i) => (
        <div key={s.name} className="flex items-center gap-[14px]">
          <span
            className="flex size-[46px] shrink-0 items-center justify-center rounded-full font-golos text-[17px] font-extrabold text-ink"
            style={{ backgroundColor: stageColors[i] }}
          >
            {i + 1}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-golos text-[15.5px] font-semibold text-ink">
              {s.name}
            </span>
            <span className="font-golos text-[13.5px] leading-[1.35] text-[#71717a]">
              {s.date}
            </span>
          </span>
        </div>
      ))}
    </div>
  );

  const feeBlock = feeEur != null && (
    <div className="rounded-[9px] bg-[rgba(244,198,63,0.16)] px-[14px] py-[11px]">
      <p className="font-golos text-[13.5px] font-bold text-ink">
        Такса за участие: {fmtFee(feeEur)} €
      </p>
      {feeNote && (
        <p className="mt-[3px] font-golos text-[12.5px] leading-[1.4] text-[#545454]">
          {feeNote}
        </p>
      )}
    </div>
  );

  return (
    <>
      {/* Мобилна карта — същият корпус като резервационната */}
      <div className="mx-auto w-[370px] max-w-[calc(100%-32px)] rounded-[10px] bg-offwhite px-[20px] pb-[40px] pt-[44px] drop-shadow-[0px_11.389px_17.084px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="flex justify-center">{statusPill}</div>
        <h2 className="mt-[18px] text-center font-golos text-[25px] font-bold leading-[1.15] tracking-[0.25px]">
          <span className="text-ink">Запиши се за</span>{" "}
          <span className="text-leaf">състезанието</span>
        </h2>
        <p className="mt-[16px] text-center text-[14px] leading-[1.3] tracking-[0.14px] text-[#545454]">
          {promoText}
        </p>

        {/* График на кръговете */}
        <div className="mt-[28px] rounded-[9.109px] bg-white p-[18px] shadow-[0px_10.374px_31.122px_0px_rgba(0,0,0,0.05),0px_5.187px_10.374px_0px_rgba(0,0,0,0.03)]">
          <p className="font-golos text-[14px] font-bold text-ink">{title}</p>
          <div className="mt-[16px]">{stageRows}</div>
        </div>

        {feeBlock && <div className="mt-[14px]">{feeBlock}</div>}

        <YellowButton href="/competitions#signup" className="mt-[24px] h-[40px] w-full">
          Запиши се
        </YellowButton>
        <Link
          href="/competitions"
          className="fx-link mt-[16px] block text-center font-golos text-[13.5px] font-semibold text-forest hover:text-leaf"
        >
          Виж всички подробности →
        </Link>
      </div>

      {/* Десктоп карта — размерите на резервационната, за да не мърда страницата */}
      <div className="relative mx-auto hidden h-[590px] w-[1227px] rounded-[10px] bg-offwhite drop-shadow-[0px_11.389px_17.084px_rgba(0,0,0,0.08)] lg:block">
        {/* Лява колона */}
        <div className="absolute left-[90px] top-[118px]">
          <Badge>Състезание</Badge>
        </div>
        <h2 className="absolute left-[90px] top-[183px] w-[363px] font-golos text-[35px] font-bold leading-[1.15] tracking-[0.35px]">
          <span className="text-forest">Запиши се за</span>{" "}
          <span className="text-leaf">състезанието</span>
        </h2>
        <p className="absolute left-[90px] top-[277px] w-[363px] text-[16px] leading-[1.3] tracking-[0.16px] text-[#545454]">
          {promoText}
        </p>
        <YellowButton
          href="/competitions#signup"
          className="absolute left-[90px] top-[413px] w-[259px]"
        >
          Запиши се
        </YellowButton>
        <Link
          href="/competitions"
          className="fx-outline absolute left-[90px] top-[469px] flex w-[259px] items-center justify-center rounded-[10px] border border-forest px-[24px] py-[10px] font-golos text-[15px] font-semibold leading-[20px] text-forest"
        >
          Виж подробности
        </Link>

        {/* Дясна карта — на мястото на календара, центрирана по вертикала */}
        <div className="absolute left-[664px] top-[108px] w-[472px] rounded-[9.387px] bg-white p-[24px] shadow-[0px_10.691px_32.074px_0px_rgba(0,0,0,0.08),0px_5.346px_10.691px_0px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-[12px]">
            <p className="min-w-0 truncate font-golos text-[15px] font-bold text-ink">
              {title}
            </p>
            {statusPill}
          </div>
          <div className="mt-[20px]">{stageRows}</div>
          {feeBlock && <div className="mt-[18px]">{feeBlock}</div>}
        </div>
      </div>
    </>
  );
}
