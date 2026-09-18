import Link from "next/link";
import CompetitionList from "@/components/CompetitionList";
import type { PublicCompetition } from "@/lib/competitionsShared";

/**
 * Секция „Запиши се за състезание“ за страница „Събития“.
 * Страницата има отделно мобилно и десктоп дърво — затова `mobile`.
 */
export default function CompetitionSection({
  mobile,
  competitions,
}: {
  mobile: boolean;
  competitions: PublicCompetition[];
}) {
  const intro = (
    <>
      <p className="font-golos text-[12px] font-bold uppercase tracking-[0.18em] text-leaf">
        Състезания
      </p>
      <h2
        className={`mt-[10px] font-golos font-extrabold leading-[1.15] text-ink ${
          mobile ? "text-[24px]" : "text-[35px]"
        }`}
      >
        Запиши се за състезание
      </h2>
      <p
        className={`mt-[12px] font-golos leading-[1.55] text-[#3f3f46] ${
          mobile ? "text-[14px] sm:max-w-[600px]" : "text-[16px]"
        }`}
      >
        Изберете състезание и се запишете за квалификацията. Ще се свържем с вас
        за потвърждение и подробности.
      </p>
      <Link
        href="/competitions"
        className="fx-ink mt-[16px] inline-flex font-golos text-[14px] font-semibold text-forest underline decoration-forest/35 underline-offset-[4px] hover:decoration-forest"
      >
        Към „Записване за състезания“ →
      </Link>
    </>
  );

  if (mobile) {
    return (
      <section className="px-[20px] pb-[40px]">
        <div className="rounded-[24px] bg-cream px-[16px] py-[28px]">
          <div className="px-[4px]">{intro}</div>
          <div className="mt-[22px]">
            <CompetitionList competitions={competitions} idPrefix="events-mobile" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-[73px] max-w-[1512px] pl-[31px] pr-[33px]">
      <div className="grid grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-[56px] rounded-[10px] bg-cream p-[56px]">
        <div className="pt-[8px]">{intro}</div>
        <CompetitionList competitions={competitions} idPrefix="events-desktop" />
      </div>
    </section>
  );
}
