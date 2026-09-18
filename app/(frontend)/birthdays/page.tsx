import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ComingSoon, { comingSoonEnabled } from "@/components/ComingSoon";
import Badge from "@/components/Badge";
import YellowButton from "@/components/YellowButton";
import PackageEnquiryModal, {
  type EnquiryLabels,
} from "@/components/PackageEnquiryModal";
import { t } from "@/lib/cms";
import {
  getBirthdaysPage,
  getFooter,
  getHeader,
  getPackages,
  getSiteSettings,
} from "@/lib/cms.server";
import type { Package } from "@/payload-types";

export const metadata: Metadata = {
  title: "Рожденни дни | Fun Park Ezero",
  description:
    "Пакети за рожден ден с ползване на Въздушна Въжена градина — храна за деца и възрастни, напитки и включена сесия.",
};

export const revalidate = 60;

export default async function BirthdaysPage() {
  const [page, header, footer, settings, packages] = await Promise.all([
    getBirthdaysPage(),
    getHeader(),
    getFooter(),
    getSiteSettings(),
    getPackages(),
  ]);

  // при включен режим „Очаквайте скоро“ страницата показва само екрана
  if (await comingSoonEnabled()) return <ComingSoon settings={settings} />;

  const hero = {
    badge: t(page?.hero?.badge, "Рожденни дни"),
    title: t(page?.hero?.title, "Празнувайте при нас"),
    titleAccent: t(page?.hero?.titleAccent, "с готов пакет"),
    text: t(
      page?.hero?.text,
      "Изберете пакет според броя гости — храната, напитките и сесията на Въздушната Въжена градина са включени. Изпратете запитване и ще потвърдим датата.",
    ),
  };

  const ctaLabel = t(page?.packages?.ctaLabel, "Запитване");
  const capacityTemplate = t(
    page?.packages?.capacityLabel,
    "до {children} деца · до {adults} възрастни",
  );
  const drinksTitle = t(page?.packages?.drinksTitle, "Напитки");

  const labels: EnquiryLabels = {
    title: t(page?.form?.title, "Запитване за пакет"),
    intro: t(
      page?.form?.intro,
      "Оставете данни за връзка и ще се свържем с вас за датата и детайлите.",
    ),
    nameLabel: t(page?.form?.nameLabel, "Име"),
    namePlaceholder: t(page?.form?.namePlaceholder, "Вашето име"),
    phoneLabel: t(page?.form?.phoneLabel, "Телефон"),
    phonePlaceholder: t(page?.form?.phonePlaceholder, "+359 875 2365"),
    emailLabel: t(page?.form?.emailLabel, "Имейл"),
    emailPlaceholder: t(page?.form?.emailPlaceholder, "your@email.com"),
    messageLabel: t(page?.form?.messageLabel, "Съобщение"),
    messagePlaceholder: t(
      page?.form?.messagePlaceholder,
      "Дата, час, брой гости или друг въпрос…",
    ),
    submitLabel: t(page?.form?.submitLabel, "Изпрати запитване"),
    successMessage: t(
      page?.form?.successMessage,
      "Благодарим! Получихме запитването и ще се свържем с вас възможно най-скоро.",
    ),
    errorMessage: t(
      page?.form?.errorMessage,
      "Нещо се обърка при изпращането. Опитайте отново или ни се обадете.",
    ),
  };

  const cta = {
    title: t(page?.cta?.title, "Имате друга идея за празника?"),
    text: t(
      page?.cta?.text,
      "Пишете ни и ще съберем пакет според вашите гости, меню и часове.",
    ),
    ctaLabel: t(page?.cta?.ctaLabel, "Свържете се с нас"),
  };

  const capacityLabel = (children?: number | null, adults?: number | null) =>
    capacityTemplate
      .replace("{children}", String(children ?? ""))
      .replace("{adults}", String(adults ?? ""));

  /** „Брой гости“ от CMS; ако е празно — сглобява се от старите две числа. */
  const guestLimitFor = (p: Package) => {
    const own = t(p.guestLimit, "");
    if (own !== "") return own;
    return p.childrenMax || p.adultsMax
      ? capacityLabel(p.childrenMax, p.adultsMax)
      : "";
  };

  /** Цената е само в евро — знакът се добавя тук. */
  const priceLabel = (p: Package) => {
    if (typeof p.priceEuro === "number") {
      const rounded = Math.round(p.priceEuro * 100) / 100;
      return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)} €`;
    }
    // резервно: старото текстово поле, ако новото още не е попълнено
    return t(p.priceEur, "");
  };

  /**
   * Двата списъка („За родители“ и „За деца“). Ако още не са попълнени,
   * се ползва старото поле „Меню“, за да не изчезне съдържание.
   */
  const menuSectionsFor = (p: Package) => {
    const parents = (p.parentsItems ?? [])
      .map((i) => t(i.text, ""))
      .filter((x) => x !== "");
    const children = (p.childrenItems ?? [])
      .map((i) => t(i.text, ""))
      .filter((x) => x !== "");

    if (parents.length > 0 || children.length > 0) {
      return [
        { title: "Родители", items: parents },
        { title: "Деца", items: children },
      ].filter((g) => g.items.length > 0);
    }

    return (p.menuGroups ?? []).map((g) => ({
      title: t(g.title, ""),
      items: (g.items ?? []).map((i) => t(i.text, "")).filter((x) => x !== ""),
    }));
  };

  /** Една карта на пакет — разметката е една и съща за всички групи. */
  const renderCard = (p: Package) => (
    <div
      key={p.id}
      className="flex flex-col rounded-[10px] bg-offwhite p-[20px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)] lg:p-[28px]"
    >
      {guestLimitFor(p) !== "" && (
        <span className="self-start rounded-full bg-[rgba(106,142,78,0.12)] px-[12px] py-[6px] font-golos text-[11.5px] font-semibold uppercase tracking-[0.8px] text-forest">
          {guestLimitFor(p)}
        </span>
      )}

      <h3 className="mt-[14px] font-golos text-[17px] font-bold leading-[1.3] text-ink lg:text-[18px]">
        {p.title}
      </h3>

      <div className="mt-[16px] flex flex-wrap items-baseline gap-x-[10px] gap-y-[4px]">
        <span className="font-golos text-[30px] font-extrabold leading-none text-forest lg:text-[34px]">
          {priceLabel(p)}
        </span>
      </div>
      {p.duration && (
        <p className="mt-[6px] font-golos text-[13.5px] text-[#545454]">
          Времетраене {p.duration}
        </p>
      )}

      {p.sessionInfo && (
        <p className="mt-[14px] rounded-[9px] bg-[rgba(244,198,63,0.18)] px-[12px] py-[10px] font-golos text-[13px] leading-[1.45] text-[#3f3f46]">
          {p.sessionInfo}
        </p>
      )}

      {/* Меню по групи */}
      <div className="mt-[18px] flex flex-col gap-[16px]">
        {menuSectionsFor(p).map((group, gi) => (
          <div key={gi}>
            <p className="font-golos text-[11.5px] font-bold uppercase tracking-[1.2px] text-[#a1a1aa]">
              {group.title}
            </p>
            <ul className="mt-[8px] flex flex-col gap-[6px]">
              {group.items.map((item, ii) => (
                <li
                  key={ii}
                  className="flex gap-[8px] font-golos text-[13px] leading-[1.45] text-[#3f3f46]"
                >
                  <span className="mt-[7px] size-[5px] shrink-0 rounded-full bg-leaf" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {(p.drinks ?? []).length > 0 && (
          <div>
            <p className="font-golos text-[11.5px] font-bold uppercase tracking-[1.2px] text-[#a1a1aa]">
              {drinksTitle}
            </p>
            <ul className="mt-[8px] flex flex-col gap-[6px]">
              {(p.drinks ?? []).map((d, di) => (
                <li
                  key={di}
                  className="flex gap-[8px] font-golos text-[13px] leading-[1.45] text-[#3f3f46]"
                >
                  <span className="mt-[7px] size-[5px] shrink-0 rounded-full bg-leaf" />
                  <span>{d.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {p.note && (
        <p className="mt-[14px] font-golos text-[12.5px] leading-[1.45] text-[#a1a1aa]">
          {p.note}
        </p>
      )}

      {/* Бутонът е долепен до долния край, за да са картите изравнени */}
      <div className="mt-auto">
        <PackageEnquiryModal
          packageId={p.id}
          packageTitle={p.title}
          ctaLabel={t(p.enquiryButtonLabel, ctaLabel)}
          labels={labels}
        />
      </div>
    </div>
  );

  /** Цената като число — от новото поле „Цена (€)“, иначе от старото текстово. */
  const priceValue = (p: Package) => {
    if (typeof p.priceEuro === "number") return p.priceEuro;
    const raw = (p.priceEur ?? "").replace(/[^\d.,]/g, "").replace(",", ".");
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
  };

  /** В групата редът се определя от полето „Подредба“; при равни — по цена. */
  const byOrder = (a: Package, b: Package) => {
    const diff = (a.order ?? 0) - (b.order ?? 0);
    return diff !== 0 ? diff : priceValue(a) - priceValue(b);
  };

  const cheapest = (items: Package[]) =>
    items.length > 0
      ? Math.min(...items.map(priceValue))
      : Number.POSITIVE_INFINITY;

  /**
   * Групи по уред, подредени по най-евтиния пакет в групата.
   * Пакет без избран уред влиза в последна група без заглавие, за да не
   * изчезне от страницата.
   */
  const apparatusGroups = [
    {
      key: "aerial",
      title: t(
        page?.packages?.aerialTitle,
        "Пакети с Уред Въздушна Въжена градина",
      ),
      text: t(page?.packages?.aerialText, ""),
      items: packages.filter((p) => p.apparatus === "aerial").sort(byOrder),
    },
    {
      key: "hexagon",
      title: t(page?.packages?.hexagonTitle, "Пакети с Уред Хексагон"),
      text: t(page?.packages?.hexagonText, ""),
      items: packages.filter((p) => p.apparatus === "hexagon").sort(byOrder),
    },
  ]
    .filter((g) => g.items.length > 0)
    .sort((a, b) => cheapest(a.items) - cheapest(b.items));

  const ungrouped = packages
    .filter((p) => p.apparatus !== "aerial" && p.apparatus !== "hexagon")
    .sort(byOrder);

  const groups =
    ungrouped.length > 0
      ? [
          ...apparatusGroups,
          { key: "other", title: "", text: "", items: ungrouped },
        ]
      : apparatusGroups;

  return (
    <>
      <Header
        nav={header?.navItems}
        searchPlaceholder={header?.searchPlaceholder}
        socialLinks={settings?.socials}
      />

      <main className="overflow-x-clip">
        {/* Заглавна част */}
        <section className="relative mx-[16px] mt-[14px] rounded-[10px] bg-cream px-[16px] pb-[40px] pt-[48px] lg:mx-[32px] lg:px-[24px] lg:pb-[64px] lg:pt-[80px]">
          <div className="flex flex-col items-center text-center">
            <Badge>{hero.badge}</Badge>
            <h1 className="mt-[28px] font-golos text-[32px] font-black leading-[1.1] text-ink lg:mt-[40px] lg:text-[55px]">
              {hero.title}{" "}
              <span className="bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-transparent">
                {hero.titleAccent}
              </span>
            </h1>
            <p className="mx-auto mt-[18px] max-w-[576px] font-golos text-[14px] leading-[1.5] text-[#545454] lg:mt-[29px] lg:text-[16px] lg:leading-[1.6] lg:text-[#3f3f46]">
              {hero.text}
            </p>
          </div>
        </section>

        {/* Пакети, групирани по уред */}
        {groups.map((g) => (
          <section
            key={g.key}
            className="mx-[16px] mt-[40px] lg:mx-[32px] lg:mt-[64px]"
          >
            {g.title !== "" && (
              <div className="text-center lg:text-left">
                <h2 className="font-golos text-[22px] font-extrabold leading-[1.2] text-ink lg:text-[28px]">
                  {g.title}
                </h2>
                {g.text !== "" && (
                  <p className="mx-auto mt-[8px] max-w-[576px] font-golos text-[14px] leading-[1.5] text-[#545454] lg:mx-0 lg:max-w-[640px]">
                    {g.text}
                  </p>
                )}
              </div>
            )}
            <div className="mt-[20px] grid gap-[20px] md:grid-cols-2 lg:mt-[28px] lg:grid-cols-3 lg:gap-[24px]">
              {g.items.map(renderCard)}
            </div>
          </section>
        ))}

        {/* Долен призив */}
        <section className="mx-[16px] mb-[60px] mt-[40px] lg:mx-[32px] lg:mb-[86px] lg:mt-[64px]">
          <div className="flex flex-col items-center rounded-[10px] bg-forest px-[16px] py-[48px] text-center lg:px-[24px] lg:py-[64px]">
            <h2 className="font-golos text-[25px] font-semibold leading-[1.2] text-white lg:text-[35px]">
              {cta.title}
            </h2>
            <p className="mt-[12px] max-w-[520px] font-golos text-[14px] leading-[1.5] text-[#f5f5f7] lg:text-[16px]">
              {cta.text}
            </p>
            <YellowButton href="/contacts" className="mt-[28px] w-[259px] max-w-full">
              {cta.ctaLabel}
            </YellowButton>
          </div>
        </section>
      </main>

      <Footer content={footer} socialLinks={settings?.socials} />
    </>
  );
}
