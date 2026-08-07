import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Badge from "@/components/Badge";
import YellowButton from "@/components/YellowButton";

export const metadata: Metadata = {
  title: "Събития | Fun Park Ezero",
  description:
    "Открийте магията на природата и забавленията в Fun Park Ezero. От детски партита до корпоративни тиймбилдинги — тук всеки момент е специален.",
};

const filters = [
  { label: "Всички", active: true },
  { label: "За деца", active: false },
  { label: "Спорт", active: false },
  { label: "Музика", active: false },
];

const mobileFilters = [
  { label: "Всички", active: true },
  { label: "За деца", active: false },
  { label: "Спорт", active: false },
  { label: "Концерти", active: false },
];

const events = [
  {
    title: "Лятно кино под звездите",
    desc: "Насладете се на класическо кино преживяване на открито.",
    img: "/images/event-cinema.jpg",
    day: "15",
    month: "ЮЛИ",
    time: "21:00",
  },
  {
    title: "Приключенски уикенд",
    desc: "Приключения, игри и забавления на открито.",
    img: "/images/event-park.jpg",
    day: "19",
    month: "ЮЛИ",
    time: "9:00",
  },
  {
    title: "DJ вечер край езерото",
    desc: "Насладете се на музика, коктейли и лятна атмосфера с гост DJ на открито.",
    img: "/images/event-dj.jpg",
    day: "25",
    month: "ЮЛИ",
    time: "21:00",
  },
];

const mobileEvents = [
  {
    title: "Лятно кино под звездите",
    cat: "За всички",
    catBg: "#deedfa",
    meta: "🕒 21:00 ч. · Терасата",
    desc: "Класическо кино преживяване на открито в уютната обстановка на парка.",
    img: "/images/event-cinema.jpg",
    day: "15",
    month: "ЮЛИ",
  },
  {
    title: "Йога на открито: Утринна сесия",
    cat: "Спорт",
    catBg: "#e9f3da",
    meta: "🕒 08:30 ч. · Поляната",
    desc: "Започнете деня с енергия и спокойствие сред природата.",
    img: "/images/event-yoga.jpg",
    day: "22",
    month: "ЮЛИ",
  },
  {
    title: "Детски фестивал на приключенията",
    cat: "За деца",
    catBg: "#fcf1ce",
    meta: "🕒 10:00 ч. · Съоръжението",
    desc: "Цял ден игри, работилници и приключения за малките откриватели.",
    img: "/images/event-festival.jpg",
    day: "05",
    month: "АВГ",
  },
];

const mobileFooterNav = [
  { label: "Начало", href: "/" },
  { label: "Събития", href: "/events" },
  { label: "Контакти", href: "/contacts" },
];

const mobileSocials = ["TikTok", "Instagram", "Facebook"];

const polaroids = [
  {
    title: "DJ вечер",
    date: "12 Юли, събота",
    time: "21:00 ч",
    img: "/images/event-dj.jpg",
    pos: "left-[calc(16.67%+61.28px)] top-[93.3px] h-[90.3px] w-[153.9px]",
    rotate: "-rotate-[0.75deg]",
  },
  {
    title: "Детски ден",
    date: "15 Юли, събота",
    time: "09:00 ч",
    img: "/images/event-park.jpg",
    pos: "left-[calc(58.33%+95.46px)] top-[78.5px] h-[122.8px] w-[175.3px]",
    rotate: "rotate-[11.6deg]",
  },
  {
    title: "Кино вечер",
    date: "15 Юли, събота",
    time: "21:00 ч",
    img: "/images/event-kids.jpg",
    pos: "left-[calc(16.67%+99.8px)] top-[379.9px] h-[91px] w-[154.2px]",
    rotate: "-rotate-[0.99deg]",
  },
  {
    title: "Катерачи",
    date: "2 Август, петък",
    time: "10:00 ч",
    img: "/images/event-park.jpg",
    pos: "left-[calc(66.67%-14.39px)] top-[364.3px] h-[116.3px] w-[172.5px]",
    rotate: "-rotate-[8.96deg]",
  },
];

function Polaroid({ p }: { p: (typeof polaroids)[number] }) {
  return (
    <div className={`absolute flex items-center justify-center ${p.pos}`}>
      <div
        className={`relative h-[88.3px] w-[152.7px] shrink-0 rounded-[6.134px] bg-offwhite shadow-[0px_6.987px_20.961px_0px_rgba(0,0,0,0.08)] ${p.rotate}`}
      >
        <div className="absolute left-[7px] top-[13px] h-[64.5px] w-[61.1px] overflow-hidden rounded-[4.243px]">
          <img src={p.img} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-[-4.7px] top-[2.9px] flex size-[10.9px] flex-col items-center justify-center rounded-[2.9px] bg-sun text-pine">
            <span className="font-golos text-[4px] font-extrabold leading-none">15</span>
            <span className="font-golos text-[1.8px] font-semibold leading-none tracking-[0.18px]">
              ЮЛИ
            </span>
          </span>
        </div>
        <p className="absolute left-[77px] top-[24px] font-golos text-[11.814px] font-bold leading-[1.25] text-ink">
          {p.title}
        </p>
        <p className="absolute left-[77px] top-[41px] text-[8.592px] font-medium leading-[1.3] tracking-[0.086px] text-[#545454]">
          {p.date}
        </p>
        <p className="absolute left-[77px] top-[55px] bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-[8.592px] font-medium leading-[1.3] tracking-[0.086px] text-transparent">
          {p.time}
        </p>
      </div>
    </div>
  );
}

function EventCard({ ev }: { ev: (typeof events)[number] }) {
  return (
    <div className="relative h-[578px] w-full overflow-hidden rounded-[27.292px] bg-offwhite shadow-[0px_11.28px_34.17px_0px_rgba(0,0,0,0.08)]">
      <h3 className="absolute left-[25px] top-[62px] font-golos text-[25px] font-semibold leading-[1.25] text-ink">
        {ev.title}
      </h3>
      <p className="absolute left-[25px] right-[114px] top-[100px] font-golos text-[16px] leading-[1.23] text-[#3f3f46]">
        {ev.desc}
      </p>
      <YellowButton booking className="absolute left-[25px] top-[167px] w-[208px]">
        Резервирай
      </YellowButton>
      <a
        href="#"
        className="absolute left-[241px] top-[168px] flex w-[208px] items-center justify-center rounded-[10px] px-[24px] py-[10px] font-golos text-[15px] text-black transition-colors hover:bg-black/5"
      >
        Научи повече →
      </a>
      <div className="absolute bottom-[25px] left-[20px] right-[21px] top-[250px] overflow-hidden rounded-[10px]">
        <img src={ev.img} alt={ev.title} className="h-full w-full object-cover" />
        <span className="absolute left-[20px] top-[20px] flex size-[62.24px] flex-col items-center justify-center rounded-[16.597px] bg-sun text-pine">
          <span className="font-golos text-[22.821px] font-extrabold leading-none">
            {ev.day}
          </span>
          <span className="mt-[2px] font-golos text-[10.373px] font-semibold leading-none tracking-[1.0373px]">
            {ev.month}
          </span>
        </span>
        <span className="absolute right-[24px] top-[14px] flex size-[62.24px] flex-col items-center justify-center rounded-[16.597px] bg-sun text-pine">
          <span
            className={`font-golos font-extrabold leading-none ${
              ev.time.length <= 4 ? "text-[19.652px]" : "text-[17px]"
            }`}
          >
            {ev.time}
          </span>
          <span className="mt-[3px] font-golos text-[10.373px] font-semibold leading-none tracking-[1.0373px]">
            ЧАСА
          </span>
        </span>
      </div>
    </div>
  );
}

function MobileEventCard({ ev }: { ev: (typeof mobileEvents)[number] }) {
  return (
    <div className="w-full overflow-hidden rounded-[20px] border border-[#e8e6e0] bg-offwhite">
      <div className="relative h-[180px] w-full">
        <img src={ev.img} alt={ev.title} className="h-full w-full object-cover" />
        <span className="absolute left-[14px] top-[14px] flex size-[52px] flex-col items-center justify-center rounded-[14px] bg-sun text-pine">
          <span className="font-golos text-[18px] font-extrabold leading-none">
            {ev.day}
          </span>
          <span className="mt-[2px] font-golos text-[9px] font-semibold leading-none tracking-[0.8px]">
            {ev.month}
          </span>
        </span>
      </div>
      <div className="flex flex-col items-start gap-[10px] px-[20px] pb-[20px] pt-[18px]">
        <span
          className="rounded-full px-[11px] py-[5px] font-golos text-[11px] font-semibold leading-none text-pine"
          style={{ backgroundColor: ev.catBg }}
        >
          {ev.cat}
        </span>
        <h3 className="font-golos text-[19px] font-bold leading-[1.25] text-ink">
          {ev.title}
        </h3>
        <p className="font-golos text-[13px] font-medium text-[#3f3f46]">{ev.meta}</p>
        <p className="font-golos text-[13.5px] leading-[1.5] text-[#3f3f46]">{ev.desc}</p>
        <div className="flex w-full items-center gap-[14px] pt-[4px]">
          <a
            href="#"
            className="flex flex-1 items-center justify-center rounded-full bg-pine py-[12px] font-golos text-[14px] font-semibold leading-none text-offwhite transition-colors hover:bg-forest"
          >
            Резервирай
          </a>
          <a
            href="#"
            className="font-golos text-[14px] font-semibold text-pine transition-colors hover:text-forest"
          >
            Повече →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <>
      <Header />

      <main className="overflow-x-clip">
        {/* ===== Мобилна версия ===== */}
        <div className="lg:hidden">
          {/* Херо */}
          <section className="flex flex-col items-center gap-[16px] bg-cream px-[20px] py-[48px] text-center">
            <span className="rounded-full border-[1.5px] border-[#7fac2a] px-[16px] py-[7px] font-golos text-[11px] font-semibold leading-none tracking-[1.5px] text-pine">
              КАЛЕНДАР
            </span>
            <h1 className="font-golos text-[34px] font-extrabold leading-[1.12] text-ink">
              Предстоящи събития
            </h1>
            <p className="font-golos text-[15px] leading-[1.55] text-[#3f3f46]">
              От детски партита до корпоративни тиймбилдинги — тук всеки момент
              е специален.
            </p>
          </section>

          {/* Филтри */}
          {/* центрирани филтри — при тесен екран се пренасят на нов ред вместо да се скролват */}
          <div className="flex flex-wrap justify-center gap-[8px] px-[20px] pb-[8px] pt-[24px]">
            {mobileFilters.map((f) => (
              <button
                key={f.label}
                type="button"
                className={`shrink-0 cursor-pointer rounded-full px-[13px] py-[9px] font-golos text-[13px] font-semibold leading-none transition-colors ${
                  f.active
                    ? "bg-pine text-offwhite hover:bg-forest"
                    : "border border-[#a1a1aa] text-[#3f3f46] hover:bg-black/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Събития */}
          <div className="flex flex-col gap-[20px] px-[20px] pb-[48px] pt-[16px]">
            {mobileEvents.map((ev) => (
              <MobileEventCard key={ev.title} ev={ev} />
            ))}
          </div>

          {/* Празно състояние */}
          <div className="flex flex-col gap-[12px] px-[20px] pb-[48px]">
            <p className="font-golos text-[12px] font-medium text-[#a1a1aa]">
              Състояние: няма намерени събития
            </p>
            <div className="flex w-full flex-col items-center gap-[16px] rounded-[20px] border-[1.5px] border-dashed border-[#dbd7cb] bg-cream px-[24px] py-[40px]">
              <span className="flex size-[64px] items-center justify-center rounded-full bg-[#fcf1ce] font-golos text-[26px]">
                📅
              </span>
              <p className="text-center font-golos text-[18px] font-bold text-ink">
                Няма намерени събития
              </p>
              <p className="text-center font-golos text-[13.5px] leading-[1.5] text-[#3f3f46]">
                Опитайте да промените филтрите или се върнете по-късно.
              </p>
              <button
                type="button"
                className="cursor-pointer rounded-full border-[1.5px] border-pine px-[24px] py-[11px] font-golos text-[14px] font-semibold leading-none text-pine transition-colors hover:bg-pine hover:text-offwhite"
              >
                Изчисти филтрите
              </button>
            </div>
          </div>

          {/* Бюлетин */}
          <section className="px-[20px] pb-[64px]">
            <div className="flex flex-col gap-[16px] rounded-[24px] bg-pine px-[24px] py-[32px]">
              <h2 className="font-golos text-[22px] font-extrabold leading-[1.2] text-offwhite">
                Бъдете първите, които научават
              </h2>
              <p className="font-golos text-[14px] leading-[1.5] text-[rgba(255,254,254,0.8)]">
                Абонирайте се за нашия бюлетин за най-вълнуващите събития.
              </p>
              <form className="flex flex-col gap-[16px]">
                <input
                  type="email"
                  placeholder="Вашият имейл"
                  className="w-full rounded-full bg-offwhite px-[20px] py-[15px] font-golos text-[14px] text-ink outline-none placeholder:text-[#a1a1aa]"
                />
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-full bg-sun py-[15px] font-golos text-[14px] font-semibold leading-none text-pine transition-colors hover:bg-[#e0b32f]"
                >
                  Абонирай ме
                </button>
              </form>
            </div>
          </section>

          {/* Футър */}
          <footer className="flex flex-col items-start gap-[28px] bg-[#0e2f20] px-[20px] pb-[56px] pt-[56px]">
            <div className="relative h-[42px] w-[62px] overflow-hidden">
              <span className="absolute inset-[2.67%_0_0_0]">
                <img
                  src="/icons/logo-mark-footer.svg"
                  alt="Fun Park Ezero"
                  className="size-full"
                />
              </span>
              <span className="absolute inset-[0_37%_78.73%_34.4%]">
                <img src="/icons/logo-leaf-footer.svg" alt="" className="size-full" />
              </span>
            </div>
            <p className="font-golos text-[14px] leading-[1.6] text-[rgba(255,254,254,0.7)]">
              Място за вашето забавление и отдих сред природата — Парк
              „Езеро&ldquo;, Бургас.
            </p>
            <nav className="flex gap-[24px]">
              {mobileFooterNav.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="font-golos text-[15px] font-semibold text-offwhite transition-opacity hover:opacity-70"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex gap-[10px]">
              {mobileSocials.map((s) => (
                <a
                  key={s}
                  href="#"
                  className="rounded-full bg-[rgba(255,254,254,0.1)] px-[14px] py-[8px] font-golos text-[12px] font-semibold text-offwhite transition-colors hover:bg-[rgba(255,254,254,0.2)]"
                >
                  {s}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-[8px] font-golos text-[14px] text-[rgba(255,254,254,0.85)]">
              <p>+359 888 123 456</p>
              <p>info@funparkezero.bg</p>
              <p>ул. „Езерова&ldquo; 12, Бургас</p>
            </div>
            <p className="font-golos text-[12px] text-[rgba(255,254,254,0.55)]">
              © 2026 Fun Park Ezero. Всички права запазени.
            </p>
          </footer>
        </div>

        {/* ===== Десктоп версия ===== */}
        <div className="hidden lg:block">
          {/* Херо със снимки-полароиди */}
          <section className="relative mx-auto h-[550px] max-w-[1512px]">
            <div className="absolute inset-x-[32px] top-[9px] h-[541px] rounded-[10px] bg-cream" />
            <div className="relative flex flex-col items-center px-[24px] pt-[149px] text-center">
              <Badge>Календар</Badge>
              <h1 className="mt-[35px] font-golos text-[55px] font-black leading-[52px] text-ink">
                Предстоящи{" "}
                <span className="bg-gradient-to-t from-pine from-[92.5%] to-leaf to-[117.5%] bg-clip-text text-transparent">
                  събития
                </span>
              </h1>
              <p className="mt-[18px] max-w-[608px] text-[16px] leading-[1.3] tracking-[0.16px] text-[#545454]">
                Открийте магията на природата и забавленията в Fun Park Ezero.
                От детски партита до корпоративни тиймбилдинги — тук всеки
                момент е специален.
              </p>
            </div>

            {/* Декоративни полароиди */}
            {polaroids.map((p) => (
              <Polaroid key={p.title} p={p} />
            ))}
            <img
              src="/icons/badge-music.svg"
              alt=""
              className="absolute left-[calc(16.67%+48.88px)] top-[83.6px] size-[40.3px] -rotate-[0.75deg]"
            />
            <img
              src="/icons/circle-yellow.svg"
              alt=""
              className="absolute left-[calc(58.33%+102.3px)] top-[64.3px] size-[40.3px] rotate-[9.17deg]"
            />
            <img
              src="/icons/note.svg"
              alt=""
              className="absolute left-[65.94%] top-[77.7px] h-[18px] w-[18px] rotate-[9.17deg]"
            />
            <img
              src="/icons/badge-cinema.svg"
              alt=""
              className="absolute left-[calc(16.67%+86.89px)] top-[370.2px] size-[40.3px] -rotate-[2.34deg]"
            />
            <img
              src="/icons/circle-blue-lg.svg"
              alt=""
              className="absolute left-[calc(58.33%+101.61px)] top-[369.8px] size-[40.3px] -rotate-[11.39deg]"
            />
            <img
              src="/icons/child-hat.svg"
              alt=""
              className="absolute left-[calc(66.67%-14.68px)] top-[379.6px] size-[24px] -rotate-[9.32deg]"
            />
          </section>

          {/* Филтри */}
          <div className="mx-auto mt-[46px] flex max-w-[1512px] flex-wrap items-center gap-[20px] px-[31px]">
            {filters.map((f) => (
              <button
                key={f.label}
                type="button"
                className={`flex cursor-pointer items-center justify-center rounded-full px-[36px] py-[9px] text-[15.338px] leading-[1.3] tracking-[0.1534px] transition-colors ${
                  f.active
                    ? "bg-forest text-white hover:bg-pine"
                    : "border border-black text-ink hover:bg-black/5"
                }`}
              >
                {f.label}
              </button>
            ))}
            <p className="ml-auto font-golos text-[14px] font-medium text-[#3f3f46]">
              Сортирай по дата
            </p>
          </div>

          {/* Събития */}
          <div className="mx-auto mt-[80px] grid max-w-[1512px] grid-cols-2 gap-[24px] px-[32px] xl:grid-cols-3">
            {events.map((ev) => (
              <EventCard key={ev.title} ev={ev} />
            ))}
          </div>

          {/* Празно състояние */}
          <div className="mx-auto mt-[134px] max-w-[1512px] px-[32px]">
            <div className="flex h-[408px] flex-col items-center rounded-[10px] bg-offwhite px-[24px] pt-[36px] text-center shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)]">
              <div className="flex size-[85px] items-center justify-center overflow-hidden rounded-full bg-[rgba(106,142,78,0.3)]">
                <img
                  src="/icons/calendar-month.svg"
                  alt=""
                  className="size-[49px]"
                />
              </div>
              <h2 className="mt-[35px] font-golos text-[27.15px] font-semibold leading-[36.2px] text-[#1a1c1d]">
                Няма намерени събития за избрания период
              </h2>
              <p className="mt-[15px] text-[15.838px] leading-[19px] text-[#666666]">
                Опитайте да промените филтрите или се върнете по-късно, за да
                <br /> видите новите ни предложения.
              </p>
              <YellowButton booking className="mt-[35px] w-[259px]">
                Резервирай сега
              </YellowButton>
            </div>
          </div>

          {/* Бюлетин */}
          <section className="mx-auto mb-[79px] mt-[73px] max-w-[1512px] pl-[31px] pr-[33px]">
            <div className="relative h-[295.229px] rounded-[10px] bg-forest">
              <h2 className="absolute left-[68px] top-[100px] whitespace-nowrap font-golos text-[35px] font-semibold leading-[46.543px] text-white">
                Бъдете първите, които научават
              </h2>
              <p className="absolute left-[68px] top-[158px] text-[16px] leading-[21px] text-white">
                Абонирайте се за нашия бюлетин и получавайте информация за
                <br /> най-вълнуващите събития директно на вашата поща.
              </p>
              <form className="absolute left-[806px] right-[38px] top-[137px] flex">
                <input
                  type="email"
                  placeholder="Вашият имейл"
                  className="h-[45px] w-[383px] rounded-[10px] bg-[#fbfbfb] px-[15px] text-[15px] text-ink outline-none placeholder:text-[#6b7280]"
                />
                <button
                  type="submit"
                  className="ml-[4px] h-[45px] w-[177px] cursor-pointer rounded-[10px] bg-sun text-[15px] font-semibold leading-[20px] text-black/80 transition-colors hover:bg-[#e0b32f]"
                >
                  Абонирай се
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </>
  );
}
