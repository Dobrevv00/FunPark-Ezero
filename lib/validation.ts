/** Валидиране на български телефонен номер и имейл (споделено между формите) */

/**
 * Приема български номер в разни формати:
 *   +359 88 123 4567 · +359881234567 · 0888 123 456 · 0888123456 · 02 987 6543
 * Игнорира интервали, тирета и скоби. Национален номер: 8–9 цифри.
 */
export function isValidBgPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^(\+359|0)[1-9]\d{7,8}$/.test(cleaned);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
