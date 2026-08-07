import type { GlobalConfig } from "payload";
import type { Field } from "payload";

/** Колони с линкове — десктоп и мобилно днес показват различен набор. */
const columns: Field = {
  name: "columns",
  type: "array",
  label: "Колони",
  maxRows: 2,
  fields: [
    { name: "title", type: "text", label: "Заглавие", maxLength: 24 },
    {
      name: "links",
      type: "array",
      label: "Линкове",
      fields: [
        { name: "label", type: "text", label: "Текст", maxLength: 32 },
        { name: "href", type: "text", label: "Адрес" },
      ],
    },
  ],
};

/** Иконите (локация / телефон / имейл) са в кода и се подреждат по реда тук. */
const contactLines: Field = {
  name: "contactLines",
  type: "array",
  label: "Контактни редове",
  maxRows: 3,
  admin: {
    description:
      "Ред 1 получава иконата за локация, ред 2 — телефон, ред 3 — имейл. Текстът не се пренася на нов ред.",
  },
  fields: [{ name: "text", type: "text", label: "Текст", maxLength: 40 }],
};

export const FooterGlobal: GlobalConfig = {
  slug: "footer",
  label: "Футър",
  admin: { group: "Настройки" },
  access: { read: () => true },
  fields: [
    {
      name: "tagline",
      type: "textarea",
      label: "Текст под логото",
      maxLength: 120,
    },
    {
      type: "group",
      name: "desktop",
      label: "Десктоп",
      fields: [columns, contactLines],
    },
    {
      type: "group",
      name: "mobile",
      label: "Мобилно",
      fields: [columns, contactLines],
    },
  ],
};
