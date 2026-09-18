import type { CollectionConfig } from "payload";

/** Полетата с участниците са само за влезли администратори — не и публично */
const adminOnly = { read: ({ req }: { req: { user?: unknown } }) => Boolean(req.user) };

/** id от стойност на relationship поле — може да е число или разгънат обект */
const toId = (v: unknown): number | string | null => {
  if (v && typeof v === "object" && "id" in v) return (v as { id: number | string }).id;
  if (typeof v === "number" || typeof v === "string") return v;
  return null;
};

/**
 * Състезанията във Fun Park Ezero — добавят се и се премахват от Payload Admin.
 *
 * На сайта има публично записване само за квалификацията. Под всяко състезание
 * администраторът вижда записаните и отбелязва кой продължава на полуфинал и финал.
 */
export const Competitions: CollectionConfig = {
  slug: "competitions",
  labels: { singular: "Състезание", plural: "Състезания" },
  timestamps: true,
  defaultSort: "qualificationDate",
  admin: {
    group: "Състезания",
    useAsTitle: "title",
    defaultColumns: ["title", "qualificationDate", "maxParticipants", "active", "updatedAt"],
    description:
      "Добавете състезание, за да се появи записване за квалификацията на сайта. Изключете „Активно“ или го изтрийте, за да го премахнете.",
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Име на състезанието",
      required: true,
      maxLength: 150,
    },
    {
      name: "description",
      type: "textarea",
      label: "Кратко описание",
      maxLength: 500,
      admin: { description: "По избор — показва се под името на сайта." },
    },
    {
      type: "row",
      fields: [
        {
          name: "qualificationDate",
          type: "date",
          label: "Квалификация (дата и час)",
          admin: {
            width: "34%",
            description: "Празно се показва като „Датата предстои“.",
            date: { pickerAppearance: "dayAndTime", displayFormat: "d.MM.yyyy HH:mm" },
          },
        },
        {
          name: "semifinalDate",
          type: "date",
          label: "Полуфинал (дата и час)",
          admin: {
            width: "33%",
            date: { pickerAppearance: "dayAndTime", displayFormat: "d.MM.yyyy HH:mm" },
          },
        },
        {
          name: "finalDate",
          type: "date",
          label: "Финал (дата и час)",
          admin: {
            width: "33%",
            date: { pickerAppearance: "dayAndTime", displayFormat: "d.MM.yyyy HH:mm" },
          },
        },
      ],
    },
    /* Краят на всеки етап — кръговете се провеждат в събота и неделя */
    {
      type: "row",
      fields: [
        {
          name: "qualificationDateTo",
          type: "date",
          label: "Квалификация — до дата",
          admin: {
            width: "34%",
            description: "Само ако кръгът е в няколко дни (напр. събота и неделя).",
            date: { pickerAppearance: "dayOnly", displayFormat: "d.MM.yyyy" },
          },
        },
        {
          name: "semifinalDateTo",
          type: "date",
          label: "Полуфинал — до дата",
          admin: {
            width: "33%",
            date: { pickerAppearance: "dayOnly", displayFormat: "d.MM.yyyy" },
          },
        },
        {
          name: "finalDateTo",
          type: "date",
          label: "Финал — до дата",
          admin: {
            width: "33%",
            date: { pickerAppearance: "dayOnly", displayFormat: "d.MM.yyyy" },
          },
        },
      ],
    },
    {
      name: "timeUnknown",
      type: "checkbox",
      label: "Часовете още не са обявени (на сайта се показват само датите)",
      admin: {
        description:
          "Включете, докато часовете на стартовете не са определени. Часът от полетата по-горе не се показва.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "maxParticipants",
          type: "number",
          label: "До колко човека",
          min: 1,
          max: 10000,
          admin: {
            width: "34%",
            description: "Празно = без ограничение. При запълване записването спира.",
          },
        },
        {
          name: "feeEur",
          type: "number",
          label: "Такса за участие (€)",
          min: 0,
          max: 10000,
          admin: { width: "33%", description: "Празно = без такса." },
        },
        {
          name: "active",
          type: "checkbox",
          label: "Активно (показва се на сайта и приема записвания)",
          defaultValue: true,
          admin: { width: "33%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "location",
          type: "text",
          label: "Място",
          maxLength: 150,
          admin: { width: "50%", description: "Напр. Парк „Езеро“, Бургас." },
        },
        {
          name: "feeNote",
          type: "text",
          label: "Бележка към таксата",
          maxLength: 200,
          admin: {
            width: "50%",
            description: "Напр. кога се плаща и за какво се използва.",
          },
        },
      ],
    },
    {
      name: "registrationNote",
      type: "textarea",
      label: "Бележка за записването",
      maxLength: 600,
      admin: {
        description:
          "Показва се при формата — напр. че записването е само за квалификациите.",
      },
    },
    {
      name: "prizeInfo",
      type: "textarea",
      label: "Награди",
      maxLength: 600,
      admin: { description: "Оставете празно, докато наградата не е решена." },
    },

    /* ---------- правила и условия на състезанието ---------- */
    {
      type: "collapsible",
      label: "Правила и условия",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "rules",
          type: "array",
          label: "Раздели",
          labels: { singular: "Раздел", plural: "Раздели" },
          admin: {
            description:
              "Всеки раздел се показва на сайта със заглавие, уводен текст и точки.",
          },
          fields: [
            { name: "title", type: "text", label: "Заглавие", maxLength: 150 },
            {
              name: "intro",
              type: "textarea",
              label: "Уводен текст",
              maxLength: 1000,
            },
            {
              name: "items",
              type: "array",
              label: "Точки",
              labels: { singular: "Точка", plural: "Точки" },
              fields: [
                { name: "text", type: "text", label: "Текст", maxLength: 500 },
              ],
            },
          ],
        },
        {
          name: "penalties",
          type: "array",
          label: "Наказания (таблица)",
          labels: { singular: "Наказание", plural: "Наказания" },
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "penalty",
                  type: "text",
                  label: "Наказание",
                  maxLength: 60,
                  admin: { width: "30%", description: "Напр. +5 секунди." },
                },
                {
                  name: "reason",
                  type: "text",
                  label: "За какво",
                  maxLength: 400,
                  admin: { width: "70%" },
                },
              ],
            },
          ],
        },
        {
          name: "rulesNote",
          type: "textarea",
          label: "Бележка под правилата",
          maxLength: 600,
        },
      ],
    },

    /* ---------- отдолу: записаните и кой продължава ---------- */
    {
      type: "collapsible",
      label: "Записани за квалификацията",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "registrations",
          type: "join",
          access: adminOnly,
          collection: "competition-registrations",
          on: "competition",
          label: "Записани",
          admin: {
            description:
              "Всички, записали се за квалификацията на това състезание през сайта.",
            defaultColumns: ["name", "age", "phone", "email", "status", "createdAt"],
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Продължават на полуфинал",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "semifinalists",
          type: "relationship",
          access: adminOnly,
          relationTo: "competition-registrations",
          hasMany: true,
          label: "Полуфиналисти",
          admin: {
            description:
              "Изберете измежду записаните за това състезание. Първо запазете състезанието, за да се появят участниците.",
          },
          // само записани за същото състезание
          filterOptions: ({ id }) => (id ? { competition: { equals: id } } : false),
        },
      ],
    },
    {
      type: "collapsible",
      label: "Продължават на финал",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "finalists",
          type: "relationship",
          access: adminOnly,
          relationTo: "competition-registrations",
          hasMany: true,
          label: "Финалисти",
          admin: {
            description: "Изберете измежду полуфиналистите.",
          },
          // само измежду избраните за полуфинал
          filterOptions: ({ data }) => {
            const list: unknown[] = Array.isArray(data?.semifinalists) ? data.semifinalists : [];
            const semi = list
              .map(toId)
              .filter((v): v is number | string => v !== null);
            return semi.length > 0 ? { id: { in: semi } } : false;
          },
        },
      ],
    },
  ],
};
