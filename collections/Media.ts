import type { CollectionConfig } from "payload";

/**
 * Файлове (изображения и видеа).
 *
 * Хранилище: Cloudflare R2 през S3-съвместимия адаптер — виж `payload.config.ts`.
 * Ако R2 променливите липсват (например локално), адаптерът се изключва и
 * Payload пази файловете локално, както преди.
 */

/** Разрешени типове — само web медия, без изпълними файлове. */
const ALLOWED_MIME_TYPES = [
  // изображения
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  // видео
  "video/mp4",
  "video/webm",
];

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Файл", plural: "Файлове" },
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
  upload: {
    mimeTypes: ALLOWED_MIME_TYPES,
  },
};
