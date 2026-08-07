import type { Field, GlobalConfig } from "payload";

/** Заглавие, съставено от три части — средната е с градиент в разметката. */
const splitHeading: Field[] = [
  { name: "titleBefore", type: "text", label: "Заглавие — начало", maxLength: 80 },
  { name: "titleAccent", type: "text", label: "Заглавие — цветна част", maxLength: 40 },
  { name: "titleAfter", type: "text", label: "Заглавие — край", maxLength: 80 },
];

export const ContactsPage: GlobalConfig = {
  slug: "contacts-page",
  label: "Страница „Контакти“",
  admin: { group: "Страници" },
  access: { read: () => true },
  fields: [
    {
      type: "group",
      name: "hero",
      label: "Херо",
      fields: [
        { name: "badge", type: "text", label: "Бадж", maxLength: 24 },
        { name: "title", type: "text", label: "Заглавие", maxLength: 40 },
        { name: "titleAccent", type: "text", label: "Заглавие — цветна част", maxLength: 24 },
        { name: "text", type: "textarea", label: "Текст", maxLength: 200 },
        { name: "image", type: "upload", relationTo: "media", label: "Снимка" },
      ],
    },
    {
      type: "group",
      name: "info",
      label: "Информация за контакт",
      fields: [
        { name: "title", type: "text", label: "Заглавие", maxLength: 40 },
        { name: "text", type: "textarea", label: "Текст", maxLength: 160 },
        {
          name: "columns",
          type: "array",
          label: "Колони",
          maxRows: 3,
          admin: {
            description:
              "Точно 3 колони — иконите им остават в кода (локация, телефон, часовник).",
          },
          fields: [
            { name: "label", type: "text", label: "Заглавие", maxLength: 24 },
            {
              name: "lines",
              type: "array",
              label: "Редове",
              maxRows: 2,
              fields: [{ name: "text", type: "text", label: "Текст", maxLength: 40 }],
            },
          ],
        },
      ],
    },
    {
      type: "group",
      name: "form",
      label: "Форма за запитване",
      fields: [
        { name: "badge", type: "text", label: "Бадж", maxLength: 24 },
        ...splitHeading,
        { name: "text", type: "textarea", label: "Текст", maxLength: 200 },
        {
          name: "nameLabel",
          type: "text",
          label: "Етикет „Име“",
          maxLength: 24,
        },
        { name: "namePlaceholder", type: "text", label: "Подсказка „Име“", maxLength: 40 },
        { name: "phoneLabel", type: "text", label: "Етикет „Телефон“", maxLength: 24 },
        { name: "phonePlaceholder", type: "text", label: "Подсказка „Телефон“", maxLength: 40 },
        { name: "emailLabel", type: "text", label: "Етикет „Имейл“", maxLength: 24 },
        { name: "emailPlaceholder", type: "text", label: "Подсказка „Имейл“", maxLength: 40 },
        { name: "messageLabel", type: "text", label: "Етикет „Съобщение“", maxLength: 24 },
        {
          name: "messagePlaceholder",
          type: "text",
          label: "Подсказка „Съобщение“",
          maxLength: 60,
        },
        { name: "submitLabel", type: "text", label: "Бутон", maxLength: 30 },
        {
          name: "successMessage",
          type: "text",
          label: "Съобщение при успех",
          maxLength: 120,
          admin: {
            description:
              "Съобщенията за грешка при валидация остават в кода, защото са част от логиката на формата.",
          },
        },
      ],
    },
    {
      type: "group",
      name: "map",
      label: "Карта",
      fields: [
        { name: "title", type: "text", label: "Заглавие", maxLength: 40 },
        { name: "addressLine", type: "text", label: "Адрес под заглавието", maxLength: 60 },
        { name: "image", type: "upload", relationTo: "media", label: "Снимка на картата" },
      ],
    },
    {
      type: "group",
      name: "cta",
      label: "Долен призив",
      fields: [
        {
          name: "titleDesktop",
          type: "text",
          label: "Заглавие — десктоп",
          maxLength: 50,
        },
        {
          name: "titleMobileLine1",
          type: "text",
          label: "Заглавие — мобилно, ред 1",
          maxLength: 30,
        },
        {
          name: "titleMobileLine2",
          type: "text",
          label: "Заглавие — мобилно, ред 2",
          maxLength: 30,
        },
        { name: "text", type: "textarea", label: "Текст", maxLength: 140 },
        { name: "ctaLabelDesktop", type: "text", label: "Бутон — десктоп", maxLength: 24 },
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
