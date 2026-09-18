"use client";

import { useEffect, useState } from "react";
import { isValidBgPhone, isValidEmail } from "@/lib/validation";
import { submitPackageEnquiry } from "@/lib/actions/enquiries";

export type EnquiryLabels = {
  title: string;
  intro: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  successMessage: string;
  errorMessage: string;
};

type Props = {
  packageId: number | string;
  packageTitle: string;
  ctaLabel: string;
  labels: EnquiryLabels;
};

const inputCls =
  "h-[44px] w-full rounded-[9px] bg-[rgba(161,161,170,0.15)] px-[12px] text-[15px] text-ink outline-none transition-shadow focus:ring-2 focus:ring-forest/40";

/** Бутон „Запитване“ + попъп с форма за конкретния пакет. */
export default function PackageEnquiryModal({
  packageId,
  packageTitle,
  ctaLabel,
  labels,
}: Props) {
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const errorFor = (key: "name" | "phone" | "email"): string => {
    const v = values[key];
    if (key === "phone" && v.trim() !== "" && !isValidBgPhone(v))
      return "Невалиден телефон (напр. +359 88 123 4567).";
    if (key === "email" && v.trim() !== "" && !isValidEmail(v))
      return "Невалиден имейл адрес.";
    if (submitted && v.trim() === "") return "Полето е задължително.";
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
    if (!isValid || sending) return;
    setSending(true);
    const res = await submitPackageEnquiry({
      packageId,
      packageTitle,
      ...values,
      pageUrl: typeof window === "undefined" ? "" : window.location.pathname,
      honeypot: trap,
    });
    setSending(false);
    if (res.ok) setSent(true);
    else setFailed(true);
  };

  const close = () => {
    setOpen(false);
    if (sent) {
      // след успешно изпращане формата се изчиства за следващо запитване
      setValues({ name: "", phone: "", email: "", message: "" });
      setSubmitted(false);
      setSent(false);
    }
  };

  const field = (
    key: "name" | "phone" | "email",
    label: string,
    placeholder: string,
    type: string,
  ) => {
    const err = errorFor(key);
    return (
      <div className="flex flex-col gap-[6px]">
        <label className="font-golos text-[14px] font-medium text-ink">
          {label}
        </label>
        <input
          type={type}
          value={values[key]}
          placeholder={placeholder}
          onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
          className={`${inputCls} ${err ? "ring-2 ring-red-400" : ""}`}
        />
        {err && <span className="text-[12.5px] text-red-600">{err}</span>}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fx-pop mt-[20px] flex w-full cursor-pointer items-center justify-center rounded-[10px] bg-sun px-[24px] py-[11px] font-golos text-[15px] font-semibold leading-[20px] text-black/80 hover:bg-[#e0b32f]"
      >
        {ctaLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-[16px]"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={labels.title}
            className="flex max-h-[calc(100vh-32px)] w-[520px] max-w-full flex-col overflow-y-auto rounded-[11px] bg-offwhite px-[24px] py-[28px] sm:px-[32px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-[12px]">
              <p className="font-golos text-[20px] font-bold text-ink">
                {labels.title}
              </p>
              <button
                type="button"
                aria-label="Затвори"
                onClick={close}
                className="fx-icon cursor-pointer font-golos text-[18px] leading-none text-[#a1a1aa] hover:text-ink"
              >
                ✕
              </button>
            </div>

            <p className="mt-[8px] font-golos text-[13.5px] leading-[1.5] text-[#545454]">
              {labels.intro}
            </p>
            <p className="mt-[12px] rounded-[9px] bg-[rgba(106,142,78,0.12)] px-[12px] py-[10px] font-golos text-[13px] font-semibold leading-[1.45] text-forest">
              {packageTitle}
            </p>

            {sent ? (
              <p className="mt-[18px] rounded-[9px] bg-[rgba(106,142,78,0.15)] px-[14px] py-[12px] font-golos text-[14px] font-medium text-forest">
                {labels.successMessage}
              </p>
            ) : (
              <form onSubmit={submit} className="mt-[18px] flex flex-col gap-[12px]">
                {field("name", labels.nameLabel, labels.namePlaceholder, "text")}
                {field("phone", labels.phoneLabel, labels.phonePlaceholder, "tel")}
                {field("email", labels.emailLabel, labels.emailPlaceholder, "email")}

                <div className="flex flex-col gap-[6px]">
                  <label className="font-golos text-[14px] font-medium text-ink">
                    {labels.messageLabel}
                  </label>
                  <textarea
                    value={values.message}
                    placeholder={labels.messagePlaceholder}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, message: e.target.value }))
                    }
                    className="h-[110px] w-full resize-none rounded-[9px] bg-[rgba(161,161,170,0.15)] px-[12px] py-[10px] text-[15px] text-ink outline-none transition-shadow focus:ring-2 focus:ring-forest/40"
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

                {failed && (
                  <p className="rounded-[9px] bg-red-50 px-[12px] py-[10px] text-[13.5px] font-medium text-red-600">
                    {labels.errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className={`mt-[6px] flex items-center justify-center rounded-[10px] bg-sun px-[24px] py-[11px] font-golos text-[15px] font-semibold leading-[20px] text-black/80 ${
                    sending
                      ? "cursor-not-allowed opacity-60"
                      : "fx-pop cursor-pointer hover:bg-[#e0b32f]"
                  }`}
                >
                  {sending ? "Изпращане…" : labels.submitLabel}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
