/**
 * Демонстрационен вход — проверката е в браузъра и НЕ е истинска защита.
 * При свързването с Payload CMS ще се замени с реална автентикация.
 */
export const ADMIN_USER = "Ezeroadmin";
export const ADMIN_PASS = "Funpark123";
export const AUTH_KEY = "fpe-admin-auth";

export const isAdminAuthed = () =>
  typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "1";
