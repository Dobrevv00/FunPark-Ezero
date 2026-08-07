import type { GlobalConfig } from "payload";

/**
 * Страница „Събития“. Десктоп и мобилно днес показват различни текстове
 * (бадж, заглавие, филтри, празно състояние, бюлетин) и мобилната версия има
 * собствен футър. Затова има две отделни групи — нищо не се обединява.
 */
export const EventsPage: GlobalConfig = {
  slug: "events-page",
  label: "Страница „Събития“",
  admin: { group: "Страници" },
  access: { read: () => true },
  fields: [
    {
      type: "group",
      name: "desktop",
      label: "Десктоп",
      fields: [
        { name: "badge", type: "text", label: "Бадж", maxLength: 24 },
        { name: "title", type: "text", label: "Заглавие", maxLength: 30 },
        { name: "titleAccent", type: "text", label: "Заглавие — цветна част", maxLength: 24 },
        { name: "text", type: "textarea", label: "Текст", maxLength: 220 },
        {
          name: "filters",
          type: "array",
          label: "Филтри",
          maxRows: 6,
          fields: [{ name: "label", type: "text", label: "Текст", maxLength: 20 }],
        },
        { name: "sortLabel", type: "text", label: "Текст за подредба", maxLength: 30 },
        {
          name: "polaroids",
          type: "array",
          label: "Декоративни снимки (полароиди)",
          maxRows: 4,
          admin: {
            description:
              "Точно 4. Позициите, наклоните и снимките остават в кода — тук се редактира само текстът.",
          },
          fields: [
            { name: "title", type: "text", label: "Заглавие", maxLength: 20 },
            { name: "date", type: "text", label: "Дата", maxLength: 24 },
            { name: "time", type: "text", label: "Час", maxLength: 12 },
          ],
        },
        {
          type: "group",
          name: "emptyState",
          label: "Празно състояние",
          fields: [
            { name: "title", type: "text", label: "Заглавие", maxLength: 70 },
            { name: "textLine1", type: "text", label: "Текст — ред 1", maxLength: 80 },
            { name: "textLine2", type: "text", label: "Текст — ред 2", maxLength: 80 },
            { name: "ctaLabel", type: "text", label: "Бутон", maxLength: 24 },
          ],
        },
        {
          type: "group",
          name: "newsletter",
          label: "Бюлетин",
          fields: [
            {
              name: "title",
              type: "text",
              label: "Заглавие",
              maxLength: 40,
              admin: { description: "Стои на един ред — по-дълъг текст излиза от блока." },
            },
            { name: "textLine1", type: "text", label: "Текст — ред 1", maxLength: 80 },
            { name: "textLine2", type: "text", label: "Текст — ред 2", maxLength: 80 },
            { name: "placeholder", type: "text", label: "Текст в полето", maxLength: 30 },
            { name: "ctaLabel", type: "text", label: "Бутон", maxLength: 24 },
          ],
        },
      ],
    },
    {
      type: "group",
      name: "mobile",
      label: "Мобилно",
      fields: [
        { name: "badge", type: "text", label: "Бадж", maxLength: 24 },
        { name: "title", type: "text", label: "Заглавие", maxLength: 40 },
        { name: "text", type: "textarea", label: "Текст", maxLength: 160 },
        {
          name: "filters",
          type: "array",
          label: "Филтри",
          maxRows: 6,
          fields: [{ name: "label", type: "text", label: "Текст", maxLength: 20 }],
        },
        { name: "statusLabel", type: "text", label: "Ред за състояние", maxLength: 60 },
        {
          type: "group",
          name: "emptyState",
          label: "Празно състояние",
          fields: [
            { name: "title", type: "text", label: "Заглавие", maxLength: 40 },
            { name: "text", type: "textarea", label: "Текст", maxLength: 120 },
            { name: "ctaLabel", type: "text", label: "Бутон", maxLength: 24 },
          ],
        },
        {
          type: "group",
          name: "newsletter",
          label: "Бюлетин",
          fields: [
            { name: "title", type: "text", label: "Заглавие", maxLength: 40 },
            { name: "text", type: "textarea", label: "Текст", maxLength: 120 },
            { name: "placeholder", type: "text", label: "Текст в полето", maxLength: 30 },
            { name: "ctaLabel", type: "text", label: "Бутон", maxLength: 24 },
          ],
        },
        {
          type: "group",
          name: "footer",
          label: "Футър (само за тази страница)",
          admin: {
            description:
              "Мобилната версия на тази страница има собствен футър с различни данни от общия — пази се такъв, каквъвто е днес.",
          },
          fields: [
            { name: "tagline", type: "textarea", label: "Текст под логото", maxLength: 140 },
            {
              name: "navItems",
              type: "array",
              label: "Меню",
              fields: [
                { name: "label", type: "text", label: "Текст", maxLength: 20 },
                { name: "href", type: "text", label: "Адрес" },
              ],
            },
            {
              name: "socialLabels",
              type: "array",
              label: "Социални мрежи (текстови значки)",
              fields: [{ name: "label", type: "text", label: "Текст", maxLength: 20 }],
            },
            {
              name: "contactLines",
              type: "array",
              label: "Контактни редове",
              fields: [{ name: "text", type: "text", label: "Текст", maxLength: 40 }],
            },
            { name: "copyright", type: "text", label: "Авторски права", maxLength: 120 },
          ],
        },
      ],
    },
  ],
};
