import type { Metadata } from "next";
import Link from "next/link";
import LegalShell, {
  Bullets,
  Contact,
  Note,
  P,
  Section,
  SubTitle,
} from "@/components/LegalPage";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "@/lib/cookieConsent";

export const metadata: Metadata = {
  title: "Политика за бисквитките | Fun Park Ezero",
  description:
    "Какви бисквитки и локални записи използва сайтът на Fun Park Ezero, какво съдържат и как да промените избора си по всяко време.",
};

export const revalidate = 60;

/** Датата се пипа ръчно при всяка съществена промяна в политиката. */
const UPDATED = "14 август 2026 г.";

const toc = [
  { id: "what", label: "Какво представляват бисквитките" },
  { id: "current", label: "Какво използваме в момента" },
  { id: "categories", label: "Категории и вашият избор" },
  { id: "record", label: "Записът с вашето съгласие" },
  { id: "table", label: "Списък на използваните технологии" },
  { id: "manage", label: "Как да промените избора си" },
  { id: "browser", label: "Управление през браузъра" },
  { id: "changes", label: "Промени в тази политика" },
];

/** Реалните записи, установени в кода на сайта. */
type Row = {
  name: string;
  type: string;
  category: "Необходими" | "Аналитични" | "Маркетингови";
  purpose: string;
  provider: string;
  term: string;
};

const rows: Row[] = [
  {
    name: CONSENT_STORAGE_KEY,
    type: "Локално хранилище (localStorage)",
    category: "Необходими",
    purpose:
      "Запазва избора ви за бисквитки, за да не ви питаме при всяко посещение.",
    provider: "Fun Park Ezero (собствен запис)",
    term: "Без автоматичен срок — до изтриване от браузъра или до смяна на версията на съгласието.",
  },
  {
    name: "fpe-bookings",
    type: "Локално хранилище (localStorage)",
    category: "Необходими",
    purpose:
      "Пази направените през сайта резервации на самото устройство — дата, час, места, име, телефон, имейл и сума.",
    provider: "Fun Park Ezero (собствен запис)",
    term: "Без автоматичен срок — до изтриване от браузъра.",
  },
  {
    name: "fpe-slots, fpe-day-slots, fpe-capacity, fpe-blocked, fpe-prices",
    type: "Локално хранилище (localStorage)",
    category: "Необходими",
    purpose:
      "Настройки на резервационния календар — часове, свободни места, заети дни и цени на билети. Не съдържат лични данни.",
    provider: "Fun Park Ezero (собствен запис)",
    term: "Без автоматичен срок — до изтриване от браузъра.",
  },
  {
    name: "fpe-admin-auth",
    type: "Сесийно хранилище (sessionStorage)",
    category: "Необходими",
    purpose:
      "Отбелязва, че служител е влязъл във вътрешния панел за резервации. Създава се само в администраторската част, не при обикновено посещение.",
    provider: "Fun Park Ezero (собствен запис)",
    term: "До затварянето на раздела в браузъра.",
  },
  {
    name: "payload-token, payload-lng",
    type: "HTTP бисквитки",
    category: "Необходими",
    purpose:
      "Поддържат вписването и езиковата настройка в системата за управление на съдържанието. Създават се само когато служител влезе в администрацията, не при посещение на публичния сайт.",
    provider: "Payload CMS (работи на нашия сървър)",
    term: "До изтичане на сесията или изход от системата.",
  },
];

const columns = ["Име", "Тип", "Категория", "Цел", "Доставчик", "Срок"] as const;

function TechTable() {
  return (
    <>
      {/* Десктоп — таблица. Излиза малко извън тясната текстова колона, за да
          се вместят шестте колони без хоризонтално скролване. */}
      <div className="mt-[4px] hidden overflow-x-auto rounded-[10px] border border-[#e4e4e7] lg:-mx-[70px] lg:block">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="bg-cream">
              {columns.map((c) => (
                <th
                  key={c}
                  className="border-b border-[#e4e4e7] px-[12px] py-[11px] font-golos text-[12.5px] font-bold uppercase tracking-[0.03em] text-forest"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="align-top">
                <td className="border-b border-[#f1f1f3] px-[12px] py-[12px] font-golos text-[12.5px] font-semibold leading-[1.5] text-ink">
                  {r.name}
                </td>
                <td className="border-b border-[#f1f1f3] px-[12px] py-[12px] font-golos text-[12.5px] leading-[1.5] text-[#3f3f46]">
                  {r.type}
                </td>
                <td className="border-b border-[#f1f1f3] px-[12px] py-[12px]">
                  <span className="whitespace-nowrap rounded-[6px] bg-[rgba(106,142,78,0.15)] px-[8px] py-[3px] font-golos text-[12px] font-semibold text-forest">
                    {r.category}
                  </span>
                </td>
                <td className="border-b border-[#f1f1f3] px-[12px] py-[12px] font-golos text-[12.5px] leading-[1.55] text-[#3f3f46]">
                  {r.purpose}
                </td>
                <td className="border-b border-[#f1f1f3] px-[12px] py-[12px] font-golos text-[12.5px] leading-[1.5] text-[#3f3f46]">
                  {r.provider}
                </td>
                <td className="border-b border-[#f1f1f3] px-[12px] py-[12px] font-golos text-[12.5px] leading-[1.55] text-[#3f3f46]">
                  {r.term}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Мобилно — карти, за да не се налага хоризонтално скролване */}
      <div className="mt-[4px] flex flex-col gap-[12px] lg:hidden">
        {rows.map((r) => (
          <div
            key={r.name}
            className="rounded-[10px] border border-[#e4e4e7] px-[14px] py-[14px]"
          >
            <p className="break-words font-golos text-[13.5px] font-bold leading-[1.45] text-ink">
              {r.name}
            </p>
            <span className="mt-[8px] inline-block rounded-[6px] bg-[rgba(106,142,78,0.15)] px-[8px] py-[3px] font-golos text-[12px] font-semibold text-forest">
              {r.category}
            </span>
            <dl className="mt-[10px] flex flex-col gap-[8px]">
              {[
                ["Тип", r.type],
                ["Цел", r.purpose],
                ["Доставчик", r.provider],
                ["Срок", r.term],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-golos text-[12px] font-semibold uppercase tracking-[0.03em] text-[#71717a]">
                    {label}
                  </dt>
                  <dd className="mt-[2px] font-golos text-[13.5px] leading-[1.6] text-[#3f3f46]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

export default function CookiePolicyPage() {
  return (
    <LegalShell
      badge="Бисквитки"
      title="Политика за"
      titleAccent="бисквитките"
      intro="Тук описваме точно какво сайтът записва в браузъра ви, защо го прави и как можете да промените избора си по всяко време."
      updated={UPDATED}
      toc={toc}
    >
      <Section id="what" title="1. Какво представляват бисквитките">
        <P>
          Бисквитките са малки текстови файлове, които сайтът записва в браузъра
          ви. Подобна роля изпълняват и локалното хранилище (localStorage) и
          сесийното хранилище (sessionStorage) — те също пазят данни в браузъра,
          но не се изпращат автоматично с всяка заявка към сървъра.
        </P>
        <P>
          Някои от тези записи са необходими, за да работи сайтът. Други — например
          за анализ на посещаемостта или за реклама — не са необходими и се
          създават само след ваше съгласие.
        </P>
      </Section>

      <Section id="current" title="2. Какво използваме в момента">
        <P>
          Към датата на последна актуализация сайтът{" "}
          <strong className="font-semibold text-ink">
            не използва никакви аналитични или маркетингови инструменти за
            проследяване
          </strong>
          . Конкретно:
        </P>
        <Bullets
          items={[
            "Meta Pixel (Facebook Pixel) не е интегриран.",
            "Google Analytics не е интегриран.",
            "Google Tag Manager не е интегриран.",
            "Няма рекламни мрежи, скриптове за ретаргетиране или инструменти за записване на поведението на потребителя.",
            "Няма вградено съдържание от социални мрежи (без iframe-ове и без бутони, които зареждат чужд код). Иконите за Facebook и Instagram са обикновени линкове.",
            "Шрифтовете се доставят от самия сайт — при посещение не се правят заявки към външен доставчик на шрифтове.",
          ]}
        />
        <P>
          Всичко, което сайтът записва днес, е собствено и служи за
          функционалността му — вижте списъка по-долу.
        </P>
        <Note>
          Ако в бъдеще добавим аналитичен или маркетингов инструмент, той ще се
          зарежда само след съгласие за съответната категория, а тази политика ще
          бъде обновена преди пускането му.
        </Note>
      </Section>

      <Section id="categories" title="3. Категории и вашият избор">
        <SubTitle>Необходими бисквитки</SubTitle>
        <P>
          Осигуряват основните функции на сайта — навигация, формите за запитване,
          резервационния календар и запазването на самия ви избор за бисквитки.
          Без тях сайтът не работи правилно, затова са винаги активни и не могат
          да бъдат изключени.
        </P>
        <SubTitle>Аналитични бисквитки</SubTitle>
        <P>
          Биха ни помогнали да разберем как се използва сайтът, за да го
          подобряваме. Изключени са по подразбиране и към момента няма активен
          аналитичен инструмент.
        </P>
        <SubTitle>Маркетингови бисквитки</SubTitle>
        <P>
          Биха позволили показване на подходящи реклами и измерване на резултата
          от тях. Изключени са по подразбиране и към момента няма активен
          маркетингов инструмент.
        </P>
        <P>
          При първото ви посещение показваме съобщение с три възможности:{" "}
          <strong className="font-semibold text-ink">Приемам всички</strong>,{" "}
          <strong className="font-semibold text-ink">Отказвам всички</strong> и{" "}
          <strong className="font-semibold text-ink">Настройки</strong>, където
          можете да изберете категориите поотделно. Нищо извън необходимите не се
          активира предварително, а сайтът остава напълно използваем и ако не
          направите избор.
        </P>
      </Section>

      <Section id="record" title="4. Записът с вашето съгласие">
        <P>
          Изборът ви се пази в локалното хранилище на браузъра под ключ:
        </P>
        <pre className="overflow-x-auto rounded-[9px] bg-cream px-[14px] py-[12px] font-golos text-[13px] font-bold text-forest">
          {CONSENT_STORAGE_KEY}
        </pre>
        <P>Записът съдържа само следното:</P>
        <pre className="overflow-x-auto rounded-[9px] bg-[#1f2937] px-[14px] py-[13px] font-mono text-[12.5px] leading-[1.65] text-[#e5e7eb]">
          {`{
  "necessary": true,
  "analytics": false,
  "marketing": false,
  "consentGiven": true,
  "version": "${CONSENT_VERSION}",
  "updatedAt": "2026-08-14T09:33:05.350Z"
}`}
        </pre>
        <Bullets
          items={[
            <>
              <strong className="font-semibold text-ink">necessary</strong> —
              винаги <code className="font-mono text-[13px]">true</code>;
              необходимите бисквитки не могат да бъдат изключени.
            </>,
            <>
              <strong className="font-semibold text-ink">analytics</strong> и{" "}
              <strong className="font-semibold text-ink">marketing</strong> —{" "}
              <code className="font-mono text-[13px]">false</code> по
              подразбиране; стават{" "}
              <code className="font-mono text-[13px]">true</code> само ако вие го
              изберете.
            </>,
            <>
              <strong className="font-semibold text-ink">consentGiven</strong> —
              отбелязва, че вече сте направили избор, за да не ви питаме отново.
            </>,
            <>
              <strong className="font-semibold text-ink">version</strong> —
              версия на съгласието. При съществена промяна версията се сменя и ви
              питаме отново.
            </>,
            <>
              <strong className="font-semibold text-ink">updatedAt</strong> —
              дата и час на избора.
            </>,
          ]}
        />
        <P>
          Записът не съдържа име, имейл, телефон или идентификатор, който да ви
          свързва с конкретна личност, и не се изпраща към наш сървър — остава в
          браузъра ви.
        </P>
      </Section>

      <Section id="table" title="5. Списък на използваните технологии">
        <P>
          Таблицата описва всичко, което сайтът записва в браузъра към датата на
          последна актуализация:
        </P>
        <TechTable />
        <Note>
          Всички записи в списъка са от категория „Необходими“. Няма нито един
          запис от категория „Аналитични“ или „Маркетингови“, защото такива
          инструменти още не са включени.
        </Note>
      </Section>

      <Section id="manage" title="6. Как да промените избора си">
        <P>
          Можете да смените решението си по всяко време през линка{" "}
          <strong className="font-semibold text-ink">
            „Настройки на бисквитките“
          </strong>{" "}
          в долната част на сайта (във футъра, колона „Информация“). Той отваря
          същия панел с категориите, в който можете да включите или изключите
          аналитичните и маркетинговите бисквитки и да запазите настройките.
        </P>
        <P>
          Новият избор се прилага веднага и заменя предишния запис. Ако откажете
          категория, за която вече е било дадено съгласие, съответните инструменти
          спират да се зареждат при следващото зареждане на страница.
        </P>
      </Section>

      <Section id="browser" title="7. Управление през браузъра">
        <P>
          Независимо от настройките на сайта, можете да изтриете бисквитките и
          локалните данни през настройките на браузъра си, както и да го
          настроите да ги блокира. Имайте предвид, че блокирането на необходимите
          записи може да наруши работата на сайта — например запомнянето на избора
          ви за бисквитки или на направена резервация.
        </P>
        <P>
          Ако изтриете локалните данни на сайта, съобщението за бисквитки ще се
          появи отново при следващото посещение, защото записът с избора ви ще е
          премахнат.
        </P>
      </Section>

      <Section id="changes" title="8. Промени в тази политика">
        <P>
          Ще обновяваме тази страница при всяка промяна в използваните технологии
          — включително при добавяне на нов инструмент за анализ или маркетинг. За
          обработването на лични данни през формите на сайта вижте{" "}
          <Link
            href="/privacy-policy"
            className="fx-ink font-semibold text-forest underline decoration-forest/35 underline-offset-[3px] hover:decoration-forest"
          >
            Политиката за поверителност
          </Link>
          .
        </P>
        <P>
          Въпроси за бисквитките можете да изпратите на{" "}
          <Contact href="mailto:funparkezero@gmail.com">
            funparkezero@gmail.com
          </Contact>
          . Администратор на данните е „ТОРОС ПЛЕЙ“ ЕООД, ЕИК 201104491.
        </P>
      </Section>
    </LegalShell>
  );
}
