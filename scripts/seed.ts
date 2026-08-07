/**
 * Пренася съществуващото съдържание на сайта в Payload — дума по дума,
 * точно както се показва днес. Скриптът е идемпотентен: може да се пуска
 * повторно (глобалите се обновяват, събитията се разпознават по заглавие +
 * къде се показват).
 *
 * Пускане:  npm run seed
 */
import { getPayload } from "payload";
import config from "@payload-config";

const run = async () => {
  const payload = await getPayload({ config });

  /* ---------------------------------------------- Настройки на сайта */
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      brand: {
        siteName: "Fun Park Ezero",
        tagline: "Незабравими преживявания сред природата за цялото семейство.",
      },
      contact: {
        phone: "+359 88 123 4567",
        email: "info@funparkzero.bg",
        addressLine1: "ул. „Димитър Димов“,",
        addressLine2: "8000 Бургас",
      },
      openingHours: { label: "Всеки ден", value: "09:00 – 18:00" },
      socials: [
        {
          network: "facebook",
          url: "https://www.facebook.com/p/Fun-Park-Ezero-61577261426366/",
        },
        { network: "instagram", url: "https://www.instagram.com/fun_park_ezero/" },
      ],
      legal: { copyright: "© 2026 Fun Park Ezero. Всички права запазени." },
    },
  });

  /* ------------------------------------------------------------ Хедър */
  await payload.updateGlobal({
    slug: "header",
    data: {
      navItems: [
        { label: "Начало", href: "/" },
        { label: "Събития", href: "/events" },
        { label: "Контакти", href: "/contacts" },
      ],
      searchPlaceholder: "Потърси",
    },
  });

  /* ------------------------------------------------------------ Футър */
  const menuColumn = {
    title: "Меню",
    links: [
      { label: "Начало", href: "/" },
      { label: "Събития", href: "/events" },
      { label: "Контакти", href: "/contacts" },
    ],
  };

  await payload.updateGlobal({
    slug: "footer",
    data: {
      tagline: "Незабравими преживявания сред природата за цялото семейство.",
      desktop: {
        columns: [
          menuColumn,
          {
            title: "Информация",
            links: [
              { label: "Резервации", href: "#" },
              { label: "Политика за поверителност", href: "#" },
              { label: "Общи условия", href: "#" },
            ],
          },
        ],
        contactLines: [
          { text: "ул. Езерна 1, 9000 Варна" },
          { text: "+359 88 123 4567" },
          { text: "info@funparkzero.bg" },
        ],
      },
      mobile: {
        columns: [
          menuColumn,
          {
            title: "Информация",
            links: [
              { label: "Резервации", href: "#" },
              { label: "Общи условия", href: "#" },
            ],
          },
        ],
        contactLines: [
          { text: "ул. Езерна 1, Бургас" },
          { text: "+359 88 123 4567" },
          { text: "info@funparkzero.bg" },
        ],
      },
    },
  });

  /* --------------------------------------------------- Главна страница */
  await payload.updateGlobal({
    slug: "home-page",
    data: {
      hero: {
        titleLine1: "Изживей",
        titleLine2: "приключението",
        subtitle:
          "Забавление, природа и незабравими моменти за цялото семейство, всичко на едно място.",
        ctaLabel: "Резервирай сега",
      },
      bookingCard: {
        badge: "Резервация",
        title: "Резервирай своето",
        titleAccent: "приключение",
        text: "Провери наличните дати и избери кога искаш да посетиш парка. Само с няколко последователни стъпки ще резервираш своето място и ще бъдеш готов за едно незабравимо преживяване сред природата.",
        ctaLabel: "Започни резервация",
        steps: [
          { label: "Избери дата" },
          { label: "Избери час" },
          { label: "Информация" },
          { label: "Потвърждение" },
        ],
      },
      aboutIntro: {
        badgeDesktop: "За Атракцията",
        badgeMobile: "За атракцията",
        title:
          "Място, където природата, движението и споделените моменти се превръщат в",
        titleAccent: "истинско приключение.",
        text: "Създадохме място, където приключението продължава и след последното препятствие. Наслади се на въженото съоръжение, природата и уютния ресторант в едно незабравимо преживяване.",
      },
      whyUs: {
        badge: "Защо нас",
        heading: "Защо да избереш Fun Park Ezero?",
        text: "Fun Park Ezero съчетава въжено приключение, природа и споделени моменти на едно място. Създаден за всички, които обичат активното време на открито.",
        tags: [{ label: "За Атракцията" }, { label: "Край езерото" }],
        cards: [
          {
            title: "Сред природата",
            desc: "Прекарай ден сред зеленина и спокойствие, където приключението и природата се срещат на едно място.",
          },
          {
            title: "Въжено съоръжение",
            desc: "Маршрути с различни нива на трудност, подходящи за начинаещи и любители на новите предизвикателства.",
          },
          {
            title: "За всяка компания",
            desc: "Идеално място за семейства, приятели и организирани групи, които търсят активно преживяване.",
          },
          {
            title: "Ресторант",
            desc: "Отпусни се след приключението с вкусна храна и приятна атмосфера край езерото.",
          },
        ],
      },
      restaurant: {
        badge: "Ресторант",
        title: "Вкусове от природата",
        text: "Вижте най-добрите моменти от нашите гости @funparkezero",
        images: [
          { alt: "Салата в кутия върху дървена дъска" },
          { alt: "Маса с брускети, салати и грил" },
          { alt: "Панини и пържени картофи на масата" },
        ],
      },
      socialFeed: {
        title: "Последвайте ни",
        text: "Вижте най-добрите моменти от нашите гости @funparkezero",
        ctaLabel: "Виж в TikTok",
        handle: "@funparkzero",
      },
      cta: {
        titleLine1: "Готови ли сте за следващо",
        titleLine2: "приключение?",
        text: "Резервирайте своя престой или събитие днес и си гарантирайте незабравими спомени.",
        ctaLabelDesktop: "Резервирай сега",
        ctaLabelMobile: "Виж в TikTok",
      },
    },
  });

  /* ------------------------------------------------ Страница „Събития“ */
  await payload.updateGlobal({
    slug: "events-page",
    data: {
      desktop: {
        badge: "Календар",
        title: "Предстоящи",
        titleAccent: "събития",
        text: "Открийте магията на природата и забавленията в Fun Park Ezero. От детски партита до корпоративни тиймбилдинги — тук всеки момент е специален.",
        filters: [
          { label: "Всички" },
          { label: "За деца" },
          { label: "Спорт" },
          { label: "Музика" },
        ],
        sortLabel: "Сортирай по дата",
        polaroids: [
          { title: "DJ вечер", date: "12 Юли, събота", time: "21:00 ч" },
          { title: "Детски ден", date: "15 Юли, събота", time: "09:00 ч" },
          { title: "Кино вечер", date: "15 Юли, събота", time: "21:00 ч" },
          { title: "Катерачи", date: "2 Август, петък", time: "10:00 ч" },
        ],
        emptyState: {
          title: "Няма намерени събития за избрания период",
          textLine1: "Опитайте да промените филтрите или се върнете по-късно, за да",
          textLine2: "видите новите ни предложения.",
          ctaLabel: "Резервирай сега",
        },
        newsletter: {
          title: "Бъдете първите, които научават",
          textLine1: "Абонирайте се за нашия бюлетин и получавайте информация за",
          textLine2: "най-вълнуващите събития директно на вашата поща.",
          placeholder: "Вашият имейл",
          ctaLabel: "Абонирай се",
        },
      },
      mobile: {
        badge: "КАЛЕНДАР",
        title: "Предстоящи събития",
        text: "От детски партита до корпоративни тиймбилдинги — тук всеки момент е специален.",
        filters: [
          { label: "Всички" },
          { label: "За деца" },
          { label: "Спорт" },
          { label: "Концерти" },
        ],
        statusLabel: "Състояние: няма намерени събития",
        emptyState: {
          title: "Няма намерени събития",
          text: "Опитайте да промените филтрите или се върнете по-късно.",
          ctaLabel: "Изчисти филтрите",
        },
        newsletter: {
          title: "Бъдете първите, които научават",
          text: "Абонирайте се за нашия бюлетин за най-вълнуващите събития.",
          placeholder: "Вашият имейл",
          ctaLabel: "Абонирай ме",
        },
        footer: {
          tagline:
            "Място за вашето забавление и отдих сред природата — Парк „Езеро“, Бургас.",
          navItems: [
            { label: "Начало", href: "/" },
            { label: "Събития", href: "/events" },
            { label: "Контакти", href: "/contacts" },
          ],
          socialLabels: [
            { label: "TikTok" },
            { label: "Instagram" },
            { label: "Facebook" },
          ],
          contactLines: [
            { text: "+359 888 123 456" },
            { text: "info@funparkezero.bg" },
            { text: "ул. „Езерова“ 12, Бургас" },
          ],
          copyright: "© 2026 Fun Park Ezero. Всички права запазени.",
        },
      },
    },
  });

  /* ----------------------------------------------- Страница „Контакти“ */
  await payload.updateGlobal({
    slug: "contacts-page",
    data: {
      hero: {
        badge: "Контакти",
        title: "Свържете се",
        titleAccent: "с нас",
        text: "Имате въпроси за нашите услуги или искате да организирате специално събитие? Нашият екип е на разположение да ви съдейства.",
      },
      info: {
        title: "Информация за контакт",
        text: "На разположение сме да отговорим на въпросите ти и да ти помогнем при избора на твоя нов дом.",
        columns: [
          {
            label: "Локация",
            lines: [{ text: "ул. „Димитър Димов“," }, { text: "8000 Бургас" }],
          },
          {
            label: "Контакти",
            lines: [{ text: "inquiries@kavatsi.com" }, { text: "+359 800 548 568" }],
          },
          {
            label: "Работно време",
            lines: [{ text: "Всеки ден" }, { text: "09:00 – 18:00" }],
          },
        ],
      },
      form: {
        badge: "Контакти",
        titleBefore: "Имате въпрос относно резервация, събитие или посещение?",
        titleAccent: "Свържете се с нас",
        titleAfter: "и ще ви отговорим възможно най-скоро",
        text: "На разположение сме да отговорим на въпросите ти и да ти помогнем при избора на твоя нов дом.",
        nameLabel: "Име",
        namePlaceholder: "Вашето име",
        phoneLabel: "Телефон",
        phonePlaceholder: "+359 875 2365",
        emailLabel: "Имейл",
        emailPlaceholder: "your@email.com",
        messageLabel: "Съобщение",
        messagePlaceholder: "Въпроси и коментари...",
        submitLabel: "Изпрати запитване",
        successMessage: "Благодарим! Ще се свържем с вас възможно най-скоро.",
      },
      map: {
        title: "Къде да ни намерите",
        addressLine: "ул. „Димитър Димов“, 8000 Бургас",
      },
      cta: {
        titleDesktop: "Готови ли сте за приключение?",
        titleMobileLine1: "Готови ли сте за",
        titleMobileLine2: "приключение?",
        text: "Резервирайте своя час днес и си гарантирайте незабравими спомени.",
        ctaLabelDesktop: "Резервирай сега",
        ctaLabelMobile: "Абонирай се",
      },
    },
  });

  /* --------------------------------------------------------- Събития */
  const events = [
    {
      title: "Лятно кино под звездите",
      showOn: "both" as const,
      order: 1,
      day: "15",
      month: "ЮЛИ",
      category: "За всички" as const,
      desktop: {
        description: "Насладете се на класическо кино преживяване на открито.",
        time: "21:00",
        bookLabel: "Резервирай",
        learnMoreLabel: "Научи повече →",
      },
      mobile: {
        description:
          "Класическо кино преживяване на открито в уютната обстановка на парка.",
        meta: "🕒 21:00 ч. · Терасата",
        bookLabel: "Резервирай",
        learnMoreLabel: "Повече →",
      },
    },
    {
      title: "Приключенски уикенд",
      showOn: "desktop" as const,
      order: 2,
      day: "19",
      month: "ЮЛИ",
      desktop: {
        description: "Приключения, игри и забавления на открито.",
        time: "9:00",
        bookLabel: "Резервирай",
        learnMoreLabel: "Научи повече →",
      },
    },
    {
      title: "DJ вечер край езерото",
      showOn: "desktop" as const,
      order: 3,
      day: "25",
      month: "ЮЛИ",
      desktop: {
        description:
          "Насладете се на музика, коктейли и лятна атмосфера с гост DJ на открито.",
        time: "21:00",
        bookLabel: "Резервирай",
        learnMoreLabel: "Научи повече →",
      },
    },
    {
      title: "Йога на открито: Утринна сесия",
      showOn: "mobile" as const,
      order: 4,
      day: "22",
      month: "ЮЛИ",
      category: "Спорт" as const,
      mobile: {
        description: "Започнете деня с енергия и спокойствие сред природата.",
        meta: "🕒 08:30 ч. · Поляната",
        bookLabel: "Резервирай",
        learnMoreLabel: "Повече →",
      },
    },
    {
      title: "Детски фестивал на приключенията",
      showOn: "mobile" as const,
      order: 5,
      day: "05",
      month: "АВГ",
      category: "За деца" as const,
      mobile: {
        description:
          "Цял ден игри, работилници и приключения за малките откриватели.",
        meta: "🕒 10:00 ч. · Съоръжението",
        bookLabel: "Резервирай",
        learnMoreLabel: "Повече →",
      },
    },
  ];

  for (const data of events) {
    const existing = await payload.find({
      collection: "events",
      where: { title: { equals: data.title } },
      limit: 1,
    });
    if (existing.docs[0]) {
      await payload.update({
        collection: "events",
        id: existing.docs[0].id,
        data,
      });
    } else {
      await payload.create({ collection: "events", data });
    }
  }

  /* ------------------------------------------------------- Атракции */
  const attraction = {
    name: "Въжено съоръжение",
    slug: "vazheno-saorazhenie",
    shortDescription:
      "Гарантирани вълнения сред природата! Маршрути с различни нива на трудност за цялото семейство.",
  };
  const existingAttraction = await payload.find({
    collection: "attractions",
    where: { slug: { equals: attraction.slug } },
    limit: 1,
  });
  if (existingAttraction.docs[0]) {
    await payload.update({
      collection: "attractions",
      id: existingAttraction.docs[0].id,
      data: attraction,
    });
  } else {
    await payload.create({ collection: "attractions", data: attraction });
  }

  console.log("Съдържанието е пренесено в Payload.");
  process.exit(0);
};

void run();
