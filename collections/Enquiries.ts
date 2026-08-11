import type { CollectionConfig } from "payload";

/**
 * Централна колекция за всички запитвания от публичните форми на сайта.
 *
 * Достъп: публично създаване през REST е ЗАБРАНЕНО. Записът се прави само от
 * сървърните екшъни в `lib/actions/enquiries.ts` (с overrideAccess), които
 * задават `formSource` сами — посетителят не може да го избира.
 * Четене, промяна и триене — само за влезли администратори.
 */
export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  labels: { singular: "Запитване", plural: "Запитвания" },
  timestamps: true,
  admin: {
    group: "Запитвания",
    useAsTitle: "name",
    defaultColumns: ["name", "formSource", "phone", "email", "status", "createdAt"],
    description:
      "Запитвания от контактната форма и от пакетите за рожден ден. Записват се автоматично при изпращане на формата.",
  },
  access: {
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "formSource",
          type: "select",
          label: "Източник",
          required: true,
          admin: {
            width: "50%",
            description: "Задава се автоматично от формата, през която е изпратено.",
          },
          options: [
            { label: "Контактна форма", value: "contact" },
            {
              label: "Запитване за пакет за рожден ден",
              value: "birthday_packages",
            },
          ],
        },
        {
          name: "status",
          type: "select",
          label: "Статус",
          defaultValue: "new",
          admin: { width: "50%" },
          options: [
            { label: "Ново", value: "new" },
            { label: "Прегледано", value: "read" },
            { label: "В процес", value: "in_progress" },
            { label: "Приключено", value: "completed" },
          ],
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "name",
          type: "text",
          label: "Име",
          required: true,
          maxLength: 100,
          admin: { width: "34%" },
        },
        {
          name: "phone",
          type: "text",
          label: "Телефон",
          maxLength: 40,
          admin: { width: "33%" },
        },
        {
          name: "email",
          type: "email",
          label: "Имейл",
          admin: { width: "33%" },
        },
      ],
    },
    {
      name: "subject",
      type: "text",
      label: "Тема",
      maxLength: 150,
      admin: {
        description:
          "Попълва се само от форми, които имат такова поле. Днешните две форми не изпращат тема.",
      },
    },
    {
      name: "message",
      type: "textarea",
      label: "Съобщение",
      maxLength: 2000,
    },
    {
      type: "collapsible",
      label: "Данни само за запитвания за пакет",
      admin: {
        initCollapsed: false,
        condition: (data) => data?.formSource === "birthday_packages",
      },
      fields: [
        {
          name: "selectedPackage",
          type: "relationship",
          relationTo: "packages",
          label: "Избран пакет",
        },
        {
          name: "selectedPackageTitle",
          type: "text",
          label: "Избран пакет (текст)",
          maxLength: 200,
          admin: {
            readOnly: true,
            description:
              "Записва се в момента на запитването, за да остане четимо и ако пакетът се промени по-късно.",
          },
        },
      ],
    },
    {
      name: "pageUrl",
      type: "text",
      label: "Страница",
      maxLength: 300,
      admin: {
        readOnly: true,
        description: "Адресът, от който е изпратено запитването.",
      },
    },
    {
      name: "adminNote",
      type: "textarea",
      label: "Бележка",
      maxLength: 2000,
      admin: {
        description: "Вътрешна бележка — не се показва никъде на сайта.",
      },
    },
  ],
};
