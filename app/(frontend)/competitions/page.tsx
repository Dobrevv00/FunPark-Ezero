import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ComingSoon, { comingSoonEnabled } from "@/components/ComingSoon";
import Badge from "@/components/Badge";
import YellowButton from "@/components/YellowButton";
import CompetitionSignup from "@/components/CompetitionSignup";
import CompetitionRules from "@/components/CompetitionRules";
import type { PublicCompetition } from "@/lib/competitionsShared";
import {
  getCompetitions,
  getFooter,
  getHeader,
  getSiteSettings,
} from "@/lib/cms.server";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/site";

const TITLE = "Записване за състезания";
const DESCRIPTION =
  "Запишете се за квалификацията на състезанията във Fun Park Ezero — дати на квалификация, полуфинал и финал и класирани участници.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/competitions" },
  openGraph: {
    url: "/competitions",
    title: `${TITLE} | Fun Park Ezero`,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    title: `${TITLE} | Fun Park Ezero`,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export const revalidate = 60;

/** Трите етапа — цветовете и кръговете са като картите „Защо нас“ */
const steps = [
  {
    bg: "#e3effd",
    circle: "/icons/circle-blue.svg",
    title: "Квалификация",
    desc: "Запиши се през формата на тази страница. Ще се свържем с теб за потвърждение и подробности.",
  },
  {
    bg: "#faf7ee",
    circle: "/icons/circle-yellow.svg",
    title: "Полуфинал",
    desc: "Най-добре представилите се в квалификацията продължават на полуфинал.",
  },
  {
    bg: "#eff7e0",
    circle: "/icons/circle-green.svg",
    title: "Финал",
    desc: "Класираните от полуфинала се състезават във финала.",
  },
];

const eyebrowCls =
  "font-golos text-[12px] font-bold uppercase tracking-[0.18em] text-leaf";
const h2Cls =
  "mt-[8px] font-golos text-[24px] font-extrabold leading-[1.2] text-ink lg:text-[32px]";

/**
 * Structured data (schema.org `Event`) за квалификацията на всяко състезание —
 * само реалната ISO дата (`qualificationDate`), никога измислена. Полуфиналът
 * и финалът нямат надежден суров ISO низ на този етап (само форматиран текст),
 * затова не влизат в схемата.
 */
const buildCompetitionsJsonLd = (competitions: PublicCompetition[]) =>
  competitions
    .filter((c) => c.qualificationDate)
    .map((c) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: c.title,
      ...(c.description ? { description: c.description } : {}),
      startDate: c.qualificationDate,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: c.location || "Fun Park Ezero",
        ...(c.location ? {} : { url: SITE_URL }),
      },
      organizer: { "@type": "Organization", name: "Fun Park Ezero", url: SITE_URL },
      url: `${SITE_URL}/competitions`,
      ...(c.feeEur !== null
        ? {
            offers: {
              "@type": "Offer",
              price: c.feeEur,
              priceCurrency: "EUR",
              availability:
                c.spotsLeft === 0
                  ? "https://schema.org/SoldOut"
                  : "https://schema.org/InStock",
              url: `${SITE_URL}/competitions`,
            },
          }
        : {}),
    }));

export default async function CompetitionsPage() {
  const [header, footer, settings, competitions] = await Promise.all([
    getHeader(),
    getFooter(),
    getSiteSettings(),
    getCompetitions(),
  ]);

  // при включен режим „Очаквайте скоро“ страницата показва само екрана
  if (await comingSoonEnabled()) return <ComingSoon settings={settings} />;

  const withResults = competitions.filter(
    (c) => c.semifinalists.length > 0 || c.finalists.length > 0,
  );
  const canSignUp = competitions.some((c) => c.spotsLeft !== 0);
  const hasRules = competitions.some(
    (c) => c.rules.length > 0 || c.penalties.length > 0 || c.prizeInfo !== "",
  );
  const eventsJsonLd = buildCompetitionsJsonLd(competitions);

  return (
    <>
      {eventsJsonLd.map((event, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
        />
      ))}
      <Header
        nav={header?.navItems}
        searchPlaceholder={header?.searchPlaceholder}
        socialLinks={settings?.socials}
      />

      <main className="mx-auto max-w-[1512px] overflow-x-clip">
        {/* ---------------- Заглавна част ---------------- */}
        <section className="relative mx-[16px] mt-[14px] rounded-[10px] bg-cream px-[16px] pb-[40px] pt-[48px] lg:mx-[32px] lg:px-[24px] lg:pb-[64px] lg:pt-[80px]">
          <div className="flex flex-col items-center text-center">
            <Badge>Състезания</Badge>
            <h1 className="mt-[28px] font-golos text-[32px] font-black leading-[1.1] text-ink lg:mt-[40px] lg:text-[55px]">
              Записване за{" "}
              <span className="bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-transparent">
                състезания
              </span>
            </h1>
            <p className="mx-auto mt-[18px] max-w-[576px] font-golos text-[14px] leading-[1.5] text-[#545454] lg:mt-[29px] lg:text-[16px] lg:leading-[1.6] lg:text-[#3f3f46]">
              Провери датите, запиши се за квалификацията и следи кой продължава
              на полуфинал и финал.
            </p>

            <div className="mt-[28px] flex w-full flex-col items-center gap-[12px] sm:w-auto sm:flex-row lg:mt-[36px]">
              {canSignUp && (
                <YellowButton href="#signup" className="w-full sm:w-[220px]">
                  Запиши се
                </YellowButton>
              )}
              {competitions.length > 0 && (
                <a
                  href={
                    withResults.length > 0
                      ? "#results"
                      : hasRules
                        ? "#rules"
                        : "#schedule"
                  }
                  className="fx-outline flex w-full items-center justify-center rounded-[10px] border border-forest px-[24px] py-[10px] font-golos text-[15px] font-semibold leading-[20px] text-forest sm:w-[220px]"
                >
                  {withResults.length > 0
                    ? "Виж класираните"
                    : hasRules
                      ? "Правила и условия"
                      : "Виж датите"}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ---------------- Как протича ---------------- */}
        <section className="mx-[16px] mt-[48px] lg:mx-[32px] lg:mt-[80px]">
          <div className="text-center">
            <p className={eyebrowCls}>Как протича</p>
            <h2 className={h2Cls}>Три етапа до победата</h2>
          </div>
          <ol className="mt-[24px] grid gap-[16px] sm:grid-cols-3 lg:mt-[32px] lg:gap-[24px]">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="fx-card relative rounded-[10px] p-[20px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.08)] lg:min-h-[240px] lg:p-[27px]"
                style={{ backgroundColor: s.bg }}
              >
                <span className="relative flex size-[46px] items-center justify-center lg:size-[59px]">
                  <img src={s.circle} alt="" className="absolute inset-0 size-full" />
                  <span className="relative font-golos text-[18px] font-extrabold text-ink lg:text-[22px]">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-[18px] font-golos text-[20px] font-semibold leading-[1.15] tracking-[0.2px] text-ink lg:mt-[40px] lg:text-[25px]">
                  {s.title}
                </h3>
                <p className="mt-[8px] font-golos text-[14px] leading-[1.4] text-[#5b5b5b] lg:mt-[12px] lg:text-[15px]">
                  {s.desc}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- График и форма ---------------- */}
        <CompetitionSignup competitions={competitions} />

        {/* ---------------- Правила и условия ---------------- */}
        {hasRules && (
          <section
            id="rules"
            className="mx-[16px] mt-[48px] scroll-mt-[24px] lg:mx-[32px] lg:mt-[80px]"
          >
            <div className="text-center">
              <p className={eyebrowCls}>Условия</p>
              <h2 className={h2Cls}>Правила и условия</h2>
              <p className="mx-auto mt-[10px] max-w-[576px] font-golos text-[14px] leading-[1.55] text-[#545454] lg:text-[16px]">
                Пълните правила на състезанието — как се провежда, изискванията
                за безопасност, наказанията и класирането.
              </p>
            </div>
            <CompetitionRules competitions={competitions} />
          </section>
        )}

        {/* ---------------- Класирани ---------------- */}
        {competitions.length > 0 && (
          <section
            id="results"
            className="mx-[16px] mt-[48px] scroll-mt-[24px] lg:mx-[32px] lg:mt-[80px]"
          >
            <div className="text-center">
              <p className={eyebrowCls}>Резултати</p>
              <h2 className={h2Cls}>Класирани</h2>
              <p className="mx-auto mt-[10px] max-w-[576px] font-golos text-[14px] leading-[1.55] text-[#545454] lg:text-[16px]">
                Участниците, продължаващи на полуфинал и финал, за всяко състезание.
              </p>
            </div>

            {withResults.length === 0 ? (
              <div className="mt-[24px] flex flex-col items-center gap-[8px] rounded-[10px] bg-cream px-[20px] py-[40px] text-center lg:mt-[32px]">
                <img src="/icons/check-circle.svg" alt="" className="size-[40px] opacity-60" />
                <p className="font-golos text-[17px] font-bold text-ink lg:text-[19px]">
                  Все още няма обявени класирани
                </p>
                <p className="max-w-[440px] font-golos text-[14px] leading-[1.55] text-[#545454]">
                  Класираните за полуфинал и финал ще бъдат обявени тук след
                  квалификацията.
                </p>
              </div>
            ) : (
              // центрирани — самотна карта стои в средата под заглавието
              <div className="mt-[24px] flex flex-wrap justify-center gap-[20px] lg:mt-[32px] lg:gap-[24px]">
                {withResults.map((c) => (
                  <article
                    key={c.id}
                    className={`fx-card w-full rounded-[10px] bg-offwhite p-[20px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)] lg:p-[28px] ${
                      withResults.length > 1 ? "md:w-[calc(50%-10px)] lg:w-[calc(50%-12px)]" : "max-w-[720px]"
                    }`}
                  >
                    <h3 className="font-golos text-[19px] font-bold leading-[1.3] text-ink lg:text-[21px]">
                      {c.title}
                    </h3>

                    <div className="mt-[18px] flex flex-col gap-[16px]">
                      {/* Финал — отгоре и в жълто */}
                      <div className="rounded-[9px] bg-[rgba(244,198,63,0.16)] px-[14px] py-[14px]">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-[10px] gap-y-[2px]">
                          <p className="font-golos text-[13px] font-bold uppercase tracking-[0.6px] text-ink">
                            Финал
                          </p>
                          <p className="font-golos text-[12.5px] text-[#545454]">
                            {c.finalDateLabel}
                          </p>
                        </div>
                        {c.finalists.length > 0 ? (
                          <ul className="mt-[10px] flex flex-wrap gap-[6px]">
                            {c.finalists.map((name, i) => (
                              <li
                                key={`${name}-${i}`}
                                className="rounded-full bg-sun px-[12px] py-[5px] font-golos text-[13.5px] font-semibold text-black/80"
                              >
                                {name}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-[8px] font-golos text-[13.5px] text-[#71717a]">
                            Обявяват се след полуфинала.
                          </p>
                        )}
                      </div>

                      <div className="rounded-[9px] bg-[rgba(106,142,78,0.1)] px-[14px] py-[14px]">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-[10px] gap-y-[2px]">
                          <p className="font-golos text-[13px] font-bold uppercase tracking-[0.6px] text-forest">
                            Полуфинал
                          </p>
                          <p className="font-golos text-[12.5px] text-[#545454]">
                            {c.semifinalDateLabel}
                          </p>
                        </div>
                        <ul className="mt-[10px] flex flex-wrap gap-[6px]">
                          {c.semifinalists.map((name, i) => (
                            <li
                              key={`${name}-${i}`}
                              className="rounded-full bg-white px-[12px] py-[5px] font-golos text-[13.5px] font-medium text-ink"
                            >
                              {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ---------------- Долен призив ---------------- */}
        <section className="mx-[16px] mb-[60px] mt-[48px] lg:mx-[32px] lg:mb-[86px] lg:mt-[80px]">
          <div className="flex flex-col items-center rounded-[10px] bg-forest px-[16px] py-[48px] text-center lg:px-[24px] lg:py-[64px]">
            <h2 className="font-golos text-[25px] font-semibold leading-[1.2] text-white lg:text-[35px]">
              Имате въпрос за състезанията?
            </h2>
            <p className="mt-[12px] max-w-[520px] font-golos text-[14px] leading-[1.5] text-[#f5f5f7] lg:text-[16px]">
              Пишете ни или се обадете — ще ви помогнем със записването.
            </p>
            <YellowButton href="/contacts" className="mt-[28px] w-[259px] max-w-full">
              Свържете се с нас
            </YellowButton>
          </div>
        </section>
      </main>

      <Footer content={footer} socialLinks={settings?.socials} />
    </>
  );
}
