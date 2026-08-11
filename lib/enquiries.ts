import { getPayload } from "payload";
import config from "@payload-config";

import { isValidBgPhone, isValidEmail } from "@/lib/validation";

/**
 * Сървърна логика за запитванията от публичните форми.
 * Този модул НЕ се внася от клиентски компоненти — те викат обвивките
 * в `lib/actions/enquiries.ts`.
 */

export type EnquirySource = "contact" | "birthday_packages";

export type EnquiryResult = { ok: boolean; error?: "invalid" | "server" };

export type EnquiryInput = {
  formSource: EnquirySource;
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  pageUrl?: string;
  selectedPackageId?: number | string | null;
  selectedPackageTitle?: string;
  /** Скрито поле — ако е попълнено, изпращачът е бот. */
  honeypot?: string;
};

/** Максимални дължини — по-дълго се отхвърля. */
const LIMITS = {
  name: 100,
  phone: 40,
  email: 100,
  subject: 150,
  message: 2000,
  pageUrl: 300,
  packageTitle: 200,
} as const;

const clean = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/**
 * Проверява и записва запитване. Връща `ok: true` и когато е уловен бот —
 * за да не му става ясно, че е спрян.
 */
export async function createEnquiry(
  input: EnquiryInput,
): Promise<EnquiryResult> {
  // капан за ботове: правим се, че всичко е минало, но нищо не се записва
  if (clean(input.honeypot) !== "") return { ok: true };

  if (input.formSource !== "contact" && input.formSource !== "birthday_packages") {
    return { ok: false, error: "invalid" };
  }

  const name = clean(input.name);
  const phone = clean(input.phone);
  const email = clean(input.email);
  const subject = clean(input.subject);
  const message = clean(input.message);
  const pageUrl = clean(input.pageUrl);
  const selectedPackageTitle = clean(input.selectedPackageTitle);

  // задължителни полета — същите правила като в клиентската валидация
  if (name === "" || !isValidBgPhone(phone) || !isValidEmail(email)) {
    return { ok: false, error: "invalid" };
  }

  // прекалено дълги стойности
  if (
    name.length > LIMITS.name ||
    phone.length > LIMITS.phone ||
    email.length > LIMITS.email ||
    subject.length > LIMITS.subject ||
    message.length > LIMITS.message ||
    pageUrl.length > LIMITS.pageUrl ||
    selectedPackageTitle.length > LIMITS.packageTitle
  ) {
    return { ok: false, error: "invalid" };
  }

  const packageId = Number(input.selectedPackageId);
  const selectedPackage =
    input.formSource === "birthday_packages" && Number.isFinite(packageId)
      ? packageId
      : undefined;

  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "enquiries",
      overrideAccess: true,
      data: {
        formSource: input.formSource,
        status: "new",
        name,
        phone,
        email,
        subject: subject || undefined,
        message: message || undefined,
        pageUrl: pageUrl || undefined,
        selectedPackage,
        selectedPackageTitle: selectedPackageTitle || undefined,
      },
    });
    return { ok: true };
  } catch (err) {
    console.error(
      "[enquiries] запитването не можа да бъде записано:",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: "server" };
  }
}
