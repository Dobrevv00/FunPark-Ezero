import type { CollectionConfig } from "payload";

/**
 * Атракции. Създава се като структура за съдържание — попъпът за резервация
 * НЕ се променя в тази фаза и продължава да работи със своите данни.
 */
export const Attractions: CollectionConfig = {
  slug: "attractions",
  labels: { singular: "Атракция", plural: "Атракции" },
  admin: {
    group: "Съдържание",
    useAsTitle: "name",
    defaultColumns: ["name", "slug"],
  },
  access: { read: () => true },
  fields: [
    { name: "name", type: "text", label: "Име", required: true, maxLength: 60 },
    {
      name: "slug",
      type: "text",
      label: "Идентификатор",
      unique: true,
      admin: { description: "Използва се само вътрешно — не създава нов URL в тази фаза." },
    },
    {
      name: "shortDescription",
      type: "textarea",
      label: "Кратко описание",
      maxLength: 200,
    },
    {
      name: "gallery",
      type: "array",
      label: "Галерия",
      fields: [
        { name: "image", type: "upload", relationTo: "media", label: "Снимка" },
        { name: "alt", type: "text", label: "Алтернативен текст", maxLength: 80 },
      ],
    },
  ],
};
