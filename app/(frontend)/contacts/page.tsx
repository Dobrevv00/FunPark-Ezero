import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Badge from "@/components/Badge";
import YellowButton from "@/components/YellowButton";
import ContactForm from "@/components/ContactForm";
import { mediaUrl, t } from "@/lib/cms";
import {
  getContactsPage,
  getFooter,
  getHeader,
  getSiteSettings,
} from "@/lib/cms.server";

export const metadata: Metadata = {
  title: "Контакти | Fun Park Ezero",
  description:
    "Имате въпроси за нашите услуги или искате да организирате специално събитие? Нашият екип е на разположение да ви съдейства.",
};

const infoColumns = [
  {
    icon: "/icons/location-w.svg",
    iconClass: "h-[24px] w-[20px]",
    label: "Локация",
    lines: ["ул. „Димитър Димов“,", "8000 Бургас"],
  },
  {
    icon: "/icons/call-w.svg",
    iconClass: "size-[23px]",
    label: "Контакти",
    lines: ["inquiries@kavatsi.com", "+359 800 548 568"],
  },
  {
    icon: "/icons/schedule-w.svg",
    iconClass: "size-[31px]",
    label: "Работно време",
    lines: ["Всеки ден", "09:00 – 18:00"],
  },
];

function IconSquare({ col }: { col: (typeof infoColumns)[number] }) {
  return (
    <span className="flex size-[49px] items-center justify-center rounded-[10px] bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%]">
      <img src={col.icon} alt="" className={col.iconClass} />
    </span>
  );
}

export const revalidate = 60;

export default async function ContactsPage() {
  const [page, header, footer, settings] = await Promise.all([
    getContactsPage(),
    getHeader(),
    getFooter(),
    getSiteSettings(),
  ]);

  const hero = {
    badge: t(page?.hero?.badge, "Контакти"),
    title: t(page?.hero?.title, "Свържете се"),
    titleAccent: t(page?.hero?.titleAccent, "с нас"),
    text: t(
      page?.hero?.text,
      "Имате въпроси за нашите услуги или искате да организирате специално събитие? Нашият екип е на разположение да ви съдейства.",
    ),
    image: mediaUrl(page?.hero?.image, "/images/contact-hero.jpg"),
  };
  const info = {
    title: t(page?.info?.title, "Информация за контакт"),
    text: t(
      page?.info?.text,
      "На разположение сме да отговорим на въпросите ти и да ти помогнем при избора на твоя нов дом.",
    ),
  };
  const cols = infoColumns.map((col, i) => {
    const cms = page?.info?.columns?.[i];
    return {
      ...col,
      label: t(cms?.label, col.label),
      lines: col.lines.map((line, j) => t(cms?.lines?.[j]?.text, line)),
    };
  });
  const form = {
    badge: t(page?.form?.badge, "Контакти"),
    titleBefore: t(
      page?.form?.titleBefore,
      "Имате въпрос относно резервация, събитие или посещение?",
    ),
    titleAccent: t(page?.form?.titleAccent, "Свържете се с нас"),
    titleAfter: t(page?.form?.titleAfter, "и ще ви отговорим възможно най-скоро"),
    text: t(
      page?.form?.text,
      "На разположение сме да отговорим на въпросите ти и да ти помогнем при избора на твоя нов дом.",
    ),
  };
  const map = {
    title: t(page?.map?.title, "Къде да ни намерите"),
    addressLine: t(page?.map?.addressLine, "ул. „Димитър Димов“, 8000 Бургас"),
    image: mediaUrl(page?.map?.image, "/images/map.jpg"),
  };
  const cta = {
    titleDesktop: t(page?.cta?.titleDesktop, "Готови ли сте за приключение?"),
    titleMobileLine1: t(page?.cta?.titleMobileLine1, "Готови ли сте за"),
    titleMobileLine2: t(page?.cta?.titleMobileLine2, "приключение?"),
    text: t(
      page?.cta?.text,
      "Резервирайте своя час днес и си гарантирайте незабравими спомени.",
    ),
    ctaLabelDesktop: t(page?.cta?.ctaLabelDesktop, "Резервирай сега"),
    ctaLabelMobile: t(page?.cta?.ctaLabelMobile, "Абонирай се"),
  };

  return (
    <>
      <Header
        nav={header?.navItems}
        searchPlaceholder={header?.searchPlaceholder}
        socialLinks={settings?.socials}
      />

      {/* ===== Мобилна версия ===== */}
      <main className="overflow-x-clip bg-white pb-[85px] lg:hidden">
        {/* Херо */}
        <section className="relative mt-[14px] pb-[28px]">
          <div className="absolute inset-0 rounded-[10px] bg-cream" />
          <div className="relative px-[16px]">
            <div className="flex justify-center pt-[48px]">
              <Badge>{hero.badge}</Badge>
            </div>
            <h1 className="mt-[82px] text-center font-golos text-[46.088px] font-black leading-[43.574px] text-ink">
              {hero.title}{" "}
              <span className="bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-transparent">
                {hero.titleAccent}
              </span>
            </h1>
            <p className="mx-auto mt-[23px] w-[337px] max-w-full text-center text-[12.7px] leading-[1.3] tracking-[0.127px] text-[#545454]">
              {hero.text}
            </p>
            <div className="mt-[48px] h-[442px] overflow-hidden rounded-[10px]">
              <img
                src={hero.image}
                alt="Fun Park Ezero отвисоко"
                className="h-full w-full object-cover"
                style={{ objectPosition: "34% 50%" }}
              />
            </div>
          </div>
        </section>

        {/* Информация за контакт */}
        <section className="mt-[59px]">
          <h2 className="mx-auto max-w-[307px] text-center font-golos text-[25px] font-bold leading-[1.15] tracking-[0.25px] text-ink">
            {info.title}
          </h2>
          <p className="mx-auto mt-[10px] max-w-[307px] text-center text-[14px] leading-[1.26] tracking-[0.14px] text-[#545454]">
            {info.text}
          </p>
          <div className="mt-[67px] flex flex-col gap-[25px] px-[16px]">
            {cols.map((col) => (
              <div
                key={col.label}
                className="flex h-[256px] flex-col items-center rounded-[10px] bg-white pt-[58px] drop-shadow-[0px_11.389px_17.084px_rgba(0,0,0,0.05)]"
              >
                <IconSquare col={col} />
                <p className="mt-[18px] text-center text-[18px] font-bold leading-[16px] tracking-[1.2px] text-black">
                  {col.label}
                </p>
                <div className="mt-[22px] text-center text-[14px] leading-[23px] text-black">
                  {col.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Форма за запитване */}
        <section className="mt-[95px] px-[16px]">
          <span className="mx-auto flex h-[30px] w-[96px] items-center justify-center rounded-[20px] border-[0.742px] border-[#3f3f46] text-[10px] font-medium leading-[1.3] tracking-[0.1px] text-[#545454]">
            {form.badge}
          </span>
          <h2 className="mt-[35px] text-center font-golos text-[25px] font-bold leading-[1.15] tracking-[0.25px] text-ink">
            {form.titleBefore}{" "}
            <span className="bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-transparent">
              {form.titleAccent}
            </span>{" "}
            {form.titleAfter}
          </h2>
          <p className="mt-[30px] text-center text-[14px] leading-[1.3] tracking-[0.14px] text-[#545454]">
            {info.text}
          </p>
          <ContactForm mobile content={page?.form} />
        </section>

        {/* Карта */}
        <section className="mt-[65px] px-[16px]">
          <h2 className="text-center font-golos text-[25px] font-bold leading-[1.15] tracking-[0.25px] text-ink">
            {map.title}
          </h2>
          <p className="mx-auto mt-[10px] max-w-[307px] text-center text-[14px] leading-[1.26] tracking-[0.14px] text-[#545454]">
            {map.addressLine}
          </p>
          <div className="relative mt-[24px] h-[367px] overflow-hidden rounded-[10px]">
            <img
              src={map.image}
              alt="Картата на Бургас с локацията на Fun Park Ezero"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            {/* при тесния кадър пинът е центриран спрямо позицията си, за да не излиза извън картата */}
            <img
              src="/icons/map-pin.svg"
              alt=""
              className="absolute left-[68%] top-[46%] h-[59px] w-[49px] -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        </section>

        {/* CTA */}
        <section className="mx-[16px] mt-[29px]">
          <div className="flex h-[278px] flex-col items-center rounded-[10px] bg-forest px-[16px] pt-[74px] text-center">
            <h2 className="font-golos text-[25px] font-semibold leading-[27px] text-white">
              {cta.titleMobileLine1}
              <br />
              {cta.titleMobileLine2}
            </h2>
            <p className="mt-[16px] w-[255px] text-[14px] leading-[18px] text-[#f5f5f7]">
              {cta.text}
            </p>
            <YellowButton className="mt-[31px] w-[330px] max-w-full">
              {cta.ctaLabelMobile}
            </YellowButton>
          </div>
        </section>
      </main>

      {/* ===== Десктоп версия ===== */}
      <main className="hidden overflow-x-clip bg-[#f5f5f7] pb-[86px] lg:block">
        {/* Херо */}
        <section className="relative h-[851px]">
          <div className="absolute left-[31px] right-[32px] top-0 h-[851px] rounded-[10px] bg-cream" />
          <div className="relative flex flex-col items-center px-[24px] pt-[80px] text-center">
            <Badge>{hero.badge}</Badge>
            <h1 className="mt-[40px] font-golos text-[55px] font-extrabold text-ink">
              {hero.title}{" "}
              <span className="bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-transparent">
                {hero.titleAccent}
              </span>
            </h1>
            <p className="mt-[29px] max-w-[576px] font-golos text-[16px] leading-[1.6] text-[#3f3f46]">
              {hero.text}
            </p>
          </div>
          <div className="relative mx-[32px] mt-[63px] h-[470px] overflow-hidden rounded-[10px]">
            <img
              src={hero.image}
              alt="Fun Park Ezero отвисоко"
              className="h-full w-full object-cover"
              style={{ objectPosition: "center 65%" }}
            />
          </div>
        </section>

        {/* Информация за контакт */}
        <section className="relative ml-[31px] mr-[33px] mt-[60px] h-[496px] rounded-[10px] bg-offwhite">
          <h2 className="pt-[53px] text-center font-golos text-[35px] font-bold leading-[1.3] tracking-[0.35px] text-black">
            {info.title}
          </h2>
          <p className="mx-auto mt-[15px] max-w-[464px] px-[24px] text-center text-[18px] leading-[1.3] tracking-[0.18px] text-black">
            {info.text}
          </p>
          <div className="mt-[80px] grid grid-cols-3 items-start px-[100px]">
            {cols.map((col) => (
              <div key={col.label} className="flex flex-col items-center">
                <IconSquare col={col} />
                <p className="mt-[28px] text-center text-[18px] font-semibold leading-[16px] tracking-[1.2px] text-black">
                  {col.label}
                </p>
                <div className="mt-[20px] text-center text-[16px] leading-[26px] text-black">
                  {col.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Форма за запитване */}
        <section className="relative mx-[32px] mt-[50px] h-[727px] rounded-[10px] bg-offwhite shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
          <div className="absolute left-[121px] top-[93px] w-[464px]">
            <Badge>{hero.badge}</Badge>
            <h2 className="mt-[35px] font-golos text-[35px] font-bold leading-[1.15] tracking-[0.35px] text-ink">
              {form.titleBefore}{" "}
              <span className="bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-transparent">
                {form.titleAccent}
              </span>{" "}
              {form.titleAfter}
            </h2>
            <p className="mt-[18px] max-w-[467px] text-[18px] leading-[1.3] tracking-[0.18px] text-[#545454]">
              {form.text}
            </p>
          </div>
          <ContactForm mobile={false} content={page?.form} />
        </section>

        {/* Карта */}
        <section className="mx-[32px] mt-[61px]">
          <h2 className="text-center font-golos text-[35px] font-bold leading-[1.3] tracking-[0.35px] text-ink">
            {map.title}
          </h2>
          <p className="mx-auto mt-[12px] max-w-[464px] text-center text-[18px] leading-[1.3] tracking-[0.18px] text-[#545454]">
            {map.addressLine}
          </p>
          <div className="relative mt-[32px] h-[475px] overflow-hidden rounded-[10px]">
            <img
              src={map.image}
              alt="Картата на Бургас с локацията на Fun Park Ezero"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <img
              src="/icons/map-pin.svg"
              alt=""
              className="absolute left-[73.27%] top-[48.8%] h-[98.85px] w-[82.82px]"
            />
          </div>
        </section>

        {/* CTA */}
        <section className="mx-[32px] mt-[73px]">
          <div className="flex h-[295.229px] flex-col items-center rounded-[10px] bg-forest px-[24px] pt-[85px] text-center">
            <h2 className="font-golos text-[35px] font-semibold leading-[46.543px] text-white">
              {cta.titleDesktop}
            </h2>
            <p className="mt-[6px] text-[16px] leading-[21px] text-white">
              {cta.text}
            </p>
            <YellowButton booking className="mt-[35px] w-[259px]">
              {cta.ctaLabelDesktop}
            </YellowButton>
          </div>
        </section>
      </main>

      <Footer content={footer} socialLinks={settings?.socials} />
    </>
  );
}
