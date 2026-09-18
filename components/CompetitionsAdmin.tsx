"use client";

/**
 * Секция „Състезания“ в `/Funparkadminpanel` — отделно от календара.
 *
 *  · създаване: име, място, кръгове (дата или период „събота и неделя“),
 *    брой участници, такса, награди и бележки
 *  · правила и условия: раздели със заглавие, уводен текст и точки, плюс
 *    таблица с наказанията — всичко се показва на страница „Записване за
 *    състезания“
 *  · записани за квалификацията и отметки кой продължава на полуфинал и финал
 *  · редакция, скриване от сайта и изтриване
 *
 * Данните се пазят в Payload през сървърните действия в
 * `lib/actions/competitionsAdmin.ts`, които проверяват входа в панела.
 */

import { useCallback, useEffect, useState } from "react";
import {
  createCompetitionAdmin,
  deleteCompetitionAdmin,
  listCompetitionsAdmin,
  setCompetitionActiveAdmin,
  setQualifiersAdmin,
  updateCompetitionAdmin,
} from "@/lib/actions/competitionsAdmin";
// само типове — изчезват при компилация, сървърният код не стига до браузъра
import type { AdminResult, CompetitionInput } from "@/lib/competitionsAdmin";
import type { AdminCompetition } from "@/lib/competitionsShared";

const inputCls =
  "h-[34px] rounded-[8px] bg-[rgba(161,161,170,0.15)] px-[10px] text-[13px] text-ink outline-none focus:ring-2 focus:ring-forest/40";
const areaCls =
  "min-h-[70px] w-full resize-y rounded-[8px] bg-[rgba(161,161,170,0.15)] px-[10px] py-[8px] text-[13px] leading-[1.5] text-ink outline-none focus:ring-2 focus:ring-forest/40";
const labelCls = "flex flex-col gap-[4px] text-[12px] font-medium text-[#545454]";
const blockTitleCls =
  "mt-[18px] border-t border-[#eceae4] pt-[14px] text-[12px] font-bold uppercase tracking-[0.8px] text-[#a1a1aa]";
const btnPrimary =
  "h-[34px] cursor-pointer rounded-[10px] bg-sun px-[20px] text-[14px] font-semibold text-black/80 hover:bg-[#e0b32f] disabled:cursor-not-allowed disabled:opacity-60";
const btnGhost =
  "h-[30px] cursor-pointer rounded-[8px] border border-[#dddad2] px-[12px] text-[12px] font-semibold text-[#3f3f46] hover:border-forest hover:text-forest disabled:cursor-not-allowed disabled:opacity-60";
const sectionCls =
  "mb-[24px] rounded-[10px] bg-offwhite p-[16px] shadow-[0px_11.39px_34.17px_0px_rgba(0,0,0,0.07)] sm:p-[24px]";

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO → стойност за <input type="datetime-local"> (местно време) */
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** ISO → стойност за <input type="date"> */
const toDateInput = (iso: string | null) => toLocalInput(iso).slice(0, 10);

/** стойност от <input type="datetime-local"> или <input type="date"> → ISO */
const toIso = (local: string) => {
  if (!local) return "";
  const d = new Date(local.length === 10 ? `${local}T00:00` : local);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
};

const dateText = (iso: string | null, withTime: boolean) => {
  if (!iso) return "предстои";
  const d = new Date(iso);
  const day = `${d.getDate()}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  return withTime ? `${day} ${pad(d.getHours())}:${pad(d.getMinutes())}` : day;
};

/** „26.09.2026 – 27.09.2026“ или само началната дата */
const periodText = (from: string | null, to: string | null, withTime: boolean) =>
  to ? `${dateText(from, withTime)} – ${dateText(to, false)}` : dateText(from, withTime);

const errorText = (res: AdminResult<unknown>) => {
  if (res.ok) return "";
  if (res.error === "auth") return "Входът в панела е изтекъл — излезте и влезте отново.";
  if (res.error === "invalid") return res.message ?? "Проверете полетата.";
  return "Нещо се обърка при записа. Опитайте отново.";
};

const STATUS_LABEL: Record<string, string> = {
  new: "Ново",
  confirmed: "Потвърдено",
  waiting: "Изчаква",
  rejected: "Отказано",
};

/* ------------------------------------------------------------- форма */

type RuleRow = { title: string; intro: string; itemsText: string };
type PenaltyRow = { penalty: string; reason: string };

type FormValues = {
  title: string;
  description: string;
  location: string;
  qualificationDate: string;
  qualificationDateTo: string;
  semifinalDate: string;
  semifinalDateTo: string;
  finalDate: string;
  finalDateTo: string;
  timeUnknown: boolean;
  maxParticipants: string;
  feeEur: string;
  feeNote: string;
  registrationNote: string;
  prizeInfo: string;
  rules: RuleRow[];
  penalties: PenaltyRow[];
  rulesNote: string;
};

const emptyForm: FormValues = {
  title: "",
  description: "",
  location: "",
  qualificationDate: "",
  qualificationDateTo: "",
  semifinalDate: "",
  semifinalDateTo: "",
  finalDate: "",
  finalDateTo: "",
  timeUnknown: false,
  maxParticipants: "",
  feeEur: "",
  feeNote: "",
  registrationNote: "",
  prizeInfo: "",
  rules: [],
  penalties: [],
  rulesNote: "",
};

/** Данните на съществуващо състезание → стойности за формата */
const formFrom = (c: AdminCompetition): FormValues => ({
  title: c.title,
  description: c.description,
  location: c.location,
  qualificationDate: toLocalInput(c.qualificationDate),
  qualificationDateTo: toDateInput(c.qualificationDateTo),
  semifinalDate: toLocalInput(c.semifinalDate),
  semifinalDateTo: toDateInput(c.semifinalDateTo),
  finalDate: toLocalInput(c.finalDate),
  finalDateTo: toDateInput(c.finalDateTo),
  timeUnknown: c.timeUnknown,
  maxParticipants: c.maxParticipants === null ? "" : String(c.maxParticipants),
  feeEur: c.feeEur === null ? "" : String(c.feeEur),
  feeNote: c.feeNote,
  registrationNote: c.registrationNote,
  prizeInfo: c.prizeInfo,
  rules: c.rules.map((r) => ({
    title: r.title,
    intro: r.intro,
    itemsText: r.items.join("\n"),
  })),
  penalties: c.penalties.map((p) => ({ penalty: p.penalty, reason: p.reason })),
  rulesNote: c.rulesNote,
});

function CompetitionForm({
  idPrefix,
  initial,
  submitLabel,
  isNew,
  onSubmit,
  onCancel,
}: {
  idPrefix: string;
  initial: FormValues;
  submitLabel: string;
  isNew: boolean;
  onSubmit: (input: CompetitionInput) => Promise<string>;
  onCancel?: () => void;
}) {
  const [v, setV] = useState<FormValues>(initial);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  // минимумът за ново състезание — сега (изчислява се в браузъра)
  const [nowLocal, setNowLocal] = useState("");
  useEffect(() => setNowLocal(toLocalInput(new Date().toISOString())), []);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setV((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const setRule = (i: number, patch: Partial<RuleRow>) =>
    set(
      "rules",
      v.rules.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );
  const setPenalty = (i: number, patch: Partial<PenaltyRow>) =>
    set(
      "penalties",
      v.penalties.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (v.title.trim() === "") return setError("Въведете име на състезанието.");
    if (!v.qualificationDate) return setError("Изберете дата на квалификацията.");
    if (isNew && new Date(v.qualificationDate).getTime() < Date.now() - 60_000) {
      return setError("Квалификацията не може да е в минал ден или час.");
    }
    if (v.semifinalDate && v.semifinalDate < v.qualificationDate) {
      return setError("Полуфиналът трябва да е след квалификацията.");
    }
    if (v.finalDate && v.finalDate < (v.semifinalDate || v.qualificationDate)) {
      return setError(
        v.semifinalDate
          ? "Финалът трябва да е след полуфинала."
          : "Финалът трябва да е след квалификацията.",
      );
    }
    const pairs: [string, string, string][] = [
      ["квалификацията", v.qualificationDate, v.qualificationDateTo],
      ["полуфинала", v.semifinalDate, v.semifinalDateTo],
      ["финала", v.finalDate, v.finalDateTo],
    ];
    for (const [label, from, to] of pairs) {
      if (to && !from) return setError(`Първо задайте начална дата на ${label}.`);
      if (to && from && to < from.slice(0, 10)) {
        return setError(`Крайната дата на ${label} е преди началната.`);
      }
    }

    setSending(true);
    const message = await onSubmit({
      title: v.title,
      description: v.description,
      location: v.location,
      qualificationDate: toIso(v.qualificationDate),
      semifinalDate: toIso(v.semifinalDate),
      finalDate: toIso(v.finalDate),
      qualificationDateTo: toIso(v.qualificationDateTo),
      semifinalDateTo: toIso(v.semifinalDateTo),
      finalDateTo: toIso(v.finalDateTo),
      timeUnknown: v.timeUnknown,
      maxParticipants: v.maxParticipants,
      feeEur: v.feeEur,
      feeNote: v.feeNote,
      registrationNote: v.registrationNote,
      prizeInfo: v.prizeInfo,
      rules: v.rules.map((r) => ({
        title: r.title,
        intro: r.intro,
        items: r.itemsText.split("\n").map((l) => l.trim()).filter((l) => l !== ""),
      })),
      penalties: v.penalties,
      rulesNote: v.rulesNote,
    });
    setSending(false);
    if (message) setError(message);
    else if (isNew) setV(emptyForm);
  };

  const id = (name: string) => `${idPrefix}-${name}`;

  /** Един кръг: начална дата и час + „до дата“ */
  const stage = (
    key: "qualification" | "semifinal" | "final",
    label: string,
  ) => {
    const fromKey = `${key}Date` as
      | "qualificationDate"
      | "semifinalDate"
      | "finalDate";
    const toKey = `${key}DateTo` as
      | "qualificationDateTo"
      | "semifinalDateTo"
      | "finalDateTo";
    return (
      <div className="flex flex-wrap items-end gap-[10px] rounded-[8px] bg-white px-[12px] py-[10px]">
        <span className="w-full text-[12px] font-semibold text-ink">{label}</span>
        <label htmlFor={id(`${key}-from`)} className={labelCls}>
          {v.timeUnknown ? "Начална дата (час — скрит)" : "Начална дата и час"}
          <input
            id={id(`${key}-from`)}
            type="datetime-local"
            value={v[fromKey]}
            min={isNew ? nowLocal : undefined}
            onChange={(e) => set(fromKey, e.target.value)}
            className={`${inputCls} w-[210px]`}
          />
        </label>
        <label htmlFor={id(`${key}-to`)} className={labelCls}>
          <span>
            До дата <span className="font-normal text-[#a1a1aa]">(по избор)</span>
          </span>
          <input
            id={id(`${key}-to`)}
            type="date"
            value={v[toKey]}
            min={v[fromKey].slice(0, 10) || undefined}
            onChange={(e) => set(toKey, e.target.value)}
            className={`${inputCls} w-[160px]`}
          />
        </label>
        <span className="text-[12px] text-[#a1a1aa]">
          {periodText(
            toIso(v[fromKey]) || null,
            toIso(v[toKey]) || null,
            !v.timeUnknown,
          )}
        </span>
      </div>
    );
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-[12px]">
      {/* ---------- основно ---------- */}
      <div className="flex flex-wrap items-end gap-[10px]">
        <label htmlFor={id("title")} className={`${labelCls} w-full sm:w-auto`}>
          Име на състезанието
          <input
            id={id("title")}
            value={v.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={150}
            placeholder="напр. Скоростно преминаване на въжената градина"
            className={`${inputCls} w-full sm:w-[320px]`}
          />
        </label>
        <label htmlFor={id("location")} className={labelCls}>
          Място
          <input
            id={id("location")}
            value={v.location}
            onChange={(e) => set("location", e.target.value)}
            maxLength={150}
            placeholder="Парк „Езеро“, Бургас"
            className={`${inputCls} w-[220px]`}
          />
        </label>
      </div>
      <label htmlFor={id("desc")} className={labelCls}>
        <span>
          Кратко описание <span className="font-normal text-[#a1a1aa]">(по избор)</span>
        </span>
        <textarea
          id={id("desc")}
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={500}
          placeholder="Какво е състезанието — показва се под името на сайта."
          className={areaCls}
        />
      </label>

      {/* ---------- кръгове ---------- */}
      <p className={blockTitleCls}>Кръгове</p>
      <label className="flex cursor-pointer items-center gap-[8px] text-[12.5px] font-medium text-[#3f3f46]">
        <input
          type="checkbox"
          checked={v.timeUnknown}
          onChange={(e) => set("timeUnknown", e.target.checked)}
          className="size-[15px] cursor-pointer accent-[#17573b]"
        />
        Часовете още не са обявени — на сайта се показват само датите
      </label>
      {stage("qualification", "Квалификация (записването е за нея)")}
      {stage("semifinal", "Полуфинал")}
      {stage("final", "Финал")}

      {/* ---------- записване, такса, награди ---------- */}
      <p className={blockTitleCls}>Записване и такса</p>
      <div className="flex flex-wrap items-end gap-[10px]">
        <label htmlFor={id("max")} className={labelCls}>
          До колко човека
          <input
            id={id("max")}
            type="number"
            inputMode="numeric"
            min={1}
            max={10000}
            value={v.maxParticipants}
            onChange={(e) => set("maxParticipants", e.target.value)}
            placeholder="без ограничение"
            className={`${inputCls} w-[150px]`}
          />
        </label>
        <label htmlFor={id("fee")} className={labelCls}>
          Такса за участие (€)
          <input
            id={id("fee")}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={v.feeEur}
            onChange={(e) => set("feeEur", e.target.value)}
            placeholder="без такса"
            className={`${inputCls} w-[130px]`}
          />
        </label>
        <label htmlFor={id("feeNote")} className={`${labelCls} grow`}>
          Бележка към таксата
          <input
            id={id("feeNote")}
            value={v.feeNote}
            onChange={(e) => set("feeNote", e.target.value)}
            maxLength={200}
            placeholder="напр. Плаща се веднъж, при записването."
            className={`${inputCls} w-full`}
          />
        </label>
      </div>
      <label htmlFor={id("regNote")} className={labelCls}>
        Бележка за записването
        <textarea
          id={id("regNote")}
          value={v.registrationNote}
          onChange={(e) => set("registrationNote", e.target.value)}
          maxLength={600}
          placeholder="напр. Записването е само за квалификациите — полуфиналът и финалът се попълват по класиране."
          className={areaCls}
        />
      </label>
      <label htmlFor={id("prize")} className={labelCls}>
        Награди
        <textarea
          id={id("prize")}
          value={v.prizeInfo}
          onChange={(e) => set("prizeInfo", e.target.value)}
          maxLength={600}
          placeholder="Оставете празно, докато наградата не е решена."
          className={areaCls}
        />
      </label>

      {/* ---------- правила ---------- */}
      <p className={blockTitleCls}>Правила и условия</p>
      <p className="text-[12px] leading-[1.5] text-[#545454]">
        Всеки раздел се показва на сайта със заглавие, уводен текст и точки.
        Всеки нов ред в „Точки“ е отделна точка.
      </p>
      {v.rules.map((r, i) => (
        <div
          key={i}
          className="flex flex-col gap-[8px] rounded-[8px] bg-white px-[12px] py-[10px]"
        >
          <div className="flex flex-wrap items-end gap-[10px]">
            <label className={`${labelCls} grow`}>
              Заглавие на раздела
              <input
                value={r.title}
                onChange={(e) => setRule(i, { title: e.target.value })}
                maxLength={150}
                placeholder="напр. Условия за участие"
                className={`${inputCls} w-full`}
              />
            </label>
            <button
              type="button"
              onClick={() =>
                set(
                  "rules",
                  v.rules.filter((_, idx) => idx !== i),
                )
              }
              className={`${btnGhost} hover:border-red-400 hover:text-red-600`}
            >
              Премахни раздела
            </button>
          </div>
          <label className={labelCls}>
            <span>
              Уводен текст <span className="font-normal text-[#a1a1aa]">(по избор)</span>
            </span>
            <textarea
              value={r.intro}
              onChange={(e) => setRule(i, { intro: e.target.value })}
              maxLength={1000}
              className={areaCls}
            />
          </label>
          <label className={labelCls}>
            <span>
              Точки <span className="font-normal text-[#a1a1aa]">(по една на ред)</span>
            </span>
            <textarea
              value={r.itemsText}
              onChange={(e) => setRule(i, { itemsText: e.target.value })}
              placeholder={"да е предварително регистриран\nда премине инструктаж за безопасност"}
              className={`${areaCls} min-h-[100px]`}
            />
          </label>
        </div>
      ))}
      <div className="flex flex-wrap gap-[10px]">
        <button
          type="button"
          onClick={() =>
            set("rules", [...v.rules, { title: "", intro: "", itemsText: "" }])
          }
          className={btnGhost}
        >
          + Добави раздел
        </button>
      </div>

      {/* ---------- наказания ---------- */}
      <p className="mt-[8px] text-[12px] font-semibold text-ink">
        Наказания (таблица на сайта)
      </p>
      {v.penalties.map((p, i) => (
        <div
          key={i}
          className="flex flex-wrap items-end gap-[10px] rounded-[8px] bg-white px-[12px] py-[10px]"
        >
          <label className={labelCls}>
            Наказание
            <input
              value={p.penalty}
              onChange={(e) => setPenalty(i, { penalty: e.target.value })}
              maxLength={60}
              placeholder="+5 секунди"
              className={`${inputCls} w-[150px]`}
            />
          </label>
          <label className={`${labelCls} grow`}>
            За какво
            <input
              value={p.reason}
              onChange={(e) => setPenalty(i, { reason: e.target.value })}
              maxLength={400}
              placeholder="докосване на земята, когато не е разрешено"
              className={`${inputCls} w-full`}
            />
          </label>
          <button
            type="button"
            onClick={() =>
              set(
                "penalties",
                v.penalties.filter((_, idx) => idx !== i),
              )
            }
            className={`${btnGhost} hover:border-red-400 hover:text-red-600`}
          >
            Премахни
          </button>
        </div>
      ))}
      <div className="flex flex-wrap gap-[10px]">
        <button
          type="button"
          onClick={() =>
            set("penalties", [...v.penalties, { penalty: "", reason: "" }])
          }
          className={btnGhost}
        >
          + Добави наказание
        </button>
      </div>
      <label htmlFor={id("rulesNote")} className={labelCls}>
        Бележка под правилата
        <textarea
          id={id("rulesNote")}
          value={v.rulesNote}
          onChange={(e) => set("rulesNote", e.target.value)}
          maxLength={600}
          placeholder="напр. Конкретните наказания се обявяват преди началото и важат еднакво за всички."
          className={areaCls}
        />
      </label>

      <div className="mt-[8px] flex flex-wrap items-center gap-[10px]">
        <button type="submit" disabled={sending} className={btnPrimary}>
          {sending ? "Записване…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={btnGhost}>
            Отказ
          </button>
        )}
        {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}
      </div>
    </form>
  );
}

/* --------------------------------------------------- едно състезание */

function CompetitionCard({
  c,
  onChanged,
}: {
  c: AdminCompetition;
  onChanged: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [semi, setSemi] = useState<number[]>(c.semifinalists);
  const [fin, setFin] = useState<number[]>(c.finalists);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [askDelete, setAskDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  // след презареждане от сървъра — поемаме записаните отметки, но само ако
  // наистина са се променили (иначе незаписаните отметки в другите карти остават)
  const semiKey = c.semifinalists.join(",");
  const finKey = c.finalists.join(",");
  useEffect(() => {
    setSemi(semiKey ? semiKey.split(",").map(Number) : []);
    setFin(finKey ? finKey.split(",").map(Number) : []);
  }, [semiKey, finKey]);

  const same = (a: number[], b: number[]) =>
    a.length === b.length && a.every((x) => b.includes(x));
  const dirty = !same(semi, c.semifinalists) || !same(fin, c.finalists);

  const active = c.registrations.filter((r) => r.status !== "rejected").length;
  const full = c.maxParticipants !== null && active >= c.maxParticipants;
  const withTime = !c.timeUnknown;
  const rulesCount = c.rules.length;

  const toggleSemi = (id: number, on: boolean) => {
    setMessage(null);
    setSemi((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)));
    // извън полуфинала → и извън финала
    if (!on) setFin((prev) => prev.filter((x) => x !== id));
  };
  const toggleFin = (id: number, on: boolean) => {
    setMessage(null);
    setFin((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const saveQualifiers = async () => {
    setSaving(true);
    const res = await setQualifiersAdmin(c.id, semi, fin);
    setSaving(false);
    if (res.ok) {
      setMessage({ text: "Класираните са записани и излизат на сайта.", ok: true });
      await onChanged();
    } else {
      setMessage({ text: errorText(res), ok: false });
    }
  };

  const toggleActive = async () => {
    setBusy(true);
    const res = await setCompetitionActiveAdmin(c.id, !c.active);
    setBusy(false);
    if (!res.ok) setMessage({ text: errorText(res), ok: false });
    else await onChanged();
  };

  const remove = async () => {
    setBusy(true);
    const res = await deleteCompetitionAdmin(c.id);
    setBusy(false);
    setAskDelete(false);
    if (!res.ok) setMessage({ text: errorText(res), ok: false });
    else await onChanged();
  };

  return (
    <article className="rounded-[10px] bg-white p-[14px] sm:p-[18px]">
      {editing ? (
        <>
          <h3 className="mb-[12px] font-golos text-[16px] font-bold text-ink">
            Редакция на „{c.title}“
          </h3>
          <CompetitionForm
            idPrefix={`competition-edit-${c.id}`}
            isNew={false}
            submitLabel="Запази промените"
            initial={formFrom(c)}
            onCancel={() => setEditing(false)}
            onSubmit={async (input) => {
              const res = await updateCompetitionAdmin(c.id, input);
              if (!res.ok) return errorText(res);
              // първо новите данни, после затваряне — да не мигнат старите
              await onChanged();
              setEditing(false);
              return "";
            }}
          />
        </>
      ) : (
        <div className="flex flex-col gap-[12px] lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-[8px]">
              <h3 className="font-golos text-[17px] font-bold text-ink">{c.title}</h3>
              <span
                className={`rounded-full px-[9px] py-[2px] text-[11px] font-semibold ${
                  c.active
                    ? "bg-[rgba(106,142,78,0.16)] text-forest"
                    : "bg-[#ececec] text-[#71717a]"
                }`}
              >
                {c.active ? "Показва се на сайта" : "Скрито от сайта"}
              </span>
              {full && (
                <span className="rounded-full bg-[rgba(244,198,63,0.3)] px-[9px] py-[2px] text-[11px] font-semibold text-ink">
                  Запълнено
                </span>
              )}
              {c.timeUnknown && (
                <span className="rounded-full bg-[#ececec] px-[9px] py-[2px] text-[11px] font-semibold text-[#71717a]">
                  Часовете не са обявени
                </span>
              )}
            </div>
            {c.description && (
              <p className="mt-[4px] text-[13px] text-[#545454]">{c.description}</p>
            )}
            <dl className="mt-[8px] flex flex-wrap gap-x-[18px] gap-y-[4px] text-[12.5px] text-[#3f3f46]">
              <div>
                <dt className="inline font-medium text-[#71717a]">Квалификация: </dt>
                <dd className="inline font-semibold">
                  {periodText(c.qualificationDate, c.qualificationDateTo, withTime)}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-[#71717a]">Полуфинал: </dt>
                <dd className="inline font-semibold">
                  {periodText(c.semifinalDate, c.semifinalDateTo, withTime)}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-[#71717a]">Финал: </dt>
                <dd className="inline font-semibold">
                  {periodText(c.finalDate, c.finalDateTo, withTime)}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-[#71717a]">Записани: </dt>
                <dd className="inline font-semibold">
                  {c.maxParticipants === null
                    ? `${active} (без ограничение)`
                    : `${active} / ${c.maxParticipants}`}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-[#71717a]">Такса: </dt>
                <dd className="inline font-semibold">
                  {c.feeEur === null ? "без такса" : `${c.feeEur} €`}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-[#71717a]">Правила: </dt>
                <dd className="inline font-semibold">
                  {rulesCount === 0
                    ? "няма"
                    : `${rulesCount} ${rulesCount === 1 ? "раздел" : "раздела"}`}
                  {c.penalties.length > 0 && ` · ${c.penalties.length} наказания`}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex shrink-0 flex-wrap gap-[8px]">
            <button type="button" onClick={() => setEditing(true)} className={btnGhost}>
              Редактирай
            </button>
            <button type="button" onClick={toggleActive} disabled={busy} className={btnGhost}>
              {c.active ? "Скрий от сайта" : "Покажи на сайта"}
            </button>
            <button
              type="button"
              onClick={() => setAskDelete(true)}
              disabled={busy}
              className={`${btnGhost} hover:border-red-400 hover:text-red-600`}
            >
              Изтрий
            </button>
          </div>
        </div>
      )}

      {/* Записани за квалификацията и класирани */}
      <div className="mt-[14px] border-t border-[#eceae4] pt-[12px]">
        <p className="text-[13px] font-semibold text-ink">
          Записани за квалификацията и класирани
        </p>
        {c.registrations.length === 0 ? (
          <p className="mt-[6px] text-[12.5px] text-[#71717a]">Все още няма записани.</p>
        ) : (
          <>
            <div className="mt-[8px] overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse text-left text-[12.5px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.4px] text-[#71717a]">
                    <th className="py-[6px] pr-[10px] font-semibold">Участник</th>
                    <th className="py-[6px] pr-[10px] font-semibold">Контакт</th>
                    <th className="py-[6px] pr-[10px] font-semibold">Статус</th>
                    <th className="py-[6px] pr-[10px] text-center font-semibold">Полуфинал</th>
                    <th className="py-[6px] text-center font-semibold">Финал</th>
                  </tr>
                </thead>
                <tbody>
                  {c.registrations.map((r) => {
                    const inSemi = semi.includes(r.id);
                    const inFin = fin.includes(r.id);
                    return (
                      <tr
                        key={r.id}
                        className={`border-t border-[#f0eee8] align-top ${
                          r.status === "rejected" ? "text-[#a1a1aa]" : "text-ink"
                        }`}
                      >
                        <td className="py-[8px] pr-[10px]">
                          <span className="block font-semibold">{r.name}</span>
                          <span className="block text-[11.5px] text-[#71717a]">
                            {r.age} г.
                            {r.guardianName && ` · родител: ${r.guardianName}`}
                          </span>
                          {r.note && (
                            <span className="mt-[2px] block max-w-[260px] text-[11.5px] italic text-[#71717a]">
                              „{r.note}“
                            </span>
                          )}
                        </td>
                        <td className="py-[8px] pr-[10px]">
                          <a href={`tel:${r.phone}`} className="block hover:text-forest">
                            {r.phone}
                          </a>
                          <a
                            href={`mailto:${r.email}`}
                            className="block break-all text-[11.5px] text-[#545454] hover:text-forest"
                          >
                            {r.email}
                          </a>
                        </td>
                        <td className="py-[8px] pr-[10px] text-[11.5px]">
                          {STATUS_LABEL[r.status] ?? r.status}
                        </td>
                        <td className="py-[8px] pr-[10px] text-center">
                          <input
                            type="checkbox"
                            aria-label={`${r.name} продължава на полуфинал`}
                            checked={inSemi}
                            onChange={(e) => toggleSemi(r.id, e.target.checked)}
                            className="size-[16px] cursor-pointer accent-[#17573b]"
                          />
                        </td>
                        <td className="py-[8px] text-center">
                          <input
                            type="checkbox"
                            aria-label={`${r.name} продължава на финал`}
                            checked={inFin}
                            disabled={!inSemi}
                            title={inSemi ? undefined : "Първо отбележете за полуфинал"}
                            onChange={(e) => toggleFin(r.id, e.target.checked)}
                            className="size-[16px] cursor-pointer accent-[#17573b] disabled:cursor-not-allowed disabled:opacity-40"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-[10px] flex flex-wrap items-center gap-[10px]">
              <button
                type="button"
                onClick={saveQualifiers}
                disabled={!dirty || saving}
                className={btnPrimary}
              >
                {saving ? "Записване…" : "Запази класираните"}
              </button>
              <span className="text-[12px] text-[#71717a]">
                Полуфинал: {semi.length} · Финал: {fin.length} · На сайта се показват
                собственото име и първата буква на фамилията.
              </span>
            </div>
          </>
        )}
        {message && (
          <p
            className={`mt-[8px] text-[13px] font-semibold ${
              message.ok ? "text-forest" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {askDelete && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-[16px]"
          onClick={() => setAskDelete(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-[420px] max-w-full rounded-[11px] bg-offwhite p-[24px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-golos text-[18px] font-bold text-ink">
              Да изтрия ли „{c.title}“?
            </h3>
            <p className="mt-[8px] text-[13px] leading-[1.6] text-[#545454]">
              Състезанието изчезва от сайта заедно с правилата и класирането.
              {c.registrations.length > 0 &&
                ` Записванията (${c.registrations.length}) остават в Payload Admin → „Записвания за квалификация“.`}{" "}
              Ако искате само да го скриете временно, използвайте „Скрий от сайта“.
            </p>
            <div className="mt-[20px] flex justify-end gap-[10px]">
              <button type="button" onClick={() => setAskDelete(false)} className={btnGhost}>
                Отказ
              </button>
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="h-[30px] cursor-pointer rounded-[8px] bg-red-600 px-[14px] text-[12px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                Изтрий
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

/* ------------------------------------------------------------ секция */

export default function CompetitionsAdmin() {
  const [list, setList] = useState<AdminCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [created, setCreated] = useState("");
  const [openNew, setOpenNew] = useState(false);

  const load = useCallback(async () => {
    const res = await listCompetitionsAdmin();
    if (res.ok) {
      setList(res.data);
      setLoadError("");
    } else {
      setLoadError(errorText(res));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section id="competitions" className={sectionCls}>
      <h2 className="font-golos text-[20px] font-bold text-ink">Състезания</h2>
      <p className="mt-[4px] text-[13px] text-[#545454]">
        Отделно от календара. Създаденото състезание излиза на страница
        „Записване за състезания“ и във формата за записване на страница
        „Събития“ — с датите на кръговете, таксата и правилата. Под всяко
        състезание отбележете кой продължава на полуфинал и финал.
      </p>

      <div className="mt-[16px] rounded-[10px] bg-white p-[14px] sm:p-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <h3 className="font-golos text-[16px] font-bold text-ink">Ново състезание</h3>
          <button
            type="button"
            onClick={() => setOpenNew((o) => !o)}
            className={btnGhost}
          >
            {openNew ? "Скрий формата" : "Отвори формата"}
          </button>
        </div>
        {openNew && (
          <div className="mt-[12px]">
            <CompetitionForm
              idPrefix="competition-new"
              isNew
              initial={emptyForm}
              submitLabel="Създай състезание"
              onSubmit={async (input) => {
                setCreated("");
                const res = await createCompetitionAdmin(input);
                if (!res.ok) return errorText(res);
                setCreated(`„${input.title.trim()}“ е създадено и излиза на сайта.`);
                await load();
                return "";
              }}
            />
          </div>
        )}
        {created && (
          <p className="mt-[10px] text-[13px] font-semibold text-forest">{created}</p>
        )}
      </div>

      <div className="mt-[18px] flex flex-col gap-[12px]">
        {loading ? (
          <p className="text-[13px] text-[#545454]">Зареждане на състезанията…</p>
        ) : loadError ? (
          <p className="rounded-[8px] bg-red-50 px-[12px] py-[10px] text-[13px] font-medium text-red-600">
            {loadError}
          </p>
        ) : list.length === 0 ? (
          <p className="rounded-[8px] bg-[rgba(244,198,63,0.18)] px-[12px] py-[10px] text-[13px] font-medium text-ink">
            Все още няма създадени състезания.
          </p>
        ) : (
          list.map((c) => <CompetitionCard key={c.id} c={c} onChanged={load} />)
        )}
      </div>
    </section>
  );
}
