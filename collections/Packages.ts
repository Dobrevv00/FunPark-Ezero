import type { CollectionConfig } from "payload";

/**
 * Пакети за рожден ден — съдържанието на картите на страница „Рожденни дни“.
 *
 * Всеки запис е една карта. Показва се само когато „Активен“ е включено.
 * Подредбата в групата се определя от полето „Подредба“.
 *
 * Стари полета (менюто като една група, цените като текст, броят гости като
 * две числа) са скрити от админа, но остават в базата — за да не се губят
 * данни и да не се пипа схемата деструктивно.
 */
export const Packages: CollectionConfig = {
  slug: "packages",
  labels: { singular: "Пакет", plural: "Пакети" },
  timestamps: true,
  admin: {
    group: "Рожденни дни",
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "apparatus",
      "priceEuro",
      "active",
      "order",
      "updatedAt",
    ],
    description:
      "Картите на страница „Рожденни дни“. Нов запис се показва на сайта автоматично.",
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
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
      type: "row",
      fields: [
        {
          name: "apparatus",
          type: "select",
          label: "Група",
          admin: {
            width: "50%",
            description:
              "В коя от двете секции на страницата излиза пакетът. Без стойност — показва се най-долу, извън групите.",
          },
          options: [
            { label: "Въздушна Въжена градина", value: "aerial" },
            { label: "Хексагон", value: "hexagon" },
          ],
        },
        {
          name: "order",
          type: "number",
          label: "Подредба",
          defaultValue: 1,
          admin: {
            width: "25%",
            description: "По-малко число = по-напред в групата.",
          },
        },
        {
          name: "active",
          type: "checkbox",
          label: "Активен",
          defaultValue: true,
          admin: {
            width: "25%",
            description: "Изключено — пакетът не се показва на сайта, но остава тук.",
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "guestLimit",
          type: "text",
          label: "Брой гости",
          maxLength: 60,
          admin: {
            width: "40%",
            description: "Напр. „до 10 деца · до 10 възрастни“.",
          },
        },
        {
          name: "priceEuro",
          type: "number",
          label: "Цена (€)",
          admin: {
            width: "30%",
            description: "Само число — знакът € се добавя от сайта.",
          },
        },
        {
          name: "duration",
          type: "text",
          label: "Времетраене",
          maxLength: 40,
          admin: { width: "30%", description: "Напр. „2ч. и 30м.“" },
        },
      ],
    },
    {
      name: "sessionInfo",
      type: "textarea",
      label: "Включена активност",
      admin: {
        description: "Напр. „Включено ползване на Уред… — сесия 40 минути.“",
      },
    },
    {
      name: "parentsItems",
      type: "array",
      label: "За родители",
      labels: { singular: "Ред", plural: "Редове" },
      admin: {
        description: "Редовете могат да се добавят, махат и пренареждат с влачене.",
      },
      fields: [{ name: "text", type: "textarea", label: "Текст" }],
    },
    {
      name: "childrenItems",
      type: "array",
      label: "За деца",
      labels: { singular: "Ред", plural: "Редове" },
      fields: [{ name: "text", type: "textarea", label: "Текст" }],
    },
    {
      name: "drinks",
      type: "array",
      label: "Напитки",
      labels: { singular: "Ред", plural: "Редове" },
      fields: [{ name: "text", type: "text", label: "Текст", maxLength: 80 }],
    },
    {
      name: "enquiryButtonLabel",
      type: "text",
      label: "Текст на бутона",
      maxLength: 24,
      admin: {
        description:
          "Празно — ползва се общият текст от „Съдържание на страницата“ (по подразбиране „Запитване“).",
      },
    },
    {
      name: "note",
      type: "textarea",
      label: "Допълнителна бележка",
      admin: { description: "Показва се най-долу в картата, ако е попълнена." },
    },

    /* ---------- стари полета: скрити, но запазени в базата ---------- */
    {
      type: "row",
      admin: { hidden: true },
      fields: [
        { name: "childrenMax", type: "number", label: "До колко деца (старо)" },
        { name: "adultsMax", type: "number", label: "До колко възрастни (старо)" },
      ],
    },
    {
      type: "row",
      admin: { hidden: true },
      fields: [
        { name: "priceEur", type: "text", label: "Цена в евро (старо, текст)" },
        { name: "priceBgn", type: "text", label: "Цена в лева (старо, вече не се показва)" },
      ],
    },
    {
      name: "menuGroups",
      type: "array",
      label: "Меню (старо)",
      admin: { hidden: true },
      fields: [
        { name: "title", type: "text", label: "Заглавие на групата", maxLength: 40 },
        {
          name: "items",
          type: "array",
          label: "Редове",
          fields: [{ name: "text", type: "textarea", label: "Текст" }],
        },
      ],
    },
  ],
};
