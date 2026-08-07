import type { CollectionConfig } from "payload";

/**
 * Файлове (изображения и документи).
 * Локално хранилище: public/media — виж бележката в payload.config.ts.
 */
export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Алтернативен текст",
    },
  ],
  upload: true,
};
