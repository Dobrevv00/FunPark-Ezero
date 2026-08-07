import type { GlobalConfig } from "payload";

/**
 * Хедър. Търсачката остава в кода — тя е функционалност, а не съдържание.
 */
export const HeaderGlobal: GlobalConfig = {
  slug: "header",
  label: "Хедър",
  admin: { group: "Настройки" },
  access: { read: () => true },
  fields: [
    {
      name: "navItems",
      type: "array",
      label: "Меню",
      maxRows: 5,
      admin: {
        description:
          "Повече от 5 точки не се събират в реда на десктоп версията.",
      },
      fields: [
        { name: "label", type: "text", label: "Текст", maxLength: 20 },
        { name: "href", type: "text", label: "Адрес" },
      ],
    },
    {
      name: "searchPlaceholder",
      type: "text",
      label: "Текст в търсачката",
      maxLength: 24,
    },
  ],
};
