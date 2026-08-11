import type { CollectionConfig } from "payload";

/**
 * СТАРА колекция — заменена от „enquiries“.
 *
 * Оставена е регистрирана, за да не се трие таблицата и стари записи (ако има
 * такива). Скрита е от админ менюто, за да не обърква. Нови записи не влизат
 * тук — всички форми пишат в „enquiries“.
 *
 * За да я видиш в админа, махни `hidden: true` по-долу.
 */
export const PackageEnquiries: CollectionConfig = {
  slug: "package-enquiries",
  labels: {
    singular: "Запитване (архив)",
    plural: "Запитвания (архив)",
  },
  admin: {
    group: "Запитвания",
    hidden: true,
    useAsTitle: "name",
    defaultColumns: ["name", "packageTitle", "phone", "status", "createdAt"],
  },
  access: {
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", label: "Име", required: true },
    { name: "phone", type: "text", label: "Телефон", required: true },
    { name: "email", type: "text", label: "Имейл", required: true },
    { name: "message", type: "textarea", label: "Съобщение" },
    {
      name: "package",
      type: "relationship",
      relationTo: "packages",
      label: "Пакет",
      admin: { description: "Пакетът, за който е запитването." },
    },
    {
      name: "packageTitle",
      type: "text",
      label: "Пакет (текст)",
      admin: {
        readOnly: true,
        description: "Записва се в момента на запитването, за да остане четимо и след промяна на пакета.",
      },
    },
    {
      name: "status",
      type: "select",
      label: "Статус",
      defaultValue: "new",
      options: [
        { label: "Ново", value: "new" },
        { label: "Обработено", value: "handled" },
      ],
    },
  ],
};
