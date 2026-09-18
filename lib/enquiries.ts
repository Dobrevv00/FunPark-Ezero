import { getPayload } from "payload";
import config from "@payload-config";

import { escapeHtml, sendEmail } from "@/lib/email";
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

/** Маха евентуални нови редове — само за едноредови стойности като темата на писмо. */
const singleLine = (value: string): string => value.replace(/[\r\n]+/g, " ").trim();

/**
 * Известително писмо до администратора след успешно записано запитване от
 * контактната форма. Никога не хвърля грешка навън — вика `sendEmail`, която
 * сама си логва и поглъща проблемите. Извиква се само за `formSource: "contact"`.
 */
async function notifyContactEnquiry(input: {
  name: string;
  phone: string;
  email: string;
  message: string;
  pageUrl: string;
}): Promise<void> {
  const rows: [string, string][] = [
    ["Име", input.name],
    ["Телефон", input.phone],
    ["Имейл", input.email],
  ];
  if (input.message) rows.push(["Съобщение", input.message]);
  if (input.pageUrl) rows.push(["Страница", input.pageUrl]);

  const subject = `Ново запитване от ${singleLine(input.name)} — Fun Park Ezero`;

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#18181b;">
  <h2 style="margin:0 0 16px;">Ново запитване от контактната форма</h2>
  <table role="presentation" style="border-collapse:collapse;width:100%;max-width:560px;">
    ${rows
      .map(
        ([label, value]) => `
    <tr>
      <td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;white-space:pre-wrap;">${escapeHtml(value)}</td>
    </tr>`,
      )
      .join("")}
  </table>
</div>`.trim();

  const text = [
    "Ново запитване от контактната форма",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  await sendEmail({ subject, html, text, replyTo: input.email });
}

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

    // известително писмо — само за контактната форма, само след успешен запис.
    // Грешка тук никога не разваля резултата за посетителя: запитването вече
    // е записано, а проблемът с писмото се лог­ва отделно (виж sendEmail).
    if (input.formSource === "contact") {
      try {
        await notifyContactEnquiry({ name, phone, email, message, pageUrl });
      } catch (err) {
        console.error(
          "[enquiries] известителният имейл не можа да бъде изпратен:",
          err instanceof Error ? err.message : err,
        );
      }
    }

    return { ok: true };
  } catch (err) {
    console.error(
      "[enquiries] запитването не можа да бъде записано:",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: "server" };
  }
}
