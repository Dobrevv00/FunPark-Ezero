import type { CollectionConfig } from "payload";

/**
 * Пакети за рожден ден. Менюто е масив от редове, за да може да се добавя
 * или маха ястие от админа, без да се разваля форматирането.
 */
export const Packages: CollectionConfig = {
  slug: "packages",
  labels: { singular: "Пакет", plural: "Пакети" },
  admin: {
    group: "Съдържание",
    useAsTitle: "title",
    defaultColumns: ["title", "priceEur", "duration", "order"],
  },
  access: { read: () => true },
  defaultSort: "order",
  fields: [
    {
      name: "title",
      type: "textarea",
      label: "Заглавие",
      required: true,
      admin: { description: "Изписва се като заглавие на картата." },
    },
    {
      name: "apparatus",
      type: "select",
      label: "Уред",
      options: [
        { label: "Въздушна Въжена градина", value: "aerial" },
        { label: "Хексагон", value: "hexagon" },
      ],
      admin: {
        description:
          "Определя в коя група на страницата излиза пакетът. Без стойност — показва се най-долу, извън групите.",
      },
    },
    {
      name: "order",
      type: "number",
      label: "Подредба",
      defaultValue: 0,
      admin: { description: "По-малкото число излиза първо (в рамките на групата)." },
    },
    {
      type: "row",
      fields: [
        {
          name: "childrenMax",
          type: "number",
          label: "До колко деца",
          admin: { width: "50%" },
        },
        {
          name: "adultsMax",
          type: "number",
          label: "До колко възрастни",
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "priceEur",
          type: "text",
          label: "Цена в евро",
          admin: { width: "33%", description: "Напр. 499.00€" },
        },
        {
          name: "priceBgn",
          type: "text",
          label: "Цена в лева",
          admin: { width: "33%", description: "Напр. 975.96 лв" },
        },
        {
          name: "duration",
          type: "text",
          label: "Времетраене",
          admin: { width: "34%", description: "Напр. 2ч. и 30м." },
        },
      ],
    },
    {
      name: "sessionInfo",
      type: "textarea",
      label: "Включена сесия",
      admin: { description: "Напр. Включено ползване на Уред… — сесия 40 минути." },
    },
    {
      name: "menuGroups",
      type: "array",
      label: "Меню",
      labels: { singular: "Група", plural: "Групи" },
      admin: { description: "Напр. „Родители“ и „Деца“." },
      fields: [
        { name: "title", type: "text", label: "Заглавие на групата", maxLength: 40 },
        {
          name: "items",
          type: "array",
          label: "Редове",
          labels: { singular: "Ред", plural: "Редове" },
          fields: [{ name: "text", type: "textarea", label: "Текст" }],
        },
      ],
    },
    {
      name: "drinks",
      type: "array",
      label: "Напитки",
      fields: [{ name: "text", type: "text", label: "Текст", maxLength: 80 }],
    },
    {
      name: "note",
      type: "textarea",
      label: "Допълнителна бележка",
      admin: { description: "Показва се най-долу в картата, ако е попълнена." },
    },
  ],
};
