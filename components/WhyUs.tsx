import Badge from "./Badge";
import { mediaUrl, t } from "@/lib/cms";
import type { HomePage } from "@/payload-types";

const featureCards = [
  {
    bg: "#e3effd",
    mobileBg: "#e3effd",
    circle: "/icons/circle-blue.svg",
    mobileCircle: "/icons/circle-blue.svg",
    icon: "/icons/park.svg",
    iconSize: 20,
    mobileIconSize: 17,
    title: "Сред природата",
    desc: "Прекарай ден сред зеленина и спокойствие, където приключението и природата се срещат на едно място.",
  },
  {
    bg: "#faf7ee",
    mobileBg: "#fef2e6",
    circle: "/icons/circle-green.svg",
    mobileCircle: "/icons/circle-peach.svg",
    icon: "/icons/attractions.svg",
    iconSize: 18,
    mobileIconSize: 17,
    title: "Въжено съоръжение",
    desc: "Маршрути с различни нива на трудност, подходящи за начинаещи и любители на новите предизвикателства.",
  },
  {
    bg: "#eff7e0",
    mobileBg: "#eff7e0",
    circle: "/icons/circle-green.svg",
    mobileCircle: "/icons/circle-green.svg",
    icon: "/icons/accessibility.svg",
    iconSize: 18,
    mobileIconSize: 18,
    title: "За всяка компания",
    desc: "Идеално място за семейства, приятели и организирани групи, които търсят активно преживяване.",
  },
  {
    bg: "#f2f7fd",
    mobileBg: "#f2f7fd",
    circle: "/icons/circle-green.svg",
    mobileCircle: "/icons/circle-sky.svg",
    icon: "/icons/fork-spoon.svg",
    iconSize: 17,
    mobileIconSize: 16,
    title: "Ресторант",
    desc: "Отпусни се след приключението с вкусна храна и приятна атмосфера край езерото.",
  },
];

const tags = [
  { label: "За Атракцията", width: "w-[113px]", mobileWidth: "w-[109px]" },
  { label: "Край езерото", width: "w-[106px]", mobileWidth: "w-[91px]" },
];

const whyText =
  "Fun Park Ezero съчетава въжено приключение, природа и споделени моменти на едно място. Създаден за всички, които обичат активното време на открито.";

export default function WhyUs({ content }: { content?: HomePage["whyUs"] }) {
  const badge = t(content?.badge, "Защо нас");
  const heading = t(content?.heading, "Защо да избереш Fun Park Ezero?");
  const text = t(content?.text, whyText);
  // цветовете, иконите и ширините остават от кода — от CMS идва само текстът
  const tagList = tags.map((tag, i) => ({
    ...tag,
    label: t(content?.tags?.[i]?.label, tag.label),
  }));
  const cards = featureCards.map((card, i) => ({
    ...card,
    title: t(content?.cards?.[i]?.title, card.title),
    desc: t(content?.cards?.[i]?.desc, card.desc),
  }));
  const image = mediaUrl(content?.image, "/images/why-park.jpg");
  const imageMobile = mediaUrl(content?.imageMobile, "/images/why-park-mobile.jpg");

  return (
    <>
      {/* Мобилен вариант */}
      <section className="pt-[40px] lg:hidden">
        <div className="flex justify-center">
          <span className="flex h-[30px] w-[86px] items-center justify-center rounded-[14.842px] border-[0.742px] border-[#3f3f46] text-[10px] font-medium leading-[1.3] tracking-[0.1px] text-[#545454]">
            {badge}
          </span>
        </div>

        <div className="relative mx-[16px] mt-[33px] h-[495px] overflow-hidden rounded-[5px]">
          <img
            src={imageMobile}
            alt="Въженото съоръжение на Fun Park Ezero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <h3
            className="absolute left-[17px] top-[38px] w-[211px] bg-clip-text font-golos text-[23px] font-bold leading-[25.8px] text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(180.18deg, rgb(255, 255, 255) 31.896%, rgb(178, 178, 178) 270.46%)",
            }}
          >
            {heading}
          </h3>
          {/* Значки и текстът върху снимката — както в десктоп версията */}
          <div className="absolute inset-x-[17px] bottom-[20px]">
            <div className="flex gap-[5px]">
              {tagList.map((tag) => (
                <span
                  key={tag.label}
                  className={`flex h-[30px] items-center justify-center rounded-[20px] border-[0.698px] border-offwhite text-center text-[10px] leading-[1.3] tracking-[0.1px] text-white ${tag.mobileWidth}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
            <p className="mt-[12px] text-[12px] leading-[1.3] tracking-[0.12px] text-white">
              {text}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-[67px] grid max-w-[370px] grid-cols-2 gap-x-[16px] gap-y-[11px] px-[16px]">
          {cards.map((card) => (
            <div
              key={card.title}
              className="relative h-[187px] w-full rounded-[5.145px] shadow-[0px_5.861px_17.582px_0px_rgba(0,0,0,0.08)]"
              style={{ backgroundColor: card.mobileBg }}
            >
              <div className="absolute right-[15px] top-[15px] flex size-[34px] items-center justify-center">
                <img src={card.mobileCircle} alt="" className="absolute inset-0 size-full" />
                <img
                  src={card.icon}
                  alt=""
                  className="relative"
                  style={{ width: card.mobileIconSize, height: card.mobileIconSize }}
                />
              </div>
              <h4 className="absolute left-[14px] right-[50px] top-[51px] font-golos text-[16px] font-semibold leading-[1.15] tracking-[0.16px] text-ink">
                {card.title}
              </h4>
              <p className="absolute left-[14px] right-[11px] top-[95px] text-[11px] leading-[1.3] tracking-[0.11px] text-[#5b5b5b]">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Десктоп вариант */}
      <section className="mx-auto hidden max-w-[1512px] pt-[112px] lg:block">
        <div className="flex justify-center">
          <Badge>{badge}</Badge>
        </div>

        <div className="mt-[60px] flex justify-center gap-[24px] px-[32px]">
          {/* Голяма снимка с текст */}
          <div className="relative h-[597px] w-[712px] shrink-0 overflow-hidden rounded-[10px]">
            <img
              src={image}
              alt="Въженото съоръжение на Fun Park Ezero"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
            <h3
              className="absolute left-[40px] top-[68px] w-[317px] bg-clip-text font-golos text-[35px] font-extrabold leading-[35.037px] text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(180.24deg, rgb(255, 255, 255) 31.896%, rgb(178, 178, 178) 270.46%)",
              }}
            >
              {heading}
            </h3>
            <div className="absolute left-[40px] top-[500px] flex gap-[15px]">
              {tagList.map((tag) => (
                <span
                  key={tag.label}
                  className={`flex h-[31.946px] items-center justify-center rounded-[20px] border border-offwhite text-center text-[12px] leading-[1.3] tracking-[0.12px] text-white ${tag.width}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
            <p className="absolute left-[40px] top-[547px] w-[585px] text-[12px] leading-[1.3] tracking-[0.12px] text-white">
              {text}
            </p>
          </div>

          {/* Карти 2x2 */}
          <div className="grid shrink-0 grid-cols-2 gap-x-[24px] gap-y-[25px]">
            {cards.map((card) => (
              <div
                key={card.title}
                className="relative h-[285.5px] w-[344px] rounded-[10px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.08)]"
                style={{ backgroundColor: card.bg }}
              >
                <div className="absolute right-[22px] top-[22px] flex size-[59px] items-center justify-center">
                  <img src={card.circle} alt="" className="absolute inset-0 size-full" />
                  <img
                    src={card.icon}
                    alt=""
                    className="relative"
                    style={{ width: card.iconSize, height: card.iconSize }}
                  />
                </div>
                <div className="absolute left-[27px] top-[119px] flex h-[58px] w-[190px] items-end">
                  <h4 className="font-golos text-[25px] font-semibold leading-[1.15] tracking-[0.25px] text-ink">
                    {card.title}
                  </h4>
                </div>
                <p className="absolute left-[27px] top-[190px] w-[295px] text-[15px] leading-[1.3] tracking-[0.15px] text-[#5b5b5b]">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
