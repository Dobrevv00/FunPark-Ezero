"use client";

import { useState } from "react";
import CompetitionRegistrationForm from "@/components/CompetitionRegistrationForm";
import type { PublicCompetition } from "@/lib/competitionsShared";

/**
 * Активните състезания — всяко със собствено записване за квалификацията.
 * Формата се разгъва при натискане; ако състезанието е само едно, е отворена.
 */
export default function CompetitionList({
  competitions,
  idPrefix,
}: {
  competitions: PublicCompetition[];
  idPrefix: string;
}) {
  const [openId, setOpenId] = useState<number | null>(
    competitions.length === 1 && competitions[0].spotsLeft !== 0 ? competitions[0].id : null,
  );

  if (competitions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-[10px] rounded-[10px] bg-offwhite px-[20px] py-[36px] text-center shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
        <p className="font-golos text-[17px] font-bold text-ink">
          В момента няма обявени състезания
        </p>
        <p className="max-w-[420px] font-golos text-[14px] leading-[1.55] text-[#545454]">
          Следете страницата — щом обявим следващото състезание, записването за
          квалификацията ще се отвори тук.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[16px]">
      {competitions.map((c) => {
        const full = c.spotsLeft === 0;
        // отворената форма остава отворена и при запълване — за да се види
        // потвърждението на последния записал се
        const open = openId === c.id;
        const panelId = `${idPrefix}-${c.id}-panel`;
        const stages = [
          { label: "Квалификация", date: c.qualificationDateLabel },
          { label: "Полуфинал", date: c.semifinalDateLabel },
          { label: "Финал", date: c.finalDateLabel },
        ];
        const results = [
          { label: "Продължават на полуфинал", names: c.semifinalists },
          { label: "Продължават на финал", names: c.finalists },
        ].filter((r) => r.names.length > 0);
        return (
          <article
            key={c.id}
            className="rounded-[10px] bg-offwhite p-[18px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)] sm:p-[28px]"
          >
            <div className="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-golos text-[20px] font-bold leading-[1.25] text-ink sm:text-[22px]">
                  {c.title}
                </h3>
                {c.description && (
                  <p className="mt-[6px] font-golos text-[14px] leading-[1.55] text-[#545454]">
                    {c.description}
                  </p>
                )}
                <p
                  className={`mt-[8px] font-golos text-[13.5px] font-semibold ${
                    full ? "text-red-600" : "text-leaf"
                  }`}
                >
                  {c.spotsLeft === null
                    ? "Записването е отворено"
                    : full
                      ? "Местата са запълнени"
                      : `Свободни места: ${c.spotsLeft} от ${c.maxParticipants}`}
                  {c.feeEur !== null && (
                    <span className="text-[#545454]"> · такса {c.feeEur} €</span>
                  )}
                </p>
                {(c.rules.length > 0 || c.penalties.length > 0) && (
                  <a
                    href="/competitions#rules"
                    className="fx-ink mt-[6px] inline-flex font-golos text-[13px] font-semibold text-forest underline decoration-forest/35 underline-offset-[4px]"
                  >
                    Правила и условия →
                  </a>
                )}
              </div>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                disabled={full && !open}
                onClick={() => setOpenId(open ? null : c.id)}
                className={`flex w-full shrink-0 items-center justify-center rounded-[10px] px-[22px] py-[10px] font-golos text-[14.5px] font-semibold leading-[20px] sm:w-auto ${
                  open
                    ? "fx-outline cursor-pointer border border-forest text-forest"
                    : full
                      ? "cursor-not-allowed bg-[#e4e4e7] text-[#71717a]"
                      : "fx-pop cursor-pointer bg-sun text-black/80 hover:bg-[#e0b32f]"
                }`}
              >
                {open ? "Скрий формата" : full ? "Няма места" : "Запиши се"}
              </button>
            </div>

            {/* Етапи: квалификация → полуфинал → финал */}
            <ol className="mt-[16px] grid grid-cols-1 gap-[8px] sm:grid-cols-3">
              {stages.map((s, i) => (
                <li
                  key={s.label}
                  className="flex items-center gap-[10px] rounded-[9px] bg-white px-[12px] py-[10px]"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[rgba(106,142,78,0.16)] font-golos text-[12.5px] font-bold text-forest"
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-golos text-[11.5px] font-bold uppercase tracking-[0.5px] text-leaf">
                      {s.label}
                    </span>
                    <span className="block font-golos text-[13.5px] font-medium text-ink">
                      {s.date}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            {/* Класирани — излизат, щом администраторът ги отбележи */}
            {results.length > 0 && (
              <div className="mt-[14px] flex flex-col gap-[12px] rounded-[9px] bg-[rgba(244,198,63,0.14)] px-[14px] py-[12px]">
                {results.map((r) => (
                  <div key={r.label}>
                    <p className="font-golos text-[13px] font-bold text-ink">
                      {r.label} ({r.names.length})
                    </p>
                    <ul className="mt-[6px] flex flex-wrap gap-[6px]">
                      {r.names.map((name, i) => (
                        <li
                          key={`${name}-${i}`}
                          className="rounded-full bg-white px-[10px] py-[4px] font-golos text-[13px] font-medium text-ink"
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {open && (
              <div id={panelId} className="mt-[22px] border-t border-[#eceae4] pt-[22px]">
                <CompetitionRegistrationForm
                  idPrefix={`${idPrefix}-${c.id}`}
                  competition={c}
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
