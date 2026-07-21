"use client";

import { useState } from "react";
import { isValidBgPhone, isValidEmail } from "@/lib/validation";

const fields = [
  { key: "name", label: "Име", placeholder: "Вашето име", type: "text" },
  { key: "phone", label: "Телефон", placeholder: "+359 875 2365", type: "tel" },
  { key: "email", label: "Имейл", placeholder: "your@email.com", type: "email" },
] as const;

type FieldKey = (typeof fields)[number]["key"];

const labelGradient = {
  backgroundImage:
    "linear-gradient(179.62deg, rgb(129, 96, 63) 29.235%, rgb(27, 20, 13) 73.226%)",
};

export default function ContactForm({ mobile }: { mobile: boolean }) {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (isValid) setSent(true);
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
      {fields.map((f) => {
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
          Съобщение
        </label>
        <textarea
          placeholder="Въпроси и коментари..."
          value={values.message}
          onChange={(e) =>
            setValues((v) => ({ ...v, message: e.target.value }))
          }
          className="h-[166.6px] w-full resize-none rounded-[9.104px] bg-[rgba(161,161,170,0.15)] px-[6px] py-[13px] text-[16.386px] tracking-[0.164px] text-ink outline-none placeholder:text-black/30"
        />
      </div>

      {sent && (
        <p className="rounded-[9px] bg-[rgba(106,142,78,0.15)] px-[14px] py-[10px] text-[14px] font-medium text-forest">
          Благодарим! Ще се свържем с вас възможно най-скоро.
        </p>
      )}

      <button
        type="submit"
        className={`flex items-center justify-center rounded-[10px] bg-sun px-[24px] py-[10px] text-[15px] font-semibold leading-[20px] text-black/80 transition-colors hover:bg-[#e0b32f] ${
          mobile
            ? "mt-[27px] h-[40px] w-full"
            : "mt-[8px] w-[300px] max-w-full self-center"
        }`}
      >
        Изпрати запитване
      </button>
    </form>
  );
}
