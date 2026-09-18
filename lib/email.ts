import { Resend } from "resend";

/**
 * Изпращане на известителни имейли през Resend.
 *
 * Само за сървъра — не се внася от клиентски компоненти. Ключът `RESEND_API_KEY`
 * никога не излиза извън сървъра и никога не се лог­ва.
 */

/** Подателят е фиксиран — same за всички известителни писма от сайта. */
const FROM = "Fun Park Ezero <notifications@send.funparkezero.bg>";

let client: Resend | null = null;

/**
 * Ленива инициализация на клиента — ако ключът липсва в средата, връща null
 * вместо да гърми при зареждане на модула (важно за build и за dev без ключ).
 */
function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

/** Escape-ва потребителски текст, преди да влезе в HTML имейл. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type SendEmailResult = { ok: boolean };

/**
 * Изпраща едно писмо през Resend. Никога не хвърля грешка навън — при проблем
 * я логва подробно на сървъра (за диагностика) и връща `{ ok: false }`, без да
 * издава каквото и да е чувствително на извикващия код.
 */
export async function sendEmail(input: {
  subject: string;
  html: string;
  text: string;
  /** Имейлът на посетителя — за да може да се отговори директно. */
  replyTo?: string;
}): Promise<SendEmailResult> {
  const to = process.env.CONTACT_EMAIL?.trim();
  if (!to) {
    console.error(
      "[email] CONTACT_EMAIL липсва в средата — известителното писмо не е изпратено.",
    );
    return { ok: false };
  }

  const resend = getClient();
  if (!resend) {
    console.error(
      "[email] RESEND_API_KEY липсва в средата — известителното писмо не е изпратено.",
    );
    return { ok: false };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });

    if (error) {
      // точната грешка от Resend остава само в сървърния лог
      console.error("[email] Resend отказа изпращането:", error);
      return { ok: false };
    }

    return { ok: true };
  } catch (err) {
    console.error(
      "[email] неочаквана грешка при изпращане през Resend:",
      err instanceof Error ? err.message : err,
    );
    return { ok: false };
  }
}
