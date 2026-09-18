"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitCompetitionRegistration } from "@/lib/actions/competitions";
import {
  ADULT_AGE,
  AGE_LIMITS,
  type PublicCompetition,
} from "@/lib/competitionsShared";
import { isValidBgPhone, isValidEmail } from "@/lib/validation";

const inputCls =
  "h-[44px] w-full rounded-[9px] bg-[rgba(161,161,170,0.15)] px-[12px] font-golos text-[15px] text-ink outline-none transition-shadow placeholder:text-black/30 focus:ring-2 focus:ring-forest/40";
const labelCls = "font-golos text-[14px] font-medium text-ink";
const linkCls =
  "fx-ink font-semibold text-forest underline decoration-forest/35 underline-offset-[3px] hover:decoration-forest";

type Values = {
  name: string;
  age: string;
  phone: string;
  email: string;
  guardianName: string;
  note: string;
};

const emptyValues: Values = {
  name: "",
  age: "",
  phone: "",
  email: "",
  guardianName: "",
  note: "",
};

/**
 * Форма за записване за квалификацията на едно конкретно състезание.
 * `idPrefix` държи етикетите уникални, когато на страницата има няколко форми.
 * `closed` — местата са запълнени: вместо полетата се показва съобщение
 * (потвърждението след успешно записване остава видимо).
 */
export default function CompetitionRegistrationForm({
  idPrefix,
  competition,
  closed = false,
}: {
  idPrefix: string;
  competition: PublicCompetition;
  closed?: boolean;
}) {
  const [values, setValues] = useState<Values>(emptyValues);
  const [consent, setConsent] = useState(false);
  // скрито поле за ботове — истинските посетители го оставят празно
  const [trap, setTrap] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  // името към момента на изпращане — формата може да смени състезанието след това
  const [sentTitle, setSentTitle] = useState("");
  // "full" = местата се запълниха, докато формата е била отворена
  const [failed, setFailed] = useState<false | "full" | "error">(false);
  const router = useRouter();

  const id = (name: string) => `${idPrefix}-${name}`;
  const set = (key: keyof Values, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setFailed(false);
  };

  const ageNum = Number(values.age);
  const ageValid =
    values.age.trim() !== "" &&
    Number.isInteger(ageNum) &&
    ageNum >= AGE_LIMITS.min &&
    ageNum <= AGE_LIMITS.max;
  const isMinor = ageValid && ageNum < ADULT_AGE;

  const errors: Partial<Record<keyof Values | "consent", string>> = {};
  if (submitted && values.name.trim() === "") errors.name = "Полето е задължително.";
  if (values.age.trim() !== "" && !ageValid)
    errors.age = `Възрастта трябва да е между ${AGE_LIMITS.min} и ${AGE_LIMITS.max} години.`;
  else if (submitted && values.age.trim() === "") errors.age = "Полето е задължително.";
  if (values.phone.trim() !== "" && !isValidBgPhone(values.phone))
    errors.phone = "Невалиден телефон (напр. +359 88 123 4567).";
  else if (submitted && values.phone.trim() === "") errors.phone = "Полето е задължително.";
  if (values.email.trim() !== "" && !isValidEmail(values.email))
    errors.email = "Невалиден имейл адрес.";
  else if (submitted && values.email.trim() === "") errors.email = "Полето е задължително.";
  if (submitted && isMinor && values.guardianName.trim() === "")
    errors.guardianName = "За участници под 18 години е нужен родител или настойник.";
  if (submitted && !consent) errors.consent = "Нужно е съгласие, за да се запишете.";

  const isValid =
    values.name.trim() !== "" &&
    ageValid &&
    isValidBgPhone(values.phone) &&
    isValidEmail(values.email) &&
    (!isMinor || values.guardianName.trim() !== "") &&
    consent;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFailed(false);
    if (!isValid || sending) return;
    setSending(true);
    const res = await submitCompetitionRegistration({
      competitionId: competition.id,
      name: values.name,
      age: ageNum,
      phone: values.phone,
      email: values.email,
      guardianName: isMinor ? values.guardianName : "",
      note: values.note,
      consent,
      pageUrl: typeof window === "undefined" ? "" : window.location.pathname,
      honeypot: trap,
    });
    setSending(false);
    if (res.ok) {
      setSentTitle(competition.title);
      setSent(true);
      setValues(emptyValues);
      setConsent(false);
      setSubmitted(false);
      // обновява броя свободни места в картата
      router.refresh();
    } else {
      setFailed(res.error === "full" ? "full" : "error");
      if (res.error === "full") router.refresh();
    }
  };

  const field = (
    key: keyof Values,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={id(key)} className={labelCls}>
        {label}
      </label>
      <input
        id={id(key)}
        value={values[key]}
        onChange={(e) => set(key, e.target.value)}
        className={`${inputCls} ${errors[key] ? "ring-2 ring-red-400" : ""}`}
        {...props}
      />
      {errors[key] && (
        <span className="font-golos text-[12.5px] text-red-600">{errors[key]}</span>
      )}
    </div>
  );

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-[14px] rounded-[10px] bg-[rgba(106,142,78,0.12)] px-[20px] py-[28px] text-center">
        <img src="/icons/check-circle.svg" alt="" className="size-[56px]" />
        <p className="font-golos text-[18px] font-bold text-ink">
          Записването е изпратено
        </p>
        <p className="max-w-[440px] font-golos text-[14.5px] leading-[1.55] text-[#3f3f46]">
          Благодарим! Получихме записването ви за квалификацията на „
          {sentTitle || competition.title}“. Ще се свържем с вас за потвърждение и
          подробности.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="fx-outline cursor-pointer rounded-[10px] border border-forest px-[22px] py-[10px] font-golos text-[14px] font-semibold text-forest"
        >
          Ново записване
        </button>
      </div>
    );
  }

  if (closed) {
    return (
      <div className="flex flex-col items-center gap-[8px] rounded-[10px] bg-[rgba(244,198,63,0.18)] px-[20px] py-[28px] text-center">
        <p className="font-golos text-[17px] font-bold text-ink">Местата са запълнени</p>
        <p className="max-w-[420px] font-golos text-[14px] leading-[1.55] text-[#3f3f46]">
          Записването за „{competition.title}“ е затворено. Изберете друго
          състезание или се свържете с нас.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
        {field("name", "Име и фамилия", {
          type: "text",
          placeholder: "Вашето име",
          autoComplete: "name",
          maxLength: 100,
        })}
        {field("age", "Възраст", {
          type: "number",
          inputMode: "numeric",
          min: AGE_LIMITS.min,
          max: AGE_LIMITS.max,
          placeholder: "напр. 12",
        })}
        {field("phone", "Телефон", {
          type: "tel",
          placeholder: "+359 88 123 4567",
          autoComplete: "tel",
          maxLength: 40,
        })}
        {field("email", "Имейл", {
          type: "email",
          placeholder: "your@email.com",
          autoComplete: "email",
          maxLength: 100,
        })}

        {isMinor && (
          <div className="sm:col-span-2">
            {field("guardianName", "Родител / настойник (за участници под 18 г.)", {
              type: "text",
              placeholder: "Име и фамилия на родителя",
              maxLength: 100,
            })}
          </div>
        )}

        <div className="flex flex-col gap-[6px] sm:col-span-2">
          <label htmlFor={id("note")} className={labelCls}>
            Бележка <span className="font-normal text-[#a1a1aa]">(по избор)</span>
          </label>
          <textarea
            id={id("note")}
            value={values.note}
            onChange={(e) => set("note", e.target.value)}
            maxLength={1000}
            placeholder="Въпроси или допълнителна информация..."
            className="h-[96px] w-full resize-none rounded-[9px] bg-[rgba(161,161,170,0.15)] px-[12px] py-[10px] font-golos text-[15px] text-ink outline-none transition-shadow placeholder:text-black/30 focus:ring-2 focus:ring-forest/40"
          />
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <label className="flex cursor-pointer items-start gap-[10px] font-golos text-[13.5px] leading-[1.5] text-[#3f3f46]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setFailed(false);
            }}
            className="mt-[3px] size-[16px] shrink-0 cursor-pointer accent-[#17573b]"
          />
          <span>
            Съгласен/на съм с{" "}
            {/* правилата на състезанието са на същата страница */}
            {competition.rules.length > 0 && (
              <>
                <a href="/competitions#rules" className={linkCls}>
                  правилата на състезанието
                </a>
                ,{" "}
              </>
            )}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className={linkCls}>
              Общите условия
            </a>{" "}
            и{" "}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className={linkCls}
            >
              Политиката за поверителност
            </a>
            .
          </span>
        </label>
        {errors.consent && (
          <span className="font-golos text-[12.5px] text-red-600">{errors.consent}</span>
        )}
        <p className="pl-[26px] font-golos text-[12.5px] leading-[1.5] text-[#71717a]">
          При класиране за полуфинал или финал собственото име и първата буква на
          фамилията на участника се публикуват в класирането на сайта. Телефонът,
          имейлът и възрастта не се публикуват.
        </p>
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
        <p className="rounded-[9px] bg-red-50 px-[14px] py-[10px] font-golos text-[14px] font-medium text-red-600">
          {failed === "full"
            ? "Съжаляваме — местата за това състезание току-що се запълниха."
            : "Нещо се обърка при изпращането. Опитайте отново или ни се обадете."}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className={`flex w-full items-center justify-center rounded-[10px] bg-sun px-[24px] py-[12px] font-golos text-[15px] font-semibold leading-[20px] text-black/80 sm:w-auto sm:self-start ${
          sending ? "cursor-not-allowed opacity-60" : "fx-pop cursor-pointer hover:bg-[#e0b32f]"
        }`}
      >
        {sending ? "Изпращане…" : "Запиши се за квалификацията"}
      </button>
    </form>
  );
}
