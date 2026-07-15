import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Badge from "@/components/Badge";
import YellowButton from "@/components/YellowButton";

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
    lines: ["442 Architectural Blvd,", "Suite 900 New York, NY"],
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
    lines: ["Mon — Fri: 09:00 - 18:00", "Sat: By Appointment Only"],
  },
];

const formFields = [
  { label: "Име", placeholder: "Вашето име", type: "text" },
  { label: "Телефон", placeholder: "+359 875 2365", type: "tel" },
  { label: "Имейл", placeholder: "your@email.com", type: "email" },
];

const labelGradient = {
  backgroundImage:
    "linear-gradient(179.62deg, rgb(129, 96, 63) 29.235%, rgb(27, 20, 13) 73.226%)",
};

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="overflow-x-clip bg-[#f5f5f7] pb-[86px]">
        {/* Херо */}
        <section className="relative pb-[24px] lg:h-[851px] lg:pb-0">
          <div className="absolute inset-x-[16px] top-0 h-full rounded-[10px] bg-cream lg:left-[31px] lg:right-[32px] lg:h-[851px]" />
          <div className="relative flex flex-col items-center px-[24px] pt-[80px] text-center">
            <Badge>Контакти</Badge>
            <h1 className="mt-[40px] font-golos text-[36px] font-extrabold text-ink lg:text-[55px]">
              Свържете се{" "}
              <span className="bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-transparent">
                с нас
              </span>
            </h1>
            <p className="mt-[29px] max-w-[576px] font-golos text-[16px] leading-[1.6] text-[#3f3f46]">
              Имате въпроси за нашите услуги или искате да организирате
              специално събитие? Нашият екип е на разположение да ви съдейства.
            </p>
          </div>
          <div className="relative mx-[16px] mt-[63px] h-[240px] overflow-hidden rounded-[10px] lg:mx-[32px] lg:h-[470px]">
            <img
              src="/images/contact-hero.jpg"
              alt="Fun Park Ezero отвисоко"
              className="h-full w-full object-cover"
              style={{ objectPosition: "center 65%" }}
            />
          </div>
        </section>

        {/* Информация за контакт */}
        <section className="mx-[16px] mt-[60px] rounded-[10px] bg-offwhite pb-[60px] lg:relative lg:ml-[31px] lg:mr-[33px] lg:h-[496px] lg:pb-0">
          <h2 className="pt-[53px] text-center font-golos text-[28px] font-bold leading-[1.3] tracking-[0.35px] text-black lg:text-[35px]">
            Информация за контакт
          </h2>
          <p className="mx-auto mt-[15px] max-w-[464px] px-[24px] text-center text-[18px] leading-[1.3] tracking-[0.18px] text-black">
            На разположение сме да отговорим на въпросите ти и да ти помогнем
            при избора на твоя нов дом.
          </p>
          <div className="mt-[40px] flex flex-col items-center gap-[40px] lg:mt-[80px] lg:grid lg:grid-cols-3 lg:items-start lg:gap-0 lg:px-[100px]">
            {infoColumns.map((col) => (
              <div key={col.label} className="flex flex-col items-center">
                <span className="flex size-[49px] items-center justify-center rounded-[10px] bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%]">
                  <img src={col.icon} alt="" className={col.iconClass} />
                </span>
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
        <section className="mx-[16px] mt-[50px] rounded-[10px] bg-offwhite p-[24px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)] lg:relative lg:mx-[32px] lg:h-[727px] lg:p-0">
          <div className="lg:absolute lg:left-[121px] lg:top-[93px] lg:w-[464px]">
            <Badge>Контакти</Badge>
            <h2 className="mt-[35px] font-golos text-[28px] font-bold leading-[1.15] tracking-[0.35px] text-ink lg:text-[35px]">
              Имате въпрос относно резервация, събитие или посещение?{" "}
              <span className="bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-transparent">
                Свържете се с нас
              </span>{" "}
              и ще ви отговорим възможно най-скоро
            </h2>
            <p className="mt-[18px] max-w-[467px] text-[18px] leading-[1.3] tracking-[0.18px] text-[#545454]">
              На разположение сме да отговорим на въпросите ти и да ти помогнем
              при избора на твоя нов дом.
            </p>
          </div>

          <form className="mt-[40px] flex flex-col gap-[23px] lg:absolute lg:left-[736px] lg:top-[82px] lg:mt-0 lg:w-[589px]">
            {formFields.map((f) => (
              <div key={f.label} className="flex flex-col">
                <label
                  className="mb-[8px] bg-clip-text text-[16.386px] leading-[1.3] tracking-[0.164px] text-transparent"
                  style={labelGradient}
                >
                  {f.label}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  className="h-[41px] w-full rounded-[9.104px] bg-[rgba(161,161,170,0.15)] pl-[6px] pr-[12px] text-[16.386px] tracking-[0.164px] text-ink outline-none placeholder:text-black/30"
                />
              </div>
            ))}
            <div className="flex flex-col">
              <label
                className="mb-[8px] bg-clip-text text-[16.386px] leading-[1.3] tracking-[0.164px] text-transparent"
                style={labelGradient}
              >
                Съобщение
              </label>
              <textarea
                placeholder="Въпроси и коментари..."
                className="h-[166.6px] w-full resize-none rounded-[9.104px] bg-[rgba(161,161,170,0.15)] px-[6px] py-[13px] text-[16.386px] tracking-[0.164px] text-ink outline-none placeholder:text-black/30"
              />
            </div>
            <YellowButton className="mt-[8px] w-[300px] max-w-full self-center">
              Изпрати запитване
            </YellowButton>
          </form>
        </section>

        {/* Карта */}
        <section className="mx-[16px] mt-[61px] flex h-[300px] items-center justify-center rounded-[10px] bg-[#d9d9d9] lg:mx-[32px] lg:h-[475px]">
          <p className="font-golos text-[25px] font-bold leading-[1.15] tracking-[0.25px] text-black">
            Map
          </p>
        </section>

        {/* CTA */}
        <section className="mx-[16px] mt-[73px] lg:mx-[32px]">
          <div className="flex flex-col items-center rounded-[10px] bg-forest px-[24px] pb-[40px] pt-[85px] text-center lg:h-[295.229px] lg:pb-0">
            <h2 className="font-golos text-[26px] font-semibold leading-[1.3] text-white lg:text-[35px] lg:leading-[46.543px]">
              Готови ли сте за приключение?
            </h2>
            <p className="mt-[6px] text-[16px] leading-[21px] text-white">
              Резервирайте своя час днес и си гарантирайте незабравими спомени.
            </p>
            <YellowButton className="mt-[35px] w-[259px]">
              Резервирай сега
            </YellowButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
