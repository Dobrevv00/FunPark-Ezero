import type { CollectionConfig } from "payload";

/**
 * Събития. Днес страницата показва различни списъци на десктоп и на мобилно,
 * затова всяко събитие казва къде се показва (`showOn`) и има отделни полета
 * за двете версии, където текстовете се различават.
 *
 * Категориите са фиксиран списък (select), а цветът на баджа остава в кода.
 */
export const Events: CollectionConfig = {
  slug: "events",
  labels: { singular: "Събитие", plural: "Събития" },
  admin: {
    group: "Съдържание",
    useAsTitle: "title",
    defaultColumns: ["title", "showOn", "day", "month", "order"],
  },
  access: { read: () => true },
  defaultSort: "order",
  fields: [
    { name: "title", type: "text", label: "Заглавие", required: true, maxLength: 60 },
    {
      name: "showOn",
      type: "select",
      label: "Показва се на",
      required: true,
      defaultValue: "both",
      options: [
        { label: "Десктоп и мобилно", value: "both" },
        { label: "Само десктоп", value: "desktop" },
        { label: "Само мобилно", value: "mobile" },
      ],
      admin: {
        description:
          "Пази текущото положение — днес двете версии на сайта показват различни събития.",
      },
    },
    {
      name: "order",
      type: "number",
      label: "Подредба",
      defaultValue: 0,
      admin: { description: "По-малкото число излиза първо." },
    },
    {
      type: "row",
      fields: [
        { name: "day", type: "text", label: "Ден", maxLength: 2, admin: { width: "50%" } },
        {
          name: "month",
          type: "text",
          label: "Месец (съкратено)",
          maxLength: 4,
          admin: { width: "50%", description: "Напр. ЮЛИ, АВГ." },
        },
      ],
    },
    {
      name: "category",
      type: "select",
      label: "Категория (мобилен бадж)",
      options: [
        { label: "За всички", value: "За всички" },
        { label: "Спорт", value: "Спорт" },
        { label: "За деца", value: "За деца" },
      ],
      admin: {
        description: "Цветът на баджа е в кода и се подбира по категорията.",
      },
    },
    { name: "image", type: "upload", relationTo: "media", label: "Снимка" },
    {
      type: "group",
      name: "desktop",
      label: "Десктоп карта",
      fields: [
        { name: "description", type: "textarea", label: "Описание", maxLength: 160 },
        { name: "time", type: "text", label: "Час", maxLength: 6 },
        {
          name: "learnMoreLabel",
          type: "text",
          label: "Втори бутон",
          maxLength: 24,
        },
        { name: "bookLabel", type: "text", label: "Бутон за резервация", maxLength: 24 },
      ],
    },
    {
      type: "group",
      name: "mobile",
      label: "Мобилна карта",
      fields: [
        { name: "description", type: "textarea", label: "Описание", maxLength: 180 },
        {
          name: "meta",
          type: "text",
          label: "Час и място",
          maxLength: 40,
          admin: { description: "Показва се както е въведено, напр. „🕒 21:00 ч. · Терасата“." },
        },
        { name: "bookLabel", type: "text", label: "Бутон за резервация", maxLength: 24 },
        { name: "learnMoreLabel", type: "text", label: "Втори бутон", maxLength: 24 },
      ],
    },
  ],
};
