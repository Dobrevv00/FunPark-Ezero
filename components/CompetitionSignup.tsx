"use client";

import { useState } from "react";
import CompetitionRegistrationForm from "@/components/CompetitionRegistrationForm";
import type { PublicCompetition } from "@/lib/competitionsShared";

const eyebrowCls =
  "font-golos text-[12px] font-bold uppercase tracking-[0.18em] text-leaf";
const h2Cls =
  "mt-[8px] font-golos text-[24px] font-extrabold leading-[1.2] text-ink lg:text-[32px]";

/**
 * Страница „Записване за състезания“: графикът на състезанията и една обща
 * форма с избор на състезание. „Запиши се“ в картата избира състезанието
 * и превърта до формата.
 */
export default function CompetitionSignup({
  competitions,
}: {
  competitions: PublicCompetition[];
}) {
  const firstOpen = competitions.find((c) => c.spotsLeft !== 0) ?? competitions[0];
  const [selectedId, setSelectedId] = useState<number | null>(firstOpen?.id ?? null);
  const selected = competitions.find((c) => c.id === selectedId) ?? firstOpen;

  const choose = (id: number) => {
    setSelectedId(id);
    document
      .getElementById("signup")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ---------------- Предстоящи състезания ---------------- */}
      <section
        id="schedule"
        className="mx-[16px] mt-[48px] scroll-mt-[24px] lg:mx-[32px] lg:mt-[80px]"
      >
        <div className="text-center">
          <p className={eyebrowCls}>График</p>
          <h2 className={h2Cls}>Предстоящи състезания</h2>
          <p className="mx-auto mt-[10px] max-w-[576px] font-golos text-[14px] leading-[1.55] text-[#545454] lg:text-[16px]">
            Датите на квалификацията, полуфинала и финала за всяко състезание.
          </p>
        </div>

        {competitions.length === 0 ? (
          <div className="mt-[24px] flex flex-col items-center gap-[10px] rounded-[10px] bg-cream px-[20px] py-[48px] text-center lg:mt-[32px]">
            <img src="/icons/calendar-month.svg" alt="" className="size-[34px] opacity-70" />
            <p className="font-golos text-[18px] font-bold text-ink lg:text-[20px]">
              В момента няма обявени състезания
            </p>
            <p className="max-w-[440px] font-golos text-[14px] leading-[1.55] text-[#545454]">
              Следете страницата — щом обявим следващото състезание, записването
              за квалификацията ще се отвори тук.
            </p>
          </div>
        ) : (
          // flex с центриране — непълен ред (1 или 2 карти) стои в средата под заглавието
          <div className="mt-[24px] flex flex-wrap justify-center gap-[20px] lg:mt-[32px] lg:gap-[24px]">
            {competitions.map((c) => {
              const full = c.spotsLeft === 0;
              const percent =
                c.maxParticipants && c.maxParticipants > 0
                  ? Math.min(100, Math.round((c.registeredCount / c.maxParticipants) * 100))
                  : 0;
              const stages = [
                { label: "Квалификация", date: c.qualificationDateLabel },
                { label: "Полуфинал", date: c.semifinalDateLabel },
                { label: "Финал", date: c.finalDateLabel },
              ];
              return (
                <article
                  key={c.id}
                  className="fx-card flex w-full flex-col rounded-[10px] bg-offwhite p-[20px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)] md:w-[calc(50%-10px)] lg:w-[calc((100%-48px)/3)] lg:p-[28px]"
                >
                  <span
                    className={`self-start rounded-full px-[12px] py-[6px] font-golos text-[11.5px] font-semibold uppercase tracking-[0.8px] ${
                      full
                        ? "bg-[rgba(220,38,38,0.1)] text-red-600"
                        : "bg-[rgba(106,142,78,0.12)] text-forest"
                    }`}
                  >
                    {full ? "Местата са запълнени" : "Записването е отворено"}
                  </span>

                  <h3 className="mt-[14px] font-golos text-[19px] font-bold leading-[1.3] text-ink lg:text-[21px]">
                    {c.title}
                  </h3>
                  {c.location && (
                    <p className="mt-[4px] font-golos text-[13px] font-medium text-forest">
                      {c.location}
                    </p>
                  )}
                  {c.description && (
                    <p className="mt-[6px] font-golos text-[13.5px] leading-[1.5] text-[#545454]">
                      {c.description}
                    </p>
                  )}

                  {/* Етапи като вертикална линия */}
                  <ol className="mt-[18px] flex flex-col">
                    {stages.map((s, i) => (
                      <li key={s.label} className="relative flex gap-[12px] pb-[14px] last:pb-0">
                        {i < stages.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="absolute left-[13px] top-[28px] h-[calc(100%-28px)] w-[2px] bg-[#e6e4de]"
                          />
                        )}
                        <span
                          aria-hidden="true"
                          className={`relative flex size-[28px] shrink-0 items-center justify-center rounded-full font-golos text-[12.5px] font-bold ${
                            i === 2
                              ? "bg-sun text-black/80"
                              : "bg-[rgba(106,142,78,0.16)] text-forest"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="min-w-0 pt-[1px]">
                          <span className="block font-golos text-[11.5px] font-bold uppercase tracking-[0.6px] text-leaf">
                            {s.label}
                          </span>
                          <span className="block font-golos text-[14px] font-medium leading-[1.4] text-ink">
                            {s.date}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>

                  {/* Такса за участие */}
                  {c.feeEur !== null && (
                    <div className="mt-[16px] rounded-[9px] bg-[rgba(244,198,63,0.18)] px-[12px] py-[10px]">
                      <p className="font-golos text-[13.5px] font-bold text-ink">
                        Такса за участие: {c.feeEur} €
                      </p>
                      {c.feeNote && (
                        <p className="mt-[2px] font-golos text-[12.5px] leading-[1.45] text-[#3f3f46]">
                          {c.feeNote}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Места */}
                  <div className="mt-[18px] border-t border-[#eceae4] pt-[14px]">
                    {c.maxParticipants === null ? (
                      <p className="font-golos text-[13.5px] text-[#545454]">
                        Без ограничение на местата
                      </p>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-between gap-[10px] font-golos text-[13.5px]">
                          <span className="text-[#545454]">Свободни места</span>
                          <span className={`font-bold ${full ? "text-red-600" : "text-forest"}`}>
                            {c.spotsLeft} от {c.maxParticipants}
                          </span>
                        </div>
                        <div
                          className="mt-[8px] h-[7px] overflow-hidden rounded-full bg-[#eceae4]"
                          role="progressbar"
                          aria-label="Заети места"
                          aria-valuemin={0}
                          aria-valuemax={c.maxParticipants}
                          aria-valuenow={c.registeredCount}
                        >
                          <span
                            className={`block h-full rounded-full ${full ? "bg-red-400" : "bg-leaf"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {(c.rules.length > 0 || c.penalties.length > 0) && (
                    <a
                      href="#rules"
                      className="fx-ink mt-[14px] inline-flex font-golos text-[13.5px] font-semibold text-forest underline decoration-forest/35 underline-offset-[4px]"
                    >
                      Правила и условия →
                    </a>
                  )}

                  <div className="mt-auto pt-[20px]">
                    <button
                      type="button"
                      disabled={full}
                      onClick={() => choose(c.id)}
                      className={`flex w-full items-center justify-center rounded-[10px] px-[24px] py-[10px] font-golos text-[15px] font-semibold leading-[20px] ${
                        full
                          ? "cursor-not-allowed bg-[#e4e4e7] text-[#71717a]"
                          : "fx-pop cursor-pointer bg-sun text-black/80 hover:bg-[#e0b32f]"
                      }`}
                    >
                      {full ? "Няма места" : "Запиши се"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------------- Форма за записване ---------------- */}
      {selected && (
        <section
          id="signup"
          className="mx-[16px] mt-[48px] scroll-mt-[24px] lg:mx-[32px] lg:mt-[80px]"
        >
          <div className="grid overflow-hidden rounded-[10px] bg-offwhite shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)] lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            {/* Лява колона — полезно да знаеш */}
            <div className="bg-forest px-[20px] py-[32px] lg:px-[40px] lg:py-[48px]">
              <p className="font-golos text-[12px] font-bold uppercase tracking-[0.18em] text-sun lg:text-center">
                Записване
              </p>
              <h2 className="mt-[8px] font-golos text-[24px] font-extrabold leading-[1.2] text-white lg:text-center lg:text-[32px]">
                Запиши се за квалификацията
              </h2>
              <p className="mt-[12px] font-golos text-[14px] leading-[1.6] text-[#e4ebe7] lg:text-center lg:text-[15px]">
                Попълни формата и ще се свържем с теб за потвърждение и
                подробности.
              </p>
              {/* Таксата и бележките идват от състезанието */}
              {(selected.feeEur !== null || selected.registrationNote) && (
                <div className="mt-[20px] rounded-[9px] bg-white/10 px-[14px] py-[12px]">
                  {selected.feeEur !== null && (
                    <p className="font-golos text-[14px] font-bold text-sun">
                      Такса за участие: {selected.feeEur} €
                    </p>
                  )}
                  {selected.feeNote && (
                    <p className="mt-[2px] font-golos text-[13px] leading-[1.5] text-[#e4ebe7]">
                      {selected.feeNote}
                    </p>
                  )}
                  {selected.registrationNote && (
                    <p className="mt-[8px] font-golos text-[13px] leading-[1.5] text-[#e4ebe7]">
                      {selected.registrationNote}
                    </p>
                  )}
                </div>
              )}

              <ul className="mt-[24px] flex flex-col gap-[14px]">
                {[
                  "Всички полета без „по избор“ са задължителни.",
                  "За участници под 18 години е нужен родител или настойник.",
                  "Записването е за квалификацията — най-добрите продължават на полуфинал и финал.",
                  "Класираните се обявяват на тази страница с име и първа буква на фамилията.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-[10px] font-golos text-[13.5px] leading-[1.5] text-[#f5f5f7] lg:text-[14px]"
                  >
                    <span className="mt-[7px] size-[6px] shrink-0 rounded-full bg-sun" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Дясна колона — избор и форма */}
            <div className="px-[16px] py-[28px] sm:px-[28px] lg:px-[48px] lg:py-[48px]">
              <div className="mb-[22px] flex flex-col gap-[6px]">
                <label
                  htmlFor="signup-competition"
                  className="font-golos text-[14px] font-medium text-ink"
                >
                  Състезание
                </label>
                <div className="relative">
                  <select
                    id="signup-competition"
                    value={selected.id}
                    onChange={(e) => setSelectedId(Number(e.target.value))}
                    className="h-[44px] w-full cursor-pointer appearance-none rounded-[9px] bg-[rgba(161,161,170,0.15)] pl-[12px] pr-[40px] font-golos text-[15px] text-ink outline-none transition-shadow focus:ring-2 focus:ring-forest/40"
                  >
                    {competitions.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.spotsLeft === 0}>
                        {c.title} · {c.qualificationDateLabel}
                        {c.spotsLeft === 0 ? " (няма места)" : ""}
                      </option>
                    ))}
                  </select>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 8"
                    className="pointer-events-none absolute right-[16px] top-1/2 h-[8px] w-[12px] -translate-y-1/2 text-[#545454]"
                  >
                    <path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="font-golos text-[12.5px] text-[#71717a]">
                  Квалификация: {selected.qualificationDateLabel}
                  {selected.spotsLeft !== null &&
                    ` · свободни места: ${selected.spotsLeft} от ${selected.maxParticipants}`}
                </p>
              </div>

              <CompetitionRegistrationForm
                idPrefix="signup"
                competition={selected}
                closed={selected.spotsLeft === 0}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
