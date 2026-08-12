import type { GlobalConfig } from "payload";

/** Текстовете на страницата „Рождени дни“ (пакетите са в колекция „Пакети“). */
export const BirthdaysPage: GlobalConfig = {
  slug: "birthdays-page",
  label: "Съдържание на страницата",
  admin: { group: "Рожденни дни" },
  access: { read: () => true },
  fields: [
    {
      type: "group",
      name: "hero",
      label: "Заглавна част",
      fields: [
        { name: "badge", type: "text", label: "Бадж", maxLength: 24 },
        { name: "title", type: "text", label: "Заглавие", maxLength: 40 },
        { name: "titleAccent", type: "text", label: "Заглавие — цветна част", maxLength: 30 },
        { name: "text", type: "textarea", label: "Текст", maxLength: 260 },
      ],
    },
    {
      type: "group",
      name: "packages",
      label: "Пакети",
      fields: [
        { name: "ctaLabel", type: "text", label: "Бутон на пакет", maxLength: 24 },
        {
          name: "capacityLabel",
          type: "text",
          label: "Шаблон за капацитета",
          maxLength: 60,
          admin: {
            description:
              "Използвай {children} и {adults}. Напр. „до {children} деца · до {adults} възрастни“.",
          },
        },
        { name: "drinksTitle", type: "text", label: "Заглавие за напитките", maxLength: 30 },
        {
          name: "aerialTitle",
          type: "text",
          label: "Заглавие — група „Въздушна Въжена градина“",
          maxLength: 60,
        },
        {
          name: "aerialText",
          type: "textarea",
          label: "Текст под заглавието — Въздушна Въжена градина",
          maxLength: 160,
        },
        {
          name: "hexagonTitle",
          type: "text",
          label: "Заглавие — група „Хексагон“",
          maxLength: 60,
        },
        {
          name: "hexagonText",
          type: "textarea",
          label: "Текст под заглавието — Хексагон",
          maxLength: 160,
        },
      ],
    },
    {
      type: "group",
      name: "form",
      label: "Форма за запитване",
      fields: [
        { name: "title", type: "text", label: "Заглавие", maxLength: 60 },
        { name: "intro", type: "textarea", label: "Текст", maxLength: 200 },
        { name: "nameLabel", type: "text", label: "Етикет „Име“", maxLength: 24 },
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
          maxLength: 80,
        },
        { name: "submitLabel", type: "text", label: "Бутон за изпращане", maxLength: 30 },
        { name: "successMessage", type: "text", label: "Съобщение при успех", maxLength: 160 },
        { name: "errorMessage", type: "text", label: "Съобщение при грешка", maxLength: 160 },
      ],
    },
    {
      type: "group",
      name: "cta",
      label: "Долен призив",
      fields: [
        { name: "title", type: "text", label: "Заглавие", maxLength: 60 },
        { name: "text", type: "textarea", label: "Текст", maxLength: 200 },
        { name: "ctaLabel", type: "text", label: "Бутон", maxLength: 24 },
      ],
    },
  ],
};
