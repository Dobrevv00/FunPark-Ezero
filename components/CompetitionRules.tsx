"use client";

import { useState } from "react";
import type { PublicCompetition } from "@/lib/competitionsShared";

/**
 * Правилата и условията на състезанията — раздели, таблица с наказанията и
 * бележка. Текстовете идват от админ панела, затова тук няма нищо записано в
 * кода: показва се точно това, което администраторът е въвел.
 *
 * При повече от едно състезание отгоре има превключвател.
 */
export default function CompetitionRules({
  competitions,
}: {
  competitions: PublicCompetition[];
}) {
  const withRules = competitions.filter(
    (c) => c.rules.length > 0 || c.penalties.length > 0 || c.prizeInfo !== "",
  );
  const [activeId, setActiveId] = useState<number | null>(withRules[0]?.id ?? null);
  const active = withRules.find((c) => c.id === activeId) ?? withRules[0];

  if (!active) return null;

  return (
    <div className="mt-[24px] lg:mt-[32px]">
      {/* Превключвател, когато правилата са на повече от едно състезание */}
      {withRules.length > 1 && (
        <div className="mb-[20px] flex flex-wrap justify-center gap-[8px]">
          {withRules.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              aria-pressed={c.id === active.id}
              className={`fx-tile cursor-pointer rounded-full px-[16px] py-[8px] font-golos text-[13.5px] font-semibold ${
                c.id === active.id
                  ? "bg-forest text-offwhite"
                  : "border border-[#dddad2] text-[#3f3f46] hover:border-forest hover:text-forest"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto flex max-w-[860px] flex-col gap-[16px]">
        {withRules.length > 1 && (
          <h3 className="text-center font-golos text-[19px] font-bold text-ink lg:text-[21px]">
            {active.title}
          </h3>
        )}

        {/* Награди */}
        {active.prizeInfo && (
          <div className="rounded-[10px] bg-[rgba(244,198,63,0.18)] px-[16px] py-[14px] lg:px-[24px] lg:py-[18px]">
            <p className="font-golos text-[13px] font-bold uppercase tracking-[0.6px] text-ink">
              Награди
            </p>
            <p className="mt-[6px] whitespace-pre-line font-golos text-[14px] leading-[1.6] text-[#3f3f46] lg:text-[15px]">
              {active.prizeInfo}
            </p>
          </div>
        )}

        {/* Разделите с правила */}
        {active.rules.map((r, i) => (
          <section
            key={`${r.title}-${i}`}
            className="rounded-[10px] bg-offwhite p-[18px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)] lg:p-[28px]"
          >
            {r.title && (
              <h4 className="font-golos text-[17px] font-bold leading-[1.3] text-ink lg:text-[19px]">
                <span className="mr-[8px] text-leaf">{i + 1}.</span>
                {r.title}
              </h4>
            )}
            {r.intro && (
              <p className="mt-[8px] whitespace-pre-line font-golos text-[14px] leading-[1.6] text-[#3f3f46] lg:text-[15px]">
                {r.intro}
              </p>
            )}
            {r.items.length > 0 && (
              <ul className="mt-[10px] flex flex-col gap-[7px]">
                {r.items.map((item, ii) => (
                  <li
                    key={ii}
                    className="flex gap-[10px] font-golos text-[14px] leading-[1.55] text-[#3f3f46] lg:text-[15px]"
                  >
                    <span className="mt-[8px] size-[6px] shrink-0 rounded-full bg-leaf" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Наказания */}
        {active.penalties.length > 0 && (
          <section className="rounded-[10px] bg-offwhite p-[18px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)] lg:p-[28px]">
            <h4 className="font-golos text-[17px] font-bold leading-[1.3] text-ink lg:text-[19px]">
              Наказания
            </h4>
            <div className="mt-[12px] overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-left">
                <thead>
                  <tr className="font-golos text-[11.5px] uppercase tracking-[0.6px] text-[#a1a1aa]">
                    <th className="w-[140px] py-[8px] pr-[12px] font-bold">Наказание</th>
                    <th className="py-[8px] font-bold">За какво</th>
                  </tr>
                </thead>
                <tbody>
                  {active.penalties.map((p, i) => (
                    <tr key={i} className="border-t border-[#eceae4] align-top">
                      <td className="py-[10px] pr-[12px] font-golos text-[14px] font-bold text-forest">
                        {p.penalty}
                      </td>
                      <td className="py-[10px] font-golos text-[14px] leading-[1.5] text-[#3f3f46]">
                        {p.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {active.rulesNote && (
          <p className="whitespace-pre-line font-golos text-[13.5px] leading-[1.6] text-[#545454]">
            {active.rulesNote}
          </p>
        )}
      </div>
    </div>
  );
}
