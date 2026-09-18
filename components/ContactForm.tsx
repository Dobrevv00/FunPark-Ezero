"use client";

import { useState } from "react";
import { isValidBgPhone, isValidEmail } from "@/lib/validation";
import { submitContactEnquiry } from "@/lib/actions/enquiries";
import { t } from "@/lib/cms";
import type { ContactsPage } from "@/payload-types";

const fields = [ // само за типа FieldKey — рендирането ползва CMS етикетите
  { key: "name", label: "Име", placeholder: "Вашето име", type: "text" },
  { key: "phone", label: "Телефон", placeholder: "+359 875 2365", type: "tel" },
  { key: "email", label: "Имейл", placeholder: "your@email.com", type: "email" },
] as const;

type FieldKey = (typeof fields)[number]["key"];

const labelGradient = {
  backgroundImage:
    "linear-gradient(179.62deg, rgb(129, 96, 63) 29.235%, rgb(27, 20, 13) 73.226%)",
};

export default function ContactForm({
  mobile,
  content,
}: {
  mobile: boolean;
  content?: ContactsPage["form"];
}) {
  // етикетите и подсказките идват от CMS; съобщенията за грешка остават в кода,
  // защото са част от валидацията на формата
  const labels = [
    {
      key: "name" as const,
      label: t(content?.nameLabel, "Име"),
      placeholder: t(content?.namePlaceholder, "Вашето име"),
      type: "text",
    },
    {
      key: "phone" as const,
      label: t(content?.phoneLabel, "Телефон"),
      placeholder: t(content?.phonePlaceholder, "+359 875 2365"),
      type: "tel",
    },
    {
      key: "email" as const,
      label: t(content?.emailLabel, "Имейл"),
      placeholder: t(content?.emailPlaceholder, "your@email.com"),
      type: "email",
    },
  ];
  const messageLabel = t(content?.messageLabel, "Съобщение");
  const messagePlaceholder = t(content?.messagePlaceholder, "Въпроси и коментари...");
  const submitLabel = t(content?.submitLabel, "Изпрати запитване");
  const successMessage = t(
    content?.successMessage,
    "Благодарим! Ще се свържем с вас възможно най-скоро.",
  );
  const errorMessage = t(
    content?.errorMessage,
    "Нещо се обърка при изпращането. Опитайте отново или ни се обадете.",
  );
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  // скрито поле за ботове — истинските посетители го оставят празно
  const [trap, setTrap] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const errorFor = (key: FieldKey): string => {
    const v = values[key];
    if (key === "phone" && v.trim() !== "" && !isValidBgPhone(v))
      return "Невалиден телефон (напр. +359 88 123 4567).";
    if (key === "email" && v.trim() !== "" && !isValidEmail(v))
      return "Невалиден имейл адрес.";
    return "";
  };

  const isValid =
    values.name.trim() !== "" &&
    isValidBgPhone(values.phone) &&
    isValidEmail(values.email);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFailed(false);
    // докато се изпраща, повторно натискане не прави нищо
    if (!isValid || sending) return;
    setSending(true);
    const res = await submitContactEnquiry({
      ...values,
      pageUrl: typeof window === "undefined" ? "" : window.location.pathname,
      honeypot: trap,
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
      setValues({ name: "", phone: "", email: "", message: "" });
      setSubmitted(false);
    } else {
      setFailed(true);
    }
  };

  // грешка се показва при въвеждане на невалидна стойност или след опит за изпращане
  const showError = (key: FieldKey) => {
    const base = errorFor(key);
    if (base) return base;
    if (submitted && values[key].trim() === "") return "Полето е задължително.";
    return "";
  };

  return (
    <form
      onSubmit={submit}
      className={
        mobile
          ? "mt-[56px] flex flex-col gap-[12px]"
          : "mt-[40px] flex flex-col gap-[23px] lg:absolute lg:left-[736px] lg:top-[82px] lg:mt-0 lg:w-[589px]"
      }
    >
      {labels.map((f) => {
        const err = showError(f.key);
        return (
          <div key={f.key} className="flex flex-col">
            <label
              className="mb-[8px] bg-clip-text text-[16.386px] leading-[1.3] tracking-[0.164px] text-transparent"
              style={labelGradient}
            >
              {f.label}
            </label>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={values[f.key]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.key]: e.target.value }))
              }
              className={`w-full rounded-[9.104px] bg-[rgba(161,161,170,0.15)] pl-[6px] pr-[12px] text-[16.386px] tracking-[0.164px] text-ink outline-none placeholder:text-black/30 ${
                mobile ? "h-[45px]" : "h-[41px]"
              } ${err ? "ring-2 ring-red-400" : ""}`}
            />
            {err && <p className="mt-[6px] text-[12.5px] text-red-600">{err}</p>}
          </div>
        );
      })}

      <div className="flex flex-col">
        <label
          className="mb-[8px] bg-clip-text text-[16.386px] leading-[1.3] tracking-[0.164px] text-transparent"
          style={labelGradient}
        >
          {messageLabel}
        </label>
        <textarea
          placeholder={messagePlaceholder}
          value={values.message}
          onChange={(e) =>
            setValues((v) => ({ ...v, message: e.target.value }))
          }
          className="h-[166.6px] w-full resize-none rounded-[9.104px] bg-[rgba(161,161,170,0.15)] px-[6px] py-[13px] text-[16.386px] tracking-[0.164px] text-ink outline-none placeholder:text-black/30"
        />
      </div>

      {/* Капан за ботове — скрит за хората и за екранните четци */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        className="pointer-events-none absolute -left-[9999px] size-0 opacity-0"
      />

      {sent && (
        <p className="rounded-[9px] bg-[rgba(106,142,78,0.15)] px-[14px] py-[10px] text-[14px] font-medium text-forest">
          {successMessage}
        </p>
      )}

      {failed && (
        <p className="rounded-[9px] bg-red-50 px-[14px] py-[10px] text-[14px] font-medium text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className={`flex items-center justify-center rounded-[10px] bg-sun px-[24px] py-[10px] text-[15px] font-semibold leading-[20px] text-black/80 ${
          sending ? "cursor-not-allowed opacity-60" : "fx-pop hover:bg-[#e0b32f]"
        } ${
          mobile
            ? "mt-[27px] h-[40px] w-full sm:w-[300px] sm:self-center"
            : "mt-[8px] w-[300px] max-w-full self-center"
        }`}
      >
        {sending ? "Изпращане…" : submitLabel}
      </button>
    </form>
  );
}
