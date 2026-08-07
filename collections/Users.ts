import type { CollectionConfig } from "payload";

/**
 * Потребители на Payload админ панела.
 * `auth: true` включва вход, сесии и възстановяване на парола.
 */
export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [
    // email и password се добавят автоматично от auth
  ],
};
