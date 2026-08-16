import type { GlobalConfig } from "payload";

/**
 * Основни данни за сайта. Отделните страници могат да имат свои стойности,
 * когато сайтът днес показва различни данни на различни места — това е
 * съзнателно, за да не се променя нищо визуално или съдържателно.
 */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Настройки на сайта",
  admin: { group: "Настройки" },
  access: { read: () => true },
  fields: [
    {
      type: "group",
      name: "brand",
      label: "Марка",
      fields: [
        { name: "siteName", type: "text", label: "Име на сайта", maxLength: 60 },
        {
          name: "tagline",
          type: "textarea",
          label: "Кратко описание (футър)",
          maxLength: 120,
          admin: {
            description: "Показва се под логото във футъра. Дълъг текст разваля колоната.",
          },
        },
      ],
    },
    {
      type: "group",
      name: "contact",
      label: "Контакти",
      fields: [
        { name: "phone", type: "text", label: "Телефон", maxLength: 40 },
        { name: "email", type: "text", label: "Имейл", maxLength: 80 },
        { name: "addressLine1", type: "text", label: "Адрес — ред 1", maxLength: 60 },
        { name: "addressLine2", type: "text", label: "Адрес — ред 2", maxLength: 60 },
      ],
    },
    {
      type: "group",
      name: "openingHours",
      label: "Работно време",
      fields: [
        { name: "label", type: "text", label: "Дни", maxLength: 40 },
        { name: "value", type: "text", label: "Часове", maxLength: 40 },
      ],
    },
    {
      name: "socials",
      type: "array",
      label: "Социални мрежи",
      admin: {
        description:
          "Иконите са в кода и се подбират по мрежата. Редът определя подредбата в хедъра и футъра.",
      },
      fields: [
        {
          name: "network",
          type: "select",
          label: "Мрежа",
          options: [
            { label: "Facebook", value: "facebook" },
            { label: "Instagram", value: "instagram" },
          ],
        },
        { name: "url", type: "text", label: "Линк" },
      ],
    },
    {
      type: "group",
      name: "legal",
      label: "Правни",
      fields: [{ name: "copyright", type: "text", label: "Авторски права", maxLength: 120 }],
    },
  ],
};
