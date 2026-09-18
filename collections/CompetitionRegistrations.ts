import type { CollectionConfig } from "payload";

import { ADULT_AGE, AGE_LIMITS } from "../lib/competitionsShared";

/**
 * Записвания за квалификацията на състезанията във Fun Park Ezero.
 *
 * Достъп: публично създаване през REST е ЗАБРАНЕНО. Записът се прави само от
 * сървърния екшън в `lib/actions/competitions.ts` (с overrideAccess).
 * Четене, промяна и триене — само за влезли администратори.
 *
 * Кой продължава на полуфинал и финал се отбелязва в самото състезание.
 */
export const CompetitionRegistrations: CollectionConfig = {
  slug: "competition-registrations",
  labels: { singular: "Записване за квалификация", plural: "Записвания за квалификация" },
  timestamps: true,
  admin: {
    group: "Състезания",
    useAsTitle: "name",
    defaultColumns: ["name", "competitionTitle", "age", "phone", "status", "createdAt"],
    description:
      "Записвания за квалификацията от страница „Състезания“ и от страница „Събития“.",
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
          name: "competition",
          type: "relationship",
          relationTo: "competitions",
          label: "Състезание",
          admin: { width: "50%" },
        },
        {
          name: "competitionTitle",
          type: "text",
          label: "Състезание (текст)",
          maxLength: 150,
          admin: {
            width: "50%",
            readOnly: true,
            description:
              "Записва се в момента на записването — остава четимо и ако състезанието бъде изтрито.",
          },
        },
      ],
    },
    {
      name: "status",
      type: "select",
      label: "Статус",
      defaultValue: "new",
      options: [
        { label: "Ново", value: "new" },
        { label: "Потвърдено", value: "confirmed" },
        { label: "Изчаква", value: "waiting" },
        { label: "Отказано", value: "rejected" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "name",
          type: "text",
          label: "Име и фамилия",
          required: true,
          maxLength: 100,
          admin: { width: "50%" },
        },
        {
          name: "age",
          type: "number",
          label: "Възраст",
          required: true,
          min: AGE_LIMITS.min,
          max: AGE_LIMITS.max,
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "phone",
          type: "text",
          label: "Телефон",
          required: true,
          maxLength: 40,
          admin: { width: "50%" },
        },
        {
          name: "email",
          type: "email",
          label: "Имейл",
          required: true,
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "guardianName",
      type: "text",
      label: "Родител / настойник",
      maxLength: 100,
      admin: {
        description: "Задължително за участници под 18 години.",
        condition: (data) => Number(data?.age) < ADULT_AGE,
      },
    },
    {
      name: "note",
      type: "textarea",
      label: "Бележка от участника",
      maxLength: 1000,
    },
    {
      name: "consent",
      type: "checkbox",
      label: "Съгласие с общите условия и политиката за поверителност",
      admin: { readOnly: true },
    },
    {
      name: "pageUrl",
      type: "text",
      label: "Страница",
      maxLength: 300,
      admin: {
        readOnly: true,
        description: "Адресът, от който е изпратено записването.",
      },
    },
    {
      name: "adminNote",
      type: "textarea",
      label: "Вътрешна бележка",
      maxLength: 2000,
      admin: { description: "Не се показва никъде на сайта." },
    },
  ],
};
