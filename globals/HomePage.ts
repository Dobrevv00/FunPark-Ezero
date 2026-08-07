import type { GlobalConfig } from "payload";

/**
 * Съдържанието на главната страница, секция по секция.
 * Заглавията, които днес са на два реда, са две полета — така преломът
 * остава точно там, където е сега. Частите с друг цвят са отделно поле
 * (`titleAccent`), защото в разметката са отделен <span>.
 */
export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Главна страница",
  admin: { group: "Страници" },
  access: { read: () => true },
  fields: [
    {
      type: "group",
      name: "hero",
      label: "Херо",
      fields: [
        { name: "titleLine1", type: "text", label: "Заглавие — ред 1", maxLength: 24 },
        { name: "titleLine2", type: "text", label: "Заглавие — ред 2", maxLength: 24 },
        {
          name: "subtitle",
          type: "textarea",
          label: "Подзаглавие",
          maxLength: 140,
          admin: { description: "Две реда на десктоп. По-дълъг текст застъпва бутона." },
        },
        { name: "ctaLabel", type: "text", label: "Бутон", maxLength: 24 },
        { name: "imageDesktop", type: "upload", relationTo: "media", label: "Снимка — десктоп" },
        { name: "imageMobile", type: "upload", relationTo: "media", label: "Снимка — мобилно" },
      ],
    },
    {
      type: "group",
      name: "bookingCard",
      label: "Карта „Резервирай своето приключение“",
      fields: [
        { name: "badge", type: "text", label: "Бадж (десктоп)", maxLength: 24 },
        { name: "title", type: "text", label: "Заглавие", maxLength: 30 },
        { name: "titleAccent", type: "text", label: "Заглавие — цветна част", maxLength: 24 },
        { name: "text", type: "textarea", label: "Текст", maxLength: 260 },
        { name: "ctaLabel", type: "text", label: "Бутон", maxLength: 24 },
        {
          name: "steps",
          type: "array",
          label: "Стъпки",
          maxRows: 4,
          admin: {
            description:
              "Точно 4 стъпки — позициите им на десктоп са фиксирани в дизайна.",
          },
          fields: [{ name: "label", type: "text", label: "Текст", maxLength: 18 }],
        },
      ],
    },
    {
      type: "group",
      name: "aboutIntro",
      label: "За атракцията",
      fields: [
        {
          name: "badgeDesktop",
          type: "text",
          label: "Бадж — десктоп",
          maxLength: 24,
          admin: { description: "Днес е с главна буква „А“ — умишлено се пази различен." },
        },
        { name: "badgeMobile", type: "text", label: "Бадж — мобилно", maxLength: 24 },
        { name: "title", type: "text", label: "Заглавие", maxLength: 140 },
        { name: "titleAccent", type: "text", label: "Заглавие — цветна част", maxLength: 40 },
        { name: "text", type: "textarea", label: "Текст", maxLength: 260 },
      ],
    },
    {
      type: "group",
      name: "whyUs",
      label: "Защо нас",
      fields: [
        { name: "badge", type: "text", label: "Бадж", maxLength: 24 },
        { name: "heading", type: "text", label: "Заглавие върху снимката", maxLength: 60 },
        { name: "text", type: "textarea", label: "Текст върху снимката", maxLength: 200 },
        {
          name: "tags",
          type: "array",
          label: "Значки върху снимката",
          maxRows: 2,
          admin: { description: "Ширините им са фиксирани в дизайна — до ~14 знака." },
          fields: [{ name: "label", type: "text", label: "Текст", maxLength: 20 }],
        },
        { name: "image", type: "upload", relationTo: "media", label: "Снимка — десктоп" },
        { name: "imageMobile", type: "upload", relationTo: "media", label: "Снимка — мобилно" },
        {
          name: "cards",
          type: "array",
          label: "Карти",
          maxRows: 4,
          admin: {
            description:
              "Точно 4 карти. Цветовете и иконите остават в кода, за да не се променя дизайнът.",
          },
          fields: [
            { name: "title", type: "text", label: "Заглавие", maxLength: 30 },
            { name: "desc", type: "textarea", label: "Текст", maxLength: 130 },
          ],
        },
      ],
    },
    {
      type: "group",
      name: "restaurant",
      label: "Ресторант",
      fields: [
        { name: "badge", type: "text", label: "Бадж", maxLength: 24 },
        { name: "title", type: "text", label: "Заглавие", maxLength: 40 },
        { name: "text", type: "text", label: "Текст", maxLength: 90 },
        {
          name: "images",
          type: "array",
          label: "Снимки",
          maxRows: 3,
          admin: { description: "Точно 3 снимки — позициите им са фиксирани в дизайна." },
          fields: [
            { name: "image", type: "upload", relationTo: "media", label: "Снимка" },
            { name: "alt", type: "text", label: "Алтернативен текст", maxLength: 80 },
          ],
        },
      ],
    },
    {
      type: "group",
      name: "socialFeed",
      label: "Последвайте ни",
      fields: [
        { name: "title", type: "text", label: "Заглавие", maxLength: 30 },
        { name: "text", type: "text", label: "Текст", maxLength: 90 },
        { name: "ctaLabel", type: "text", label: "Бутон", maxLength: 24 },
        { name: "handle", type: "text", label: "Потребител върху кадрите", maxLength: 30 },
        {
          name: "videos",
          type: "array",
          label: "Кадри",
          maxRows: 4,
          fields: [
            { name: "image", type: "upload", relationTo: "media", label: "Кадър" },
          ],
        },
      ],
    },
    {
      type: "group",
      name: "cta",
      label: "Долен призив",
      fields: [
        { name: "titleLine1", type: "text", label: "Заглавие — ред 1", maxLength: 30 },
        { name: "titleLine2", type: "text", label: "Заглавие — ред 2", maxLength: 30 },
        { name: "text", type: "textarea", label: "Текст", maxLength: 140 },
        {
          name: "ctaLabelDesktop",
          type: "text",
          label: "Бутон — десктоп",
          maxLength: 24,
        },
        {
          name: "ctaLabelMobile",
          type: "text",
          label: "Бутон — мобилно",
          maxLength: 24,
          admin: { description: "Днес е различен от десктоп — умишлено се пази." },
        },
      ],
    },
  ],
};
